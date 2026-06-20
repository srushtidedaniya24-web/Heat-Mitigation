import { useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import "../styles/pages.css";

export default function OptimizationPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "optimization");

  return (
    <div ref={rootRef} className="optimization-page bg-background text-on-surface font-body-md overflow-hidden">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant dark:border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary dark:text-primary tracking-tight"}>
            ThermaCity
          </span>
          <div className={"hidden md:flex gap-6 ml-8"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-2 py-1"}>
              Live Status
            </Link>
          </div>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined text-primary hover:bg-surface-variant/50 p-2 transition-colors cursor-pointer active:opacity-80"}>
            notifications
          </button>
          <button className={"material-symbols-outlined text-primary hover:bg-surface-variant/50 p-2 transition-colors cursor-pointer active:opacity-80"}>
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
                City-Wide Intervention Planner
              </h1>
              <p className={"text-on-surface-variant max-w-2xl"}>
                Simulate thermal mitigation strategies across urban zones. Adjust parameters to optimize temperature reduction vs. economic investment.
              </p>
            </div>
            <div className={"flex gap-3"}>
              <button className={"bg-surface-container-high text-on-surface px-4 py-2 border border-outline-variant hover:bg-surface-variant transition-colors flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  history
                </span>
                <span>
                  View Simulations
                </span>
              </button>
              <button className={"bg-primary text-on-primary px-6 py-2 font-bold hover:brightness-110 transition-all flex items-center gap-2 rounded"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  play_arrow
                </span>
                <span>
                  Run Full Sim
                </span>
              </button>
            </div>
          </div>
          <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"}>
            <table className={"w-full border-collapse"}>
              <thead className={"bg-surface-container text-on-surface-variant"}>
                <tr>
                  <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>
                    Zone
                  </th>
                  <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>
                    Intervention Type
                  </th>
                  <th className={"text-left py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>
                    Coverage
                  </th>
                  <th className={"text-right py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>
                    Proj. ΔT
                  </th>
                  <th className={"text-right py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>
                    Est. Cost
                  </th>
                  <th className={"text-center py-4 px-6 font-data-sm text-data-sm uppercase tracking-wider"}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className={"divide-y divide-outline-variant"}>
                <tr className={"hover:bg-surface-container-low transition-colors group"}>
                  <td className={"py-4 px-6 font-headline-sm text-headline-sm text-on-surface"}>
                    Downtown
                  </td>
                  <td className={"py-4 px-6"}>
                    <select className={"bg-surface-container-high border-outline-variant text-on-surface text-body-sm p-1 px-2 rounded w-full focus:border-primary outline-none appearance-none cursor-pointer"} defaultValue={"Cool Roofs"}>
                      <option>
                        Cool Roofs
                      </option>
                      <option>
                        Urban Forest
                      </option>
                      <option>
                        Phase Change Materials
                      </option>
                    </select>
                  </td>
                  <td className={"py-4 px-6 min-w-[200px]"}>
                    <div className={"flex items-center gap-4"}>
                      <input className={"flex-1"} max={"100"} min={"0"} type={"range"} defaultValue={"65"} />
                      <span className={"font-data-sm text-data-sm text-primary w-8 text-right"}>
                        65%
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right"}>
                    <div className={"inline-flex items-center gap-1 text-[#ff4e1a] font-data-lg text-data-lg"}>
                      <span>
                        -12.5°C
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right font-data-lg text-data-lg"}>
                    ₹2.4Cr
                  </td>
                  <td className={"py-4 px-6 text-center"}>
                    <span className={"bg-primary/10 border border-primary/40 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>
                      Active
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-container-low transition-colors"}>
                  <td className={"py-4 px-6 font-headline-sm text-headline-sm text-on-surface"}>
                    Northview
                  </td>
                  <td className={"py-4 px-6"}>
                    <select className={"bg-surface-container-high border-outline-variant text-on-surface text-body-sm p-1 px-2 rounded w-full focus:border-primary outline-none"} defaultValue={"Cool Pavements"}>
                      <option>
                        Cool Pavements
                      </option>
                      <option>
                        Green Roofs
                      </option>
                      <option>
                        Water Features
                      </option>
                    </select>
                  </td>
                  <td className={"py-4 px-6 min-w-[200px]"}>
                    <div className={"flex items-center gap-4"}>
                      <input className={"flex-1"} max={"100"} min={"0"} type={"range"} defaultValue={"50"} />
                      <span className={"font-data-sm text-data-sm text-primary w-8 text-right"}>
                        50%
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right"}>
                    <div className={"inline-flex items-center gap-1 text-tertiary font-data-lg text-data-lg"}>
                      <span>
                        -8.2°C
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right font-data-lg text-data-lg"}>
                    ₹1.8Cr
                  </td>
                  <td className={"py-4 px-6 text-center"}>
                    <span className={"bg-primary/10 border border-primary/40 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>
                      Active
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-container-low transition-colors"}>
                  <td className={"py-4 px-6 font-headline-sm text-headline-sm text-on-surface"}>
                    Eastwood
                  </td>
                  <td className={"py-4 px-6"}>
                    <select className={"bg-surface-container-high border-outline-variant text-on-surface text-body-sm p-1 px-2 rounded w-full focus:border-primary outline-none"} defaultValue={"Urban Greening"}>
                      <option>
                        Urban Greening
                      </option>
                      <option>
                        Vertical Gardens
                      </option>
                      <option>
                        Cool Albedo Walls
                      </option>
                    </select>
                  </td>
                  <td className={"py-4 px-6 min-w-[200px]"}>
                    <div className={"flex items-center gap-4"}>
                      <input className={"flex-1"} max={"100"} min={"0"} type={"range"} defaultValue={"40"} />
                      <span className={"font-data-sm text-data-sm text-primary w-8 text-right"}>
                        40%
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right"}>
                    <div className={"inline-flex items-center gap-1 text-primary font-data-lg text-data-lg"}>
                      <span>
                        -5.9°C
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right font-data-lg text-data-lg"}>
                    ₹1.3Cr
                  </td>
                  <td className={"py-4 px-6 text-center"}>
                    <span className={"bg-primary/10 border border-primary/40 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>
                      Active
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-container-low transition-colors"}>
                  <td className={"py-4 px-6 font-headline-sm text-headline-sm text-on-surface"}>
                    Westside
                  </td>
                  <td className={"py-4 px-6"}>
                    <select className={"bg-surface-container-high border-outline-variant text-on-surface text-body-sm p-1 px-2 rounded w-full focus:border-primary outline-none"} defaultValue={"Water Features"}>
                      <option>
                        Urban Greening
                      </option>
                      <option>
                        Water Features
                      </option>
                      <option>
                        Shade Structures
                      </option>
                    </select>
                  </td>
                  <td className={"py-4 px-6 min-w-[200px]"}>
                    <div className={"flex items-center gap-4"}>
                      <input className={"flex-1"} max={"100"} min={"0"} type={"range"} defaultValue={"20"} />
                      <span className={"font-data-sm text-data-sm text-primary w-8 text-right"}>
                        20%
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right"}>
                    <div className={"inline-flex items-center gap-1 text-primary font-data-lg text-data-lg"}>
                      <span>
                        -3.1°C
                      </span>
                    </div>
                  </td>
                  <td className={"py-4 px-6 text-right font-data-lg text-data-lg"}>
                    ₹0.0Cr
                  </td>
                  <td className={"py-4 px-6 text-center"}>
                    <span className={"bg-surface-variant/20 border border-outline-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"}>
                      Paused
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={"bg-surface-container-highest border border-primary/20 rounded-xl p-6 flex flex-wrap items-center justify-between gap-8"}>
            <div className={"flex items-center gap-10"}>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>
                  Total Investment
                </p>
                <p className={"font-display-md text-display-md text-on-surface"}>
                  ₹5.5 Cr
                </p>
              </div>
              <div className={"w-px h-12 bg-outline-variant"}></div>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>
                  Avg Reduction
                </p>
                <p className={"font-display-md text-display-md text-primary"}>
                  -8.7°C
                </p>
              </div>
              <div className={"w-px h-12 bg-outline-variant"}></div>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>
                  Pop. Benefited
                </p>
                <p className={"font-display-md text-display-md text-on-surface"}>
                  127,390
                </p>
              </div>
              <div className={"w-px h-12 bg-outline-variant"}></div>
              <div>
                <p className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest mb-1"}>
                  Zones Safe
                </p>
                <div className={"flex items-baseline gap-2"}>
                  <p className={"font-display-md text-display-md text-on-surface"}>
                    4
                  </p>
                  <span className={"font-headline-sm text-headline-sm text-on-surface-variant"}>
                    / 7
                  </span>
                </div>
              </div>
            </div>
            <button className={"bg-primary text-on-primary h-16 px-8 rounded-lg font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(70,241,207,0.2)]"}>
              <span className={"material-symbols-outlined"}>
                summarize
              </span>
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
                <span className={"font-data-sm text-data-sm text-on-error bg-error/20 px-2 py-0.5 rounded"}>
                  High Stress
                </span>
              </div>
              <div className={"relative aspect-video rounded-lg overflow-hidden border border-outline-variant bg-[#0A0E1A]"}>
                <div className={"absolute inset-0 flex items-center justify-center pointer-events-none"}>
                  <div className={"text-center"}>
                    <p className={"font-data-sm text-data-sm uppercase tracking-[0.2em] opacity-30"}>
                      Current State: Hotspots Detected
                    </p>
                  </div>
                </div>
                <div className={"absolute bottom-4 left-4 bg-background/80 backdrop-blur p-2 rounded border border-outline-variant"}>
                  <div className={"flex items-center gap-2"}>
                    <div className={"w-24 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-red-900 rounded"}></div>
                    <span className={"font-data-sm text-data-sm"}>
                      38°C - 48°C
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={"hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center"}>
              <div className={"bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border border-primary"}>
                <span className={"material-symbols-outlined text-[16px]"}>
                  trending_down
                </span>
                -8.7°C average
              </div>
              <div className={"w-px h-12 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50"}></div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <div className={"flex justify-between items-center mb-4"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"w-2 h-2 rounded-full bg-primary"}></span>
                  Projected Optimization
                </h3>
                <span className={"font-data-sm text-data-sm text-primary bg-primary/20 px-2 py-0.5 rounded"}>
                  Optimized
                </span>
              </div>
              <div className={"relative aspect-video rounded-lg overflow-hidden border border-outline-variant bg-[#0A0E1A]"}>
                <div className={"absolute inset-0 flex items-center justify-center pointer-events-none"}>
                  <div className={"text-center"}>
                    <p className={"font-data-sm text-data-sm uppercase tracking-[0.2em] opacity-30"}>
                      Projected: Tonal Stabilization
                    </p>
                  </div>
                </div>
                <div className={"absolute bottom-4 left-4 bg-background/80 backdrop-blur p-2 rounded border border-outline-variant"}>
                  <div className={"flex items-center gap-2"}>
                    <div className={"w-24 h-2 bg-gradient-to-r from-teal-500 via-primary to-amber-500 rounded"}></div>
                    <span className={"font-data-sm text-data-sm"}>
                      26°C - 34°C
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={"grid grid-cols-12 gap-6 mb-12"}>
            <div className={"col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl"}>
              <h4 className={"font-headline-sm text-headline-sm mb-4"}>
                Implementation Timeline
              </h4>
              <div className={"relative h-24 w-full flex items-end gap-1"}>
                <div className={"flex-1 bg-surface-variant h-[20%] rounded-t hover:bg-primary/40 transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-surface-variant h-[35%] rounded-t hover:bg-primary/40 transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-surface-variant h-[50%] rounded-t hover:bg-primary/40 transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-primary/60 h-[80%] rounded-t hover:bg-primary/80 transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-primary/60 h-[95%] rounded-t hover:bg-primary transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-primary/60 h-[70%] rounded-t hover:bg-primary/80 transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-surface-variant h-[40%] rounded-t hover:bg-primary/40 transition-all cursor-pointer"}></div>
                <div className={"flex-1 bg-surface-variant h-[30%] rounded-t hover:bg-primary/40 transition-all cursor-pointer"}></div>
              </div>
              <div className={"flex justify-between mt-2 font-data-sm text-data-sm text-on-surface-variant"}>
                <span>
                  Phase 1: Setup
                </span>
                <span>
                  Phase 2: Deployment
                </span>
                <span>
                  Phase 3: Stabilization
                </span>
              </div>
            </div>
            <div className={"col-span-12 lg:col-span-4 bg-surface-container-high border border-outline-variant p-6 rounded-xl"}>
              <h4 className={"font-headline-sm text-headline-sm mb-4"}>
                ROI Analytics
              </h4>
              <ul className={"space-y-4"}>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>
                    Energy Saving (Annual)
                  </span>
                  <span className={"text-primary font-data-lg"}>
                    ₹4.2 Cr
                  </span>
                </li>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>
                    Health Cost Reduction
                  </span>
                  <span className={"text-primary font-data-lg"}>
                    ₹1.8 Cr
                  </span>
                </li>
                <li className={"flex justify-between items-center"}>
                  <span className={"text-on-surface-variant font-body-sm"}>
                    CO2 Offset
                  </span>
                  <span className={"text-primary font-data-lg"}>
                    12.4kT
                  </span>
                </li>
                <li className={"pt-4 border-t border-outline-variant flex justify-between items-center"}>
                  <span className={"font-bold"}>
                    Payback Period
                  </span>
                  <span className={"bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded font-bold"}>
                    14 Months
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <aside className={"fixed right-0 top-16 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest dark:bg-surface-container-lowest border-l border-outline-variant dark:border-outline-variant"}>
        <div className={"p-6 border-b border-outline-variant"}>
          <h2 className={"font-display-md text-display-md text-primary text-[24px]"}>
            Intelligence Panel
          </h2>
          <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
            Data Density: High
          </p>
        </div>
        <div className={"flex flex-col flex-1 overflow-y-auto"}>
          <div className={"p-4 bg-surface-container border-b border-outline-variant"}>
            <nav className={"flex gap-4"}>
              <button className={"text-secondary border-b-2 border-secondary font-bold pb-2 text-sm"}>
                Zone Details
              </button>
              <button className={"text-on-surface-variant font-medium pb-2 text-sm hover:text-secondary-fixed transition-colors"}>
                AI Insights
              </button>
              <button className={"text-on-surface-variant font-medium pb-2 text-sm hover:text-secondary-fixed transition-colors"}>
                Simulator
              </button>
            </nav>
          </div>
          <div className={"p-6 space-y-8"}>
            <div>
              <h5 className={"font-data-sm text-data-sm text-on-surface-variant uppercase mb-4"}>
                Intervention Efficiency
              </h5>
              <div className={"space-y-6"}>
                <div className={"space-y-2"}>
                  <div className={"flex justify-between font-data-sm text-data-sm"}>
                    <span>
                      Albedo Effect
                    </span>
                    <span className={"text-secondary"}>
                      88%
                    </span>
                  </div>
                  <div className={"h-1 bg-surface-variant rounded-full"}>
                    <div className={"h-full bg-secondary w-[88%]"}></div>
                  </div>
                </div>
                <div className={"space-y-2"}>
                  <div className={"flex justify-between font-data-sm text-data-sm"}>
                    <span>
                      Evapotranspiration
                    </span>
                    <span className={"text-secondary"}>
                      62%
                    </span>
                  </div>
                  <div className={"h-1 bg-surface-variant rounded-full"}>
                    <div className={"h-full bg-secondary w-[62%]"}></div>
                  </div>
                </div>
                <div className={"space-y-2"}>
                  <div className={"flex justify-between font-data-sm text-data-sm"}>
                    <span>
                      Thermal Storage
                    </span>
                    <span className={"text-secondary"}>
                      41%
                    </span>
                  </div>
                  <div className={"h-1 bg-surface-variant rounded-full"}>
                    <div className={"h-full bg-secondary w-[41%]"}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className={"bg-secondary/5 border border-secondary/20 p-4 rounded-lg"}>
              <div className={"flex items-center gap-2 text-secondary mb-2"}>
                <span className={"material-symbols-outlined text-[18px]"}>
                  psychology
                </span>
                <span className={"font-bold text-sm"}>
                  AI Recommendation
                </span>
              </div>
              <p className={"text-body-sm leading-relaxed text-on-surface-variant"}>
                "Increasing **Cool Roof** coverage in Downtown by an additional **15%** yields a non-linear efficiency gain of **2.4°C** due to reduced canyon-trapping effect. Recommend reallocation from Westside."
              </p>
              <button className={"mt-4 w-full border border-secondary text-secondary py-2 text-sm font-bold hover:bg-secondary/10 transition-colors"}>
                Apply Recommendation
              </button>
            </div>
            <div className={"space-y-4"}>
              <h5 className={"font-data-sm text-data-sm text-on-surface-variant uppercase"}>
                Critical Zone Watch
              </h5>
              <div className={"p-3 border border-outline-variant bg-surface-container rounded flex items-center justify-between"}>
                <div className={"flex items-center gap-3"}>
                  <div className={"w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center"}>
                    <span className={"material-symbols-outlined text-secondary"}>
                      location_on
                    </span>
                  </div>
                  <div>
                    <p className={"font-bold text-sm"}>
                      South Slums
                    </p>
                    <p className={"text-[10px] text-on-surface-variant"}>
                      42.2°C Projected
                    </p>
                  </div>
                </div>
                <span className={"material-symbols-outlined text-error"}>
                  priority_high
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
