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
      className="rounded-2xl border p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-md)]"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-baseline justify-between mb-1 gap-3">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="inline-block w-1 h-3.5 rounded-full" style={{ background: "var(--brand-red)" }} />
          {title}
        </h3>
        {note && (
          <span className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>
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
