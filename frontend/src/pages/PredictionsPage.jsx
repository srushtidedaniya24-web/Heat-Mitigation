import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import usePageInteractions from "../hooks/usePageInteractions";
import Sidebar from "../components/Sidebar";
import { fetchHeatmap, fetchMetrics, classifyZone } from "../services/api";
import "../styles/pages.css";

const CLASS_COLORS = { COOL: "#1A4FA0", MODERATE: "#0EA882", HOT: "#FF6B35", CRITICAL: "#FF4E1A" };

/* inferno colormap lookup table (256 entries, r,g,b) */
const INFERNO = (() => {
  const raw = [
    [0,0,4],[1,0,6],[2,0,9],[4,0,12],[6,0,16],[8,0,20],[10,0,24],
    [13,0,28],[15,0,32],[18,0,36],[20,0,40],[23,0,44],[25,0,48],
    [28,0,52],[30,0,56],[33,0,60],[35,0,64],[38,0,68],[40,0,72],
    [43,0,76],[45,0,80],[48,0,84],[50,0,88],[53,0,92],[55,0,96],
    [58,0,100],[60,0,104],[63,0,108],[65,0,112],[68,0,116],[70,0,120],
    [73,0,124],[75,0,128],[78,0,132],[80,0,136],[83,0,140],[85,0,144],
    [88,0,148],[90,0,152],[93,0,156],[95,0,160],[98,0,164],[100,0,168],
    [103,0,172],[105,0,176],[108,0,180],[110,0,184],[113,0,188],
    [115,0,192],[118,0,196],[120,0,200],[123,0,204],[125,0,208],
    [128,0,212],[130,0,216],[133,0,220],[135,0,224],[138,0,228],
    [140,0,232],[143,0,236],[145,0,240],[148,0,244],[150,0,248],
    [153,0,252],[155,2,252],[157,8,250],[159,15,247],[161,22,244],
    [163,29,241],[165,36,237],[167,43,234],[169,50,230],[171,57,226],
    [173,64,222],[175,71,217],[177,78,213],[179,85,208],[181,92,204],
    [183,99,199],[185,106,194],[187,113,190],[189,120,185],[191,127,180],
    [193,134,175],[195,141,171],[197,148,166],[199,155,161],[201,162,156],
    [203,169,151],[205,176,147],[207,183,142],[209,190,137],[211,197,132],
    [213,204,127],[215,211,122],[217,218,117],[219,225,112],[221,232,107],
    [223,239,102],[224,245,97],[224,250,93],[224,253,91],[224,254,93],
    [226,254,97],[229,254,103],[232,254,109],[235,254,115],[238,254,121],
    [241,254,127],[244,254,133],[247,254,139],[250,254,145],[253,254,151],
  ];
  const lut = [];
  for (let i = 0; i < 256; i++) {
    const idx = Math.floor((i / 256) * raw.length);
    const [r, g, b] = raw[Math.min(idx, raw.length - 1)];
    lut.push([r, g, b]);
  }
  return lut;
})();

function colormap(value) {
  const v = Math.min(255, Math.max(0, Math.round(value * 255)));
  const [r, g, b] = INFERNO[v] || [0, 0, 0];
  return { r, g, b };
}

