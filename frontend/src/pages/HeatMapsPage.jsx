import { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { fetchHeatmap, fetchGridHeatmap } from "../services/api";
import "../styles/pages.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LAYERS = [
  { id: "lst",        label: "Surface Temp (LST)" },
  { id: "ndvi",       label: "NDVI Vegetation Index" },
  { id: "landcover",  label: "Land Cover" },
  { id: "building",   label: "Building Footprints" },
  { id: "road",       label: "Road Network Density" },
  { id: "population", label: "Population Density" },
];

const CELL = 0.001;

function getFieldValue(cell, layerId) {
  switch (layerId) {
    case "lst":        return cell.LST_celsius;
    case "ndvi":       return cell.NDVI;
    case "landcover":  return cell.land_cover;
    case "building":   return cell.bldg_height_idx;
    case "road":       return cell.road_density;
    case "population": return cell.pop_density;
    default:           return 0;
  }
}

function layerColor(val, layerId) {
  if (val == null) return "#1a1a2e";
  switch (layerId) {
    case "lst":
      if (val >= 54) return "#ef4444";
      if (val >= 50) return "#f97316";
      if (val >= 46) return "#eab308";
      if (val >= 42) return "#84cc16";
      if (val >= 38) return "#22d3ee";
      return "#06b6d4";
    case "ndvi":
      if (val > 0.5)  return "#006837";
      if (val > 0.3)  return "#31a354";
      if (val > 0.15) return "#78c679";
      if (val > 0)    return "#c2e699";
      if (val > -0.1) return "#ffffc2";
      return "#d73027";
    case "landcover":
      return { builtup_dense: "#ef4444", builtup_sparse: "#f97316", vegetation: "#22c55e", scrubland: "#eab308", bare: "#a1a1aa" }[val] || "#1a1a2e";
    case "building":
      if (val > 0.6) return "#dc2626";
      if (val > 0.4) return "#f97316";
      if (val > 0.2) return "#fde68a";
      return "#1e3a5f";
    case "road":
      if (val > 0.7) return "#fef08a";
      if (val > 0.5) return "#fde047";
      if (val > 0.3) return "#a3e635";
      if (val > 0.1) return "#86efac";
      return "#1e3a5f";
    case "population":
      if (val > 20000) return "#7c3aed";
      if (val > 10000) return "#a78bfa";
      if (val > 5000)  return "#c4b5fd";
      if (val > 1000)  return "#ddd6fe";
      return "#1e1b4b";
    default:
      return "#1a1a2e";
  }
}

