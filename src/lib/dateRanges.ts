import type { DateRange, RangePresetKey } from "./types";
import { dict, type Lang } from "./i18n";

// Toàn bộ tính toán ngày đều dùng mốc UTC nội bộ (không phụ thuộc timezone máy chạy),
// nhất quán với cách scripts/regenerate-data.mjs diễn giải ngày từ file Excel.

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}
function startOfMonth(iso: string): string {
  const d = fromISO(iso);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
}
function endOfMonth(iso: string): string {
  const d = fromISO(iso);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}
function startOfYear(iso: string): string {
  const d = fromISO(iso);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)));
}
// Thứ 2 = đầu tuần (quy ước VN)
function startOfWeekMonday(iso: string): string {
  const d = fromISO(iso);
  const dow = d.getUTCDay(); // 0=CN..6=T7
  const diff = dow === 0 ? 6 : dow - 1;
  return addDays(iso, -diff);
}

export function todayISO(): string {
  return toISO(new Date());
}

export const PRESET_LABELS: Record<RangePresetKey, string> = {
  all: "Toàn bộ dữ liệu",
  yesterday: "Hôm qua",
  last7: "7 ngày gần nhất",
  lastWeek: "Tuần trước",
  thisMonth: "Tháng này",
  lastMonth: "Tháng trước",
  thisYear: "Năm nay",
  custom: "Tùy chỉnh",
};

export const PRESET_ORDER: RangePresetKey[] = [
  "all",
  "yesterday",
  "last7",
  "lastWeek",
  "thisMonth",
  "lastMonth",
  "thisYear",
];

export function resolvePreset(
  preset: RangePresetKey,
  opts: { customFrom?: string | null; customTo?: string | null; today?: string } = {}
): DateRange {
  const today = opts.today ?? todayISO();
  const label = PRESET_LABELS[preset];

  switch (preset) {
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: y, to: y, preset, label };
    }
    case "last7": {
      // 7 ngày gần nhất đã có đủ dữ liệu (kết thúc hôm qua, vì hôm nay thường chưa có file export)
      return { from: addDays(today, -7), to: addDays(today, -1), preset, label };
    }
    case "lastWeek": {
      const thisMonday = startOfWeekMonday(today);
      const lastMonday = addDays(thisMonday, -7);
      const lastSunday = addDays(thisMonday, -1);
      return { from: lastMonday, to: lastSunday, preset, label };
    }
    case "thisMonth": {
      return { from: startOfMonth(today), to: today, preset, label };
    }
    case "lastMonth": {
      const firstThisMonth = startOfMonth(today);
      const lastOfPrevMonth = addDays(firstThisMonth, -1);
      return { from: startOfMonth(lastOfPrevMonth), to: endOfMonth(lastOfPrevMonth), preset, label };
    }
    case "thisYear": {
      return { from: startOfYear(today), to: today, preset, label };
    }
    case "custom": {
      return { from: opts.customFrom ?? null, to: opts.customTo ?? null, preset, label };
    }
    case "all":
    default:
      return { from: null, to: null, preset: "all", label: PRESET_LABELS.all };
  }
}

export function formatVN(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function rangeDisplayLabel(range: DateRange, lang: Lang = "vi"): string {
  const label = lang === "zh" ? dict.zh.dateRange.presets[range.preset] : range.label;
  if (range.preset !== "custom" && range.preset !== "all") {
    return `${label} (${formatVN(range.from)} - ${formatVN(range.to)})`;
  }
  if (range.preset === "custom" && range.from && range.to) {
    return `${formatVN(range.from)} - ${formatVN(range.to)}`;
  }
  return label;
}