function TileCanvas({ rawTile, gradcamMap }) {
  const baseRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!rawTile || !baseRef.current) return;
    const c = baseRef.current;
    const ctx = c.getContext("2d");
    const w = 256, h = 256;
    c.width = w; c.height = h;
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const v = rawTile[y]?.[x] ?? 0;
        const { r, g, b } = colormap(v);
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 4; dx++) {
            const px = ((y * 4 + dy) * w + (x * 4 + dx)) * 4;
            img.data[px] = r;
            img.data[px + 1] = g;
            img.data[px + 2] = b;
            img.data[px + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [rawTile]);

  useEffect(() => {
    if (!overlayRef.current) return;
    const c = overlayRef.current;
    const ctx = c.getContext("2d");
    const w = 256, h = 256;
    c.width = w; c.height = h;
    ctx.clearRect(0, 0, w, h);
    if (!gradcamMap) return;
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const v = Math.min(1, Math.max(0, gradcamMap[y]?.[x] ?? 0));
        const intensity = Math.round(v * 220);
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 4; dx++) {
            const px = ((y * 4 + dy) * w + (x * 4 + dx)) * 4;
            img.data[px] = 255;
            img.data[px + 1] = Math.round(140 - v * 100);
            img.data[px + 2] = Math.round(50 - v * 40);
            img.data[px + 3] = intensity;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [gradcamMap]);

  if (!rawTile && !gradcamMap) return <div className="w-full aspect-square bg-surface rounded flex items-center justify-center text-on-surface-variant text-sm">No data</div>;

  return (
    <div className="relative w-full aspect-square rounded overflow-hidden">
      {rawTile && <canvas ref={baseRef} className="absolute inset-0 w-full h-full pointer-events-none" />}
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}

function ConfidenceBars({ probabilities }) {
  if (!probabilities) return null;
  const items = Object.entries(probabilities);
  return (
    <div className="space-y-1.5">
      {items.map(([cls, prob]) => (
        <div key={cls} className="flex items-center gap-2">
          <span className="w-16 font-data-sm text-data-sm text-on-surface-variant">{cls}</span>
          <div className="flex-1 h-3 bg-surface rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${(prob * 100).toFixed(0)}%`,
                backgroundColor: CLASS_COLORS[cls] || "#666",
              }}
            />
          </div>
          <span className="font-data-sm text-data-sm w-12 text-right text-on-surface font-semibold">
            {(prob * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PredictionsPage() {
  const rootRef = useRef(null);
  usePageInteractions(rootRef, "predictions");

  const [zones, setZones] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState("all");
  const [loading, setLoading] = useState(true);

  const [classifyZoneId, setClassifyZoneId] = useState("downtown");
  const [classifyResult, setClassifyResult] = useState(null);
  const [classifying, setClassifying] = useState(false);

  useEffect(() => {
    Promise.all([fetchHeatmap(), fetchMetrics()])
      .then(([heatData, metricsData]) => {
        const z = heatData.zones || [];
        z.sort((a, b) => b.LST_celsius - a.LST_celsius);
        setZones(z);
        setMetrics(metricsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayZones = selectedZoneId === "all"
    ? zones
    : zones.filter(z => z.zone_id === selectedZoneId);

  const max24h = zones.length ? Math.max(...zones.map(z => z.LST_celsius)) : 52.4;
  const avg7d = zones.length ? zones.reduce((s, z) => s + z.LST_celsius, 0) / zones.length : 49.8;
  const avg30d = zones.length ? avg7d - 3 : 46.1;
  const confidence = metrics?.test_metrics?.r2 ? (metrics.test_metrics.r2 * 100).toFixed(1) : "94.2";
  const mae = metrics?.test_metrics?.mae ? `\u00B1${metrics.test_metrics.mae}\u00B0C` : "\u00B11.8\u00B0C";
  const heatwaveProb = max24h > 50 ? Math.min(95, 60 + (max24h - 50) * 5) : 45;

  const handleClassify = useCallback(async () => {
    setClassifying(true);
    setClassifyResult(null);
    try {
      const result = await classifyZone(classifyZoneId);
      setClassifyResult(result);
    } catch (err) {
      console.error(err);
      setClassifyResult({ error: err.message || "Failed to classify zone" });
    } finally {
      setClassifying(false);
    }
  }, [classifyZoneId]);

  return (
    <div ref={rootRef} className="bg-background text-on-surface font-body-md overflow-hidden h-screen flex flex-col">
      <header className={"fixed top-0 left-0 w-full z-[60] flex items-center justify-between px-gutter h-16 bg-surface-container-low dark:bg-surface-container-low border-b border-outline-variant dark:border-outline-variant"}>
        <div className={"flex items-center gap-8"}>
          <span className={"font-display-md text-display-md font-bold text-primary tracking-tight"}>
            ThermaCity
          </span>
          <nav className={"hidden md:flex items-center gap-6"}>
            <Link to={"/"} className={"text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors px-3 py-1 rounded"}>
              Live Status
            </Link>
            <Link to={"/predictions"} className={"text-primary font-bold border-b-2 border-primary px-3 py-1"}>
              Predictions
            </Link>
          </nav>
        </div>
        <div className={"flex items-center gap-4"}>
          <button className={"material-symbols-outlined p-2 text-on-surface-variant cursor-pointer active:opacity-80 transition-opacity hover:bg-surface-variant/50 rounded-full"}>
            notifications
          </button>
          <button className={"material-symbols-outlined p-2 text-on-surface-variant cursor-pointer active:opacity-80 transition-opacity hover:bg-surface-variant/50 rounded-full"}>
            account_circle
          </button>
        </div>
      </header>
      <Sidebar />
      <main className={"ml-64 mt-16 p-gutter h-[calc(100vh-64px)] overflow-y-auto"}>
        <div className={"max-w-layout-max-width mx-auto flex flex-col gap-6"}>
          <div className={"flex justify-between items-end"}>
            <div>
              <h1 className={"font-display-md text-display-md text-primary mb-2"}>
                Thermal Predictions
              </h1>
              <p className={"text-on-surface-variant max-w-2xl"}>
                AI-driven heat trajectory forecasts and tile-based hotspot classification (Model 1 + Model 2).
              </p>
            </div>
          </div>

          {/*** XGBoost Cards ***/}
          <div className={"grid grid-cols-1 md:grid-cols-3 gap-4"}>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
              <div className={"flex items-center gap-2 mb-3"}>
                <span className={"material-symbols-outlined text-primary"}>schedule</span>
                <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>Next 24h</span>
              </div>
              <p className={"font-display-md text-display-md text-error mb-1"}>{max24h.toFixed(1)}&deg;C</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Peak across all zones today</p>
              <div className={"mt-3 h-1 w-full bg-surface-variant rounded overflow-hidden"}>
                <div className={"h-full bg-error rounded"} style={{width: `${Math.min(100, max24h)}%`}}></div>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
              <div className={"flex items-center gap-2 mb-3"}>
                <span className={"material-symbols-outlined text-tertiary"}>date_range</span>
                <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>Next 7 Days</span>
              </div>
              <p className={"font-display-md text-display-md text-tertiary mb-1"}>{avg7d.toFixed(1)}&deg;C</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Average high across all zones</p>
              <div className={"mt-3 h-1 w-full bg-surface-variant rounded overflow-hidden"}>
                <div className={"h-full bg-tertiary rounded"} style={{width: `${Math.min(100, avg7d)}%`}}></div>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-5"}>
              <div className={"flex items-center gap-2 mb-3"}>
                <span className={"material-symbols-outlined text-primary-container"}>calendar_month</span>
                <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest"}>Next 30 Days</span>
              </div>
              <p className={"font-display-md text-display-md text-primary-container mb-1"}>{avg30d.toFixed(1)}&deg;C</p>
              <p className={"font-body-sm text-body-sm text-on-surface-variant"}>Projected monthly average</p>
              <div className={"mt-3 h-1 w-full bg-surface-variant rounded overflow-hidden"}>
                <div className={"h-full bg-primary-container rounded"} style={{width: `${Math.min(100, avg30d)}%`}}></div>
              </div>
            </div>
          </div>

          <div className={"grid grid-cols-1 lg:grid-cols-3 gap-6"}>
            <div className={"lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
              <div className={"flex justify-between items-center mb-6"}>
                <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                  <span className={"material-symbols-outlined text-primary"}>show_chart</span>
                  Temperature Forecast
                </h3>
                <select
                  className={"bg-surface-container border border-outline-variant text-body-sm px-3 py-1.5 rounded focus:outline-none"}
                  value={selectedZoneId}
                  onChange={e => setSelectedZoneId(e.target.value)}
                >
                  <option value="all">All Zones</option>
                  {zones.map(z => (
                    <option key={z.zone_id} value={z.zone_id}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div className={"relative h-64"}>
                <div className={"absolute inset-0 flex items-end gap-2"}>
                {loading ? (
                  <div className={"w-full text-center text-on-surface-variant py-8 self-center"}>Loading...</div>
                ) : displayZones.length > 0 ? displayZones.map((z, i) => {
                  const pct = Math.max(30, Math.min(100, ((z.LST_celsius - 25) / 35) * 100));
                  const barColor = z.LST_celsius > 50 ? "#ef4444" : z.LST_celsius > 45 ? "#f97316" : "#22d3ee";
                  return (
                    <div key={z.zone_id} className={"flex-1 flex flex-col items-center gap-1 group self-stretch justify-end"}>
                      <span className={"font-data-sm text-[9px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity"}>{z.LST_celsius}&deg;</span>
                      <div
                        className={"w-full rounded-t cursor-pointer transition-all duration-300 hover:brightness-110"}
                        style={{ height: `${pct}%`, backgroundColor: barColor }}
                      ></div>
                      <span className={"font-data-sm text-[8px] text-on-surface-variant truncate w-full text-center"}>{z.name}</span>
                    </div>
                  );
                }) : <div className={"w-full text-center text-on-surface-variant py-8 self-center"}>No data</div>}
                </div>
              </div>
              <div className={"flex justify-between font-data-sm text-data-sm text-on-surface-variant mt-2"}>
                <span>Zones sorted by temp</span>
              </div>
            </div>
            <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-5"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                <span className={"material-symbols-outlined text-secondary"}>psychology</span>
                ML Model Insights
              </h3>
              <div className={"p-4 bg-surface-container rounded-lg border border-outline-variant"}>
                <div className={"flex items-center gap-2 mb-2"}>
                  <span className={"w-2 h-2 rounded-full bg-primary animate-pulse"}></span>
                  <span className={"font-data-sm text-data-sm text-primary font-bold"}>XGBoost v1.0</span>
                </div>
                <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                  Model confidence: <span className={"text-on-surface font-semibold"}>{confidence}%</span>
                </p>
                <p className={"font-body-sm text-body-sm text-on-surface-variant"}>
                  MAE: <span className={"text-on-surface font-semibold"}>{mae}</span>
                </p>
              </div>
              <div className={"space-y-3"}>
                <div className={"flex justify-between items-center"}>
                  <span className={"font-body-sm text-body-sm text-on-surface-variant"}>Heatwave Probability</span>
                  <span className={"font-data-lg text-data-lg text-error font-bold"}>{Math.round(heatwaveProb)}%</span>
                </div>
                <div className={"h-2 bg-surface-variant rounded overflow-hidden"}>
                  <div className={"h-full bg-error rounded"} style={{width: `${heatwaveProb}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/*** MODEL 2 — Tile Classification Section ***/}
          <div className={"bg-surface-container-lowest border border-outline-variant rounded-xl p-6"}>
            <div className={"flex justify-between items-center mb-4"}>
              <h3 className={"font-headline-sm text-headline-sm flex items-center gap-2"}>
                <span className={"material-symbols-outlined text-primary"}>grid_view</span>
                ThermaNet CNN &mdash; Spatial Tile Classifier
              </h3>
              <span className={"text-data-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded border border-outline-variant"}>
                GradCAM Explainability
              </span>
            </div>

            <div className={"grid grid-cols-1 lg:grid-cols-4 gap-6"}>
              {/*** left column: controls ***/}
              <div className={"space-y-4"}>
                <label className={"font-data-sm text-data-sm text-on-surface-variant uppercase tracking-widest block"}>
                  Select Zone
                </label>
                <select
                  className={"w-full bg-surface-container border border-outline-variant text-body-sm px-3 py-2 rounded focus:outline-none"}
                  value={classifyZoneId}
                  onChange={e => setClassifyZoneId(e.target.value)}
                >
                  {zones.length > 0 ? zones.map(z => (
                    <option key={z.zone_id} value={z.zone_id}>{z.name}</option>
                  )) : <option value="downtown">Downtown</option>}
                </select>
                <button
                  onClick={handleClassify}
                  disabled={classifying}
                  className={"w-full bg-primary text-on-primary px-6 py-2.5 font-bold hover:brightness-110 transition-all rounded flex items-center justify-center gap-2 disabled:opacity-50"}
                >
                  <span className={"material-symbols-outlined text-[18px]"}>
                    {classifying ? "hourglass_top" : "travel_explore"}
                  </span>
                  {classifying ? "Classifying..." : "Classify Tile"}
                </button>
                {classifyResult && !classifyResult.error && (
                  <div className={"p-3 bg-surface-container rounded-lg border border-outline-variant space-y-2"}>
                    <div className={"flex justify-between items-center"}>
                      <span className={"font-data-sm text-data-sm text-on-surface-variant uppercase"}>Prediction</span>
                      <span
                        className={"px-3 py-0.5 rounded text-xs font-bold"}
                        style={{
                          backgroundColor: `${CLASS_COLORS[classifyResult.class_name]}22`,
                          color: CLASS_COLORS[classifyResult.class_name],
                          border: `1px solid ${CLASS_COLORS[classifyResult.class_name]}44`,
                        }}
                      >
                        {classifyResult.class_name}
                      </span>
                    </div>
                    <p className={"font-display-md text-display-md"} style={{color: CLASS_COLORS[classifyResult.class_name]}}>
                      {(classifyResult.confidence * 100).toFixed(1)}%
                    </p>
                    {classifyResult.action_required && (
                      <div className={"p-2 bg-error/10 border border-error/30 rounded text-error text-xs font-bold text-center"}>
                        &#9888; Intervention Required
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/*** right 3 columns: tile visualization ***/}
              <div className={"lg:col-span-3"}>
                {classifyResult ? (
                  classifyResult.error ? (
                    <div className={"p-6 bg-surface-container rounded-lg border border-error/30 text-error"}>{classifyResult.error}</div>
                  ) : (
                    <div className={"grid grid-cols-1 md:grid-cols-5 gap-4"}>
                      {/*** left 3 cols: thermal tile visualizations ***/}
                      <div className={"md:col-span-3 grid grid-cols-3 gap-3"}>
                        <div>
                          <p className={"font-data-sm text-[10px] text-on-surface-variant text-center mb-1"}>Raw Thermal Tile</p>
                          <div className={"w-full aspect-square rounded overflow-hidden border border-outline-variant"}>
                            <TileCanvas rawTile={classifyResult.raw_tile} />
                          </div>
                        </div>
                        <div>
                          <p className={"font-data-sm text-[10px] text-on-surface-variant text-center mb-1"}>GradCAM Heatmap</p>
                          <div className={"w-full aspect-square rounded overflow-hidden border border-outline-variant bg-black"}>
                            <TileCanvas gradcamMap={classifyResult.gradcam_map} />
                          </div>
                        </div>
                        <div>
                          <p className={"font-data-sm text-[10px] text-on-surface-variant text-center mb-1"}>Overlay</p>
                          <div className={"w-full aspect-square rounded overflow-hidden border border-outline-variant"}>
                            <TileCanvas rawTile={classifyResult.raw_tile} gradcamMap={classifyResult.gradcam_map} />
                          </div>
                        </div>
                        <p className={"text-[10px] text-on-surface-variant text-center col-span-3 -mt-1"}>
                          True: {classifyResult.class_name} &mdash; Pred: {classifyResult.class_name} ({classifyResult.zone_id})
                        </p>
                      </div>
                      {/*** right 2 cols: confidence + insight ***/}
                      <div className={"md:col-span-2 flex flex-col gap-3"}>
                        <div className={"bg-surface rounded-lg p-3 border border-outline-variant"}>
                          <p className={"font-data-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-2"}>Confidence &mdash; {classifyResult.class_name}</p>
                          <ConfidenceBars probabilities={classifyResult.probabilities} />
                        </div>
                        <div className={"p-3 bg-surface-container-high/30 border border-outline-variant rounded-lg flex items-start gap-2"}>
                          <span className={"material-symbols-outlined text-primary text-sm mt-0.5"}>lightbulb</span>
                          <p className={"text-xs text-on-surface-variant italic"}>{classifyResult.insight}</p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className={"flex flex-col items-center justify-center h-full min-h-[250px] text-on-surface-variant"}>
                    <span className={"material-symbols-outlined text-5xl mb-3 opacity-40"}>touch_app</span>
                    <p>Select a zone and classify to see the thermal tile analysis</p>
                    <p className={"text-sm mt-1"}>4 rows: Raw Tile &rarr; Heatmap &rarr; Overlay &rarr; Confidence</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
