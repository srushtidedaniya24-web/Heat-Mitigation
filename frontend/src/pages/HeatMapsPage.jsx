import { useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import usePageInteractions from "../hooks/usePageInteractions";
import "../styles/pages.css";

export default function HeatMapsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "heatmaps");

  return (
    <div ref={rootRef} className="heatmaps-page bg-background text-on-surface font-body-md selection:bg-primary/30 overflow-hidden">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-4"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>
            ThermaCity
          </span>
          <nav className={"hidden md:flex ml-8 gap-6"}>
            <Link to={"/"} className={"text-primary font-bold border-b-2 border-primary py-2 transition-opacity"}>
              Live Status
            </Link>
          </nav>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full transition-colors cursor-pointer active:opacity-80"}>
            notifications
          </button>
          <button className={"material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-full transition-colors cursor-pointer active:opacity-80"}>
            account_circle
          </button>
        </div>
      </header>
      <Sidebar />
      <main className={"ml-64 pt-16 h-screen relative flex overflow-hidden"}>
        <div className={"absolute inset-0 z-0 bg-[#000d26]"}>
          <div className={"w-full h-full relative map-grid opacity-60"}>
            <div className={"w-full h-full bg-cover bg-center mix-blend-screen opacity-80"} data-alt={"A detailed dark-themed satellite satellite map view of a sprawling modern city with glowing heat map overlays in shades of teal, orange, and red. The map features high-resolution textures of buildings, rivers, and parks, with a futuristic 100m technical grid overlay on top. The style is cinematic and scientific, evoking a high-stakes climate monitoring center during night time."} style={{"backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCp3s75XOKa6X6dBiLYQSQ3fpSNOxYVVECYJME5fFkb-EoeBZLsqwGA4tPTJzomSOsRAJ06kWxHaevzkmP0_ksLxcsI3tt_YVtyc1gfEm3gLkaEs8SEzCe_zKg6Do--X0_lyZTOCpCiyagHu9toillk3KSE4wEqCfVSqI3fsa7BX78n9nFW7qc-mmEv3u9ALgbu6jrlzGfG_A2bnYD55OV30KDNPME6098es8RVlyYtcwWmV6dZQRiyL54fUPaon8xrOGkDr_28r3M')"}}></div>
            <div className={"absolute top-[20%] left-[30%] animate-pulse"}>
              <div className={"bg-surface-container-highest/80 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-secondary-container"}></span>
                <span className={"font-data-sm text-on-surface font-semibold"}>
                  Downtown
                </span>
              </div>
            </div>
            <div className={"absolute top-[10%] left-[60%]"}>
              <div className={"bg-surface-container-highest/60 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-primary-container"}></span>
                <span className={"font-data-sm text-on-surface"}>
                  Northview
                </span>
              </div>
            </div>
            <div className={"absolute top-[45%] left-[20%]"}>
              <div className={"bg-surface-container-highest/60 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-tertiary-container"}></span>
                <span className={"font-data-sm text-on-surface"}>
                  Riverside
                </span>
              </div>
            </div>
            <div className={"absolute top-[60%] left-[10%]"}>
              <div className={"bg-surface-container-highest/60 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-primary"}></span>
                <span className={"font-data-sm text-on-surface"}>
                  Westhill
                </span>
              </div>
            </div>
            <div className={"absolute top-[40%] right-[15%]"}>
              <div className={"bg-surface-container-highest/60 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-secondary"}></span>
                <span className={"font-data-sm text-on-surface"}>
                  Eastwood
                </span>
              </div>
            </div>
            <div className={"absolute bottom-[20%] right-[30%]"}>
              <div className={"bg-surface-container-highest/60 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-primary-fixed-dim"}></span>
                <span className={"font-data-sm text-on-surface"}>
                  Lakeside
                </span>
              </div>
            </div>
            <div className={"absolute bottom-[15%] left-[45%]"}>
              <div className={"bg-surface-container-highest/60 backdrop-blur-md px-3 py-1 border border-outline-variant rounded flex items-center gap-2"}>
                <span className={"w-2 h-2 rounded-full bg-on-tertiary-container"}></span>
                <span className={"font-data-sm text-on-surface"}>
                  Southpark
                </span>
              </div>
            </div>
          </div>
          <div className={"absolute top-6 right-6 z-20 flex flex-col gap-4"}>
            <div className={"bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant p-4 rounded-lg w-48"}>
              <h4 className={"font-headline-sm text-sm mb-3"}>
                Thermal Legend
              </h4>
              <div className={"h-2 w-full thermal-gradient rounded-full mb-2"}></div>
              <div className={"flex justify-between text-[10px] font-data-sm text-on-surface-variant"}>
                <span>
                  24°C
                </span>
                <span>
                  40°C
                </span>
                <span>
                  60°C
                </span>
              </div>
            </div>
          </div>
        </div>
        <aside className={"w-80 h-full p-4 z-10 pointer-events-none"}>
          <div className={"bg-surface-container-lowest/90 backdrop-blur-2xl border border-outline-variant rounded-xl h-full flex flex-col pointer-events-auto overflow-hidden"}>
            <div className={"p-5 border-b border-outline-variant"}>
              <h3 className={"font-headline-sm text-on-surface flex items-center gap-2"}>
                <span className={"material-symbols-outlined text-primary"}>
                  layers
                </span>
                Layer Controls
              </h3>
              <p className={"text-on-surface-variant text-body-sm mt-1"}>
                Satellite Visualization Layers
              </p>
            </div>
            <div className={"flex-1 overflow-y-auto p-5 space-y-6"}>
              <div className={"space-y-4"}>
                <div className={"flex items-center justify-between"}>
                  <span className={"font-body-sm text-on-surface"}>
                    Surface Temp (LST)
                  </span>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-primary"} data-toggle-layer={"true"}>
                    <span className={"translate-x-5 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
                <div className={"flex items-center justify-between"}>
                  <span className={"font-body-sm text-on-surface"}>
                    NDVI Vegetation Index
                  </span>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-primary"} data-toggle-layer={"true"}>
                    <span className={"translate-x-5 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
                <div className={"flex items-center justify-between"}>
                  <span className={"font-body-sm text-on-surface-variant"}>
                    Land Cover
                  </span>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-surface-variant"} data-toggle-layer={"true"}>
                    <span className={"translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
                <div className={"flex items-center justify-between"}>
                  <span className={"font-body-sm text-on-surface-variant"}>
                    Building Footprints
                  </span>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-surface-variant"} data-toggle-layer={"true"}>
                    <span className={"translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
                <div className={"flex items-center justify-between"}>
                  <span className={"font-body-sm text-on-surface-variant"}>
                    Road Network Density
                  </span>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-surface-variant"} data-toggle-layer={"true"}>
                    <span className={"translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
                <div className={"flex items-center justify-between"}>
                  <span className={"font-body-sm text-on-surface"}>
                    Population Density
                  </span>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-primary"} data-toggle-layer={"true"}>
                    <span className={"translate-x-5 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
              </div>
              <hr className={"border-outline-variant"} />
              <div className={"space-y-3"}>
                <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                  Date Range
                </label>
                <div className={"relative"}>
                  <input className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary focus:ring-0"} readOnly type={"text"} defaultValue={"Aug 12, 2023 - Aug 19, 2023"} />
                  <span className={"material-symbols-outlined absolute right-3 top-2 text-on-surface-variant"}>
                    calendar_month
                  </span>
                </div>
              </div>
              <div className={"space-y-3"}>
                <label className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                  Satellite Source
                </label>
                <select className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-body-sm appearance-none focus:border-primary focus:ring-0"}>
                  <option>
                    Landsat 8/9
                  </option>
                  <option>
                    Sentinel-2
                  </option>
                  <option>
                    MODIS Terra
                  </option>
                </select>
              </div>
            </div>
            <div className={"p-5 border-t border-outline-variant"}>
              <button className={"w-full border border-primary text-primary py-3 rounded font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"}>
                <span className={"material-symbols-outlined"}>
                  file_download
                </span>
                Export Map Data
              </button>
            </div>
          </div>
        </aside>
        <aside className={"absolute right-0 top-0 bottom-0 w-80 z-40 flex flex-col bg-surface-container-lowest/40 backdrop-blur-sm border-l border-outline-variant translate-x-[75%] hover:translate-x-0 transition-transform duration-500 ease-in-out"}>
          <div className={"p-4 border-b border-outline-variant bg-surface-container-lowest"}>
            <h3 className={"font-headline-sm text-secondary"}>
              Intelligence Panel
            </h3>
            <p className={"text-on-surface-variant text-[10px] uppercase"}>
              Data Density: High
            </p>
          </div>
          <div className={"p-4 flex-1 overflow-y-auto space-y-6"}>
            <div className={"flex gap-4 border-b border-outline-variant"}>
              <button className={"text-secondary border-b-2 border-secondary font-bold font-data-lg text-sm pb-2"}>
                Zone Details
              </button>
              <button className={"text-on-surface-variant font-medium font-data-lg text-sm pb-2 opacity-50"}>
                AI Insights
              </button>
            </div>
            <div className={"space-y-4"}>
              <div className={"p-3 bg-surface-container rounded-lg border border-outline-variant"}>
                <div className={"flex justify-between items-center mb-1"}>
                  <span className={"font-headline-sm text-sm text-secondary"}>
                    Downtown
                  </span>
                  <span className={"font-data-sm text-error"}>
                    56.8°C
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant leading-relaxed"}>
                  High albedo surfaces identified in Central Plaza. Recommend immediate shade implementation.
                </p>
              </div>
              <div className={"p-3 bg-surface-container rounded-lg border border-outline-variant"}>
                <div className={"flex justify-between items-center mb-1"}>
                  <span className={"font-headline-sm text-sm"}>
                    Lakeside
                  </span>
                  <span className={"font-data-sm text-primary"}>
                    41.8°C
                  </span>
                </div>
                <p className={"text-body-sm text-on-surface-variant leading-relaxed"}>
                  Stable thermal profile. High evaporative cooling from North Lake buffer zone.
                </p>
              </div>
            </div>
            <div className={"bg-surface-container/30 p-4 border-dashed border border-outline-variant rounded text-center"}>
              <span className={"material-symbols-outlined text-secondary opacity-50 text-4xl mb-2"}>
                ac_unit
              </span>
              <p className={"font-data-sm text-xs text-on-surface-variant"}>
                Cooling Simulator Active
                <br />
                Hover zones for forecast
              </p>
            </div>
          </div>
        </aside>
        <div className={"absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-gutter"}>
          <div className={"bg-surface-container-highest/90 backdrop-blur-3xl border border-outline-variant rounded-full py-4 px-8 flex items-center justify-between shadow-2xl"}>
            <div className={"flex items-center gap-6"}>
              <div className={"flex flex-col"}>
                <span className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest"}>
                  City Average
                </span>
                <span className={"font-data-lg text-on-surface text-xl"}>
                  48.4°C
                </span>
              </div>
              <div className={"h-8 w-px bg-outline-variant"}></div>
              <div className={"flex flex-col"}>
                <span className={"font-data-sm text-[10px] text-error uppercase tracking-widest"}>
                  Peak Zone: Downtown
                </span>
                <span className={"font-data-lg text-error text-xl"}>
                  56.8°C
                </span>
              </div>
              <div className={"h-8 w-px bg-outline-variant"}></div>
              <div className={"flex flex-col"}>
                <span className={"font-data-sm text-[10px] text-primary uppercase tracking-widest"}>
                  Coolest: Lakeside
                </span>
                <span className={"font-data-lg text-primary text-xl"}>
                  41.8°C
                </span>
              </div>
            </div>
            <div className={"flex items-center gap-2 ml-8"}>
              <div className={"px-3 py-1.5 rounded bg-surface-variant text-on-surface-variant font-data-sm border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"}>
                Compare Epochs
              </div>
              <button className={"w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 active:scale-95 transition-all"}>
                <span className={"material-symbols-outlined"}>
                  analytics
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