function LayerLegend({ layerId }) {
  const items = {
    lst: [
      { color: "#06b6d4", label: "<38°C" },
      { color: "#22d3ee", label: "38–42" },
      { color: "#84cc16", label: "42–46" },
      { color: "#eab308", label: "46–50" },
      { color: "#f97316", label: "50–54" },
      { color: "#ef4444", label: ">54°C" },
    ],
    ndvi: [
      { color: "#d73027", label: "Water / Bare" },
      { color: "#ffffc2", label: "Low (0–0.15)" },
      { color: "#c2e699", label: "Med (0.15–0.3)" },
      { color: "#78c679", label: "Mod (0.3–0.5)" },
      { color: "#31a354", label: "High (>0.5)" },
    ],
    landcover: [
      { color: "#ef4444", label: "Built-up Dense" },
      { color: "#f97316", label: "Built-up Sparse" },
      { color: "#22c55e", label: "Vegetation" },
      { color: "#eab308", label: "Scrubland" },
      { color: "#a1a1aa", label: "Bare" },
    ],
    building: [
      { color: "#1e3a5f", label: "Low" },
      { color: "#fde68a", label: "Medium" },
      { color: "#f97316", label: "High" },
      { color: "#dc2626", label: "Very High" },
    ],
    road: [
      { color: "#1e3a5f", label: "Low" },
      { color: "#86efac", label: "Moderate" },
      { color: "#a3e635", label: "Medium" },
      { color: "#fde047", label: "High" },
      { color: "#fef08a", label: "Very High" },
    ],
    population: [
      { color: "#1e1b4b", label: "Low" },
      { color: "#ddd6fe", label: "<5K" },
      { color: "#c4b5fd", label: "5–10K" },
      { color: "#a78bfa", label: "10–20K" },
      { color: "#7c3aed", label: ">20K" },
    ],
  };
  const legend = items[layerId] || items.lst;
  return (
    <div className={"flex flex-col gap-1"}>
      {legend.map((item, i) => (
        <div key={i} className={"flex items-center gap-2 text-xs"}>
          <span className={"w-3 h-3 rounded-sm flex-shrink-0"} style={{ backgroundColor: item.color }} />
          <span className={"text-on-surface-variant"}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HeatMapsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "heatmaps");

  const [zones, setZones] = useState([]);
  const [gridCells, setGridCells] = useState([]);
  const [activeLayer, setActiveLayer] = useState("lst");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchHeatmap(), fetchGridHeatmap(2)])
      .then(([heatData, gridData]) => {
        setZones(heatData.zones || []);
        setGridCells(gridData.cells || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cityAvg = useMemo(
    () => zones.length ? zones.reduce((s, z) => s + z.LST_celsius, 0) / zones.length : 0,
    [zones]
  );

  const hottestZone = useMemo(
    () => zones.length ? zones.reduce((a, b) => a.LST_celsius > b.LST_celsius ? a : b) : null,
    [zones]
  );
  const coolestZone = useMemo(
    () => zones.length ? zones.reduce((a, b) => a.LST_celsius < b.LST_celsius ? a : b) : null,
    [zones]
  );

  const gridGeoJson = useMemo(() => ({
    type: "FeatureCollection",
    features: gridCells.map(c => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [c.lon - CELL, c.lat - CELL],
          [c.lon + CELL, c.lat - CELL],
          [c.lon + CELL, c.lat + CELL],
          [c.lon - CELL, c.lat + CELL],
          [c.lon - CELL, c.lat - CELL],
        ]],
      },
      properties: {
        val: getFieldValue(c, activeLayer),
        layer: activeLayer,
      },
    })),
  }), [gridCells, activeLayer]);

  const toggleLayer = (id) => {
    setActiveLayer(id);
  };

  return (
    <div ref={rootRef} className="heatmaps-page bg-background text-on-surface font-body-md selection:bg-primary/30 overflow-hidden">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>
            ThermaCity
          </span>
          <nav className={"hidden md:flex ml-8 gap-6"}>
            <Link to={"/"} className={"text-primary font-bold border-b-2 border-primary py-2 transition-opacity"}>
              Live Status
            </Link>
          </nav>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full transition-colors cursor-pointer active:opacity-80"}>
            notifications
          </button>
          <button className={"material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full transition-colors cursor-pointer active:opacity-80"}>
            account_circle
          </button>
        </div>
      </header>
      <Sidebar />
      <main className={"ml-64 pt-16 h-screen relative flex overflow-hidden"}>
        <div className={"absolute inset-0 z-0"}>
          <MapContainer
            center={[19.015, 72.865]}
            zoom={12}
            className={"w-full h-full"}
            zoomControl={true}
            style={{ background: "#000d26" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {zones.map(z => {
              const riskColor = z.risk_level === "CRITICAL" ? "#ef4444" :
                                z.risk_level === "HIGH" ? "#f97316" : "#00d4b4";
              const isHottest = hottestZone && z.LST_celsius === hottestZone.LST_celsius;
              const icon = L.divIcon({
                className: "custom-zone-marker",
                html: `<div style="background:rgba(15,25,40,0.85);backdrop-filter:blur(4px);border:1px solid ${riskColor};padding:4px 12px;border-radius:999px;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.4)">
                         <span style="width:8px;height:8px;border-radius:50%;background:${riskColor};display:inline-block${isHottest ? ";animation:pulse 2s infinite" : ""}"></span>
                         <span style="font-size:11px;font-weight:700;color:#e8edf5">${z.name}</span>
                       </div>`,
                iconSize: [140, 28],
                iconAnchor: [70, 14],
              });
              return (
                <Marker key={z.zone_id} position={[z.lat, z.lon]} icon={icon}>
                  <Tooltip direction="top" offset={[0, -16]} className={"custom-tooltip"}>
                    <div>
                      <strong>{z.name}</strong><br />
                      <span style={{color: riskColor}}>{z.LST_celsius}°C</span> &middot; {z.risk_level}
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
            <GeoJSON
              key={`${gridCells.length}-${activeLayer}`}
              data={gridGeoJson}
              style={feature => ({
                fillColor: layerColor(feature.properties.val, feature.properties.layer),
                fillOpacity: activeLayer === "lst" ? 0.8 : 0.7,
                weight: 0,
                color: "transparent",
              })}
            />
          </MapContainer>
          <div className={"absolute top-6 right-6 z-20 flex flex-col gap-4"}>
            <div className={"bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant p-4 rounded-lg w-48"}>
              <h4 className={"font-headline-sm text-sm mb-3"}>
                {LAYERS.find(l => l.id === activeLayer)?.label || "Legend"}
              </h4>
              <LayerLegend layerId={activeLayer} />
            </div>
          </div>
        </div>
        <aside className={"w-80 h-full p-4 z-10 pointer-events-none"}>
          <div className={"bg-surface-container-lowest/90 backdrop-blur-2xl border border-outline-variant rounded-xl h-full flex flex-col pointer-events-auto overflow-hidden"}>
            <div className={"p-5 border-b border-outline-variant"}>
              <h3 className={"font-headline-sm text-on-surface flex items-center gap-2"}>
                <span className={"material-symbols-outlined text-primary"}>layers</span>
                Layer Controls
              </h3>
              <p className={"text-on-surface-variant text-body-sm mt-1"}>
                Satellite Visualization Layers
              </p>
            </div>
            <div className={"flex-1 overflow-y-auto p-5 space-y-6"}>
              <div className={"space-y-4"}>
                {LAYERS.map((layer) => (
                  <div key={layer.id} className={"flex items-center justify-between"}>
                    <span className={`font-body-sm ${activeLayer === layer.id ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {layer.label}
                    </span>
                    <button
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${activeLayer === layer.id ? "bg-primary" : "bg-surface-variant"}`}
                      onClick={() => toggleLayer(layer.id)}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${activeLayer === layer.id ? "translate-x-5" : "translate-x-0"}`}></span>
                    </button>
                  </div>
                ))}
              </div>
              <hr className={"border-outline-variant"} />
              <div className={"space-y-3"}>
                <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                  Date Range
                </label>
                <div className={"flex gap-2 items-center"}>
                  <input
                    type={"date"}
                    defaultValue={"2024-03-01"}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary focus:ring-0 [color-scheme:dark]"}
                    onChange={() => {}}
                  />
                  <span className={"text-on-surface-variant text-xs"}>to</span>
                  <input
                    type={"date"}
                    defaultValue={"2024-05-31"}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary focus:ring-0 [color-scheme:dark]"}
                    onChange={() => {}}
                  />
                </div>
              </div>
              <div className={"space-y-3"}>
                <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                  Satellite Source
                </label>
                <select className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm appearance-none focus:border-primary focus:ring-0"}>
                  <option>Landsat 8/9</option>
                  <option>Sentinel-2</option>
                  <option>MODIS Terra</option>
                </select>
              </div>
            </div>
            <div className={"p-5 border-t border-outline-variant"}>
              <button className={"w-full border border-primary text-primary py-3 rounded font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"}>
                <span className={"material-symbols-outlined"}>file_download</span>
                Export Map Data
              </button>
            </div>
          </div>
        </aside>
        <aside className={"absolute right-0 top-0 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest/40 backdrop-blur-sm border-l border-outline-variant translate-x-[75%] hover:translate-x-0 transition-transform duration-500 ease-in-out"}>
          <div className={"p-4 border-b border-outline-variant bg-surface-container-lowest"}>
            <h3 className={"font-headline-sm text-secondary"}>Intelligence Panel</h3>
            <p className={"text-on-surface-variant text-[10px] uppercase"}>Data Density: High</p>
          </div>
          <div className={"p-4 flex-1 overflow-y-auto space-y-6"}>
            <div className={"flex gap-4 border-b border-outline-variant"}>
              <button className={"text-secondary border-b-2 border-secondary font-bold font-data-lg text-sm pb-2"}>Zone Details</button>
              <button className={"text-on-surface-variant font-medium font-data-lg text-sm pb-2 opacity-50"}>AI Insights</button>
            </div>
            <div className={"space-y-4"}>
              {zones.slice(0, 3).map(z => (
                <div key={z.zone_id} className={"p-3 bg-surface-container rounded-lg border border-outline-variant"}>
                  <div className={"flex justify-between items-center mb-1"}>
                    <span className={"font-headline-sm text-sm text-secondary"}>{z.name}</span>
                    <span className={`font-data-sm ${z.risk_level === "CRITICAL" ? "text-error" : "text-primary"}`}>
                      {z.LST_celsius}°C
                    </span>
                  </div>
                  <p className={"text-body-sm text-on-surface-variant leading-relaxed"}>
                    {z.risk_level === "CRITICAL" ? "High albedo surfaces identified. Recommend immediate shade implementation." :
                     z.risk_level === "HIGH" ? "Elevated thermal load. Consider green infrastructure." :
                     "Stable thermal profile. Adequate vegetation cover."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
        <div className={"absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-gutter"}>
          <div className={"bg-surface-container-highest/90 backdrop-blur-3xl border border-outline-variant rounded-full py-4 px-8 flex items-center justify-between shadow-2xl"}>
            <div className={"flex items-center gap-6"}>
              <div className={"flex flex-col"}>
                <span className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>City Average</span>
                <span className={"font-data-lg text-on-surface text-xl"}>{cityAvg.toFixed(1)}°C</span>
              </div>
              <div className={"h-8 w-px bg-outline-variant"}></div>
              <div className={"flex flex-col"}>
                <span className={"font-data-sm text-[10px] text-error uppercase tracking-widest"}>Peak Zone: {hottestZone?.name || "--"}</span>
                <span className={"font-data-lg text-error text-xl"}>{hottestZone?.LST_celsius || "--"}°C</span>
              </div>
              <div className={"h-8 w-px bg-outline-variant"}></div>
              <div className={"flex flex-col"}>
                <span className={"font-data-sm text-[10px] text-primary uppercase tracking-widest"}>Coolest: {coolestZone?.name || "--"}</span>
                <span className={"font-data-lg text-primary text-xl"}>{coolestZone?.LST_celsius || "--"}°C</span>
              </div>
            </div>
            <div className={"flex items-center gap-2 ml-8"}>
              <div className={"px-3 py-1.5 rounded bg-surface-variant text-on-surface-variant font-data-sm border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"}>
                Compare Epochs
              </div>
              <button className={"w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 active:scale-95 transition-all"}>
                <span className={"material-symbols-outlined"}>analytics</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
