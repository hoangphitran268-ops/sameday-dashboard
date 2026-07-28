export default function ChartCard({
  title,
  note,
  children,
  legend,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  legend?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {note && (
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {note}
          </span>
        )}
      </div>
      {legend && <div className="flex gap-4 mb-2 flex-wrap">{legend}</div>}
      <div>{children}</div>
    </div>
  );
}

export function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
      <span className="inline-block w-3.5 h-[3px] rounded" style={{ background: color }} />
      {label}
    </span>
  );
}
