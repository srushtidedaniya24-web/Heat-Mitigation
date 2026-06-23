"""
THERMACITY — Step 1: Data Pipeline
====================================
Pulls data from all 4 sources:
  1. Landsat 8/9  (GEE)  — LST (surface temperature)
  2. Sentinel-2   (GEE)  — NDVI, albedo, land cover
  3. OpenStreetMap (osmnx) — road density, building footprints, green spaces
  4. IMD/Open-Meteo + WorldPop — humidity, wind, population density

OUTPUT:
  data/features_raw.csv   — one row per grid cell with ALL features
  data/city_boundary.geojson
"""

import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import box, Point
import json, os, warnings
warnings.filterwarnings("ignore")

GEE_PROJECT = "urban-heat-mitigation-500012"
CITY_NAME   = "Mumbai"
BBOX        = [72.77, 18.89, 72.99, 19.14]
GRID_SIZE   = 0.005
START_DATE  = "2024-03-01"
END_DATE    = "2024-05-31"
OUTPUT_DIR  = "data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── 1. GRID ──────────────────────────────────────────────────────

def create_city_grid(bbox, grid_size):
    lon_min, lat_min, lon_max, lat_max = bbox
    lons = np.arange(lon_min, lon_max, grid_size)
    lats = np.arange(lat_min, lat_max, grid_size)
    cells = []
    for lon in lons:
        for lat in lats:
            cell_box = box(lon, lat, lon + grid_size, lat + grid_size)
            c = cell_box.centroid
            cells.append({"geometry": cell_box, "centroid_lon": c.x, "centroid_lat": c.y,
                          "cell_id": f"{lon:.4f}_{lat:.4f}"})
    gdf = gpd.GeoDataFrame(cells, crs="EPSG:4326")
    print(f"  Grid: {len(gdf)} cells over {CITY_NAME}")
    return gdf


# ── 2. LANDSAT 8/9  — LST ───────────────────────────────────────

def fetch_landsat_lst(bbox, start, end):
    """Landsat 8/9 thermal infrared → LST in °C."""
    try:
        import ee
        region = ee.Geometry.Rectangle(bbox)
        l8 = (ee.ImageCollection("LANDSAT/LC08/C02/T1_L2").filterBounds(region)
              .filterDate(start, end).filter(ee.Filter.lt("CLOUD_COVER", 20)))
        l9 = (ee.ImageCollection("LANDSAT/LC09/C02/T1_L2").filterBounds(region)
              .filterDate(start, end).filter(ee.Filter.lt("CLOUD_COVER", 20)))
        def scale(img):
            lst = img.select("ST_B10").multiply(0.00341802).add(149.0).subtract(273.15).rename("LST_celsius")
            return img.addBands(lst)
        combined = l8.merge(l9).map(scale)
        lst_img = combined.select("LST_celsius").median()
        print(f"  Landsat: {combined.size().getInfo()} scenes")
        return lst_img
    except Exception as e:
        print(f"  Landsat SKIPPED ({e})")
        return None


# ── 3. SENTINEL-2  — NDVI, albedo ────────────────────────────────

def fetch_sentinel2(bbox, start, end):
    """Sentinel-2 multispectral → NDVI + albedo."""
    try:
        import ee
        region = ee.Geometry.Rectangle(bbox)
        s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED").filterBounds(region)
              .filterDate(start, end).filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20)))
        def indices(img):
            sc = img.divide(10000)
            ndvi = sc.normalizedDifference(["B8", "B4"]).rename("NDVI")
            albedo = (sc.select("B2").multiply(0.356).add(sc.select("B4").multiply(0.130))
                      .add(sc.select("B8").multiply(0.373)).add(sc.select("B11").multiply(0.085))
                      .add(sc.select("B12").multiply(0.072)).subtract(0.0018).rename("albedo"))
            return img.addBands([ndvi, albedo])
        s2p = s2.map(indices)
        result = s2p.select(["NDVI", "albedo"]).median()
        lc_img = s2p.select("SCL").median()
        print(f"  Sentinel-2: {s2.size().getInfo()} scenes")
        return result, lc_img
    except Exception as e:
        print(f"  Sentinel-2 SKIPPED ({e})")
        return None, None


# ── 4. ESA WorldCover  — built-up ────────────────────────────────

def fetch_builtup(bbox):
    try:
        import ee
        region = ee.Geometry.Rectangle(bbox)
        wc = ee.ImageCollection("ESA/WorldCover/v200").first().select("Map")
        builtup = wc.eq(50).rename("builtup").clip(region)
        lc = wc.clip(region).rename("esa_landcover")
        print(f"  ESA WorldCover loaded")
        return builtup, lc
    except Exception as e:
        print(f"  WorldCover SKIPPED ({e})")
        return None, None


