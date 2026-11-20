'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, ChevronLeft, ChevronRight, BookOpen, Square, AlertCircle, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Translation } from '@/lib/i18n';
import { useLiveBranding } from '@/lib/useLiveBranding';
import { hostOf } from '@/lib/branding';

type BannerMode = 'safari' | 'other-browser';

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<BannerMode>('safari');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const branding = useLiveBranding();

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    const dismissed = sessionStorage.getItem('ios_banner_dismissed');

    if (!isIOS || isStandalone || dismissed) return;

    const isNotSafari = /CriOS|FxiOS|OPiOS|EdgiOS|DuckDuckGo/.test(ua);
    setMode(isNotSafari ? 'other-browser' : 'safari');
    setTimeout(() => setShow(true), 2000);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('has-install-banner', show);
    return () => document.documentElement.classList.remove('has-install-banner');
  }, [show]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('ios_banner_dismissed', '1');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          className="fixed left-3 right-3 z-[70] rounded-2xl shadow-xl overflow-hidden"
          style={{
            bottom: 'calc(4.75rem + env(safe-area-inset-bottom))',
            background: 'var(--ground)',
            border: '1.5px solid rgb(var(--brand-600) / 0.25)',
          }}
          role="region"
          aria-label={t.pwa.title}
        >
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-brand-200">
              <Image src={branding.logoUrl} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <p className="flex-1 min-w-0 font-display font-bold text-brand-950 text-[13px] leading-tight truncate">
              {t.pwa.title}
            </p>
            <button
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-controls="ios-install-guide"
              className="flex-shrink-0 h-9 px-3.5 rounded-lg text-xs font-bold text-white"
              style={{ background: 'var(--accent)' }}
            >
              {open ? 'Tutup' : 'Cara'}
            </button>
            <button
              onClick={dismiss}
              aria-label="Tutup"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-brand-700 hover:bg-brand-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {open && (
            <div id="ios-install-guide" className="px-4 pb-4 max-h-[55vh] overflow-y-auto">
              {mode === 'other-browser' ? (
                <OtherBrowserGuide t={t} onCopy={copyLink} copied={copied} />
              ) : (
                <SafariGuide t={t} siteHost={hostOf(branding.siteUrl)} />
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OtherBrowserGuide({ t, onCopy, copied }: { t: Translation; onCopy: () => void; copied: boolean }) {
  return (
    <div className="mt-3 pt-3 border-t border-brand-100">
      <div className="flex items-start gap-2 bg-brand-50 rounded-xl p-3 border border-brand-200">
        <AlertCircle size={14} className="text-brand-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-brand-900 text-[11px] font-semibold leading-snug">
            {t.pwa.otherTitle} <span className="text-brand-700">{t.pwa.otherSafari}</span>
          </p>
          <p className="text-ink-muted text-[11px] mt-0.5 leading-snug">
            {t.pwa.otherDesc}
          </p>
        </div>
      </div>
      <button
        onClick={onCopy}
        className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold transition-colors"
        style={{ background: copied ? '#16a34a' : 'var(--accent)', color: '#fff' }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? t.pwa.copied : t.pwa.copyLink}
      </button>
    </div>
  );
}

function SafariGuide({ t, siteHost }: { t: Translation; siteHost: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-brand-100">
      <p className="text-ink-muted text-[11px] font-semibold uppercase tracking-wider mb-2.5">
        {t.pwa.safariStepsTitle}
      </p>

      <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 bg-white">
          <div className="flex-1 bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-[9px] text-gray-500 truncate font-medium">{siteHost}</span>
          </div>
          <span className="ml-2 flex-shrink-0 text-[8px] font-semibold text-brand-600 bg-brand-100 border border-brand-200 rounded px-1.5 py-0.5">
            Contoh
          </span>
        </div>
        <div className="flex items-center justify-around px-4 py-2 bg-white">
          <ChevronLeft size={18} className="text-gray-300" />
          <ChevronRight size={18} className="text-gray-300" />
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <div className="absolute w-8 h-8 rounded-full bg-brand-400/25" />
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-md relative z-10">
              <Share size={14} className="text-white" />
            </div>
          </motion.div>
          <BookOpen size={18} className="text-gray-300" />
          <Square size={18} className="text-gray-300" />
        </div>
        <div className="bg-brand-50 py-1.5 flex items-center justify-center gap-1 border-t border-brand-100">
          <span className="text-[10px] font-semibold text-brand-700">{t.pwa.toolbarLabel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <StepRow number={1}>
          {t.pwa.step1}{' '}
          <span className="font-bold text-brand-700">{t.pwa.step1Share}</span>{' '}
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-brand-500 mx-0.5">
            <Share size={9} className="text-white" />
          </span>{' '}
          {t.pwa.step1Suf}
        </StepRow>
        <StepRow number={2}>
          {t.pwa.step2}{' '}
          <span className="font-bold text-brand-700">{t.pwa.step2Add}</span>
        </StepRow>
        <StepRow number={3}>
          {t.pwa.step3}{' '}
          <span className="font-bold text-brand-700">{t.pwa.step3Add}</span>{' '}
          {t.pwa.step3Done}
        </StepRow>
      </div>
    </div>
  );
}

function StepRow({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5"
        style={{ background: 'var(--accent)' }}
      >
        {number}
      </span>
      <span className="text-brand-900 text-[11px] leading-snug flex items-center gap-0.5 flex-wrap">
        {children}
      </span>
    </div>
  );
}
