import { getSettings } from '@/lib/settings-pg';
import { normalizeWhatsapp } from '@/lib/branding';

// Konfigurasi notifikasi WhatsApp (CallMeBot). Prioritas: Pengaturan admin (settings.main:
// `callmebotApiKey`, `notifyPhone`) → env (CALLMEBOT_API_KEY, NOTIFY_PHONE) → nomor WhatsApp toko
// (khusus nomor tujuan). Sengaja TIDAK lewat getCachedBranding/endpoint publik: API key rahasia
// dan hanya boleh dibaca di server. Dipanggil jarang (rekap harian + pengunjung baru ber-rate-limit),
// jadi dibaca langsung tanpa cache supaya perubahan di admin langsung berlaku.
export async function getNotifyConfig(fallbackPhone: string): Promise<{ apiKey: string; phone: string }> {
  let s: { callmebotApiKey?: unknown; notifyPhone?: unknown } = {};
  try {
    s = (await getSettings()) as typeof s;
  } catch (err) {
    console.error('[notify-config] settings', err); // DB gagal: tetap jalan dengan env
  }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const apiKey = str(s.callmebotApiKey) || (process.env.CALLMEBOT_API_KEY ?? '').trim();
  const phone = normalizeWhatsapp(str(s.notifyPhone))
    || (process.env.NOTIFY_PHONE ?? '').trim()
    || fallbackPhone;
  return { apiKey, phone };
}
