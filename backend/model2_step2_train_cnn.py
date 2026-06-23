"""
THERMACITY — Model 2, Step 2: CNN Hotspot Classifier
======================================================
Trains a lightweight CNN (ThermaNet) to classify 64×64
thermal image tiles into 4 heat classes.

ARCHITECTURE — ThermaNet:
  Why NOT ResNet/VGG off-the-shelf?
  ─ Those are designed for RGB photos (cats, cars, ImageNet)
  ─ Thermal tiles are single-domain, low-texture images
  ─ A small custom CNN trains faster, explains better, and 
    avoids overfitting on our limited synthetic dataset
  ─ We add a Spatial Attention module — forces the model to
    learn WHERE the hottest pixels are, not just average temp.
    This is the key differentiator vs a simple classifier.

ARCHITECTURE DIAGRAM:
  Input (3×64×64)
      ↓
  ConvBlock1: 3→32 ch, 3×3, BN, ReLU → MaxPool → 32×32×32
      ↓
  ConvBlock2: 32→64 ch, 3×3, BN, ReLU → MaxPool → 64×16×16
      ↓
  SpatialAttention (16×16 attention map — learns WHERE to look)
      ↓
  ConvBlock3: 64→128 ch, 3×3, BN, ReLU → MaxPool → 128×8×8
      ↓
  ConvBlock4: 128→256 ch, 3×3, BN, ReLU → AdaptiveAvgPool → 256×1×1
      ↓
  Classifier: Linear(256→128) → Dropout(0.4) → Linear(128→4)
      ↓
  Output: 4 class probabilities [COOL, MODERATE, HOT, CRITICAL]

OUTPUT:
  models/thermanet.pth           — trained weights
  models/thermanet_config.json   — architecture config
  outputs/training_curves.png    — loss + accuracy plots
  outputs/confusion_matrix.png   — per-class accuracy
  outputs/class_report.json      — precision, recall, F1
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torch.optim.lr_scheduler import CosineAnnealingLR
import numpy as np
import json
import os
import time
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from pathlib import Path
from sklearn.metrics import (classification_report, confusion_matrix,
                             accuracy_score)

os.makedirs("models",  exist_ok=True)
os.makedirs("outputs", exist_ok=True)

DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TILE_SIZE  = 64
N_CLASSES  = 4
BATCH_SIZE = 64
EPOCHS     = 40
LR         = 1e-3
NUM_WORKERS = 0     # set to 4 for production

CLASS_NAMES  = ["COOL", "MODERATE", "HOT", "CRITICAL"]
CLASS_COLORS = ["#1A4FA0", "#0EA882", "#FF6B35", "#FF4E1A"]

print(f"Device: {DEVICE}")


# ─────────────────────────────────────────────
# DATASET
# ─────────────────────────────────────────────
class ThermalTileDataset(Dataset):
    """
    Loads .npy tile files from the directory tree:
      data/tiles/{split}/{class_name}/*.npy

    Each .npy file is a (3, 64, 64) float32 array.
    """
    def __init__(self, split="train", augment=False):
        self.augment = augment
        self.samples = []    # list of (filepath, class_id)

        tile_dir = Path("data/tiles") / split
        class_dirs = {
            "cool":     0,
            "moderate": 1,
            "hot":      2,
            "critical": 3,
        }

        for cls_name, cls_id in class_dirs.items():
            cls_dir = tile_dir / cls_name
            if not cls_dir.exists():
                raise FileNotFoundError(
                    f"Tile directory not found: {cls_dir}\n"
                    "Run model2_step1_generate_tiles.py first."
                )
            files = sorted(cls_dir.glob("*.npy"))
            for f in files:
                self.samples.append((str(f), cls_id))

        if len(self.samples) == 0:
            raise ValueError(f"No tiles found in data/tiles/{split}/")

        # Class weights for handling imbalance (uniform here, but useful for real data)
        counts = [sum(1 for _, c in self.samples if c == i) for i in range(N_CLASSES)]
        total  = len(self.samples)
        self.class_weights = torch.FloatTensor([total / (N_CLASSES * c) for c in counts])

        print(f"  {split} dataset: {len(self.samples)} tiles | "
              f"class counts: {counts}")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        filepath, label = self.samples[idx]
        tile = torch.from_numpy(np.load(filepath))   # (3, 64, 64)

        if self.augment:
            tile = self._augment(tile)

        return tile, label

    def _augment(self, tile):
        """
        Thermal-appropriate augmentations.
        NOTE: No color jitter (temperature values must be preserved).
              No normalization beyond what we already did.
              Only geometry augmentations are safe.
        """
        # Random horizontal flip
        if torch.rand(1) > 0.5:
            tile = torch.flip(tile, dims=[2])

        # Random vertical flip
        if torch.rand(1) > 0.5:
            tile = torch.flip(tile, dims=[1])

        # Random 90° rotation
        k = torch.randint(0, 4, (1,)).item()
        if k > 0:
            tile = torch.rot90(tile, k=k, dims=[1, 2])

        # Small additive Gaussian noise (simulates sensor noise)
        if torch.rand(1) > 0.5:
            tile = tile + torch.randn_like(tile) * 0.02

        return tile.clamp(0.0, 1.0)


# ─────────────────────────────────────────────
# MODEL ARCHITECTURE — ThermaNet
# ─────────────────────────────────────────────
class SpatialAttention(nn.Module):
    """
    Spatial Attention Module.

    Learns a 2D attention map (H×W) that tells the model
    WHERE in the thermal tile to focus.

    For CRITICAL tiles: attention focuses on the hottest blobs.
    For COOL tiles: attention is more uniform (no strong hot spots).

    This attention map can be visualized to show judges
    "the model detected a heat source at this location."

    Implementation: channel-wise max + average pooling,
    concatenated and passed through a 7×7 conv → sigmoid.
    (Woo et al. CBAM 2018 — efficient and battle-tested)
    """
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # Spatial statistics across channels
        avg_pool = torch.mean(x, dim=1, keepdim=True)   # (B,1,H,W)
        max_pool = torch.max(x,  dim=1, keepdim=True)[0] # (B,1,H,W)
        concat   = torch.cat([avg_pool, max_pool], dim=1) # (B,2,H,W)

        attention = self.sigmoid(self.conv(concat))       # (B,1,H,W)
        return x * attention, attention                   # element-wise scale


class ConvBlock(nn.Module):
    """Conv → BatchNorm → ReLU → (optional) MaxPool."""
    def __init__(self, in_ch, out_ch, pool=True):
        super().__init__()
        layers = [
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=False),
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=False),
        ]
        if pool:
            layers.append(nn.MaxPool2d(2, 2))
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)


class ThermaNet(nn.Module):
    """
    Lightweight CNN for thermal tile classification.

    Designed specifically for:
    ─ 64×64 single-domain thermal imagery
    ─ 4-class output (COOL / MODERATE / HOT / CRITICAL)
    ─ Spatial attention to localize heat sources
    ─ ~500K parameters (fast training, no overfitting)
    """
    def __init__(self, n_classes=4, dropout=0.4):
        super().__init__()

        # Feature extractor
        self.block1 = ConvBlock(3,   32,  pool=True)   # → 32×32×32
        self.block2 = ConvBlock(32,  64,  pool=True)   # → 64×16×16
        self.attn   = SpatialAttention()                # → 64×16×16 + attn map
        self.block3 = ConvBlock(64,  128, pool=True)   # → 128×8×8
        self.block4 = ConvBlock(128, 256, pool=False)  # → 256×8×8

        # Global pooling → fixed-size vector regardless of input size
        self.gap = nn.AdaptiveAvgPool2d(1)             # → 256×1×1

        # Classifier head
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(128, n_classes),
        )

    def forward(self, x, return_attention=False):
        x = self.block1(x)
        x = self.block2(x)
        x, attn_map = self.attn(x)
        x = self.block3(x)
        x = self.block4(x)
        x = self.gap(x)
        logits = self.classifier(x)

        if return_attention:
            return logits, attn_map
        return logits

    def count_parameters(self):
        return sum(p.numel() for p in self.parameters() if p.requires_grad)


# ─────────────────────────────────────────────
# TRAINING LOOP
# ─────────────────────────────────────────────
def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss, correct, total = 0.0, 0, 0

    for tiles, labels in loader:
        tiles  = tiles.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        logits = model(tiles)
        loss   = criterion(logits, labels)
        loss.backward()

        # Gradient clipping prevents exploding gradients
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        total_loss += loss.item() * tiles.size(0)
        preds       = logits.argmax(dim=1)
        correct    += (preds == labels).sum().item()
        total      += tiles.size(0)

    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    all_preds, all_labels = [], []

    for tiles, labels in loader:
        tiles  = tiles.to(device)
        labels = labels.to(device)

        logits = model(tiles)
        loss   = criterion(logits, labels)

        total_loss += loss.item() * tiles.size(0)
        preds       = logits.argmax(dim=1)
        correct    += (preds == labels).sum().item()
        total      += tiles.size(0)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

    return total_loss / total, correct / total, all_preds, all_labels


# ─────────────────────────────────────────────
# VISUALIZATIONS
# ─────────────────────────────────────────────
def plot_training_curves(history):
    """Plot loss + accuracy over epochs."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.patch.set_facecolor("#0A0E1A")
    epochs = range(1, len(history["train_loss"]) + 1)

    for ax, metric, title in zip(
        axes,
        [("train_loss", "val_loss"), ("train_acc", "val_acc")],
        ["Training & Validation Loss", "Training & Validation Accuracy"]
    ):
        ax.set_facecolor("#111827")
        ax.plot(epochs, history[metric[0]], color="#00D4B4", lw=2, label="Train")
        ax.plot(epochs, history[metric[1]], color="#FF4E1A", lw=2, label="Val",
                linestyle="--")
        ax.set_title(title, color="#F0F4FF", fontsize=12, fontweight="bold")
        ax.set_xlabel("Epoch", color="#8B9DC3")
        ax.legend(facecolor="#1C2537", edgecolor="#1E2D45", labelcolor="#F0F4FF")
        ax.tick_params(colors="#8B9DC3")
        for spine in ax.spines.values():
            spine.set_color("#1E2D45")

    plt.suptitle("ThermaNet — Training History", color="#F0F4FF",
                 fontsize=14, fontweight="bold")
    plt.tight_layout()
    plt.savefig("outputs/training_curves.png", dpi=150,
                bbox_inches="tight", facecolor="#0A0E1A")
    plt.close()
    print("✓ Training curves → outputs/training_curves.png")


def plot_confusion_matrix(all_labels, all_preds):
    """Plot normalized confusion matrix."""
    cm      = confusion_matrix(all_labels, all_preds)
    cm_norm = cm.astype(float) / cm.sum(axis=1, keepdims=True)

    fig, ax = plt.subplots(figsize=(8, 7))
    fig.patch.set_facecolor("#0A0E1A")
    ax.set_facecolor("#111827")

    im = ax.imshow(cm_norm, cmap="YlOrRd", vmin=0, vmax=1)
    plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    ax.set_xticks(range(N_CLASSES))
    ax.set_yticks(range(N_CLASSES))
    ax.set_xticklabels(CLASS_NAMES, color="#8B9DC3", fontsize=11)
    ax.set_yticklabels(CLASS_NAMES, color="#8B9DC3", fontsize=11)
    ax.set_xlabel("Predicted", color="#F0F4FF", fontsize=12)
    ax.set_ylabel("True",      color="#F0F4FF", fontsize=12)
    ax.set_title("Confusion Matrix (Normalized)", color="#F0F4FF",
                 fontsize=13, fontweight="bold", pad=15)

    for i in range(N_CLASSES):
        for j in range(N_CLASSES):
            val   = cm_norm[i, j]
            count = cm[i, j]
            color = "white" if val < 0.5 else "#0A0E1A"
            ax.text(j, i, f"{val:.2f}\n({count})",
                    ha="center", va="center", color=color,
                    fontsize=10, fontweight="bold")

    plt.tight_layout()
    plt.savefig("outputs/confusion_matrix.png", dpi=150,
                bbox_inches="tight", facecolor="#0A0E1A")
    plt.close()
    print("✓ Confusion matrix → outputs/confusion_matrix.png")


def visualize_attention(model, val_dataset, n_samples=8):
    """
    Visualize spatial attention maps for sample tiles.
    Shows WHAT the model focuses on to make its decision.
    This is the visual judges love — "the AI sees the heat source."
    """
    model.eval()
    fig, axes = plt.subplots(3, n_samples, figsize=(n_samples * 2.5, 8))
    fig.patch.set_facecolor("#0A0E1A")

    # Pick 2 samples per class
    shown = {0: 0, 1: 0, 2: 0, 3: 0}
    samples_to_show = []
    for i in range(len(val_dataset)):
        tile, label = val_dataset[i]
        if shown[label] < (n_samples // N_CLASSES):
            samples_to_show.append((tile, label))
            shown[label] += 1
        if len(samples_to_show) == n_samples:
            break

    for col, (tile, label) in enumerate(samples_to_show):
        with torch.no_grad():
            inp    = tile.unsqueeze(0).to(DEVICE)
            logits, attn = model(inp, return_attention=True)
            probs  = F.softmax(logits, dim=1).cpu().numpy()[0]
            pred   = probs.argmax()
            attn   = attn.squeeze().cpu().numpy()   # (16, 16)

        # Row 0: raw thermal channel
        raw = tile[0].numpy()
        axes[0, col].imshow(raw, cmap="inferno", vmin=0, vmax=1)
        axes[0, col].set_title(f"True: {CLASS_NAMES[label]}",
                               color=CLASS_COLORS[label], fontsize=8, fontweight="bold")
        axes[0, col].axis("off")

        # Row 1: attention map overlaid
        attn_up = np.kron(attn, np.ones((4, 4)))   # upsample 16→64
        axes[1, col].imshow(raw,    cmap="gray",  alpha=0.4)
        axes[1, col].imshow(attn_up, cmap="hot",  alpha=0.7, vmin=0, vmax=1)
        axes[1, col].set_title("Attention", color="#8B9DC3", fontsize=8)
        axes[1, col].axis("off")

        # Row 2: prediction bar
        ax = axes[2, col]
        ax.set_facecolor("#111827")
        bars = ax.bar(range(N_CLASSES), probs,
                      color=[CLASS_COLORS[i] for i in range(N_CLASSES)],
                      edgecolor="none", width=0.7)
        bars[pred].set_edgecolor("#F0F4FF")
        bars[pred].set_linewidth(2)
        ax.set_xticks(range(N_CLASSES))
        ax.set_xticklabels(["C", "M", "H", "X"], color="#8B9DC3", fontsize=7)
        ax.set_ylim(0, 1)
        ax.tick_params(colors="#8B9DC3", labelsize=6)
        for spine in ax.spines.values():
            spine.set_color("#1E2D45")
        conf_color = CLASS_COLORS[pred]
        ax.set_title(f"{CLASS_NAMES[pred]} {probs[pred]*100:.0f}%",
                     color=conf_color, fontsize=7, fontweight="bold")

    rows = ["Thermal Tile", "Attention Map", "Prediction"]
    for row_idx, label in enumerate(rows):
        axes[row_idx, 0].set_ylabel(label, color="#F0F4FF",
                                    fontsize=10, fontweight="bold")

    plt.suptitle("ThermaNet — Spatial Attention Visualization\n"
                 "(C=Cool  M=Moderate  H=Hot  X=Critical)",
                 color="#F0F4FF", fontsize=13, fontweight="bold", y=1.01)
    plt.tight_layout()
    plt.savefig("outputs/attention_maps.png", dpi=150,
                bbox_inches="tight", facecolor="#0A0E1A")
    plt.close()
    print("✓ Attention maps → outputs/attention_maps.png")


# ─────────────────────────────────────────────
# MAIN TRAINING PIPELINE
# ─────────────────────────────────────────────
def main():
    print("\n" + "="*50)
    print("  THERMACITY — ThermaNet CNN Training")
    print("="*50 + "\n")

    # ── 1. Datasets & loaders ────────────────────────────────────
    print("📂 Loading datasets...")
    train_ds = ThermalTileDataset("train", augment=True)
    val_ds   = ThermalTileDataset("val",   augment=False)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE,
                              shuffle=True,  num_workers=NUM_WORKERS,
                              pin_memory=DEVICE.type == "cuda")
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE,
                              shuffle=False, num_workers=NUM_WORKERS,
                              pin_memory=DEVICE.type == "cuda")

    # ── 2. Model ─────────────────────────────────────────────────
    model = ThermaNet(n_classes=N_CLASSES, dropout=0.4).to(DEVICE)
    print(f"\n🧠 ThermaNet architecture:")
    print(f"   Parameters:  {model.count_parameters():,}")
    print(f"   Input shape: (batch, 3, {TILE_SIZE}, {TILE_SIZE})")
    print(f"   Output:      {N_CLASSES} class probabilities")
    print(f"   Device:      {DEVICE}")

    # ── 3. Loss & optimizer ──────────────────────────────────────
    # Weighted cross-entropy (handles class imbalance from real data)
    weights   = train_ds.class_weights.to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR,
                                  weight_decay=1e-4)
    # Cosine annealing: smoothly decays LR to 0 over training
    scheduler = CosineAnnealingLR(optimizer, T_max=EPOCHS, eta_min=1e-5)

    # ── 4. Training loop ─────────────────────────────────────────
    print(f"\n🚀 Training for {EPOCHS} epochs...")
    print(f"   Batch size: {BATCH_SIZE} | LR: {LR} | Optimizer: AdamW")
    print(f"   Scheduler:  CosineAnnealingLR\n")
    print(f"   {'Epoch':<7} {'T-Loss':<10} {'T-Acc':<9} "
          f"{'V-Loss':<10} {'V-Acc':<9} {'Time':<8} {'Status'}")
    print("   " + "─" * 65)

    history = {
        "train_loss": [], "train_acc": [],
        "val_loss":   [], "val_acc":   []
    }
    best_val_acc  = 0.0
    best_epoch    = 0
    patience      = 10
    patience_ctr  = 0

    for epoch in range(1, EPOCHS + 1):
        t0 = time.time()

        tr_loss, tr_acc = train_one_epoch(
            model, train_loader, optimizer, criterion, DEVICE)
        vl_loss, vl_acc, _, _ = evaluate(
            model, val_loader, criterion, DEVICE)
        scheduler.step()

        history["train_loss"].append(tr_loss)
        history["train_acc"].append(tr_acc)
        history["val_loss"].append(vl_loss)
        history["val_acc"].append(vl_acc)

        elapsed = time.time() - t0
        is_best = vl_acc > best_val_acc

        if is_best:
            best_val_acc = vl_acc
            best_epoch   = epoch
            patience_ctr = 0
            torch.save({
                "epoch":     epoch,
                "state_dict": model.state_dict(),
                "val_acc":   vl_acc,
                "val_loss":  vl_loss,
                "optimizer": optimizer.state_dict(),
            }, "models/thermanet.pth")
            status = "✓ BEST"
        else:
            patience_ctr += 1
            status = f"  [{patience_ctr}/{patience}]"

        print(f"   {epoch:<7} {tr_loss:<10.4f} {tr_acc*100:<9.2f} "
              f"{vl_loss:<10.4f} {vl_acc*100:<9.2f} {elapsed:<8.1f} {status}")

        # Early stopping
        if patience_ctr >= patience:
            print(f"\n   Early stopping at epoch {epoch}")
            break

    print(f"\n✅ Best model: epoch {best_epoch} | val_acc = {best_val_acc*100:.2f}%")

    # ── 5. Final evaluation on best model ────────────────────────
    print("\n📊 Final evaluation (best model)...")
    checkpoint = torch.load("models/thermanet.pth", map_location=DEVICE)
    model.load_state_dict(checkpoint["state_dict"])

    _, final_acc, all_preds, all_labels = evaluate(
        model, val_loader, criterion, DEVICE)

    report = classification_report(
        all_labels, all_preds,
        target_names=CLASS_NAMES,
        output_dict=True
    )
    print(f"\n   Overall accuracy: {final_acc*100:.2f}%")
    print(f"\n   {'Class':<12} {'Precision':<12} {'Recall':<10} {'F1':<8}")
    print("   " + "─" * 44)
    for cls in CLASS_NAMES:
        r = report[cls]
        print(f"   {cls:<12} {r['precision']:<12.3f} "
              f"{r['recall']:<10.3f} {r['f1-score']:<8.3f}")

    # ── 6. Save artifacts ────────────────────────────────────────
    config = {
        "architecture": "ThermaNet",
        "tile_size":    TILE_SIZE,
        "n_classes":    N_CLASSES,
        "class_names":  CLASS_NAMES,
        "parameters":   model.count_parameters(),
        "best_epoch":   best_epoch,
        "best_val_acc": round(best_val_acc, 4),
        "final_acc":    round(final_acc, 4),
    }
    with open("models/thermanet_config.json", "w") as f:
        json.dump(config, f, indent=2)

    with open("outputs/class_report.json", "w") as f:
        json.dump(report, f, indent=2)

    # ── 7. Visualizations ────────────────────────────────────────
    print("\n🎨 Generating visualizations...")
    plot_training_curves(history)
    plot_confusion_matrix(all_labels, all_preds)
    visualize_attention(model, val_ds, n_samples=8)

    print(f"\n   Model config   → models/thermanet_config.json")
    print(f"   Class report   → outputs/class_report.json")
    print(f"\n✓ Step 2 done. Run model2_step3_inference.py to use the model.")

    return model, history


if __name__ == "__main__":
    model, history = main()
