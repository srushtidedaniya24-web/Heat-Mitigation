"""
THERMACITY — Model 2, Step 1: Thermal Tile Generator
======================================================
Generates a synthetic dataset of 64×64 thermal image tiles
with 4 classes:

  Class 0 — COOL       (< 35°C)   parks, water bodies, forests
  Class 1 — MODERATE   (35–46°C)  residential, sparse urban
  Class 2 — HOT        (46–54°C)  dense urban, commercial
  Class 3 — CRITICAL   (> 54°C)   industrial, downtown core, asphalt

In production:
  Replace this with real Landsat ST_B10 tiles clipped from GEE.
  Each tile = a 64×64 pixel crop of the LST raster at ~100m/px.

WHY tiles + CNN instead of just using Model 1?
  Model 1 predicts temperature at a POINT using tabular features.
  Model 2 classifies the SPATIAL PATTERN of a tile:
    - Is the heat concentrated in one corner? (industrial source)
    - Is there a hot streak? (road canyon effect)
    - Is there a cool island? (park or water body)
  This spatial texture cannot be captured by tabular features alone.

OUTPUT:
  data/tiles/train/cool/        *.npy files
  data/tiles/train/moderate/
  data/tiles/train/hot/
  data/tiles/train/critical/
  data/tiles/val/  (same structure)
  data/tile_metadata.csv
"""

import numpy as np
import os
import json
import pandas as pd
from pathlib import Path

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
TILE_SIZE      = 64        # pixels (64×64)
N_TRAIN        = 2800      # total training tiles
N_VAL          = 700       # total validation tiles
SEED           = 42
OUTPUT_DIR     = Path("data/tiles")

CLASSES = {
    0: {"name": "cool",     "label": "COOL",     "temp_range": (20, 35)},
    1: {"name": "moderate", "label": "MODERATE", "temp_range": (35, 46)},
    2: {"name": "hot",      "label": "HOT",      "temp_range": (46, 54)},
    3: {"name": "critical", "label": "CRITICAL", "temp_range": (54, 70)},
}

np.random.seed(SEED)


# ─────────────────────────────────────────────
# THERMAL PATTERN GENERATORS
# Each function generates one 64×64 tile as float32
# with realistic spatial texture for its class.
# ─────────────────────────────────────────────

def gaussian_blob(size, cx, cy, sigma, amplitude):
    """2D Gaussian hot/cool spot."""
    x = np.arange(size)
    y = np.arange(size)
    xx, yy = np.meshgrid(x, y)
    return amplitude * np.exp(-((xx - cx)**2 + (yy - cy)**2) / (2 * sigma**2))


