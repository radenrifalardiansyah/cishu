'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Instagram, MessageCircle } from 'lucide-react';
import { DEVELOPER } from '@/lib/branding';
import { useLiveBranding } from '@/lib/useLiveBranding';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLiveProducts } from '@/lib/useLiveProducts';
import { useLiveCategories } from '@/lib/useLiveCategories';

export default function Footer({ fullOnMobile = false }: { fullOnMobile?: boolean }) {
  const { t, locale } = useLanguage();
  const branding = useLiveBranding();
  const [brandFirstWord, ...brandRestWordsArr] = branding.brandName.split(' ');
  const brandRestWords = brandRestWordsArr.join(' ') || brandFirstWord;
  const products = useLiveProducts();
  const liveCategories = useLiveCategories();
  const footerDesc = branding.description || branding.tagline;

  const quickLinks = [
    { href: '/', label: t.footer.links.home },
    { href: '/products', label: t.footer.links.products },
    { href: '/panduan', label: t.footer.links.guide },
  ];

  // Kategori dari koleksi admin (data master); hanya yang punya produk.
  const hasAddress = Boolean(branding.address || branding.city);
  const hasContact = hasAddress
    || Boolean(branding.whatsappUrl && branding.whatsappDisplay)
    || Boolean(branding.instagramUrl && branding.instagramHandle)
    || Boolean(branding.openHours);
  const categories = liveCategories
    .filter(c => products.some(p => p.category === c.id))
    .map(c => ({ emoji: c.emoji || '🏷️', label: c.name, href: `/products?category=${c.id}` }));
  return (
    <>
    <footer className={`relative bg-brand-800 overflow-hidden ${fullOnMobile ? 'block' : 'hidden md:block'}`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 md:py-14 max-md:pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-brand-700/60 shadow-lg flex-shrink-0">
                <Image src={branding.logoUrl} alt={branding.brandName} fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-brand-200 leading-none">{brandFirstWord}</p>
                <p className="font-display text-base font-bold text-brand-ice leading-none">{brandRestWords}</p>
              </div>
            </div>
            {footerDesc && (
              <p className="mb-5 max-w-xs text-brand-50 text-sm leading-relaxed line-clamp-3">
                {footerDesc}
              </p>
            )}
            <div className="flex gap-3">
              {branding.whatsappUrl && <a
                href={branding.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center text-white border border-green-400 hover:bg-green-400 transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>}
              {branding.instagramUrl && <a
                href={branding.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white border border-pink-400 hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                aria-label={`Instagram @${branding.instagramHandle}`}
              >
                <Instagram size={16} />
              </a>}
              {branding.shopeeUrl && <a
                href={branding.shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center border border-brand-400 hover:bg-brand-400 transition-all"
                aria-label={`Shopee ${branding.shopeeName}`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C9.8 2 8 3.8 8 6H4.5C3.7 6 3 6.6 3 7.4L2 19.4C1.9 20.3 2.6 21 3.5 21H20.5C21.4 21 22.1 20.3 22 19.4L21 7.4C21 6.6 20.3 6 19.5 6H16C16 3.8 14.2 2 12 2ZM12 3.5C13.4 3.5 14.5 4.6 14.5 6H9.5C9.5 4.6 10.6 3.5 12 3.5Z" fill="#EE4D2D"/>
                  <circle cx="8.5" cy="12" r="1.5" fill="#EE4D2D"/>
                  <circle cx="15.5" cy="12" r="1.5" fill="#EE4D2D"/>
                </svg>
              </a>}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display font-bold text-brand-100 mb-4 text-sm">{t.footer.navigation}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-50 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-700 group-hover:bg-brand-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          {categories.length > 0 && <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h4 className="font-display font-bold text-brand-100 mb-4 text-sm">{t.footer.categoriesTitle}</h4>
            <ul className="space-y-2.5">
              {categories.map(cat => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="text-brand-50 hover:text-white text-sm transition-colors flex items-center gap-2"
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-display font-bold text-brand-100 mb-4 text-sm">{t.footer.contact}</h4>
            {hasContact ? (
              <ul className="space-y-3">
                {hasAddress && (
                  <li className="flex items-start gap-2.5">
                    <MapPin size={14} className="text-brand-100 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-brand-50 text-sm leading-snug">
                        {branding.address}
                        {branding.address && branding.city && <br />}
                        {branding.city}
                      </p>
                      {branding.mapsUrl && (
                        <a
                          href={branding.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-brand-200 hover:text-white transition-colors"
                        >
                          <MapPin size={10} aria-hidden="true" />
                          {t.footer.mapsLink}
                        </a>
                      )}
                    </div>
                  </li>
                )}
                {branding.whatsappUrl && branding.whatsappDisplay && (
                  <li className="flex items-center gap-2.5">
                    <Phone size={14} className="text-brand-100 flex-shrink-0" aria-hidden="true" />
                    <a href={branding.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-brand-50 hover:text-white text-sm transition-colors">
                      {branding.whatsappDisplay}
                    </a>
                  </li>
                )}
                {branding.instagramUrl && branding.instagramHandle && (
                  <li className="flex items-center gap-2.5">
                    <Instagram size={14} className="text-brand-100 flex-shrink-0" aria-hidden="true" />
                    <a href={branding.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-brand-50 hover:text-white text-sm transition-colors">
                      @{branding.instagramHandle}
                    </a>
                  </li>
                )}
                {branding.openHours && (
                  <li className="flex items-center gap-2.5">
                    <Clock size={14} className="text-brand-100 flex-shrink-0" aria-hidden="true" />
                    <span className="text-brand-50 text-sm">{branding.openHours}</span>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-brand-50 text-sm">Informasi kontak segera tersedia.</p>
            )}
          </motion.div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-600/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center sm:items-start gap-0.5">
            <p className="text-brand-50 text-sm">{t.footer.copyright(branding.brandName)}</p>
            <p className="text-brand-200 text-xs leading-snug">
              {locale === 'en' ? 'Developed by ' : 'Dikembangkan oleh '}
              <a
                href={DEVELOPER.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-200 hover:text-white transition-colors"
              >
                {DEVELOPER.name}
              </a>
              {locale === 'en' ? ` · supported by ${DEVELOPER.supportedBy}` : ` · didukung oleh ${DEVELOPER.supportedBy}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-brand-50 text-sm">
            <span>{t.footer.madeWith}</span>
            <span className="text-red-400">♥</span>
            <span>{t.footer.madeFrom}</span>
          </div>
        </div>
      </div>
    </footer>

    {!fullOnMobile && (
      <div className="footer-strip block md:hidden bg-brand-800 border-t border-brand-700/50 px-4 pt-3 pb-[calc(5rem+env(safe-area-inset-bottom))] text-center">
        <p className="text-brand-50 text-xs mb-1">{t.footer.copyright(branding.brandName)}</p>
        <p className="text-[11px] leading-snug mt-0.5">
          <span className="text-brand-200">{locale === 'en' ? 'Developed by ' : 'Dikembangkan oleh '}</span>
          <a
            href={DEVELOPER.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-200 hover:text-white transition-colors underline underline-offset-2"
          >
            {DEVELOPER.name}
          </a>
          <span className="block text-brand-200">{locale === 'en' ? `supported by ${DEVELOPER.supportedBy}` : `didukung oleh ${DEVELOPER.supportedBy}`}</span>
        </p>
      </div>
    )}
    </>
  );
}
