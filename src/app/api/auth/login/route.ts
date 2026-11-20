import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import {
  normalizePhone, verifyPassword, createSessionCookieValue,
  SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE,
} from '@/lib/customerAuth';

interface LoginBody { phone?: string; password?: string }

export async function POST(req: NextRequest) {
  const body: LoginBody = await req.json().catch(() => ({}));
  const phone = normalizePhone((body.phone ?? '').toString());
  const password = (body.password ?? '').toString();

  if (!phone || !password || password.length > 200) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    const sql = getSql();
    const [row] = await sql<{ name: string; password_hash: string | null }[]>`
      select name, password_hash from storefront_customers where id = ${phone}
    `;
    if (!row || !row.password_hash || !verifyPassword(password, row.password_hash)) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const name = row.name ?? '';
    const res = NextResponse.json({ ok: true, customer: { id: phone, name, phone } });
    res.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(phone), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[api/auth/login]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
