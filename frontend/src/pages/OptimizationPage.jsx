import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { fetchZones, fetchInterventions, simulateIntervention, fetchRecommendations } from "../services/api";
import "../styles/pages.css";
import { useSettings } from "../contexts/SettingsContext";
import { formatTemp } from "../utils/formatUtils";

const INTERVENTION_LABELS = {
  cool_roofs: "Cool Roof Coating",
  cool_pavements: "Cool Pavement",
  high_albedo_paint: "High-Albedo Paint",
  green_roofs: "Green Roof",
  urban_greening: "Urban Greening",
};

export default function OptimizationPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "optimization");
  const { settings } = useSettings();

  const [zones, setZones] = useState([]);
  const [intvByZone, setIntvByZone] = useState({});
  const [zoneConfigs, setZoneConfigs] = useState({});
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [recs, setRecs] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    fetchZones().then(data => {
      setZones(data.zones || []);
      const configs = {};
      (data.zones || []).forEach(z => {
        configs[z.zone_id] = { intervention: "cool_roofs", coverage_pct: 50 };
      });
      setZoneConfigs(configs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (zones.length === 0) return;
    zones.forEach(z => {
      fetchInterventions(50, z.zone_id).then(data => {
        setIntvByZone(prev => ({ ...prev, [z.zone_id]: data.materials || [] }));
      }).catch(() => {});
    });
  }, [zones]);

  useEffect(() => {
    if (!selectedZone) return;
    fetchRecommendations(selectedZone.zone_id).then(setRecs).catch(() => setRecs(null));
  }, [selectedZone]);

  const totalInvestment = Object.values(results).reduce((s, r) => s + (r.total_cost_INR || 0), 0);
  const totalReduction = Object.values(results).reduce((s, r) => s + (r.reduction_C || 0), 0);
  const avgReduction = Object.keys(results).length > 0 ? totalReduction / Object.keys(results).length : 0;
  const popBenefited = Object.keys(results).reduce((s, zid) => {
    const z = zones.find(zz => zz.zone_id === zid);
    return s + (z?.population || 0);
  }, 0);

  const runSim = async () => {
    setRunning(true);
    const newResults = {};
    for (const z of zones) {
      const cfg = zoneConfigs[z.zone_id];
      if (!cfg) continue;
      try {
        const res = await simulateIntervention(z.zone_id, cfg.intervention, cfg.coverage_pct);
        newResults[z.zone_id] = res;
      } catch (e) {
        newResults[z.zone_id] = { error: e.message };
      }
    }
    setResults(newResults);
    setRunning(false);
  };

  return (
    <div ref={rootRef} className="optimization-page bg-background text-on-surface font-body-md overflow-hidden">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant dark:border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary dark:text-primary tracking-tight"}>ThermaCity</span>
          <div className={"hidden md:flex gap-6 ml-8"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-2 py-1"}>Live Status</Link>
          </div>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined text-primary hover:bg-surface-variant/50 p-2 transition-colors cursor-pointer active:opacity-80"}>notifications</button>
          <button className={"material-symbols-outlined text-primary hover:bg-surface-variant/50 p-2 transition-colors cursor-pointer active:opacity-80"}>account_circle</button>
        </div>
      </header>
      <Sidebar />
      <main className={"ml-64 mr-80 mt-16 p-gutter h-[calc(100vh-64px)] overflow-y-auto"}>
        <div className={"max-w-layout-max-width mx-auto flex flex-col gap-6"}>
          <div className={"flex justify-between items-end"}>
            <div>
              <h1 className={"font-display-md text-display-md text-primary mb-2"}>City-Wide Intervention Planner</h1>
              <p className={"text-on-surface-variant max-w-2xl"}>Simulate thermal mitigation strategies across urban zones. Adjust parameters to optimize temperature reduction vs. economic investment.</p>
            </div>
            <div className={"flex gap-3"}>
              <button onClick={runSim} disabled={running || loading} className={"bg-primary text-on-primary px-6 py-2 font-bold hover:brightness-110 transition-all flex items-center gap-2 rounded disabled:opacity-40"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  {running ? "hourglass_top" : "play_arrow"}
                </span>
                <span>{running ? "Running..." : "Run Full Sim"}</span>
              </button>
            </div>
          </div>

          <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"}>
            <table className={"w-full border-collapse"}>
              <thead className={"bg-surface-container text-on-surface-variant"}>
                <tr>
                  <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Zone</th>
                  <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Intervention Type</th>
                  <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Coverage</th>
                  <th className={"text-right py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Proj. &Delta;T</th>
                  <th className={"text-right py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Est. Cost</th>
                  <th className={"text-center py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Status</th>
                </tr>
              </thead>
              <tbody className={"divide-y divide-outline-variant"}>
                {loading ? (
                  <tr><td colSpan={6} className={"py-8 text-center text-on-surface-variant"}>Loading zones...</td></tr>
                ) : zones.length === 0 ? (
                  <tr><td colSpan={6} className={"py-8 text-center text-on-surface-variant"}>No zones available</td></tr>
                ) : zones.map(z => {
                  const cfg = zoneConfigs[z.zone_id] || {};
                  const intvs = intvByZone[z.zone_id] || [];
                  const res = results[z.zone_id];
                  const deltaT = res ? res.reduction_C : null;
                  const cost = res ? res.total_cost_INR : null;
                  const isError = res?.error;
                  return (
                    <tr key={z.zone_id} className={"hover:bg-surface-container-low transition-colors group cursor-pointer " + (selectedZone?.zone_id === z.zone_id ? "bg-surface-container-high" : "")} onClick={() => setSelectedZone(z)}>
                      <td className={"py-4 px-6 font-headline-sm text-headline-sm text-on-surface"}>{z.name}</td>
                      <td className={"py-4 px-6"}>
                        <select value={cfg.intervention || "cool_roofs"}
                          onChange={e => setZoneConfigs(prev => ({ ...prev, [z.zone_id]: { ...prev[z.zone_id], intervention: e.target.value } }))}
                          className={"bg-surface-container-high border-outline-variant text-on-surface text-body-sm p-1 px-2 rounded w-full focus:border-primary outline-none appearance-none cursor-pointer"}>
                          {(intvs.length > 0 ? intvs : Object.keys(INTERVENTION_LABELS).map(id => ({ id, label: INTERVENTION_LABELS[id] }))).map(iv => (
                            <option key={iv.id} value={iv.id}>{iv.label || INTERVENTION_LABELS[iv.id] || iv.id}</option>
                          ))}
                        </select>
                      </td>
                      <td className={"py-4 px-6 min-w-[200px]"}>
                        <div className={"flex items-center gap-4"}>
                          <input type={"range"} min={10} max={100} step={5} value={cfg.coverage_pct || 50}
                            onChange={e => setZoneConfigs(prev => ({ ...prev, [z.zone_id]: { ...prev[z.zone_id], coverage_pct: Number(e.target.value) } }))}
                            className={"flex-1 accent-secondary cursor-pointer"} />
                          <span className={"font-data-sm text-data-sm text-primary w-8 text-right"}>{cfg.coverage_pct || 50}%</span>
                        </div>
                      </td>
                      <td className={"py-4 px-6 text-right"}>
                        {deltaT !== null ? (
                          <div className={"inline-flex items-center gap-1 font-data-lg text-data-lg " + (deltaT < 0 ? "text-error" : "text-secondary")}>
                            <span>{deltaT > 0 ? "-" : "+"}{Math.abs(deltaT).toFixed(1)}°C</span>
                          </div>
                        ) : (
                          <span className={"text-on-surface-variant text-sm"}>—</span>
                        )}
                      </td>
                      <td className={"py-4 px-6 text-right font-data-lg text-data-lg"}>
                        {cost !== null ? `₹${(cost / 1e7).toFixed(1)}Cr` : <span className={"text-on-surface-variant text-sm"}>—</span>}
                      </td>
                      <td className={"py-4 px-6 text-center"}>
                        {isError ? (
                          <span className={"bg-error/10 border border-error/40 text-error px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>Error</span>
                        ) : deltaT !== null ? (
                          <span className={"bg-primary/10 border border-primary/40 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>Simulated</span>
                        ) : (
                          <span className={"bg-surface-variant/20 border border-outline-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={"bg-surface-container-highest border border-primary/20 rounded-xl p-6 flex flex-wrap items-center justify-between gap-8"}>
            <div className={"flex items-center gap-10"}>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>Total Investment</p>
                <p className={"font-display-md text-display-md text-on-surface"}>₹{(totalInvestment / 1e7).toFixed(1)} Cr</p>
              </div>
              <div className={"w-px h-12 bg-outline-variant"}></div>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>Avg Reduction</p>
                <p className={"font-display-md text-display-md text-primary"}>{avgReduction.toFixed(1)}°C</p>
              </div>
              <div className={"w-px h-12 bg-outline-variant"}></div>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>Pop. Benefited</p>
                <p className={"font-display-md text-display-md text-on-surface"}>{popBenefited.toLocaleString()}</p>
              </div>
              <div className={"w-px h-12 bg-outline-variant"}></div>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>Zones Simulated</p>
                <div className={"flex items-baseline gap-2"}>
                  <p className={"font-display-md text-display-md text-on-surface"}>{Object.keys(results).length}</p>
                  <span className={"font-headline-sm text-headline-sm text-on-surface-variant"}>/ {zones.length}</span>
                </div>
              </div>
            </div>
            <button onClick={() => { if (Object.keys(results).length === 0) return; const rows = zones.filter(z => results[z.zone_id] && !results[z.zone_id].error).map(z => { const r = results[z.zone_id]; return `${z.name},${r.intervention},${r.coverage_pct}%,${r.temp_before_C}°C,${r.temp_after_C}°C,${r.reduction_C}°C,₹${(r.total_cost_INR/1e7).toFixed(1)}Cr`; }).join("\n"); const csv = "Zone,Intervention,Coverage,Temp Before,Temp After,Reduction,Cost\n" + rows; const blob = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "optimization_report.csv"; a.click(); }} disabled={Object.keys(results).length === 0} className={"bg-primary text-on-primary h-16 px-8 rounded-lg font-bold text-lg flex items-center gap-3 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"}>
              <span className={"material-symbols-outlined"}>summarize</span>
              Generate Optimization Report
            </button>
          </div>

          <div className={"grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 relative"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <div className={"flex justify-between items-center mb-4"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"w-2 h-2 rounded-full bg-error animate-pulse"}></span>
                  Current Thermal Density
                </h3>
                <span className={"font-data-sm text-data-sm text-on-error bg-error/20 px-2 py-0.5 rounded"}>High Stress</span>
              </div>
              <div className={"relative aspect-video rounded-lg overflow-hidden border border-outline-variant p-4 bg-surface"}>
                {Object.keys(results).length > 0 ? (
                  <div className={"h-full flex flex-col justify-center"}>
                    <div className={"flex items-center gap-3 mb-3"}>
                      <div className={"flex items-center gap-1.5 text-xs"}><span className={"w-3 h-3 rounded bg-error"}></span>Current</div>
                      <div className={"flex items-center gap-1.5 text-xs"}><span className={"w-3 h-3 rounded bg-secondary"}></span>Projected</div>
                    </div>
                    <div className={"space-y-2"}>
                      {zones.filter(z => results[z.zone_id] && !results[z.zone_id].error).map(z => {
                        const r = results[z.zone_id];
                        const maxT = Math.max(...Object.values(results).filter(v => !v.error).map(v => Math.max(v.temp_before_C, v.temp_after_C)), 45);
                        const minT = Math.min(...Object.values(results).filter(v => !v.error).map(v => Math.min(v.temp_before_C, v.temp_after_C)), 30);
                        const range = maxT - minT || 1;
                        return (
                          <div key={z.zone_id} className={"flex items-center gap-2 text-[10px]"}>
                            <span className={"w-16 truncate text-on-surface-variant"}>{z.name}</span>
                            <div className={"flex-1 h-4 bg-surface-container rounded relative overflow-hidden"}>
                              <div className={"absolute inset-y-0 left-0 bg-error/70 rounded"} style={{ width: `${(r.temp_before_C - minT) / range * 100}%` }}></div>
                              <div className={"absolute inset-y-0 left-0 bg-secondary/70 rounded"} style={{ width: `${(r.temp_after_C - minT) / range * 100}%` }}></div>
                              <span className={"absolute inset-0 flex items-center justify-center text-[9px] font-bold text-on-surface mix-blend-difference"}>
                                {formatTemp(r.temp_before_C, settings.temperature_unit)} → {formatTemp(r.temp_after_C, settings.temperature_unit)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={"h-full flex items-center justify-center"}>
                    <p className={"text-on-surface-variant text-sm opacity-60"}>Run simulation to see comparison</p>
                  </div>
                )}
              </div>
            </div>
            <div className={"hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center"}>
              <div className={"bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border border-primary"}>
                <span className={"material-symbols-outlined text-[16px]"}>trending_down</span>
                {avgReduction.toFixed(1)}°C average
              </div>
              <div className={"w-px h-12 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50"}></div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <div className={"flex justify-between items-center mb-4"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"w-2 h-2 rounded-full bg-primary"}></span>
                  Projected Optimization
                </h3>
                <span className={"font-data-sm text-data-sm text-primary bg-primary/20 px-2 py-0.5 rounded"}>Optimized</span>
              </div>
              <div className={"relative aspect-video rounded-lg overflow-hidden border border-outline-variant p-4 bg-surface"}>
                {Object.keys(results).length > 0 ? (
                  <div className={"h-full flex flex-col justify-center"}>
                    <div className={"flex items-center gap-3 mb-3"}>
                      <div className={"flex items-center gap-1.5 text-xs"}><span className={"w-3 h-3 rounded bg-primary"}></span>Reduction</div>
                    </div>
                    <div className={"space-y-2"}>
                      {zones.filter(z => results[z.zone_id] && !results[z.zone_id].error).sort((a, b) => (results[b.zone_id]?.reduction_C || 0) - (results[a.zone_id]?.reduction_C || 0)).map(z => {
                        const r = results[z.zone_id];
                        const absRed = Math.abs(r.reduction_C);
                        const maxRed = Math.max(...Object.values(results).filter(v => !v.error).map(v => Math.abs(v.reduction_C)), 0.1);
                        const isPositive = r.reduction_C > 0;
                        return (
                          <div key={z.zone_id} className={"flex items-center gap-2 text-[10px]"}>
                            <span className={"w-16 truncate text-on-surface-variant"}>{z.name}</span>
                            <div className={"flex-1 h-4 bg-surface-container rounded relative overflow-hidden"}>
                              <div className={"absolute inset-y-0 left-0 rounded transition-all " + (isPositive ? "bg-primary" : "bg-warning")}
                                style={{ width: `${absRed / maxRed * 100}%` }}>
                              </div>
                              <span className={"absolute inset-0 flex items-center justify-center text-[9px] font-bold text-on-surface mix-blend-difference"}>
                                {isPositive ? "-" : "+"}{absRed.toFixed(1)}°C
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={"h-full flex items-center justify-center"}>
                    <p className={"text-on-surface-variant text-sm opacity-60"}>Run simulation to see projections</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-12 gap-6 mb-12"}>
            <div className={"col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl"}>
              <h4 className={"font-headline-sm text-headline-sm mb-4"}>Implementation Timeline</h4>
              <div className={"relative h-24 w-full flex items-end gap-1"}>
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className={"flex-1 " + (i >= 4 && i <= 6 ? "bg-primary/60" : "bg-surface-variant") + " rounded-t hover:bg-primary/40 transition-all cursor-pointer"}
                    style={{ height: `${[20,35,50,80,95,70,40,30][i-1]}%` }}></div>
                ))}
              </div>
              <div className={"flex justify-between mt-2 font-data-sm text-data-sm text-on-surface-variant"}>
                <span>Phase 1: Setup</span><span>Phase 2: Deployment</span><span>Phase 3: Stabilization</span>
              </div>
            </div>
            <div className={"col-span-12 lg:col-span-4 bg-surface-container-high border border-outline-variant p-6 rounded-xl"}>
              <h4 className={"font-headline-sm text-headline-sm mb-4"}>ROI Analytics</h4>
              <ul className={"space-y-4"}>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>Total Investment</span>
                  <span className={"text-primary font-data-lg"}>₹{(totalInvestment / 1e7).toFixed(1)} Cr</span>
                </li>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>Avg Reduction per Zone</span>
                  <span className={"text-primary font-data-lg"}>{avgReduction.toFixed(1)}°C</span>
                </li>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>Population Benefited</span>
                  <span className={"text-primary font-data-lg"}>{popBenefited.toLocaleString()}</span>
                </li>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>Zones Simulated</span>
                  <span className={"text-primary font-data-lg"}>{Object.keys(results).length}/{zones.length}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <aside className={"fixed right-0 top-16 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest dark:bg-surface-container-lowest border-l border-outline-variant dark:border-outline-variant"}>
        <div className={"p-6 border-b border-outline-variant"}>
          <h2 className={"font-display-md text-display-md text-primary text-[24px]"}>Intelligence Panel</h2>
          <p className={"font-body-sm text-body-sm text-on-surface-variant"}>{selectedZone?.name || "Select a zone"}</p>
        </div>
        <div className={"flex flex-col flex-1 overflow-y-auto"}>
          <div className={"p-4 bg-surface-container border-b border-outline-variant"}>
            <nav className={"flex gap-4"}>
              {["details", "insights", "simulator"].map(tab => {
                const labels = { details: "Zone Details", insights: "AI Insights", simulator: "Simulator" };
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`text-sm ${active ? "text-secondary border-b-2 border-secondary font-bold" : "text-on-surface-variant font-medium hover:text-secondary-fixed transition-colors"}`}>
                    {labels[tab]}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className={"p-6 space-y-6"}>
            {!selectedZone ? (
              <div className={"text-center text-on-surface-variant py-4 text-sm"}>Click a zone in the table to see details</div>
            ) : activeTab === "details" ? (
              <>
                <div>
                  <h5 className={"font-data-sm text-data-sm text-on-surface-variant uppercase mb-3"}>Zone Info</h5>
                  <div className={"space-y-2 text-sm"}>
                    <div className={"flex justify-between"}><span className={"text-on-surface-variant"}>Name</span><span className={"font-semibold"}>{selectedZone.name}</span></div>
                    <div className={"flex justify-between"}><span className={"text-on-surface-variant"}>Population</span><span>{selectedZone.population?.toLocaleString()}</span></div>
                    <div className={"flex justify-between"}><span className={"text-on-surface-variant"}>Coordinates</span><span>{selectedZone.lat}°, {selectedZone.lon}°</span></div>
                  </div>
                </div>
                <div>
                  <h5 className={"font-data-sm text-data-sm text-on-surface-variant uppercase mb-3"}>Top Heat Drivers</h5>
                  {recs?.top_heat_drivers?.slice(0, 4).map((d, i) => (
                    <div key={i} className={"flex items-center gap-2 mb-2"}>
                      <span className={"w-1.5 h-1.5 rounded-full bg-error"}></span>
                      <span className={"text-xs flex-1"}>{d.feature.replace(/_/g, " ")}</span>
                      <span className={"text-xs font-bold text-error"}>+{d.contribution_C}°C</span>
                    </div>
                  )) || <p className={"text-xs text-on-surface-variant"}>Select a zone with recommendations</p>}
                </div>
              </>
            ) : activeTab === "insights" ? (
              <>
                <div>
                  <h5 className={"font-data-sm text-data-sm text-on-surface-variant uppercase mb-3"}>Recommendations</h5>
                  {recs?.recommendations?.slice(0, 4).map(r => (
                    <div key={r.intervention} className={"mb-3 p-3 rounded bg-surface-container border border-outline-variant"}>
                      <div className={"flex justify-between items-center"}>
                        <span className={"font-semibold text-sm"}>{r.label}</span>
                        <span className={"text-xs font-bold " + (r.reduction_C > 0 ? "text-secondary" : "text-on-surface-variant")}>
                          {r.reduction_C > 0 ? `-${r.reduction_C.toFixed(1)}°C` : `${r.reduction_C.toFixed(1)}°C`}
                        </span>
                      </div>
                      <p className={"text-[10px] text-on-surface-variant mt-0.5"}>₹{(r.cost_INR / 1e6).toFixed(0)}M</p>
                    </div>
                  )) || <p className={"text-xs text-on-surface-variant"}>Run recommendations first</p>}
                </div>
              </>
            ) : (
              <div>
                <h5 className={"font-data-sm text-data-sm text-on-surface-variant uppercase mb-3"}>Simulation Results</h5>
                {results[selectedZone?.zone_id] ? (
                  (() => {
                    const r = results[selectedZone.zone_id];
                    if (r.error) return <p className={"text-error text-sm"}>{r.error}</p>;
                    return (
                      <div className={"space-y-2 text-sm"}>
                        <div className={"flex justify-between"}><span>Before</span><span className={"font-bold"}>{formatTemp(r.temp_before_C, settings.temperature_unit)}</span></div>
                        <div className={"flex justify-between"}><span>After</span><span className={"font-bold text-secondary"}>{formatTemp(r.temp_after_C, settings.temperature_unit)}</span></div>
                        <div className={"flex justify-between border-t border-outline-variant pt-1"}><span>Reduction</span><span className={"font-bold " + (r.reduction_C > 0 ? "text-secondary" : "text-error")}>{r.reduction_C > 0 ? "-" : "+"}{Math.abs(r.reduction_C).toFixed(1)}°C</span></div>
                        <div className={"flex justify-between"}><span>Cost</span><span className={"font-bold"}>₹{(r.total_cost_INR / 1e7).toFixed(1)}Cr</span></div>
                        <div className={"flex justify-between"}><span>Risk</span><span className={"font-bold text-xs"}>{r.risk_before} → {r.risk_after}</span></div>
                      </div>
                    );
                  })()
                ) : <p className={"text-xs text-on-surface-variant"}>Run simulation to see results</p>}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
