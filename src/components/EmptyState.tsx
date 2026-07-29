import { Inbox } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export default function EmptyState({ label, lang = "vi" }: { label: string; lang?: Lang }) {
  const t = dict[lang];
  return (
    <div
      className="rounded-2xl border p-12 flex flex-col items-center justify-center text-center w-full"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
        style={{ background: "var(--brand-red-tint)" }}
      >
        <Inbox size={26} style={{ color: "var(--brand-red)" }} />
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {t.emptyState.title}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {t.emptyState.desc(label)}
      </p>
    </div>
  );
}
