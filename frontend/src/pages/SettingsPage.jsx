import { useRef } from "react";
import { Link } from "react-router-dom";
import usePageInteractions from "../hooks/usePageInteractions";
import Sidebar from "../components/Sidebar";
import "../styles/pages.css";

export default function SettingsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "settings");

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
            <Link to={"/settings"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Settings
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
          <div>
            <h1 className={"font-display-md text-display-md text-primary mb-2"}>
              Settings
            </h1>
            <p className={"text-on-surface-variant max-w-2xl"}>
              Configure system preferences, alert thresholds, data sources, and account settings.
            </p>
          </div>
          <div className={"flex gap-3 flex-wrap border-b border-outline-variant pb-4"}>
            <button className={"px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm border border-primary/30"}>General</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Alerts</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Data Sources</button>
            <button className={"px-4 py-2 bg-surface-container text-on-surface-variant rounded-full text-sm border border-outline-variant"}>Account</button>
          </div>
          <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
                <span className={"material-symbols-outlined text-primary"}>tune</span>
                General Preferences
              </h3>
              <div className={"space-y-5"}>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Temperature Unit</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Display preference for temperature values</p>
                  </div>
                  <select className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    <option>Celsius (°C)</option>
                    <option>Fahrenheit (°F)</option>
                  </select>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Time Format</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>24-hour or 12-hour display</p>
                  </div>
                  <select className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    <option>24-hour</option>
                    <option>12-hour (AM/PM)</option>
                  </select>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Default Map Layer</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Initial layer on page load</p>
                  </div>
                  <select className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    <option>Surface Temp (LST)</option>
                    <option>NDVI Vegetation Index</option>
                    <option>Land Cover</option>
                  </select>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Auto-refresh Interval</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Dashboard data refresh rate</p>
                  </div>
                  <select className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                    <option>Off</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
                <span className={"material-symbols-outlined text-secondary"}>notifications_active</span>
                Alert Thresholds
              </h3>
              <div className={"space-y-5"}>
                <div>
                  <div className={"flex items-center justify-between mb-2"}>
                    <span className={"font-body-sm text-body-sm text-on-surface"}>Critical Temperature</span>
                    <span className={"font-data-sm text-data-sm text-error"}>50°C</span>
                  </div>
                  <input className={"w-full h-1 bg-surface-variant rounded-full appearance-none cursor-pointer accent-error"} type={"range"} defaultValue={"50"} min={"35"} max={"60"} />
                </div>
                <div>
                  <div className={"flex items-center justify-between mb-2"}>
                    <span className={"font-body-sm text-body-sm text-on-surface"}>Warning Temperature</span>
                    <span className={"font-data-sm text-data-sm text-tertiary"}>45°C</span>
                  </div>
                  <input className={"w-full h-1 bg-surface-variant rounded-full appearance-none cursor-pointer accent-tertiary"} type={"range"} defaultValue={"45"} min={"30"} max={"55"} />
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Push Notifications</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Receive alerts on desktop</p>
                  </div>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-primary"}>
                    <span className={"translate-x-5 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Email Digests</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Daily summary of critical alerts</p>
                  </div>
                  <button className={"relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none bg-surface-variant"}>
                    <span className={"translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out"}></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
            <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
              <span className={"material-symbols-outlined text-primary"}>satellite</span>
              Data Sources
            </h3>
            <div className={"space-y-4"}>
              {[
                { name: "Landsat 8/9", provider: "NASA / USGS", status: "Connected", latency: "2-4 hours" },
                { name: "Sentinel-2", provider: "ESA Copernicus", status: "Connected", latency: "1-3 hours" },
                { name: "MODIS Terra", provider: "NASA", status: "Connected", latency: "3-6 hours" },
                { name: "ECMWF ERA5", provider: "European Centre", status: "Degraded", latency: "6-12 hours" },
              ].map((src, i) => (
                <div key={i} className={"flex items-center justify-between p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                  <div className={"flex items-center gap-3"}>
                    <div className={`w-2 h-2 rounded-full ${src.status === "Connected" ? "bg-primary" : "bg-tertiary-container"}`}></div>
                    <div>
                      <p className={"font-body-sm text-body-sm text-on-surface font-medium"}>{src.name}</p>
                      <p className={"font-data-sm text-[11px] text-on-surface-variant"}>{src.provider}</p>
                    </div>
                  </div>
                  <div className={"text-right"}>
                    <p className={`font-data-sm text-data-sm ${src.status === "Connected" ? "text-primary" : "text-tertiary-container"}`}>{src.status}</p>
                    <p className={"font-data-sm text-[10px] text-on-surface-variant"}>Latency: {src.latency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
            <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
              <span className={"material-symbols-outlined text-secondary"}>account_circle</span>
              Account
            </h3>
            <div className={"grid grid-cols-1 md:grid-cols-2 gap-5"}>
              <div>
                <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Display Name</label>
                <input className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"} defaultValue={"Admin User"} />
              </div>
              <div>
                <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Email Address</label>
                <input className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"} defaultValue={"admin@thermacity.io"} />
              </div>
              <div>
                <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Organization</label>
                <input className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"} defaultValue={"Urban Climate Initiative"} />
              </div>
              <div>
                <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Role</label>
                <select className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"}>
                  <option>Administrator</option>
                  <option>Analyst</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className={"flex gap-3 mt-6 pt-5 border-t border-outline-variant"}>
              <button className={"px-6 py-2 bg-primary text-on-primary font-bold rounded hover:brightness-110 transition-all"}>Save Changes</button>
              <button className={"px-6 py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-variant/50 transition-colors"}>Reset</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
