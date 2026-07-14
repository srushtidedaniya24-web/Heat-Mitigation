import { Link, useLocation } from "react-router-dom";
import { useCity } from "../contexts/CityContext";
import { useSidebar } from "../contexts/SidebarContext";

const navItems = [
  { to: "/", label: "Overview", icon: "dashboard" },
  { to: "/heat-maps", label: "Heat Maps", icon: "thermostat" },
  { to: "/materials", label: "Materials", icon: "layers" },
  { to: "/analysis", label: "Analysis", icon: "analytics" },
  { to: "/predictions", label: "Predictions", icon: "query_stats" },
  { to: "/optimization", label: "Optimization", icon: "auto_fix_high" },
  { to: "/alerts", label: "Alerts", icon: "warning" },
  { to: "/reports", label: "Reports", icon: "description" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const bottomLinks = [
  { to: "/help", label: "Help Center", icon: "help" },
  { to: "/documentation", label: "Documentation", icon: "menu_book" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { selectedCity, setSelectedCity } = useCity();
  const { open, close } = useSidebar();

  const linkClass = (path) =>
    pathname === path
      ? "bg-primary/10 text-primary border-r-2 border-primary px-4 py-3 flex items-center gap-3 translate-x-1 transition-transform"
      : "text-on-surface-variant hover:text-on-surface px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high/50 transition-all duration-200";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 z-[500] flex-col py-panel-gap bg-surface-container-lowest border-r border-outline-variant">
        <SidebarContent
          pathname={pathname}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          linkClass={linkClass}
        />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[600] backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 z-[601] flex flex-col py-panel-gap bg-surface-container-lowest border-r border-outline-variant transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <span className="font-display-md text-display-md font-bold text-primary">ThermaCity</span>
          <button onClick={close} className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        <SidebarContent
          pathname={pathname}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          linkClass={linkClass}
          onNavClick={close}
        />
      </aside>
    </>
  );
}

function SidebarContent({ pathname, selectedCity, setSelectedCity, linkClass, onNavClick }) {
  return (
    <>
      <div className="px-6 mb-6">
        <h2 className="font-headline-sm text-headline-sm text-primary">Urban Core</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Sensor Network Active</p>
      </div>
      <div className="px-4 mb-4">
        <label className="font-data-sm text-data-sm text-on-surface-variant block mb-1">City Filter</label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Cities</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Thane">Thane</option>
          <option value="Navi Mumbai">Navi Mumbai</option>
        </select>
      </div>
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={linkClass(to)} onClick={onNavClick}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-body-sm text-body-sm">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-4 pb-4 space-y-2">
        <div className="bg-surface-container p-3 rounded-lg border border-outline-variant">
          <div className="flex items-center justify-between mb-1">
            <span className="font-data-sm text-data-sm text-on-surface-variant">AI Model Status</span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          </div>
          <p className="font-data-sm text-[10px] text-primary font-semibold">Optimal</p>
        </div>
        <div className="flex flex-col gap-1 pt-1">
          {bottomLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="text-on-surface-variant hover:text-on-surface px-4 py-2 flex items-center gap-3 font-body-sm text-body-sm"
              onClick={onNavClick}
            >
              <span className="material-symbols-outlined text-lg">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
