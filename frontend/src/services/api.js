const BASE = "https://heat-mitigation-production.up.railway.app";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export function fetchHeatmap(dateFrom, dateTo) {
  let path = "/heatmap?city=mumbai";
  if (dateFrom) path += `&date_from=${encodeURIComponent(dateFrom)}`;
  if (dateTo)   path += `&date_to=${encodeURIComponent(dateTo)}`;
  return get(path);
}
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

export function fetchAlerts() {
  return get("/alerts");
}

export async function resolveAlert(zoneId) {
  const res = await fetch(`${BASE}/alerts/resolve/${zoneId}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function fetchReports(type) {
  let path = "/reports";
  if (type) path += `?type=${type}`;
  return get(path);
}

export async function generateReport(name, type) {
  const res = await fetch(`${BASE}/reports/generate?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function fetchSettings() {
  return get("/settings");
}

export async function saveSettings(data) {
  const res = await fetch(`${BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
