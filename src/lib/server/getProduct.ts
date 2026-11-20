import { getSql } from '@/lib/db';
import { buildLiveProducts, isPublished, rawFromDoc } from '@/lib/liveProducts';
import { PRODUCT_SELECT_COLUMNS, rowToProductData, type ProductRow } from '@/lib/server/productRow';
import { Product } from '@/types';

// Lookup produk sisi server (generateMetadata, JSON-LD, sitemap, checkout). Sumber satu-satunya
// adalah tabel Postgres `products` yang dikelola di cishu-admin — tidak ada katalog statis.
// Produk yang di-unpublish admin dianggap tidak ada.

// Saat `next build`, database bisa saja tidak terjangkau; build tidak boleh gagal karenanya.
const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build';

// Satu produk by id. null = tidak ada / tidak dipublikasikan. Saat runtime error database
// DILEMPAR (bukan dianggap "tidak ada") supaya ISR mempertahankan halaman lama alih-alih
// menyimpan 404 palsu; saat build error ditelan jadi null.
export async function getLiveProduct(id: string): Promise<Product | null> {
  try {
    const sql = getSql();
    const [row] = await sql<ProductRow[]>`select ${sql.unsafe(PRODUCT_SELECT_COLUMNS)} from products where id = ${id}`;
    if (!row) return null;
    const raw = rawFromDoc(row.id, rowToProductData(row));
    return isPublished(raw) ? buildLiveProducts([raw])[0] : null;
  } catch (err) {
    console.error('[getLiveProduct]', err);
    if (isBuildPhase()) return null;
    throw err;
  }
}

// Seluruh katalog yang dipublikasikan (urut sesuai admin). Tidak pernah melempar: database
// bermasalah -> daftar kosong (dipakai untuk JSON-LD/sitemap yang tidak boleh menjatuhkan halaman).
export async function getLiveProducts(): Promise<Product[]> {
  try {
    const sql = getSql();
    const rows = await sql<ProductRow[]>`select ${sql.unsafe(PRODUCT_SELECT_COLUMNS)} from products where published`;
    return buildLiveProducts(rows.map(r => rawFromDoc(r.id, rowToProductData(r))));
  } catch (err) {
    console.error('[getLiveProducts]', err);
    return [];
  }
}

// Id produk terpublikasi, untuk generateStaticParams / sitemap. Tidak pernah melempar.
export async function getLiveProductIds(): Promise<string[]> {
  try {
    const sql = getSql();
    const rows = await sql<{ id: string }[]>`select id from products where published`;
    return rows.map(r => r.id);
  } catch (err) {
    console.error('[getLiveProductIds]', err);
    return [];
  }
}
