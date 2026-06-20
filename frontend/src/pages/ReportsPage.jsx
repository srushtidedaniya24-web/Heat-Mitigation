import { useRef } from "react";
import { Link } from "react-router-dom";
import usePageInteractions from "../hooks/usePageInteractions";
import Sidebar from "../components/Sidebar";
import "../styles/pages.css";

export default function ReportsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "reports");

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
            <Link to={"/reports"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Reports
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
                Reports & Analytics
              </h1>
              <p className={"text-on-surface-variant max-w-2xl"}>
                Generate, schedule, and download comprehensive heat mitigation reports across all zones.
              </p>
            </div>
            <div className={"flex gap-3"}>
              <button className={"bg-surface-container-high text-on-surface px-4 py-2 border border-outline-variant hover:bg-surface-variant transition-colors flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  schedule
                </span>
                <span>Schedule</span>
              </button>
              <button className={"bg-primary text-on-primary px-6 py-2 font-bold hover:brightness-110 transition-all flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  add
                </span>
                <span>New Report</span>
              </button>
            </div>
          </div>
          <div className={"grid grid-cols-1 md:grid-cols-4 gap-4"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-primary"}>24</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Total Reports</p>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-tertiary"}>8</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Scheduled</p>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-primary-container"}>12</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Generated This Month</p>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-center"}>
              <p className={"font-display-md text-display-md text-secondary"}>4</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Pending Review</p>
            </div>
          </div>
          <div className={"flex gap-3 flex-wrap"}>
            <button className={"px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm border border-primary/30"}>All Reports</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Thermal Analysis</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Intervention</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Compliance</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Scheduled</button>
          </div>
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
                {[
                  { name: "Q2 2026 Urban Heat Summary", type: "Thermal Analysis", date: "18 Jun 2026", status: "Final" },
                  { name: "Downtown Intervention ROI Model", type: "Intervention", date: "15 Jun 2026", status: "Draft" },
                  { name: "Heat Vulnerability Index — All Zones", type: "Compliance", date: "12 Jun 2026", status: "Final" },
                  { name: "Monthly Cooling Progress Report", type: "Thermal Analysis", date: "01 Jun 2026", status: "Final" },
                  { name: "Eastwood Green Roof Feasibility", type: "Intervention", date: "28 May 2026", status: "Review" },
                  { name: "NDVI Change Detection (May 2026)", type: "Thermal Analysis", date: "25 May 2026", status: "Final" },
                  { name: "City-Wide Albedo Assessment", type: "Compliance", date: "20 May 2026", status: "Scheduled" },
                ].map((row, i) => (
                  <tr key={i} className={"hover:bg-surface-container-low/50 transition-colors"}>
                    <td className={"py-4 px-6 font-body-sm text-body-sm text-on-surface font-medium"}>{row.name}</td>
                    <td className={"py-4 px-6"}>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.type === "Thermal Analysis" ? "bg-primary/10 text-primary border border-primary/30" :
                        row.type === "Intervention" ? "bg-secondary/10 text-secondary border border-secondary/30" :
                        "bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/40"
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className={"py-4 px-6 font-body-sm text-body-sm text-on-surface-variant"}>{row.date}</td>
                    <td className={"py-4 px-6"}>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === "Final" ? "bg-primary/10 text-primary border border-primary/30" :
                        row.status === "Draft" ? "bg-on-surface-variant/10 text-on-surface-variant border border-on-surface-variant/30" :
                        row.status === "Review" ? "bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/40" :
                        "bg-primary-container/20 text-primary-container border border-primary-container/30"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className={"py-4 px-6 text-right"}>
                      <div className={"flex items-center justify-end gap-2"}>
                        <button className={"p-2 hover:bg-surface-variant/50 rounded transition-colors"}>
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
          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-4"}>
                <span className={"material-symbols-outlined text-primary"}>auto_schedule</span>
                Scheduled Reports
              </h3>
              <div className={"space-y-3"}>
                {[
                  { name: "Daily Thermal Summary", freq: "Daily at 08:00", next: "21 Jun 2026" },
                  { name: "Weekly Zone Comparison", freq: "Every Monday", next: "22 Jun 2026" },
                  { name: "Monthly Compliance Report", freq: "1st of each month", next: "01 Jul 2026" },
                ].map((s, i) => (
                  <div key={i} className={"flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant"}>
                    <div>
                      <p className={"font-body-sm text-body-sm text-on-surface font-medium"}>{s.name}</p>
                      <p className={"font-data-sm text-[11px] text-on-surface-variant"}>{s.freq} — Next: {s.next}</p>
                    </div>
                    <button className={"text-primary hover:text-primary-fixed transition-colors"}>
                      <span className={"material-symbols-outlined"}>edit</span>
                    </button>
                  </div>
                ))}
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
                    Average city-wide temperature has decreased by <span className={"text-primary font-semibold"}>1.2°C</span> since intervention reports began.
                  </p>
                </div>
                <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                  <div className={"flex items-center gap-2 mb-2"}>
                    <span className={"material-symbols-outlined text-secondary text-sm"}>assessment</span>
                    <span className={"font-body-sm text-body-sm text-on-surface font-semibold"}>Most Requested</span>
                  </div>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                    Thermal Analysis reports account for <span className={"text-secondary font-semibold"}>58%</span> of all generated reports this quarter.
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