# ── 5. SAMPLE GEE BANDS  ─────────────────────────────────────────

BATCH_SIZE = 500

def sample_gee(grid_gdf, *images):
    """Sample ee.Images at each grid centroid. Returns DataFrame."""
    import ee
    combined = None
    for img in images:
        if img is not None:
            combined = img if combined is None else combined.addBands(img)
    if combined is None:
        return None
    all_rows = []
    n = len(grid_gdf)
    for start in range(0, n, BATCH_SIZE):
        end = min(start + BATCH_SIZE, n)
        batch = grid_gdf.iloc[start:end]
        features = [ee.Feature(ee.Geometry.Point([r["centroid_lon"], r["centroid_lat"]]),
                                {"cell_id": r["cell_id"]}) for _, r in batch.iterrows()]
        sampled = combined.sampleRegions(collection=ee.FeatureCollection(features), scale=100, geometries=True)
        for feat in sampled.getInfo()["features"]:
            p = feat["properties"]
            coords = feat["geometry"]["coordinates"]
            row = {"cell_id": p.get("cell_id"), "lon": coords[0], "lat": coords[1]}
            for k, v in p.items():
                if k != "cell_id":
                    row[k] = v
            all_rows.append(row)
        print(f"    Sampled {start+1}–{end}/{n}")
    df = pd.DataFrame(all_rows)
    for col in ["LST_celsius", "NDVI", "albedo", "builtup"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


# ── 6. OPENSTREETMAP  — roads, buildings, green spaces ───────────

def fetch_osm_features(grid_gdf):
    """
    Use osmnx to get real road networks, building footprints,
    and green spaces per grid cell. Uses spatial overlay for speed.
    """
    print("  Fetching OSM data via osmnx...")
    try:
        import osmnx as ox
        polygon = box(*BBOX)
        grid_3857 = grid_gdf.to_crs("EPSG:3857").copy()
        grid_3857["cell_area_m2"] = grid_3857.geometry.area

        # road network
        G = ox.graph_from_polygon(polygon, network_type="drive", simplify=True)
        edges = ox.graph_to_gdfs(G, nodes=False, edges=True)[["geometry"]]
        if len(edges) == 0:
            raise ValueError("no road edges")
        roads_3857 = edges.to_crs("EPSG:3857")
        roads_3857["road_len_m"] = roads_3857.geometry.length

        # buildings (filter to polygons only)
        bldgs = ox.features_from_polygon(polygon, tags={"building": True})
        if len(bldgs) > 0:
            bldgs = bldgs[~bldgs.geometry.isna()]
            bldgs = bldgs[bldgs.geometry.type.isin(["Polygon", "MultiPolygon"])]
        bldgs_3857 = bldgs.to_crs("EPSG:3857")[["geometry"]] if len(bldgs) > 0 else None

        # green spaces (filter to polygons only)
        greens = ox.features_from_polygon(polygon, tags={"leisure": "park"})
        if len(greens) == 0:
            greens = ox.features_from_polygon(polygon,
                tags={"landuse": ["forest", "grass", "recreation_ground"]})
        if len(greens) > 0:
            greens = greens[~greens.geometry.isna()]
            greens = greens[greens.geometry.type.isin(["Polygon", "MultiPolygon"])]
        greens_3857 = greens.to_crs("EPSG:3857")[["geometry"]] if len(greens) > 0 else None

        print(f"    OSM: {len(edges)} road edges, "
              f"{len(bldgs) if bldgs_3857 is not None else 0} buildings, "
              f"{len(greens) if greens_3857 is not None else 0} green areas")

        # ── Road density via overlay ──
        road_clipped = gpd.overlay(grid_3857[["cell_id", "geometry"]],
                                   roads_3857, how="intersection")
        road_per_cell = (road_clipped.groupby("cell_id")["road_len_m"]
                         .sum().rename("road_len_total").reset_index())
        # ── Building coverage via overlay ──
        if bldgs_3857 is not None:
            bldg_clipped = gpd.overlay(grid_3857[["cell_id", "geometry"]],
                                        bldgs_3857, how="intersection")
            bldg_clipped["bldg_area_m2"] = bldg_clipped.geometry.area
            bldg_per_cell = (bldg_clipped.groupby("cell_id")["bldg_area_m2"]
                             .sum().rename("bldg_area_total").reset_index())
        else:
            bldg_per_cell = None

        # ── Green coverage via overlay ──
        if greens_3857 is not None:
            green_clipped = gpd.overlay(grid_3857[["cell_id", "geometry"]],
                                         greens_3857, how="intersection")
            green_clipped["green_area_m2"] = green_clipped.geometry.area
            green_per_cell = (green_clipped.groupby("cell_id")["green_area_m2"]
                              .sum().rename("green_area_total").reset_index())
        else:
            green_per_cell = None

        # ── Assemble results ──
        results = grid_3857[["cell_id", "centroid_lon", "centroid_lat",
                              "cell_area_m2"]].copy()
        results = results.merge(road_per_cell, on="cell_id", how="left")
        results["road_len_total"] = results["road_len_total"].fillna(0)
        results["osm_road_density"] = (results["road_len_total"]
                                       / results["cell_area_m2"]).clip(0, 1).round(4)

        if bldg_per_cell is not None:
            results = results.merge(bldg_per_cell, on="cell_id", how="left")
            results["bldg_area_total"] = results["bldg_area_total"].fillna(0)
            results["osm_bldg_coverage"] = (results["bldg_area_total"]
                                            / results["cell_area_m2"]).clip(0, 1).round(4)
        else:
            results["osm_bldg_coverage"] = 0.0

        if green_per_cell is not None:
            results = results.merge(green_per_cell, on="cell_id", how="left")
            results["green_area_total"] = results["green_area_total"].fillna(0)
            results["osm_green_coverage"] = (results["green_area_total"]
                                             / results["cell_area_m2"]).clip(0, 1).round(4)
        else:
            results["osm_green_coverage"] = 0.0

        out = results[["cell_id",
                       "osm_road_density", "osm_bldg_coverage",
                       "osm_green_coverage"]].copy()
        print(f"    OSM done: {len(out)} cells")
        return out
    except Exception as e:
        print(f"  OSM SKIPPED ({e})")
        return None


# ── 7. WEATHER (Open-Meteo)  — humidity, wind ───────────────────

def fetch_weather_data(grid_gdf, start="2024-03-01", end="2024-05-31"):
    """
    Fetch historical weather from Open-Meteo (free, no API key).
    Uses city-center coordinates for bulk data, assigns to each cell.
    """
    print("  Fetching weather data from Open-Meteo...")
    try:
        lat_center = (BBOX[1] + BBOX[3]) / 2
        lon_center = (BBOX[0] + BBOX[2]) / 2
        import openmeteo_requests
        from openmeteo_sdk.Variable import Variable
        om = openmeteo_requests.Client()
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": lat_center, "longitude": lon_center,
            "start_date": start, "end_date": end,
            "daily": ["relative_humidity_2m_mean", "wind_speed_10m_max", "temperature_2m_max", "temperature_2m_min"],
            "timezone": "Asia/Kolkata",
        }
        responses = om.weather_api(url, params=params)
        response = responses[0]
        daily = response.Daily()
        humidity_vals = daily.Variables(0).ValuesAsNumpy()
        wind_vals = daily.Variables(1).ValuesAsNumpy()
        tmax_vals = daily.Variables(2).ValuesAsNumpy()
        tmin_vals = daily.Variables(3).ValuesAsNumpy()
        avg_humidity = float(np.nanmean(humidity_vals)) if len(humidity_vals) > 0 else 68
        avg_wind = float(np.nanmean(wind_vals)) if len(wind_vals) > 0 else 12
        avg_tmax = float(np.nanmean(tmax_vals)) if len(tmax_vals) > 0 else 34
        avg_tmin = float(np.nanmean(tmin_vals)) if len(tmin_vals) > 0 else 24
        print(f"    Weather: {len(humidity_vals)} days | avg humidity={avg_humidity:.0f}% | avg wind={avg_wind:.1f} km/h")
        rows = []
        for _, row in grid_gdf.iterrows():
            rows.append({
                "cell_id": row["cell_id"],
                "humidity": round(avg_humidity + np.random.normal(0, 3), 1),
                "wind_speed": round(avg_wind + np.random.normal(0, 1.5), 1),
                "air_temp_max": round(avg_tmax + np.random.normal(0, 1.5), 1),
                "air_temp_min": round(avg_tmin + np.random.normal(0, 1), 1),
            })
        return pd.DataFrame(rows)
    except Exception as e:
        print(f"  Weather SKIPPED ({e})")
        return None


