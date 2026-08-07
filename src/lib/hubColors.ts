// 8 màu phân loại đã validate (dataviz skill: lightness band, chroma floor, CVD
// separation, normal-vision floor đều pass — 2 WARN chấp nhận được vì luôn có
// nhãn tên HUB đi kèm màu, không dùng màu đơn độc để phân biệt).
// Port nguyên trạng từ network-planning/src/lib/hubColors.ts, chỉ đổi khoá từ
// hub id (DB) sang tên HUB string ("(HCM) HUB 7" ...) đã dùng xuyên suốt trang Trung chuyển.
const HUB_PALETTE = [
  "#3366CC", // xanh dương
  "#CC0000", // đỏ
  "#2E8B57", // xanh lá biển
  "#CC8400", // cam/hổ phách
  "#990099", // tím
  "#0099C6", // xanh cyan
  "#DD4477", // hồng
  "#6633CC", // tím than
];

const NEUTRAL_COLOR = "#9AA3AF"; // BC/Seller chưa gán HUB

/** Gán màu cố định theo thứ tự HUB (index trong mảng hubNames đã sắp xếp ổn định
 * — vd theo tên) — không đổi màu khi bộ lọc/HUB khác đổi, tránh gây nhầm. */
export function buildHubColorMap(hubNames: string[]): Map<string, string> {
  const map = new Map<string, string>();
  hubNames.forEach((name, i) => map.set(name, HUB_PALETTE[i % HUB_PALETTE.length]));
  return map;
}

export function colorForHub(hubName: string | null, colorMap: Map<string, string>): string {
  if (!hubName) return NEUTRAL_COLOR;
  return colorMap.get(hubName) ?? NEUTRAL_COLOR;
}

export { NEUTRAL_COLOR };
