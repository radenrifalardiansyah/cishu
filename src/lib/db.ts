import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | undefined;

// Singleton pooled connection ke Supabase Postgres (transaction-mode pooler, port 6543) — sama
// persis dengan cishu-admin/src/lib/db.ts (database yang sama, dua deployment Vercel
// terpisah). Reuse across warm serverless invocations supaya tidak buka koneksi baru tiap request.
export function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL belum di-set');
    sql = postgres(url, {
      prepare: false, // pgbouncer transaction mode tidak support prepared statements
      // Lihat catatan panjang di cishu-admin/src/lib/db.ts: `max: 1` terbukti bikin
      // request hang tanpa batas waktu lewat PgBouncer transaction-mode Supabase (pipelining
      // postgres.js macet total). `max: 5` terbukti aman & jauh lebih hemat dibanding default 10.
      max: 5,
      // Database tak terjangkau harus gagal cepat (build/ISR/request), bukan menggantung.
      connect_timeout: 10,
    });
  }
  return sql;
}

// Lewat Supabase pooler (pgbouncer transaction mode), kolom jsonb kadang balik sebagai string JSON
// mentah alih-alih object/array ter-parse otomatis (quirk pooler, bukan hal yang bisa diandalkan) —
// dipakai di setiap tempat yang baca kolom jsonb (mis. `products.details`/`products.image_urls`).
export function parseJsonb<T>(value: T | string | null): T | null {
  if (value === null) return null;
  return typeof value === 'string' ? JSON.parse(value) as T : value;
}
