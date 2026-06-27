export function formatTemp(celsius, unit = "celsius") {
  if (celsius == null || isNaN(celsius)) return "--";
  if (unit === "fahrenheit") {
    const f = celsius * 9 / 5 + 32;
    return `${f.toFixed(1)}°F`;
  }
  return `${Number(celsius).toFixed(1)}°C`;
}

export function formatTime(isoString, format = "24h") {
  if (!isoString) return "--";
  const d = new Date(isoString);
  if (isNaN(d)) return "--";
  if (format === "12h") {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(isoString) {
  if (!isoString) return "--";
  const d = new Date(isoString);
  if (isNaN(d)) return "--";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
