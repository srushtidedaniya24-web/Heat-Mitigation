# ThermaCity React Dashboard

A Vite + React conversion of the supplied ThermaCity HTML screens.

## Included routes

- `/` — Overview
- `/heat-maps` — Interactive Heat Maps
- `/materials` — Materials & Interventions
- `/analysis` — Heat Analysis & AI Insights
- `/optimization` — Scenario Optimization
- `/alerts` — Alerts & Monitoring

Placeholder routes are included for Predictions, Reports, Settings, Help, and Documentation.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- Tailwind theme tokens were moved from the CDN scripts into `tailwind.config.js`.
- Inline DOM scripts were replaced with a reusable React effect hook.
- Sidebar navigation uses `react-router-dom`.
- The original map imagery still uses the supplied remote image URLs. Replace those URLs with files inside `public/assets` when local assets are available.
