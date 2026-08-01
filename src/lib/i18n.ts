import type { RangePresetKey } from "./types";

export type Lang = "vi" | "zh";

type SearchParamsLike =
  | { get(key: string): string | null }
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

/** Đọc ?lang=vi|zh từ searchParams (Server Component) hoặc useSearchParams() (Client Component). */
export function getLang(searchParams: SearchParamsLike): Lang {
  if (!searchParams) return "vi";
  let raw: string | string[] | null | undefined;
  if (typeof (searchParams as { get?: unknown }).get === "function") {
    raw = (searchParams as { get(key: string): string | null }).get("lang");
  } else {
    raw = (searchParams as Record<string, string | string[] | undefined>).lang;
  }
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "zh" ? "zh" : "vi";
}

const CJK_RE = /[一-鿿]/;

/** Dữ liệu có 1 số nhãn lưu sẵn song ngữ "Tiếng Việt - 中文" (nguyen_nhan, tinh_trang).
 * Hàm này tách phần tương ứng theo ngôn ngữ đang chọn; nếu không có phần tiếng Trung thì trả nguyên văn. */
export function localizeLabel(label: string, lang: Lang): string {
  const idx = label.search(CJK_RE);
  if (idx === -1) return label;
  if (lang === "zh") return label.slice(idx).trim();
  return label.slice(0, idx).replace(/[\s-]+$/, "").trim();
}

const WEEKDAY_ZH: Record<string, string> = {
  "Chủ nhật": "周日",
  "Thứ 2": "周一",
  "Thứ 3": "周二",
  "Thứ 4": "周三",
  "Thứ 5": "周四",
  "Thứ 6": "周五",
  "Thứ 7": "周六",
};

/** Tên Thứ trong tuần được tính sẵn (tiếng Việt) ở aggregate.ts — map sang tiếng Trung khi cần. */
export function localizeWeekday(weekday: string, lang: Lang): string {
  if (lang === "vi") return weekday;
  return WEEKDAY_ZH[weekday] ?? weekday;
}

// "Nguyên nhân lấy hàng thất bại" trong file Khâu nhận chỉ có tiếng Việt (không có sẵn bản tiếng
// Trung ghép chuỗi như nguyen_nhan/tinh_trang ở các file khác) — dịch thủ công cho 5 giá trị đã biết.
const RECEIVING_REASON_ZH: Record<string, string> = {
  "Chưa có hàng để lấy": "暂无货物可取",
  "Người gửi hẹn lại ngày lấy": "寄件人改约取件时间",
  "Đóng gói không đảm bảo": "包装不符合要求",
  "Người gửi đăng ký sai trọng lượng": "寄件人登记重量有误",
  "Khách báo hủy đơn": "客户通知取消订单",
};

export function localizeReceivingReason(reason: string, lang: Lang): string {
  if (lang === "vi") return reason;
  return RECEIVING_REASON_ZH[reason] ?? reason;
}

// Nguyên nhân trễ ở Trung chuyển cũng chỉ có tiếng Việt (2 giá trị cố định, xem
// NO_SHIFT_REASON/LATE_DESPITE_SHIFT_REASON trong scripts/regenerate-data.mjs).
const TRANSIT_REASON_ZH: Record<string, string> = {
  "Chưa gán ca gom hàng": "尚未分配收件班次",
  "Trễ dù đã gán ca": "已分配班次但仍延误",
  "Không trung chuyển HUB - HUB (về GW)": "未经HUB-HUB转运（发往GW）",
};

export function localizeTransitReason(reason: string, lang: Lang): string {
  if (lang === "vi") return reason;
  return TRANSIT_REASON_ZH[reason] ?? reason;
}

