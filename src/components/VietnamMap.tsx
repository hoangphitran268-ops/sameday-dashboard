"use client";

import { useEffect, useMemo, useRef, useState, type WheelEvent as ReactWheelEvent, type MouseEvent as ReactMouseEvent } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface WardFeature {
  type: "Feature";
  properties: { code: string; name: string };
  geometry: GeoJSON.Geometry;
}
interface WardCollection {
  type: "FeatureCollection";
  features: WardFeature[];
}

const WIDTH = 720;
const HEIGHT = 900;
const MIN_K = 1;
const MAX_K = 10;

function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^(phường|phuong|xã|xa)\.?\s*/i, "")
    .toLowerCase()
    .trim();
}

function clampK(k: number) {
  return Math.min(MAX_K, Math.max(MIN_K, k));
}

type GeoRow = { phuong_xa: string; thanh_cong: number };
type MapMode = "pickup" | "delivery" | "total";

export default function VietnamMap({
  pickupData,
  deliveryData,
  totalData,
  modeLabels,
  loadingLabel,
  emptyLabel,
  unitLabel,
}: {
  pickupData: GeoRow[];
  deliveryData: GeoRow[];
  totalData: GeoRow[];
  modeLabels: { pickup: string; delivery: string; total: string };
  loadingLabel: string;
  emptyLabel: string;
  unitLabel: string;
}) {
  const [geojson, setGeojson] = useState<WardCollection | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<MapMode>("total");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef<{ clientX: number; clientY: number; x: number; y: number } | null>(null);
  const wheelFrame = useRef<number | null>(null);

  useEffect(() => {
    fetch("/geo/hcm-wards.geojson")
      .then((r) => r.json())
      .then(setGeojson)
      .catch(() => setGeojson(null));
  }, []);

  // Chỉ tính lại projection + chuỗi "d" của từng phường 1 LẦN khi geojson thay đổi — đây là phần
  // nặng nhất (fitSize duyệt toàn bộ toạ độ). Trước đây tính lại mỗi lần render (kể cả mỗi pixel
  // di chuột / mỗi tick zoom) khiến bản đồ giật/văng khi tương tác nhiều.
  const paths = useMemo(() => {
    if (!geojson) return [];
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geojson as unknown as GeoJSON.GeoJSON);
    const pathGen = geoPath(projection);
    return geojson.features.map((f) => ({
      code: f.properties.code,
      name: f.properties.name,
      d: pathGen(f) ?? "",
    }));
  }, [geojson]);

  const data = mode === "pickup" ? pickupData : mode === "delivery" ? deliveryData : totalData;

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) {
      const key = normalizeName(d.phuong_xa);
      m.set(key, (m.get(key) ?? 0) + d.thanh_cong);
    }
    return m;
  }, [data]);
  const maxVal = Math.max(1, ...data.map((d) => d.thanh_cong));

  function colorFor(v: number) {
    if (v <= 0) return "var(--grid)";
    const t = Math.sqrt(v / maxVal);
    const lightness = 90 - t * 60;
    return `hsl(211, 75%, ${lightness}%)`;
  }

  function svgPoint(clientX: number, clientY: number) {
    const el = svgRef.current;
    if (!el) return { x: clientX, y: clientY };
    const rect = el.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const p = svgPoint(clientX, clientY);
    setTransform((t) => {
      const k2 = clampK(t.k * factor);
      if (k2 === t.k) return t;
      const x2 = p.x - ((p.x - t.x) * k2) / t.k;
      const y2 = p.y - ((p.y - t.y) * k2) / t.k;
      return { x: x2, y: y2, k: k2 };
    });
  }

  function onWheel(e: ReactWheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const { clientX, clientY, deltaY } = e;
    if (wheelFrame.current != null) return;
    wheelFrame.current = requestAnimationFrame(() => {
      wheelFrame.current = null;
      zoomAt(clientX, clientY, deltaY > 0 ? 0.88 : 1.14);
    });
  }

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

  if (!geojson) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height: 400, color: "var(--text-muted)" }}>
        {loadingLabel}
      </div>
    );
  }

  const center = { x: WIDTH / 2, y: HEIGHT / 2 };

  return (
    <div className="relative">
      <div className="flex gap-2 mb-3">
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
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={520}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none", display: "block" }}
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
    </div>
  );
}
