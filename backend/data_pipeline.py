"""
THERMACITY — Step 1: Data Pipeline
====================================
Pulls Landsat 8/9 (thermal → LST) and Sentinel-2 (NDVI, albedo)
data from Google Earth Engine for a target city, then exports
a clean feature GeoDataFrame ready for model training.

HOW TO RUN:
  1. pip install earthengine-api geemap
  2. earthengine authenticate    ← run this once in terminal
  3. python step1_data_pipeline.py

OUTPUT:
  data/features_raw.csv   — one row per 100m grid cell
  data/city_boundary.geojson
"""

import ee
import geemap
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import box, Point
import json
import os

# ─────────────────────────────────────────────
# CONFIGURATION — change these for your city
# ─────────────────────────────────────────────
CITY_NAME   = "Mumbai"
# Bounding box for Mumbai (lon_min, lat_min, lon_max, lat_max)
BBOX        = [72.77, 18.89, 72.99, 19.14]
GRID_SIZE   = 0.001          # ~100m grid cells
START_DATE  = "2024-03-01"   # Use March-May for Indian summer heat
END_DATE    = "2024-05-31"
OUTPUT_DIR  = "data"

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─────────────────────────────────────────────
# GEE INITIALIZATION
# ─────────────────────────────────────────────
GEE_PROJECT = "urban-heat-mitigation-500012"


def init_gee():
    """Initialize Google Earth Engine."""
    try:
        ee.Initialize(project=GEE_PROJECT)
        print("✓ GEE initialized successfully")
    except Exception:
        print("→ Authenticating with GEE...")
        ee.Authenticate()
        ee.Initialize(project=GEE_PROJECT)
        print("✓ GEE initialized")


# ─────────────────────────────────────────────
# GRID CREATION
# ─────────────────────────────────────────────
def create_city_grid(bbox, grid_size):
    """
    Create a regular grid of cells over the city bounding box.
    Each cell = one training sample.
    Returns a GeoDataFrame with cell polygons and centroids.
    """
    lon_min, lat_min, lon_max, lat_max = bbox
    lons = np.arange(lon_min, lon_max, grid_size)
    lats = np.arange(lat_min, lat_max, grid_size)

    cells = []
    for lon in lons:
        for lat in lats:
            cell_box = box(lon, lat, lon + grid_size, lat + grid_size)
            centroid = cell_box.centroid
            cells.append({
                "geometry": cell_box,
                "centroid_lon": centroid.x,
                "centroid_lat": centroid.y,
                "cell_id": f"{lon:.4f}_{lat:.4f}"
            })

    gdf = gpd.GeoDataFrame(cells, crs="EPSG:4326")
    print(f"✓ Created {len(gdf)} grid cells over {CITY_NAME}")
    return gdf


# ─────────────────────────────────────────────
# LANDSAT LST EXTRACTION
# ─────────────────────────────────────────────
def compute_lst_from_landsat(bbox, start_date, end_date):
    """
    Compute Land Surface Temperature (LST) in Celsius from Landsat 8/9.

    Method:
      1. Load Landsat Collection 2 Surface Temperature (Band ST_B10)
      2. Apply scale factor (0.00341802) and offset (-149.0)
      3. Convert Kelvin → Celsius
      4. Take median composite over date range
      5. Return ee.Image
    """
    region = ee.Geometry.Rectangle(bbox)

    # Landsat 8 & 9 Collection 2 Level-2 (Surface Temperature)
    l8 = (ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
            .filterBounds(region)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt("CLOUD_COVER", 20)))

    l9 = (ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
            .filterBounds(region)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt("CLOUD_COVER", 20)))

    combined = l8.merge(l9)

    def apply_scale_lst(image):
        """Convert raw DN to LST in Celsius."""
        # ST_B10 is thermal band; scale factor per USGS spec
        lst_kelvin = (image.select("ST_B10")
                           .multiply(0.00341802)
                           .add(149.0))
        lst_celsius = lst_kelvin.subtract(273.15).rename("LST_celsius")
        return image.addBands(lst_celsius)

    lst_collection = combined.map(apply_scale_lst)
    lst_median     = lst_collection.select("LST_celsius").median()

    print(f"✓ Landsat LST image computed ({combined.size().getInfo()} scenes)")
    return lst_median


