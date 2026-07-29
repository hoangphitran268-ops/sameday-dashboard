# CODEMAP — sameday-dashboard

Bản đồ chi tiết quan hệ giữa các file. Mục tiêu: khi cần sửa/thêm 1 tính năng, tra
bảng dưới để nhảy thẳng đến đúng file — không cần đọc lại toàn bộ source mỗi phiên.

`CLAUDE.md` (tự nạp mỗi phiên) chỉ nêu tổng quan; file này là tầng chi tiết, chỉ đọc
khi cần đào sâu vào một luồng cụ thể.

## 1. Luồng dữ liệu tổng thể

```
D:\Claude CODE\data\raw\sameday\*.xlsx          (export hằng ngày, sheet "data")
D:\Claude CODE\data\raw\sameday\PHẠT Khâu Nhận\*.xlsx   (lũy kế, luôn lấy file mới nhất theo mtime)
D:\Claude CODE\data\raw\sameday\Khâu nhận\*.xlsx        (theo lô, gộp theo Mã vận đơn)
                    │
                    ▼  (npm run regenerate / nút "Cập nhật ngay" / cron 3h)
        scripts/regenerate-data.mjs
                    │  ghi đè
                    ▼
        src/data/dashboard-data.json   (RawDashboardData — dữ liệu THEO TỪNG NGÀY,
                                         chưa lọc khoảng ngày, chưa dịch ngôn ngữ)
                    │
                    ▼  fs.readFileSync, mỗi request (force-dynamic, không cache)
              src/lib/data.ts  (readRawData + getXxxPageData theo searchParams)
                    │
                    ▼  lọc theo [from,to]/khu/bc + tính lại % và xếp hạng
              src/lib/aggregate.ts  (aggregateRange, aggregateReasonPage,
                                     aggregateHourPage, aggregatePenaltyPage,
                                     aggregateReceivingPage)
                    │
                    ▼  DashboardData / ReasonPageData / HourPageData / ...
              src/app/*/page.tsx  (Server Components, đọc searchParams)
                    │
                    ▼  props đã tính sẵn, chỉ hiển thị + dịch nhãn qua i18n
              src/components/**  (Client Components: bảng, tabs, filter)
              src/components/charts/**  (Recharts wrappers)
```

