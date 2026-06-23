const BASE = "http://localhost:8000";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export function fetchHeatmap()       { return get("/heatmap?city=mumbai"); }
export function fetchHotspots()      { return get("/hotspots?threshold=50&top_n=5"); }
export function fetchZones()         { return get("/zones"); }
export function fetchMetrics()       { return get("/metrics"); }
export function fetchRecommendations(zoneId) { return get(`/recommend/${zoneId}`); }
export function fetchHealth()        { return get("/health"); }
export function fetchGridHeatmap(step = 4) { return get(`/heatmap-grid?step=${step}`); }
export function fetchInterventions(coverage = 100, zoneId = null) {
  let path = `/interventions?coverage=${coverage}`;
  if (zoneId) path += `&zone_id=${zoneId}`;
  return get(path);
}
export function simulateIntervention(zoneId, intervention, coveragePct) {
  return fetch(`${BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zone_id: zoneId, intervention, coverage_pct: coveragePct }),
  }).then(r => r.json());
}

export async function classifyTile(zoneId, tileArray) {
  const res = await fetch(`${BASE}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zone_id: zoneId, tile_array: tileArray }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function classifyZone(zoneId) {
  return get(`/classify/zone/${zoneId}`);
}
