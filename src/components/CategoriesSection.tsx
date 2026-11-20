'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLiveProducts } from '@/lib/useLiveProducts';
import { useLiveCategories } from '@/lib/useLiveCategories';
import { trackClick } from '@/lib/trackClick';

// Aksen garis atas kartu: siklus palet logo, dipilih stabil dari id kategori.
const ACCENT_GRADIENTS = [
  'from-brand-600 to-brand-400',
  'from-brand-sky to-brand-300',
  'from-brand-mint to-brand-lime',
  'from-brand-700 to-brand-sky',
  'from-brand-lime to-brand-sky',
  'from-brand-400 to-brand-mint',
];

function gradientFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return ACCENT_GRADIENTS[Math.abs(hash) % ACCENT_GRADIENTS.length];
}

export default function CategoriesSection() {
  const { t } = useLanguage();
  const products = useLiveProducts();
  const liveCategories = useLiveCategories();

  // Koleksi kategori admin adalah data master: menentukan nama, ikon, dan deskripsi.
  const cards = liveCategories
    .filter(c => products.some(p => p.category === c.id))
    .map(c => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji || '🏷️',
      description: c.description,
      gradient: gradientFor(c.id),
      count: products.filter(p => p.category === c.id).length,
    }));

  if (cards.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-14"
      >
        <p className="text-ink-muted text-sm font-semibold tracking-widest uppercase mb-3">
          {t.categories.badge}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
          <span className="text-brand-950">{t.categories.title1} </span>
          <span className="gradient-text">{t.categories.title2}</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.09 }}
          >
            <Link href={`/products?category=${cat.id}`} onClick={() => trackClick('category', cat.id)}>
              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 cursor-pointer h-36 sm:h-44 flex flex-col justify-between bg-white border border-brand-100 transition-all duration-300 hover:shadow-lg hover:shadow-brand-200/60 hover:border-brand-200"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.gradient} opacity-70`} />

                <motion.span
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 0.4 }}
                  className="text-4xl sm:text-5xl"
                >
                  {cat.emoji}
                </motion.span>

                <div>
                  <h3 className="font-display font-bold text-brand-950 text-base sm:text-lg leading-tight">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-ink-muted text-xs sm:text-sm mt-0.5 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-ink-muted text-xs">{cat.count} {t.categories.menuCount}</span>
                    <motion.div className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={13} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
