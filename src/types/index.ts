export interface Product {
  id: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  originalPrice?: number;
  emoji: string;
  // URL gambar (Cloudinary) dari admin.
  images?: string[];
  // Category doc id (slug) in the admin's `categories` table — an open set managed by
  // the admin. Resolve to a display name via useLiveCategories(), don't render this raw value.
  category: string;
  badge?: 'Popular' | 'New' | 'Best Seller';
  stock: 'ready' | 'habis' | 'open_po';
  stockQty?: number;
  gradient: string;
  bgColor: string;
  weight: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  note: string;
  deliveryMethod: 'pickup' | 'delivery';
}

export type Category = 'semua' | string;
