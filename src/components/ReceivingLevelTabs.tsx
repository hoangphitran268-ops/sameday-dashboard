"use client";

import { useState } from "react";
import ReceivingLevelTable from "@/components/ReceivingLevelTable";
import type { ReceivingLevelSummaryRow } from "@/lib/types";
import { dict, type Lang } from "@/lib/i18n";

export default function ReceivingLevelTabs({
  hcmRow,
  khuRows,
  bcRows,
  lang = "vi",
}: {
  hcmRow: ReceivingLevelSummaryRow | null;
  khuRows: ReceivingLevelSummaryRow[];
  bcRows: ReceivingLevelSummaryRow[];
  lang?: Lang;
}) {
  const t = dict[lang].pages.receivingLevel;
  const tTable = dict[lang].receivingLevelTable;
  const [tab, setTab] = useState<"hcm" | "khu" | "bc">("hcm");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <TabButton active={tab === "hcm"} onClick={() => setTab("hcm")}>
          {t.levelHcm}
        </TabButton>
        <TabButton active={tab === "khu"} onClick={() => setTab("khu")}>
          {t.levelKhu}
        </TabButton>
        <TabButton active={tab === "bc"} onClick={() => setTab("bc")}>
          {t.levelBc}
        </TabButton>
      </div>

      {tab === "hcm" &&
        (hcmRow ? (
          <ReceivingLevelTable rows={[hcmRow]} showKhu={false} lang={lang} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {tTable.empty}
          </p>
        ))}
      {tab === "khu" &&
        (khuRows.length > 0 ? (
          <ReceivingLevelTable rows={khuRows} showKhu={false} lang={lang} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t.khuEmptyMsg}
          </p>
        ))}
      {tab === "bc" &&
        (bcRows.length > 0 ? (
          <ReceivingLevelTable rows={bcRows} showKhu lang={lang} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t.bcEmptyMsg}
          </p>
        ))}
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