**Quan trọng — đây KHÔNG phải cùng pipeline với `D:\Claude CODE\CLAUDE.md` (Python
CSV master `data\db\*.csv`)**. App này đọc thẳng file `.xlsx` gốc trong
`data\raw\sameday\` bằng Node/`xlsx`, độc lập hoàn toàn với `ingest-daily-data` /
`generate-ops-report` (Python). Hai hệ thống dùng chung thư mục `data\raw\sameday`
làm nguồn nhưng không chia sẻ code, schema hay số liệu đã tính.

**3 nguồn dữ liệu, 3 quy ước "ngày N" khác nhau** (dễ nhầm khi sửa code — xem chú
thích trong `regenerate-data.mjs`):
- File export hằng ngày (`data`): ngày N = ngày trong tên file (`DD.MM.YYYY`).
- Phạt Khâu Nhận: khung `13h(N-1) → 12h59(N)`, lấy theo cột "Phân loại thời gian".
- Khâu nhận (nhận kiện): khung `12h(N-1) → 11h59(N)`, lấy theo "Thời gian nhập đơn hàng".

## 2. `src/lib/` — lõi tính toán, không phụ thuộc React

| File | Vai trò | Phụ thuộc |
|---|---|---|
| `types.ts` | Toàn bộ interface `Raw*` (khớp JSON thô) và `*PageData`/`*Row` (đã tổng hợp cho từng trang) + `DateRange`/`RangePresetKey`. Nguồn sự thật duy nhất cho shape dữ liệu. | không |
| `data.ts` | Đọc `dashboard-data.json` (`readRawData`), parse `searchParams` → gọi đúng hàm `aggregate*`. 1 hàm `get*PageData` cho mỗi trang: `getDashboardData` (tổng quan/KPI/hiệu-suất), `getReasonPageData`, `getHourPageData`, `getPenaltyPageData`, `getReceivingPageData`. | `types.ts`, `aggregate.ts`, `dateRanges.ts` |
| `aggregate.ts` | Toàn bộ logic tính %, xếp hạng worst15/best15, group theo ngày/khu/bc. 5 hàm chính khớp 1-1 với 5 hàm trong `data.ts`. Ngưỡng khối lượng tối thiểu (min volume để vào bảng xếp hạng) hardcode ở đây: BC ≥300, Khu ≥1000, Seller ≥50. | `types.ts` |
| `dateRanges.ts` | `resolvePreset()` — biến 1 trong 7 preset (`yesterday`, `last7`, `lastWeek`, `thisMonth`, `lastMonth`, `thisYear`, `custom`) thành `{from, to}` ISO, mốc UTC nội bộ (không phụ thuộc timezone máy). `rangeDisplayLabel()` để hiển thị. | `types.ts`, `i18n.ts` (chỉ để lấy nhãn zh) |
| `i18n.ts` | Từ điển song ngữ `vi`/`zh` đầy đủ (mọi chuỗi hiển thị trong toàn app nằm ở đây, KHÔNG hardcode trong component). `getLang()` đọc `?lang=`. `localizeLabel()`/`localizeWeekday()`/`localizeReceivingReason()` tách phần tiếng Việt/Trung khỏi các nhãn đã ghép sẵn "vi - 中文" trong data thô. | `types.ts` (chỉ type) |

Muốn thêm 1 chỉ số/bảng mới → sửa theo thứ tự: `types.ts` (thêm field) →
`regenerate-data.mjs` (nếu cần field mới từ Excel) → `aggregate.ts` (tính) →
`data.ts` (expose qua `get*PageData`) → `i18n.ts` (nhãn) → page/component.

## 3. `scripts/` — vòng đời dữ liệu & vận hành

| File | Vai trò |
|---|---|
| `regenerate-data.mjs` | Script lõi — đọc toàn bộ `.xlsx` nguồn, ghi `src/data/dashboard-data.json`. Xem chi tiết mục 1. |
| `regenerate-and-push.ps1` | Wrapper: chạy `regenerate-data.mjs` rồi `git commit + push` nếu có đổi (để Vercel tự deploy lại). Dùng bởi Scheduled Task, không phải chạy tay. |
| `setup-scheduled-task.ps1` | Tạo Windows Scheduled Task chạy `regenerate-and-push.ps1` mỗi 3 giờ. Chạy 1 lần khi setup máy mới. |
| `screenshot-check.mjs` / `screenshot-remote.mjs` | Chụp ảnh màn hình các trang (Playwright) để kiểm tra UI thủ công/QA — không nằm trong luồng dữ liệu. |

`src/app/api/refresh/route.ts` gọi `node scripts/regenerate-data.mjs` trực tiếp qua
`execFile` (không qua các script `.ps1`) — chỉ chạy được khi có quyền đọc ổ đĩa cục
bộ (`npm run dev`/`start`), luôn lỗi khi deploy Vercel (đã throw message giải thích
rõ, không phải bug).

## 4. `src/app/` — 1 route = 1 trang, đều là async Server Component đọc `searchParams`

Tất cả trang đều: `export const dynamic = "force-dynamic"` (không cache — luôn đọc
JSON mới nhất), gọi đúng 1 hàm `get*PageData`, và render `EmptyState` nếu
`!data.has_data`.

| Route | File | Hàm data | Component chính dùng |
|---|---|---|---|
| `/` (Tổng quan) | `page.tsx` | `getDashboardData` | `StatTile`, `ChartCard`, `KpiTrendLine`, `WeekdayBarChart` |
| `/kpi` | `kpi/page.tsx` | `getDashboardData` | `KpiTrendLine`, `DurationBarChart`, bảng inline |
| `/hieu-suat` | `hieu-suat/page.tsx` | `getDashboardData` | `HBarChart`, `BcTabs` → `PerfTable`, `PerfTable` |
| `/nguyen-nhan` | `nguyen-nhan/page.tsx` | `getReasonPageData` | `KhuFilter`, `HBarChart`, `ReasonBcBreakdown` |
| `/theo-gio` | `theo-gio/page.tsx` | `getHourPageData` | `HourFilters`, `HourFlowChart`, `HourBcDetailTable`/`HourBcPivotTable` |
| `/phat` | `phat/page.tsx` | `getPenaltyPageData` | `KhuFilter`, `StatTile`, `HBarChart`, `PenaltyDailyChart`, `PenaltyBcBreakdown` |
| `/nhan-kien` | `nhan-kien/page.tsx` | `getReceivingPageData` | `StatTile`, `ReceivingTrendLine`, `HBarChart`, `ReceivingBcTabs`, `ReasonBcBreakdown`, `ReceivingSellerTabs`, `SellerReasonBreakdown` |
| mọi trang | `layout.tsx` | `readRawData` (chỉ lấy `generated_at`) | `Sidebar`, `HeaderBrand`, `LanguageSwitcher`, `DateRangeFilter`, `RefreshControl` |
| `POST /api/refresh` | `api/refresh/route.ts` | — | chạy `regenerate-data.mjs`, trả `generated_at` mới |

**Bộ lọc = URL query string, không có state client toàn cục**: `?preset=&from=&to=`
(mọi trang), `?khu=` (nguyen-nhan/phat), `?akhu=&abc=&metric=` (theo-gio, tiền tố
`a` để tách khỏi `khu` dùng ở trang khác nếu share link), `?lang=` (mọi trang).
Đổi filter → các component client (`KhuFilter`, `HourFilters`, `DateRangeFilter`,
`LanguageSwitcher`) tự dựng lại `URLSearchParams` và `router.push()`, trigger
Server Component render lại.

## 5. `src/components/` — top-level (dùng trực tiếp trong pages)

| File | Loại | Vai trò |
|---|---|---|
| `Sidebar.tsx` | client | Menu điều hướng 7 route, thu/phóng (lưu localStorage), giữ nguyên query string khi chuyển trang. |
| `HeaderBrand.tsx` | client | Tiêu đề + badge góc trên trái, đọc `?lang=`. |
| `LanguageSwitcher.tsx` | client | Nút chuyển vi/zh — set/xoá `?lang=`. |
| `DateRangeFilter.tsx` | client | Dropdown 7 preset + custom from/to — component filter phức tạp nhất, dùng `dateRanges.ts`. |
| `RefreshControl.tsx` | client | Nút "Cập nhật ngay" — gọi `POST /api/refresh`, hiện lỗi nếu chạy trên Vercel. |
| `KhuFilter.tsx` | client | Dropdown chọn khu (dùng ở nguyen-nhan, phat). |
| `HourFilters.tsx` | client | 3 dropdown (khu/bc/metric) riêng cho trang theo-gio, có logic reset `abc` khi đổi `akhu`. |
| `ChartCard.tsx` | server (thuần) | Khung bọc mỗi biểu đồ (tiêu đề + note + legend). Export thêm `LegendItem`. |
| `StatTile.tsx` | server (thuần) | Ô số liệu KPI đơn (label + value + icon), `critical` đổi màu đỏ. |
| `EmptyState.tsx` | server (thuần) | Hiển thị khi `has_data === false`. |
| `PerfTable.tsx` | server (thuần) | Bảng hiệu suất theo bc/khu (dùng chung tổng quan + `BcTabs`). |
| `BcTabs.tsx` | client | Tab worst15/best15 bọc quanh `PerfTable`. |
| `ReasonBcBreakdown.tsx` | client | Chọn 1 nguyên nhân (pill) → bảng bc ghi nhận nhiều nhất. Dùng ở nguyen-nhan VÀ nhan-kien (props khác nguồn, cùng shape `ReasonRow`/`ReasonBcRow`). |
| `PenaltyBcBreakdown.tsx` | client | Giống `ReasonBcBreakdown` nhưng cho loại vi phạm + tiền phạt (trang phat). |
| `HourBcDetailTable.tsx` | server (thuần) | Bảng tổng theo bc khi KHÔNG chọn metric cụ thể (trang theo-gio). |
| `HourBcPivotTable.tsx` | server (thuần) | Bảng pivot bc × giờ khi CÓ chọn 1 metric (trang theo-gio) — khác hẳn `HourBcDetailTable`, không tái dùng chung. |
| `ReceivingBcTabs.tsx` / `ReceivingPerfTable.tsx` | client / server | Bản sao của `BcTabs`/`PerfTable` riêng cho shape `ReceivingPerfRow` (trang nhan-kien) — KHÔNG dùng chung generic vì field khác (`thanh_cong`/`huy` thay vì `da_ky_nhan`/`tg_xu_ly_tb_h`). |
| `ReceivingSellerTabs.tsx` / `ReceivingSellerTable.tsx` | client / server | Giống cặp trên nhưng xếp hạng theo seller thay vì bc/khu (trang nhan-kien). |
| `SellerReasonBreakdown.tsx` | client | Giống `ReasonBcBreakdown` nhưng theo seller (trang nhan-kien). |

**Có 3 cặp "Tabs + Table" gần như trùng cấu trúc** (`BcTabs`+`PerfTable`,
`ReceivingBcTabs`+`ReceivingPerfTable`, `ReceivingSellerTabs`+`ReceivingSellerTable`)
và **2 bản "Breakdown chọn theo pill"** gần giống nhau (`ReasonBcBreakdown`,
`PenaltyBcBreakdown`, `SellerReasonBreakdown`) — cố ý KHÔNG gộp generic vì mỗi
trang có field/nhãn i18n hơi khác nhau; nếu sửa 1 cái nhớ kiểm tra có cần sửa các
bản còn lại không.

## 6. `src/components/charts/` — toàn bộ đều `"use client"`, bọc Recharts

| File | Chart | Dữ liệu vào |
|---|---|---|
| `ChartTooltip.tsx` | Tooltip dùng chung cho MỌI chart bên dưới (không phải chart riêng) | `payload` từ Recharts |
| `KpiTrendLine.tsx` | Line: tỷ lệ ký nhận % + tỷ lệ vấn đề % theo ngày | `KpiDailyRow[]` |
| `DurationBarChart.tsx` | Bar: thời gian xử lý TB theo ngày, đỏ nếu >130% TB | `KpiDailyRow[]` |
| `WeekdayBarChart.tsx` | Bar: tỷ lệ ký nhận theo Thứ, đỏ = thấp nhất | `WeekdayRow[]` |
| `HBarChart.tsx` | Bar ngang generic (dùng ở 4 trang: hieu-suat, nguyen-nhan, phat, nhan-kien) — nhận `dataKey`/`categoryKey` linh hoạt | `Record<string, unknown>[]` |
| `HourFlowChart.tsx` | Line 3 đường: pickup/sign/arrival theo giờ | `HourFlowRow[]` |
| `PenaltyDailyChart.tsx` | Bar: tiền phạt theo ngày | `PenaltyDailyRow[]` |
| `ReceivingTrendLine.tsx` | Line: tỷ lệ nhận kiện thành công/hủy theo ngày | `ReceivingDailyRow[]` |

`HBarChart` là chart duy nhất generic/tái dùng thật (ép kiểu
`as unknown as Record<string, unknown>[]` ở nơi gọi); 7 chart còn lại đều
1-trang-1-chart, cố tình không gộp vì trục/field khác nhau.

## 7. Quy ước xuyên suốt (áp dụng khi sửa bất kỳ đâu)

- **Không hardcode chuỗi hiển thị trong component** — luôn thêm vào `i18n.ts`
  (`vi` và `zh` phải khớp field nhau, TypeScript ép qua `typeof vi`).
- **Không tính % hay xếp hạng trong component/page** — luôn ở `aggregate.ts`.
- **Style qua CSS custom properties** (`var(--brand-red)`, `var(--surface)`,
  `var(--text-primary)`...) định nghĩa trong `app/globals.css`, không hardcode màu hex.
- **`"use client"` chỉ khi cần interactivity** (filter, tabs, chart) — bảng tĩnh và
  card thuần hiển thị (`ChartCard`, `StatTile`, `PerfTable`, `EmptyState`,
  `HourBcDetailTable`, `HourBcPivotTable`) cố tình để server component.
- **Ngưỡng khối lượng tối thiểu** (BC≥300, Khu≥1000, Seller≥50) định nghĩa ở
  `aggregate.ts`, lặp lại đúng số ở `i18n.ts` (phần mô tả) — sửa ngưỡng phải sửa cả 2 chỗ.
