"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { getLang, dict } from "@/lib/i18n";

export default function KhuFilter({ options }: { options: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = dict[getLang(searchParams)];
  const current = searchParams.get("khu") ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("khu", value);
    else params.delete("khu");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label
      className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border"
      style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
    >
      <MapPin size={13} style={{ color: "var(--brand-red)" }} />
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        <option value="">{t.khuFilter.all}</option>
        {options.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </label>
  );
}