# ─────────────────────────────────────────────
# SENTINEL-2 NDVI & ALBEDO EXTRACTION
# ─────────────────────────────────────────────
def compute_ndvi_albedo(bbox, start_date, end_date):
    """
    Compute NDVI and broadband albedo from Sentinel-2 SR.

    NDVI  = (NIR - RED) / (NIR + RED)  using B8, B4
    Albedo = weighted sum of bands (Liang 2001 formula)
    """
    region = ee.Geometry.Rectangle(bbox)

    s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterBounds(region)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20)))

    def compute_indices(image):
        # Scale to 0–1 reflectance
        scaled = image.divide(10000)

        # NDVI
        ndvi = scaled.normalizedDifference(["B8", "B4"]).rename("NDVI")

        # Broadband albedo (Liang 2001 coefficients)
        albedo = (scaled.select("B2").multiply(0.356)
                  .add(scaled.select("B4").multiply(0.130))
                  .add(scaled.select("B8").multiply(0.373))
                  .add(scaled.select("B11").multiply(0.085))
                  .add(scaled.select("B12").multiply(0.072))
                  .subtract(0.0018)
                  .rename("albedo"))

        return image.addBands([ndvi, albedo])

    s2_processed = s2.map(compute_indices)
    ndvi_median   = s2_processed.select("NDVI").median()
    albedo_median = s2_processed.select("albedo").median()

    result = ndvi_median.addBands(albedo_median)
    print(f"✓ Sentinel-2 NDVI + Albedo computed ({s2.size().getInfo()} scenes)")
    return result


# ─────────────────────────────────────────────
# IMPERVIOUS SURFACE (BUILT-UP AREA)
# ─────────────────────────────────────────────
def compute_impervious_surface(bbox):
    """
    Use ESA WorldCover 2021 to estimate impervious/built-up surface %.
    Class 50 = Built-up area in WorldCover.
    """
    region = ee.Geometry.Rectangle(bbox)

    worldcover = ee.ImageCollection("ESA/WorldCover/v200").first()
    builtup    = worldcover.select("Map").eq(50)  # built-up class

    # This gives us a binary mask — we'll aggregate per cell later
    print("✓ ESA WorldCover impervious surface layer loaded")
    return builtup.rename("builtup").clip(region)


# ─────────────────────────────────────────────
# SAMPLE ALL BANDS INTO GRID
# ─────────────────────────────────────────────
BATCH_SIZE = 500


def sample_features_at_grid(grid_gdf, lst_img, s2_img, builtup_img):
    """
    For each grid cell centroid, sample values from GEE images.
    Processes in batches to avoid GEE payload size limits.
    Returns DataFrame with all features.
    """
    combined = (lst_img
                .addBands(s2_img)
                .addBands(builtup_img))

    all_rows = []
    n = len(grid_gdf)
    for start in range(0, n, BATCH_SIZE):
        end = min(start + BATCH_SIZE, n)
        batch = grid_gdf.iloc[start:end]
        print(f"  Sampling cells {start + 1}–{end} of {n}...")

        features = []
        for _, row in batch.iterrows():
            pt = ee.Geometry.Point([row["centroid_lon"], row["centroid_lat"]])
            features.append(ee.Feature(pt, {"cell_id": row["cell_id"]}))

        fc = ee.FeatureCollection(features)
        sampled = combined.sampleRegions(collection=fc, scale=100, geometries=True)

        sampled_list = sampled.getInfo()["features"]
        for feat in sampled_list:
            props = feat["properties"]
            coords = feat["geometry"]["coordinates"]
            all_rows.append({
                "cell_id":     props.get("cell_id"),
                "lon":         coords[0],
                "lat":         coords[1],
                "LST_celsius": props.get("LST_celsius"),
                "NDVI":        props.get("NDVI"),
                "albedo":      props.get("albedo"),
                "builtup":     props.get("builtup"),
            })

    df = pd.DataFrame(all_rows).dropna(subset=["LST_celsius"])
    print(f"✓ Sampled {len(df)} valid grid cells from GEE")
    return df


