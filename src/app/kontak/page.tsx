'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, Clock, Instagram, MessageCircle,
  ExternalLink, ShoppingBag,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import BottomNav from '@/components/BottomNav';
import { useLiveBranding } from '@/lib/useLiveBranding';
import { useLanguage } from '@/contexts/LanguageContext';
import { LiveBranding, whatsappLink } from '@/lib/branding';

const getContacts = (branding: LiveBranding) => [
  {
    icon: Phone,
    label: 'WhatsApp',
    value: branding.whatsappDisplay,
    href: branding.whatsappUrl,
    color: '#16A34A',
    bg: 'rgba(22,163,74,0.08)',
    border: 'rgba(22,163,74,0.2)',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: `@${branding.instagramHandle}`,
    href: branding.instagramUrl,
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.08)',
    border: 'rgba(225,48,108,0.2)',
  },
  {
    icon: ShoppingBag,
    label: 'Shopee',
    value: branding.shopeeName,
    href: branding.shopeeUrl,
    color: '#EE4D2D',
    bg: 'rgba(238,77,45,0.08)',
    border: 'rgba(238,77,45,0.2)',
  },
].filter(c => c.href && c.value.replace('@', '').trim());

export default function KontakPage() {
  const { t } = useLanguage();
  const branding = useLiveBranding();
  const contacts = getContacts(branding);
  const hasAddress = Boolean(branding.address || branding.city);
  const mapQuery = `${branding.address} ${branding.city}`.trim();
  const hasWhatsapp = Boolean(branding.whatsappNumber);
  const hasAnyContact = hasAddress || Boolean(branding.openHours) || contacts.length > 0 || hasWhatsapp;
  return (
    <main className="min-h-screen">
      <Navbar />
      <Cart />

      <div className="max-w-lg mx-auto px-4 pt-28 pb-40 md:pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-brand-200 shadow-lg mb-4">
            <Image src={branding.logoUrl} alt={branding.brandName} fill sizes="80px" className="object-cover" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-1">{branding.brandName}</h1>
          {branding.tagline && <p className="text-ink-muted text-sm">{branding.tagline}</p>}
        </motion.div>

        {/* Maps embed */}
        {mapQuery && <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl overflow-hidden border border-brand-100 shadow-sm mb-4"
        >
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${branding.address} ${branding.city}`)}&output=embed&z=16`}
            width="100%"
            height="220"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Lokasi ${branding.brandName}`}
          />
        </motion.div>}

        {/* Address card */}
        {hasAddress && <motion.a
          href={branding.mapsUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-start gap-3 p-4 rounded-2xl border mb-4 w-full text-left"
          style={{ background: 'rgb(var(--brand-600) / 0.07)', border: '1.5px solid rgb(var(--brand-600) / 0.2)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--brand-600) / 0.15)' }}>
            <MapPin size={18} className="text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-0.5">{t.kontak.addressLabel}</p>
            <p className="text-brand-950 text-sm font-medium leading-snug">
              {branding.address}
              {branding.address && branding.city && <br />}
              {branding.city}
            </p>
            {branding.mapsUrl && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-brand-600">
                {t.kontak.openMaps} <ExternalLink size={11} />
              </span>
            )}
          </div>
        </motion.a>}

        {/* Jam buka */}
        {branding.openHours && <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="flex items-center gap-3 p-4 rounded-2xl border mb-6"
          style={{ background: 'rgb(var(--brand-600) / 0.05)', border: '1.5px solid rgb(var(--brand-600) / 0.15)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--brand-600) / 0.12)' }}>
            <Clock size={18} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-0.5">{t.kontak.hoursLabel}</p>
            <p className="text-brand-950 text-sm font-medium">{branding.openHours}</p>
          </div>
        </motion.div>}

        {/* Contact buttons */}
        {contacts.length > 0 && <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-3">{t.kontak.contactUs}</p>}
        {contacts.length > 0 && <div className="space-y-3 mb-6">
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-4 rounded-2xl border w-full"
                style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c.color}20` }}
                >
                  <Icon size={20} style={{ color: c.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: c.color }}>{c.label}</p>
                  <p className="text-brand-950 text-sm font-medium">{c.value}</p>
                </div>
                <ExternalLink size={14} className="text-brand-400 flex-shrink-0" />
              </motion.a>
            );
          })}
        </div>}

        {!hasAnyContact && (
          <div className="rounded-2xl border border-brand-200 bg-white p-6 text-center mb-6">
            <p className="text-brand-950 text-sm font-semibold mb-1">Informasi kontak segera tersedia</p>
            <p className="text-ink-muted text-sm">Sementara itu, lihat menu kami di halaman produk.</p>
          </div>
        )}

        {/* WA order shortcut */}
        {hasWhatsapp && <motion.a
          href={whatsappLink(branding, `Halo ${branding.brandName}, saya mau pesan`)}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-sm shadow-lg"
          style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 24px rgba(22,163,74,0.3)' }}
        >
          <MessageCircle size={18} />
          {t.kontak.orderWA}
        </motion.a>}
      </div>

      <div className="hidden sm:block"><Footer /></div>
      <BottomNav />
    </main>
  );
}
