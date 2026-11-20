import { NextRequest, NextResponse } from 'next/server';
import { getCachedBranding } from '@/lib/server/branding';
import { getNotifyConfig } from '@/lib/server/notify-config';

const PAGE_LABELS: Record<string, string> = {
  '/':          'Beranda',
  '/products':  'Menu Produk',
  '/lapak':     'Lapak',
  '/panduan':   'Panduan',
  '/kontak':    'Kontak',
  '/checkout':  'Checkout',
};

function getPageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/products/')) return `Detail Produk`;
  return path;
}

// Pembatas frekuensi sederhana (in-memory per instance serverless — cukup untuk meredam spam WA,
// bukan jaminan global): satu notifikasi per pengunjung per jam + batas total per jam.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const seen = new Map<string, number>();
let windowStart = Date.now();
let sentInWindow = 0;

function allowNotify(key: string): boolean {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) { windowStart = now; sentInWindow = 0; }
  for (const [k, t] of seen) if (now - t > WINDOW_MS) seen.delete(k);
  if (seen.has(key) || sentInWindow >= MAX_PER_WINDOW) return false;
  seen.set(key, now);
  sentInWindow++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    // Endpoint publik yang memicu pesan WhatsApp: paksa string pendek (tanpa kontrol karakter)
    // supaya isi pesan tidak bisa disusupi/dibengkakkan oleh pemanggil.
    const clean = (v: unknown, max: number) => (typeof v === 'string' ? v : '').replace(/[\r\n\t]+/g, ' ').slice(0, max);
    const device = clean(body.device, 40), page = clean(body.page, 200);
    const browser = clean(body.browser, 60), ref = clean(body.ref, 200);

    // Kunci pengunjung: sessionId bila dikirim klien, selain itu IP + user-agent.
    const sid = clean(body.sessionId, 64);
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const key = sid || `${ip}|${req.headers.get('user-agent') ?? ''}`.slice(0, 200);
    if (!allowNotify(key)) return NextResponse.json({ ok: true, skipped: 'rate_limited' });

    const branding = await getCachedBranding();
    const { apiKey, phone } = await getNotifyConfig(branding.whatsappNumber);

    if (!apiKey || !phone) return NextResponse.json({ ok: false, reason: 'no_key' });

    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day:     '2-digit',
      month:   'short',
      year:    'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
    });

    const refLine = ref && ref !== '(langsung)' ? `\nDari: ${ref}` : '';

    const text =
      `*Pengunjung Baru — ${branding.brandName}*\n\n` +
      `${device}\n` +
      `Browser: ${browser}\n` +
      `Halaman: ${getPageLabel(page)}` +
      refLine +
      `\n${now} WIB`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

    await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
