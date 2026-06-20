import { useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import "../styles/pages.css";

export default function AnalysisPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "analysis");

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
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-primary"}>
                        01
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        Downtown
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            9.2
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-secondary-container w-[92%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        31,345
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 border border-error/40 text-error"}>
                          CRITICAL
                        </span>
                      </td>
                    </tr>
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-primary"}>
                        02
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        Industrial West
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            8.7
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-secondary-container w-[87%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        12,400
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-error/10 border border-error/40 text-error"}>
                          CRITICAL
                        </span>
                      </td>
                    </tr>
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-on-surface-variant"}>
                        03
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        East Wharf
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            7.9
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-tertiary-container w-[79%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        28,150
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/10 border border-tertiary-container/40 text-tertiary-container"}>
                          HIGH
                        </span>
                      </td>
                    </tr>
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-on-surface-variant"}>
                        04
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        Central Park South
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            6.4
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-tertiary-container w-[64%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        45,200
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-container/10 border border-tertiary-container/40 text-tertiary-container"}>
                          HIGH
                        </span>
                      </td>
                    </tr>
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-on-surface-variant"}>
                        05
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        Tech District
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            5.1
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-primary-container w-[51%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        18,900
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container/10 border border-primary-container/40 text-on-primary-container"}>
                          MEDIUM
                        </span>
                      </td>
                    </tr>
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-on-surface-variant"}>
                        06
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        Suburban Ridge
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            4.2
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-primary-container w-[42%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        34,100
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container/10 border border-primary-container/40 text-on-primary-container"}>
                          MEDIUM
                        </span>
                      </td>
                    </tr>
                    <tr className={"group hover:bg-surface-variant/20 transition-colors"}>
                      <td className={"py-4 font-data-lg text-data-lg text-on-surface-variant"}>
                        07
                      </td>
                      <td className={"py-4 font-body-md text-body-md font-semibold"}>
                        Green Valley
                      </td>
                      <td className={"py-4"}>
                        <div className={"flex items-center gap-2"}>
                          <span className={"font-data-sm text-data-sm w-8"}>
                            2.8
                          </span>
                          <div className={"h-1.5 w-24 bg-surface-container rounded-full overflow-hidden"}>
                            <div className={"h-full bg-primary-container w-[28%]"}></div>
                          </div>
                        </div>
                      </td>
                      <td className={"py-4 font-data-sm text-data-sm"}>
                        8,300
                      </td>
                      <td className={"py-4"}>
                        <span className={"px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 border border-primary/40 text-primary"}>
                          LOW
                        </span>
                      </td>
                    </tr>
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
                  SHAP Value Feature Attribution (City-wide Model)
                </p>
              </div>
              <div className={"space-y-8 flex-1 flex flex-col justify-center"}>
                <div className={"relative"}>
                  <div className={"flex justify-between items-end mb-2"}>
                    <span className={"font-data-sm text-data-sm uppercase tracking-widest text-on-surface-variant"}>
                      Road coverage density
                    </span>
                    <span className={"font-data-lg text-data-lg text-secondary-container"}>
                      +8.4°C
                    </span>
                  </div>
                  <div className={"h-8 w-full bg-surface-container rounded relative overflow-hidden"}>
                    <div className={"h-full shap-bar-positive w-[84%] transition-all duration-1000 ease-out"}></div>
                    <div className={"absolute inset-0 flex items-center px-4 mix-blend-overlay opacity-30"}>
                      <div className={"w-full border-t border-dashed border-on-surface"}></div>
                    </div>
                  </div>
                </div>
                <div className={"relative"}>
                  <div className={"flex justify-between items-end mb-2"}>
                    <span className={"font-data-sm text-data-sm uppercase tracking-widest text-on-surface-variant"}>
                      Roof albedo (Low reflectivity)
                    </span>
                    <span className={"font-data-lg text-data-lg text-secondary-container"}>
                      +7.1°C
                    </span>
                  </div>
                  <div className={"h-8 w-full bg-surface-container rounded relative overflow-hidden"}>
                    <div className={"h-full shap-bar-positive w-[71%] transition-all duration-1000 ease-out delay-100"}></div>
                  </div>
                </div>
                <div className={"relative"}>
                  <div className={"flex justify-between items-end mb-2"}>
                    <span className={"font-data-sm text-data-sm uppercase tracking-widest text-on-surface-variant"}>
                      Vegetation absence
                    </span>
                    <span className={"font-data-lg text-data-lg text-secondary-container"}>
                      +5.8°C
                    </span>
                  </div>
                  <div className={"h-8 w-full bg-surface-container rounded relative overflow-hidden"}>
                    <div className={"h-full shap-bar-positive w-[58%] transition-all duration-1000 ease-out delay-200"}></div>
                  </div>
                </div>
                <div className={"relative"}>
                  <div className={"flex justify-between items-end mb-2"}>
                    <span className={"font-data-sm text-data-sm uppercase tracking-widest text-on-surface-variant"}>
                      HVAC Exhaust density
                    </span>
                    <span className={"font-data-lg text-data-lg text-secondary-container"}>
                      +4.2°C
                    </span>
                  </div>
                  <div className={"h-8 w-full bg-surface-container rounded relative overflow-hidden"}>
                    <div className={"h-full shap-bar-positive w-[42%] transition-all duration-1000 ease-out delay-300"}></div>
                  </div>
                </div>
                <div className={"relative"}>
                  <div className={"flex justify-between items-end mb-2"}>
                    <span className={"font-data-sm text-data-sm uppercase tracking-widest text-on-surface-variant"}>
                      Building Height / Air Trapping
                    </span>
                    <span className={"font-data-lg text-data-lg text-secondary-container"}>
                      +3.6°C
                    </span>
                  </div>
                  <div className={"h-8 w-full bg-surface-container rounded relative overflow-hidden"}>
                    <div className={"h-full shap-bar-positive w-[36%] transition-all duration-1000 ease-out delay-400"}></div>
                  </div>
                </div>
              </div>
              <div className={"mt-8 p-4 bg-surface-container-high/30 rounded-lg border border-outline-variant/30 italic font-body-sm text-body-sm text-on-surface-variant/80"}>
                *AI analysis indicates that increasing roof albedo in the Downtown sector could reduce peak temperature by up to 2.4°C.
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
                  Surface temperature trend - Downtown
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
                Data Density: High
              </p>
            </div>
          </div>
          <nav className={"flex border-b border-outline-variant"}>
            <button className={"flex-1 py-4 text-on-surface-variant font-medium hover:text-secondary-fixed transition-colors"}>
              Zone Details
            </button>
            <button className={"flex-1 py-4 text-secondary border-b-2 border-secondary font-bold"}>
              AI Insights
            </button>
            <button className={"flex-1 py-4 text-on-surface-variant font-medium hover:text-secondary-fixed transition-colors"}>
              Cooling Simulator
            </button>
          </nav>
          <div className={"flex-1 p-6 overflow-y-auto space-y-6"}>
            <div className={"space-y-4"}>
              <label className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>
                Active Anomalies
              </label>
              <div className={"glass-panel p-4 rounded-lg space-y-3"}>
                <div className={"flex items-start gap-3"}>
                  <span className={"material-symbols-outlined text-secondary text-sm mt-1"}>
                    warning
                  </span>
                  <div>
                    <p className={"font-body-sm text-body-sm font-bold"}>
                      Thermal Tunneling Effect
                    </p>
                    <p className={"text-[12px] text-on-surface-variant"}>
                      Detected in Sector 7-G. Heat trapping exceeding normal limits by 14%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={"space-y-4"}>
              <label className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>
                Recommended Actions
              </label>
              <div className={"space-y-2"}>
                <button className={"w-full text-left p-4 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant group"}>
                  <div className={"flex justify-between items-center"}>
                    <span className={"font-body-sm text-body-sm font-semibold"}>
                      Deploy Mobile Misters
                    </span>
                    <span className={"material-symbols-outlined text-primary scale-0 group-hover:scale-100 transition-transform"}>
                      arrow_forward
                    </span>
                  </div>
                  <p className={"text-[12px] text-on-surface-variant mt-1"}>
                    Target: Downtown Central Square
                  </p>
                </button>
                <button className={"w-full text-left p-4 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant group"}>
                  <div className={"flex justify-between items-center"}>
                    <span className={"font-body-sm text-body-sm font-semibold"}>
                      Issue Heat Advisory
                    </span>
                    <span className={"material-symbols-outlined text-primary scale-0 group-hover:scale-100 transition-transform"}>
                      arrow_forward
                    </span>
                  </div>
                  <p className={"text-[12px] text-on-surface-variant mt-1"}>
                    Target: East Wharf Residential
                  </p>
                </button>
              </div>
            </div>
            <div className={"pt-6"}>
              <div className={"rounded-xl overflow-hidden relative h-40 border border-outline-variant"}>
                <div className={"absolute inset-0 bg-cover bg-center"} data-alt={"A futuristic satellite map view of an urban landscape with glowing red and orange thermal heat map overlays over the buildings. The imagery is technical, with UI elements like coordinate grids and data points overlaying the city streets. Dark cinematic lighting highlights the intense heat zones in the city center."} style={{"backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAOOPZ1xFs6LqSnO2U3PDGOqXHmmdaYSb0RibcIJnhvUYRgoEuP3ZS1o8JSshu31xOxT1b7mdZToXvVa4PXuzWDL9t4FEQd7fuzD73Yr8hNwCK-TMXgoCgkNc_VyVWvrt_kYXZ4bPeDQBX74a9-1OJKP2fYJWisAVvBoeE79H0E-diJTvU_Y1I1zpNX-cTYFd9DTFG1PoaHIWbhwKy_3Iy4o4vvbk49bjySh08fc6Y05Gnjdk33OkgTKKKWSQQERfaJyyuot2sF8Og')"}}></div>
                <div className={"absolute inset-0 bg-gradient-to-t from-[#000d26] to-transparent"}></div>
                <div className={"absolute bottom-3 left-3"}>
                  <p className={"font-data-sm text-data-sm text-primary"}>
                    Live Thermal Feed
                  </p>
                  <p className={"text-[10px] text-white/60"}>
                    Cam-Idx: 492-Delta
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
