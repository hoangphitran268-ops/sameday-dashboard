"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { MapLayerKey, ReceivingGeoLayerData, ReceivingGeoRow } from "@/lib/types";

interface MapFeature {
  type: "Feature";
  properties: { code?: string; name: string; ward_count?: number };
  geometry: GeoJSON.Geometry;
}
interface MapCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

const WIDTH = 720;
const HEIGHT = 900;
const MIN_K = 1;
const MAX_K = 30;
/** Chỉ hiện tên phường khi đã zoom đủ gần — tránh chồng chữ lúc xem toàn cảnh. Quận/Khu ít đơn vị
 * hơn hẳn nên hiện tên ngay từ đầu cũng không bị rối. */
const LABEL_MIN_K: Record<MapLayerKey, number> = { ward: 2.2, district: 1, khu: 1 };

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

function clampK(k: number) {
  return Math.min(MAX_K, Math.max(MIN_K, k));
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
  const [geojson, setGeojson] = useState<MapCollection | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<MapMode>("total");
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null);
  const wheelFrame = useRef<number | null>(null);

  useEffect(() => {
    setGeojson(null);
    setTransform({ x: 0, y: 0, k: 1 });
    fetch(GEOJSON_URL[layer])
      .then((r) => r.json())
      .then(setGeojson)
      .catch(() => setGeojson(null));
  }, [layer]);

  // Chỉ tính lại projection + chuỗi "d" của từng vùng 1 LẦN khi geojson thay đổi — đây là phần
  // nặng nhất (fitSize duyệt toàn bộ toạ độ). Trước đây tính lại mỗi lần render (kể cả mỗi pixel
  // di chuột / mỗi tick zoom) khiến bản đồ giật/văng khi tương tác nhiều.
  const paths = useMemo(() => {
    if (!geojson) return [];
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geojson as unknown as GeoJSON.GeoJSON);
    const pathGen = geoPath(projection);
    return geojson.features.map((f) => {
      const [cx, cy] = pathGen.centroid(f);
      return {
        code: f.properties.code ?? f.properties.name,
        name: f.properties.name,
        d: pathGen(f) ?? "",
        cx,
        cy,
      };
    });
  }, [geojson]);

  const layerData = data[layer];
  const rows: ReceivingGeoRow[] = mode === "pickup" ? layerData.pickup : mode === "delivery" ? layerData.delivery : layerData.total;

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of rows) {
      const key = normalizeName(d.phuong_xa);
      m.set(key, (m.get(key) ?? 0) + d.thanh_cong);
    }
    return m;
  }, [rows]);
  const maxVal = Math.max(1, ...rows.map((d) => d.thanh_cong));

  function colorFor(v: number) {
    if (v <= 0) return "var(--grid)";
    const t = Math.sqrt(v / maxVal);
    const lightness = 90 - t * 60;
    return `hsl(211, 75%, ${lightness}%)`;
  }

  const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    const p = { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
    setTransform((t) => {
      const k2 = clampK(t.k * factor);
      if (k2 === t.k) return t;
      const x2 = p.x - ((p.x - t.x) * k2) / t.k;
      const y2 = p.y - ((p.y - t.y) * k2) / t.k;
      return { x: x2, y: y2, k: k2 };
    });
  }, []);

  // Bắt sự kiện wheel bằng addEventListener gốc ({ passive: false }) thay vì prop onWheel của React —
  // trình duyệt coi listener "wheel" gắn qua JSX là passive nên preventDefault() không chặn được cuộn
  // trang thật với thao tác lăn chuột/trackpad thật (khác với sự kiện giả lập khi test).
  //
  // Gắn vào containerRef (luôn tồn tại từ lần render đầu tiên, kể cả lúc đang hiện "Đang tải bản
  // đồ...") thay vì svgRef — svgRef chỉ tồn tại SAU KHI geojson tải xong, nên nếu gắn theo svgRef
  // sẽ có một khoảng (đúng lúc trang vừa vào, người dùng lướt chuột ngay) mà listener chưa kịp gắn,
  // khiến vài lượt lướt đầu bị lọt ra ngoài làm cuộn trang — đúng như hiện tượng "lướt 2-3 cái đã lỗi".
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (!svgRef.current) return; // bản đồ chưa tải xong — chỉ chặn cuộn trang, chưa zoom được
      if (wheelFrame.current != null) return;
      const { clientX, clientY, deltaY } = e;
      wheelFrame.current = requestAnimationFrame(() => {
        wheelFrame.current = null;
        zoomAt(clientX, clientY, deltaY > 0 ? 0.88 : 1.14);
      });
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  function onMouseDown(e: ReactMouseEvent<SVGSVGElement>) {
    dragStart.current = { clientX: e.clientX, clientY: e.clientY, x: transform.x, y: transform.y };
    setDragging(true);
  }
  function onMouseMove(e: ReactMouseEvent<SVGSVGElement>) {
    if (dragStart.current) {
      const scale = WIDTH / (svgRef.current?.getBoundingClientRect().width || WIDTH);
      const dx = (e.clientX - dragStart.current.clientX) * scale;
      const dy = (e.clientY - dragStart.current.clientY) * scale;
      setTransform((t) => ({ ...t, x: dragStart.current!.x + dx, y: dragStart.current!.y + dy }));
    }
  }
  function endDrag() {
    dragStart.current = null;
    setDragging(false);
  }

  const center = { x: WIDTH / 2, y: HEIGHT / 2 };

  return (
    <div ref={containerRef} className="relative" style={{ overscrollBehavior: "contain" }}>
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

      {!geojson ? (
        <div className="flex items-center justify-center text-sm" style={{ height: 400, color: "var(--text-muted)" }}>
          {loadingLabel}
        </div>
      ) : (
        <>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            width="100%"
            height={520}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            style={{
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
              display: "block",
            }}
          >
            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
              {paths.map((p) => {
                const val = valueMap.get(normalizeName(p.name)) ?? 0;
                return (
                  <path
                    key={p.code}
                    d={p.d}
                    fill={colorFor(val)}
                    stroke="var(--surface)"
                    strokeWidth={0.4 / transform.k}
                    onMouseEnter={(e) => setHover({ name: p.name, value: val, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
                    onMouseLeave={() => setHover(null)}
                  />
                );
              })}
              {transform.k >= LABEL_MIN_K[layer] &&
                paths.map((p) => (
                  <text
                    key={`label-${p.code}`}
                    x={p.cx}
                    y={p.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={4.5 / transform.k}
                    fontWeight={600}
                    fill="var(--text-primary)"
                    stroke="var(--surface)"
                    strokeWidth={1.4 / transform.k}
                    paintOrder="stroke"
                    style={{ pointerEvents: "none" }}
                  >
                    {shortLabel(p.name)}
                  </text>
                ))}
            </g>
          </svg>

          {hover && (
            <div
              className="pointer-events-none fixed z-50 rounded-lg border px-3 py-2 text-xs shadow-lg"
              style={{ left: hover.x + 12, top: hover.y + 12, background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {hover.name}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                {hover.value > 0 ? `${hover.value.toLocaleString("vi-VN")} ${unitLabel}` : emptyLabel}
              </div>
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              onClick={() => zoomAt(center.x, center.y, 1.3)}
              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-[var(--brand-red-tint)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => zoomAt(center.x, center.y, 1 / 1.3)}
              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-[var(--brand-red-tint)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
              className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-[var(--brand-red-tint)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
