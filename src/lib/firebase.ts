import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export { FieldValue };

// Service account JSON yang ditempel ke dashboard env (Vercel) sering membawa newline asli di
// dalam string `private_key`, yang tidak valid untuk JSON.parse ("Bad control character").
// Coba apa adanya dulu; kalau gagal, escape karakter kontrol hanya di dalam literal string.
function parseServiceAccount(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const fixed = raw.replace(/"(?:[^"\\]|\\.)*"/g, (s) =>
      s.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
    );
    return JSON.parse(fixed) as Record<string, unknown>;
  }
}

function ensureApp() {
  const raw    = process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}';
  const parsed = parseServiceAccount(raw);

  if (!getApps().length && parsed.project_id) {
    initializeApp({ credential: cert(parsed as Parameters<typeof cert>[0]) });
  }
}

export function getDb() {
  ensureApp();
  return getFirestore();
}

// Used to verify the Firebase ID token a client gets from signInWithPopup(googleProvider)
// — see src/app/api/auth/google/route.ts. Same underlying app/credential as getDb().
// Dynamic import (not a top-level one) so routes that only need getDb() — i.e. almost
// every API route — don't bundle firebase-admin/auth's jwks-rsa/jose dependency chain,
// which fails to load under Vercel's Turbopack build (ERR_REQUIRE_ESM) and was taking
// down every route that merely imported this file.
export async function getAuthAdmin() {
  ensureApp();
  const { getAuth } = await import('firebase-admin/auth');
  return getAuth();
}
