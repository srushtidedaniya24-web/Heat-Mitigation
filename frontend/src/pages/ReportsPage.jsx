import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import { fetchReports, generateReport } from "../services/api";
import "../styles/pages.css";

const REPORT_TYPES = [
  { key: "all", label: "All Reports" },
  { key: "Thermal Analysis", label: "Thermal Analysis" },
  { key: "Intervention", label: "Intervention" },
  { key: "Compliance", label: "Compliance" },
];

export default function ReportsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "reports");

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, this_month: 0, pending: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Thermal Analysis");

  const load = useCallback(async () => {
    try {
      const data = await fetchReports(filter === "all" ? null : filter);
      setReports(data.reports || []);
      setStats(data.stats || { total: 0, scheduled: 0, this_month: 0, pending: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const report = await generateReport(newName || `${newType} — ${new Date().toLocaleDateString()}`, newType);
      setReports(prev => [report, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1, this_month: prev.this_month + 1 }));
      setShowNew(false);
      setNewName("");
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    const rows = report.zones?.map(z => `${z.name},${z.LST_celsius},${z.risk_level},${z.population}`).join("\n") || "";
    const csv = `Zone,Temp,Risk,Population\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.name.replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  const typeBadge = (type) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold border";
    if (type === "Thermal Analysis") return `${base} bg-primary/10 text-primary border-primary/30`;
    if (type === "Intervention") return `${base} bg-secondary/10 text-secondary border-secondary/30`;
    return `${base} bg-tertiary-container/20 text-tertiary-container border-tertiary-container/40`;
  };

  const statusBadge = (status) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold border";
    if (status === "Final") return `${base} bg-primary/10 text-primary border-primary/30`;
    if (status === "Draft") return `${base} bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/30`;
    if (status === "Review") return `${base} bg-tertiary-container/20 text-tertiary-container border-tertiary-container/40`;
    return `${base} bg-primary-container/20 text-primary-container border-primary-container/30`;
  };

  return (
    <div ref={rootRef} className="bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-8"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>ThermaCity</span>
          <nav className={"hidden md:flex items-center gap-6"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>Live Status</Link>
            <Link to={"/reports"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>Reports</Link>
          </nav>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined p-2 text-on-surface-variant cursor-pointer active:opacity-80 transition-opacity hover:bg-surface-variant/50 rounded-full"}>notifications</button>
          <button className={"material-symbols-outlined p-2 text-on-surface-variant cursor-pointer active:opacity-80 transition-opacity hover:bg-surface-variant/50 rounded-full"}>account_circle</button>
        </div>
      </header>
      <Sidebar />
      <main className={"ml-64 mt-16 p-gutter h-[calc(100vh-64px)] overflow-y-auto"}>
        <div className={"max-w-layout-max-width mx-auto flex flex-col gap-6"}>
          <div className={"flex justify-between items-end"}>
            <div>
              <h1 className={"font-display-md text-display-md text-primary mb-2"}>Reports & Analytics</h1>
              <p className={"text-on-surface-variant max-w-2xl"}>Generate, schedule, and download comprehensive heat mitigation reports across all zones.</p>
            </div>
            <div className={"flex gap-3"}>
              <button className={"bg-surface-container-high text-on-surface px-4 py-2 border border-outline-variant hover:bg-surface-variant transition-colors flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>schedule</span>
                <span>Schedule</span>
              </button>
              <button onClick={() => setShowNew(true)} className={"bg-primary text-on-primary px-6 py-2 font-bold hover:brightness-110 transition-all flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>add</span>
                <span>New Report</span>
              </button>
            </div>
          </div>

          {showNew && (
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm mb-4"}>Generate New Report</h3>
              <div className={"flex flex-wrap gap-4 items-end"}>
                <div className={"flex-1 min-w-[200px]"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1"}>Report Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={`${newType} — ${new Date().toLocaleDateString()}`}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary outline-none"} />
                </div>
                <div className={"w-48"}>
                  <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1"}>Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary outline-none"}>
                    <option>Thermal Analysis</option>
                    <option>Intervention</option>
                    <option>Compliance</option>
                  </select>
                </div>
                <div className={"flex gap-2"}>
                  <button onClick={handleGenerate} disabled={generating}
                    className={"bg-primary text-on-primary px-6 py-2 font-bold rounded hover:brightness-110 transition-all disabled:opacity-40"}>
                    {generating ? "Generating..." : "Generate"}
                  </button>
                  <button onClick={() => setShowNew(false)} className={"border border-outline-variant text-on-surface px-4 py-2 rounded hover:bg-surface-variant transition-colors"}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className={"grid grid-cols-1 md:grid-cols-4 gap-4"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-primary"}>{stats.total}</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Total Reports</p>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-tertiary"}>{stats.scheduled}</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Scheduled</p>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-primary-container"}>{stats.this_month}</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Generated This Month</p>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-secondary"}>{stats.pending}</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Pending Review</p>
            </div>
          </div>

          <div className={"flex gap-3 flex-wrap"}>
            {REPORT_TYPES.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`px-4 py-2 rounded-full font-bold text-sm border transition-colors ${
                  filter === t.key
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-variant"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={"flex items-center justify-center h-64"}>
              <span className={"text-on-surface-variant animate-pulse"}>Loading reports...</span>
            </div>
          ) : (
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"}>
              <table className={"w-full text-left border-collapse"}>
                <thead className={"bg-surface-container text-on-surface-variant"}>
                  <tr>
                    <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Report Name</th>
                    <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Type</th>
                    <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Date</th>
                    <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Status</th>
                    <th className={"text-right py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>Actions</th>
                  </tr>
                </thead>
                <tbody className={"divide-y divide-outline-variant"}>
                  {reports.length === 0 ? (
                    <tr><td colSpan={5} className={"py-12 text-center text-on-surface-variant"}>No reports yet. Click "New Report" to generate one.</td></tr>
                  ) : reports.map((row, i) => (
                    <tr key={row.id || i} className={"hover:bg-surface-container-low/50 transition-colors"}>
                      <td className={"py-4 px-6 font-body-sm text-body-sm text-on-surface font-medium"}>{row.name}</td>
                      <td className={"py-4 px-6"}><span className={typeBadge(row.type)}>{row.type}</span></td>
                      <td className={"py-4 px-6 font-body-sm text-body-sm text-on-surface-variant"}>{row.date}</td>
                      <td className={"py-4 px-6"}><span className={statusBadge(row.status)}>{row.status}</span></td>
                      <td className={"py-4 px-6 text-right"}>
                        <div className={"flex items-center justify-end gap-2"}>
                          <button onClick={() => handleDownload(row)} className={"p-2 hover:bg-surface-variant/50 rounded transition-colors"}>
                            <span className={"material-symbols-outlined text-sm text-on-surface-variant"}>download</span>
                          </button>
                          <button className={"p-2 hover:bg-surface-variant/50 rounded transition-colors"}>
                            <span className={"material-symbols-outlined text-sm text-on-surface-variant"}>visibility</span>
                          </button>
                          <button className={"p-2 hover:bg-surface-variant/50 rounded transition-colors"}>
                            <span className={"material-symbols-outlined text-sm text-on-surface-variant"}>more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-4"}>
                <span className={"material-symbols-outlined text-primary"}>insights</span>
                Quick Summary
              </h3>
              <div className={"space-y-4"}>
                {reports.length > 0 && reports[0].summary ? (
                  <>
                    <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                      <div className={"flex items-center gap-2 mb-2"}>
                        <span className={"material-symbols-outlined text-primary text-sm"}>thermostat</span>
                        <span className={"font-body-sm text-body-sm text-on-surface font-semibold"}>City Average</span>
                      </div>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                        Current city-wide average: <span className={"text-primary font-semibold"}>{reports[0].summary.city_avg_C}°C</span>
                        {" · "}{reports[0].summary.critical} critical, {reports[0].summary.high} high-risk zones.
                      </p>
                    </div>
                    <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                      <div className={"flex items-center gap-2 mb-2"}>
                        <span className={"material-symbols-outlined text-secondary text-sm"}>assessment</span>
                        <span className={"font-body-sm text-body-sm text-on-surface font-semibold"}>Extremes</span>
                      </div>
                      <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                        Hottest: <span className={"text-secondary font-semibold"}>{reports[0].summary.hottest_zone}</span> ({reports[0].summary.hottest_temp}°C)
                        {" · "}Coolest: <span className={"text-primary font-semibold"}>{reports[0].summary.coolest_zone}</span> ({reports[0].summary.coolest_temp}°C)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant text-center text-on-surface-variant"}>
                    Generate a report to see summary insights.
                  </div>
                )}
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-4"}>
                <span className={"material-symbols-outlined text-secondary"}>analytics</span>
                Report Insights
              </h3>
              <div className={"space-y-4"}>
                <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                  <div className={"flex items-center gap-2 mb-2"}>
                    <span className={"material-symbols-outlined text-primary text-sm"}>trending_down</span>
                    <span className={"font-body-sm text-body-sm text-on-surface font-semibold"}>Temperature Trend</span>
                  </div>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                    Average city-wide temperature: <span className={"text-primary font-semibold"}>{reports.filter(r => r.summary).length > 1 ? "Monitoring across reports" : "Generate multiple reports to track trends"}</span>
                  </p>
                </div>
                <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                  <div className={"flex items-center gap-2 mb-2"}>
                    <span className={"material-symbols-outlined text-secondary text-sm"}>assessment</span>
                    <span className={"font-body-sm text-body-sm text-on-surface font-semibold"}>Most Requested</span>
                  </div>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                    Thermal Analysis reports account for <span className={"text-secondary font-semibold"}>{reports.length > 0 ? Math.round(reports.filter(r => r.type === "Thermal Analysis").length / reports.length * 100) : 0}%</span> of all generated reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
