"""
THERMACITY — Model 2 Inference Module
=======================================
Drop-in module that loads ThermaNet and exposes:
  - classify_tile()         single tile -> class + confidence
  - classify_and_explain()  single tile -> class + GradCAM map + insight

Import this in api.py to add the /classify endpoint.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

DEVICE      = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASS_NAMES  = ["COOL", "MODERATE", "HOT", "CRITICAL"]
CLASS_COLORS = ["#1A4FA0", "#0EA882", "#FF6B35", "#FF4E1A"]

INSIGHTS = {
    "COOL":     "Healthy vegetation or water body. Surface temp within safe range. No intervention needed.",
    "MODERATE": "Low-medium heat load. Some green cover present. Low intervention priority.",
    "HOT":      "High heat load. Dense built-up area, low vegetation. Road canyon effects likely. "
                "Intervention recommended within 3 months.",
    "CRITICAL": "CRITICAL heat zone. Immediate intervention required. High population exposure risk. "
                "Prioritize cool roofs or urban greening.",
}

# ── Model architecture (must match model2_step2_train_cnn.py) ─────

class SpatialAttention(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_pool = torch.mean(x, dim=1, keepdim=True)
        max_pool = torch.max(x,  dim=1, keepdim=True)[0]
        concat   = torch.cat([avg_pool, max_pool], dim=1)
        attention = self.sigmoid(self.conv(concat))
        return x * attention, attention


class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch, pool=True):
        super().__init__()
        layers = [
            nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=False),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=False),
        ]
        if pool:
            layers.append(nn.MaxPool2d(2, 2))
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)


class ThermaNet(nn.Module):
    def __init__(self, n_classes=4, dropout=0.4):
        super().__init__()
        self.block1 = ConvBlock(3,   32,  pool=True)
        self.block2 = ConvBlock(32,  64,  pool=True)
        self.attn   = SpatialAttention()
        self.block3 = ConvBlock(64,  128, pool=True)
        self.block4 = ConvBlock(128, 256, pool=False)
        self.gap    = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(inplace=False),
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


# ── GradCAM ──────────────────────────────────────────────────────

class GradCAM:
    """GradCAM on the last convolutional layer (block4 last ReLU)."""
    def __init__(self, model):
        self.model = model
        self.acts  = None
        self.grads = None
        target_layer = model.block4.block[-1]
        target_layer.register_forward_hook(
            lambda m, i, o: setattr(self, "acts", o.detach()))
        target_layer.register_full_backward_hook(
            lambda m, gi, go: setattr(self, "grads", go[0].detach()))

    def generate(self, tile_tensor, target_class=None):
        self.model.zero_grad()
        inp    = tile_tensor.to(DEVICE).requires_grad_(True)
        logits = self.model(inp)
        probs  = F.softmax(logits, dim=1).squeeze().detach().cpu().numpy()
        pred   = int(probs.argmax())

        logits[0, target_class if target_class is not None else pred].backward()

        w   = self.grads.mean(dim=(2, 3), keepdim=True)
        cam = F.relu((w * self.acts).sum(1, keepdim=True)).squeeze().cpu().numpy()
        lo, hi = cam.min(), cam.max()
        if hi - lo > 1e-8:
            cam = (cam - lo) / (hi - lo)
        else:
            cam = np.zeros_like(cam)

        cam_up = F.interpolate(
            torch.from_numpy(cam).float().unsqueeze(0).unsqueeze(0),
            size=(64, 64), mode="bilinear", align_corners=False
        ).squeeze().numpy()

        return cam_up, pred, probs


# ── Loader (singleton) ────────────────────────────────────────────

_model   = None
_gradcam = None

def get_model(weights="models/thermanet.pth"):
    global _model, _gradcam
    if _model is None:
        _model = ThermaNet(n_classes=4, dropout=0.4).to(DEVICE)
        ckpt   = torch.load(weights, map_location=DEVICE)
        _model.load_state_dict(ckpt["state_dict"])
        _model.eval()
        _gradcam = GradCAM(_model)
    return _model, _gradcam


# ── Public API ────────────────────────────────────────────────────

def classify_tile(tile_array: np.ndarray) -> dict:
    model, _ = get_model()
    with torch.no_grad():
        t     = torch.from_numpy(tile_array).unsqueeze(0).to(DEVICE)
        probs = F.softmax(model(t), dim=1).squeeze().cpu().numpy()
    pred = int(probs.argmax())
    return {
        "class_id":      pred,
        "class_name":    CLASS_NAMES[pred],
        "confidence":    round(float(probs[pred]), 4),
        "probabilities": {CLASS_NAMES[i]: round(float(p), 4)
                          for i, p in enumerate(probs)},
    }


def classify_and_explain(tile_array: np.ndarray, zone_id: str = None) -> dict:
    _, gradcam = get_model()

    arr = tile_array
    if arr.ndim == 2:
        arr = np.stack([arr, arr**0.5, np.zeros_like(arr)], 0)

    t = torch.from_numpy(arr.astype(np.float32)).unsqueeze(0)
    cam, pred, probs = gradcam.generate(t)
    cls = CLASS_NAMES[pred]

    return {
        "zone_id":         zone_id,
        "class_id":        pred,
        "class_name":      cls,
        "class_color":     CLASS_COLORS[pred],
        "confidence":      round(float(probs[pred]), 4),
        "probabilities":   {CLASS_NAMES[i]: round(float(p), 4)
                            for i, p in enumerate(probs)},
        "gradcam_map":     cam.tolist(),
        "raw_tile":        arr[0].tolist() if arr.ndim == 3 else arr.tolist(),
        "insight":         INSIGHTS[cls],
        "action_required": pred >= 2,
    }


def tile_from_lst_array(lst_array: np.ndarray,
                        t_min=15.0, t_max=75.0) -> np.ndarray:
    norm  = np.clip((lst_array - t_min) / (t_max - t_min), 0.0, 1.0)
    gamma = norm ** 0.5
    edge  = np.gradient(lst_array)[0]
    lo, hi = edge.min(), edge.max()
    edge_n = (edge - lo) / (hi - lo + 1e-8)
    return np.stack([norm, gamma, edge_n], axis=0).astype(np.float32)
