"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Calendar } from "lucide-react";
import { PRESET_LABELS, PRESET_ORDER, rangeDisplayLabel, resolvePreset } from "@/lib/dateRanges";
import type { RangePresetKey } from "@/lib/types";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activePreset = (searchParams.get("preset") as RangePresetKey) || "all";
  const customFrom = searchParams.get("from");
  const customTo = searchParams.get("to");
  const [draftFrom, setDraftFrom] = useState(customFrom ?? "");
  const [draftTo, setDraftTo] = useState(customTo ?? "");

  const range = resolvePreset(activePreset, { customFrom, customTo });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function applyPreset(key: RangePresetKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", key);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function applyCustom() {
    if (!draftFrom || !draftTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", "custom");
    params.set("from", draftFrom);
    params.set("to", draftTo);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--surface)" }}
      >
        <Calendar size={13} style={{ color: "var(--brand-red)" }} />
        {rangeDisplayLabel(range)}
        <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-xl border shadow-lg z-50 overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="py-1.5">
            {PRESET_ORDER.map((key) => {
              const isActive = activePreset === key && !(key === "all" && activePreset === "custom");
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="w-full flex items-center justify-between px-4 py-2 text-[13px] text-left transition-colors hover:bg-[var(--brand-red-tint)]"
                  style={{ color: isActive ? "var(--brand-red)" : "var(--text-primary)", fontWeight: isActive ? 600 : 400 }}
                >
                  {PRESET_LABELS[key]}
                  {isActive && <Check size={16} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
          <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
              Tùy chỉnh khoảng ngày
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-md border flex-1 min-w-0"
                style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                đến
              </span>
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-md border flex-1 min-w-0"
                style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
              />
            </div>
            <button
              onClick={applyCustom}
              disabled={!draftFrom || !draftTo}
              className="w-full mt-2 text-xs font-semibold py-1.5 rounded-md disabled:opacity-50"
              style={{ background: "var(--brand-red)", color: "#fff" }}
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
