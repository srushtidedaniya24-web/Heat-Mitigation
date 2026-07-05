function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

function gaussianBlurGrid(grid, nx, ny, sigma) {
  const radius = Math.ceil(sigma * 3);
  const kernel = [];
  for (let i = -radius; i <= radius; i++) {
    kernel.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
  }
  const temp = Array.from({ length: ny }, () => new Float32Array(nx));
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      let sum = 0, wsum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const sx = x + k - radius;
        if (sx >= 0 && sx < nx) {
          const v = grid[y][sx];
          if (!isNaN(v)) { sum += v * kernel[k]; wsum += kernel[k]; }
        }
      }
      temp[y][x] = wsum > 0 ? sum / wsum : NaN;
    }
  }
  const result = Array.from({ length: ny }, () => new Float32Array(nx));
  for (let x = 0; x < nx; x++) {
    for (let y = 0; y < ny; y++) {
      let sum = 0, wsum = 0;
      for (let k = 0; k < kernel.length; k++) {
        const sy = y + k - radius;
        if (sy >= 0 && sy < ny) {
          const v = temp[sy][x];
          if (!isNaN(v)) { sum += v * kernel[k]; wsum += kernel[k]; }
        }
      }
      result[y][x] = wsum > 0 ? sum / wsum : NaN;
    }
  }
  return result;
}

const PALETTES = {
  lst: [
    [0.00, [0, 13, 38]],
    [0.15, [12, 59, 107]],
    [0.35, [34, 211, 238]],
    [0.50, [100, 180, 50]],
    [0.65, [234, 179, 8]],
    [0.80, [249, 115, 22]],
    [1.00, [239, 68, 68]],
  ],
  ndvi: [
    [0.00, [215, 48, 39]],
    [0.25, [255, 255, 194]],
    [0.50, [120, 198, 121]],
    [0.75, [49, 163, 84]],
    [1.00, [0, 104, 55]],
  ],
  building: [
    [0.00, [30, 58, 95]],
    [0.33, [253, 230, 138]],
    [0.66, [249, 115, 22]],
    [1.00, [220, 38, 38]],
  ],
  road: [
    [0.00, [30, 58, 95]],
    [0.25, [134, 239, 172]],
    [0.50, [163, 230, 53]],
    [0.75, [253, 224, 71]],
    [1.00, [254, 240, 138]],
  ],
  population: [
    [0.00, [30, 27, 75]],
    [0.25, [221, 214, 254]],
    [0.50, [196, 181, 253]],
    [0.75, [167, 139, 250]],
    [1.00, [124, 58, 237]],
  ],
};

const CATEGORICAL_COLORS = {
  landcover: {
    builtup_dense: [239, 68, 68],
    builtup_sparse: [249, 115, 22],
    vegetation: [34, 197, 94],
    scrubland: [234, 179, 8],
    bare: [161, 161, 170],
  },
};

const CATEGORICAL_LAYERS = new Set(["landcover"]);

function samplePalette(palette, t) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < palette.length - 1; i++) {
    if (clamped >= palette[i][0] && clamped <= palette[i + 1][0]) {
      const seg = (palette[i + 1][0] - palette[i][0]) || 1;
      const local = (clamped - palette[i][0]) / seg;
      return lerpColor(palette[i][1], palette[i + 1][1], local);
    }
  }
  return palette[palette.length - 1][1];
}

function getColor(val, layerId, minVal, maxVal) {
  if (val == null || isNaN(val)) return [0, 0, 0, 0];
  const range = maxVal - minVal || 1;
  const t = (val - minVal) / range;
  const palette = PALETTES[layerId];
  if (!palette) return [0, 13, 38, 120];
  const [r, g, b] = samplePalette(palette, t);
  return [r, g, b, 180];
}