def perlin_like_noise(size, scale=8, octaves=4):
    """
    Simulate Perlin-like noise for realistic thermal variation.
    Stacks multiple frequencies of smooth noise.
    """
    result = np.zeros((size, size))
    amp    = 1.0
    for _ in range(octaves):
        freq = max(1, size // scale)
        noise = np.random.randn(freq, freq)
        # Upsample using repeat (simple but realistic enough)
        factor = size // freq
        upsampled = np.repeat(np.repeat(noise, factor, axis=0), factor, axis=1)
        # Crop/pad to exact size
        upsampled = upsampled[:size, :size]
        if upsampled.shape != (size, size):
            pad = size - upsampled.shape[0]
            upsampled = np.pad(upsampled, ((0, pad), (0, pad)), mode='edge')[:size, :size]
        result += amp * upsampled
        amp   /= 2
        scale //= 2
        if scale < 1:
            scale = 1
    return result / result.std() if result.std() > 0 else result


def make_cool_tile():
    """
    Class 0: COOL (20–35°C)
    Patterns: water bodies, parks, forests.
    Uniform low temp with gentle variation.
    Sometimes a cool lake (very uniform center).
    """
    base    = np.random.uniform(22, 33)
    noise   = perlin_like_noise(TILE_SIZE, scale=12) * 3.0
    tile    = base + noise

    # Occasionally add a water body (very cool, uniform region)
    if np.random.rand() > 0.5:
        cx, cy = np.random.randint(10, 54, 2)
        r      = np.random.randint(8, 20)
        for i in range(TILE_SIZE):
            for j in range(TILE_SIZE):
                if (i - cy)**2 + (j - cx)**2 < r**2:
                    tile[i, j] = np.random.uniform(18, 26)

    return tile.astype(np.float32)


def make_moderate_tile():
    """
    Class 1: MODERATE (35–46°C)
    Patterns: residential areas, sparse built-up.
    Mix of warm patches and cool green corridors.
    """
    base  = np.random.uniform(36, 44)
    noise = perlin_like_noise(TILE_SIZE, scale=8) * 4.0
    tile  = base + noise

    # Add 1–3 cool green patches (parks, trees)
    n_parks = np.random.randint(1, 4)
    for _ in range(n_parks):
        cx, cy = np.random.randint(5, 59, 2)
        sigma  = np.random.uniform(4, 10)
        tile  -= gaussian_blob(TILE_SIZE, cx, cy, sigma,
                               amplitude=np.random.uniform(4, 10))

    # Add 1–2 warm patches (small commercial clusters)
    n_hot = np.random.randint(1, 3)
    for _ in range(n_hot):
        cx, cy = np.random.randint(5, 59, 2)
        sigma  = np.random.uniform(3, 7)
        tile  += gaussian_blob(TILE_SIZE, cx, cy, sigma,
                               amplitude=np.random.uniform(3, 7))

    return tile.astype(np.float32)


def make_hot_tile():
    """
    Class 2: HOT (46–54°C)
    Patterns: dense urban, commercial districts.
    Dominant hot background with road canyon streaks.
    """
    base  = np.random.uniform(47, 52)
    noise = perlin_like_noise(TILE_SIZE, scale=6) * 3.0
    tile  = base + noise

    # Road canyon effect — horizontal or vertical hot streaks
    n_roads = np.random.randint(1, 4)
    for _ in range(n_roads):
        if np.random.rand() > 0.5:
            # Horizontal road
            row   = np.random.randint(5, 59)
            width = np.random.randint(2, 5)
            tile[max(0, row-width):row+width, :] += np.random.uniform(3, 7)
        else:
            # Vertical road
            col   = np.random.randint(5, 59)
            width = np.random.randint(2, 5)
            tile[:, max(0, col-width):col+width] += np.random.uniform(3, 7)

    # Small cool relief (courtyard, small park)
    if np.random.rand() > 0.6:
        cx, cy = np.random.randint(10, 54, 2)
        tile  -= gaussian_blob(TILE_SIZE, cx, cy,
                               sigma=np.random.uniform(3, 6),
                               amplitude=np.random.uniform(5, 10))

    return tile.astype(np.float32)


def make_critical_tile():
    """
    Class 3: CRITICAL (54–70°C)
    Patterns: industrial zones, downtown core, parking lots.
    Very high uniform heat + concentrated super-hot sources.
    """
    base  = np.random.uniform(55, 65)
    noise = perlin_like_noise(TILE_SIZE, scale=4) * 2.5
    tile  = base + noise

    # Industrial heat source (intense hot blob)
    n_sources = np.random.randint(1, 3)
    for _ in range(n_sources):
        cx, cy    = np.random.randint(8, 56, 2)
        sigma     = np.random.uniform(4, 12)
        amplitude = np.random.uniform(5, 15)
        tile     += gaussian_blob(TILE_SIZE, cx, cy, sigma, amplitude)

    # Dark asphalt grid pattern (parking lots)
    if np.random.rand() > 0.4:
        step = np.random.randint(8, 16)
        for i in range(0, TILE_SIZE, step):
            tile[i:i+2, :] += np.random.uniform(2, 5)
        for j in range(0, TILE_SIZE, step):
            tile[:, j:j+2] += np.random.uniform(2, 5)

    return tile.astype(np.float32)


GENERATORS = {
    0: make_cool_tile,
    1: make_moderate_tile,
    2: make_hot_tile,
    3: make_critical_tile,
}


# ─────────────────────────────────────────────
# NORMALIZE TO [0, 1] FOR MODEL INPUT
# ─────────────────────────────────────────────
def normalize_tile(tile, t_min=15.0, t_max=75.0):
    """
    Normalize temperature tile to [0, 1] range.
    Fixed range so normalization is consistent across all tiles.
    """
    return np.clip((tile - t_min) / (t_max - t_min), 0.0, 1.0)


# ─────────────────────────────────────────────
# DATASET GENERATION
# ─────────────────────────────────────────────
def generate_split(split_name, n_total):
    """Generate tiles for one split (train or val)."""
    split_dir = OUTPUT_DIR / split_name
    n_per_class = n_total // len(CLASSES)
    records = []

    for cls_id, cls_info in CLASSES.items():
        cls_dir = split_dir / cls_info["name"]
        cls_dir.mkdir(parents=True, exist_ok=True)
        generator = GENERATORS[cls_id]

        for i in range(n_per_class):
            tile      = generator()
            tile_norm = normalize_tile(tile)

            # Stack as 3-channel "image" (R=raw, G=normalized, B=edge-enhanced)
            # This mimics a real 3-band satellite composite
            edges = np.gradient(tile)[0]   # spatial gradient as 3rd channel
            edges_norm = normalize_tile(edges, t_min=edges.min(), t_max=edges.max())
            
            tile_3ch = np.stack([
                tile_norm,              # channel 1: normalized temperature
                tile_norm ** 0.5,       # channel 2: gamma-corrected (enhances cool areas)
                edges_norm,             # channel 3: spatial gradient (edge info)
            ], axis=0)   # shape: (3, 64, 64) — PyTorch expects C×H×W

            filename = f"{cls_info['name']}_{split_name}_{i:04d}.npy"
            filepath = cls_dir / filename
            np.save(filepath, tile_3ch.astype(np.float32))

            records.append({
                "filepath":    str(filepath),
                "split":       split_name,
                "class_id":    cls_id,
                "class_name":  cls_info["name"],
                "class_label": cls_info["label"],
                "mean_temp":   round(float(tile.mean()), 2),
                "max_temp":    round(float(tile.max()),  2),
                "min_temp":    round(float(tile.min()),  2),
                "std_temp":    round(float(tile.std()),  2),
            })

        print(f"  ✓ {split_name}/{cls_info['name']}: {n_per_class} tiles")

    return records


def generate_dataset():
    print("\n" + "="*50)
    print("  THERMACITY — Thermal Tile Generator")
    print("="*50 + "\n")

    print("📦 Generating training tiles...")
    train_records = generate_split("train", N_TRAIN)

    print("\n📦 Generating validation tiles...")
    val_records   = generate_split("val",   N_VAL)

    all_records = train_records + val_records
    df = pd.DataFrame(all_records)
    df.to_csv("data/tile_metadata.csv", index=False)

    print(f"\n✅ Dataset summary:")
    print(f"   Total tiles:      {len(df)}")
    print(f"   Training tiles:   {len(train_records)}")
    print(f"   Validation tiles: {len(val_records)}")
    print(f"   Tile shape:       (3, {TILE_SIZE}, {TILE_SIZE})  [C×H×W]")
    print(f"   Classes:")
    for cls_id, info in CLASSES.items():
        subset = df[(df["class_id"] == cls_id) & (df["split"] == "train")]
        print(f"     {cls_id} — {info['label']:<10} "
              f"mean={subset['mean_temp'].mean():.1f}°C  "
              f"range={subset['min_temp'].min():.0f}–{subset['max_temp'].max():.0f}°C")

    print(f"\n   Metadata → data/tile_metadata.csv")
    print(f"   Tiles    → data/tiles/train/ + data/tiles/val/")
    return df


if __name__ == "__main__":
    df = generate_dataset()
    print("\n✓ Step 1 done. Run model2_step2_train_cnn.py next.")
