import { NextRequest, NextResponse } from 'next/server';

// CORS hanya untuk endpoint yang memang dibuka lintas origin: invoice publik (link ber-token) dan
// /api/revalidate (dipanggil server-ke-server oleh cishu-admin, tetap dilindungi REVALIDATE_SECRET).
// Route /api/admin/* lama sudah dihapus — panel admin kini aplikasi terpisah (cishu-admin).
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  process.env.ADMIN_ORIGIN ?? '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age':       '86400',
};

export function proxy(req: NextRequest) {
  // Handle preflight OPTIONS — browser sends this before POST from cross-domain
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // Pass through, tambahkan CORS headers ke semua response
  const res = NextResponse.next();
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: ['/api/invoice/:path*', '/api/revalidate/:path*'],
};
