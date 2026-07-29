"use client";

import { useSearchParams } from "next/navigation";
import { getLang, dict } from "@/lib/i18n";

export default function HeaderBrand() {
  const searchParams = useSearchParams();
  const lang = getLang(searchParams);
  const t = dict[lang];

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {t.header.title}
        </h1>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: "var(--brand-red)", color: "#fff" }}
        >
          {t.header.badge}
        </span>
      </div>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
        {t.header.subtitle}
      </p>
    </div>
  );
}
