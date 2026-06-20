import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { fetchInterventions, fetchZones } from "../services/api";

export default function MaterialsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "materials");

  const [materials, setMaterials] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [zoneName, setZoneName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZones().then(data => setZones(data.zones || [])).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchInterventions(100, selectedZoneId)
      .then(data => {
        setMaterials(data.materials || []);
        setZoneName(data.zone || "Unknown");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedZoneId]);

  const top = materials[0] || {};

  return (
    <div ref={rootRef} className="materials-page bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary overflow-hidden">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>
            ThermaCity
          </span>
          <nav className={"hidden md:flex ml-8 gap-6"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>
              Overview
            </Link>
            <Link to={"/materials"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Materials
            </Link>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>
              Live Status
            </Link>
          </nav>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded transition-colors"} data-icon={"notifications"}>
            notifications
          </button>
          <button className={"material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded transition-colors"} data-icon={"account_circle"}>
            account_circle
          </button>
        </div>
      </header>
      <Sidebar />
      <aside className={"fixed right-0 top-16 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest border-l border-outline-variant"}>
        <div className={"p-6 border-b border-outline-variant"}>
          <h3 className={"font-display-md text-headline-sm text-primary"}>
            Intelligence Panel
          </h3>
          <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
            Data Density: High
          </p>
        </div>
        <div className={"flex-1 overflow-y-auto p-4 space-y-6"}>
          <section>
            <div className={"flex items-center justify-between mb-4"}>
              <span className={"font-data-sm text-data-sm text-secondary uppercase tracking-widest"}>
                Active Analysis
              </span>
              <span className={"material-symbols-outlined text-secondary"} data-icon={"psychology"}>
                psychology
              </span>
            </div>
            <div className={"space-y-4"}>
              <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                <p className={"font-body-sm text-body-sm mb-2"}>
                  {loading ? "Loading..." : `Cooling efficiency is highest using ${top.label} in ${zoneName}, reducing surface temperature by ${Math.abs(top.reduction_C).toFixed(1)}°C.`}
                </p>
                <div className={"flex items-center gap-2 text-primary font-data-sm text-data-sm"}>
                  <span className={"material-symbols-outlined text-sm"} data-icon={"trending_up"}>
                    trending_up
                  </span>
                  +{Math.abs(top.reduction_C).toFixed(1)}°C Net Improvement
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className={"flex items-center justify-between mb-4"}>
              <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>
                Material Telemetry
              </span>
              <span className={"material-symbols-outlined text-on-surface-variant"} data-icon={"ac_unit"}>
                ac_unit
              </span>
            </div>
            <div className={"space-y-2"}>
              <div className={"flex justify-between items-center text-sm"}>
                <span className={"text-on-surface-variant"}>
                  Surface Albedo Avg
                </span>
                <span className={"font-data-lg text-data-lg text-on-surface"}>
                  {materials.length ? (materials.reduce((s, m) => s + m.albedo_change, 0) / materials.length).toFixed(2) : "--"}
                </span>
              </div>
              <div className={"w-full bg-surface-variant h-1 rounded-full overflow-hidden"}>
                <div className={"bg-primary h-full"} style={{"width": `${Math.min(100, (materials.reduce((s, m) => s + m.albedo_change, 0) / materials.length / 0.55) * 100)}%`}}></div>
              </div>
              <div className={"flex justify-between items-center text-sm mt-4"}>
                <span className={"text-on-surface-variant"}>
                  Thermal Mitigation Rate
                </span>
                <span className={"font-data-lg text-data-lg text-on-surface"}>
                  {Math.round((top.reduction_C / 15) * 100)}%
                </span>
              </div>
              <div className={"w-full bg-surface-variant h-1 rounded-full overflow-hidden"}>
                <div className={"bg-secondary h-full"} style={{"width": `${Math.min(100, (top.reduction_C / 15) * 100)}%`}}></div>
              </div>
            </div>
          </section>
        </div>
      </aside>
      <main className={"ml-64 mr-80 mt-16 p-container-padding overflow-y-auto h-[calc(100vh-64px)] scroll-smooth"}>
        {loading ? (
          <div className={"flex items-center justify-center h-64"}>
            <span className={"text-on-surface-variant"}>Loading intervention data...</span>
          </div>
        ) : (
          <>
            <div className={"grid grid-cols-5 gap-panel-gap mb-8"}>
              {materials.slice(0, 5).map(m => (
                <div key={m.id} className={"glass-panel p-4 rounded-xl flex flex-col items-center text-center"}>
                  <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-wider mb-2"}>
                    {m.label}
                  </span>
                  <div className={"font-display-md text-primary text-3xl font-bold"}>
                    {m.reduction_C > 0 ? `-${Math.abs(m.reduction_C).toFixed(1)}°C` : `${m.reduction_C.toFixed(1)}°C`}
                  </div>
                  <div className={"thermal-pill w-16 mt-2 opacity-50"}></div>
                </div>
              ))}
            </div>
            <div className={"glass-panel rounded-xl overflow-hidden mb-8 border border-outline-variant"}>
              <div className={"p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/30"}>
                <h3 className={"font-headline-sm text-headline-sm"}>
                  Material Intervention Matrix
                </h3>
                <div className={"flex gap-2"}>
                  <span className={"text-xs text-on-surface-variant"}>
                    Simulated on <strong>{zoneName}</strong>
                  </span>
                  <button className={"bg-surface-variant text-on-surface px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 hover:bg-surface-variant/80 transition-colors"}>
                    <span className={"material-symbols-outlined text-sm"} data-icon={"filter_list"}>
                      filter_list
                    </span>
                    Filter
                  </button>
                </div>
              </div>
              <div className={"overflow-x-auto"}>
                <table className={"w-full text-left font-body-sm"}>
                  <thead className={"bg-surface-container-lowest text-on-surface-variant uppercase text-[10px] tracking-widest font-bold"}>
                    <tr>
                      <th className={"px-6 py-4"}>Material</th>
                      <th className={"px-4 py-4"}>Albedo Δ</th>
                      <th className={"px-4 py-4"}>Before</th>
                      <th className={"px-4 py-4 text-primary"}>After ↓</th>
                      <th className={"px-4 py-4"}>Cost (₹/m²)</th>
                      <th className={"px-4 py-4"}>Durability</th>
                      <th className={"px-4 py-4"}>CO2 Impact</th>
                      <th className={"px-6 py-4 text-center"}>Recommended</th>
                    </tr>
                  </thead>
                  <tbody className={"divide-y divide-outline-variant"}>
                    {materials.map((m, i) => (
                      <tr key={m.id} className={`hover:bg-surface-variant/20 transition-colors ${m.recommended ? "border-l-4 border-primary" : ""}`}>
                        <td className={"px-6 py-4 font-semibold text-on-surface"}>{m.label}</td>
                        <td className={"px-4 py-4 font-data-sm"}>+{m.albedo_change}</td>
                        <td className={"px-4 py-4 font-data-sm"}>{m.temp_before}°C</td>
                        <td className={"px-4 py-4 font-data-lg text-primary"}>
                          {m.reduction_C > 0 ? `-${Math.abs(m.reduction_C).toFixed(1)}°C` : `${m.reduction_C.toFixed(1)}°C`}
                        </td>
                        <td className={"px-4 py-4 font-data-sm"}>₹{m.cost_per_sqm.toLocaleString()}</td>
                        <td className={"px-4 py-4"}>{m.durability}</td>
                        <td className={"px-4 py-4"}>
                          <span className={m.co2_impact === "Neg" || m.co2_impact === "Low" ? "text-primary" : "text-tertiary"}>●</span>
                          {" "}{m.co2_impact}
                        </td>
                        <td className={"px-6 py-4 text-center"}>
                          {m.recommended ? (
                            <span className={"material-symbols-outlined text-primary"} data-icon={"check_circle"} style={{"fontVariationSettings": "'FILL' 1"}}>
                              check_circle
                            </span>
                          ) : (
                            <span className={"material-symbols-outlined text-on-surface-variant"} data-icon={"info"}>
                              info
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className={"hover:bg-surface-variant/20 transition-colors bg-error-container/10"}>
                      <td className={"px-6 py-4 font-semibold text-on-surface"}>Conventional Asphalt</td>
                      <td className={"px-4 py-4 font-data-sm"}>0.00</td>
                      <td className={"px-4 py-4 font-data-sm"}>{top.temp_before || "--"}°C</td>
                      <td className={"px-4 py-4 font-data-lg text-secondary"}>0.0°C</td>
                      <td className={"px-4 py-4 font-data-sm"}>₹1,500</td>
                      <td className={"px-4 py-4"}>Med-High</td>
                      <td className={"px-4 py-4"}><span className={"text-error"}>●</span> High</td>
                      <td className={"px-6 py-4 text-center"}>
                        <span className={"material-symbols-outlined text-error"} data-icon={"cancel"} style={{"fontVariationSettings": "'FILL' 1"}}>
                          cancel
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className={"glass-panel p-6 rounded-xl border border-outline-variant"}>
              <div className={"flex items-center justify-between mb-6 flex-wrap gap-3"}>
                <h3 className={"font-headline-sm text-headline-sm"}>
                  Cooling Potential by Intervention Strategy
                </h3>
                <div className={"flex items-center gap-3"}>
                  <span className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                    Zone
                  </span>
                  <select
                    className={"bg-surface-container border border-outline-variant rounded-lg py-1.5 px-3 text-body-sm focus:border-primary outline-none cursor-pointer"}
                    value={selectedZoneId || ""}
                    onChange={e => setSelectedZoneId(e.target.value || null)}
                  >
                    <option value="">Hottest zone (auto)</option>
                    {zones.map(z => (
                      <option key={z.zone_id} value={z.zone_id}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {loading ? (
                <div className={"text-center text-on-surface-variant py-8"}>Loading...</div>
              ) : (
                <>
              <div className={"space-y-6"}>
                {materials.map((m, i) => {
                  const pct = Math.max(3, Math.min(100, (Math.abs(m.reduction_C) / 10) * 100));
                  const colors = ["bg-primary", "bg-primary/80", "bg-tertiary", "bg-tertiary/80", "bg-tertiary-container"];
                  const label = ["Critical Impact Zone", "High Impact", "Moderate Impact", "Low Impact", "Minimal Impact"];
                  return (
                    <div key={m.id} className={"group"}>
                      <div className={"flex justify-between items-center mb-2"}>
                        <span className={"font-display-md text-sm font-medium text-on-surface"}>{m.label}</span>
                        <span className={`font-data-lg ${i < 2 ? "text-primary" : i < 3 ? "text-tertiary" : "text-on-tertiary-container"}`}>
                          {m.reduction_C > 0 ? `-${Math.abs(m.reduction_C).toFixed(1)}°C` : `${m.reduction_C.toFixed(1)}°C`}
                        </span>
                      </div>
                      <div className={"w-full bg-surface-container h-8 rounded-md overflow-hidden relative border border-outline-variant/30"}>
                        <div className={`h-full ${colors[i % colors.length]} transition-all duration-1000 ease-out`} style={{"width": `${pct}%`}}></div>
                        <div className={"absolute inset-0 flex items-center px-4 mix-blend-difference pointer-events-none"}>
                          <span className={"text-[10px] font-bold tracking-tighter uppercase text-white"}>
                            {i === 0 ? label[i] : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={"mt-8 flex justify-between text-[10px] font-data-sm text-on-surface-variant uppercase tracking-[0.2em]"}>
                <span>0°C</span>
                <span>{(10 / 3).toFixed(1)}°C</span>
                <span>{((10 / 3) * 2).toFixed(1)}°C</span>
                <span>10.0°C+</span>
              </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
