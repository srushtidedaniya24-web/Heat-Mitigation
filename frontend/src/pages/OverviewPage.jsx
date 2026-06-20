import { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { fetchHeatmap, fetchRecommendations } from "../services/api";
import "../styles/pages.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function OverviewPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "overview");

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmap()
      .then(data => {
        setZones(data.zones || []);
        if (data.zones?.length) setSelectedZone(data.zones[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchRecommendations(selectedZone.zone_id)
        .then(setRecs)
        .catch(() => setRecs(null));
    }
  }, [selectedZone]);

  const cityAvg = zones.length ? zones.reduce((s, z) => s + z.LST_celsius, 0) / zones.length : 0;

  return (
    <div ref={rootRef} className="overview-page bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant dark:border-outline-variant"}>
        <div className={"flex items-center gap-8"}>
          <h1 className={"font-display-md text-display-md font-bold text-primary dark:text-primary tracking-tight"}>
            ThermaCity
          </h1>
          <div className={"hidden md:flex items-center gap-4 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded"}>
            <span className={"material-symbols-outlined text-primary text-sm"}>
              location_on
            </span>
            <select className={"bg-transparent border-none text-body-sm focus:ring-0 p-0 pr-8 cursor-pointer"}>
              <option>
                Mumbai Metropolitan Region
              </option>
              <option>
                Navi Mumbai
              </option>
              <option>
                Thane District
              </option>
            </select>
          </div>
          <div className={"flex items-center gap-3 px-4 border-l border-outline-variant"}>
            <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>
              Temporal Range
            </span>
            <span className={"font-data-sm text-data-sm text-primary"}>
              May 2024 - Jun 2024
            </span>
          </div>
        </div>
        <div className={"flex items-center gap-4"}>
          <div className={"flex items-center gap-2 bg-on-primary-container/10 border border-primary/20 px-3 py-1 rounded-full"}>
            <span className={"relative flex h-2 w-2"}>
              <span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"}></span>
              <span className={"relative inline-flex rounded-full h-2 w-2 bg-primary"}></span>
            </span>
            <span className={"font-data-sm text-data-sm font-bold text-primary"}>
              LIVE
            </span>
          </div>
          <div className={"flex items-center gap-2"}>
            <button className={"p-2 hover:bg-surface-variant/50 transition-colors rounded-full cursor-pointer"}>
              <span className={"material-symbols-outlined text-on-surface-variant"}>
                notifications
              </span>
            </button>
            <button className={"p-2 hover:bg-surface-variant/50 transition-colors rounded-full cursor-pointer"}>
              <span className={"material-symbols-outlined text-on-surface-variant"}>
                account_circle
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className={"flex flex-1 pt-16 h-full overflow-hidden"}>
        <Sidebar />
        <main className={"relative flex-1 bg-surface-container-lowest overflow-hidden"}>
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
              const isHottest = zones.length && z.LST_celsius === Math.max(...zones.map(x => x.LST_celsius));
              const icon = L.divIcon({
                className: "custom-zone-marker",
                html: isHottest
                  ? `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                       <div style="position:relative;display:flex;align-items:center;justify-content:center">
                         <div style="position:absolute;width:32px;height:32px;background:${riskColor};border-radius:50%;opacity:0.3;animation:pulse 2s infinite"></div>
                         <div style="width:16px;height:16px;background:${riskColor};border-radius:50%;border:2px solid white"></div>
                       </div>
                       <div style="background:rgba(15,25,40,0.9);backdrop-filter:blur(8px);border:1px solid ${riskColor};padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5)">
                         <span style="font-size:13px;font-weight:700;color:#e8edf5">${z.name}</span>
                         <span style="font-size:16px;font-weight:700;color:${riskColor}">${z.LST_celsius}°C</span>
                       </div>
                     </div>`
                  : `<div style="background:rgba(15,25,40,0.85);backdrop-filter:blur(4px);border:1px solid ${riskColor};padding:4px 12px;border-radius:999px;display:flex;align-items:center;gap:6px;transition:transform 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.4)">
                       <span style="width:8px;height:8px;border-radius:50%;background:${riskColor};display:inline-block"></span>
                       <span style="font-size:11px;font-weight:700;color:#e8edf5">${z.name}: ${z.LST_celsius}°C</span>
                     </div>`,
                iconSize: isHottest ? [200, 64] : [160, 28],
                iconAnchor: isHottest ? [100, 64] : [80, 14],
              });
              return (
                <Marker
                  key={z.zone_id}
                  position={[z.lat, z.lon]}
                  icon={icon}
                  eventHandlers={{ click: () => setSelectedZone(z) }}
                />
              );
            })}
          </MapContainer>
          <div className={"absolute top-6 left-6 flex flex-col gap-2 z-[1000]"}>
            <div className={"bg-surface-container-low/90 backdrop-blur border border-outline-variant rounded p-1 flex flex-col"}>
              <button className={"p-2 bg-primary/20 text-primary rounded mb-1"}>
                <span className={"material-symbols-outlined"}>
                  thermostat
                </span>
              </button>
              <button className={"p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded mb-1"}>
                <span className={"material-symbols-outlined"}>
                  satellite
                </span>
              </button>
              <button className={"p-2 text-on-surface-variant hover:bg-surface-variant/50 rounded"}>
                <span className={"material-symbols-outlined"}>
                  map
                </span>
              </button>
            </div>
          </div>
          <div className={"absolute top-6 right-6 flex flex-col items-center gap-3 z-[1000]"}>
            <div className={"bg-surface-container-low/90 backdrop-blur border border-outline-variant p-3 rounded-xl flex flex-col items-center"}>
              <span className={"font-data-sm text-[10px] mb-2 text-on-surface-variant"}>
                60°C
              </span>
              <div className={"w-3 h-48 thermal-gradient rounded-full"}></div>
              <span className={"font-data-sm text-[10px] mt-2 text-on-surface-variant"}>
                20°C
              </span>
            </div>
          </div>
          <div className={"absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl bg-surface-container-low/95 backdrop-blur border border-outline-variant p-4 rounded-xl shadow-2xl z-[1000]"}>
            <div className={"flex items-center justify-between mb-3 px-2"}>
              <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                08:00 AM
              </span>
              <span className={"font-data-sm text-data-sm text-primary font-bold"}>
                02:45 PM (PEAK)
              </span>
              <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                10:00 PM
              </span>
            </div>
            <div className={"relative h-2 bg-surface-variant rounded-full overflow-hidden"}>
              <div className={"absolute top-0 left-0 h-full w-[65%] bg-primary"}></div>
              <div className={"absolute top-1/2 left-[65%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary cursor-pointer"}></div>
            </div>
          </div>
        </main>
        <aside className={"w-80 z-40 flex flex-col bg-surface-container-lowest border-l border-outline-variant overflow-y-auto custom-scrollbar shrink-0"}>
          <div className={"p-6 border-b border-outline-variant"}>
            <div className={"flex items-center justify-between mb-4"}>
              <h2 className={"font-headline-sm text-headline-sm text-on-surface tracking-wide uppercase"}>
                {selectedZone?.name || "Select a zone"}
              </h2>
              <span className={"material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface"}>
                close
              </span>
            </div>
            <div className={"flex flex-col items-center py-4 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-6"}>
              <div className={"relative mb-2"}>
                <div className={"absolute -inset-4 rounded-full border border-error/20 pulse-ring"}></div>
                <span className={"font-data-lg text-[42px] leading-tight text-error tracking-tighter"}>
                  {selectedZone?.LST_celsius || "--"}°C
                </span>
              </div>
              <span className={"font-data-sm text-data-sm text-error/80 uppercase tracking-widest"}>
                Surface Temp
              </span>
            </div>
            <div className={"space-y-4"}>
              <div className={"flex justify-between items-end"}>
                <span className={"font-body-sm text-on-surface-variant"}>
                  Heat Risk Index
                </span>
                <span className={"font-data-lg text-error"}>
                  {selectedZone?.heat_risk_index ?? "--"}/10
                </span>
              </div>
              <div className={"h-2 w-full bg-surface-variant rounded-full overflow-hidden"}>
                <div className={"h-full bg-error"} style={{width: `${(selectedZone?.heat_risk_index ?? 0) * 10}%`}}></div>
              </div>
              <div className={"flex gap-2 pt-2"}>
                <span className={"px-2 py-0.5 bg-error/10 border border-error/40 text-error text-[10px] font-bold rounded"}>
                  {selectedZone?.risk_level || "--"}
                </span>
                <span className={"px-2 py-0.5 bg-on-surface-variant/10 border border-on-surface-variant/40 text-on-surface-variant text-[10px] font-bold rounded"}>
                  POP: {selectedZone?.population?.toLocaleString() || "--"}
                </span>
              </div>
            </div>
          </div>
          <div className={"p-6 border-b border-outline-variant bg-surface-container-low/30"}>
            <div className={"flex items-center gap-2 mb-4"}>
              <span className={"material-symbols-outlined text-primary text-xl"}>
                psychology
              </span>
              <h3 className={"font-body-md font-bold text-on-surface"}>
                AI/ML Insights
              </h3>
            </div>
            {recs?.top_heat_drivers ? (
              <>
                <ul className={"space-y-3 mb-6"}>
                  {recs.top_heat_drivers.slice(0, 3).map((d, i) => (
                    <li key={i} className={"flex items-start gap-3"}>
                      <span className={"material-symbols-outlined text-error text-lg mt-0.5"}>
                        warning
                      </span>
                      <p className={"font-body-sm text-on-surface-variant"}>
                        <span className={"text-on-surface font-medium"}>{d.feature.replace(/_/g, " ")}</span>
                        {" "}contributing +{d.contribution_C}°C.
                      </p>
                    </li>
                  ))}
                  {recs.recommendations?.filter(r => r.recommended).slice(0, 1).map((r, i) => (
                    <li key={`rec-${i}`} className={"flex items-start gap-3"}>
                      <span className={"material-symbols-outlined text-primary text-lg mt-0.5"}>
                        check_circle
                      </span>
                      <p className={"font-body-sm text-on-surface-variant"}>
                        <span className={"text-on-surface font-medium"}>{r.label}</span>
                        {" "}could mitigate up to {Math.abs(r.reduction_C)}°C.
                      </p>
                    </li>
                  ))}
                </ul>
                <div className={"space-y-3"}>
                  <h4 className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-2"}>
                    SHAP Feature Importance
                  </h4>
                  <div className={"space-y-2"}>
                    {recs.top_heat_drivers.slice(0, 5).map((d, i) => {
                      const absVal = Math.abs(d.contribution_C);
                      const maxVal = Math.max(...recs.top_heat_drivers.map(x => Math.abs(x.contribution_C)), 1);
                      return (
                        <div key={i} className={"flex items-center gap-3"}>
                          <span className={"w-20 font-data-sm text-[10px] truncate"}>
                            {d.feature.replace(/_/g, " ")}
                          </span>
                          <div className={"flex-1 h-3 bg-error/20 rounded overflow-hidden"}>
                            <div className={"h-full bg-error"} style={{width: `${(absVal / maxVal) * 100}%`}}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className={"text-center text-on-surface-variant py-6"}>
                {loading ? "Loading..." : "Select a zone to see insights"}
              </div>
            )}
          </div>
          <div className={"p-6"}>
            <div className={"flex items-center gap-2 mb-4"}>
              <span className={"material-symbols-outlined text-secondary text-xl"}>
                ac_unit
              </span>
              <h3 className={"font-body-md font-bold text-on-surface"}>
                Intervention Simulator
              </h3>
            </div>
            <div className={"space-y-4 mb-6"}>
              <div>
                <label className={"block font-data-sm text-[10px] text-on-surface-variant uppercase mb-2"}>
                  Select Strategy
                </label>
                <select className={"w-full bg-surface-container border border-outline-variant rounded p-2 text-body-sm focus:border-primary outline-none"}>
                  <option>
                    Cool Roofs (Reflective)
                  </option>
                  <option>
                    Urban Reforestation
                  </option>
                  <option>
                    Permeable Paving
                  </option>
                </select>
              </div>
              <div>
                <div className={"flex justify-between mb-2"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase"}>
                    Implementation Coverage
                  </label>
                  <span className={"font-data-sm text-primary"}>
                    65%
                  </span>
                </div>
                <input className={"w-full h-1 bg-surface-variant rounded-full appearance-none cursor-pointer accent-primary"} type={"range"} defaultValue={"65"} />
              </div>
              <button className={"w-full py-3 bg-primary text-on-primary font-bold text-body-sm rounded hover:brightness-110 transition-all flex items-center justify-center gap-2"}>
                <span className={"material-symbols-outlined text-sm"}>
                  play_arrow
                </span>
                RUN SIMULATION
              </button>
            </div>
            <div className={"bg-primary/10 border border-primary/30 p-4 rounded-lg"}>
              <h4 className={"font-data-sm text-[10px] text-primary uppercase mb-3 font-bold"}>
                Predicted Outcome
              </h4>
              <div className={"flex items-center justify-between mb-4"}>
                <div className={"text-center"}>
                  <p className={"font-data-sm text-[10px] text-on-surface-variant"}>
                    Current
                  </p>
                  <p className={"font-data-lg text-on-surface"}>
                    56.8°C
                  </p>
                </div>
                <span className={"material-symbols-outlined text-primary"}>
                  trending_down
                </span>
                <div className={"text-center"}>
                  <p className={"font-data-sm text-[10px] text-on-surface-variant"}>
                    Simulated
                  </p>
                  <p className={"font-data-lg text-primary"}>
                    44.3°C
                  </p>
                </div>
              </div>
              <div className={"grid grid-cols-2 gap-4 border-t border-primary/20 pt-3"}>
                <div>
                  <p className={"font-data-sm text-[10px] text-on-surface-variant uppercase"}>
                    Reduction
                  </p>
                  <p className={"font-body-md font-bold text-primary"}>
                    -12.5°C
                  </p>
                </div>
                <div>
                  <p className={"font-data-sm text-[10px] text-on-surface-variant uppercase"}>
                    Est. Cost
                  </p>
                  <p className={"font-body-md font-bold text-on-surface"}>
                    ₹2.4 Cr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
