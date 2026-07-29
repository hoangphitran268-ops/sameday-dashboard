@AGENTS.md

# CLAUDE.md — sameday-dashboard

Dashboard vận hành SAME DAY (Next.js App Router + Recharts, song ngữ vi/zh, theme
đỏ-trắng J&T). Đọc thẳng file `.xlsx` export hằng ngày trong
`D:\Claude CODE\data\raw\sameday\` — **độc lập với pipeline Python** ở
`D:\Claude CODE\CLAUDE.md` (CSV master `data\db\`), dù dùng chung thư mục nguồn.

**Bản đồ chi tiết từng file/quan hệ import: xem [CODEMAP.md](./CODEMAP.md)** —
đọc file đó khi cần sửa 1 luồng cụ thể, không cần đọc lại source.

## Luồng dữ liệu (tóm tắt — chi tiết ở CODEMAP.md §1)

```
data/raw/sameday/*.xlsx  →  scripts/regenerate-data.mjs  →  src/data/dashboard-data.json
   →  src/lib/data.ts (đọc + parse searchParams)  →  src/lib/aggregate.ts (tính %, xếp hạng)
   →  src/app/*/page.tsx (Server Component)  →  src/components/**
```

- Cập nhật dữ liệu: `npm run regenerate`, nút "Cập nhật ngay" (chỉ chạy được local,
  Vercel không đọc được ổ đĩa cục bộ), hoặc cron 3h qua Windows Task Scheduler
  (`scripts/setup-scheduled-task.ps1`).
- 3 nguồn dữ liệu trong `regenerate-data.mjs` dùng 3 quy ước "ngày N" khác nhau
  (export hằng ngày / Phạt Khâu Nhận / Nhận kiện) — xem chú thích trong file đó
  trước khi sửa logic ngày tháng.

## Quy ước bắt buộc khi sửa code

- Chuỗi hiển thị → `src/lib/i18n.ts` (cả `vi` và `zh`), không hardcode trong component.
- Tính %/xếp hạng → `src/lib/aggregate.ts`, không tính trong component/page.
- Màu/style → CSS custom properties (`var(--brand-red)`...) trong `globals.css`.
- Bộ lọc là URL searchParams (`?preset=&from=&to=&khu=&lang=`...), không dùng state
  client toàn cục — xem CODEMAP.md §4.
- Vẽ biểu đồ MỚI (ngoài các chart đã có trong `components/charts/`) → gọi skill
  `dataviz` trước khi viết code.

## Lệnh thường dùng

```bash
npm run dev         # http://localhost:3000
npm run regenerate   # quét lại data/raw/sameday -> dashboard-data.json
npm run build / start
```

Chi tiết deploy Vercel + auto-push: xem `README.md`.
