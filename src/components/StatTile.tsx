import type { LucideIcon } from "lucide-react";

export default function StatTile({
  label,
  value,
  icon: Icon,
  critical = false,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  critical?: boolean;
}) {
  return (
    <div
      className="group relative rounded-2xl border p-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        borderColor: critical ? "var(--brand-red-light)" : "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.06] transition-opacity duration-200 group-hover:opacity-[0.10]"
        style={{ background: critical ? "var(--status-critical)" : "var(--brand-red)" }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-xs mb-1.5 font-medium" style={{ color: "var(--text-secondary)" }}>
            {label}
          </div>
          <div
            className="text-2xl font-semibold leading-tight"
            style={{ color: critical ? "var(--status-critical)" : "var(--text-primary)" }}
          >
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: critical ? "var(--brand-red-light)" : "var(--brand-red-tint)",
              color: critical ? "var(--status-critical)" : "var(--brand-red)",
            }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>
    </div>
  );
}
