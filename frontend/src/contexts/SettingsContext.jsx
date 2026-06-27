import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchSettings } from "../services/api";

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

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateSettings = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