# ── 8. POPULATION (WorldPop via GEE) ─────────────────────────────

def fetch_population(grid_gdf):
    """WorldPop 100m population count per grid cell (ImageCollection → mosaic)."""
    print("  Fetching population from WorldPop...")
    try:
        import ee
        region = ee.Geometry.Rectangle(BBOX)
        pop_coll = (ee.ImageCollection("WorldPop/GP/100m/pop")
                    .filterBounds(region)
                    .select("population"))
        pop_img = pop_coll.mosaic().clip(region)
        rows = []
        n = len(grid_gdf)
        for start in range(0, n, BATCH_SIZE):
            end = min(start + BATCH_SIZE, n)
            batch = grid_gdf.iloc[start:end]
            features = [ee.Feature(ee.Geometry.Point([r["centroid_lon"],
                                                       r["centroid_lat"]]),
                                    {"cell_id": r["cell_id"]})
                        for _, r in batch.iterrows()]
            sampled = pop_img.sampleRegions(
                collection=ee.FeatureCollection(features), scale=100)
            for feat in sampled.getInfo()["features"]:
                p = feat["properties"]
                rows.append({
                    "cell_id": p.get("cell_id"),
                    "pop_density": round(float(p.get("population", 0)) * 100, 1)
                })
            print(f"    Population sampled {start+1}-{end}/{n}")
        return pd.DataFrame(rows)
    except Exception as e:
        print(f"  Population SKIPPED ({e})")
        return None


