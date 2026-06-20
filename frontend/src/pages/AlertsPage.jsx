import { useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import "../styles/pages.css";

export default function AlertsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "alerts");

  return (
    <div ref={rootRef} className="alerts-page data-grid-bg">
      <nav className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary dark:text-primary tracking-tight"}>
            ThermaCity
          </span>
          <div className={"hidden md:flex gap-6 ml-8"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 px-3 py-1 rounded transition-colors"}>
              Overview
            </Link>
            <Link to={"/alerts"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Alerts
            </Link>
          </div>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"p-2 hover:bg-surface-variant/50 rounded-full transition-colors relative"}>
            <span className={"material-symbols-outlined text-on-surface"}>
              notifications
            </span>
            <span className={"absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full"}></span>
          </button>
          <div className={"flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant cursor-pointer"}>
            <span className={"material-symbols-outlined text-primary"}>
              account_circle
            </span>
            <span className={"font-data-sm text-data-sm text-on-surface"}>
              ADMIN_04
            </span>
          </div>
        </div>
      </nav>
      <Sidebar />
      <aside className={"fixed right-0 top-16 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest border-l border-outline-variant hidden xl:flex"}>
        <div className={"p-6 border-b border-outline-variant"}>
          <h3 className={"font-headline-sm text-headline-sm text-secondary"}>
            Intelligence Panel
          </h3>
          <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
            Data Density: High
          </p>
        </div>
        <div className={"p-6 space-y-6"}>
          <div className={"space-y-4"}>
            <div className={"flex justify-between items-end"}>
              <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase"}>
                Critical Hotspots
              </span>
              <span className={"font-data-lg text-data-lg text-secondary"}>
                12
              </span>
            </div>
            <div className={"h-2 w-full bg-surface-container-highest rounded-full overflow-hidden"}>
              <div className={"h-full bg-secondary w-3/4"}></div>
            </div>
          </div>
          <div className={"glass-panel p-4 rounded-lg border border-outline-variant"}>
            <div className={"flex items-center gap-2 mb-3"}>
              <span className={"material-symbols-outlined text-secondary"}>
                psychology
              </span>
              <span className={"font-data-sm text-data-sm text-on-surface"}>
                AI Insights
              </span>
            </div>
            <p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
              Elevated surface temperatures detected in 4 sectors. Predicted peak intensity in 180 minutes. Deployment of mobile cooling units suggested for Sector 7G.
            </p>
          </div>
          <div className={"space-y-3"}>
            <h4 className={"font-data-sm text-data-sm text-on-surface-variant uppercase"}>
              Active Zones
            </h4>
            <div className={"space-y-2"}>
              <div className={"flex items-center justify-between p-3 bg-surface-container rounded border border-outline-variant/30"}>
                <div className={"flex items-center gap-2"}>
                  <span className={"material-symbols-outlined text-primary text-sm"}>
                    location_on
                  </span>
                  <span className={"font-body-sm text-body-sm"}>
                    Downtown Core
                  </span>
                </div>
                <span className={"font-data-sm text-data-sm text-secondary"}>
                  56°C
                </span>
              </div>
              <div className={"flex items-center justify-between p-3 bg-surface-container rounded border border-outline-variant/30"}>
                <div className={"flex items-center gap-2"}>
                  <span className={"material-symbols-outlined text-primary text-sm"}>
                    location_on
                  </span>
                  <span className={"font-body-sm text-body-sm"}>
                    Northview High
                  </span>
                </div>
                <span className={"font-data-sm text-data-sm text-secondary"}>
                  48°C
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <main className={"ml-64 mr-0 xl:mr-80 pt-24 px-gutter pb-12 transition-all"}>
        <div className={"max-w-layout-max-width mx-auto"}>
          <div className={"flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"}>
            <div>
              <h1 className={"font-display-md text-display-md font-bold text-on-background"}>
                System Alerts
              </h1>
              <p className={"font-body-md text-body-md text-on-surface-variant"}>
                Real-time thermal monitoring and emergency response triggers.
              </p>
            </div>
            <div className={"flex flex-wrap gap-2"}>
              <button className={"px-4 py-2 bg-primary text-on-primary font-bold rounded flex items-center gap-2 shadow-lg shadow-primary/20"}>
                <span className={"material-symbols-outlined text-sm"}>
                  download
                </span>
                Export Report
              </button>
              <button className={"px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 transition-colors rounded"}>
                Archive All
              </button>
            </div>
          </div>
          <div className={"flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"}>
            <button className={"px-5 py-1.5 bg-primary text-on-primary rounded-full font-bold text-sm whitespace-nowrap"}>
              All Alerts (24)
            </button>
            <button className={"px-5 py-1.5 bg-surface-container-high text-secondary border border-secondary/30 rounded-full font-medium text-sm whitespace-nowrap hover:bg-secondary/10 transition-colors"}>
              Critical (2)
            </button>
            <button className={"px-5 py-1.5 bg-surface-container-high text-on-secondary-container border border-secondary-container/30 rounded-full font-medium text-sm whitespace-nowrap hover:bg-secondary-container/10 transition-colors"}>
              High (8)
            </button>
            <button className={"px-5 py-1.5 bg-surface-container-high text-tertiary border border-tertiary/30 rounded-full font-medium text-sm whitespace-nowrap hover:bg-tertiary/10 transition-colors"}>
              Medium (11)
            </button>
            <button className={"px-5 py-1.5 bg-surface-container-high text-outline rounded-full font-medium text-sm whitespace-nowrap hover:bg-surface-variant/50 transition-colors"}>
              Resolved (3)
            </button>
          </div>
          <div className={"space-y-4"}>
            <div className={"alert-critical bg-surface-container p-6 rounded-lg border border-outline-variant hover:border-secondary/50 transition-all group"} data-alert-card={"true"}>
              <div className={"flex flex-col md:flex-row gap-6"}>
                <div className={"flex-1"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <span className={"px-2 py-0.5 bg-secondary/10 border border-secondary/40 text-secondary text-[10px] font-bold uppercase tracking-wider rounded thermal-pulse"}>
                      Critical
                    </span>
                    <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                      ID: THERM-0922-A
                    </span>
                    <span className={"ml-auto md:ml-0 font-data-sm text-data-sm text-on-surface-variant flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-sm"}>
                        schedule
                      </span>
                      2 hours ago
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-2"}>
                    Extreme Heat Emergency - Downtown
                  </h3>
                  <div className={"flex flex-wrap gap-4 mt-4"}>
                    <div className={"bg-surface-container-low px-4 py-2 rounded border border-outline-variant"}>
                      <p className={"text-[10px] text-on-surface-variant uppercase"}>
                        Threshold Status
                      </p>
                      <p className={"font-data-lg text-data-lg text-secondary"}>
                        56°C
                        <span className={"text-sm font-normal text-on-surface-variant"}>
                          Exceeded
                        </span>
                      </p>
                    </div>
                    <div className={"bg-surface-container-low px-4 py-2 rounded border border-outline-variant"}>
                      <p className={"text-[10px] text-on-surface-variant uppercase"}>
                        Population Impact
                      </p>
                      <p className={"font-data-lg text-data-lg text-on-surface"}>
                        31,345
                        <span className={"text-sm font-normal text-on-surface-variant"}>
                          At Risk
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"flex md:flex-col justify-end gap-2"}>
                  <button className={"flex-1 md:flex-none px-6 py-2 bg-secondary text-on-secondary font-bold rounded hover:opacity-90 active:scale-95 transition-all"}>
                    View on Map
                  </button>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 rounded transition-all"}>
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
            <div className={"alert-critical bg-surface-container p-6 rounded-lg border border-outline-variant hover:border-secondary/50 transition-all group"} data-alert-card={"true"}>
              <div className={"flex flex-col md:flex-row gap-6"}>
                <div className={"flex-1"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <span className={"px-2 py-0.5 bg-secondary/10 border border-secondary/40 text-secondary text-[10px] font-bold uppercase tracking-wider rounded thermal-pulse"}>
                      Critical
                    </span>
                    <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                      ID: THERM-0922-B
                    </span>
                    <span className={"ml-auto md:ml-0 font-data-sm text-data-sm text-on-surface-variant flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-sm"}>
                        schedule
                      </span>
                      5 hours ago
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-2"}>
                    Heat Index Spike - Northview
                  </h3>
                  <div className={"flex flex-wrap gap-4 mt-4"}>
                    <div className={"bg-surface-container-low px-4 py-2 rounded border border-outline-variant"}>
                      <p className={"text-[10px] text-on-surface-variant uppercase"}>
                        Rate of Change
                      </p>
                      <p className={"font-data-lg text-data-lg text-secondary"}>
                        +4.2°C
                        <span className={"text-sm font-normal text-on-surface-variant"}>
                          Increase
                        </span>
                      </p>
                    </div>
                    <div className={"bg-surface-container-low px-4 py-2 rounded border border-outline-variant"}>
                      <p className={"text-[10px] text-on-surface-variant uppercase"}>
                        Sensor Group
                      </p>
                      <p className={"font-data-lg text-data-lg text-on-surface"}>
                        NV-04 to NV-09
                      </p>
                    </div>
                  </div>
                </div>
                <div className={"flex md:flex-col justify-end gap-2"}>
                  <button className={"flex-1 md:flex-none px-6 py-2 bg-secondary text-on-secondary font-bold rounded hover:opacity-90 active:scale-95 transition-all"}>
                    View on Map
                  </button>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 rounded transition-all"}>
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
            <div className={"alert-high bg-surface-container p-6 rounded-lg border border-outline-variant hover:border-secondary-container/50 transition-all"} data-alert-card={"true"}>
              <div className={"flex flex-col md:flex-row gap-6"}>
                <div className={"flex-1"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <span className={"px-2 py-0.5 bg-secondary-container/10 border border-secondary-container/40 text-secondary-container text-[10px] font-bold uppercase tracking-wider rounded"}>
                      High Priority
                    </span>
                    <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                      ID: NDVI-0411
                    </span>
                    <span className={"ml-auto md:ml-0 font-data-sm text-data-sm text-on-surface-variant flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-sm"}>
                        schedule
                      </span>
                      1 day ago
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-2"}>
                    NDVI Critically Low - Eastwood
                  </h3>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant max-w-2xl"}>
                    Vegetation health index has dropped below critical levels (0.10). Significant moisture stress detected. Irrigation intervention required to prevent thermal absorption increase.
                  </p>
                </div>
                <div className={"flex md:flex-col justify-end gap-2"}>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-secondary-container text-secondary-container font-bold rounded hover:bg-secondary-container/10 transition-all"}>
                    View on Map
                  </button>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 rounded transition-all"}>
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
            <div className={"alert-high bg-surface-container p-6 rounded-lg border border-outline-variant hover:border-secondary-container/50 transition-all"} data-alert-card={"true"}>
              <div className={"flex flex-col md:flex-row gap-6"}>
                <div className={"flex-1"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <span className={"px-2 py-0.5 bg-secondary-container/10 border border-secondary-container/40 text-secondary-container text-[10px] font-bold uppercase tracking-wider rounded"}>
                      High Priority
                    </span>
                    <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                      ID: OPS-882
                    </span>
                    <span className={"ml-auto md:ml-0 font-data-sm text-data-sm text-on-surface-variant flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-sm"}>
                        schedule
                      </span>
                      2 days ago
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-2"}>
                    Cool Roof Intervention Due - Riverside
                  </h3>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant max-w-2xl"}>
                    Albedo values in the Riverside industrial zone have degraded by 15%. Re-coating schedule is overdue. Predicted heat gain impact: +2.1°C per building.
                  </p>
                </div>
                <div className={"flex md:flex-col justify-end gap-2"}>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-secondary-container text-secondary-container font-bold rounded hover:bg-secondary-container/10 transition-all"}>
                    View on Map
                  </button>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 rounded transition-all"}>
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
            <div className={"alert-medium bg-surface-container p-6 rounded-lg border border-outline-variant hover:border-tertiary/50 transition-all"} data-alert-card={"true"}>
              <div className={"flex flex-col md:flex-row gap-6"}>
                <div className={"flex-1"}>
                  <div className={"flex items-center gap-3 mb-2"}>
                    <span className={"px-2 py-0.5 bg-tertiary/10 border border-tertiary/40 text-tertiary text-[10px] font-bold uppercase tracking-wider rounded"}>
                      Medium
                    </span>
                    <span className={"font-data-sm text-data-sm text-on-surface-variant"}>
                      ID: SYS-ML-01
                    </span>
                    <span className={"ml-auto md:ml-0 font-data-sm text-data-sm text-on-surface-variant flex items-center gap-1"}>
                      <span className={"material-symbols-outlined text-sm"}>
                        schedule
                      </span>
                      3 days ago
                    </span>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface mb-2"}>
                    Model Retraining Recommended
                  </h3>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant max-w-2xl"}>
                    Observed thermal patterns deviate from current AI predictive model by 8%. Retraining with new sensor data from the last 72 hours is recommended for accuracy.
                  </p>
                </div>
                <div className={"flex md:flex-col justify-end gap-2"}>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-tertiary text-tertiary font-bold rounded hover:bg-tertiary/10 transition-all"}>
                    View Details
                  </button>
                  <button className={"flex-1 md:flex-none px-6 py-2 border border-outline-variant text-on-surface hover:bg-surface-variant/50 rounded transition-all"}>
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={"md:hidden fixed bottom-4 right-4 left-4 glass-panel p-4 rounded-xl flex items-center justify-between border-primary/30 z-[70]"}>
            <div className={"flex items-center gap-3"}>
              <span className={"w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"}>
                <span className={"material-symbols-outlined text-secondary"}>
                  warning
                </span>
              </span>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface"}>
                  2 Critical Alerts
                </p>
                <p className={"text-[10px] text-on-surface-variant"}>
                  Action required in Sector 4
                </p>
              </div>
            </div>
            <button className={"bg-primary text-on-primary font-bold px-4 py-2 rounded-lg text-sm"}>
              Review All
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
