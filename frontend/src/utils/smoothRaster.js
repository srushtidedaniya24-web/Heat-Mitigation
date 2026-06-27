function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
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

function getSmoothColor(val, layerId, minVal, maxVal) {
  if (val == null || isNaN(val)) return [0, 0, 0, 0];
  const range = maxVal - minVal || 1;
  const t = (val - minVal) / range;
  const palette = PALETTES[layerId];
  if (!palette) return [0, 13, 38, 200];
  const [r, g, b] = samplePalette(palette, t);
  return [r, g, b, 200];
}

const WATER_COLOR = [0, 13, 38, 0];

export function generateSmoothRaster({ cells, getValue, layerId, width = 800 }) {
  if (!cells || cells.length === 0) return null;

  const isCategorical = CATEGORICAL_LAYERS.has(layerId);
  const catColors = CATEGORICAL_COLORS[layerId] || {};

  const centerMap = new Map();
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

  cells.forEach((c) => {
    if (!c.bbox) return;
    const cx = (c.bbox[0] + c.bbox[2]) / 2;
    const cy = (c.bbox[1] + c.bbox[3]) / 2;
    const key = `${cx.toFixed(6)},${cy.toFixed(6)}`;
    if (!centerMap.has(key)) {
      centerMap.set(key, { lon: cx, lat: cy });
    }
    minLon = Math.min(minLon, c.bbox[0]);
    minLat = Math.min(minLat, c.bbox[1]);
    maxLon = Math.max(maxLon, c.bbox[2]);
    maxLat = Math.max(maxLat, c.bbox[3]);
  });

  const centers = [...centerMap.values()];
  const lons = [...new Set(centers.map((p) => p.lon))].sort((a, b) => a - b);
  const lats = [...new Set(centers.map((p) => p.lat))].sort((a, b) => a - b);

  const nx = lons.length;
  const ny = lats.length;
  if (nx < 2 || ny < 2) return null;

  const padLon = ((maxLon - minLon) / (nx - 1)) * 0.5;
  const padLat = ((maxLat - minLat) / (ny - 1)) * 0.5;
  const eMinLon = minLon - padLon;
  const eMinLat = minLat - padLat;
  const eMaxLon = maxLon + padLon;
  const eMaxLat = maxLat + padLat;

  const aspect = (eMaxLat - eMinLat) / (eMaxLon - eMinLon);
  const cw = width;
  const ch = Math.max(1, Math.round(width * aspect));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(cw, ch);
  const buf = imageData.data;

  if (isCategorical) {
    const small = document.createElement("canvas");
    small.width = nx;
    small.height = ny;
    const sctx = small.getContext("2d");

    cells.forEach((c) => {
      if (!c.bbox) return;
      const cx = (c.bbox[0] + c.bbox[2]) / 2;
      const cy = (c.bbox[1] + c.bbox[3]) / 2;
      const ix = lons.indexOf(cx);
      const iy = lats.indexOf(cy);
      if (ix !== -1 && iy !== -1) {
        const cat = getValue(c);
        const color = catColors[cat];
        if (color) {
          sctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
          sctx.fillRect(ix, ny - 1 - iy, 1, 1);
        }
      }
    });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(small, 0, 0, cw, ch);
  } else {
    const valueGrid = Array.from({ length: ny }, () => new Float32Array(nx).fill(NaN));
    cells.forEach((c) => {
      if (!c.bbox) return;
      const cx = (c.bbox[0] + c.bbox[2]) / 2;
      const cy = (c.bbox[1] + c.bbox[3]) / 2;
      const ix = lons.indexOf(cx);
      const iy = lats.indexOf(cy);
      if (ix !== -1 && iy !== -1) {
        valueGrid[iy][ix] = getValue(c);
      }
    });

    let minVal = Infinity, maxVal = -Infinity;
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const v = valueGrid[iy][ix];
        if (!isNaN(v)) {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        }
      }
    }
    if (!isFinite(minVal)) return null;

    const lonStep = nx > 1 ? (lons[nx - 1] - lons[0]) / (nx - 1) : 0.005;
    const latStep = ny > 1 ? (lats[ny - 1] - lats[0]) / (ny - 1) : 0.005;

    for (let py = 0; py < ch; py++) {
      for (let px = 0; px < cw; px++) {
        const lon = eMinLon + (px / (cw - 1)) * (eMaxLon - eMinLon);
        const lat = eMinLat + (1 - py / (ch - 1)) * (eMaxLat - eMinLat);

        const gx = (lon - lons[0]) / lonStep;
        const gy = (lat - lats[0]) / latStep;
        const ix = Math.floor(gx);
        const iy = Math.floor(gy);
        const fx = gx - ix;
        const fy = gy - iy;

        const v00 = valueGrid[iy]?.[ix];
        const v10 = valueGrid[iy]?.[ix + 1];
        const v01 = valueGrid[iy + 1]?.[ix];
        const v11 = valueGrid[iy + 1]?.[ix + 1];

        const has00 = !isNaN(v00);
        const has10 = !isNaN(v10);
        const has01 = !isNaN(v01);
        const has11 = !isNaN(v11);

        let val;
        if (has00 && has10 && has01 && has11) {
          val = (v00 * (1 - fx) + v10 * fx) * (1 - fy) + (v01 * (1 - fx) + v11 * fx) * fy;
        } else {
          const nearest = [v00, v10, v01, v11].find((v) => !isNaN(v));
          val = nearest != null ? nearest : NaN;
        }

        let r, g, b, a;
        if (!isNaN(val)) {
          [r, g, b, a] = getSmoothColor(val, layerId, minVal, maxVal);
        } else {
          r = WATER_COLOR[0]; g = WATER_COLOR[1]; b = WATER_COLOR[2]; a = WATER_COLOR[3];
        }

        const idx = (py * cw + px) * 4;
        buf[idx] = r;
        buf[idx + 1] = g;
        buf[idx + 2] = b;
        buf[idx + 3] = a;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return {
    dataUrl: canvas.toDataURL(),
    bounds: [[eMinLat, eMinLon], [eMaxLat, eMaxLon]],
  };
}
