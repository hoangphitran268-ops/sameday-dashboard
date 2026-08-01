"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export default function ExportableChartCard({
  title,
  note,
  filename,
  lang = "vi",
  children,
}: {
  title: string;
  note?: string;
  filename: string;
  lang?: Lang;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const t = dict[lang].common;

  async function handleExport() {
    if (!ref.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === "true"),
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      ref={ref}
      className="rounded-2xl border p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-md)]"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-baseline justify-between mb-1 gap-3">
        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="inline-block w-1 h-3.5 rounded-full" style={{ background: "var(--brand-red)" }} />
          {title}
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          {note && (
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {note}
            </span>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            data-export-ignore="true"
            className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors duration-150 disabled:opacity-60"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--brand-red-tint)" }}
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {t.exportImage}
          </button>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
