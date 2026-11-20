import { unstable_cache } from 'next/cache';
import { getSettings } from '@/lib/settings-pg';
import {
  defaultLiveBranding, formatWhatsappDisplay, LiveBranding, normalizeWhatsapp, regionFromCity,
} from '@/lib/branding';

interface SettingsDoc {
  storeName?: string;
  legalName?: string;
  storeTagline?: string;
  storeDescription?: string;
  ownerName?: string;
  logo?: string;
  siteUrl?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  region?: string;
  nib?: string;
  openHours?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  shopeeUrl?: string;
  shopeeName?: string;
  mapsUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  googleSiteVerification?: string;
  storefrontThemeColor?: string;
  storefrontThemeBackgroundColor?: string;
}

function instagramHandleFromUrl(url: string): string {
  const m = url.match(/instagram\.com\/([^/?]+)/i);
  return m?.[1] || '';
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

// Branding is admin-editable via Settings > Info Toko / Kontak & Sosial Media / Tampilan
// & Tema (Postgres `settings` table, sama seperti payment-info — lihat api/payment-info/
// route.ts). Cache 1 jam, tag 'branding'; admin memicu revalidateStorefront('branding')
// lewat POST /api/revalidate setiap kali Settings disimpan (lihat cishu-admin's
// api/settings/route.ts). Fail-open ke default bawaan kalau Postgres error/kosong — brand
// harus tetap tampil walau database lagi bermasalah. Error DILEMPAR dari fungsi ber-cache
// (unstable_cache tidak menyimpan hasil yang melempar) dan baru ditangkap di pembungkus, supaya
// fallback sesaat tidak ikut ter-cache selama 1 jam.
const loadBranding = unstable_cache(
  async (): Promise<LiveBranding> => {
    const fallback = defaultLiveBranding();
    const raw = (await getSettings()) as Record<string, unknown>;
    const s = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, str(v)])) as SettingsDoc;
    const brandName = s.storeName || fallback.brandName;
    const whatsappNumber = normalizeWhatsapp(s.whatsapp || '');
    const instagramUrl = s.instagramUrl || '';
    const city = s.city || '';
    return {
      brandName,
      legalName: s.legalName || brandName,
      tagline: s.storeTagline || '',
      description: s.storeDescription || '',
      ownerName: s.ownerName || '',
      logoUrl: s.logo || fallback.logoUrl,
      siteUrl: (s.siteUrl || fallback.siteUrl).replace(/\/+$/, ''),
      whatsappNumber,
      whatsappDisplay: formatWhatsappDisplay(whatsappNumber),
      whatsappUrl: whatsappNumber ? `https://wa.me/${whatsappNumber}` : '',
      address: s.address || '',
      city,
      region: s.region || regionFromCity(city),
      nib: s.nib || '',
      openHours: s.openHours || '',
      instagramUrl,
      instagramHandle: instagramHandleFromUrl(instagramUrl),
      tiktokUrl: s.tiktokUrl || '',
      shopeeUrl: s.shopeeUrl || '',
      shopeeName: s.shopeeName || brandName,
      mapsUrl: s.mapsUrl || '',
      seoTitle: s.seoTitle || (s.storeTagline ? `${brandName} — ${s.storeTagline}` : brandName),
      seoDescription: s.seoDescription || s.storeDescription || s.storeTagline || '',
      seoKeywords: (s.seoKeywords || '').split(/[,\n]/).map(k => k.trim()).filter(Boolean),
      googleSiteVerification: s.googleSiteVerification || '',
      themeColor: s.storefrontThemeColor || fallback.themeColor,
      themeBackgroundColor: s.storefrontThemeBackgroundColor || fallback.themeBackgroundColor,
    };
  },
  ['public-branding-v3'],
  { revalidate: 3600, tags: ['branding'] }
);

export async function getCachedBranding(): Promise<LiveBranding> {
  try {
    return await loadBranding();
  } catch (err) {
    console.error('[getCachedBranding]', err);
    return defaultLiveBranding();
  }
}
