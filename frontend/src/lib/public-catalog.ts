import { API_URL, type ApiEnvelope } from '@/lib/api';
import { cooperativesFromProducts, publicListItems, type PublicCooperative, type PublicProduct } from '@/components/public-marketplace';

type ProductListPayload = PublicProduct[] | { data?: PublicProduct[] };

type CatalogMeta = {
  total?: number;
};

export type PublicCatalog = {
  products: PublicProduct[];
  cooperatives: PublicCooperative[];
  totalProducts: number;
};

export async function fetchPublicCatalog(limit = 100): Promise<PublicCatalog> {
  try {
    const response = await fetch(`${API_URL}/products/public?limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) {
      return { products: [], cooperatives: [], totalProducts: 0 };
    }
    const body = (await response.json()) as ApiEnvelope<ProductListPayload> & { meta?: CatalogMeta };
    const products = publicListItems(body.data);
    const cooperatives = cooperativesFromProducts(products);
    return {
      products,
      cooperatives,
      totalProducts: body.meta?.total ?? products.length
    };
  } catch {
    return { products: [], cooperatives: [], totalProducts: 0 };
  }
}

export async function fetchProductsForCooperative(code: string, limit = 100): Promise<PublicProduct[]> {
  try {
    const params = new URLSearchParams({ limit: String(limit), cooperative: code });
    const response = await fetch(`${API_URL}/products/public?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductListPayload>;
    return publicListItems(body.data);
  } catch {
    return [];
  }
}