const vi = {
  langSwitcher: { vi: "Tiếng Việt", zh: "中文" },

  header: {
    title: "Dashboard vận hành SAME DAY",
    badge: "J&T Express",
    subtitle: 'Nguồn: sheet "data" của file export hằng ngày',
  },

  sidebar: {
    brandLine1: "SAME DAY",
    brandLine2: "Ops Dashboard",
    collapse: "Thu gọn menu",
    expand: "Mở rộng menu",
  },

  nav: {
    overview: "Tổng quan",
    kpi: "Xu hướng KPI",
    hieuSuat: "Bưu cục & Khu",
    nguyenNhan: "Nguyên nhân & Trạng thái",
    theoGio: "Theo giờ trong ngày",
    phat: "Phạt vi phạm",
    receiving: "Nhận kiện",
    receivingLevel: "Nhận kiện theo cấp",
    transit: "Trung chuyển",
    weeklyMeeting: "Họp tuần",
  },

  dateRange: {
    presets: {
      all: "Toàn bộ dữ liệu",
      yesterday: "Hôm qua",
      last7: "7 ngày gần nhất",
      lastWeek: "Tuần trước",
      thisMonth: "Tháng này",
      lastMonth: "Tháng trước",
      thisYear: "Năm nay",
      custom: "Tùy chỉnh",
    } as Record<RangePresetKey, string>,
    customLabel: "Tùy chỉnh khoảng ngày",
    to: "đến",
    apply: "Áp dụng",
  },

  khuFilter: { all: "Tất cả khu" },

  hourFilters: {
    metricAll: "Tất cả (3 loại)",
    pickup: "Lấy hàng",
    sign: "Ký nhận",
    arrival: "Hàng đến bưu cục phát",
    allKhu: "Tất cả khu",
    allBc: "Tất cả bưu cục phát",
  },

  refresh: {
    refreshing: "Đang quét dữ liệu...",
    refreshNow: "Cập nhật ngay",
    lastUpdated: (t: string) => `Cập nhật lần cuối: ${t} · Tự động quét mỗi 3 giờ`,
    unknown: "chưa rõ",
    genericError: "Có lỗi khi cập nhật dữ liệu.",
    connError: "Không kết nối được API cập nhật.",
  },

  emptyState: {
    title: "Không có dữ liệu cho khoảng thời gian đã chọn",
    desc: (label: string) => `${label} — chưa có file export nào khớp khoảng ngày này. Hãy chọn khoảng khác ở góc trên bên phải.`,
  },

  common: {
    khuLabel: "Khu",
    buuCucLabel: "Bưu cục",
    currencySuffix: "đ",
    unknownKhu: "Không xác định",
    exportImage: "Xuất ảnh",
  },

  chartNames: {
    signRatePct: "Tỷ lệ ký nhận %",
    issueRatePct: "Tỷ lệ có vấn đề %",
    avgDuration: "TG xử lý TB (giờ)",
    pickupCount: "Số đơn lấy hàng",
    signCount: "Số đơn ký nhận",
    arrivalCount: "Số đơn hàng đến bưu cục phát",
    penaltyAmount: "Tiền phạt",
    signRate: "Tỷ lệ ký nhận",
    quantity: "Số lượng",
    receivingSuccessPct: "Tỷ lệ nhận kiện %",
    cancelPct: "Tỷ lệ hủy đơn %",
    transitOnTimePct: "Tỷ lệ gửi đúng giờ %",
    receivingSuccessCount: "Số đơn nhận thành công",
  },

  receivingPerfTable: {
    bc: "Bưu cục",
    khu: "Khu",
    tongDon: "Tổng đơn",
    thanhCong: "Thành công",
    khongThanhCong: "Không thành công",
    tyLeThanhCongPct: "Tỷ lệ nhận kiện %",
    huy: "Hủy đơn",
    nguyenNhanChinh: "Nguyên nhân chính",
  },

  receivingSellerTable: {
    seller: "Seller",
    tongDon: "Tổng đơn",
    thanhCong: "Thành công",
    khongThanhCong: "Không thành công",
    tyLeThanhCongPct: "Tỷ lệ nhận kiện %",
    huy: "Hủy đơn",
    nguyenNhanChinh: "Nguyên nhân chính",
  },

  sellerReason: {
    empty: "Không có seller nào ghi nhận nguyên nhân này trong khoảng đã chọn.",
    seller: "Seller",
    soDonReason: "Số đơn (nguyên nhân này)",
    sharePct: "% trong tổng số đơn có vấn đề của seller",
  },

  perfTable: {
    buuCuc: "Bưu cục",
    khu: "Khu",
    tongDon: "Tổng đơn",
    daKyNhan: "Đã ký nhận",
    tyLeKyNhanPct: "Tỷ lệ ký nhận %",
    tgXuLyTb: "TG xử lý TB (giờ)",
    soDonVanDe: "Số đơn vấn đề",
  },

  bcTabs: { worst15: "15 thấp nhất", best15: "15 cao nhất" },

  reasonBc: {
    empty: "Không có bưu cục nào ghi nhận nguyên nhân này trong khoảng đã chọn.",
    buuCuc: "Bưu cục",
    khu: "Khu",
    soDonReason: "Số đơn (nguyên nhân này)",
    sharePct: "% trong tổng số đơn vấn đề của bưu cục",
  },

  transitPerfTable: {
    hub: "TTTC (HUB)",
    bcGui: "Bưu cục gửi",
    tongDon: "Tổng đơn",
    dungGio: "Đúng giờ",
    tyLeDungGioPct: "Tỷ lệ đúng giờ %",
    tyLeChuaGanCaPct: "Chưa gán ca %",
    nguyenNhanChinh: "Nguyên nhân chính",
  },

  transitReasonBc: {
    empty: "Không có bưu cục gửi nào ghi nhận nguyên nhân này trong khoảng đã chọn.",
    hub: "TTTC (HUB)",
    bcGui: "Bưu cục gửi",
    soDonReason: "Số đơn (nguyên nhân này)",
    sharePct: "% trong tổng số đơn trễ của bưu cục gửi",
  },

  receivingLevelTable: {
    empty: "Không có dữ liệu cho lựa chọn hiện tại.",
    key: "Tên",
    khu: "Khu",
    tongDon: "Tổng đơn",
    thanhCong: "Thành công",
    tyLeThanhCongPct: "Tỷ lệ thành công %",
    soNgay: "Số ngày có dữ liệu",
    tbThanhCongNgay: "TB thành công/ngày",
  },

  penaltyBc: {
    empty: "Không có bưu cục nào bị ghi nhận loại vi phạm này trong khoảng đã chọn.",
    buuCuc: "Bưu cục chịu trách nhiệm",
    khu: "Khu",
    soDonViPham: "Số đơn vi phạm",
    tienPhat: "Tiền phạt",
  },

  hourBcDetail: {
    empty: "Không có dữ liệu bưu cục cho lựa chọn hiện tại.",
    buuCucPhat: "Bưu cục phát",
    khu: "Khu",
    pickup: "Số đơn lấy hàng",
    sign: "Số đơn ký nhận",
    arrival: "Số đơn hàng đến",
    tong: "Tổng cộng",
    truncated: (shown: number, total: number) =>
      `Đang hiển thị ${shown}/${total} bưu cục theo khối lượng cao nhất — thu hẹp bằng bộ lọc Khu/Bưu cục ở trên để xem đầy đủ.`,
  },

  hourBcPivot: {
    metricLabel: {
      pickup: "Số đơn lấy hàng",
      sign: "Số đơn ký nhận",
      arrival: "Số đơn hàng đến bưu cục phát",
    } as Record<"pickup" | "sign" | "arrival", string>,
    buuCucPhat: "Bưu cục phát",
    tong: "Tổng",
    empty: (m: string) => `Không có dữ liệu "${m}" cho lựa chọn hiện tại.`,
    truncated: (shown: number, total: number, m: string) =>
      `Đang hiển thị ${shown}/${total} bưu cục theo "${m}" cao nhất — thu hẹp bằng bộ lọc Khu/Bưu cục ở trên để xem đầy đủ.`,
  },

  pages: {
    overview: {
      totalOrders: (days: number) => `Tổng số đơn (${days} ngày)`,
      signRateLabel: "Tỷ lệ ký nhận (đã xử lý xong trong ngày N)",
      avgDurationLabel: "TG xử lý trung bình",
      avgDurationValue: (v: number | string) => `${v} giờ`,
      issueRateLabel: "Tỷ lệ đơn có vấn đề",
      findingsTitle: (rangeLabel: string) => `Phát hiện chính · ${rangeLabel}`,
      kpiChartTitle: "Tỷ lệ ký nhận / có vấn đề theo ngày (%)",
      weekdayChartTitle: "Tỷ lệ ký nhận theo Thứ trong tuần (%)",
      weekdayChartNote: "Đỏ đậm = ngày có tỷ lệ ký nhận thấp nhất",
      finding1: (weekday: string, pct: number, gap: number) =>
        `${weekday} có tỷ lệ ký nhận thấp nhất trong khoảng này: ${pct}%, thấp hơn ${gap} điểm % so với trung bình các ngày còn lại.`,
      finding2: (bc: string, pct: number, total: string) =>
        `Bưu cục ${bc} có tỷ lệ ký nhận thấp nhất (≥300 đơn): ${pct}% trên ${total} đơn.`,
      finding3: (date: string, pct: number) => `Ngày ${date} có tỷ lệ đơn phát sinh vấn đề cao nhất: ${pct}%.`,
    },
    kpi: {
      durationChartTitle: "Thời gian xử lý trung bình theo ngày (giờ)",
      durationChartNote: "Đỏ đậm = vượt quá 130% mức trung bình trong khoảng đã chọn",
      tableTitle: "Bảng chi tiết theo ngày",
      tableHeaders: ["Ngày", "Tổng đơn", "Tỷ lệ ký nhận %", "TG xử lý TB (giờ)", "Tỷ lệ vấn đề %"],
    },
    hieuSuat: {
      khuChartTitle: "Hiệu suất theo Khu (tỷ lệ ký nhận %, khu ≥ 1.000 đơn)",
      khuChartNote: "Sắp xếp tăng dần — khu ở đầu danh sách cần chú ý nhất",
      khuEmptyMsg: "Không có khu nào đạt ngưỡng ≥ 1.000 đơn trong khoảng thời gian này.",
      bcSectionTitle: "Hiệu suất theo Bưu cục (tỷ lệ ký nhận %, bưu cục ≥ 300 đơn)",
      bcEmptyMsg: "Không có bưu cục nào đạt ngưỡng ≥ 300 đơn trong khoảng thời gian này.",
      khuTableTitle: "Bảng chi tiết theo Khu",
      footerNote: "Đã loại các mã điểm trung chuyển (HUB/TTTC/GW...) không phát sinh ký nhận khỏi 2 bảng xếp hạng trên.",
    },
    nguyenNhan: {
      chartTitle: "Nguyên nhân đơn có vấn đề (số đơn)",
      emptyMsg: (khuSuffix: string) => `Không có đơn nào phát sinh vấn đề trong khoảng thời gian này${khuSuffix}.`,
      bcSectionTitle: "Bưu cục thường xuyên ghi nhận nguyên nhân này",
      bcSectionDesc:
        "Chọn 1 nguyên nhân để xem 15 bưu cục ghi nhận nhiều nhất — kèm tỷ lệ nguyên nhân đó chiếm bao nhiêu % trong tổng số đơn có vấn đề của chính bưu cục đó.",
    },
    theoGio: {
      metricTitle: {
        pickup: "Lấy hàng",
        sign: "Ký nhận",
        arrival: "Hàng đến bưu cục phát",
      } as Record<"pickup" | "sign" | "arrival", string>,
      peakPickup: "Giờ lấy hàng cao điểm",
      peakSign: "Giờ ký nhận cao điểm",
      peakArrival: "Giờ hàng đến cao điểm",
      peakValue: (gio: number, count: string) => `${gio}h (${count} đơn)`,
      chartTitle: "Số đơn theo giờ trong ngày: Lấy hàng · Ký nhận · Hàng đến bưu cục phát",
      bcDetailTitle: (metricSuffix: string) => `Chi tiết theo bưu cục phát${metricSuffix}`,
      bcDetailDescWithMetric: (m: string) => `Đúng theo bộ lọc Khu/Bưu cục ở trên — mỗi bưu cục, mỗi giờ đạt bao nhiêu đơn "${m}".`,
      bcDetailDescNoMetric:
        "Đúng theo bộ lọc Khu/Bưu cục của biểu đồ trên — sắp xếp theo tổng khối lượng giảm dần. Chọn 1 loại (Lấy hàng/Ký nhận/Hàng đến) ở bộ lọc để xem chi tiết theo từng giờ.",
      emptyMsg: "Không có dữ liệu cho lựa chọn hiện tại — thử chọn khu/bưu cục khác.",
    },
    phat: {
      pageTitle: "Phạt vi phạm — Khâu Nhận",
      subtitle: 'Nguồn: file "THỐNG KÊ PHẠT SAMEDAY", sheet "data" · lũy kế toàn kỳ, luôn lấy bản mới nhất',
      statTongDon: "Tổng đơn được rà soát",
      statTyLeDungGio: "Tỷ lệ gửi đúng giờ",
      statSoDonViPham: "Số đơn vi phạm",
      statTongTienPhat: "Tổng tiền phạt",
      typeChartTitle: "Phân bố theo loại vi phạm (số đơn)",
      dailyChartTitle: "Tiền phạt theo ngày",
      bcSectionTitle: "Bưu cục chịu trách nhiệm nhiều nhất theo loại vi phạm",
      bcSectionDesc:
        'Chọn 1 loại vi phạm để xem 15 bưu cục bị phạt nhiều nhất (theo "Mã bc chịu trách nhiệm"), sắp xếp theo tổng tiền phạt giảm dần.',
    },
    receiving: {
      pageTitle: "Nhận kiện — Khâu Nhận",
      subtitle: 'Nguồn: thư mục "Khâu nhận" · gộp theo Mã vận đơn, cộng dồn khi có file mới',
      statTongDon: "Tổng đơn tạo",
      statThanhCong: "Nhận thành công",
      statKhongThanhCong: "Nhận không thành công",
      statHuy: "Hủy đơn",
      statCountPct: (count: string, pct: number) => `${count} (${pct}%)`,
      trendChartTitle: "Tỷ lệ nhận kiện thành công / hủy theo ngày (%)",
      khuChartTitle: "Xếp hạng theo Khu (tỷ lệ nhận kiện %, khu ≥ 1.000 đơn)",
      khuChartNote: "Sắp xếp tăng dần — khu ở đầu danh sách cần chú ý nhất",
      khuEmptyMsg: "Không có khu nào đạt ngưỡng ≥ 1.000 đơn trong khoảng thời gian này.",
      bcSectionTitle: "Xếp hạng theo Bưu cục lấy hàng (tỷ lệ nhận kiện %, bưu cục ≥ 300 đơn)",
      bcEmptyMsg: "Không có bưu cục nào đạt ngưỡng ≥ 300 đơn trong khoảng thời gian này.",
      reasonChartTitle: "Nguyên nhân lấy hàng thất bại (số đơn)",
      reasonBcSectionTitle: "Bưu cục thường xuyên ghi nhận nguyên nhân này",
      reasonBcSectionDesc:
        "Chọn 1 nguyên nhân để xem 15 bưu cục ghi nhận nhiều nhất — kèm tỷ lệ nguyên nhân đó chiếm bao nhiêu % trong tổng số đơn có vấn đề của chính bưu cục đó.",
      sellerSectionTitle: "Xếp hạng theo Seller (tỷ lệ nhận kiện %, seller ≥ 50 đơn)",
      sellerEmptyMsg: "Không có seller nào đạt ngưỡng ≥ 50 đơn trong khoảng thời gian này.",
      sellerReasonSectionTitle: "Seller thường xuyên ghi nhận nguyên nhân này",
      sellerReasonSectionDesc:
        "Chọn 1 nguyên nhân để xem 15 seller ghi nhận nhiều nhất — giúp xác định seller nào đang ảnh hưởng đến tỷ lệ nhận kiện của bưu cục.",
      mapSectionTitle: "Bản đồ phân bố theo Tỉnh/Thành",
      mapLoading: "Đang tải bản đồ...",
      mapEmpty: "Không có dữ liệu",
      mapUnit: "đơn",
      mapModePickup: "Nhận",
      mapModeDelivery: "Phát",
      mapModeTotal: "Tổng",
    },
    receivingLevel: {
      pageTitle: "Nhận kiện theo cấp — HCM / Khu / BC",
      subtitle: "Số đơn nhận thành công bình quân/ngày và tỷ lệ nhận thành công, theo 3 cấp: toàn HCM, Khu, Bưu cục lấy hàng.",
      levelHcm: "HCM",
      levelKhu: "Khu",
      levelBc: "Bưu cục",
      entityPlaceholderKhu: "Chọn khu",
      entityPlaceholderBc: "Chọn bưu cục",
      statAvgLabel: "TB đơn thành công/ngày",
      statRateLabel: "Tỷ lệ thành công",
      chartTitle: "Số đơn nhận thành công & tỷ lệ thành công theo ngày",
      chartEmptyMsg: "Chọn 1 khu hoặc bưu cục ở bộ lọc trên để xem biểu đồ.",
      detailTitle: "Chi tiết theo cấp",
      khuEmptyMsg: "Không có khu nào đạt ngưỡng ≥ 1.000 đơn trong khoảng thời gian này.",
      bcEmptyMsg: "Không có bưu cục nào đạt ngưỡng ≥ 300 đơn trong khoảng thời gian này.",
    },
    transit: {
      pageTitle: "Trung chuyển — HUB",
      subtitle: 'Nguồn: thư mục "Trung chuyển - HUB" · gộp theo Mã vận đơn, cộng dồn khi có file mới',
      statTongDon: "Tổng đơn trung chuyển",
      statDungGio: "Gửi đúng giờ",
      statTre: "Gửi trễ",
      statChuaGanCa: "Chưa gán ca gom hàng",
      statCountPct: (count: string, pct: number) => `${count} (${pct}%)`,
      trendChartTitle: "Tỷ lệ gửi đúng giờ theo ngày (%)",
      hubChartTitle: "Xếp hạng theo TTTC (HUB) — tỷ lệ gửi đúng giờ %",
      hubChartNote: "Sắp xếp tăng dần — HUB ở đầu danh sách cần chú ý nhất",
      hubTableTitle: "Bảng chi tiết theo TTTC (HUB)",
      bcSectionTitle: "Xếp hạng theo Bưu cục gửi (tỷ lệ đúng giờ %, bưu cục ≥ 300 đơn)",
      bcEmptyMsg: "Không có bưu cục gửi nào đạt ngưỡng ≥ 300 đơn trong khoảng thời gian này.",
      reasonChartTitle: "Nguyên nhân gửi trễ (số đơn)",
      reasonBcSectionTitle: "Bưu cục gửi thường xuyên ghi nhận nguyên nhân này",
      reasonBcSectionDesc:
        "Chọn 1 nguyên nhân để xem 15 bưu cục gửi ghi nhận nhiều nhất — kèm tỷ lệ nguyên nhân đó chiếm bao nhiêu % trong tổng số đơn trễ của chính bưu cục đó.",
      rootCauseNote:
        'Đơn được xét theo ngày lấy hàng thành công (khớp Mã vận đơn với Khâu nhận) — "đúng giờ" nghĩa là TTTC đầu gửi hàng đi trong khung 12:00 (N-1) đến 13:40 (N). Đơn không trung chuyển qua HUB (về GW/ĐGP/TTKT, hoặc qua HUB feeder 5/9/16) luôn tính là trễ; đơn qua HUB 18 được gộp vào HUB 8. Trong số đơn có qua HUB, gốc rễ trễ chính vẫn là chưa được gán "Ca gom hàng".',
    },
    weeklyMeeting: {
      pageTitle: "Báo cáo họp tuần",
      subtitle:
        "Tổng hợp Nhận kiện + Trung chuyển + Phát hàng cho khoảng thời gian đang chọn ở trên — đổi bộ lọc ngày (ví dụ \"Tuần trước\") để xem kỳ khác.",
      receivingSectionTitle: "Nhận kiện",
      transitSectionTitle: "Trung chuyển",
      deliverySectionTitle: "Phát hàng",
      insightsTitle: "Phát hiện chính",
      recommendationsTitle: "Phương án cải thiện",
      bcReceivingSectionTitle: "Bưu cục lấy hàng nổi bật trong kỳ",
      bcTransitSectionTitle: "Bưu cục gửi (trung chuyển) nổi bật trong kỳ",
      bcDeliverySectionTitle: "Bưu cục phát hàng nổi bật trong kỳ",
      noInsight: "Không có phát hiện đáng chú ý trong khoảng thời gian này.",
      noRecommendation: "Không phát hiện vấn đề nổi bật cần cải thiện trong khoảng thời gian này.",
      findingReceivingWorstBc: (bc: string, pct: number, total: string) =>
        `Nhận kiện: bưu cục ${bc} có tỷ lệ nhận kiện thấp nhất (${pct}%, trên ${total} đơn).`,
      findingReceivingTopReason: (reason: string, pct: number) =>
        `Nguyên nhân lấy hàng thất bại phổ biến nhất: "${reason}" (chiếm ${pct}% số đơn có vấn đề khi lấy hàng).`,
      findingTransitWorstHub: (hub: string, pct: number, total: string) =>
        `Trung chuyển: TTTC ${hub} có tỷ lệ gửi đúng giờ thấp nhất (${pct}%, trên ${total} đơn).`,
      findingTransitChuaGanCa: (hub: string, pct: number) =>
        `TTTC ${hub} có ${pct}% số đơn chưa được gán "Ca gom hàng" — đây là gốc rễ chính khiến tỷ lệ gửi đúng giờ thấp.`,
      findingDeliveryWorstBc: (bc: string, pct: number, total: string) =>
        `Phát hàng: bưu cục ${bc} có tỷ lệ ký nhận thấp nhất (${pct}%, trên ${total} đơn).`,
      findingDeliveryWorstWeekday: (weekday: string, pct: number, gap: number) =>
        `${weekday} là ngày có tỷ lệ ký nhận thấp nhất trong kỳ (${pct}%) — thấp hơn ${gap} điểm % so với trung bình các ngày còn lại.`,
      findingDeliveryWorstIssueDay: (date: string, pct: number) => `Ngày ${date} có tỷ lệ đơn phát sinh vấn đề cao nhất trong kỳ (${pct}%).`,
      recoReceivingBc: (bc: string, pct: number) =>
        `Rà soát nhân sự/tuyến lấy hàng tại bưu cục ${bc} — tỷ lệ nhận kiện chỉ ${pct}%, thấp hơn đáng kể so với mặt bằng chung.`,
      recoReceivingReason: (reason: string) =>
        `Phối hợp đội kinh doanh nhắc seller chuẩn bị hàng đúng hẹn — nguyên nhân "${reason}" đang chiếm tỷ trọng lớn nhất trong các đơn lấy hàng thất bại.`,
      recoReceivingSeller: (seller: string, pct: number) =>
        `Làm việc trực tiếp với seller "${seller}" — tỷ lệ nhận kiện chỉ ${pct}%, đang kéo tỷ lệ chung của bưu cục xuống.`,
      recoTransitHub: (hub: string, pct: number) =>
        `Rà soát quy trình gán "Ca gom hàng" tại TTTC ${hub} — tỷ lệ gửi đúng giờ chỉ ${pct}%, thấp hơn đáng kể so với mặt bằng chung.`,
      recoDeliveryBc: (bc: string, pct: number) => `Kiểm tra tuyến giao/nhân sự phát hàng tại bưu cục ${bc} — tỷ lệ ký nhận chỉ ${pct}%.`,
      recoDeliveryWeekday: (weekday: string) =>
        `Xem xét bổ sung nhân sự hoặc điều chỉnh ca làm việc vào ${weekday} — đây là ngày có tỷ lệ ký nhận thấp nhất trong kỳ.`,
      recoIssueDay: (pct: number) => `Rà soát nguyên nhân khiến tỷ lệ đơn có vấn đề tăng đột biến (${pct}%) để tránh lặp lại ở kỳ sau.`,
    },
  },
};

