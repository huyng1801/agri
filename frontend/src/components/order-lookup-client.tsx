'use client';

import Link from 'next/link';
import { useState } from 'react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { formatVnd } from '@/lib/cart';
import { Button, Input, Panel } from './ui';

type LookupOrder = {
  orderCode: string;
  status: string;
  totalAmount: string | number;
  buyerName?: string | null;
  buyerPhone?: string | null;
  address?: string | null;
  province?: string | null;
  paymentMethod?: string | null;
  cooperative?: { name: string; code: string; phone?: string | null } | null;
  items: Array<{
    id: string;
    quantity: string | number;
    unitPrice: string | number;
    product?: {
      name: string;
      slug: string;
      unit: string;
      cooperative?: { name: string; code: string; phone?: string | null };
    };
  }>;
};

type LookupResult = {
  groupCode?: string | null;
  orders: LookupOrder[];
};

export function OrderLookupClient() {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResult(null);
    const form = new FormData(event.currentTarget);
    const orderCode = String(form.get('orderCode') || '').trim();
    const groupCode = String(form.get('groupCode') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    if (!phone) {
      setError('Nhập số điện thoại');
      return;
    }
    if (!orderCode && !groupCode) {
      setError('Nhập mã đơn hàng hoặc mã nhóm đơn');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ phone });
      if (groupCode) params.set('groupCode', groupCode);
      if (orderCode) params.set('orderCode', orderCode);
      const response = await fetch(`${API_URL}/orders/public/lookup?${params.toString()}`, { cache: 'no-store' });
      const body = (await response.json().catch(() => null)) as ApiEnvelope<LookupResult> | null;
      if (!response.ok || !body?.success) throw new Error(body?.message || body?.errors?.[0]?.message || 'Không tìm thấy đơn hàng');
      setResult(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tìm thấy đơn hàng');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <label className="space-y-1 text-sm font-semibold">
            <span>Mã đơn hàng</span>
            <Input data-testid="order-code-input" name="orderCode" placeholder="ORD-..." />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Mã nhóm đơn (nếu có)</span>
            <Input data-testid="order-group-code-input" name="groupCode" placeholder="ORD-GRP-..." />
          </label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">
            <span>Số điện thoại</span>
            <Input data-testid="order-phone-input" name="phone" inputMode="tel" required />
          </label>
          <Button data-testid="order-lookup-submit-button" className="sm:w-max" disabled={loading}>
            {loading ? 'Đang tra cứu' : 'Tra cứu'}
          </Button>
        </form>
        {error && <div data-testid="toast-error" className="mt-3 rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      </Panel>

      {result && (
        <div className="space-y-4" data-testid="order-lookup-result">
          {result.groupCode && (
            <Panel>
              <p className="text-sm text-slate-500">Mã nhóm đơn</p>
              <h2 className="text-xl font-bold text-ink">{result.groupCode}</h2>
              <p className="mt-1 text-sm text-slate-600">{result.orders.length} đơn hàng trong nhóm này</p>
            </Panel>
          )}
          {result.orders.map((order) => (
            <OrderCard key={order.orderCode} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: LookupOrder }) {
  return (
    <Panel>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{order.cooperative?.name ?? 'HTX'}</p>
          <h2 className="text-2xl font-bold text-ink">{order.orderCode}</h2>
        </div>
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-leaf">{statusLabel(order.status)}</span>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p>Người nhận: {order.buyerName}</p>
        <p>Số điện thoại: {order.buyerPhone}</p>
        <p>Địa chỉ: {[order.address, order.province].filter(Boolean).join(', ')}</p>
        <p>Phương thức: {order.paymentMethod || 'COD'}</p>
      </div>
      <div className="mt-4 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">
            <Link href={`/san-pham/${item.product?.slug ?? ''}`} className="font-bold">
              {item.product?.name ?? 'Sản phẩm'}
            </Link>
            <p className="mt-1 text-slate-600">
              {item.product?.cooperative?.name} · x{Number(item.quantity)} · {formatVnd(Number(item.unitPrice))}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 font-bold">
        <span>Tổng tiền</span>
        <span className="text-leaf">{formatVnd(Number(order.totalAmount ?? 0))}</span>
      </div>
    </Panel>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Nháp',
    NEW: 'Mới tạo',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang chuẩn bị',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    FULFILLED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
  };
  return labels[status] ?? status;
}