# ─────────────────────────────────────────────
# SYNTHETIC FEATURES (when OSM/Census not available)
# ─────────────────────────────────────────────
def add_derived_features(df):
    """
    Add features derived from existing columns + synthetic proxies.
    In production: replace synthetic features with real OSM/census data.
    """
    np.random.seed(42)
    n = len(df)

    # Road density — negatively correlated with NDVI (more roads = less green)
    df["road_density"]    = np.clip(0.8 - df["NDVI"] * 2 +
                                    np.random.normal(0, 0.1, n), 0, 1)

    # Population density — correlated with built-up area
    df["pop_density"]     = (df["builtup"] * 15000 +
                             np.random.normal(0, 1000, n)).clip(0)

    # Distance to water — affects cooling (synthetic)
    df["dist_to_water"]   = np.random.exponential(scale=1500, size=n)

    # Wind obstruction — higher in dense built-up areas
    df["wind_obstruction"]= np.clip(df["builtup"] * 0.7 +
                                    np.random.normal(0, 0.1, n), 0, 1)

    # Building height index (synthetic, correlated with built-up)
    df["bldg_height_idx"] = np.clip(df["builtup"] * 0.6 +
                                    np.random.normal(0, 0.1, n), 0, 1)

    # Humidity (seasonal, slight spatial variation)
    df["humidity"]        = np.clip(65 + np.random.normal(0, 8, n), 30, 95)

    # Impervious surface fraction (derived from NDVI + albedo)
    df["impervious_pct"]  = np.clip(1 - df["NDVI"] - df["albedo"] * 0.3 +
                                    np.random.normal(0, 0.05, n), 0, 1)

    # Heat load index (composite)
    df["heat_load_idx"]   = (df["road_density"] * 0.4 +
                             df["impervious_pct"] * 0.4 +
                             df["wind_obstruction"] * 0.2)

    print(f"✓ Added {8} derived features to dataset")
    return df


# ─────────────────────────────────────────────
# NEIGHBORHOOD ASSIGNMENT
# ─────────────────────────────────────────────
def assign_neighborhoods(df):
    """
    Assign zone names based on position in the bounding box.
    Replace with real shapefiles in production.
    """
    lon_mid = (BBOX[0] + BBOX[2]) / 2
    lat_mid = (BBOX[1] + BBOX[3]) / 2

    def get_zone(row):
        lon, lat = row["lon"], row["lat"]
        if lon < lon_mid - 0.03 and lat > lat_mid:          return "Andheri"
        elif lon > lon_mid + 0.03 and lat > lat_mid:        return "Powai"
        elif lon > lon_mid + 0.03 and lat < lat_mid:        return "Chembur"
        elif lon < lon_mid - 0.03 and lat < lat_mid:        return "Worli"
        elif lat > lat_mid + 0.04:                           return "Bandra"
        elif lat < lat_mid - 0.04:                           return "Colaba"
        else:                                                return "Fort"

    df["neighborhood"] = df.apply(get_zone, axis=1)
    print(f"✓ Neighborhoods: {df['neighborhood'].value_counts().to_dict()}")
    return df


# ─────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────
def run_pipeline():
    print("\n" + "="*50)
    print("  THERMACITY — Data Pipeline")
    print("="*50 + "\n")

    # 1. Initialize GEE
    init_gee()

    # 2. Create city grid
    grid_gdf = create_city_grid(BBOX, GRID_SIZE)

    # 3. Fetch satellite layers
    lst_img     = compute_lst_from_landsat(BBOX, START_DATE, END_DATE)
    s2_img      = compute_ndvi_albedo(BBOX, START_DATE, END_DATE)
    builtup_img = compute_impervious_surface(BBOX)

    # 4. Sample all features at grid centroids
    df = sample_features_at_grid(grid_gdf, lst_img, s2_img, builtup_img)

    # 5. Add derived & synthetic features
    df = add_derived_features(df)

    # 6. Assign neighborhoods
    df = assign_neighborhoods(df)

    # 7. Save
    out_path = os.path.join(OUTPUT_DIR, "features_raw.csv")
    df.to_csv(out_path, index=False)
    print(f"\n✓ Saved {len(df)} samples → {out_path}")
    print(f"  Columns: {list(df.columns)}")
    print(f"  LST range: {df['LST_celsius'].min():.1f}°C – "
          f"{df['LST_celsius'].max():.1f}°C")
    return df


if __name__ == "__main__":
    df = run_pipeline()
    print("\n✓ Step 1 complete. Run step2_train_model.py next.")
