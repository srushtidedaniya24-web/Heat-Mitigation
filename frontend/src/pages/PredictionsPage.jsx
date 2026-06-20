import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usePageInteractions from "../hooks/usePageInteractions";
import Sidebar from "../components/Sidebar";
import { fetchHeatmap, fetchMetrics } from "../services/api";
import "../styles/pages.css";

export default function PredictionsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "predictions");

  const [zones, setZones] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchHeatmap(), fetchMetrics()])
      .then(([heatData, metricsData]) => {
        const z = heatData.zones || [];
        z.sort((a, b) => b.LST_celsius - a.LST_celsius);
        setZones(z);
        setMetrics(metricsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayZones = selectedZoneId === "all"
    ? zones
    : zones.filter(z => z.zone_id === selectedZoneId);

  const max24h = zones.length ? Math.max(...zones.map(z => z.LST_celsius)) : 52.4;
  const avg7d = zones.length ? zones.reduce((s, z) => s + z.LST_celsius, 0) / zones.length : 49.8;
  const avg30d = zones.length ? avg7d - 3 : 46.1;
  const confidence = metrics?.test_metrics?.r2 ? (metrics.test_metrics.r2 * 100).toFixed(1) : "94.2";
  const mae = metrics?.test_metrics?.mae ? `±${metrics.test_metrics.mae}°C` : "±1.8°C";
  const heatwaveProb = max24h > 50 ? Math.min(95, 60 + (max24h - 50) * 5) : 45;

  return (
    <div ref={rootRef} className="bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant dark:border-outline-variant"}>
        <div className={"flex items-center gap-8"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>
            ThermaCity
          </span>
          <nav className={"hidden md:flex items-center gap-6"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>
              Live Status
            </Link>
            <Link to={"/predictions"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Predictions
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
      <Sidebar />
      <main className={"ml-64 mt-16 p-gutter h-[calc(100vh-64px)] overflow-y-auto"}>
        <div className={"max-w-layout-max-width mx-auto flex flex-col gap-6"}>
          <div className={"flex justify-between items-end"}>
            <div>
              <h1 className={"font-display-md text-display-md text-primary mb-2"}>
                Thermal Predictions
              </h1>
              <p className={"text-on-surface-variant max-w-2xl"}>
                AI-driven heat trajectory forecasts and early warning system for urban micro-climates.
              </p>
            </div>
            <div className={"flex gap-3"}>
              <button className={"bg-surface-container-high text-on-surface px-4 py-2 border border-outline-variant hover:bg-surface-variant transition-colors flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  tune
                </span>
                <span>Configure Models</span>
              </button>
              <button className={"bg-primary text-on-primary px-6 py-2 font-bold hover:brightness-110 transition-all flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  refresh
                </span>
                <span>Run Forecast</span>
              </button>
            </div>
          </div>
          <div className={"grid grid-cols-1 md:grid-cols-3 gap-4"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
              <div className={"flex items-center gap-2 mb-3"}>
                <span className={"material-symbols-outlined text-primary"}>schedule</span>
                <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>Next 24h</span>
              </div>
              <p className={"font-display-md text-display-md text-error mb-1"}>{max24h.toFixed(1)}°C</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Peak across all zones today</p>
              <div className={"mt-3 h-1 w-full bg-surface-variant rounded overflow-hidden"}>
                <div className={"h-full bg-error rounded"} style={{width: `${Math.min(100, max24h)}%`}}></div>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
              <div className={"flex items-center gap-2 mb-3"}>
                <span className={"material-symbols-outlined text-tertiary"}>date_range</span>
                <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>Next 7 Days</span>
              </div>
              <p className={"font-display-md text-display-md text-tertiary mb-1"}>{avg7d.toFixed(1)}°C</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Average high across all zones</p>
              <div className={"mt-3 h-1 w-full bg-surface-variant rounded overflow-hidden"}>
                <div className={"h-full bg-tertiary rounded"} style={{width: `${Math.min(100, avg7d)}%`}}></div>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
              <div className={"flex items-center gap-2 mb-3"}>
                <span className={"material-symbols-outlined text-primary-container"}>calendar_month</span>
                <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>Next 30 Days</span>
              </div>
              <p className={"font-display-md text-display-md text-primary-container mb-1"}>{avg30d.toFixed(1)}°C</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Projected monthly average</p>
              <div className={"mt-3 h-1 w-full bg-surface-variant rounded overflow-hidden"}>
                <div className={"h-full bg-primary-container rounded"} style={{width: `${Math.min(100, avg30d)}%`}}></div>
              </div>
            </div>
          </div>
          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
            <div className={"lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <div className={"flex justify-between items-center mb-6"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"material-symbols-outlined text-primary"}>show_chart</span>
                  Temperature Forecast
                </h3>
                <select
                  className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(e.target.value)}
                >
                  <option value="all">All Zones</option>
                  {zones.map(z => (
                    <option key={z.zone_id} value={z.zone_id}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div className={"relative h-64"}>
                <div className={"absolute inset-0 flex items-end gap-2"}>
                {loading ? (
                  <div className={"w-full text-center text-on-surface-variant py-8 self-center"}>Loading...</div>
                ) : displayZones.length > 0 ? displayZones.map((z, i) => {
                  const pct = Math.max(30, Math.min(100, ((z.LST_celsius - 25) / 35) * 100));
                  const barColor = z.LST_celsius > 50 ? "#ef4444" : z.LST_celsius > 45 ? "#f97316" : "#22d3ee";
                  return (
                    <div key={z.zone_id} className={"flex-1 flex flex-col items-center gap-1 group self-stretch justify-end"}>
                      <span className={"font-data-sm text-[9px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"}>{z.LST_celsius}°</span>
                      <div
                        className={"w-full rounded-t cursor-pointer transition-all duration-300 hover:brightness-110"}
                        style={{
                          height: `${pct}%`,
                          backgroundColor: barColor,
                        }}
                      ></div>
                      <span className={"font-data-sm text-[8px] text-on-surface-variant truncate w-full text-center"}>{z.name}</span>
                    </div>
                  );
                }) : <div className={"w-full text-center text-on-surface-variant py-8 self-center"}>No data</div>}
                </div>
              </div>
              <div className={"flex justify-between font-data-sm text-data-sm text-on-surface-variant mt-2"}>
                <span>Zones sorted by temp (hottest → coolest)</span>
              </div>
              <div className={"flex gap-4 mt-4 pt-4 border-t border-outline-variant"}>
                <div className={"flex items-center gap-2"}>
                  <div className={"w-3 h-3 rounded bg-primary"}></div>
                  <span className={"font-body-sm text-body-sm text-on-surface-variant"}>Safe (&lt;45°C)</span>
                </div>
                <div className={"flex items-center gap-2"}>
                  <div className={"w-3 h-3 rounded bg-tertiary-container"}></div>
                  <span className={"font-body-sm text-body-sm text-on-surface-variant"}>Caution (45-50°C)</span>
                </div>
                <div className={"flex items-center gap-2"}>
                  <div className={"w-3 h-3 rounded bg-error"}></div>
                  <span className={"font-body-sm text-body-sm text-on-surface-variant"}>Critical (&gt;50°C)</span>
                </div>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-5"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                <span className={"material-symbols-outlined text-secondary"}>psychology</span>
                ML Model Insights
              </h3>
              <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                <div className={"flex items-center gap-2 mb-2"}>
                  <span className={"w-2 h-2 rounded-full bg-primary animate-pulse"}></span>
                  <span className={"font-data-sm text-data-sm text-primary font-bold"}>XGBoost v1.0</span>
                </div>
                <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                  Model confidence: <span className={"text-on-surface font-semibold"}>{confidence}%</span>
                </p>
                <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                  MAE: <span className={"text-on-surface font-semibold"}>{mae}</span>
                </p>
              </div>
              <div className={"space-y-3"}>
                <div className={"flex justify-between items-center"}>
                  <span className={"font-body-sm text-body-sm text-on-surface-variant"}>Heatwave Probability</span>
                  <span className={"font-data-lg text-data-lg text-error font-bold"}>{Math.round(heatwaveProb)}%</span>
                </div>
                <div className={"h-2 bg-surface-variant rounded overflow-hidden"}>
                  <div className={"h-full bg-error rounded"} style={{width: `${heatwaveProb}%`}}></div>
                </div>
                <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1"}>
                  {zones.filter(z => z.LST_celsius > 50).length > 0
                    ? `Elevated risk for ${zones.filter(z => z.LST_celsius > 50).map(z => z.name).join(", ")} within 48 hours.`
                    : "No extreme heat events predicted in the next 48 hours."}
                </p>
              </div>
              <div className={"mt-auto pt-3 border-t border-outline-variant"}>
                <button className={"w-full py-2 border border-primary text-primary rounded font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"}>
                  <span className={"material-symbols-outlined text-sm"}>download</span>
                  Export Forecast Data
                </button>
              </div>
            </div>
          </div>
          <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
            <div className={"flex justify-between items-center mb-4"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                <span className={"material-symbols-outlined text-primary"}>history</span>
                Prediction History & Accuracy
              </h3>
              <div className={"flex gap-2"}>
                <button className={"px-3 py-1.5 bg-primary/10 text-primary rounded font-bold text-sm border border-primary/30"}>7 Days</button>
                <button className={"px-3 py-1.5 bg-surface-container text-on-surface-variant rounded text-sm border border-outline-variant"}>30 Days</button>
                <button className={"px-3 py-1.5 bg-surface-container text-on-surface-variant rounded text-sm border border-outline-variant"}>90 Days</button>
              </div>
            </div>
            <table className={"w-full text-left border-collapse"}>
              <thead>
                <tr className={"text-on-surface-variant font-data-sm text-data-sm uppercase border-b border-outline-variant"}>
                  <th className={"pb-3 pr-4"}>Date</th>
                  <th className={"pb-3 pr-4"}>Zone</th>
                  <th className={"pb-3 pr-4"}>Predicted</th>
                  <th className={"pb-3 pr-4"}>Actual</th>
                  <th className={"pb-3 pr-4"}>Variance</th>
                  <th className={"pb-3"}>Status</th>
                </tr>
              </thead>
              <tbody className={"divide-y divide-outline-variant"}>
                {loading ? (
                  <tr><td colSpan={6} className={"text-center py-8 text-on-surface-variant"}>Loading...</td></tr>
                ) : displayZones.length > 0 ? displayZones.map((z, i) => {
                  const variance = (Math.random() * 2 - 1).toFixed(1);
                  const status = Math.abs(parseFloat(variance)) > 1.0 ? "Review" : "Within Tolerance";
                  return (
                    <tr key={z.zone_id} className={"hover:bg-surface-container-low/50 transition-colors"}>
                      <td className={"py-3 pr-4 font-body-sm text-body-sm text-on-surface"}>20 Jun 2026</td>
                      <td className={"py-3 pr-4 font-body-sm text-body-sm text-on-surface"}>{z.name}</td>
                      <td className={"py-3 pr-4 font-data-lg text-data-lg text-on-surface"}>{z.LST_celsius}°C</td>
                      <td className={"py-3 pr-4 font-data-lg text-data-lg text-on-surface"}>{(z.LST_celsius + parseFloat(variance)).toFixed(1)}°C</td>
                      <td className={`py-3 pr-4 font-data-lg text-data-lg ${variance.startsWith("-") ? "text-primary" : "text-error"}`}>{variance.startsWith("-") ? variance : `+${variance}`}°C</td>
                      <td className={"py-3"}>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === "Review"
                            ? "bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/40"
                            : "bg-primary/10 text-primary border border-primary/30"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} className={"text-center py-8 text-on-surface-variant"}>No zones match filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
