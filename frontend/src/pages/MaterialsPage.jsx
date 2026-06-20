import { useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import "../styles/pages.css";

export default function MaterialsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "materials");

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
                  Cooling efficiency is highest in high-density zones using Green Roof interventions.
                </p>
                <div className={"flex items-center gap-2 text-primary font-data-sm text-data-sm"}>
                  <span className={"material-symbols-outlined text-sm"} data-icon={"trending_up"}>
                    trending_up
                  </span>
                  +18.4% Net Improvement
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
                  0.42
                </span>
              </div>
              <div className={"w-full bg-surface-variant h-1 rounded-full overflow-hidden"}>
                <div className={"bg-primary h-full"} style={{"width": "42%"}}></div>
              </div>
              <div className={"flex justify-between items-center text-sm mt-4"}>
                <span className={"text-on-surface-variant"}>
                  Thermal Mitigation Rate
                </span>
                <span className={"font-data-lg text-data-lg text-on-surface"}>
                  72%
                </span>
              </div>
              <div className={"w-full bg-surface-variant h-1 rounded-full overflow-hidden"}>
                <div className={"bg-secondary h-full"} style={{"width": "72%"}}></div>
              </div>
            </div>
          </section>
        </div>
      </aside>
      <main className={"ml-64 mr-80 mt-16 p-container-padding overflow-y-auto h-[calc(100vh-64px)] scroll-smooth"}>
        <div className={"grid grid-cols-5 gap-panel-gap mb-8"}>
          <div className={"glass-panel p-4 rounded-xl flex flex-col items-center text-center"}>
            <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-wider mb-2"}>
              Cool Roofs
            </span>
            <div className={"font-display-md text-primary text-3xl font-bold"}>
              -12.4°C
            </div>
            <div className={"thermal-pill w-16 mt-2 opacity-50"}></div>
          </div>
          <div className={"glass-panel p-4 rounded-xl flex flex-col items-center text-center"}>
            <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-wider mb-2"}>
              Cool Pavement
            </span>
            <div className={"font-display-md text-primary text-3xl font-bold"}>
              -9.8°C
            </div>
            <div className={"thermal-pill w-16 mt-2 opacity-50"}></div>
          </div>
          <div className={"glass-panel p-4 rounded-xl flex flex-col items-center text-center"}>
            <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-wider mb-2"}>
              Hi-Albedo Paint
            </span>
            <div className={"font-display-md text-primary text-3xl font-bold"}>
              -6.3°C
            </div>
            <div className={"thermal-pill w-16 mt-2 opacity-50"}></div>
          </div>
          <div className={"glass-panel p-4 rounded-xl flex flex-col items-center text-center"}>
            <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-wider mb-2"}>
              Green Roof
            </span>
            <div className={"font-display-md text-primary text-3xl font-bold"}>
              -7.1°C
            </div>
            <div className={"thermal-pill w-16 mt-2 opacity-50"}></div>
          </div>
          <div className={"glass-panel p-4 rounded-xl flex flex-col items-center text-center"}>
            <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-wider mb-2"}>
              Urban Greening
            </span>
            <div className={"font-display-md text-primary text-3xl font-bold"}>
              -5.4°C
            </div>
            <div className={"thermal-pill w-16 mt-2 opacity-50"}></div>
          </div>
        </div>
        <div className={"glass-panel rounded-xl overflow-hidden mb-8 border border-outline-variant"}>
          <div className={"p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-high/30"}>
            <h3 className={"font-headline-sm text-headline-sm"}>
              Material Intervention Matrix
            </h3>
            <div className={"flex gap-2"}>
              <button className={"bg-surface-variant text-on-surface px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 hover:bg-surface-variant/80 transition-colors"}>
                <span className={"material-symbols-outlined text-sm"} data-icon={"filter_list"}>
                  filter_list
                </span>
                Filter
              </button>
              <button className={"bg-primary text-on-primary px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 hover:opacity-90 transition-opacity"}>
                <span className={"material-symbols-outlined text-sm"} data-icon={"download"}>
                  download
                </span>
                Export Dataset
              </button>
            </div>
          </div>
          <div className={"overflow-x-auto"}>
            <table className={"w-full text-left font-body-sm"}>
              <thead className={"bg-surface-container-lowest text-on-surface-variant uppercase text-[10px] tracking-widest font-bold"}>
                <tr>
                  <th className={"px-6 py-4"}>
                    Material
                  </th>
                  <th className={"px-4 py-4"}>
                    Albedo
                  </th>
                  <th className={"px-4 py-4"}>
                    Surface Temp
                  </th>
                  <th className={"px-4 py-4 text-primary"}>
                    Daytime Cooling ↓
                  </th>
                  <th className={"px-4 py-4"}>
                    Cost (₹/m²)
                  </th>
                  <th className={"px-4 py-4"}>
                    Durability
                  </th>
                  <th className={"px-4 py-4"}>
                    CO2 Impact
                  </th>
                  <th className={"px-6 py-4 text-center"}>
                    Recommended
                  </th>
                </tr>
              </thead>
              <tbody className={"divide-y divide-outline-variant"}>
                <tr className={"hover:bg-surface-variant/20 transition-colors border-l-4 border-primary"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    Cool Roof Coating
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.65
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    42.1°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-primary"}>
                    -12.4°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹850
                  </td>
                  <td className={"px-4 py-4"}>
                    High
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-primary"}>
                      ●
                    </span>
                    Low
                  </td>
                  <td className={"px-6 py-4 text-center"}>
                    <span className={"material-symbols-outlined text-primary"} data-icon={"check_circle"} style={{"fontVariationSettings": "'FILL' 1"}}>
                      check_circle
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-variant/20 transition-colors border-l-4 border-primary"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    White Reflective Roof
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.80
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    38.6°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-primary"}>
                    -10.2°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹1,200
                  </td>
                  <td className={"px-4 py-4"}>
                    Medium
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-primary"}>
                      ●
                    </span>
                    Low
                  </td>
                  <td className={"px-6 py-4 text-center"}>
                    <span className={"material-symbols-outlined text-primary"} data-icon={"check_circle"} style={{"fontVariationSettings": "'FILL' 1"}}>
                      check_circle
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-variant/20 transition-colors border-l-4 border-primary"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    Cool Pavement
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.45
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    51.8°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-primary"}>
                    -9.8°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹2,400
                  </td>
                  <td className={"px-4 py-4"}>
                    High
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-tertiary"}>
                      ●
                    </span>
                    Med
                  </td>
                  <td className={"px-6 py-4 text-center"}>
                    <span className={"material-symbols-outlined text-primary"} data-icon={"check_circle"} style={{"fontVariationSettings": "'FILL' 1"}}>
                      check_circle
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-variant/20 transition-colors border-l-4 border-primary"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    Green Roof
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.25
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    35.2°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-primary"}>
                    -7.1°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹5,500
                  </td>
                  <td className={"px-4 py-4"}>
                    Med-High
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-primary"}>
                      ●
                    </span>
                    Neg
                  </td>
                  <td className={"px-6 py-4 text-center"}>
                    <span className={"material-symbols-outlined text-primary"} data-icon={"check_circle"} style={{"fontVariationSettings": "'FILL' 1"}}>
                      check_circle
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-variant/20 transition-colors"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    High-Albedo Paint
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.55
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    48.4°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-primary"}>
                    -6.3°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹450
                  </td>
                  <td className={"px-4 py-4"}>
                    Low
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-tertiary"}>
                      ●
                    </span>
                    Med
                  </td>
                  <td className={"px-6 py-4 text-center"}>
                    <span className={"material-symbols-outlined text-on-surface-variant"} data-icon={"info"}>
                      info
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-variant/20 transition-colors"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    Permeable Pavement
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.30
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    55.1°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-primary"}>
                    -4.2°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹3,800
                  </td>
                  <td className={"px-4 py-4"}>
                    High
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-primary"}>
                      ●
                    </span>
                    Low
                  </td>
                  <td className={"px-6 py-4 text-center"}>
                    <span className={"material-symbols-outlined text-on-surface-variant"} data-icon={"info"}>
                      info
                    </span>
                  </td>
                </tr>
                <tr className={"hover:bg-surface-variant/20 transition-colors bg-error-container/10"}>
                  <td className={"px-6 py-4 font-semibold text-on-surface"}>
                    Conventional Asphalt
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    0.08
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    69.3°C
                  </td>
                  <td className={"px-4 py-4 font-data-lg text-secondary"}>
                    0.0°C
                  </td>
                  <td className={"px-4 py-4 font-data-sm"}>
                    ₹1,500
                  </td>
                  <td className={"px-4 py-4"}>
                    Med-High
                  </td>
                  <td className={"px-4 py-4"}>
                    <span className={"text-error"}>
                      ●
                    </span>
                    High
                  </td>
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
          <h3 className={"font-headline-sm text-headline-sm mb-6"}>
            Cooling Potential by Intervention Strategy
          </h3>
          <div className={"space-y-6"}>
            <div className={"group"}>
              <div className={"flex justify-between items-center mb-2"}>
                <span className={"font-display-md text-sm font-medium text-on-surface"}>
                  Cool Roof Infrastructure
                </span>
                <span className={"font-data-lg text-data-lg text-primary"}>
                  -12.4°C
                </span>
              </div>
              <div className={"w-full bg-surface-container h-8 rounded-md overflow-hidden relative border border-outline-variant/30"}>
                <div className={"h-full bg-primary transition-all duration-1000 ease-out"} style={{"width": "100%"}}></div>
                <div className={"absolute inset-0 flex items-center px-4 mix-blend-difference pointer-events-none"}>
                  <span className={"text-[10px] font-bold tracking-tighter uppercase text-white"}>
                    Critical Impact Zone
                  </span>
                </div>
              </div>
            </div>
            <div className={"group"}>
              <div className={"flex justify-between items-center mb-2"}>
                <span className={"font-display-md text-sm font-medium text-on-surface"}>
                  Sustainable Paving Systems
                </span>
                <span className={"font-data-lg text-data-lg text-primary"}>
                  -9.8°C
                </span>
              </div>
              <div className={"w-full bg-surface-container h-8 rounded-md overflow-hidden relative border border-outline-variant/30"}>
                <div className={"h-full bg-primary/80 transition-all duration-1000 ease-out"} style={{"width": "79%"}}></div>
              </div>
            </div>
            <div className={"group"}>
              <div className={"flex justify-between items-center mb-2"}>
                <span className={"font-display-md text-sm font-medium text-on-surface"}>
                  Vegetative Roof Modules
                </span>
                <span className={"font-data-lg text-data-lg text-tertiary"}>
                  -7.1°C
                </span>
              </div>
              <div className={"w-full bg-surface-container h-8 rounded-md overflow-hidden relative border border-outline-variant/30"}>
                <div className={"h-full bg-tertiary transition-all duration-1000 ease-out"} style={{"width": "57%"}}></div>
              </div>
            </div>
            <div className={"group"}>
              <div className={"flex justify-between items-center mb-2"}>
                <span className={"font-display-md text-sm font-medium text-on-surface"}>
                  Reflective Surface Coatings
                </span>
                <span className={"font-data-lg text-data-lg text-tertiary"}>
                  -6.3°C
                </span>
              </div>
              <div className={"w-full bg-surface-container h-8 rounded-md overflow-hidden relative border border-outline-variant/30"}>
                <div className={"h-full bg-tertiary/80 transition-all duration-1000 ease-out"} style={{"width": "51%"}}></div>
              </div>
            </div>
            <div className={"group"}>
              <div className={"flex justify-between items-center mb-2"}>
                <span className={"font-display-md text-sm font-medium text-on-surface"}>
                  Public Canopy Expansion
                </span>
                <span className={"font-data-lg text-data-lg text-on-tertiary-container"}>
                  -5.4°C
                </span>
              </div>
              <div className={"w-full bg-surface-container h-8 rounded-md overflow-hidden relative border border-outline-variant/30"}>
                <div className={"h-full bg-tertiary-container transition-all duration-1000 ease-out"} style={{"width": "43%"}}></div>
              </div>
            </div>
          </div>
          <div className={"mt-8 flex justify-between text-[10px] font-data-sm text-on-surface-variant uppercase tracking-[0.2em]"}>
            <span>
              0°C Efficiency
            </span>
            <span>
              4.0°C
            </span>
            <span>
              8.0°C
            </span>
            <span>
              12.0°C+ High Impact
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
