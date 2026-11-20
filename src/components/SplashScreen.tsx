'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveBranding } from '@/lib/useLiveBranding';

export default function SplashScreen() {
  // null = belum dicek (cover layar), true = tampilkan, false = sembunyikan
  const [visible, setVisible] = useState<boolean | null>(null);
  const branding = useLiveBranding();
  
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

    const shown = sessionStorage.getItem('splash_shown');
    if (isStandalone && !shown) {
      setVisible(true);
      sessionStorage.setItem('splash_shown', '1');
      setTimeout(() => setVisible(false), 2400);
    } else {
      setVisible(false);
    }
  }, []);

  // Cover layar sebelum useEffect selesai — mencegah konten halaman terlihat sekilas
  if (visible === null) {
    return <div className="splash-cover fixed inset-0 z-[999]" />;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
          style={{ background: 'var(--accent-grad)' }}
        >
          <div aria-hidden="true">
            <span className="splash-bubble" style={{ width: 180, height: 180, top: '8%', right: '-4%' }} />
            <span className="splash-bubble" style={{ width: 90, height: 90, bottom: '14%', left: '8%', animationDelay: '-3s' }} />
            <span className="splash-cube" style={{ width: 44, height: 44, top: '30%', left: '14%', animationDelay: '-5s' }} />
          </div>

          {/* Logo — sudah tampil di splash native Android, jadi di sini diam saja (tidak animasi ulang) supaya menyatu, tidak terasa "muncul dua kali" */}
          <div
            className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl mb-6"
            style={{ border: '2px solid rgba(255,255,255,0.55)' }}
          >
            <Image src={branding.logoUrl} alt={branding.brandName} fill sizes="96px" className="object-cover" priority />
          </div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="text-center px-6"
          >
            <p className="font-display text-2xl font-bold text-white leading-tight">{branding.brandName}</p>
            {branding.tagline && (
              <p className="text-sm mt-2 text-white">{branding.tagline}</p>
            )}
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-1.5 mt-10"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: '#FFFFFF' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
