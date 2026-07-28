# J&T Same Day — Ops Dashboard

Dashboard vận hành nhiều trang (Next.js + Recharts, theme đỏ-trắng J&T Express)
tổng hợp dữ liệu chi tiết vận đơn Same Day (sheet `data` trong các file export
hằng ngày `data/raw/sameday/*.xlsx`).

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Cập nhật dữ liệu

Dữ liệu hiển thị nằm ở `src/data/dashboard-data.json`, được sinh ra bởi:

```bash
npm run regenerate
```

Script `scripts/regenerate-data.mjs` quét toàn bộ file `.xlsx` trong
`D:\Claude CODE\data\raw\sameday` (đổi qua biến môi trường `SAMEDAY_RAW_DIR`
nếu cần), đọc sheet `data`, tính lại KPI/funnel/nguyên nhân/hiệu suất
bưu cục-khu/giờ, rồi ghi đè `src/data/dashboard-data.json`.

- **Nút "Cập nhật ngay"** trên giao diện gọi API `/api/refresh`, chạy đúng
  script trên rồi làm mới trang — **chỉ hoạt động khi chạy `npm run dev`/`npm
  start` trên máy có quyền truy cập thư mục `data/raw/sameday`**. Khi deploy
  lên Vercel, nút này sẽ báo lỗi vì Vercel không có quyền đọc ổ đĩa cục bộ của
  bạn — đây là giới hạn của mọi nền tảng hosting đám mây, không phải lỗi.
- **Tự động 3 giờ/lần**: xem hướng dẫn đặt Windows Task Scheduler bên dưới.

## Deploy lên Vercel (qua GitHub)

Vercel không đọc được ổ đĩa cục bộ, nên "tự động cập nhật" trên bản deploy
public hoạt động theo cơ chế: **script cục bộ tái tạo dữ liệu → commit → push
GitHub → Vercel tự deploy lại mỗi khi có push** (đây là hành vi mặc định của
Vercel với repo đã kết nối).

1. Tạo repo GitHub mới (khuyến nghị **Private** vì `src/data/dashboard-data.json`
   chứa số liệu vận hành nội bộ — khối lượng đơn, hiệu suất từng bưu cục/khu).
2. Trong thư mục này:
   ```bash
   git remote add origin <URL_REPO_GITHUB_CUA_BAN>
   git branch -M main
   git push -u origin main
   ```
3. Vào https://vercel.com/new, chọn "Import Git Repository", trỏ tới repo vừa
   tạo. Vercel tự nhận diện Next.js, không cần cấu hình gì thêm. Bấm Deploy.
4. Từ lần push tiếp theo trở đi, Vercel tự động build & deploy lại.

## Tự động quét dữ liệu mới mỗi 3 giờ (Windows Task Scheduler)

Xem `scripts/setup-scheduled-task.ps1` — script này tạo 1 Scheduled Task chạy
`scripts/regenerate-and-push.ps1` mỗi 3 giờ (quét dữ liệu mới; nếu đã kết nối
GitHub thì tự commit + push để Vercel deploy lại).
