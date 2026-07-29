"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { getLang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = getLang(searchParams);

  function setLang(next: "vi" | "zh") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "vi") params.delete("lang");
    else params.set("lang", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex items-center gap-1 text-xs font-semibold px-1.5 py-1 rounded-full border"
      style={{ borderColor: "var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
    >
      <Languages size={13} className="ml-1" style={{ color: "var(--brand-red)" }} />
      {(["vi", "zh"] as const).map((key) => (
        <button
          key={key}
          onClick={() => setLang(key)}
          className="px-2.5 py-1 rounded-full transition-all duration-150"
          style={
            lang === key
              ? {
                  background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                  color: "#fff",
                }
              : { color: "var(--text-secondary)" }
          }
        >
          {key === "vi" ? "Tiếng Việt" : "中文"}
        </button>
      ))}
    </div>
  );
}
