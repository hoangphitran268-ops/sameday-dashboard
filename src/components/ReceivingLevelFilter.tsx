"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { dict, getLang } from "@/lib/i18n";
import type { ReceivingLevel } from "@/lib/types";

export default function ReceivingLevelFilter({ khuOptions, bcOptions }: { khuOptions: string[]; bcOptions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = getLang(searchParams);
  const t = dict[lang].pages.receivingLevel;

  const levelParam = searchParams.get("level");
  const level: ReceivingLevel = levelParam === "khu" || levelParam === "bc" ? levelParam : "hcm";
  const entity = searchParams.get("entity") ?? "";

  function setLevel(next: ReceivingLevel) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "hcm") params.delete("level");
    else params.set("level", next);
    params.delete("entity");
    router.push(`${pathname}?${params.toString()}`);
  }

  function setEntity(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("entity", value);
    else params.delete("entity");
    router.push(`${pathname}?${params.toString()}`);
  }

  const options = level === "khu" ? khuOptions : level === "bc" ? bcOptions : [];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1 p-1 rounded-full border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        {(["hcm", "khu", "bc"] as ReceivingLevel[]).map((lv) => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-150"
            style={
              level === lv
                ? {
                    background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                    color: "#fff",
                    boxShadow: "var(--shadow-red)",
                  }
                : { background: "transparent", color: "var(--text-secondary)" }
            }
          >
            {lv === "hcm" ? t.levelHcm : lv === "khu" ? t.levelKhu : t.levelBc}
          </button>
        ))}
      </div>

      {level !== "hcm" && (
        <label
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
        >
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="bg-transparent outline-none cursor-pointer font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            <option value="">{level === "khu" ? t.entityPlaceholderKhu : t.entityPlaceholderBc}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
