import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import SplashScreen from '@/components/SplashScreen';
import IOSInstallBanner from '@/components/IOSInstallBanner';
import AndroidInstallBanner from '@/components/AndroidInstallBanner';
import ScrollToTop from '@/components/ScrollToTop';
import { Analytics } from '@vercel/analytics/next';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import VisitorTracker from '@/components/VisitorTracker';
import { logoVariant } from '@/lib/branding';
import { getCachedBranding } from '@/lib/server/branding';
import { BrandingProvider } from '@/lib/useLiveBranding';
import MotionProvider from '@/components/MotionProvider';
import './globals.css';

// Font di-host sendiri (sama dengan panel admin) supaya build tidak bergantung pada Google Fonts.
const jakarta = localFont({
  src: [
    { path: './fonts/plus-jakarta-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/plus-jakarta-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/plus-jakarta-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/plus-jakarta-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/plus-jakarta-sans-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getCachedBranding();
  const iconBase = branding.logoUrl;
  return {
    metadataBase: new URL(branding.siteUrl),
    title: {
      default: branding.seoTitle,
      template: `%s | ${branding.brandName}`,
    },
    description: branding.seoDescription || undefined,
    keywords: branding.seoKeywords.length ? branding.seoKeywords : undefined,
    authors: [{ name: branding.legalName }],
    creator: branding.legalName,
    publisher: branding.legalName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      title: branding.seoTitle,
      description: branding.seoDescription || undefined,
      type: 'website',
      locale: 'id_ID',
      siteName: branding.brandName,
      url: branding.siteUrl,
      images: [{ url: logoVariant(iconBase, 512) }],
    },
    twitter: {
      card: 'summary_large_image',
      title: branding.seoTitle,
      description: branding.seoDescription || undefined,
    },
    alternates: {
      canonical: branding.siteUrl,
    },
    verification: branding.googleSiteVerification
      ? { google: branding.googleSiteVerification }
      : undefined,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: branding.brandName,
      statusBarStyle: 'default',
    },
    icons: {
      apple: logoVariant(iconBase, 180),
      icon: [
        { url: logoVariant(iconBase, 192), sizes: '192x192', type: 'image/png' },
        { url: logoVariant(iconBase, 512), sizes: '512x512', type: 'image/png' },
      ],
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const branding = await getCachedBranding();
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: branding.themeColor,
    viewportFit: 'cover',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await getCachedBranding();
  return (
    <html lang="id" className={jakarta.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={branding.brandName} />
      </head>
      <body className="antialiased">
        <BrandingProvider value={branding}>
        <LanguageProvider>
        <AuthProvider>
        <MotionProvider>
        <SplashScreen />
        <IOSInstallBanner />
        <AndroidInstallBanner />
        <ScrollToTop />
        <VisitorTracker />
        {children}
        <Toaster
          position="bottom-right"
          containerClassName="app-toaster"
          toastOptions={{
            duration: 2500,
            style: {
              background: 'var(--text-primary)',
              color: 'var(--ground)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
            },
            success: {
              iconTheme: { primary: 'var(--accent)', secondary: 'var(--text-primary)' },
            },
            error: {
              iconTheme: { primary: '#F87171', secondary: 'var(--text-primary)' },
            },
          }}
        />
        </MotionProvider>
        </AuthProvider>
        </LanguageProvider>
        </BrandingProvider>
        <Analytics />
      </body>
    </html>
  );
}