const zh: typeof vi = {
  langSwitcher: { vi: "Tiếng Việt", zh: "中文" },

  header: {
    title: "SAME DAY 运营看板",
    badge: "J&T Express",
    subtitle: '数据来源："data" 工作表（每日导出文件）',
  },

  sidebar: {
    brandLine1: "SAME DAY",
    brandLine2: "运营看板",
    collapse: "收起菜单",
    expand: "展开菜单",
  },

  nav: {
    overview: "总览",
    kpi: "KPI趋势",
    hieuSuat: "网点与片区",
    nguyenNhan: "原因与状态",
    theoGio: "每日时段分析",
    phat: "违规处罚",
    receiving: "揽收成功率",
    receivingLevel: "揽收分级表现",
    transit: "转运",
    weeklyMeeting: "周会报告",
  },

  dateRange: {
    presets: {
      all: "全部数据",
      yesterday: "昨天",
      last7: "最近7天",
      lastWeek: "上周",
      thisMonth: "本月",
      lastMonth: "上月",
      thisYear: "今年",
      custom: "自定义",
    } as Record<RangePresetKey, string>,
    customLabel: "自定义日期范围",
    to: "至",
    apply: "应用",
  },

  khuFilter: { all: "全部片区" },

  hourFilters: {
    metricAll: "全部（3项）",
    pickup: "揽收",
    sign: "签收",
    arrival: "到达派件网点",
    allKhu: "全部片区",
    allBc: "全部派件网点",
  },

  refresh: {
    refreshing: "正在扫描数据...",
    refreshNow: "立即更新",
    lastUpdated: (t: string) => `最后更新：${t} · 每3小时自动扫描`,
    unknown: "未知",
    genericError: "更新数据时出错。",
    connError: "无法连接更新接口。",
  },

  emptyState: {
    title: "所选时间范围内没有数据",
    desc: (label: string) => `${label} — 该日期范围内暂无匹配的导出文件。请在右上角选择其他时间范围。`,
  },

  common: {
    khuLabel: "片区",
    buuCucLabel: "网点",
    currencySuffix: "越南盾",
    unknownKhu: "未知片区",
    exportImage: "导出图片",
  },

  chartNames: {
    signRatePct: "签收率 %",
    issueRatePct: "问题单占比 %",
    avgDuration: "平均处理时长（小时）",
    pickupCount: "揽收单量",
    signCount: "签收单量",
    arrivalCount: "到件单量",
    penaltyAmount: "罚款金额",
    signRate: "签收率",
    quantity: "数量",
    receivingSuccessPct: "揽收成功率 %",
    cancelPct: "取消率 %",
    transitOnTimePct: "准时发货率 %",
    receivingSuccessCount: "成功揽收单量",
  },

  receivingPerfTable: {
    bc: "网点",
    khu: "片区",
    tongDon: "总单量",
    thanhCong: "成功揽收",
    khongThanhCong: "未成功揽收",
    tyLeThanhCongPct: "揽收成功率 %",
    huy: "取消单量",
    nguyenNhanChinh: "主要原因",
  },

  receivingSellerTable: {
    seller: "商家",
    tongDon: "总单量",
    thanhCong: "成功揽收",
    khongThanhCong: "未成功揽收",
    tyLeThanhCongPct: "揽收成功率 %",
    huy: "取消单量",
    nguyenNhanChinh: "主要原因",
  },

  sellerReason: {
    empty: "所选时间范围内没有商家记录该原因。",
    seller: "商家",
    soDonReason: "单量（该原因）",
    sharePct: "占该商家问题单总数的比例 %",
  },

  perfTable: {
    buuCuc: "网点",
    khu: "片区",
    tongDon: "总单量",
    daKyNhan: "已签收",
    tyLeKyNhanPct: "签收率 %",
    tgXuLyTb: "平均处理时长（小时）",
    soDonVanDe: "问题单量",
  },

  bcTabs: { worst15: "最低15名", best15: "最高15名" },

  reasonBc: {
    empty: "所选时间范围内没有网点记录该原因。",
    buuCuc: "网点",
    khu: "片区",
    soDonReason: "单量（该原因）",
    sharePct: "占该网点问题单总数的比例 %",
  },

  transitPerfTable: {
    hub: "转运中心 (HUB)",
    bcGui: "发件网点",
    tongDon: "总单量",
    dungGio: "准时",
    tyLeDungGioPct: "准时率 %",
    tyLeChuaGanCaPct: "未分配班次 %",
    nguyenNhanChinh: "主要原因",
  },

  transitReasonBc: {
    empty: "所选时间范围内没有发件网点记录该原因。",
    hub: "转运中心 (HUB)",
    bcGui: "发件网点",
    soDonReason: "单量（该原因）",
    sharePct: "占该发件网点延误单总数的比例 %",
  },

  receivingLevelTable: {
    empty: "当前所选条件下没有数据。",
    key: "名称",
    khu: "片区",
    tongDon: "总单量",
    thanhCong: "成功揽收",
    tyLeThanhCongPct: "揽收成功率 %",
    soNgay: "有数据天数",
    tbThanhCongNgay: "日均成功揽收",
  },

  penaltyBc: {
    empty: "所选时间范围内没有网点被记录该违规类型。",
    buuCuc: "责任网点",
    khu: "片区",
    soDonViPham: "违规单量",
    tienPhat: "罚款金额",
  },

  hourBcDetail: {
    empty: "当前所选条件下没有网点数据。",
    buuCucPhat: "派件网点",
    khu: "片区",
    pickup: "揽收单量",
    sign: "签收单量",
    arrival: "到件单量",
    tong: "合计",
    truncated: (shown: number, total: number) =>
      `正在显示 ${shown}/${total} 个网点（按业务量从高到低）— 请使用上方的片区/网点筛选查看完整数据。`,
  },

  hourBcPivot: {
    metricLabel: {
      pickup: "揽收单量",
      sign: "签收单量",
      arrival: "到达派件网点单量",
    } as Record<"pickup" | "sign" | "arrival", string>,
    buuCucPhat: "派件网点",
    tong: "合计",
    empty: (m: string) => `所选条件下没有"${m}"的数据。`,
    truncated: (shown: number, total: number, m: string) =>
      `正在显示 ${shown}/${total} 个网点（按"${m}"从高到低）— 请使用上方的片区/网点筛选查看完整数据。`,
  },

  pages: {
    overview: {
      totalOrders: (days: number) => `总单量（${days}天）`,
      signRateLabel: "签收率（当日N已处理完成）",
      avgDurationLabel: "平均处理时长",
      avgDurationValue: (v: number | string) => `${v} 小时`,
      issueRateLabel: "问题单占比",
      findingsTitle: (rangeLabel: string) => `关键发现 · ${rangeLabel}`,
      kpiChartTitle: "每日签收率／问题单占比 (%)",
      weekdayChartTitle: "按星期统计签收率 (%)",
      weekdayChartNote: "深红色 = 签收率最低的一天",
      finding1: (weekday: string, pct: number, gap: number) =>
        `${weekday}在此时间范围内签收率最低：${pct}%，比其余日期平均值低 ${gap} 个百分点。`,
      finding2: (bc: string, pct: number, total: string) => `网点 ${bc} 签收率最低（单量≥300）：${pct}%，共 ${total} 单。`,
      finding3: (date: string, pct: number) => `${date} 当日问题单占比最高：${pct}%。`,
    },
    kpi: {
      durationChartTitle: "每日平均处理时长（小时）",
      durationChartNote: "深红色 = 超过所选时间范围平均值的130%",
      tableTitle: "每日明细表",
      tableHeaders: ["日期", "总单量", "签收率 %", "平均处理时长（小时）", "问题单占比 %"],
    },
    hieuSuat: {
      khuChartTitle: "各片区签收率（%，片区单量≥1,000）",
      khuChartNote: "按升序排列 — 列表最前的片区最需要关注",
      khuEmptyMsg: "所选时间范围内没有片区单量达到 ≥1,000 的门槛。",
      bcSectionTitle: "各网点签收率（%，网点单量≥300）",
      bcEmptyMsg: "所选时间范围内没有网点单量达到 ≥300 的门槛。",
      khuTableTitle: "片区明细表",
      footerNote: "已从以上两个排名表中剔除不产生签收的中转节点（HUB/TTTC/GW等）。",
    },
    nguyenNhan: {
      chartTitle: "问题单原因分布（单量）",
      emptyMsg: (khuSuffix: string) => `所选时间范围内没有问题单${khuSuffix}。`,
      bcSectionTitle: "经常记录该原因的网点",
      bcSectionDesc: "选择1个原因查看记录最多的15个网点 — 并显示该原因占该网点问题单总数的百分比。",
    },
    theoGio: {
      metricTitle: {
        pickup: "揽收",
        sign: "签收",
        arrival: "到达派件网点",
      } as Record<"pickup" | "sign" | "arrival", string>,
      peakPickup: "揽收高峰时段",
      peakSign: "签收高峰时段",
      peakArrival: "到件高峰时段",
      peakValue: (gio: number, count: string) => `${gio}时（${count}单）`,
      chartTitle: "每日时段单量：揽收 · 签收 · 到达派件网点",
      bcDetailTitle: (metricSuffix: string) => `按派件网点明细${metricSuffix}`,
      bcDetailDescWithMetric: (m: string) => `根据上方片区/网点筛选 — 各网点每小时"${m}"单量。`,
      bcDetailDescNoMetric: "根据上方图表的片区/网点筛选 — 按总量从高到低排列。在筛选中选择1个类型（揽收/签收/到件）查看每小时明细。",
      emptyMsg: "当前所选条件下没有数据 — 请尝试选择其他片区/网点。",
    },
    phat: {
      pageTitle: "违规处罚 — 揽收环节",
      subtitle: '数据来源："THỐNG KÊ PHẠT SAMEDAY" 文件，"data" 工作表 · 全周期累计，始终取最新版本',
      statTongDon: "已核查总单量",
      statTyLeDungGio: "准时发货率",
      statSoDonViPham: "违规单量",
      statTongTienPhat: "罚款总额",
      typeChartTitle: "违规类型分布（单量）",
      dailyChartTitle: "每日罚款金额",
      bcSectionTitle: "各违规类型责任网点排名",
      bcSectionDesc: '选择1个违规类型查看被罚最多的15个网点（按"责任网点代码"），按罚款总额从高到低排列。',
    },
    receiving: {
      pageTitle: "揽收成功率 — 揽收环节",
      subtitle: '数据来源："Khâu nhận" 文件夹 · 按运单号合并，新文件到达时累加',
      statTongDon: "总创建单量",
      statThanhCong: "成功揽收",
      statKhongThanhCong: "未成功揽收",
      statHuy: "取消单量",
      statCountPct: (count: string, pct: number) => `${count}（${pct}%）`,
      trendChartTitle: "每日揽收成功率／取消率 (%)",
      khuChartTitle: "各片区揽收成功率（%，片区单量≥1,000）",
      khuChartNote: "按升序排列 — 列表最前的片区最需要关注",
      khuEmptyMsg: "所选时间范围内没有片区单量达到 ≥1,000 的门槛。",
      bcSectionTitle: "各揽收网点排名（揽收成功率 %，网点单量≥300）",
      bcEmptyMsg: "所选时间范围内没有网点单量达到 ≥300 的门槛。",
      reasonChartTitle: "揽收失败原因分布（单量）",
      reasonBcSectionTitle: "经常记录该原因的网点",
      reasonBcSectionDesc: "选择1个原因查看记录最多的15个网点 — 并显示该原因占该网点问题单总数的百分比。",
      sellerSectionTitle: "各商家排名（揽收成功率 %，商家单量≥50）",
      sellerEmptyMsg: "所选时间范围内没有商家单量达到 ≥50 的门槛。",
      sellerReasonSectionTitle: "经常记录该原因的商家",
      sellerReasonSectionDesc: "选择1个原因查看记录最多的15个商家 — 帮助找出正在影响网点揽收成功率的商家。",
      mapSectionTitle: "各省市分布地图",
      mapLoading: "地图加载中...",
      mapEmpty: "暂无数据",
      mapUnit: "单",
      mapModePickup: "揽收",
      mapModeDelivery: "派件",
      mapModeTotal: "总计",
    },
    receivingLevel: {
      pageTitle: "揽收分级表现 — HCM / 片区 / 网点",
      subtitle: "日均成功揽收单量与揽收成功率，按3个层级查看：全市（HCM）、片区、揽收网点。",
      levelHcm: "HCM",
      levelKhu: "片区",
      levelBc: "网点",
      entityPlaceholderKhu: "选择片区",
      entityPlaceholderBc: "选择网点",
      statAvgLabel: "日均成功揽收单量",
      statRateLabel: "揽收成功率",
      chartTitle: "每日成功揽收单量与揽收成功率",
      chartEmptyMsg: "请在上方筛选中选择1个片区或网点以查看图表。",
      detailTitle: "分级明细",
      khuEmptyMsg: "所选时间范围内没有片区单量达到 ≥1,000 的门槛。",
      bcEmptyMsg: "所选时间范围内没有网点单量达到 ≥300 的门槛。",
    },
    transit: {
      pageTitle: "转运 — HUB",
      subtitle: '数据来源："Trung chuyển - HUB" 文件夹 · 按运单号合并，新文件到达时累加',
      statTongDon: "转运总单量",
      statDungGio: "准时发出",
      statTre: "延误发出",
      statChuaGanCa: "未分配收件班次",
      statCountPct: (count: string, pct: number) => `${count}（${pct}%）`,
      trendChartTitle: "每日准时发出率 (%)",
      hubChartTitle: "各转运中心（HUB）排名 — 准时发出率 %",
      hubChartNote: "按升序排列 — 列表最前的 HUB 最需要关注",
      hubTableTitle: "各转运中心（HUB）明细表",
      bcSectionTitle: "各发件网点排名（准时率 %，网点单量≥300）",
      bcEmptyMsg: "所选时间范围内没有发件网点单量达到 ≥300 的门槛。",
      reasonChartTitle: "延误原因分布（单量）",
      reasonBcSectionTitle: "经常记录该原因的发件网点",
      reasonBcSectionDesc: "选择1个原因查看记录最多的15个发件网点 — 并显示该原因占该网点延误单总数的百分比。",
      rootCauseNote:
        "订单按成功揽收日期计算（通过运单号与揽收数据匹配）—「准时」指HUB始发中心在N-1日12:00至N日13:40期间发出货物。未经HUB转运的订单（发往GW/ĐGP/TTKT，或经过5/9/16号支线HUB）一律视为延误；经过18号HUB的订单归入8号HUB统计。在有效经过HUB的订单中，延误的主要根源仍是尚未分配「收件班次」。",
    },
    weeklyMeeting: {
      pageTitle: "周会报告",
      subtitle: '汇总当前所选时间范围的揽收成功率 + 转运 + 派送数据 — 可切换上方日期筛选（例如"上周"）查看其他周期。',
      receivingSectionTitle: "揽收成功率",
      transitSectionTitle: "转运情况",
      deliverySectionTitle: "派送情况",
      insightsTitle: "关键发现",
      recommendationsTitle: "改进建议",
      bcReceivingSectionTitle: "本期表现突出的揽收网点",
      bcTransitSectionTitle: "本期表现突出的发件（转运）网点",
      bcDeliverySectionTitle: "本期表现突出的派送网点",
      noInsight: "所选时间范围内没有值得注意的发现。",
      noRecommendation: "所选时间范围内没有发现需要改进的突出问题。",
      findingReceivingWorstBc: (bc: string, pct: number, total: string) => `揽收：网点 ${bc} 揽收成功率最低（${pct}%，共 ${total} 单）。`,
      findingReceivingTopReason: (reason: string, pct: number) => `最常见的揽收失败原因："${reason}"（占揽收问题单的 ${pct}%）。`,
      findingTransitWorstHub: (hub: string, pct: number, total: string) => `转运：转运中心 ${hub} 准时发出率最低（${pct}%，共 ${total} 单）。`,
      findingTransitChuaGanCa: (hub: string, pct: number) =>
        `转运中心 ${hub} 有 ${pct}% 的订单尚未分配「收件班次」— 这是准时发出率偏低的主要根源。`,
      findingDeliveryWorstBc: (bc: string, pct: number, total: string) => `派送：网点 ${bc} 签收率最低（${pct}%，共 ${total} 单）。`,
      findingDeliveryWorstWeekday: (weekday: string, pct: number, gap: number) =>
        `${weekday}是本期签收率最低的一天（${pct}%）— 比其余日期平均值低 ${gap} 个百分点。`,
      findingDeliveryWorstIssueDay: (date: string, pct: number) => `${date} 是本期问题单占比最高的一天（${pct}%）。`,
      recoReceivingBc: (bc: string, pct: number) => `建议排查网点 ${bc} 的揽收人力/路线安排 — 揽收成功率仅 ${pct}%，明显低于整体水平。`,
      recoReceivingReason: (reason: string) => `建议与业务团队协调，提醒商家按约定时间备货 — "${reason}" 是当前揽收失败单中占比最高的原因。`,
      recoReceivingSeller: (seller: string, pct: number) => `建议直接与商家"${seller}"沟通 — 其揽收成功率仅 ${pct}%，正在拉低该网点整体水平。`,
      recoTransitHub: (hub: string, pct: number) => `建议排查转运中心 ${hub} 的「收件班次」分配流程 — 准时发出率仅 ${pct}%，明显低于整体水平。`,
      recoDeliveryBc: (bc: string, pct: number) => `建议检查网点 ${bc} 的派送路线/人力安排 — 签收率仅 ${pct}%。`,
      recoDeliveryWeekday: (weekday: string) => `建议考虑在${weekday}增加人手或调整排班 — 该日是本期签收率最低的一天。`,
      recoIssueDay: (pct: number) => `建议排查导致问题单占比骤增（${pct}%）的原因，避免下期再次发生。`,
    },
  },
};

export const dict = { vi, zh };
