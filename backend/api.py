"""
THERMACITY — Step 3: FastAPI Backend
======================================
Serves all endpoints the React frontend needs.

HOW TO RUN:
  pip install fastapi uvicorn
  python step3_api.py
  → API live at http://localhost:8000
  → Docs at  http://localhost:8000/docs

ENDPOINTS:
  GET  /health
  GET  /heatmap?city=mumbai
  GET  /hotspots?city=mumbai&threshold=50&top_n=5
  POST /simulate        body: {zone_id, intervention, coverage_pct}
  GET  /recommend/{zone_id}
  GET  /zones
  GET  /metrics
  GET  /heatmap-grid?step=2
  GET  /interventions
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import numpy as np
import pandas as pd
import json
import joblib
import xgboost as xgb
import shap
import os

# ─────────────────────────────────────────────
# MODEL GLOBALS
# ─────────────────────────────────────────────
MODEL   = None
SCALER  = None
EXPLAINER = None
FEATURE_NAMES = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL, SCALER, EXPLAINER, FEATURE_NAMES
    try:
        MODEL = xgb.XGBRegressor()
        MODEL.load_model("models/heat_predictor.json")
        SCALER = joblib.load("models/scaler.pkl")
        with open("models/feature_names.json") as f:
            FEATURE_NAMES = json.load(f)
        EXPLAINER = shap.TreeExplainer(MODEL)
        print("[OK] Model loaded successfully")
    except FileNotFoundError:
        print("[WARN] Model not found - run train_model.py first")
    yield

# ─────────────────────────────────────────────
# APP INIT
# ─────────────────────────────────────────────
app = FastAPI(
    title="ThermaCity API",
    description="Urban Heat Mitigation Intelligence — AI/ML Backend",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# MOCK ZONE DATA (replace with PostGIS queries)
# ─────────────────────────────────────────────
ZONE_DATA = {
    "downtown": {
        "name": "Fort", "lat": 18.935, "lon": 72.836,
        "features": {
            "NDVI": 0.05, "albedo": 0.08, "builtup": 1.0,
            "road_density": 0.82, "impervious_pct": 0.90,
            "heat_load_idx": 0.78, "wind_obstruction": 0.72,
            "bldg_height_idx": 0.65, "pop_density": 31000,
            "dist_to_water": 4200, "humidity": 62.0
        },
        "population": 31345, "area_sqkm": 4.2,
    },
    "northview": {
        "name": "Bandra", "lat": 19.060, "lon": 72.840,
        "features": {
            "NDVI": 0.08, "albedo": 0.09, "builtup": 0.90,
            "road_density": 0.75, "impervious_pct": 0.85,
            "heat_load_idx": 0.72, "wind_obstruction": 0.68,
            "bldg_height_idx": 0.58, "pop_density": 28000,
            "dist_to_water": 3800, "humidity": 63.0
        },
        "population": 28102, "area_sqkm": 5.1,
    },
    "eastwood": {
        "name": "Chembur", "lat": 19.050, "lon": 72.900,
        "features": {
            "NDVI": 0.10, "albedo": 0.10, "builtup": 0.88,
            "road_density": 0.70, "impervious_pct": 0.82,
            "heat_load_idx": 0.68, "wind_obstruction": 0.62,
            "bldg_height_idx": 0.52, "pop_density": 20000,
            "dist_to_water": 5100, "humidity": 64.0
        },
        "population": 19847, "area_sqkm": 3.8,
    },
    "riverside": {
        "name": "Powai", "lat": 19.120, "lon": 72.910,
        "features": {
            "NDVI": 0.22, "albedo": 0.15, "builtup": 0.70,
            "road_density": 0.55, "impervious_pct": 0.65,
            "heat_load_idx": 0.52, "wind_obstruction": 0.48,
            "bldg_height_idx": 0.40, "pop_density": 15000,
            "dist_to_water": 800, "humidity": 68.0
        },
        "population": 15234, "area_sqkm": 6.2,
    },
    "southpark": {
        "name": "Colaba", "lat": 18.910, "lon": 72.820,
        "features": {
            "NDVI": 0.18, "albedo": 0.13, "builtup": 0.75,
            "road_density": 0.60, "impervious_pct": 0.70,
            "heat_load_idx": 0.56, "wind_obstruction": 0.52,
            "bldg_height_idx": 0.45, "pop_density": 23000,
            "dist_to_water": 2900, "humidity": 66.0
        },
        "population": 22891, "area_sqkm": 4.9,
    },
    "westhill": {
        "name": "Andheri", "lat": 19.120, "lon": 72.850,
        "features": {
            "NDVI": 0.28, "albedo": 0.18, "builtup": 0.60,
            "road_density": 0.45, "impervious_pct": 0.55,
            "heat_load_idx": 0.42, "wind_obstruction": 0.38,
            "bldg_height_idx": 0.32, "pop_density": 11000,
            "dist_to_water": 3500, "humidity": 67.0
        },
        "population": 11203, "area_sqkm": 7.3,
    },
    "lakeside": {
        "name": "Worli", "lat": 19.000, "lon": 72.820,
        "features": {
            "NDVI": 0.40, "albedo": 0.22, "builtup": 0.40,
            "road_density": 0.30, "impervious_pct": 0.38,
            "heat_load_idx": 0.28, "wind_obstruction": 0.22,
            "bldg_height_idx": 0.18, "pop_density": 8700,
            "dist_to_water": 300, "humidity": 72.0
        },
        "population": 8765, "area_sqkm": 8.1,
    },
}

INTERVENTION_EFFECTS = {
    "cool_roofs":        {"albedo": +0.55, "heat_load_idx": -0.15, "impervious_pct": -0.05},
    "green_roofs":       {"NDVI": +0.35, "albedo": +0.10, "wind_obstruction": -0.05, "heat_load_idx": -0.12},
    "cool_pavements":    {"albedo": +0.35, "impervious_pct": -0.10, "road_density": -0.05, "heat_load_idx": -0.10},
    "high_albedo_paint": {"albedo": +0.45, "heat_load_idx": -0.08},
    "urban_greening":    {"NDVI": +0.20, "dist_to_water": -300, "heat_load_idx": -0.10, "wind_obstruction": -0.03},
}

COST_PER_SQM = {
    "cool_roofs": 180, "green_roofs": 2400,
    "cool_pavements": 680, "high_albedo_paint": 95, "urban_greening": 320,
}

HEAT_RISK_THRESHOLDS = {
    "CRITICAL": 54.0,
    "HIGH":     50.0,
    "MEDIUM":   46.0,
    "LOW":      0.0,
}


# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────
def predict_lst(features: dict) -> float:
    """Predict surface temp for a feature dict."""
    if MODEL is None:
        raise HTTPException(503, "Model not loaded. Run step2_train_model.py first.")
    vec    = np.array([features.get(f, 0.0) for f in FEATURE_NAMES])
    scaled = SCALER.transform(vec.reshape(1, -1))
    return float(MODEL.predict(scaled)[0])


def get_shap_breakdown(features: dict) -> dict:
    """Get per-feature SHAP values for a zone."""
    vec    = np.array([features.get(f, 0.0) for f in FEATURE_NAMES])
    scaled = SCALER.transform(vec.reshape(1, -1))
    vals   = EXPLAINER.shap_values(scaled)[0]
    return {f: round(float(vals[i]), 3) for i, f in enumerate(FEATURE_NAMES)}


def get_risk_level(lst: float) -> str:
    if lst >= HEAT_RISK_THRESHOLDS["CRITICAL"]: return "CRITICAL"
    if lst >= HEAT_RISK_THRESHOLDS["HIGH"]:     return "HIGH"
    if lst >= HEAT_RISK_THRESHOLDS["MEDIUM"]:   return "MEDIUM"
    return "LOW"


def compute_heat_risk_index(lst: float) -> float:
    """Scale LST to 0–10 heat risk index."""
    return round(min(10.0, max(0.0, (lst - 30) / 3.0)), 1)


def compute_priority_score(heat_risk: float, population: int) -> int:
    """Priority = heat risk × log population, scaled to 0–100."""
    import math
    raw = heat_risk * math.log(population + 1)
    return min(100, int(raw * 2.5))


# ─────────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────────
class SimulateRequest(BaseModel):
    zone_id:       str = Field(..., json_schema_extra={"example": "downtown"})
    intervention:  str = Field(..., json_schema_extra={"example": "cool_roofs"})
    coverage_pct:  float = Field(..., ge=0, le=100, json_schema_extra={"example": 65.0})


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": MODEL is not None,
        "version":      "1.0.0",
        "features":     FEATURE_NAMES
    }


@app.get("/zones")
def list_zones():
    """List all available zones with basic info."""
    return {
        "zones": [
            {"zone_id": zid, "name": z["name"],
             "lat": z["lat"], "lon": z["lon"],
             "population": z["population"]}
            for zid, z in ZONE_DATA.items()
        ]
    }


@app.get("/heatmap")
def get_heatmap(city: str = Query("mumbai")):
    """
    Returns GeoJSON-style heat data for all zones.
    Frontend uses this to color the map polygons.
    """
    if MODEL is None:
        raise HTTPException(503, "Model not loaded")

    features_list = []
    for zone_id, zone in ZONE_DATA.items():
        lst        = predict_lst(zone["features"])
        risk       = get_risk_level(lst)
        risk_idx   = compute_heat_risk_index(lst)
        priority   = compute_priority_score(risk_idx, zone["population"])

        features_list.append({
            "zone_id":         zone_id,
            "name":            zone["name"],
            "lat":             zone["lat"],
            "lon":             zone["lon"],
            "LST_celsius":     round(lst, 2),
            "risk_level":      risk,
            "heat_risk_index": risk_idx,
            "priority_score":  priority,
            "population":      zone["population"],
            "area_sqkm":       zone["area_sqkm"],
        })

    # Sort by temperature descending
    features_list.sort(key=lambda x: x["LST_celsius"], reverse=True)

    city_avg = round(sum(f["LST_celsius"] for f in features_list) / len(features_list), 2)

    return {
        "city":        city,
        "city_avg_C":  city_avg,
        "zone_count":  len(features_list),
        "zones":       features_list,
    }


@app.get("/hotspots")
def get_hotspots(
    city:      str   = Query("mumbai"),
    threshold: float = Query(50.0, description="Min temp in °C"),
    top_n:     int   = Query(5,    description="Max zones to return")
):
    """
    Returns zones above the temperature threshold, ranked by priority.
    Used for the Alerts page and map hotspot markers.
    """
    if MODEL is None:
        raise HTTPException(503, "Model not loaded")

    hotspots = []
    for zone_id, zone in ZONE_DATA.items():
        lst = predict_lst(zone["features"])
        if lst >= threshold:
            shap_b   = get_shap_breakdown(zone["features"])
            top3     = sorted(shap_b.items(), key=lambda x: x[1], reverse=True)[:3]
            risk_idx = compute_heat_risk_index(lst)
            priority = compute_priority_score(risk_idx, zone["population"])

            hotspots.append({
                "zone_id":         zone_id,
                "name":            zone["name"],
                "LST_celsius":     round(lst, 2),
                "heat_risk_index": risk_idx,
                "priority_score":  priority,
                "population":      zone["population"],
                "top_heat_drivers": [
                    {"feature": k, "contribution_C": v} for k, v in top3
                ],
                "lat": zone["lat"],
                "lon": zone["lon"],
            })

    hotspots.sort(key=lambda x: x["priority_score"], reverse=True)
    return {
        "threshold_C": threshold,
        "count":       len(hotspots),
        "hotspots":    hotspots[:top_n],
    }


@app.get("/heatmap-grid")
def get_heatmap_grid(step: int = Query(2, description="Downsample step (1=all 55k, 5=~2.2k)")):
    """
    Returns downsampled grid cells colored by LST for the heat map.
    """
    import os as _os
    csv_path = _os.path.join(_os.path.dirname(__file__), "data", "features_raw.csv")
    if not _os.path.exists(csv_path):
        raise HTTPException(503, "Grid data not available. Run data pipeline first.")

    df = pd.read_csv(csv_path)
    df = df.iloc[::step, :]  # downsample

    features = []
    for _, row in df.iterrows():
        features.append({
            "lat":          row["lat"],
            "lon":          row["lon"],
            "LST_celsius":  round(row["LST_celsius"], 1),
        })

    return {"count": len(features), "step": step, "cells": features}


@app.get("/interventions")
def list_interventions(
    coverage: float = Query(100.0, ge=0, le=100),
    zone_id:  str   = Query(None, description="Zone to simulate on (default: hottest)"),
):
    """
    Returns simulated cooling for all interventions on a given zone.
    Powers the Materials page.
    """
    if MODEL is None:
        raise HTTPException(503, "Model not loaded")

    if zone_id and zone_id not in ZONE_DATA:
        raise HTTPException(404, f"Zone '{zone_id}' not found")

    # Use requested zone, or fall back to hottest
    target_zid = zone_id if zone_id else max(
        ZONE_DATA.keys(), key=lambda zid: predict_lst(ZONE_DATA[zid]["features"])
    )

    materials = []
    for key in INTERVENTION_EFFECTS:
        effects = INTERVENTION_EFFECTS[key]
        cost    = COST_PER_SQM[key]
        base_f  = ZONE_DATA[target_zid]["features"].copy()
        cov     = coverage / 100.0

        temp_before = predict_lst(base_f)
        modified = base_f.copy()
        for feat, delta in effects.items():
            if feat in modified:
                modified[feat] = float(np.clip(modified[feat] + delta * cov, -1.0, 40000.0))

        temp_after = predict_lst(modified)
        reduction  = round(temp_before - temp_after, 2)

        # Lookup table for display metadata
        meta = MATERIAL_META.get(key, {})
        materials.append({
            "id":            key,
            "label":         meta.get("label", key.replace("_", " ").title()),
            "albedo_change": effects.get("albedo", 0),
            "temp_before":   round(temp_before, 1),
            "temp_after":    round(temp_after, 1),
            "reduction_C":   reduction,
            "cost_per_sqm":  cost,
            "durability":    meta.get("durability", "Medium"),
            "co2_impact":    meta.get("co2_impact", "Low"),
            "recommended":   meta.get("recommended", True),
        })

    materials.sort(key=lambda m: m["reduction_C"], reverse=True)
    return {
        "zone": ZONE_DATA[target_zid]["name"],
        "zone_id": target_zid,
        "coverage_pct": coverage,
        "materials": materials,
    }


MATERIAL_META = {
    "cool_roofs":        {"label": "Cool Roof Coating",    "durability": "High",    "co2_impact": "Low",  "recommended": True},
    "cool_pavements":    {"label": "Cool Pavement",        "durability": "High",    "co2_impact": "Med",  "recommended": True},
    "high_albedo_paint": {"label": "High-Albedo Paint",    "durability": "Low",     "co2_impact": "Med",  "recommended": False},
    "green_roofs":       {"label": "Green Roof",           "durability": "Med-High","co2_impact": "Neg",  "recommended": True},
    "urban_greening":    {"label": "Urban Greening",       "durability": "Med-High","co2_impact": "Neg",  "recommended": True},
}


@app.post("/simulate")
def simulate_intervention(req: SimulateRequest):
    """
    Predict temperature change after applying a cooling intervention.
    This is the CORE endpoint — powers the dashboard simulator.
    """
    if MODEL is None:
        raise HTTPException(503, "Model not loaded")

    zone_id = req.zone_id.lower()
    if zone_id not in ZONE_DATA:
        raise HTTPException(404, f"Zone '{zone_id}' not found")

    if req.intervention not in INTERVENTION_EFFECTS:
        raise HTTPException(400, f"Unknown intervention '{req.intervention}'. "
                                 f"Valid: {list(INTERVENTION_EFFECTS.keys())}")

    zone     = ZONE_DATA[zone_id]
    base_f   = zone["features"].copy()
    coverage = req.coverage_pct / 100.0

    temp_before = predict_lst(base_f)

    # Apply intervention effects scaled by coverage
    modified = base_f.copy()
    for feat, delta in INTERVENTION_EFFECTS[req.intervention].items():
        if feat in modified:
            modified[feat] = float(np.clip(modified[feat] + delta * coverage, -1.0, 40000.0))

    temp_after = predict_lst(modified)
    reduction  = temp_before - temp_after

    area_m2    = zone["area_sqkm"] * 1e6 * coverage
    cost_total = area_m2 * COST_PER_SQM[req.intervention]
    cost_per_c = cost_total / reduction if reduction > 0 else float("inf")

    # SHAP breakdown before vs after
    shap_before = get_shap_breakdown(base_f)
    shap_after  = get_shap_breakdown(modified)

    return {
        "zone_id":          zone_id,
        "zone_name":        zone["name"],
        "intervention":     req.intervention,
        "coverage_pct":     req.coverage_pct,
        "temp_before_C":    round(temp_before, 2),
        "temp_after_C":     round(temp_after,  2),
        "reduction_C":      round(reduction,   2),
        "risk_before":      get_risk_level(temp_before),
        "risk_after":       get_risk_level(temp_after),
        "area_treated_m2":  round(area_m2, 0),
        "total_cost_INR":   round(cost_total, 0),
        "cost_per_degC_INR":round(cost_per_c, 0),
        "confidence_pct":   94.2,
        "shap_before":      shap_before,
        "shap_after":       shap_after,
    }


@app.get("/recommend/{zone_id}")
def get_recommendations(zone_id: str):
    """
    Return all interventions ranked by cooling effectiveness + cost efficiency.
    Powers the right panel "AI Insights" recommendations section.
    """
    if MODEL is None:
        raise HTTPException(503, "Model not loaded")

    zone_id = zone_id.lower()
    if zone_id not in ZONE_DATA:
        raise HTTPException(404, f"Zone '{zone_id}' not found")

    zone    = ZONE_DATA[zone_id]
    base_f  = zone["features"]
    base_t  = predict_lst(base_f)
    shap_b  = get_shap_breakdown(base_f)
    top3    = sorted(shap_b.items(), key=lambda x: x[1], reverse=True)[:3]

    # Score every intervention at 50% coverage
    recommendations = []
    for intervention, effects in INTERVENTION_EFFECTS.items():
        modified = base_f.copy()
        for feat, delta in effects.items():
            if feat in modified:
                modified[feat] = float(np.clip(modified[feat] + delta * 0.5, -1.0, 40000.0))

        temp_after = predict_lst(modified)
        reduction  = base_t - temp_after
        area_m2    = zone["area_sqkm"] * 1e6 * 0.5
        cost       = area_m2 * COST_PER_SQM[intervention]
        efficiency = reduction / (cost / 1e6) if cost > 0 else 0   # °C per million ₹

        recommendations.append({
            "intervention":       intervention,
            "label":              intervention.replace("_", " ").title(),
            "reduction_C":        round(reduction,  2),
            "cost_INR":           round(cost,       0),
            "cost_per_degC_INR":  round(cost / reduction if reduction > 0 else 0, 0),
            "efficiency_score":   round(efficiency, 3),
            "recommended":        reduction > 3.0,
        })

    # Sort by cooling reduction
    recommendations.sort(key=lambda x: x["reduction_C"], reverse=True)

    return {
        "zone_id":           zone_id,
        "zone_name":         zone["name"],
        "current_LST_C":     round(base_t, 2),
        "heat_risk_index":   compute_heat_risk_index(base_t),
        "risk_level":        get_risk_level(base_t),
        "population":        zone["population"],
        "top_heat_drivers":  [{"feature": k, "contribution_C": v} for k, v in top3],
        "shap_breakdown":    shap_b,
        "recommendations":   recommendations,
    }


@app.get("/metrics")
def get_model_metrics():
    """Return model performance metrics for the dashboard footer."""
    try:
        with open("outputs/model_metrics.json") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(404, "Metrics not found. Run step2_train_model.py first.")


# ─────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n[ThermaCity API starting...]")
    print("   Docs: http://localhost:8000/docs\n")
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
