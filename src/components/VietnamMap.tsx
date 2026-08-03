"use client";

import { useEffect, useRef, useState } from "react";
import type { MapLayerKey, ReceivingGeoLayerData, ReceivingGeoRow } from "@/lib/types";
// Chỉ dùng cho type — bản thân module "leaflet" được import động trong useEffect (xem bên dưới),
// KHÔNG import tĩnh ở đây, vì leaflet đụng vào window/navigator ngay khi load module, sẽ vỡ lúc
// Next.js render component này ở phía server (dù đã "use client", vẫn được server-render lần đầu).
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";
import { RotateCcw } from "lucide-react";

interface MapFeature {
  type: "Feature";
  properties: { code?: string; name: string; ward_count?: number };
  geometry: GeoJSON.Geometry;
}
interface MapCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

const GEOJSON_URL: Record<MapLayerKey, string> = {
  ward: "/geo/hcm-wards.geojson",
  district: "/geo/hcm-districts.geojson",
  khu: "/geo/hcm-khu.geojson",
};

function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^(phường|phuong|xã|xa)\.?\s*/i, "")
    .toLowerCase()
    .trim();
}

/** Bỏ tiền tố "Phường"/"Xã" để nhãn trên bản đồ ngắn gọn hơn — tên đầy đủ vẫn hiện khi hover. */
function shortLabel(name: string): string {
  return name.replace(/^(Phường|Xã)\s+/i, "");
}

type MapMode = "pickup" | "delivery" | "total";

