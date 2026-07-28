export default function StatTile({
  label,
  value,
  critical = false,
}: {
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div
        className="text-2xl font-semibold leading-tight"
        style={{ color: critical ? "var(--status-critical)" : "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}
