"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, TrendingUp, Building2, AlertTriangle, Clock, Gavel, PackageCheck, ChevronsLeft, ChevronsRight } from "lucide-react";
import { rangeDisplayLabel, resolvePreset } from "@/lib/dateRanges";
import { getLang, dict } from "@/lib/i18n";
import type { RangePresetKey } from "@/lib/types";

const STORAGE_KEY = "jt-sidebar-collapsed";

const NAV: {
  href: string;
  navKey: "overview" | "kpi" | "hieuSuat" | "nguyenNhan" | "theoGio" | "phat" | "receiving";
  icon: typeof LayoutDashboard;
}[] = [
  { href: "/", navKey: "overview", icon: LayoutDashboard },
  { href: "/nhan-kien", navKey: "receiving", icon: PackageCheck },
  { href: "/kpi", navKey: "kpi", icon: TrendingUp },
  { href: "/hieu-suat", navKey: "hieuSuat", icon: Building2 },
  { href: "/nguyen-nhan", navKey: "nguyenNhan", icon: AlertTriangle },
  { href: "/theo-gio", navKey: "theoGio", icon: Clock },
  { href: "/phat", navKey: "phat", icon: Gavel },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const lang = getLang(searchParams);
  const t = dict[lang];
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const preset = (searchParams.get("preset") as RangePresetKey) || "all";
  const range = resolvePreset(preset, { customFrom: searchParams.get("from"), customTo: searchParams.get("to") });
  const rangeLabel = rangeDisplayLabel(range, lang);

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
        title={collapsed ? t.sidebar.expand : t.sidebar.collapse}
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
              <div className="font-extrabold leading-tight text-[15px] tracking-tight">{t.sidebar.brandLine1}</div>
              <div className="text-[11px] text-white/70 leading-tight">{t.sidebar.brandLine2}</div>
            </div>
          )}
        </div>
      </div>

      <nav className={`relative flex-1 py-4 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {NAV.map(({ href, navKey, icon: Icon }) => {
          const label = t.nav[navKey];
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
          {rangeLabel}
        </div>
      )}
    </aside>
  );
}
