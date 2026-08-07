"use client";

import { useEffect, useRef, useState } from "react";
// Chỉ dùng cho type — bản thân module "leaflet" được import động trong useEffect (xem bên dưới),
// KHÔNG import tĩnh ở đây, vì leaflet đụng vào window/navigator ngay khi load module, sẽ vỡ lúc
// Next.js render component này ở phía server (dù đã "use client", vẫn được server-render lần đầu).
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";
import { buildHubColorMap, colorForHub, NEUTRAL_COLOR } from "@/lib/hubColors";
import type { HubCoverageHubPoint, HubCoverageKhuRow, HubCoverageSellerPoint } from "@/lib/types";
import { RotateCcw } from "lucide-react";

interface KhuFeature {
  type: "Feature";
  properties: { name: string };
  geometry: GeoJSON.Geometry;
}
interface KhuCollection {
  type: "FeatureCollection";
  features: KhuFeature[];
}
interface WardFeature {
  type: "Feature";
  properties: { name: string };
  geometry: GeoJSON.Geometry;
}
interface WardCollection {
  type: "FeatureCollection";
  features: WardFeature[];
}

const KHU_GEOJSON_URL = "/geo/hcm-khu.geojson";
const WARDS_GEOJSON_URL = "/geo/hcm-wards.geojson";

function normalizeWardName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^(phường|phuong|xã|xa)\.?\s*/i, "")
    .toLowerCase()
    .trim();
}

/** Lệch nhẹ, ỔN ĐỊNH (theo hash tên seller, không đổi mỗi lần vẽ lại) quanh tâm phường — để nhiều
 * seller cùng phường không chồng khít lên nhau. Port từ vung-phu-map/app.js (jitterOffset). */
