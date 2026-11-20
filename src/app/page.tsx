import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import FeaturedSection from '@/components/FeaturedSection';
import CategoriesSection from '@/components/CategoriesSection';
import BottomNav from '@/components/BottomNav';
import { absoluteUrl } from '@/lib/branding';
import { getCachedBranding } from '@/lib/server/branding';
import { imageSrc } from '@/lib/liveProducts';
import { getLiveProducts } from '@/lib/server/getProduct';
import { stripFormatting } from '@/lib/formatted-text';

// Refreshes the featured-product JSON-LD against Postgres periodically, so admin
// edits (name/price/stock/images/...) show up without a full redeploy.
export const revalidate = 300;

const availabilityMap: Record<string, string> = {
  ready: 'https://schema.org/InStock',
  habis: 'https://schema.org/OutOfStock',
  open_po: 'https://schema.org/PreOrder',
};

export default async function HomePage() {
  const branding = await getCachedBranding();
  const allProducts = await getLiveProducts();
  // Penawaran JSON-LD: produk yang ditandai Terlaris/Populer di admin, atau 4 produk pertama.
  const badged = allProducts.filter(p => p.badge === 'Best Seller' || p.badge === 'Popular');
  const featuredProducts = (badged.length ? badged : allProducts).slice(0, 4);
  const prices = allProducts.map(p => p.price).filter(p => p > 0);
  const priceRange = prices.length
    ? `Rp ${Math.min(...prices).toLocaleString('id-ID')} – Rp ${Math.max(...prices).toLocaleString('id-ID')}`
    : undefined;

  const featuredOffers = featuredProducts.map(product => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      name: product.name,
      description: stripFormatting(product.description),
      image: product.images?.[0] ? absoluteUrl(branding.siteUrl, imageSrc(product.images[0])) : undefined,
      offers: {
        '@type': 'Offer',
        url: `${branding.siteUrl}/products/${product.id}`,
        priceCurrency: 'IDR',
        price: product.price,
        availability: availabilityMap[product.stock] ?? 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    },
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: branding.brandName,
    alternateName: branding.legalName,
    description: branding.seoDescription || undefined,
    url: branding.siteUrl,
    telephone: branding.whatsappNumber ? `+${branding.whatsappNumber}` : undefined,
    image: absoluteUrl(branding.siteUrl, branding.logoUrl),
    address: {
      '@type': 'PostalAddress',
      ...(branding.address ? { streetAddress: branding.address } : {}),
      ...(branding.city ? { addressLocality: branding.city } : {}),
      addressCountry: 'ID',
    },
    sameAs: [branding.instagramUrl, branding.tiktokUrl, branding.shopeeUrl, branding.whatsappUrl].filter(Boolean),
    servesCuisine: 'Snack',
    priceRange,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: branding.brandName,
      itemListElement: featuredOffers,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ background: 'var(--ground)' }}>
        <Navbar />
        <Cart />
        <Hero />
        <CategoriesSection />
        <div className="pb-24 md:pb-0">
          <FeaturedSection />
        </div>
        <Footer />
        <BottomNav />
      </main>
    </>
  );
}
