import fs from "node:fs";
import path from "node:path";
import type { DashboardData, HourPageData, PenaltyPageData, RawDashboardData, RangePresetKey, ReasonPageData, ReceivingPageData, TransitPageData } from "./types";
import { aggregateHourPage, aggregatePenaltyPage, aggregateRange, aggregateReasonPage, aggregateReceivingPage, aggregateTransitPage } from "./aggregate";
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

/** Đọc query string (?preset=&from=&to=&khu=) cho trang Nguyên nhân & Trạng thái. */
export function getReasonPageData(
  searchParams: SearchParams
): { data: ReasonPageData; range: ReturnType<typeof resolvePreset>; khu: string | null } {
  const raw = readRawData();
  const presetParam = firstParam(searchParams.preset);
  const preset: RangePresetKey = VALID_PRESETS.includes(presetParam as RangePresetKey)
    ? (presetParam as RangePresetKey)
    : "all";
  const customFrom = firstParam(searchParams.from) ?? null;
  const customTo = firstParam(searchParams.to) ?? null;
  const khu = firstParam(searchParams.khu) ?? null;

  const range = resolvePreset(preset, { customFrom, customTo });
  const data = aggregateReasonPage(raw, range, khu);
  return { data, range, khu };
}

/** Đọc query string (?preset=&from=&to=&akhu=&abc=) cho trang Theo giờ trong ngày
 * (biểu đồ gộp lấy hàng/ký nhận/hàng đến + bảng chi tiết bưu cục). */
export function getHourPageData(
  searchParams: SearchParams
): { data: HourPageData; range: ReturnType<typeof resolvePreset>; khu: string | null; bc: string | null } {
  const raw = readRawData();
  const presetParam = firstParam(searchParams.preset);
  const preset: RangePresetKey = VALID_PRESETS.includes(presetParam as RangePresetKey)
    ? (presetParam as RangePresetKey)
    : "all";
  const customFrom = firstParam(searchParams.from) ?? null;
  const customTo = firstParam(searchParams.to) ?? null;
  const khu = firstParam(searchParams.akhu) ?? null;
  const bc = firstParam(searchParams.abc) ?? null;

  const range = resolvePreset(preset, { customFrom, customTo });
  const data = aggregateHourPage(raw, range, khu, bc);
  return { data, range, khu, bc };
}

/** Đọc query string (?preset=&from=&to=&khu=) cho trang Phạt vi phạm (Khâu Nhận). */
export function getPenaltyPageData(
  searchParams: SearchParams
): { data: PenaltyPageData; range: ReturnType<typeof resolvePreset>; khu: string | null } {
  const raw = readRawData();
  const presetParam = firstParam(searchParams.preset);
  const preset: RangePresetKey = VALID_PRESETS.includes(presetParam as RangePresetKey)
    ? (presetParam as RangePresetKey)
    : "all";
  const customFrom = firstParam(searchParams.from) ?? null;
  const customTo = firstParam(searchParams.to) ?? null;
  const khu = firstParam(searchParams.khu) ?? null;

  const range = resolvePreset(preset, { customFrom, customTo });
  const data = aggregatePenaltyPage(raw, range, khu);
  return { data, range, khu };
}

/** Đọc query string (?preset=&from=&to=) cho trang Nhận kiện (lấy hàng, thư mục "Khâu nhận"). */
export function getReceivingPageData(searchParams: SearchParams): { data: ReceivingPageData; range: ReturnType<typeof resolvePreset> } {
  const raw = readRawData();
  const presetParam = firstParam(searchParams.preset);
  const preset: RangePresetKey = VALID_PRESETS.includes(presetParam as RangePresetKey)
    ? (presetParam as RangePresetKey)
    : "all";
  const customFrom = firstParam(searchParams.from) ?? null;
  const customTo = firstParam(searchParams.to) ?? null;

  const range = resolvePreset(preset, { customFrom, customTo });
  const data = aggregateReceivingPage(raw, range);
  return { data, range };
}

/** Đọc query string (?preset=&from=&to=) cho trang Trung chuyển (thư mục "Trung chuyển - HUB"). */
export function getTransitPageData(searchParams: SearchParams): { data: TransitPageData; range: ReturnType<typeof resolvePreset> } {
  const raw = readRawData();
  const presetParam = firstParam(searchParams.preset);
  const preset: RangePresetKey = VALID_PRESETS.includes(presetParam as RangePresetKey)
    ? (presetParam as RangePresetKey)
    : "all";
  const customFrom = firstParam(searchParams.from) ?? null;
  const customTo = firstParam(searchParams.to) ?? null;

  const range = resolvePreset(preset, { customFrom, customTo });
  const data = aggregateTransitPage(raw, range);
  return { data, range };
}