function jitterOffset(key: string, magnitudeDeg: number): [number, number] {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  const angle = ((h & 0xffff) / 0xffff) * Math.PI * 2;
  const rFrac = ((h >> 16) & 0xffff) / 0xffff;
  const radius = Math.sqrt(rFrac) * magnitudeDeg;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

export default function HubCoverageMap({
  hubs,
  khuCoverage,
  sellers,
  loadingLabel,
  resetLabel,
  unassignedLabel,
  legendHint,
  sellerUnitLabel,
  khuLabelPrefix,
}: {
  hubs: HubCoverageHubPoint[];
  khuCoverage: HubCoverageKhuRow[];
  sellers: HubCoverageSellerPoint[];
  loadingLabel: string;
  resetLabel: string;
  unassignedLabel: string;
  legendHint: string;
  sellerUnitLabel: string;
  khuLabelPrefix: string;
}) {
  const [ready, setReady] = useState(false);
  const [hoverHub, setHoverHub] = useState<string | null>(null);
  const [pinnedHub, setPinnedHub] = useState<string | null>(null);
  const activeHub = pinnedHub ?? hoverHub;

  const mapElRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const shapesLayerRef = useRef<LeafletNS.GeoJSON | null>(null);
  const markersLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const khuGeoRef = useRef<KhuCollection | null>(null);
  const wardCentroidsRef = useRef<Map<string, LeafletNS.LatLng>>(new Map());
  const movingRef = useRef(false);

  const hubColorMap = buildHubColorMap([...hubs].map((h) => h.hub).sort((a, b) => a.localeCompare(b, "vi")));
  const khuHubMap = new Map(khuCoverage.map((r) => [r.khu.trim(), r.hub]));

  // props/state mới nhất luôn đọc được từ trong closure của các callback Leaflet (mouseover/pan...)
  // mà không cần rebuild layer mỗi lần tham chiếu đổi.
  const stateRef = useRef({ hubs, sellers, khuHubMap, hubColorMap, activeHub, unassignedLabel, sellerUnitLabel });
  useEffect(() => {
    stateRef.current = { hubs, sellers, khuHubMap, hubColorMap, activeHub, unassignedLabel, sellerUnitLabel };
  });

  function khuHubFor(name: string): string | null {
    return stateRef.current.khuHubMap.get(name.trim()) ?? null;
  }

  function regionStyle(name: string): LeafletNS.PathOptions {
    const hub = khuHubFor(name);
    const active = stateRef.current.activeHub;
    if (active) {
      if (hub === active) {
        const c = colorForHub(active, stateRef.current.hubColorMap);
        return { fillColor: c, fillOpacity: 0.55, color: c, weight: 2 };
      }
      return { fillColor: "var(--grid)", fillOpacity: 0.15, color: "#d7dbe0", weight: 1 };
    }
    const c = colorForHub(hub, stateRef.current.hubColorMap);
    return { fillColor: c, fillOpacity: 0.5, color: "#8b95a3", weight: 1 };
  }

  // Tooltip "sticky" đóng/mở dựa vào mouseover/mouseout của từng path — khi bấm-kéo chuột pan bản
  // đồ đi ngang qua nhiều khu, mouseout không bắn ra đều nên tooltip kẹt lại vĩnh viễn trên bản đồ.
  // Đóng hết mỗi khi bản đồ bắt đầu/kết thúc di chuyển, đồng thời chặn mở tooltip mới trong lúc pan.
  function closeAllTooltips() {
    shapesLayerRef.current?.eachLayer((l) => {
      const path = l as LeafletNS.Path & { closeTooltip: () => void; feature?: KhuFeature };
      path.closeTooltip();
      path.setStyle(regionStyle(path.feature?.properties?.name ?? ""));
    });
    markersLayerRef.current?.eachLayer((l) => {
      (l as LeafletNS.Layer & { closeTooltip: () => void }).closeTooltip();
    });
  }

  function rebuildLayers() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const khuGeo = khuGeoRef.current;
    if (!L || !map || !khuGeo) return;

    if (shapesLayerRef.current) map.removeLayer(shapesLayerRef.current);
    if (markersLayerRef.current) map.removeLayer(markersLayerRef.current);

    const shapesLayer = L.geoJSON(khuGeo as unknown as GeoJSON.GeoJSON, {
      style: (feature) => regionStyle(feature?.properties?.name ?? ""),
      onEachFeature: (feature, featureLayer) => {
        const name = feature.properties.name as string;
        const hub = khuHubFor(name);
        featureLayer.bindTooltip(
          `<div style="font-weight:600">${khuLabelPrefix}${name}</div><div>${hub ?? stateRef.current.unassignedLabel}</div>`,
          { sticky: true, direction: "top", className: "vn-map-tooltip" }
        );
        featureLayer.on("mouseover", () => {
          if (movingRef.current) return;
          (featureLayer as LeafletNS.Path).setStyle({ weight: 2.4, color: "#3a3a3a" });
        });
        featureLayer.on("mouseout", () => (featureLayer as LeafletNS.Path).setStyle(regionStyle(name)));
      },
    }).addTo(map);
    shapesLayerRef.current = shapesLayer;

    const markersGroup = L.layerGroup();

    for (const hub of stateRef.current.hubs) {
      const color = colorForHub(hub.hub, stateRef.current.hubColorMap);
      const isActive = stateRef.current.activeHub === hub.hub;
      const marker = L.circleMarker([hub.lat, hub.lon], {
        radius: isActive ? 13 : 10,
        color: "#fff",
        weight: isActive ? 3 : 2,
        fillColor: color,
        fillOpacity: 1,
      }).bindTooltip(`<b>${hub.hub}</b>`, { direction: "top", className: "vn-map-tooltip" });
      markersGroup.addLayer(marker);
    }

    for (const seller of stateRef.current.sellers) {
      if (stateRef.current.activeHub && seller.hub !== stateRef.current.activeHub) continue;
      const base = wardCentroidsRef.current.get(normalizeWardName(seller.phuong_xa));
      if (!base) continue;
      const [dx, dy] = jitterOffset(seller.seller, 0.012);
      const color = colorForHub(seller.hub, stateRef.current.hubColorMap);
      const marker = L.circleMarker([base.lat + dy, base.lng + dx], {
        radius: 3.5,
        color: "#fff",
        weight: 1,
        fillColor: color,
        fillOpacity: 0.9,
      }).bindTooltip(
        `<div style="font-weight:600">${seller.seller}</div><div>${seller.phuong_xa}${
          seller.hub ? ` · ${seller.hub}` : ""
        }</div><div>${seller.tong_don.toLocaleString("vi-VN")} ${stateRef.current.sellerUnitLabel}</div>`,
        { direction: "top", className: "vn-map-tooltip" }
      );
      markersGroup.addLayer(marker);
    }

    markersGroup.addTo(map);
    markersLayerRef.current = markersGroup;
  }

  function resetView() {
    const L = leafletRef.current;
    const map = mapRef.current;
    const khuGeo = khuGeoRef.current;
    if (!L || !map || !khuGeo) return;
    const bounds = L.geoJSON(khuGeo as unknown as GeoJSON.GeoJSON).getBounds();
    map.fitBounds(bounds, { padding: [12, 12] });
  }

  // Khởi tạo map 1 LẦN — import leaflet động (chỉ chạy ở client, không đụng SSR), tải đồng thời
  // geojson Khu (tô vùng) + geojson Phường (chỉ để tính tâm định vị chấm Seller, không vẽ ra).
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
        boxZoom: false,
      });
      mapRef.current = map;

      // "move" bắn liên tục trong suốt lúc pan/zoom — đóng hết tooltip kẹt lại gần như ngay lập
      // tức, không đợi tới lúc thả chuột (moveend).
      map.on("movestart move moveend", () => {
        movingRef.current = true;
        closeAllTooltips();
      });
      map.on("moveend", () => {
        movingRef.current = false;
      });

      const [khuRes, wardsRes] = await Promise.all([fetch(KHU_GEOJSON_URL), fetch(WARDS_GEOJSON_URL)]);
      const [khuGeo, wardsGeo]: [KhuCollection, WardCollection] = await Promise.all([khuRes.json(), wardsRes.json()]);
      if (cancelled) return;
      khuGeoRef.current = khuGeo;
      for (const feature of wardsGeo.features) {
        const center = L.geoJSON(feature as unknown as GeoJSON.GeoJSON).getBounds().getCenter();
        wardCentroidsRef.current.set(normalizeWardName(feature.properties.name), center);
      }

      rebuildLayers();
      const bounds = L.geoJSON(khuGeo as unknown as GeoJSON.GeoJSON).getBounds();
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

  // Đổi dữ liệu hoặc HUB đang xem riêng (hover/pin legend): chỉ tô lại màu/chấm, không tải lại geojson.
  useEffect(() => {
    if (!ready) return;
    rebuildLayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hubs, khuCoverage, sellers, activeHub, ready]);

  const hubsSorted = [...hubs].sort((a, b) => a.hub.localeCompare(b.hub, "vi"));

  return (
    <div className="relative">
      <div className="relative">
        {!ready && (
          <div
            className="absolute inset-0 flex items-center justify-center text-sm z-[500] pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          >
            {loadingLabel}
          </div>
        )}
        <div ref={mapElRef} style={{ height: 560, background: "var(--grid)", borderRadius: 12, userSelect: "none" }} />
        {ready && (
          <button
            onClick={resetView}
            title={resetLabel}
            className="absolute top-2 right-2 z-[500] w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-[var(--brand-red-tint)]"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      <p className="text-[11px] mt-3" style={{ color: "var(--text-muted)" }}>
        {legendHint}
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {hubsSorted.map((h) => {
          const isActive = activeHub === h.hub;
          const isPinned = pinnedHub === h.hub;
          return (
            <button
              key={h.hub}
              type="button"
              onMouseEnter={() => {
                if (pinnedHub === null) setHoverHub(h.hub);
              }}
              onMouseLeave={() => {
                if (pinnedHub === null) setHoverHub(null);
              }}
              onClick={() => {
                if (isPinned) {
                  setPinnedHub(null);
                  setHoverHub(h.hub);
                } else {
                  setPinnedHub(h.hub);
                  setHoverHub(h.hub);
                }
              }}
              className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full border transition-colors"
              style={{
                background: isActive ? "var(--brand-red-tint)" : "var(--surface)",
                borderColor: isActive ? "var(--brand-red)" : "var(--border)",
                color: "var(--text-primary)",
                fontWeight: isPinned ? 700 : 500,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorForHub(h.hub, hubColorMap) }} />
              {h.hub}
            </button>
          );
        })}
        <span className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1" style={{ color: "var(--text-muted)" }}>
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: NEUTRAL_COLOR }} />
          {unassignedLabel}
        </span>
      </div>
    </div>
  );
}
