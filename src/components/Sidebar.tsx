"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Building2, AlertTriangle, Clock } from "lucide-react";

const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/kpi", label: "Xu hướng KPI", icon: TrendingUp },
  { href: "/hieu-suat", label: "Bưu cục & Khu", icon: Building2 },
  { href: "/nguyen-nhan", label: "Nguyên nhân & Trạng thái", icon: AlertTriangle },
  { href: "/theo-gio", label: "Theo giờ trong ngày", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 shrink-0 flex flex-col text-white"
      style={{ background: "linear-gradient(180deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)" }}
    >
      <div className="px-5 py-6 border-b border-white/15">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-black text-lg" style={{ color: "var(--brand-red)" }}>
            J&T
          </div>
          <div>
            <div className="font-bold leading-tight text-[15px]">SAME DAY</div>
            <div className="text-[11px] text-white/75 leading-tight">Ops Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-white text-[var(--brand-red)]" : "text-white/90 hover:bg-white/10"
              }`}
            >
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-white/60 border-t border-white/15">
        07/07 – 27/07/2026 · 21 ngày
      </div>
    </aside>
  );
}
