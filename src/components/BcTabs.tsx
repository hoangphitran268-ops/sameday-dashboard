"use client";

import { useState } from "react";
import PerfTable from "@/components/PerfTable";
import type { NodePerfRow } from "@/lib/types";
import { dict, type Lang } from "@/lib/i18n";

export default function BcTabs({ worst, best, lang = "vi" }: { worst: NodePerfRow[]; best: NodePerfRow[]; lang?: Lang }) {
  const t = dict[lang].bcTabs;
  const [tab, setTab] = useState<"worst" | "best">("worst");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <TabButton active={tab === "worst"} onClick={() => setTab("worst")}>
          {t.worst15}
        </TabButton>
        <TabButton active={tab === "best"} onClick={() => setTab("best")}>
          {t.best15}
        </TabButton>
      </div>
      <PerfTable rows={tab === "worst" ? worst : best} labelKey="buu_cuc" lang={lang} />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150"
      style={
        active
          ? {
              background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
              borderColor: "var(--brand-red)",
              color: "#fff",
              boxShadow: "var(--shadow-red)",
            }
          : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }
      }
    >
      {children}
    </button>
  );
}
