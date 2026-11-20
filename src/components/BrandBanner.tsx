'use client';

import Image from 'next/image';
import { useLiveBranding } from '@/lib/useLiveBranding';

// Banner bawaan halaman produk saat kategori aktif tidak punya banner dari admin:
// permukaan pastel palet logo + nama dan tagline toko (data dari branding admin).
export default function BrandBanner() {
  const branding = useLiveBranding();

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-md mb-8 flex items-center gap-4 sm:gap-6 px-5 sm:px-10 py-6 sm:py-8 min-h-[128px] sm:min-h-[176px]"
      style={{
        color: 'var(--ink-navy)',
        background:
          'radial-gradient(420px 320px at 100% 100%, rgb(var(--brand-lime) / 0.85), transparent 65%), radial-gradient(480px 360px at 0 0, rgb(var(--brand-sky) / 0.9), transparent 70%), linear-gradient(155deg, rgb(var(--brand-sky)) 0%, rgb(var(--brand-ice)) 55%, rgb(var(--brand-mint)) 100%)',
      }}
    >
      <span aria-hidden="true" className="splash-bubble" style={{ width: 140, height: 140, top: '-18%', right: '4%' }} />
      <span aria-hidden="true" className="splash-cube" style={{ width: 36, height: 36, bottom: '14%', right: '22%', animationDelay: '-4s' }} />

      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg" style={{ border: '2px solid rgba(255,255,255,0.8)' }}>
        <Image src={branding.logoUrl} alt="" fill sizes="96px" className="object-cover" />
      </div>
      <div className="relative min-w-0">
        <p className="font-display text-xl sm:text-3xl font-extrabold leading-tight">{branding.brandName}</p>
        {branding.tagline && (
          <p className="text-sm sm:text-base mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{branding.tagline}</p>
        )}
      </div>
    </div>
  );
}
