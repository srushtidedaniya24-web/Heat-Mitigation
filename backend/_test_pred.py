import json, urllib.request

BASE = "http://localhost:8000"

# Test /heatmap for each city
print("=== /heatmap ===")
for city in ["mumbai", "thane", "navi%20mumbai", "all"]:
    url = f"{BASE}/heatmap?city={city}"
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read())
            print(f"  {city}: {len(data)} zones, first={data[0]['name'] if isinstance(data, list) and len(data)>0 else '?'}")
    except Exception as e:
        print(f"  {city}: ERROR - {e}")

# Test /metrics
print("\n=== /metrics ===")
try:
    with urllib.request.urlopen(f"{BASE}/metrics", timeout=15) as resp:
        data = json.loads(resp.read())
        print(f"  OK: {data}")
except Exception as e:
    print(f"  ERROR - {e}")

# Test /classify/zone for a zone in each city
print("\n=== /classify/zone ===")
test_zones = ["colaba", "thane_station", "airoli"]
for zid in test_zones:
    url = f"{BASE}/classify/zone/{zid}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read())
            print(f"  {zid}: class={data.get('class_name','?')} conf={data.get('confidence',0):.2%}")
    except Exception as e:
        print(f"  {zid}: ERROR - {e}")
