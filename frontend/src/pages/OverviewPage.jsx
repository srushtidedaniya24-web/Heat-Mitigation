import { useRef } from "react";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import "../styles/pages.css";

export default function OverviewPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "overview");

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
          <div className={"absolute inset-0 w-full h-full"}>
            <div className={"w-full h-full bg-[#000d26]"} data-alt={"A sophisticated dark-themed satellite map of a futuristic Indian city at night, with glowing grid lines and stylized architectural silhouettes. The map features thermal hotspots represented as glowing gradients from teal to deep amber and intense crimson, specifically highlighting different metropolitan zones with high-tech data visualization overlays and sharp digital precision."} style={{"backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCurVZqjqYjJnYfQOi83SLnDy9mG61Z0c6fNQ0LV8Pd6TqXgIwLYIt1OhfL3soBJgf1Mc1b02s2nupQ6hpW-pgrD3SyeLRvxlbmrqDxKmWZIZLALdbT-yn2p6nPqo6ETDDmX3t5DYuOnxhvjDfPXBiF3BkBBSVq5uE4UjgxqI-Q1-qsfnUZD-WdSRjLg1G2AML236wEov9eRIDszTYZGbhAuuGinbZ_FlGxctmwEdiKLmSx-ea4-E27GjI1pgTiq2tKaukl7c9m1zo')"}}></div>
            <div className={"absolute inset-0 pointer-events-none"}>
              <div className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"}>
                <div className={"flex flex-col items-center gap-2"}>
                  <div className={"relative flex items-center justify-center"}>
                    <div className={"absolute w-8 h-8 bg-error rounded-full opacity-30 animate-ping"}></div>
                    <div className={"w-4 h-4 bg-error rounded-full border-2 border-white"}></div>
                  </div>
                  <div className={"bg-surface-container-highest/90 backdrop-blur-md border border-error p-2 rounded flex items-center gap-3 shadow-xl"}>
                    <span className={"font-body-sm font-bold text-on-surface"}>
                      Downtown
                    </span>
                    <span className={"font-data-lg text-error"}>
                      56.8°C
                    </span>
                  </div>
                </div>
              </div>
              <div className={"absolute top-[20%] left-[40%] pointer-events-auto cursor-pointer group"}>
                <div className={"bg-surface-container-high/80 border border-error-container p-1 px-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform"}>
                  <span className={"w-2 h-2 bg-error rounded-full"}></span>
                  <span className={"text-[11px] font-bold"}>
                    Northview: 54.1°C
                  </span>
                </div>
              </div>
              <div className={"absolute top-[35%] left-[65%] pointer-events-auto cursor-pointer group"}>
                <div className={"bg-surface-container-high/80 border border-secondary-container p-1 px-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform"}>
                  <span className={"w-2 h-2 bg-secondary-container rounded-full"}></span>
                  <span className={"text-[11px] font-bold"}>
                    Riverside: 49.3°C
                  </span>
                </div>
              </div>
              <div className={"absolute top-[60%] left-[30%] pointer-events-auto cursor-pointer group"}>
                <div className={"bg-surface-container-high/80 border border-secondary-container p-1 px-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform"}>
                  <span className={"w-2 h-2 bg-secondary-container rounded-full"}></span>
                  <span className={"text-[11px] font-bold"}>
                    Westhill: 47.2°C
                  </span>
                </div>
              </div>
              <div className={"absolute top-[70%] left-[60%] pointer-events-auto cursor-pointer group"}>
                <div className={"bg-surface-container-high/80 border border-error-container p-1 px-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform"}>
                  <span className={"w-2 h-2 bg-error rounded-full"}></span>
                  <span className={"text-[11px] font-bold"}>
                    Eastwood: 53.6°C
                  </span>
                </div>
              </div>
              <div className={"absolute top-[15%] left-[75%] pointer-events-auto cursor-pointer group"}>
                <div className={"bg-surface-container-high/80 border border-primary p-1 px-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform"}>
                  <span className={"w-2 h-2 bg-primary rounded-full"}></span>
                  <span className={"text-[11px] font-bold"}>
                    Lakeside: 41.8°C
                  </span>
                </div>
              </div>
              <div className={"absolute top-[80%] left-[45%] pointer-events-auto cursor-pointer group"}>
                <div className={"bg-surface-container-high/80 border border-tertiary-container p-1 px-3 rounded-full flex items-center gap-2 group-hover:scale-105 transition-transform"}>
                  <span className={"w-2 h-2 bg-tertiary-container rounded-full"}></span>
                  <span className={"text-[11px] font-bold"}>
                    Southpark: 44.6°C
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className={"absolute top-6 left-6 flex flex-col gap-2"}>
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
          <div className={"absolute top-6 right-6 flex flex-col items-center gap-3"}>
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
          <div className={"absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl bg-surface-container-low/95 backdrop-blur border border-outline-variant p-4 rounded-xl shadow-2xl"}>
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
                Downtown
              </h2>
              <span className={"material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface"}>
                close
              </span>
            </div>
            <div className={"flex flex-col items-center py-4 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-6"}>
              <div className={"relative mb-2"}>
                <div className={"absolute -inset-4 rounded-full border border-error/20 pulse-ring"}></div>
                <span className={"font-data-lg text-[42px] leading-tight text-error tracking-tighter"}>
                  56.8°C
                </span>
              </div>
              <span className={"font-data-sm text-data-sm text-error/80 uppercase tracking-widest"}>
                Ambient Air Temp
              </span>
            </div>
            <div className={"space-y-4"}>
              <div className={"flex justify-between items-end"}>
                <span className={"font-body-sm text-on-surface-variant"}>
                  Heat Risk Index
                </span>
                <span className={"font-data-lg text-error"}>
                  9.2/10
                </span>
              </div>
              <div className={"h-2 w-full bg-surface-variant rounded-full overflow-hidden"}>
                <div className={"h-full bg-error"} style={{"width": "92%"}}></div>
              </div>
              <div className={"flex gap-2 pt-2"}>
                <span className={"px-2 py-0.5 bg-error/10 border border-error/40 text-error text-[10px] font-bold rounded"}>
                  CRITICAL
                </span>
                <span className={"px-2 py-0.5 bg-on-surface-variant/10 border border-on-surface-variant/40 text-on-surface-variant text-[10px] font-bold rounded"}>
                  POP: 31,345
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
            <ul className={"space-y-3 mb-6"}>
              <li className={"flex items-start gap-3"}>
                <span className={"material-symbols-outlined text-error text-lg mt-0.5"}>
                  warning
                </span>
                <p className={"font-body-sm text-on-surface-variant"}>
                  <span className={"text-on-surface font-medium"}>
                    Low-albedo roofs
                  </span>
                  absorbing 85% of solar radiation.
                </p>
              </li>
              <li className={"flex items-start gap-3"}>
                <span className={"material-symbols-outlined text-error text-lg mt-0.5"}>
                  warning
                </span>
                <p className={"font-body-sm text-on-surface-variant"}>
                  <span className={"text-on-surface font-medium"}>
                    Road density
                  </span>
                  above 45% creates massive thermal storage.
                </p>
              </li>
              <li className={"flex items-start gap-3"}>
                <span className={"material-symbols-outlined text-error text-lg mt-0.5"}>
                  warning
                </span>
                <p className={"font-body-sm text-on-surface-variant"}>
                  <span className={"text-on-surface font-medium"}>
                    Low NDVI
                  </span>
                  index (0.12) indicates severe lack of vegetation.
                </p>
              </li>
              <li className={"flex items-start gap-3"}>
                <span className={"material-symbols-outlined text-primary text-lg mt-0.5"}>
                  check_circle
                </span>
                <p className={"font-body-sm text-on-surface-variant"}>
                  <span className={"text-on-surface font-medium"}>
                    Cool pavement
                  </span>
                  projects could mitigate up to 3.2°C.
                </p>
              </li>
            </ul>
            <div className={"space-y-3"}>
              <h4 className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-2"}>
                SHAP Feature Importance
              </h4>
              <div className={"space-y-2"}>
                <div className={"flex items-center gap-3"}>
                  <span className={"w-20 font-data-sm text-[10px] truncate"}>
                    Roof Albedo
                  </span>
                  <div className={"flex-1 h-3 bg-error/20 rounded overflow-hidden"}>
                    <div className={"h-full bg-error"} style={{"width": "85%"}}></div>
                  </div>
                </div>
                <div className={"flex items-center gap-3"}>
                  <span className={"w-20 font-data-sm text-[10px] truncate"}>
                    Asphalt %
                  </span>
                  <div className={"flex-1 h-3 bg-error/20 rounded overflow-hidden"}>
                    <div className={"h-full bg-error"} style={{"width": "65%"}}></div>
                  </div>
                </div>
                <div className={"flex items-center gap-3"}>
                  <span className={"w-20 font-data-sm text-[10px] truncate"}>
                    Canyon Ratio
                  </span>
                  <div className={"flex-1 h-3 bg-error/20 rounded overflow-hidden"}>
                    <div className={"h-full bg-error"} style={{"width": "40%"}}></div>
                  </div>
                </div>
              </div>
            </div>
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
