import fs from "node:fs";
import path from "node:path";
import type { DashboardData, RawDashboardData, RangePresetKey } from "./types";
import { aggregateRange } from "./aggregate";
import { resolvePreset } from "./dateRanges";

const DATA_PATH = path.join(process.cwd(), "src", "data", "dashboard-data.json");

export function readRawData(): RawDashboardData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as RawDashboardData;
}

export function getDataPath() {
  return DATA_PATH;
}

export type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const VALID_PRESETS: RangePresetKey[] = [
  "all",
  "yesterday",
  "last7",
  "lastWeek",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "custom",
];

/** Đọc query string (?preset=&from=&to=) và trả về dữ liệu đã tổng hợp đúng khoảng ngày được chọn. */
export function getDashboardData(searchParams: SearchParams): { data: DashboardData; range: ReturnType<typeof resolvePreset> } {
  const raw = readRawData();
  const presetParam = firstParam(searchParams.preset);
  const preset: RangePresetKey = VALID_PRESETS.includes(presetParam as RangePresetKey)
    ? (presetParam as RangePresetKey)
    : "all";
  const customFrom = firstParam(searchParams.from) ?? null;
  const customTo = firstParam(searchParams.to) ?? null;

  const range = resolvePreset(preset, { customFrom, customTo });
  const data = aggregateRange(raw, range);
  return { data, range };
}
