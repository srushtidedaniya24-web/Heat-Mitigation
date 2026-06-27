import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { useSettings } from "../contexts/SettingsContext";
import { formatTemp } from "../utils/formatUtils";
import { fetchAlerts, resolveAlert } from "../services/api";
import "../styles/pages.css";

const POLL_INTERVAL = 30000;

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function riskColor(level) {
  return level === "CRITICAL" ? "text-secondary" : level === "HIGH" ? "text-warning" : "text-tertiary";
}

function riskBg(level) {
  return level === "CRITICAL" ? "bg-secondary/10 border-secondary/40" : level === "HIGH" ? "bg-warning/10 border-warning/40" : "bg-tertiary/10 border-tertiary/40";
}

export default function AlertsPage() {
  const rootRef = useRef(null);
  const navigate = useNavigate();
  usePageInteractions(rootRef, "alerts");
  const { settings } = useSettings();

  const [alerts, setAlerts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, critical: 0, high: 0, medium: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolving, setResolving] = useState(new Set());

  const load = useCallback(async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data.alerts || []);
      setMeta({ total: data.total || 0, critical: data.critical || 0, high: data.high || 0, medium: data.medium || 0 });
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.risk_level === filter.toUpperCase());

  const handleResolve = async (zoneId) => {
    setResolving(prev => new Set(prev).add(zoneId));
    try {
      await resolveAlert(zoneId);
      setAlerts(prev => prev.filter(a => a.zone_id !== zoneId));
    } catch (e) {
      console.error("Failed to resolve:", e);
    } finally {
      setResolving(prev => { const next = new Set(prev); next.delete(zoneId); return next; });
    }
  };

  const filters = [
    { key: "all", label: "All Alerts", count: meta.total, color: "bg-primary text-on-primary" },
    { key: "critical", label: "Critical", count: meta.critical, color: "bg-secondary text-on-secondary" },
    { key: "high", label: "High", count: meta.high, color: "bg-warning text-on-warning" },
    { key: "medium", label: "Medium", count: meta.medium, color: "bg-tertiary text-on-tertiary" },
  ];

  return (
    <div ref={rootRef} className="alerts-page bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
      <nav className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>ThermaCity</span>
          <div className={"hidden md:flex gap-6 ml-8"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 px-3 py-1 rounded transition-colors"}>Overview</Link>
            <Link to={"/alerts"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>Alerts</Link>
          </div>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative"}>
            <span className={"material-symbols-outlined text-on-surface"}>notifications</span>
            {meta.critical > 0 && <span className={"absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full animate-pulse"}></span>}
          </button>
          <div className={"flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant"}>
            <span className={"material-symbols-outlined text-primary"}>account_circle</span>
            <span className={"font-data-sm text-data-sm text-on-surface"}>ADMIN_04</span>
          </div>
        </div>
      </nav>
      <Sidebar />
      <aside className={"fixed right-0 top-16 bottom-0 w-80 z-40 flex-col bg-surface-container-lowest border-l border-outline-variant hidden xl:flex"}>
        <div className={"p-6 border-b border-outline-variant"}>
          <h3 className={"font-headline-sm text-headline-sm text-secondary"}>Intelligence Panel</h3>
          <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
            {loading ? "Loading..." : `Last updated ${timeAgo(meta.generated)}`}
          </p>
        </div>
        <div className={"p-6 space-y-6 overflow-y-auto"}>
          <div className={"space-y-4"}>
            <div className={"flex justify-between items-end"}>
              <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase"}>Active Alerts</span>
              <span className={"font-data-lg text-data-lg text-secondary"}>{meta.total}</span>
            </div>
            <div className={"h-2 w-full bg-surface-container-highest rounded-full overflow-hidden"}>
              <div className={"h-full bg-secondary transition-all duration-500"} style={{width: `${Math.min(100, (meta.total / 10) * 100)}%`}}></div>
            </div>
          </div>
          <div className={"glass-panel p-4 rounded-lg border border-outline-variant"}>
            <div className={"flex items-center gap-2 mb-3"}>
              <span className={"material-symbols-outlined text-secondary"}>psychology</span>
              <span className={"font-data-sm text-data-sm text-on-surface"}>AI Insights</span>
            </div>
            <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
              {meta.critical > 0
                ? `${meta.critical} critical and ${meta.high} high-priority alerts active. Immediate mitigation recommended in affected zones.`
                : meta.high > 0
                  ? `${meta.high} high-priority zones require attention. Consider intervention planning.`
                  : "No critical alerts at this time. Thermal conditions are within acceptable ranges."}
            </p>
          </div>
          <div className={"space-y-3"}>
            <h4 className={"font-data-sm text-data-sm text-on-surface-variant uppercase"}>Active Zones</h4>
            <div className={"space-y-2"}>
              {alerts.slice(0, 5).map(a => (
                <div key={a.zone_id} className={"flex items-center justify-between p-3 bg-surface-container rounded border border-outline-variant/30"}>
                  <div className={"flex items-center gap-2"}>
                    <span className={"material-symbols-outlined text-primary text-sm"}>location_on</span>
                    <span className={"font-body-sm text-body-sm"}>{a.name}</span>
                  </div>
                  <span className={"font-data-sm text-data-sm " + riskColor(a.risk_level)}>{formatTemp(a.LST_celsius, settings.temperature_unit)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <main className={"ml-64 mr-0 xl:mr-80 mt-16 px-gutter pb-12 overflow-y-auto h-full"}>
        <div className={"max-w-layout-max-width mx-auto"}>
          <div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 pt-6"}>
            <div>
              <h1 className={"font-display-md text-display-md font-bold text-on-surface"}>System Alerts</h1>
              <p className={"font-body-md text-body-md text-on-surface-variant"}>
                Real-time thermal monitoring{loading ? "" : ` · ${meta.total} active · ${timeAgo(meta.generated)}`}
              </p>
            </div>
            <div className={"flex gap-2"}>
              <button onClick={() => { const csv = "ID,Zone,Temp,Risk,Population,Timestamp\n" + alerts.map(a => `${a.id},${a.name},${a.LST_celsius},${a.risk_level},${a.population},${a.timestamp}`).join("\n"); const b = new Blob([csv], {type:"text/csv"}); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "alerts_report.csv"; a.click(); }} className={"px-4 py-2 bg-primary text-on-primary font-bold rounded flex items-center gap-2 shadow-lg shadow-primary/20"}>
                <span className={"material-symbols-outlined text-sm"}>download</span>
                Export Report
              </button>
            </div>
          </div>

          <div className={"flex items-center gap-2 mb-6 overflow-x-auto pb-2"}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-5 py-1.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${filter === f.key ? f.color : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"}`}>
                {f.label} ({f.count})
              </button>
            ))}
            <span className={"text-[10px] text-on-surface-variant ml-auto"}>
              {loading ? "" : `Polling every ${POLL_INTERVAL / 1000}s`}
            </span>
          </div>

          {error && (
            <div className={"bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6"}>
              Failed to fetch alerts: {error}
            </div>
          )}

          {loading ? (
            <div className={"flex items-center justify-center h-64"}>
              <span className={"text-on-surface-variant animate-pulse"}>Loading alerts...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={"flex flex-col items-center justify-center h-64 text-on-surface-variant gap-3"}>
              <span className={"material-symbols-outlined text-4xl"}>check_circle</span>
              <p className={"font-headline-sm"}>No {filter === "all" ? "" : filter} alerts</p>
              <p className={"text-sm"}>All zones within normal thermal range.</p>
            </div>
          ) : (
            <div className={"space-y-4"}>
              {filtered.map(a => (
                <div key={a.id} className={"bg-surface-container p-6 rounded-lg border border-outline-variant hover:border-secondary/50 transition-all group"} data-alert-card={"true"}>
                  <div className={"flex flex-col md:flex-row gap-6"}>
                    <div className={"flex-1"}>
                      <div className={"flex items-center gap-3 mb-2 flex-wrap"}>
                        <span className={`px-2 py-0.5 ${riskBg(a.risk_level)} text-[10px] font-bold uppercase tracking-wider rounded border ${riskColor(a.risk_level)}`}>
                          {a.risk_level === "CRITICAL" ? "Critical" : a.risk_level === "HIGH" ? "High Priority" : "Medium"}
                        </span>
                        <span className={"font-data-sm text-data-sm text-on-surface-variant"}>{a.id}</span>
                        <span className={"font-data-sm text-data-sm text-on-surface-variant flex items-center gap-1 ml-auto"}>
                          <span className={"material-symbols-outlined text-sm"}>schedule</span>
                          {timeAgo(a.timestamp)}
                        </span>
                      </div>
                      <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-2"}>
                        Extreme Heat Alert — {a.name}
                      </h3>
                      <div className={"flex flex-wrap gap-4 mt-4"}>
                        <div className={"bg-surface-container-low px-4 py-2 rounded border border-outline-variant"}>
                          <p className={"text-[10px] text-on-surface-variant uppercase"}>Surface Temp</p>
                          <p className={"font-data-lg text-data-lg " + riskColor(a.risk_level)}>
                            {formatTemp(a.LST_celsius, settings.temperature_unit)}
                            <span className={"text-sm font-normal text-on-surface-variant"}> {a.risk_level}</span>
                          </p>
                        </div>
                        <div className={"bg-surface-container-low px-4 py-2 rounded border border-outline-variant"}>
                          <p className={"text-[10px] text-on-surface-variant uppercase"}>Population Impact</p>
                          <p className={"font-data-lg text-data-lg text-on-surface"}>
                            {a.population?.toLocaleString()}
                            <span className={"text-sm font-normal text-on-surface-variant"}> At Risk</span>
                          </p>
                        </div>
                      </div>
                      {a.drivers?.length > 0 && (
                        <p className={"font-body-sm text-body-sm text-on-surface-variant mt-3"}>
                          Top drivers: {a.drivers.slice(0, 2).map(d => `${d.feature.replace(/_/g, " ")} (+${d.contribution_C}°C)`).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className={"flex md:flex-col justify-end gap-2"}>
                      <button onClick={() => navigate(`/heat-maps`)} className={"flex-1 md:flex-none px-6 py-2 bg-secondary text-on-secondary font-bold rounded hover:opacity-90 active:scale-95 transition-all"}>
                        View on Map
                      </button>
                      <button onClick={() => handleResolve(a.zone_id)} disabled={resolving.has(a.zone_id)}
                        className={"flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 rounded transition-all disabled:opacity-40"}>
                        {resolving.has(a.zone_id) ? "Resolving..." : "Mark Resolved"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
