"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Building2 } from "lucide-react";

export default function ArrivalFilters({ khuOptions, bcOptions }: { khuOptions: string[]; bcOptions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentKhu = searchParams.get("akhu") ?? "";
  const currentBc = searchParams.get("abc") ?? "";

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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterSelect icon={MapPin} value={currentKhu} onChange={onKhuChange} placeholder="Tất cả khu" options={khuOptions} />
      <FilterSelect icon={Building2} value={currentBc} onChange={onBcChange} placeholder="Tất cả bưu cục phát" options={bcOptions} />
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
