import type { MetadataRoute } from 'next';
import { getLiveProductIds } from '@/lib/server/getProduct';
import { getCachedBranding } from '@/lib/server/branding';

// Dihasilkan saat build + dirender ulang berkala: daftar produk dibaca dari database, dan
// kalau database tidak terjangkau sitemap tetap jadi (hanya halaman statis).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ siteUrl }, productIds] = await Promise.all([getCachedBranding(), getLiveProductIds()]);
  const now = new Date();

  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...productIds.map(id => ({
      url: `${siteUrl}/products/${encodeURIComponent(id)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/lapak`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${siteUrl}/panduan`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
