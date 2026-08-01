"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { dict, type Lang } from "@/lib/i18n";

export default function ExportablePage({
  filename,
  lang = "vi",
  children,
}: {
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
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors duration-150 disabled:opacity-60"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--brand-red-tint)" }}
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {t.exportImage}
        </button>
      </div>
      <div ref={ref} className="space-y-6" style={{ background: "var(--background)" }}>
        {children}
      </div>
    </div>
  );
}
