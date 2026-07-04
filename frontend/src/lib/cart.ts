import type { PublicProduct } from '@/components/public-marketplace';

export const CART_STORAGE_KEY = 'htxonline_cart_items';
export const LAST_ORDER_STORAGE_KEY = 'htxonline_last_order';

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  unit: string;
  cooperativeId?: string;
  cooperativeName?: string;
  quantity: number;
};

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const value = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.productId && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.filter((item) => item.quantity > 0)));
  window.dispatchEvent(new Event('htxonline-cart-change'));
}

export function addProductToCart(product: PublicProduct, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price ?? 0),
      unit: product.unit,
      cooperativeId: product.cooperative?.id,
      cooperativeName: product.cooperative?.name,
      quantity
    });
  }
  writeCart(items);
  return items;
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}
