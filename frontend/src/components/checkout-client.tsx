'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { CartItem, LAST_ORDER_STORAGE_KEY, cartTotal, formatVnd, readCart, writeCart } from '@/lib/cart';
import { Button, Input, Panel, Textarea } from './ui';

type OrderResponse = {
  id: string;
  orderCode: string;
  status: string;
  totalAmount: string | number;
  cooperative?: { id: string; name: string; code: string } | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  address?: string | null;
  province?: string | null;
  paymentMethod?: string | null;
  items?: Array<{
    id: string;
    quantity: string | number;
    unitPrice: string | number;
    product?: { name: string; unit: string };
  }>;
};

type CheckoutResponse = {
  groupCode?: string | null;
  orders: OrderResponse[];
};

const phonePattern = /^(0|\+84)[0-9]{8,10}$/;

export function CheckoutClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setItems(readCart());
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!items.length) {
      setError('Giỏ hàng không được rỗng');
      return;
    }
    const form = new FormData(event.currentTarget);
    const buyerName = String(form.get('buyerName') || '').trim();
    const buyerPhone = String(form.get('buyerPhone') || '').trim();
    const province = String(form.get('province') || '').trim();
    const address = String(form.get('address') || '').trim();
    if (!buyerName) return setError('Họ tên là bắt buộc');
    if (!buyerPhone) return setError('Số điện thoại là bắt buộc');
    if (!phonePattern.test(buyerPhone)) return setError('Số điện thoại Việt Nam không hợp lệ');
    if (!province || !address) return setError('Địa chỉ là bắt buộc');

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/orders/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
          buyerEmail: String(form.get('buyerEmail') || '').trim() || undefined,
          province,
          district: String(form.get('district') || '').trim() || undefined,
          ward: String(form.get('ward') || '').trim() || undefined,
          address,
          note: String(form.get('note') || '').trim() || undefined,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
        })
      });
      const body = (await response.json().catch(() => null)) as ApiEnvelope<CheckoutResponse> | null;
      if (!response.ok || !body?.success) {
        throw new Error(body?.errors?.[0]?.message || body?.message || 'Không thể đặt hàng');
      }
      const payload = body.data;
      window.localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(payload));
      writeCart([]);
      const query = payload.groupCode
        ? `groupCode=${encodeURIComponent(payload.groupCode)}`
        : `orderCode=${encodeURIComponent(payload.orders[0]?.orderCode ?? '')}`;
      router.push(`/dat-hang-thanh-cong?${query}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt hàng');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Panel>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <label className="space-y-1 text-sm font-semibold">
            <span>Họ tên</span>
            <Input data-testid="checkout-name-input" name="buyerName" required />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Số điện thoại</span>
            <Input data-testid="checkout-phone-input" name="buyerPhone" required inputMode="tel" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Email</span>
            <Input name="buyerEmail" type="email" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Tỉnh/thành</span>
            <Input name="province" required />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Quận/huyện</span>
            <Input name="district" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Xã/phường</span>
            <Input name="ward" />
          </label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">
            <span>Địa chỉ chi tiết</span>
            <Input data-testid="checkout-address-input" name="address" required />
          </label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">
            <span>Ghi chú</span>
            <Textarea name="note" />
          </label>
          <div className="rounded-md bg-mint p-3 text-sm font-semibold text-leaf sm:col-span-2">Phương thức thanh toán: COD - Thanh toán khi nhận hàng</div>
          {error && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700 sm:col-span-2">{error}</div>}
          <Button data-testid="checkout-submit-button" className="sm:w-max" disabled={submitting || !items.length}>
            {submitting ? 'Đang đặt hàng' : 'Đặt hàng'}
          </Button>
        </form>
      </Panel>
      <Panel className="h-max">
        <h2 className="text-lg font-bold">Đơn hàng</h2>
        {items.length ? (
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-md bg-slate-50 p-3 text-sm">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover" />}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                  <p className="mt-1 text-slate-600">{item.cooperativeName || 'HTX'}</p>
                  <p className="mt-1 text-slate-600">{formatVnd(item.price)} / {item.unit}</p>
                </div>
              </div>
            ))}
            {new Set(items.map((item) => item.cooperativeId).filter(Boolean)).size > 1 && (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                Giỏ hàng có sản phẩm từ nhiều HTX. Hệ thống sẽ tách thành nhiều đơn COD riêng khi đặt hàng.
              </p>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 font-bold">
              <span>Tạm tính</span>
              <span className="text-leaf">{formatVnd(cartTotal(items))}</span>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Giỏ hàng đang trống.</p>
        )}
      </Panel>
    </div>
  );
}
