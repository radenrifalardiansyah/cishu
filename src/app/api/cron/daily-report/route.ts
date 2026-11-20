import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsStats, PAGE_LABELS } from '@/lib/services/analyticsService';
import { getCachedBranding } from '@/lib/server/branding';
import { getNotifyConfig } from '@/lib/server/notify-config';

export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization') ?? '';
  const secret = process.env.CRON_SECRET ?? '';
  // Fail-closed: tanpa CRON_SECRET endpoint ditolak (sama dengan cron di cishu-admin), bukan dibuka.
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const branding = await getCachedBranding();
  const { apiKey, phone } = await getNotifyConfig(branding.whatsappNumber);
  if (!apiKey) return NextResponse.json({ error: 'no_callmebot_key' }, { status: 500 });

  let stats: Awaited<ReturnType<typeof getAnalyticsStats>>;
  try {
    stats = await getAnalyticsStats(7);
  } catch (err) {
    console.error('[cron/daily-report] stats', err);
    return NextResponse.json({ error: 'stats_failed' }, { status: 500 });
  }
  const { visitors, pageViews, mobile, desktop, pageAgg } = stats;

  const topPages = Object.entries(pageAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count], i) => `${i + 1}. ${PAGE_LABELS[key] ?? key} — ${count}x`)
    .join('\n');

  const date = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const msg =
    `*Rekap ${branding.brandName}*\n` +
    `_${date}_\n\n` +
    `*Pengunjung:* ${visitors}\n` +
    `*Halaman Dibuka:* ${pageViews}\n` +
    `*Mobile:* ${mobile}  |  *Desktop:* ${desktop}\n` +
    (topPages ? `\n*Terpopuler:*\n${topPages}\n` : '') +
    `\n_Rekap otomatis 23.00 WIB_`;

  if (!phone) return NextResponse.json({ error: 'no_notify_phone' }, { status: 500 });

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(msg)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return NextResponse.json({ error: 'callmebot_failed', status: res.status }, { status: 502 });
  } catch (err) {
    console.error('[cron/daily-report] callmebot', err);
    return NextResponse.json({ error: 'callmebot_unreachable' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, views: pageViews, visitors });
}
