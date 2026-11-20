import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getSql, parseJsonb } from '@/lib/db';

// Angka "terjual" & rating yang ditampilkan di beranda — dihitung dari pesanan
// selesai (website & kasir online) plus rekap penjualan mitra konsinyasi, dan
// ulasan yang sudah disetujui admin, bukan angka tetap lagi. Cache 1 jam
// (lebih longgar dari /api/products) karena statistik ini tidak perlu real-time;
// admin app bisa memanggil POST /api/revalidate dengan tag "stats" untuk
// memperbarui lebih cepat setelah menyetujui ulasan atau menyelesaikan pesanan.
// Statistik hanya menghitung data yang dibuat pada/setelah tanggal ini (WIB), supaya riwayat
// penjualan dari database yang diduplikasi tidak ikut tampil. Atur lewat env STATS_SINCE
// (format ISO, mis. 2026-11-20T00:00:00+07:00); default = hari rebrand Cishu.
const DEFAULT_STATS_SINCE = '2026-11-20T00:00:00+07:00';
function statsSince(): Date {
  const d = new Date(process.env.STATS_SINCE || DEFAULT_STATS_SINCE);
  return Number.isNaN(d.getTime()) ? new Date(DEFAULT_STATS_SINCE) : d;
}

const getCachedStats = unstable_cache(
  async () => {
    const sql = getSql();
    const since = statsSince();

    // `orders` pindah ke Postgres (Tahap 12 migrasi Fase 2 — lihat plan gleaming-wondering-quokka.md).
    // Pesanan website selesai berstatus 'selesai'; pesanan kasir online lama tidak pernah berubah
    // dari 'done' (bug lama di admin app, sudah dinormalisasi saat backfill — 'done' tetap dicek
    // di sini untuk jaga-jaga).
    const orderRows = await sql<{ items: unknown }[]>`select items from orders where status in ('selesai', 'done') and created_at >= ${since}`;
    const orderSoldCount = orderRows.reduce((sum, r) => {
      const items = (parseJsonb(r.items) as { qty?: number }[] | null) ?? [];
      return sum + items.reduce((s, it) => s + (it.qty ?? 0), 0);
    }, 0);

    // Penjualan mitra konsinyasi (konsinyasi) direkap terpisah di consignment_recaps (Postgres,
    // Tahap 13 migrasi Fase 2), dengan total_sold sudah berupa jumlah unit terjual per rekap.
    const [{ sold }] = await sql<{ sold: string | null }[]>`select coalesce(sum(total_sold), 0) as sold from consignment_recaps where created_at >= ${since}`;
    const recapSoldCount = Number(sold) || 0;

    const soldCount = orderSoldCount + recapSoldCount;

    const reviewRows = await sql<{ rating: number | null }[]>`select rating from reviews where approved = true and created_at >= ${since}`;
    const ratings = reviewRows.map(r => r.rating ?? 0).filter(r => r >= 1 && r <= 5);
    const rating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    return { soldCount, reviewCount: ratings.length, rating };
  },
  ['public-stats', process.env.STATS_SINCE ?? DEFAULT_STATS_SINCE],
  { revalidate: 3600, tags: ['stats'] }
);

export async function GET() {
  try {
    const stats = await getCachedStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[api/stats/public]', err);
    return NextResponse.json({ soldCount: 0, reviewCount: 0, rating: null });
  }
}
