'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLiveProductsState } from '@/lib/useLiveProducts';
import { useReviewStats } from '@/lib/useReviewStats';
import { useLiveBranding } from '@/lib/useLiveBranding';
import { useLiveCategories } from '@/lib/useLiveCategories';

// Permukaan kartu produk: pastel palet logo, bergilir per slide (dekoratif, bukan data produk).
const slideSurfaces = [
  'from-brand-ice to-brand-lime',
  'from-brand-lime to-brand-mint',
  'from-brand-sky to-brand-ice',
  'from-brand-mint to-brand-ice',
];

const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

export default function Hero() {
  const { t } = useLanguage();
  const branding = useLiveBranding();
  const { products: liveProducts, loading: productsLoading } = useLiveProductsState();
  const catalogEmpty = !productsLoading && liveProducts.length === 0;
  const liveCategories = useLiveCategories();
  const { soldCount, reviewCount, rating } = useReviewStats();

  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  // Slider diisi langsung dari katalog (database bersama dengan admin): produk berfoto, maksimal 6.
  const slides = liveProducts
    .filter(p => p.images?.length)
    .slice(0, 6)
    .map((product, i) => ({
      id: product.id,
      image: product.images![0],
      name: product.name,
      weight: product.weight,
      price: formatPrice(product.price),
      badge: product.badge,
      surface: slideSurfaces[i % slideSurfaces.length],
    }));
  const slide = slides[Math.min(current, Math.max(slides.length - 1, 0))];

  const [brandFirstWord, ...brandRestWordsArr] = branding.brandName.split(' ');
  const brandRestWords = brandRestWordsArr.join(' ');
  const headline = branding.tagline || branding.description;

  const categoryChips = liveCategories
    .filter(c => liveProducts.some(p => p.category === c.id))
    .slice(0, 4);

  const cheapestPriceOverall = () => {
    const prices = liveProducts.map(p => p.price).filter(p => p > 0);
    return prices.length ? formatPrice(Math.min(...prices)) : '';
  };
  const cheapest = cheapestPriceOverall();

  const stats = [
    ...(soldCount > 0 ? [{ value: `${soldCount}`, label: t.hero.stats.sold, icon: '📦' }] : []),
    ...(reviewCount > 0 ? [{ value: `${rating?.toFixed(1)}★`, label: t.hero.stats.rating, icon: '⭐' }] : []),
    ...(liveProducts.length > 0 ? [{ value: `${liveProducts.length}`, label: t.hero.stats.variants, icon: '🛒' }] : []),
    ...((branding.region || branding.city) ? [{ value: branding.region || branding.city, label: t.hero.stats.location, icon: '📍' }] : []),
  ];

  const next = useCallback(() => {
    setDir(1);
    setCurrent(i => (slides.length ? (i + 1) % slides.length : 0));
  }, [slides.length]);

  const prev = () => {
    setDir(-1);
    setCurrent(i => (slides.length ? (i - 1 + slides.length) % slides.length : 0));
  };

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next, slides.length]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.92 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.92 }),
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 15% 60%, rgb(var(--brand-lime) / 0.45) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 85% 25%, rgb(var(--brand-sky) / 0.35) 0%, transparent 60%), var(--ground)',
      }}
    >
      {/* Dekorasi: gelembung & kubus pastel palet logo */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="splash-bubble" style={{ width: 280, height: 280, top: '-6%', left: '-6%' }} />
        <span className="splash-bubble" style={{ width: 160, height: 160, bottom: '8%', right: '-3%', animationDelay: '-3s' }} />
        <span className="splash-cube" style={{ width: 48, height: 48, top: '26%', right: '12%', animationDelay: '-5s' }} />
        <span className="splash-cube" style={{ width: 32, height: 32, bottom: '22%', left: '8%', animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-32 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* ── KIRI ─────────────────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left min-w-0">

            {/* Brand badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-brand-100 border border-brand-200 text-brand-700 text-sm font-semibold mb-5"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-brand-200 flex-shrink-0">
                <Image src={branding.logoUrl} alt="" fill sizes="64px" className="object-cover" />
              </div>
              {branding.city ? `${branding.brandName} · ${branding.city}` : branding.brandName}
            </motion.div>

            {/* Headline: nama toko */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 break-words"
            >
              <span className="text-brand-950">{brandFirstWord}{brandRestWords ? ' ' : ''}</span>
              {brandRestWords && <span className="gradient-text">{brandRestWords}</span>}
            </motion.h1>

            {/* Tagline / deskripsi dari pengaturan admin */}
            {headline && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="text-ink-2 text-base sm:text-lg leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0"
              >
                {headline}
                {cheapest && <span className="block mt-1">{t.hero.priceFrom} <strong className="text-brand-700">{cheapest}</strong></span>}
              </motion.p>
            )}

            {/* Chip kategori dari katalog */}
            {categoryChips.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start mb-7">
                {categoryChips.map((c, i) => (
                  <motion.span
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.07, type: 'spring' }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-brand-800 border border-brand-200"
                  >
                    <span aria-hidden="true">{c.emoji || '🏷️'}</span>
                    {c.name}
                  </motion.span>
                ))}
              </div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-7"
            >
              {catalogEmpty ? (
                <Link href="/kontak">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold shadow-lg w-full sm:w-auto"
                  >
                    {t.nav.kontak}
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>
              ) : (
                <>
              <Link href="/products">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-primary flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold shadow-lg w-full sm:w-auto"
                    >
                      <ShoppingBag size={17} />
                      {t.hero.orderNow}
                      <ArrowRight size={15} />
                    </motion.button>
                  </Link>
                  <Link href="/products">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-outline flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold w-full sm:w-auto"
                    >
                      {t.hero.seeAll}
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Rating: hanya tampil kalau sudah ada ulasan asli dari customer */}
            {reviewCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center lg:justify-start gap-2"
              >
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i} size={14}
                      className={i <= Math.round(rating ?? 0) ? 'text-brand-500 fill-brand-500' : 'text-brand-200 fill-brand-200'}
                    />
                  ))}
                </div>
                <span className="text-ink-muted text-sm font-medium">
                  {rating?.toFixed(1)}/5 · {reviewCount} {t.hero.reviewsLabel}
                </span>
              </motion.div>
            )}
          </div>

          {/* ── KANAN: slider produk (atau kartu logo bila belum ada produk berfoto) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="flex-1 flex items-center justify-center w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative w-full max-w-sm">

              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl pointer-events-none blur-2xl scale-90"
                style={{ background: 'radial-gradient(circle, rgb(var(--brand-sky) / 0.55) 0%, transparent 70%)' }}
              />

              <div className="relative bg-white rounded-3xl shadow-2xl shadow-brand-300/40 border border-brand-100 overflow-hidden">

                {slide ? (
                  <>
                    <div className={`relative h-64 sm:h-72 bg-gradient-to-br ${slide.surface} overflow-hidden`}>
                      <AnimatePresence custom={dir} mode="wait">
                        <motion.div
                          key={slide.id}
                          custom={dir}
                          variants={variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={slide.image}
                            alt={slide.name}
                            fill
                            className="object-contain p-8"
                            sizes="(max-width: 640px) 100vw, 400px"
                            priority={current === 0}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {slide.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-brand-700">
                          {slide.badge === 'Best Seller' ? t.badge.bestSeller : slide.badge === 'Popular' ? t.badge.popular : t.badge.new}
                        </div>
                      )}

                      {slides.length > 1 && (
                        <>
                          <button
                            onClick={prev}
                            aria-label="Produk sebelumnya"
                            className="before:absolute before:-inset-1.5 before:content-[''] absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center text-brand-700 transition-all backdrop-blur-sm"
                          >
                            <ChevronLeft size={16} aria-hidden="true" />
                          </button>
                          <button
                            onClick={next}
                            aria-label="Produk berikutnya"
                            className="before:absolute before:-inset-1.5 before:content-[''] absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center text-brand-700 transition-all backdrop-blur-sm"
                          >
                            <ChevronRight size={16} aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="p-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`info-${slide.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-display text-base font-bold text-brand-950 leading-tight">
                              {slide.name}
                            </h3>
                            {slide.weight && (
                              <span className="text-xs text-ink-muted bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full flex-shrink-0">
                                {slide.weight}
                              </span>
                            )}
                          </div>
                          <p className="font-display text-xl font-bold gradient-text">{slide.price}</p>
                        </motion.div>
                      </AnimatePresence>

                      {slides.length > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-1.5">
                            {slides.map((sl, i) => (
                              <button
                                key={sl.id}
                                onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
                                aria-label={`Lihat produk ${i + 1}`}
                                aria-current={i === current ? 'true' : undefined}
                                className={`relative before:absolute before:-inset-x-[3px] before:-inset-y-[19px] before:content-[''] rounded-full transition-all duration-300 ${i === current ? 'bg-brand-600' : 'bg-brand-200'}`}
                                style={{ width: i === current ? 20 : 6, height: 6 }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-ink-muted">{current + 1} / {slides.length}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="relative h-72 flex flex-col items-center justify-center gap-4 p-8 text-center bg-gradient-to-br from-brand-ice to-brand-lime">
                    <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-lg" style={{ border: '3px solid rgba(255,255,255,0.85)' }}>
                      <Image src={branding.logoUrl} alt={branding.brandName} fill sizes="112px" className="object-cover" priority />
                    </div>
                    <p className="font-display text-lg font-bold text-brand-950">{branding.brandName}</p>
                  </div>
                )}
              </div>

              {/* Kartu harga mengambang */}
              {cheapest && (
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -left-3 sm:-left-6 top-8 bg-white rounded-2xl p-3 border border-brand-200 shadow-lg z-10"
                >
                  <p className="text-[10px] text-ink-muted">{t.hero.priceFrom}</p>
                  <p className="font-display text-sm font-bold text-brand-800">{cheapest}</p>
                </motion.div>
              )}

              {/* Kartu rating mengambang: hanya kalau sudah ada ulasan asli */}
              {reviewCount > 0 && (
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [1, -1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.2 }}
                  className="absolute -right-3 sm:-right-6 bottom-20 bg-white rounded-2xl p-3 border border-brand-200 shadow-lg z-10"
                >
                  <div className="flex gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(st => (
                      <Star key={st} size={8} className={st <= Math.round(rating ?? 0) ? 'text-brand-500 fill-brand-500' : 'text-brand-200 fill-brand-200'} />
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-2 font-semibold">
                    {soldCount} {t.hero.soldSuffix}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        {stats.length > 0 && <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`mt-16 grid gap-4 ${stats.length === 1 ? 'grid-cols-1 max-w-[12rem] mx-auto' : 'grid-cols-2'} ${stats.length === 2 ? 'max-w-lg mx-auto' : stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}
        >
          {stats.map((st, i) => (
            <motion.div
              key={st.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-4 sm:p-5 text-center border border-brand-100 shadow-sm hover:shadow-md hover:shadow-brand-200/60 transition-all duration-300"
            >
              <div className="text-2xl sm:text-3xl mb-1.5" aria-hidden="true">{st.icon}</div>
              <div className="font-display text-xl sm:text-2xl font-bold gradient-text break-words">{st.value}</div>
              <div className="text-ink-muted text-xs sm:text-sm mt-0.5">{st.label}</div>
            </motion.div>
          ))}
        </motion.div>}
      </div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 7, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 text-ink-muted"
      >
        <span className="text-xs">{t.hero.scroll}</span>
        <div className="w-px h-8 bg-gradient-to-b from-brand-400/50 to-transparent" />
      </motion.div>
    </section>
  );
}
