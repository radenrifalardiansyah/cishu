import { Product } from '@/types';

// Shape returned by GET /api/products (Postgres product rows, admin-managed).
export interface FireProductRaw {
  id: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  originalPrice?: number;
  emoji: string;
  imageUrls: string[];
  category: string;
  badge?: string;
  stock: string;
  stockQty?: number;
  gradient: string;
  bgColor: string;
  weight: string;
  order?: number;
  published?: boolean;
}

const VALID_STOCK = new Set(['ready', 'habis', 'open_po']);
const VALID_BADGE = new Set(['Popular', 'New', 'Best Seller']);

// Converts a raw product row (Postgres) into the shape returned by GET /api/products.
// Shared by that route and by the server-side product lookups (lib/server/getProduct.ts).
export function rawFromDoc(id: string, data: Record<string, unknown>): FireProductRaw {
  return {
    id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    details: Array.isArray(data.details) ? data.details as string[] : [],
    price: typeof data.price === 'number' ? data.price : 0,
    originalPrice: typeof data.originalPrice === 'number' ? data.originalPrice : undefined,
    emoji: (data.emoji as string) ?? '🛍️',
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls as string[] : [],
    category: (data.category as string) ?? '',
    badge: (data.badge as string) || undefined,
    stock: (data.stock as string) ?? 'habis',
    stockQty: typeof data.stockQty === 'number' ? data.stockQty : undefined,
    gradient: (data.gradient as string) ?? 'from-rose-600 to-rose-400',
    bgColor: (data.bgColor as string) ?? '#BD354C',
    weight: (data.weight as string) ?? '',
    order: typeof data.order === 'number' ? data.order : undefined,
    published: data.published as boolean | undefined,
  };
}

// A product with no explicit `published` field (legacy docs written before this flag
// existed) is treated as published, so nothing already live gets hidden retroactively.
export const isPublished = (f: Pick<FireProductRaw, 'published'>): boolean => f.published !== false;

export function fireToProduct(f: FireProductRaw): Product {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    details: f.details.length ? f.details : [f.description].filter(Boolean),
    price: f.price,
    originalPrice: f.originalPrice,
    emoji: f.emoji,
    images: f.imageUrls,
    category: f.category,
    badge: VALID_BADGE.has(f.badge ?? '') ? (f.badge as Product['badge']) : undefined,
    stock: VALID_STOCK.has(f.stock) ? (f.stock as Product['stock']) : 'habis',
    stockQty: f.stockQty,
    gradient: f.gradient,
    bgColor: f.bgColor,
    weight: f.weight,
  };
}

// Katalog toko sepenuhnya berasal dari database (dikelola di cishu-admin): hanya produk yang
// published, urut menurut `order` admin lalu nama. Tidak ada katalog statis/seed di storefront.
export function buildLiveProducts(rawList: FireProductRaw[]): Product[] {
  return rawList
    .filter(isPublished)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.name.localeCompare(b.name, 'id'))
    .map(fireToProduct);
}

export function imageSrc(img: string): string {
  return img;
}
