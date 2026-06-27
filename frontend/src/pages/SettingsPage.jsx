import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usePageInteractions from "../hooks/usePageInteractions";
import Sidebar from "../components/Sidebar";
import { useSettings } from "../contexts/SettingsContext";
import { saveSettings } from "../services/api";
import "../styles/pages.css";

const DEFAULT_SETTINGS = {
  temperature_unit: "celsius",
  time_format: "24h",
  default_map_layer: "lst",
  auto_refresh: 30,
  alert_critical_temp: 50,
  alert_warning_temp: 45,
  push_notifications: true,
  email_digests: false,
  display_name: "Admin User",
  email: "admin@thermacity.io",
  organization: "Urban Climate Initiative",
  role: "Administrator",
};

const TABS = ["General", "Alerts", "Data Sources", "Account"];
const LAYER_OPTIONS = [
  { value: "lst", label: "Surface Temp (LST)" },
  { value: "ndvi", label: "NDVI Vegetation Index" },
  { value: "landcover", label: "Land Cover" },
];
const REFRESH_OPTIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 0, label: "Off" },
];

export default function SettingsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "settings");

  const { settings: ctxSettings, loading: ctxLoading, updateSettings } = useSettings();
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState("General");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(prev => ({ ...prev, ...ctxSettings }));
  }, [ctxSettings]);

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveSettings(form);
      updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    setSaved(false);
  };

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${value ? "bg-primary" : "bg-surface-variant"}`}>
      <span className={`${value ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out`}></span>
    </button>
  );

  if (ctxLoading) {
    return (
      <div className="bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
        <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight px-gutter"}>ThermaCity</span>
        </header>
        <Sidebar />
        <main className={"ml-64 mt-16 p-gutter h-[calc(100vh-64px)] flex items-center justify-center"}>
          <span className={"text-on-surface-variant animate-pulse"}>Loading form...</span>
        </main>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low border-b border-outline-variant"}>
        <div className={"flex items-center gap-8"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>ThermaCity</span>
          <nav className={"hidden md:flex items-center gap-6"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>Live Status</Link>
            <Link to={"/settings"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>Settings</Link>
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
              <h1 className={"font-display-md text-display-md text-primary mb-2"}>Settings</h1>
              <p className={"text-on-surface-variant max-w-2xl"}>Configure system preferences, alert thresholds, data sources, and account form.</p>
            </div>
            <div className={"flex items-center gap-3"}>
              {saved && <span className={"text-primary text-sm font-bold animate-pulse"}>Saved!</span>}
              {error && <span className={"text-error text-sm"}>{error}</span>}
            </div>
          </div>

          <div className={"flex gap-3 flex-wrap border-b border-outline-variant pb-4"}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-bold text-sm border transition-colors ${
                  activeTab === tab
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-variant"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "General" && (
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
                <span className={"material-symbols-outlined text-primary"}>tune</span>
                General Preferences
              </h3>
              <div className={"space-y-5 max-w-xl"}>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Temperature Unit</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Display preference for temperature values</p>
                  </div>
                  <select value={form.temperature_unit} onChange={e => update("temperature_unit", e.target.value)}
                    className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Time Format</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>24-hour or 12-hour display</p>
                  </div>
                  <select value={form.time_format} onChange={e => update("time_format", e.target.value)}
                    className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    <option value="24h">24-hour</option>
                    <option value="12h">12-hour (AM/PM)</option>
                  </select>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Default Map Layer</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Initial layer on page load</p>
                  </div>
                  <select value={form.default_map_layer} onChange={e => update("default_map_layer", e.target.value)}
                    className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    {LAYER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Auto-refresh Interval</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Dashboard data refresh rate</p>
                  </div>
                  <select value={form.auto_refresh} onChange={e => update("auto_refresh", Number(e.target.value))}
                    className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}>
                    {REFRESH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Alerts" && (
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
                <span className={"material-symbols-outlined text-secondary"}>notifications_active</span>
                Alert Thresholds
              </h3>
              <div className={"space-y-6 max-w-xl"}>
                <div>
                  <div className={"flex items-center justify-between mb-2"}>
                    <span className={"font-body-sm text-body-sm text-on-surface"}>Critical Temperature</span>
                    <span className={"font-data-sm text-data-sm text-error"}>{form.alert_critical_temp}°C</span>
                  </div>
                  <input value={form.alert_critical_temp} onChange={e => update("alert_critical_temp", Number(e.target.value))}
                    className={"w-full h-1 bg-surface-variant rounded-full appearance-none cursor-pointer accent-error"}
                    type={"range"} min={35} max={65} step={1} />
                  <div className={"flex justify-between text-[10px] text-on-surface-variant mt-1"}>
                    <span>35°C</span><span>65°C</span>
                  </div>
                </div>
                <div>
                  <div className={"flex items-center justify-between mb-2"}>
                    <span className={"font-body-sm text-body-sm text-on-surface"}>Warning Temperature</span>
                    <span className={"font-data-sm text-data-sm text-tertiary"}>{form.alert_warning_temp}°C</span>
                  </div>
                  <input value={form.alert_warning_temp} onChange={e => update("alert_warning_temp", Number(e.target.value))}
                    className={"w-full h-1 bg-surface-variant rounded-full appearance-none cursor-pointer accent-tertiary"}
                    type={"range"} min={30} max={55} step={1} />
                  <div className={"flex justify-between text-[10px] text-on-surface-variant mt-1"}>
                    <span>30°C</span><span>55°C</span>
                  </div>
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Push Notifications</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Receive alerts on desktop</p>
                  </div>
                  <Toggle value={form.push_notifications} onChange={v => update("push_notifications", v)} />
                </div>
                <div className={"flex items-center justify-between"}>
                  <div>
                    <p className={"font-body-sm text-body-sm text-on-surface"}>Email Digests</p>
                    <p className={"font-data-sm text-[11px] text-on-surface-variant"}>Daily summary of critical alerts</p>
                  </div>
                  <Toggle value={form.email_digests} onChange={v => update("email_digests", v)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Data Sources" && (
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
                <span className={"material-symbols-outlined text-primary"}>satellite</span>
                Data Sources
              </h3>
              <div className={"space-y-4 max-w-2xl"}>
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
          )}

          {activeTab === "Account" && (
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2 mb-5"}>
                <span className={"material-symbols-outlined text-secondary"}>account_circle</span>
                Account
              </h3>
              <div className={"grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl"}>
                <div>
                  <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Display Name</label>
                  <input value={form.display_name} onChange={e => update("display_name", e.target.value)}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"} />
                </div>
                <div>
                  <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Email Address</label>
                  <input value={form.email} onChange={e => update("email", e.target.value)}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"} />
                </div>
                <div>
                  <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Organization</label>
                  <input value={form.organization} onChange={e => update("organization", e.target.value)}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"} />
                </div>
                <div>
                  <label className={"block font-data-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-2"}>Role</label>
                  <select value={form.role} onChange={e => update("role", e.target.value)}
                    className={"w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-body-sm focus:border-primary focus:outline-none"}>
                    <option>Administrator</option>
                    <option>Analyst</option>
                    <option>Viewer</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className={"flex gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
            <button onClick={handleSave} disabled={saving}
              className={"px-6 py-2 bg-primary text-on-primary font-bold rounded hover:brightness-110 transition-all disabled:opacity-40"}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={handleReset}
              className={"px-6 py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-variant/50 transition-colors"}>
              Reset
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
