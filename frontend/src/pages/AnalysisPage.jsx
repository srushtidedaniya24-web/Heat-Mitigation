import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { fetchHeatmap, fetchRecommendations, simulateIntervention } from "../services/api";
import "../styles/pages.css";

export default function AnalysisPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "analysis");

  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("insights");
  const [simResult, setSimResult] = useState(null);
  const [simCoverage, setSimCoverage] = useState(50);
  const [simIntervention, setSimIntervention] = useState("cool_roofs");

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

  return (
    <div ref={rootRef} className="analysis-page font-body-md text-body-md overflow-hidden h-screen flex flex-col">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant dark:border-outline-variant"}>
        <div className={"flex items-center gap-8"}>
          <span className={"font-display-md text-display-md font-bold text-primary dark:text-primary tracking-tight"}>
            ThermaCity
          </span>
          <nav className={"hidden md:flex items-center gap-6"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>
              Live Status
            </Link>
            <Link to={"/analysis"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Analysis
            </Link>
          </nav>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined p-2 text-on-surface-variant cursor-pointer active:opacity-80 transition-opacity hover:bg-surface-variant/50 rounded-full"}>
            notifications
          </button>
          <button className={"material-symbols-outlined p-2 text-on-surface-variant cursor-pointer active:opacity-80 transition-opacity hover:bg-surface-variant/50 rounded-full"}>
            account_circle
          </button>
        </div>
      </header>
      <div className={"flex flex-1 pt-16"}>
        <Sidebar />
        <main className={"ml-64 mr-80 flex-1 overflow-y-auto bg-surface p-6"}>
          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"}>
            <section className={"glass-panel rounded-xl flex flex-col p-5 overflow-hidden"}>
              <div className={"flex justify-between items-center mb-6"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"material-symbols-outlined text-primary"}>
                    format_list_numbered
                  </span>
                  Neighborhood Priority Rankings
                </h3>
                <span className={"font-data-sm text-data-sm text-on-surface-variant px-2 py-1 bg-surface-container rounded border border-outline-variant"}>
                  Update: 14:00Z
                </span>
              </div>
              <div className={"flex-1 overflow-y-auto pr-2"}>
                <table className={"w-full text-left border-separate border-spacing-y-3"}>
                  <thead className={"sticky top-0 bg-[#111827] z-10"}>
                    <tr className={"text-on-surface-variant font-data-sm text-data-sm border-b border-outline-variant"}>
                      <th className={"pb-2 font-medium"}>
                        RANK
                      </th>
                      <th className={"pb-2 font-medium"}>
                        ZONE
                      </th>
                      <th className={"pb-2 font-medium"}>
                        HEAT RISK
                      </th>
                      <th className={"pb-2 font-medium"}>
                        EXPOSURE
                      </th>
                      <th className={"pb-2 font-medium"}>
                        PRIORITY
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((z, i) => {
                      const rankColor = i < 2 ? "text-primary" : "text-on-surface-variant";
                      const riskColor = z.risk_level === "CRITICAL" ? "bg-error/10 border-error/40 text-error" :
                                        z.risk_level === "HIGH" ? "bg-tertiary-container/10 border-tertiary-container/40 text-tertiary-container" :
                                        "bg-primary/10 border-primary/40 text-primary";
                      const barColor = z.risk_level === "CRITICAL" ? "bg-secondary-container" :
                                       z.risk_level === "HIGH" ? "bg-tertiary-container" : "bg-primary";
                      const barWidth = Math.min(100, z.heat_risk_index * 10);
                      return (
                        <tr key={z.zone_id}
                          className={"group hover:bg-surface-variant/20 transition-colors cursor-pointer"}
                          onClick={() => setSelectedZone(z)}
                        >
                          <td className={`py-4 font-data-lg text-data-lg ${rankColor}`}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td className={"py-4 font-body-md text-body-md font-semibold"}>{z.name}</td>
                          <td className={"py-4"}>
                            <div className={"flex items-center gap-2"}>
                              <span className={"font-data-sm text-data-sm w-8"}>{z.heat_risk_index}</span>
                              <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                                <div className={`h-full ${barColor}`} style={{width: `${barWidth}%`}}></div>
                              </div>
                            </div>
                          </td>
                          <td className={"py-4 font-data-sm text-data-sm"}>{z.population?.toLocaleString()}</td>
                          <td className={"py-4"}>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${riskColor}`}>
                              {z.risk_level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
            <section className={"glass-panel rounded-xl flex flex-col p-5"}>
              <div className={"mb-8"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-1"}>
                  <span className={"material-symbols-outlined text-secondary-container"}>
                    psychology
                  </span>
                  What's driving urban heat?
                </h3>
                <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                  SHAP Value Feature Attribution ({selectedZone?.name || "City-wide"} Model)
                </p>
              </div>
              <div className={"space-y-8 flex-1 flex flex-col justify-center"}>
                {recs?.shap_breakdown ? (
                  (() => {
                    const shapEntries = Object.entries(recs.shap_breakdown)
                      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                      .slice(0, 5);
                    const maxAbs = Math.max(...shapEntries.map(([, v]) => Math.abs(v)), 1);
                    return shapEntries.map(([feat, val], i) => (
                      <div key={feat} className={"relative"}>
                        <div className={"flex justify-between items-end mb-2"}>
                          <span className={"font-data-sm text-data-sm uppercase tracking-widest text-on-surface-variant"}>
                            {feat.replace(/_/g, " ")}
                          </span>
                          <span className={"font-data-lg text-data-lg text-secondary-container"}>
                            {val >= 0 ? "+" : ""}{val.toFixed(1)}°C
                          </span>
                        </div>
                        <div className={"h-8 w-full bg-surface-container rounded relative overflow-hidden"}>
                          <div className={"h-full shap-bar-positive transition-all duration-1000 ease-out"} style={{width: `${(Math.abs(val) / maxAbs) * 100}%`}}></div>
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <div className={"text-center text-on-surface-variant py-8"}>
                    {loading ? "Loading SHAP data..." : "Select a zone to see feature attribution"}
                  </div>
                )}
              </div>
              <div className={"mt-8 p-4 bg-surface-container-high/30 rounded-lg border border-outline-variant/30 italic font-body-sm text-body-sm text-on-surface-variant/80"}>
                {recs?.recommendations?.length > 0
                  ? `AI recommends ${recs.recommendations[0].label} for ${selectedZone?.name} — could reduce peak temperature by up to ${Math.abs(recs.recommendations[0].reduction_C).toFixed(1)}°C.`
                  : "*AI analysis indicates zone-specific interventions can reduce peak temperatures."}
              </div>
            </section>
          </div>
          <section className={"glass-panel rounded-xl mt-6 p-6"}>
            <div className={"flex justify-between items-center mb-6"}>
              <div>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"material-symbols-outlined text-primary"}>
                    timeline
                  </span>
                  Surface temperature trend - {selectedZone?.name || "Downtown"}
                </h3>
                <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                  Comparative monthly LST (Land Surface Temp) sensor readings
                </p>
              </div>
              <div className={"flex gap-4"}>
                <div className={"flex items-center gap-2"}>
                  <span className={"w-3 h-3 rounded-full bg-primary/40"}></span>
                  <span className={"font-data-sm text-data-sm"}>
                    2022
                  </span>
                </div>
                <div className={"flex items-center gap-2"}>
                  <span className={"w-3 h-3 rounded-full bg-primary/70"}></span>
                  <span className={"font-data-sm text-data-sm"}>
                    2023
                  </span>
                </div>
                <div className={"flex items-center gap-2"}>
                  <span className={"w-3 h-3 rounded-full bg-primary"}></span>
                  <span className={"font-data-sm text-data-sm"}>
                    2024
                  </span>
                </div>
              </div>
            </div>
            <div className={"h-64 relative flex items-end pt-4 pb-8"}>
              <div className={"absolute left-0 top-0 bottom-8 flex flex-col justify-between text-on-surface-variant font-data-sm text-data-sm pr-4 border-r border-outline-variant/30"}>
                <span>
                  62°C
                </span>
                <span>
                  55°C
                </span>
                <span>
                  48°C
                </span>
                <span>
                  40°C
                </span>
              </div>
              <div className={"flex-1 ml-12 h-full relative"}>
                <svg className={"w-full h-full preserve-3d"} preserveAspectRatio={"none"} viewBox={"0 0 1000 200"}>
                  <line stroke={"#1E2D45"} strokeWidth={"0.5"} x1={"0"} x2={"1000"} y1={"0"} y2={"0"}></line>
                  <line stroke={"#1E2D45"} strokeWidth={"0.5"} x1={"0"} x2={"1000"} y1={"66"} y2={"66"}></line>
                  <line stroke={"#1E2D45"} strokeWidth={"0.5"} x1={"0"} x2={"1000"} y1={"133"} y2={"133"}></line>
                  <line stroke={"#1E2D45"} strokeWidth={"1"} x1={"0"} x2={"1000"} y1={"200"} y2={"200"}></line>
                  <path d={"M 0,180 Q 150,170 300,100 T 500,80 T 700,150 T 1000,185"} fill={"none"} opacity={"0.2"} stroke={"#46f1cf"} strokeWidth={"1"}></path>
                  <path d={"M 0,175 Q 150,160 300,85 T 500,60 T 700,140 T 1000,180"} fill={"none"} opacity={"0.5"} stroke={"#46f1cf"} strokeWidth={"1.5"}></path>
                  <path d={"M 0,170 C 100,165 250,50 400,20 C 550,0 700,80 850,140 L 1000,175"} fill={"none"} stroke={"#46f1cf"} strokeLinecap={"round"} strokeWidth={"3"}></path>
                  <circle cx={"400"} cy={"20"} fill={"#00d4b4"} r={"4"}></circle>
                  <text className={"font-data-sm text-[10px]"} fill={"#46f1cf"} x={"410"} y={"15"}>
                    Peak: 61.2°C
                  </text>
                </svg>
                <div className={"absolute top-full left-0 right-0 flex justify-between font-data-sm text-data-sm text-on-surface-variant pt-2"}>
                  <span>
                    Jan
                  </span>
                  <span>
                    Feb
                  </span>
                  <span>
                    Mar
                  </span>
                  <span className={"text-primary font-bold"}>
                    Apr
                  </span>
                  <span className={"text-primary font-bold"}>
                    May
                  </span>
                  <span className={"text-primary font-bold"}>
                    Jun
                  </span>
                  <span>
                    Jul
                  </span>
                  <span>
                    Aug
                  </span>
                  <span>
                    Sep
                  </span>
                  <span>
                    Oct
                  </span>
                  <span>
                    Nov
                  </span>
                  <span>
                    Dec
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
        <aside className={"fixed right-0 top-16 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest dark:bg-surface-container-lowest border-l border-outline-variant dark:border-outline-variant"}>
          <div className={"p-6 border-b border-outline-variant"}>
            <h2 className={"font-display-md text-display-md text-primary mb-1"}>
              Intelligence Panel
            </h2>
            <div className={"flex items-center gap-2"}>
              <span className={"w-2 h-2 rounded-full bg-secondary animate-pulse"}></span>
              <p className={"font-data-lg text-data-lg text-secondary"}>
                {selectedZone?.name || "No zone selected"}
              </p>
            </div>
          </div>
          <nav className={"flex border-b border-outline-variant"}>
            {["details", "insights", "simulator"].map(tab => {
              const labels = { details: "Zone Details", insights: "AI Insights", simulator: "Cooling Simulator" };
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm transition-colors ${
                    active ? "text-secondary border-b-2 border-secondary font-bold" : "text-on-surface-variant font-medium hover:text-secondary-fixed"
                  }`}>
                  {labels[tab]}
                </button>
              );
            })}
          </nav>
          <div className={"flex-1 p-4 overflow-y-auto space-y-4"}>

            {/* ── Tab: Zone Details ── */}
            {activeTab === "details" && (
              <div className={"space-y-4"}>
                {selectedZone ? (
                  <>
                    <div className={"glass-panel p-4 rounded-lg space-y-3"}>
                      <div className={"flex justify-between items-center"}>
                        <span className={"font-headline-sm text-sm"}>{selectedZone.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedZone.risk_level === "CRITICAL" ? "bg-error/10 text-error" :
                          selectedZone.risk_level === "HIGH" ? "bg-tertiary-container/10 text-tertiary-container" :
                          "bg-primary/10 text-primary"}`}>
                          {selectedZone.risk_level}
                        </span>
                      </div>
                      <div className={"grid grid-cols-2 gap-2 text-xs"}>
                        <div className={"bg-surface-container rounded p-2"}>
                          <span className={"text-on-surface-variant"}>LST</span>
                          <p className={"font-bold text-secondary"}>{selectedZone.LST_celsius}°C</p>
                        </div>
                        <div className={"bg-surface-container rounded p-2"}>
                          <span className={"text-on-surface-variant"}>Population</span>
                          <p className={"font-bold"}>{selectedZone.population?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                      Feature Attribution (SHAP)
                    </label>
                    {recs?.shap_breakdown && (() => {
                      const entries = Object.entries(recs.shap_breakdown)
                        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6);
                      const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 1);
                      return entries.map(([feat, val]) => (
                        <div key={feat} className={"flex items-center gap-2"}>
                          <span className={"text-[10px] text-on-surface-variant w-20 truncate"}>{feat.replace(/_/g, " ")}</span>
                          <div className={"flex-1 h-2 bg-surface-container rounded overflow-hidden"}>
                            <div className={"h-full rounded transition-all duration-700"}
                              style={{ width: `${Math.abs(val) / maxAbs * 100}%`,
                                       background: val >= 0 ? "linear-gradient(90deg, #ef4444, #f97316)" : "linear-gradient(90deg, #06b6d4, #22d3ee)" }}>
                            </div>
                          </div>
                          <span className={"text-[10px] w-10 text-right font-bold"} style={{color: val >= 0 ? "#ef4444" : "#22d3ee"}}>
                            {val >= 0 ? "+" : ""}{val.toFixed(1)}
                          </span>
                        </div>
                      ));
                    })()}
                  </>
                ) : (
                  <div className={"text-center text-on-surface-variant py-8 text-sm"}>Select a zone to view details</div>
                )}
              </div>
            )}

            {/* ── Tab: AI Insights ── */}
            {activeTab === "insights" && (
              <>
                <div className={"space-y-3"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                    Active Anomalies
                  </label>
                  <div className={"glass-panel p-4 rounded-lg space-y-3"}>
                    {recs?.top_heat_drivers?.slice(0, 3).map((d, i) => (
                      <div key={i} className={"flex items-start gap-3"}>
                        <span className={"material-symbols-outlined text-secondary text-sm mt-1"}>warning</span>
                        <div>
                          <p className={"font-body-sm text-body-sm font-bold"}>{d.feature.replace(/_/g, " ")}</p>
                          <p className={"text-[11px] text-on-surface-variant"}>
                            Contributing +{d.contribution_C}°C in {selectedZone?.name || "selected zone"}.
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className={"text-center text-on-surface-variant py-4 text-sm"}>
                        {loading ? "Loading..." : "Select a zone to see anomalies"}
                      </div>
                    )}
                  </div>
                </div>
                <div className={"space-y-3"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                    Recommended Actions
                  </label>
                  <div className={"space-y-2"}>
                    {recs?.recommendations?.slice(0, 4).map(r => (
                      <button key={r.intervention}
                        className={"w-full text-left p-3 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant group"}
                        onClick={() => { setActiveTab("simulator"); setSimIntervention(r.intervention); }}>
                        <div className={"flex justify-between items-center"}>
                          <span className={"font-body-sm text-body-sm font-semibold"}>{r.label}</span>
                          <span className={"text-xs font-bold " + (r.reduction_C > 0 ? "text-secondary" : "text-on-surface-variant")}>
                            {r.reduction_C > 0 ? `-${Math.abs(r.reduction_C).toFixed(1)}°C` : "—"}
                          </span>
                        </div>
                        <p className={"text-[11px] text-on-surface-variant mt-0.5"}>
                          ₹{(r.cost_INR / 1e6).toFixed(1)}M · {r.efficiency_score?.toFixed(1)} °C/₹M
                        </p>
                      </button>
                    )) || (
                      <div className={"text-center text-on-surface-variant py-4 text-sm"}>
                        {loading ? "Loading..." : "Select a zone to see recommendations"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Tab: Cooling Simulator ── */}
            {activeTab === "simulator" && (
              <div className={"space-y-4"}>
                <div className={"space-y-2"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                    Intervention Type
                  </label>
                  <select value={simIntervention}
                    onChange={e => { setSimIntervention(e.target.value); setSimResult(null); }}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm"}>
                    {recs?.recommendations?.map(r => (
                      <option key={r.intervention} value={r.intervention}>{r.label}</option>
                    )) || (
                      <option value="cool_roofs">Cool Roofs</option>
                    )}
                  </select>
                </div>
                <div className={"space-y-2"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                    Coverage: {simCoverage}%
                  </label>
                  <input type="range" min={10} max={100} step={5} value={simCoverage}
                    onChange={e => { setSimCoverage(Number(e.target.value)); setSimResult(null); }}
                    className={"w-full accent-secondary cursor-pointer"} />
                  <div className={"flex justify-between text-[10px] text-on-surface-variant"}>
                    <span>10%</span><span>100%</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!selectedZone) return;
                    try {
                      const res = await simulateIntervention(selectedZone.zone_id, simIntervention, simCoverage);
                      setSimResult(res);
                    } catch (e) {
                      setSimResult({ error: e.message });
                    }
                  }}
                  disabled={!selectedZone}
                  className={"w-full py-3 rounded-lg font-bold bg-secondary text-on-secondary hover:bg-secondary-fixed transition-all active:scale-[0.97] disabled:opacity-40"}>
                  Run Simulation
                </button>
                {simResult && !simResult.error && (
                  <div className={"glass-panel p-4 rounded-lg space-y-2"}>
                    <p className={"text-xs text-on-surface-variant uppercase tracking-widest"}>Results</p>
                    <div className={"flex justify-between items-center"}>
                      <span className={"text-sm"}>Before</span>
                      <span className={"font-bold text-lg"}>{simResult.temp_before_C}°C</span>
                    </div>
                    <div className={"flex justify-between items-center"}>
                      <span className={"text-sm"}>After</span>
                      <span className={"font-bold text-lg text-secondary"}>{simResult.temp_after_C}°C</span>
                    </div>
                    <div className={"flex justify-between items-center pt-2 border-t border-outline-variant"}>
                      <span className={"text-sm"}>Reduction</span>
                      <span className={"font-bold text-lg " + (simResult.reduction_C > 0 ? "text-secondary" : "text-error")}>
                        {simResult.reduction_C > 0 ? `-${simResult.reduction_C.toFixed(1)}` : `+${Math.abs(simResult.reduction_C).toFixed(1)}`}°C
                      </span>
                    </div>
                    <div className={"flex justify-between items-center"}>
                      <span className={"text-sm"}>Cost</span>
                      <span className={"font-bold"}>₹{(simResult.total_cost_INR / 1e6).toFixed(1)}M</span>
                    </div>
                    <div className={"flex justify-between items-center"}>
                      <span className={"text-sm"}>Cost Efficiency</span>
                      <span className={"font-bold"}>₹{simResult.cost_per_degC?.toLocaleString() || "—"}/°C</span>
                    </div>
                    <div className={"flex justify-between items-center"}>
                      <span className={"text-sm"}>Risk Change</span>
                      <span className={"font-bold text-xs " + (simResult.risk_after === "COOL" ? "text-secondary" : "text-warning")}>
                        {simResult.risk_before} → {simResult.risk_after}
                      </span>
                    </div>
                  </div>
                )}
                {simResult?.error && (
                  <div className={"text-error text-sm text-center py-4"}>{simResult.error}</div>
                )}
                {!simResult && selectedZone && (
                  <div className={"text-center text-on-surface-variant text-sm py-4"}>
                    Configure and run a simulation to see results
                  </div>
                )}
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  );
}
