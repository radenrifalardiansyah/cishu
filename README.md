# Cishu Bite 'n Sip — Storefront

Website toko online **Cishu Bite 'n Sip**. Katalog produk, kategori, branding (nama, logo, kontak, tema, SEO), dan
rekening pembayaran **sepenuhnya diatur dari panel admin** ([cishu-admin](../cishu-admin)); tidak ada produk atau
identitas toko yang di-hardcode di repo ini. Dua aplikasi memakai **database Postgres (Supabase) yang sama**.

Deploy: Vercel project `cishu` — repo `radenrifalardiansyah/cishu`.

## Tech stack

- Next.js 16 (App Router, `proxy.ts`) + React 19 + TypeScript
- Tailwind CSS 3, Framer Motion, lucide-react, react-hot-toast
- Zustand (keranjang, persisted ke localStorage `cishu-cart`)
- `postgres` (Supabase pooler) untuk data; `firebase-admin` hanya untuk notifikasi admin & verifikasi Google Sign-In
- Cloudinary untuk bukti pembayaran; `@react-pdf/renderer` untuk invoice PDF

> Versi Next.js ini punya breaking changes. Baca `node_modules/next/dist/docs/` sebelum menulis kode Next.js (lihat AGENTS.md).

## Alur data

| Data | Sumber | Cache / revalidate |
|------|--------|--------------------|
| Produk (`/api/products`, beranda, `/products/[id]`, sitemap) | tabel `products` (hanya `published`) | 5 menit, tag `products` |
| Kategori (`/api/categories`) | tabel `categories` | 5 menit, tag `categories` |
| Branding, manifest PWA, SEO | `settings` (`main`) | 1 jam, tag `branding` |
| Rekening & QRIS (`/api/payment-info`) | `settings` | 1 jam, tag `payment-info` |
| Statistik terjual/rating | `orders`, `reviews`, `consignment_recaps` | 1 jam, tag `stats` |
| Lapak (`/api/lapak`) | `stalls`, stok lapak | 60 detik, tag `lapak` |

cishu-admin memanggil `POST /api/revalidate` (header `Authorization: Bearer $REVALIDATE_SECRET`, body `{ "tag": "products" }`)
setiap kali data berubah. Tag valid: `products`, `categories`, `stats`, `payment-info`, `branding`, `lapak`.

## Pesanan

1. Pelanggan login (HP + password, atau Google) -> `POST /api/checkout` (harga & stok selalu divalidasi ulang dari database, bukan dari browser).
2. Pesanan masuk tabel `orders` (`source = 'portal'`, `status = 'baru'`, `payment_status = 'belum_lunas'`) dan muncul di menu Pesanan admin.
3. `/pesanan/[id]/bayar`: pelanggan memilih metode, upload bukti (`/api/upload-payment-proof` -> Cloudinary), lalu `PATCH /api/orders/[id]`.
4. Pelanggan dapat membatalkan selama belum dibayar/diproses (`POST /api/orders/[id]/cancel`).
5. Batas bayar 24 jam (`src/lib/order-expiry.ts`, harus sama dengan `UNPAID_ORDER_EXPIRY_HOURS` di admin): pesanan portal yang belum
   dibayar dibatalkan otomatis oleh cron di cishu-admin.

Status tampilan pelanggan diturunkan dari `status` + `fulfillment_status` (`src/lib/order-display-status.ts`).

## Environment

Salin `.env.example` ke `.env.local` (atau `vercel env pull .env.local`). Variabel penting:
`DATABASE_URL`, `SESSION_SECRET` (wajib, fail-closed), `REVALIDATE_SECRET`, `CRON_SECRET`, `FIREBASE_SERVICE_ACCOUNT`,
`CLOUDINARY_*`. Jangan commit `.env.local`.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Struktur

```
src/
├── app/            # halaman + route handler (api/*), sitemap, robots, manifest
├── components/     # komponen UI
├── contexts/       # AuthContext, LanguageContext
├── lib/            # db, branding, produk live, auth pelanggan, voucher, PDF invoice, i18n
│   └── server/     # akses data sisi server (branding, produk, voucher)
└── types/
```

Cron (`vercel.json`): `/api/cron/daily-report` pukul 16.00 UTC (23.00 WIB), dilindungi `CRON_SECRET`.
