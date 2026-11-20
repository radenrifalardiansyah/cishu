import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import {
  normalizePhone, hashPassword, createSessionCookieValue,
  SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE,
} from '@/lib/customerAuth';

interface RegisterBody { name?: string; phone?: string; password?: string }

export async function POST(req: NextRequest) {
  const body: RegisterBody = await req.json().catch(() => ({}));
  const name = (body.name ?? '').toString().trim().slice(0, 100);
  const phone = normalizePhone((body.phone ?? '').toString());
  const password = (body.password ?? '').toString();

  if (!name || phone.length < 10 || phone.length > 15 || password.length < 6 || password.length > 200) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    // Satu statement atomik (bukan select-lalu-insert): dua pendaftaran bersamaan untuk nomor yang
    // sama tidak bisa sama-sama lolos / saling menimpa.
    const sql = getSql();
    const inserted = await sql<{ id: string }[]>`
      insert into storefront_customers (id, name, phone, password_hash, created_at)
      values (${phone}, ${name}, ${phone}, ${hashPassword(password)}, now())
      on conflict do nothing
      returning id
    `;
    if (inserted.length === 0) {
      return NextResponse.json({ error: 'phone_taken' }, { status: 409 });
    }

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
    console.error('[api/auth/register]', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
