import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'crypto';

// Dipanggil cishu-admin (lib/revalidate.ts) tepat setelah menulis ke database, supaya cache
// produk/kategori/branding/statistik storefront tidak menunggu TTL-nya habis.
// Autentikasi: header `Authorization: Bearer <REVALIDATE_SECRET>` (env sama di kedua project).
const VALID_TAGS = ['products', 'categories', 'stats', 'payment-info', 'branding', 'lapak'] as const;
type ValidTag = typeof VALID_TAGS[number];

function isAuthed(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET ?? '';
  if (!secret) return false;
  const given = Buffer.from(req.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  type Body = { tag?: string; tags?: string[] };
  const body: Body = await req.json().catch(() => ({}));
  const requested: string[] = Array.isArray(body.tags) ? body.tags : body.tag ? [body.tag] : [];
  const tags = requested.filter((t): t is ValidTag => VALID_TAGS.includes(t as ValidTag));

  if (tags.length === 0) {
    return NextResponse.json({ error: 'no_valid_tag', validTags: VALID_TAGS }, { status: 400 });
  }

  // { expire: 0 } = revalidate immediately (matches pre-v16 single-arg behavior);
  // a bare tag with no profile now only logs a deprecation warning in this Next version.
  tags.forEach(tag => revalidateTag(tag, { expire: 0 }));

  // Beranda dan halaman produk membaca Postgres langsung di bawah jendela ISR (bukan lewat
  // unstable_cache), jadi perlu revalidatePath juga.
  if (tags.includes('products')) {
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/products/[id]', 'page');
  }
  // Branding dipakai metadata/JSON-LD/manifest di hampir semua halaman (nama, logo, warna tema):
  // tanpa ini halaman ISR tetap menyajikan brand lama sampai jendelanya habis.
  if (tags.includes('branding')) {
    revalidatePath('/', 'layout');
  }

  return NextResponse.json({ revalidated: true, tags });
}