export default function VietnamMap({
  data,
  layerLabels,
  modeLabels,
  loadingLabel,
  emptyLabel,
  unitLabel,
}: {
  data: Record<MapLayerKey, ReceivingGeoLayerData>;
  layerLabels: { ward: string; district: string; khu: string };
  modeLabels: { pickup: string; delivery: string; total: string };
  loadingLabel: string;
  emptyLabel: string;
  unitLabel: string;
}) {
  const [layer, setLayer] = useState<MapLayerKey>("ward");
  const [mode, setMode] = useState<MapMode>("total");
  const [ready, setReady] = useState(false);

  const mapElRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const shapesLayerRef = useRef<LeafletNS.GeoJSON | null>(null);
  const labelsLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const geojsonCacheRef = useRef<Partial<Record<MapLayerKey, MapCollection>>>({});
  const labelEntriesRef = useRef<{ marker: LeafletNS.Marker; bounds: LeafletNS.LatLngBounds; name: string }[]>([]);
  // props mới nhất luôn đọc được từ trong closure của các callback Leaflet (mouseover/zoomend...)
  // mà không cần rebuild layer mỗi lần data đổi tham chiếu.
  const stateRef = useRef({ data, mode, unitLabel, emptyLabel });
  stateRef.current = { data, mode, unitLabel, emptyLabel };

  function colorFor(v: number, maxVal: number) {
    if (v <= 0) return "var(--grid)";
    const t = Math.sqrt(v / maxVal);
    const lightness = 90 - t * 60;
    return `hsl(211, 75%, ${lightness}%)`;
  }

  function rowsFor(layerKey: MapLayerKey, m: MapMode): ReceivingGeoRow[] {
    const layerData = stateRef.current.data[layerKey];
    return m === "pickup" ? layerData.pickup : m === "delivery" ? layerData.delivery : layerData.total;
  }

  function updateLabelVisibility() {
    const map = mapRef.current;
    if (!map) return;
    for (const { marker, bounds, name } of labelEntriesRef.current) {
      const el = marker.getElement();
      if (!el) continue;
      const nw = map.latLngToContainerPoint(bounds.getNorthWest());
      const se = map.latLngToContainerPoint(bounds.getSouthEast());
      const w = Math.abs(se.x - nw.x);
      const h = Math.abs(se.y - nw.y);
      const neededW = Math.min(name.length * 6.4 + 8, 160);
      el.style.display = w >= neededW && h >= 22 ? "" : "none";
    }
  }

  function rebuildShapes() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const geojson = geojsonCacheRef.current[layer];
    if (!L || !map || !geojson) return;

    if (shapesLayerRef.current) map.removeLayer(shapesLayerRef.current);
    if (labelsLayerRef.current) map.removeLayer(labelsLayerRef.current);
    labelEntriesRef.current = [];

    const rows = rowsFor(layer, mode);
    const valueMap = new Map<string, number>();
    for (const r of rows) {
      const key = normalizeName(r.phuong_xa);
      valueMap.set(key, (valueMap.get(key) ?? 0) + r.thanh_cong);
    }
    const maxVal = Math.max(1, ...rows.map((r) => r.thanh_cong));

    const shapesLayer = L.geoJSON(geojson as unknown as GeoJSON.GeoJSON, {
      style: (feature) => {
        const name = feature?.properties?.name ?? "";
        const val = valueMap.get(normalizeName(name)) ?? 0;
        return {
          fillColor: colorFor(val, maxVal),
          fillOpacity: 0.85,
          color: "var(--surface)",
          weight: 1.2,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const name = feature.properties.name as string;
        const val = valueMap.get(normalizeName(name)) ?? 0;
        featureLayer.bindTooltip(
          `<div style="font-weight:600;margin-bottom:2px">${name}</div><div>${
            val > 0 ? `${val.toLocaleString("vi-VN")} ${stateRef.current.unitLabel}` : stateRef.current.emptyLabel
          }</div>`,
          { sticky: true, direction: "top", className: "vn-map-tooltip" }
        );
        featureLayer.on("mouseover", () => (featureLayer as LeafletNS.Path).setStyle({ weight: 2.4, color: "#3a3a3a" }));
        featureLayer.on("mouseout", () => (featureLayer as LeafletNS.Path).setStyle({ weight: 1.2, color: "var(--surface)" }));
      },
    }).addTo(map);
    shapesLayerRef.current = shapesLayer;

    const labelsGroup = L.layerGroup();
    for (const feature of geojson.features) {
      const name = feature.properties.name;
      const bounds = L.geoJSON(feature as unknown as GeoJSON.GeoJSON).getBounds();
      const center = bounds.getCenter();
      const icon = L.divIcon({
        className: "vn-map-label",
        html: `<div>${shortLabel(name)}</div>`,
        iconSize: [0, 0],
      });
      const marker = L.marker(center, { icon, interactive: false });
      labelsGroup.addLayer(marker);
      labelEntriesRef.current.push({ marker, bounds, name });
    }
    labelsGroup.addTo(map);
    labelsLayerRef.current = labelsGroup;

    requestAnimationFrame(updateLabelVisibility);
  }

  function resetView() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const geojson = geojsonCacheRef.current[layer];
    if (!L || !map || !geojson) return;
    const bounds = L.geoJSON(geojson as unknown as GeoJSON.GeoJSON).getBounds();
    map.fitBounds(bounds, { padding: [12, 12] });
  }

  async function ensureGeojson(targetLayer: MapLayerKey) {
    if (geojsonCacheRef.current[targetLayer]) return;
    const res = await fetch(GEOJSON_URL[targetLayer]);
    geojsonCacheRef.current[targetLayer] = await res.json();
  }

  // Khởi tạo map 1 LẦN — import leaflet động (chỉ chạy ở client, không đụng SSR).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapElRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(mapElRef.current, {
        zoomControl: true,
        attributionControl: false,
        minZoom: 8,
        maxZoom: 15,
        // Không dùng nền bản đồ thế giới thật (OSM...) — chỉ hiện đúng vùng phủ HCM tự vẽ.
        crs: L.CRS.EPSG3857,
      });
      mapRef.current = map;
      map.on("zoomend moveend", updateLabelVisibility);

      await ensureGeojson(layer);
      if (cancelled) return;
      rebuildShapes();
      const bounds = L.geoJSON(geojsonCacheRef.current[layer] as unknown as GeoJSON.GeoJSON).getBounds();
      map.fitBounds(bounds, { padding: [12, 12] });
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đổi lớp (Phường/Quận/Khu): tải geojson tương ứng (nếu chưa có), fit lại khung nhìn.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      await ensureGeojson(layer);
      if (cancelled) return;
      const L = leafletRef.current;
      const map = mapRef.current;
      if (!L || !map) return;
      rebuildShapes();
      const bounds = L.geoJSON(geojsonCacheRef.current[layer] as unknown as GeoJSON.GeoJSON).getBounds();
      map.fitBounds(bounds, { padding: [12, 12] });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, ready]);

  // Đổi chế độ (Nhận/Phát/Tổng) hoặc dữ liệu: chỉ tô lại màu/tooltip, không tải lại geojson.
  useEffect(() => {
    if (!ready) return;
    rebuildShapes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, data, ready]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex gap-1 p-1 rounded-full border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {(["ward", "district", "khu"] as MapLayerKey[]).map((lv) => (
            <button
              key={lv}
              onClick={() => setLayer(lv)}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-150"
              style={
                layer === lv
                  ? {
                      background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                      color: "#fff",
                      boxShadow: "var(--shadow-red)",
                    }
                  : { background: "transparent", color: "var(--text-secondary)" }
              }
            >
              {layerLabels[lv]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["pickup", "delivery", "total"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150"
              style={
                mode === m
                  ? {
                      background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                      borderColor: "var(--brand-red)",
                      color: "#fff",
                      boxShadow: "var(--shadow-red)",
                    }
                  : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }
              }
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {!ready && (
          <div
            className="absolute inset-0 flex items-center justify-center text-sm z-[500] pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          >
            {loadingLabel}
          </div>
        )}
        <div ref={mapElRef} style={{ height: 520, background: "var(--grid)", borderRadius: 12 }} />
        {ready && (
          <button
            onClick={resetView}
            title="Reset"
            className="absolute top-2 right-2 z-[500] w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-[var(--brand-red-tint)]"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