# ── 9. NEIGHBORHOOD ASSIGNMENT ───────────────────────────────────

def assign_neighborhoods(df):
    lon_mid = (BBOX[0] + BBOX[2]) / 2
    lat_mid = (BBOX[1] + BBOX[3]) / 2
    lon_col = "lon" if "lon" in df.columns else "centroid_lon"
    lat_col = "lat" if "lat" in df.columns else "centroid_lat"
    def get_zone(row):
        lon, lat = row[lon_col], row[lat_col]
        if lon < lon_mid - 0.03 and lat > lat_mid:          return "Andheri"
        elif lon > lon_mid + 0.03 and lat > lat_mid:        return "Powai"
        elif lon > lon_mid + 0.03 and lat < lat_mid:        return "Chembur"
        elif lon < lon_mid - 0.03 and lat < lat_mid:        return "Worli"
        elif lat > lat_mid + 0.04:                           return "Bandra"
        elif lat < lat_mid - 0.04:                           return "Colaba"
        else:                                                return "Fort"
    df["neighborhood"] = df.apply(get_zone, axis=1)
    print(f"  Neighborhoods: {df['neighborhood'].value_counts().to_dict()}")
    return df


# ── 10. FALLBACK — synthetic feature generator ──────────────────

def add_synthetic_fallback(df):
    """Fill any missing feature columns with synthetic data."""
    np.random.seed(42)
    n = len(df)
    if "LST_celsius" not in df.columns or df["LST_celsius"].isna().all():
        df["LST_celsius"] = np.clip(np.random.normal(42, 8, n), 28, 70)
        print("  [SYNTHETIC] LST_celsius")
    if "NDVI" not in df.columns or df["NDVI"].isna().all():
        df["NDVI"] = np.clip(np.random.normal(0.18, 0.12, n), -0.1, 0.7)
        print("  [SYNTHETIC] NDVI")
    if "albedo" not in df.columns or df["albedo"].isna().all():
        df["albedo"] = np.clip(np.random.normal(0.14, 0.06, n), 0.05, 0.5)
        print("  [SYNTHETIC] albedo")
    if "builtup" not in df.columns or df["builtup"].isna().all():
        df["builtup"] = np.random.binomial(1, 0.6, n)
        print("  [SYNTHETIC] builtup")
    if "road_density" not in df.columns:
        df["road_density"] = np.clip(0.8 - df["NDVI"] * 2 + np.random.normal(0, 0.1, n), 0, 1)
        print("  [SYNTHETIC] road_density")
    if "pop_density" not in df.columns:
        df["pop_density"] = (df["builtup"] * 15000 + np.random.normal(0, 1000, n)).clip(0)
        print("  [SYNTHETIC] pop_density")
    for col in ["dist_to_water", "wind_obstruction", "bldg_height_idx",
                 "impervious_pct", "heat_load_idx", "humidity"]:
        if col not in df.columns:
            if col == "dist_to_water":
                df[col] = np.random.exponential(scale=1500, size=n)
            elif col == "wind_obstruction":
                df[col] = np.clip(df["builtup"] * 0.7 + np.random.normal(0, 0.1, n), 0, 1)
            elif col == "bldg_height_idx":
                df[col] = np.clip(df["builtup"] * 0.6 + np.random.normal(0, 0.1, n), 0, 1)
            elif col == "impervious_pct":
                df[col] = np.clip(1 - df["NDVI"] - df["albedo"] * 0.3 + np.random.normal(0, 0.05, n), 0, 1)
            elif col == "heat_load_idx":
                rd = df.get("road_density", df.get("osm_road_density", 0.5))
                ip = df.get("impervious_pct", 0.5)
                wo = df.get("wind_obstruction", 0.5)
                df[col] = rd * 0.4 + ip * 0.4 + wo * 0.2
            elif col == "humidity":
                df[col] = np.clip(65 + np.random.normal(0, 8, n), 30, 95)
            print(f"  [SYNTHETIC] {col}")
    # Use OSM data if available, else synthetic substitutes
    if "osm_road_density" in df.columns:
        df["road_density"] = df["osm_road_density"].fillna(df["road_density"])
    if "osm_bldg_coverage" in df.columns:
        df["bldg_height_idx"] = df["osm_bldg_coverage"].fillna(df["bldg_height_idx"])
    if "osm_green_coverage" in df.columns:
        df["ndvi_boost"] = df["osm_green_coverage"] * 0.3
        df["NDVI"] = (df["NDVI"] + df["ndvi_boost"]).clip(-0.1, 0.8)
    if "wind_speed" in df.columns:
        df["wind_obstruction"] = (1 - df["wind_speed"] / 30).clip(0, 1)
    if "ndvi_boost" in df.columns:
        df.drop(columns=["ndvi_boost"], inplace=True)
    print(f"  Total features: {len(df.columns)}")
    return df


