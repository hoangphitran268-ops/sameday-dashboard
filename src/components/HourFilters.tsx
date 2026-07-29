"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Building2, Filter } from "lucide-react";
import { getLang, dict } from "@/lib/i18n";

export default function HourFilters({ khuOptions, bcOptions }: { khuOptions: string[]; bcOptions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = dict[getLang(searchParams)];
  const METRIC_OPTIONS: { value: string; label: string }[] = [
    { value: "", label: t.hourFilters.metricAll },
    { value: "pickup", label: t.hourFilters.pickup },
    { value: "sign", label: t.hourFilters.sign },
    { value: "arrival", label: t.hourFilters.arrival },
  ];
  const currentKhu = searchParams.get("akhu") ?? "";
  const currentBc = searchParams.get("abc") ?? "";
  const currentMetric = searchParams.get("metric") ?? "";

  function onKhuChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("akhu", value);
    else params.delete("akhu");
    params.delete("abc"); // đổi khu thì bỏ bưu cục đang chọn vì có thể không còn thuộc khu mới
    router.push(`${pathname}?${params.toString()}`);
  }

  function onBcChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("abc", value);
    else params.delete("abc");
    router.push(`${pathname}?${params.toString()}`);
  }

  function onMetricChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("metric", value);
    else params.delete("metric");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterSelect icon={MapPin} value={currentKhu} onChange={onKhuChange} placeholder={t.hourFilters.allKhu} options={khuOptions} />
      <FilterSelect icon={Building2} value={currentBc} onChange={onBcChange} placeholder={t.hourFilters.allBc} options={bcOptions} />
      <label
        className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
      >
        <Filter size={13} style={{ color: "var(--brand-red)" }} />
        <select
          value={currentMetric}
          onChange={(e) => onMetricChange(e.target.value)}
          className="bg-transparent outline-none cursor-pointer font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {METRIC_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: typeof MapPin;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <label
      className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border"
      style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
    >
      <Icon size={13} style={{ color: "var(--brand-red)" }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
