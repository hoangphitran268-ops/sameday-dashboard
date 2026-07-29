"use client";

import { useState } from "react";
import PerfTable from "@/components/PerfTable";
import type { NodePerfRow } from "@/lib/types";

export default function BcTabs({ worst, best }: { worst: NodePerfRow[]; best: NodePerfRow[] }) {
  const [tab, setTab] = useState<"worst" | "best">("worst");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <TabButton active={tab === "worst"} onClick={() => setTab("worst")}>
          15 thấp nhất
        </TabButton>
        <TabButton active={tab === "best"} onClick={() => setTab("best")}>
          15 cao nhất
        </TabButton>
      </div>
      <PerfTable rows={tab === "worst" ? worst : best} labelKey="buu_cuc" />
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