# ── MAIN PIPELINE ────────────────────────────────────────────────

def run_pipeline():
    print("\n" + "=" * 50)
    print("  THERMACITY — Multi-Source Data Pipeline")
    print("=" * 50 + "\n")

    import ee
    ee.Initialize(project=GEE_PROJECT)
    print(f"  GEE initialized: project={GEE_PROJECT}")

    grid_gdf = create_city_grid(BBOX, GRID_SIZE)

    # — Landsat 8/9 (Source 1) + Sentinel-2 (Source 2) + WorldCover —
    lst_img = fetch_landsat_lst(BBOX, START_DATE, END_DATE)
    s2_img, lc_img = fetch_sentinel2(BBOX, START_DATE, END_DATE)
    builtup_img, esa_lc = fetch_builtup(BBOX)

    gee_df = sample_gee(grid_gdf, lst_img, s2_img, builtup_img)

    if gee_df is not None:
        df = gee_df
        if esa_lc is not None:
            lc_sampled = sample_gee(grid_gdf, esa_lc)
            if lc_sampled is not None and "esa_landcover" in lc_sampled.columns:
                df["esa_landcover"] = lc_sampled["esa_landcover"]
    else:
        df = grid_gdf.copy()
        df["lon"] = df["centroid_lon"]
        df["lat"] = df["centroid_lat"]

    # — OpenStreetMap (Source 3) —
    osm_df = fetch_osm_features(grid_gdf)
    if osm_df is not None:
        merge_cols = [c for c in osm_df.columns if c != "cell_id"]
        df = df.merge(osm_df[["cell_id"] + merge_cols], on="cell_id", how="left")

    # — Weather via Open-Meteo (Source 4a) —
    weather_df = fetch_weather_data(grid_gdf, START_DATE, END_DATE)
    if weather_df is not None:
        wc = [c for c in weather_df.columns if c != "cell_id"]
        df = df.merge(weather_df[["cell_id"] + wc], on="cell_id", how="left")

    # — Population via WorldPop (Source 4b) —
    pop_df = fetch_population(grid_gdf)
    if pop_df is not None:
        df = df.merge(pop_df, on="cell_id", how="left")

    # — Fill remaining NaN (WorldPop gaps → 0, etc.) —
    nan_cols = [c for c in df.columns if df[c].isna().any()]
    for c in nan_cols:
        if c not in ("cell_id", "neighborhood", "geometry"):
            df[c] = df[c].fillna(0)
            print(f"  Filled {df[c].isna().sum()} NaN in {c} with 0")
    print(f"  NaN cleanup done for: {nan_cols}")

    # — Fill missing with synthetic fallbacks —
    df = add_synthetic_fallback(df)

    # — Neighborhoods —
    df = assign_neighborhoods(df)

    # — Save —
    out_path = os.path.join(OUTPUT_DIR, "features_raw.csv")
    cols_to_save = [c for c in df.columns if c not in ("geometry", "centroid_lon", "centroid_lat")]
    df[cols_to_save].to_csv(out_path, index=False)
    print(f"\n  Saved {len(df)} rows -> {out_path}")
    print(f"  Columns: {list(df.columns)}")
    return df


if __name__ == "__main__":
    df = run_pipeline()
    print("\nStep 1 complete. Run train_model.py next.")
