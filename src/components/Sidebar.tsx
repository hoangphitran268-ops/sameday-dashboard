"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, TrendingUp, Building2, AlertTriangle, Clock, ChevronsLeft, ChevronsRight } from "lucide-react";
import { rangeDisplayLabel, resolvePreset } from "@/lib/dateRanges";
import type { RangePresetKey } from "@/lib/types";

const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/kpi", label: "Xu hướng KPI", icon: TrendingUp },
  { href: "/hieu-suat", label: "Bưu cục & Khu", icon: Building2 },
  { href: "/nguyen-nhan", label: "Nguyên nhân & Trạng thái", icon: AlertTriangle },
  { href: "/theo-gio", label: "Theo giờ trong ngày", icon: Clock },
];

const STORAGE_KEY = "jt-sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setMounted(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const preset = (searchParams.get("preset") as RangePresetKey) || "all";
  const range = resolvePreset(preset, { customFrom: searchParams.get("from"), customTo: searchParams.get("to") });

  return (
    <aside
      className={`relative shrink-0 flex flex-col text-white overflow-hidden transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-64"
      } ${mounted ? "" : "invisible"}`}
      style={{
        background: "linear-gradient(160deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
        boxShadow: "4px 0 24px -8px rgba(217,4,41,0.25)",
      }}
    >
      {/* decorative depth accents */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/[0.08]" />
      <div className="pointer-events-none absolute bottom-24 -left-10 w-40 h-40 rounded-full bg-white/[0.06]" />

      <button
        onClick={toggle}
        title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        className="absolute top-6 -right-3 z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        style={{ color: "var(--brand-red)" }}
      >
        {collapsed ? <ChevronsRight size={13} strokeWidth={2.5} /> : <ChevronsLeft size={13} strokeWidth={2.5} />}
      </button>

      <div className={`relative py-6 border-b border-white/15 ${collapsed ? "px-4" : "px-5"}`}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center font-black text-lg"
            style={{ color: "var(--brand-red)", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
          >
            J&T
          </div>
          {!collapsed && (
            <div className="whitespace-nowrap">
              <div className="font-extrabold leading-tight text-[15px] tracking-tight">SAME DAY</div>
              <div className="text-[11px] text-white/70 leading-tight">Ops Dashboard</div>
            </div>
          )}
        </div>
      </div>

      <nav className={`relative flex-1 py-4 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const target = qs ? `${href}?${qs}` : href;
          return (
            <Link
              key={href}
              href={target}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                collapsed ? "px-2.5 justify-center" : "px-3"
              } ${active ? "bg-white text-[var(--brand-red)]" : "text-white/90 hover:bg-white/10 hover:translate-x-0.5"}`}
              style={active ? { boxShadow: "0 4px 14px rgba(0,0,0,0.18)" } : undefined}
            >
              <Icon size={17} strokeWidth={2.2} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="relative px-5 py-4 text-[11px] text-white/60 border-t border-white/15 whitespace-nowrap overflow-hidden text-ellipsis">
          {rangeDisplayLabel(range)}
        </div>
      )}
    </aside>
  );
}
