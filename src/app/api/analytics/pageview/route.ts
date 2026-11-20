import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/services/analyticsService';

export async function POST(req: NextRequest) {
  try {
    const { path, device, sessionId } = await req.json() as {
      path?: unknown; device?: unknown; sessionId?: unknown;
    };
    // Endpoint publik: tolak path bukan-path dan batasi panjang supaya tabel analytics tidak
    // bisa diisi sampah berukuran besar.
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 200) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await trackPageView(
      path,
      device === 'mobile' ? 'mobile' : 'desktop',
      typeof sessionId === 'string' ? sessionId.slice(0, 64) : undefined,
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[analytics/pageview]', err);
    return NextResponse.json({ ok: false });
  }
}
