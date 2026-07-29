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
  },
};

export const dict = { vi, zh };
