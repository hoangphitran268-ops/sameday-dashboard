"use client";

interface TooltipPayloadItem {
  dataKey?: string;
  name?: string;
  value?: number | string;
  color?: string;
  unit?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{ background: "var(--surface)", borderColor: "var(--border)", minWidth: 150 }}
    >
      <div className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey as string} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <span className="inline-block w-2.5 h-[2px]" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {typeof p.value === "number" ? p.value.toLocaleString("vi-VN") : p.value}
            {p.unit ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}