export function generateSmoothRaster({ cells, getValue, layerId }) {
  if (!cells || cells.length === 0) return null;

  const isCategorical = CATEGORICAL_LAYERS.has(layerId);
  const catColors = CATEGORICAL_COLORS[layerId] || {};

  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  const cellMap = new Map();

  cells.forEach((c) => {
    if (!c.bbox) return;
    const cx = +((c.bbox[0] + c.bbox[2]) / 2).toFixed(6);
    const cy = +((c.bbox[1] + c.bbox[3]) / 2).toFixed(6);
    const key = `${cx},${cy}`;
    if (!cellMap.has(key)) {
      cellMap.set(key, { lon: cx, lat: cy, value: getValue(c) });
    }
    minLon = Math.min(minLon, c.bbox[0]);
    minLat = Math.min(minLat, c.bbox[1]);
    maxLon = Math.max(maxLon, c.bbox[2]);
    maxLat = Math.max(maxLat, c.bbox[3]);
  });

  const points = [...cellMap.values()];
  const lons = [...new Set(points.map(p => p.lon))].sort((a, b) => a - b);
  const lats = [...new Set(points.map(p => p.lat))].sort((a, b) => a - b);

  const nx = lons.length;
  const ny = lats.length;
  if (nx < 2 || ny < 2) return null;

  // Scale factor: each grid cell becomes cellScale × cellScale pixels
  // Aim for larger dimension >= 2048 for GIS-quality rendering
  const cellScale = Math.max(1, Math.min(16, Math.floor(2048 / Math.max(nx, ny))));
  const sw = nx * cellScale;
  const sh = ny * cellScale;

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = nx;
  tempCanvas.height = ny;
  const tempCtx = tempCanvas.getContext("2d");
  const imageData = tempCtx.createImageData(nx, ny);
  const buf = imageData.data;

  if (isCategorical) {
    // Map category strings → numeric indices for Gaussian blur
    const catKeys = Object.keys(catColors);
    const catToIndex = {};
    catKeys.forEach((k, i) => { catToIndex[k] = i; });

    const gridValues = Array.from({ length: ny }, () => new Array(nx).fill(null));
    points.forEach(p => {
      const ix = lons.indexOf(p.lon);
      const iy = lats.indexOf(p.lat);
      if (ix !== -1 && iy !== -1) {
        gridValues[iy][ix] = p.value;
      }
    });
    // Nearest-neighbor fill for missing positions
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        if (gridValues[iy][ix] !== null) continue;
        let best = null, bestDist = Infinity;
        for (const p of points) {
          const px = lons.indexOf(p.lon);
          const py = lats.indexOf(p.lat);
          if (px === -1 || py === -1) continue;
          const d = (px - ix) ** 2 + (py - iy) ** 2;
          if (d < bestDist) { bestDist = d; best = p.value; }
        }
        gridValues[iy][ix] = best;
      }
    }
    // Convert to numeric grid for Gaussian blur
    const numericGrid = Array.from({ length: ny }, () => new Float32Array(nx));
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const idx = catToIndex[gridValues[iy][ix]];
        numericGrid[iy][ix] = idx !== undefined ? idx : 0;
      }
    }
    // Apply Gaussian blur for smooth boundaries
    const smoothGrid = gaussianBlurGrid(numericGrid, nx, ny, 1.2);
    // Render: snap back to nearest category
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const rounded = Math.round(smoothGrid[ny - 1 - iy][ix]);
        const clamped = Math.max(0, Math.min(catKeys.length - 1, rounded));
        const color = catColors[catKeys[clamped]] || [80, 80, 90];
        const idx = (iy * nx + ix) * 4;
        buf[idx] = color[0]; buf[idx + 1] = color[1]; buf[idx + 2] = color[2]; buf[idx + 3] = 255;
      }
    }
  } else {
    const valueGrid = Array.from({ length: ny }, () => new Float32Array(nx).fill(NaN));
    points.forEach(p => {
      const ix = lons.indexOf(p.lon);
      const iy = lats.indexOf(p.lat);
      if (ix !== -1 && iy !== -1) {
        valueGrid[iy][ix] = p.value;
      }
    });

    const smoothGrid = gaussianBlurGrid(valueGrid, nx, ny, 0.7);

    let minVal = Infinity, maxVal = -Infinity;
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const v = smoothGrid[iy][ix];
        if (!isNaN(v)) {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        }
      }
    }
    if (!isFinite(minVal)) return null;

    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const val = smoothGrid[ny - 1 - iy][ix];
        let r, g, b, a;
        if (!isNaN(val)) {
          [r, g, b, a] = getColor(val, layerId, minVal, maxVal);
        } else {
          r = 0; g = 0; b = 0; a = 0;
        }
        const idx = (iy * nx + ix) * 4;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = a;
      }
    }
  }

  tempCtx.putImageData(imageData, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tempCanvas, 0, 0, sw, sh);

  return {
    dataUrl: canvas.toDataURL(),
    bounds: [[minLat, minLon], [maxLat, maxLon]],
  };
}
