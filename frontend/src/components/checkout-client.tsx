'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { CartItem, LAST_ORDER_STORAGE_KEY, cartTotal, formatVnd, readCart, writeCart } from '@/lib/cart';
import { DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
      <Panel className="order-2 lg:order-1 lg:p-6 xl:p-7">
        <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-mint/70 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf/80">Thông tin giao hàng</p>
            <h2 className="mt-1 text-xl font-bold text-ink">Hoàn tất đơn COD</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">Điền đúng số điện thoại và địa chỉ để HTX liên hệ xác nhận nhanh hơn.</p>
          </div>
          <div className="rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-slate-500">Tạm tính</p>
            <p className="mt-1 text-lg font-bold text-leaf">{formatVnd(cartTotal(items))}</p>
          </div>
        </div>

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
          <div className="rounded-xl bg-mint p-3 text-sm font-semibold text-leaf sm:col-span-2">Phương thức thanh toán: COD - Thanh toán khi nhận hàng</div>
          {error && <div data-testid="toast-error" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 sm:col-span-2">{error}</div>}
          <Button data-testid="checkout-submit-button" className="sm:w-max sm:px-6" disabled={submitting || !items.length}>
            {submitting ? 'Đang đặt hàng' : 'Đặt hàng'}
          </Button>
        </form>
      </Panel>

      <Panel className="order-1 h-max lg:order-2 lg:sticky lg:top-24 lg:p-6">
        <h2 className="text-lg font-bold">Đơn hàng</h2>
        <p className="mt-1 text-sm text-slate-500">Kiểm tra lại sản phẩm và tổng tiền trước khi điền thông tin giao hàng.</p>
        {items.length ? (
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                {item.imageUrl ? (
                  <PublicImage
                    src={item.imageUrl}
                    alt={item.name}
                    fallback={DEFAULT_PRODUCT_IMAGE}
                    decorative
                    wrapperClassName="h-16 w-16 shrink-0 rounded-md"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold leading-6">{item.name}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm">x{item.quantity}</span>
                  </div>
                  <p className="mt-1 text-slate-600">{item.cooperativeName || 'HTX'}</p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {formatVnd(item.price)} <span className="font-normal text-slate-500">/ {item.unit}</span>
                  </p>
                </div>
              </div>
            ))}
            {new Set(items.map((item) => item.cooperativeId).filter(Boolean)).size > 1 && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                Giỏ hàng có sản phẩm từ nhiều HTX. Hệ thống sẽ tách thành nhiều đơn COD riêng khi đặt hàng.
              </p>
            )}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                <span>Tạm tính</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
              </div>
              <div className="mt-1 flex justify-between text-lg font-bold">
                <span className="text-ink">Tổng cộng</span>
                <span className="text-leaf">{formatVnd(cartTotal(items))}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Giỏ hàng đang trống.</p>
        )}
      </Panel>
    </div>
  );
}
