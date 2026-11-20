'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { FireProductRaw, buildLiveProducts } from '@/lib/liveProducts';

// Module-level cache shared by every component using this hook, so mounting
// several of them on the same page (e.g. Hero + FeaturedSection) fires a single
// /api/products request instead of one each. Short TTL — the API route's own
// cache is invalidated on demand via /api/revalidate, so this only needs to
// coalesce same-page-load mounts, not survive a whole browsing session.
const CACHE_TTL_MS = 30 * 1000;
let cache: { data: Product[]; ts: number } | null = null;
let inFlight: Promise<Product[] | null> | null = null;

// null = gagal memuat (jaringan/server). Kegagalan TIDAK di-cache supaya mount berikutnya mencoba lagi.
function loadLiveProducts(): Promise<Product[] | null> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) return Promise.resolve(cache.data);
  if (inFlight) return inFlight;

  inFlight = fetch('/api/products', { signal: AbortSignal.timeout(15_000) })
    .then(r => (r.ok ? r.json() : null))
    .then((d: { products?: FireProductRaw[] } | null) => {
      if (!d || !Array.isArray(d.products)) return null;
      const list = buildLiveProducts(d.products);
      cache = { data: list, ts: Date.now() };
      return list;
    })
    .catch(() => null)
    .finally(() => { inFlight = null; });

  return inFlight;
}

export interface LiveProductsState {
  products: Product[];
  /** true selama permintaan pertama belum selesai (bedakan "memuat" dari "katalog kosong"). */
  loading: boolean;
  /** true bila permintaan terakhir gagal dan belum ada data. */
  error: boolean;
}

// Katalog produk dari database (dikelola di cishu-admin) — satu-satunya sumber, tanpa katalog statis.
export function useLiveProductsState(): LiveProductsState {
  const [state, setState] = useState<LiveProductsState>(
    cache ? { products: cache.data, loading: false, error: false } : { products: [], loading: true, error: false },
  );

  useEffect(() => {
    let active = true;
    loadLiveProducts().then(list => {
      if (!active) return;
      setState(prev => (list ? { products: list, loading: false, error: false } : { products: prev.products, loading: false, error: prev.products.length === 0 }));
    });
    return () => { active = false; };
  }, []);

  return state;
}

export function useLiveProducts(): Product[] {
  return useLiveProductsState().products;
}
