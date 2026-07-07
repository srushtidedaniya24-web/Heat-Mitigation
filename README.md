# 🌆 ThermaCity — Urban Heat Mitigation Intelligence Platform

**AI-powered urban heat island analysis for Mumbai, Thane & Navi Mumbai.**

Built for **Bhartiya Antariksh Hackathon 2026 — PS 1** (ISRO). Integrates satellite imagery (Landsat 8/9, Sentinel-2), OpenStreetMap, weather, and population data to predict land surface temperatures and recommend cooling interventions.

---

## 🚀 Quick Start

### Backend (API + ML)

```bash
cd backend
pip install -r requirements.txt

# Full pipeline: generate data → train models → start API
python run_all.py

# Or start API only (models must already be trained)
python api.py
```

API available at `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`.

### Frontend (Dashboard)

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Docker

```bash
docker build -t thermacity-api .
docker run -p 8000:8000 thermacity-api
```

---

## 🧠 Machine Learning Models

### Model 1 — XGBoost Regressor
Predicts land surface temperature (°C) from 11 urban features:
NDVI, albedo, built-up index, road density, impervious percentage, heat load index, wind obstruction, building height index, population density, distance to water, humidity.

- **SHAP analysis** identifies which features drive heat in each zone.
- Supports 5 intervention simulations: cool roofs, green roofs, cool pavements, urban greening, high-albedo paint.

### Model 2 — ThermaNet (CNN)
Classifies 64×64 thermal image tiles into 4 heat classes:
`COOL (<35°C)`, `MODERATE (35–46°C)`, `HOT (46–54°C)`, `CRITICAL (>54°C)`.

- Architecture: 4 ConvBlocks + Spatial Attention + AdaptiveAvgPool (~500K params).
- **GradCAM** visualizations localize heat sources within tiles.

---

## 📡 Data Sources

| Source | Data |
|---|---|
| **Landsat 8/9** (Google Earth Engine) | Land surface temperature |
| **Sentinel-2** (Google Earth Engine) | NDVI, albedo, land cover |
| **OpenStreetMap** (osmnx) | Road density, building footprints, green spaces |
| **Open-Meteo + WorldPop** | Humidity, wind, population density |

All pipelines include synthetic fallback for demo environments without API keys.

---

## 🗺️ API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check + model status |
| GET | `/heatmap?city=mumbai` | Zone-wise heat data |
| GET | `/hotspots` | Hottest zones with SHAP drivers |
| GET | `/zones` | List all monitored zones |
| GET | `/heatmap-grid` | Grid cells for raster layers |
| GET | `/interventions` | Cooling materials comparison |
| POST | `/simulate` | Run intervention simulation |
| GET | `/recommend/{zone_id}` | AI recommendations |
| GET | `/metrics` | Model performance metrics |
| GET | `/alerts` | Active heat alerts |
| GET | `/classify/zone/{zone_id}` | ThermaNet tile classification |
| POST | `/classify` | Classify custom tile array |
| GET | `/reports` | List generated reports |
| POST | `/reports/generate` | Generate new report |
| GET | `/settings` | Get user settings |
| POST | `/settings` | Save user settings |

---

## 🏗️ Architecture

```
React Frontend (Vite + Tailwind + Leaflet)
       │ HTTP (fetch)
       ▼
FastAPI Backend
  ├── Model 1: XGBoost Regressor (LST prediction + SHAP)
  ├── Model 2: ThermaNet CNN (thermal tile classification)
  └── Data pipelines: GEE, OSM, Open-Meteo, WorldPop
```

---

## 📁 Project Structure

```
Heat-Mitigation/
├── backend/
│   ├── api.py                          # FastAPI server
│   ├── data_pipeline.py                # Multi-source data collection
│   ├── train_model.py                  # XGBoost training + SHAP analysis
│   ├── model2_step1_generate_tiles.py  # Synthetic thermal tile dataset
│   ├── model2_step2_train_cnn.py       # ThermaNet CNN training
│   ├── model2_inference.py             # ThermaNet inference + GradCAM
│   ├── run_all.py                      # Orchestrator script
│   ├── requirements.txt
│   ├── data/                           # Training datasets
│   ├── models/                         # Trained model artifacts
│   └── outputs/                        # Metrics, SHAP plots
├── frontend/
│   ├── src/
│   │   ├── pages/                      # 10 dashboard pages
│   │   ├── components/                 # Sidebar, shared components
│   │   ├── contexts/                   # City & Settings contexts
│   │   ├── services/api.js             # API client
│   │   └── utils/                      # Formatting, raster rendering
│   ├── package.json
│   └── vite.config.js
└── Dockerfile
```

---

## ☁️ Deployment

- **Frontend:** `https://heat-mitigation.vercel.app` (Vercel)
- **Backend API:** `https://heat-mitigation-production.up.railway.app` (Railway)
- **GitHub:** `https://github.com/srushtidedaniya24-web/Heat-Mitigation.git`

---

## 🛠️ Tech Stack

**Backend:** Python, FastAPI, XGBoost, PyTorch, SHAP, scikit-learn, GeoPandas, Google Earth Engine

**Frontend:** React 18, Vite 6, Tailwind CSS 3, Leaflet, react-router-dom

---

## 📄 License

Built for Bhartiya Antariksh Hackathon 2026.
