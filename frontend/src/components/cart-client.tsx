'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartItem, cartTotal, formatVnd, readCart, writeCart } from '@/lib/cart';
import { DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { Button, Panel } from './ui';

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function commit(nextItems: CartItem[]) {
    setItems(nextItems);
    writeCart(nextItems);
  }

  function setQuantity(productId: string, quantity: number) {
    commit(items.map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item)));
  }

  function remove(productId: string) {
    commit(items.filter((item) => item.productId !== productId));
  }

  const cooperativeGroups = useMemo(() => {
    const groups = new Map<string, { name: string; count: number; subtotal: number }>();
    for (const item of items) {
      const key = item.cooperativeId || 'unknown';
      const current = groups.get(key) ?? { name: item.cooperativeName || 'HTX', count: 0, subtotal: 0 };
      current.count += item.quantity;
      current.subtotal += item.price * item.quantity;
      groups.set(key, current);
    }
    return Array.from(groups.values());
  }, [items]);

  if (!items.length) {
    return (
      <Panel data-testid="cart-empty" className="text-center">
        <h2 className="text-xl font-bold">Giỏ hàng đang trống</h2>
        <p className="mt-2 text-sm text-slate-600">Chọn sản phẩm public từ HTX để bắt đầu đặt hàng.</p>
        <Link href="/san-pham" className="mt-4 inline-flex">
          <Button>Xem sản phẩm</Button>
        </Link>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {items.map((item) => (
          <Panel key={item.productId} className="flex flex-col gap-3 sm:flex-row sm:items-center" data-testid="cart-item">
            <PublicImage
              src={item.imageUrl}
              alt={item.name}
              fallback={DEFAULT_PRODUCT_IMAGE}
              className="h-20 w-20 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <Link href={`/san-pham/${item.slug}`} className="font-bold text-ink">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-slate-600">{item.cooperativeName || 'HTX đang cập nhật'}</p>
              <p className="mt-1 text-sm font-semibold text-leaf">
                {formatVnd(item.price)} / {item.unit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" aria-label="Giảm số lượng" onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                <Minus size={16} aria-hidden="true" />
              </Button>
              <span className="grid h-11 min-w-12 place-items-center rounded-md border border-slate-200 px-3 font-bold">{item.quantity}</span>
              <Button type="button" variant="ghost" aria-label="Tăng số lượng" onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                <Plus size={16} aria-hidden="true" />
              </Button>
              <Button type="button" variant="danger" aria-label="Xóa sản phẩm" onClick={() => remove(item.productId)}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </div>
          </Panel>
        ))}
      </div>
      <Panel className="h-max">
        <h2 className="text-lg font-bold">Tạm tính</h2>
        {cooperativeGroups.length > 1 && (
          <div className="mt-3 space-y-2 text-sm">
            {cooperativeGroups.map((group) => (
              <div key={group.name} className="flex justify-between rounded-md bg-slate-50 p-2">
                <span>{group.name}</span>
                <span className="font-semibold">{formatVnd(group.subtotal)}</span>
              </div>
            ))}
            <p className="text-xs text-amber-700">Sẽ tách thành {cooperativeGroups.length} đơn COD khi thanh toán.</p>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="font-semibold">Tổng tiền</span>
          <span className="text-xl font-bold text-leaf">{formatVnd(cartTotal(items))}</span>
        </div>
        <Link href="/thanh-toan" className="mt-4 block">
          <Button className="w-full">Chuyển sang thanh toán</Button>
        </Link>
      </Panel>
    </div>
  );
}
