'use client';

import Link from 'next/link';
import { CheckCircle2, Phone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LAST_ORDER_STORAGE_KEY, formatVnd } from '@/lib/cart';
import { Button, Panel } from './ui';

type OrderItem = {
  id: string;
  quantity: string | number;
  unitPrice: string | number;
  product?: { name: string; unit: string };
};

type LastOrder = {
  orderCode: string;
  status: string;
  totalAmount: string | number;
  cooperative?: { id: string; name: string; code: string } | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  address?: string | null;
  province?: string | null;
  paymentMethod?: string | null;
  items?: OrderItem[];
};

type CheckoutResult = {
  groupCode?: string | null;
  orders: LastOrder[];
};

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CheckoutResult | null>(null);

  useEffect(() => {
    const value = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!value) return;
    try {
      const parsed = JSON.parse(value) as CheckoutResult | LastOrder;
      if ('orders' in parsed && Array.isArray(parsed.orders)) {
        setResult(parsed);
      } else {
        setResult({ groupCode: null, orders: [parsed as LastOrder] });
      }
    } catch {
      setResult(null);
    }
  }, []);

  const groupCode = result?.groupCode || searchParams.get('groupCode');
  const orders = result?.orders ?? [];

  return (
    <Panel data-testid="order-success" className="mx-auto max-w-4xl text-center">
      <CheckCircle2 className="mx-auto text-leaf" size={44} aria-hidden="true" />
      <h2 className="mt-3 text-xl font-bold">Cảm ơn bạn đã đặt hàng</h2>
      <p className="mt-2 text-sm text-slate-600">HTX hoặc bộ phận vận hành sẽ liên hệ xác nhận đơn hàng.</p>
      {(groupCode || orders.length > 0) && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
      {groupCode && (
        <div className="rounded-xl bg-slate-50 p-4 text-left lg:h-full">
          <p className="text-sm text-slate-600">Mã nhóm đơn</p>
          <p className="text-xl font-bold text-ink">{groupCode}</p>
          <p className="mt-1 text-sm text-slate-600">Dùng mã này để tra cứu tất cả đơn trong cùng lần đặt hàng.</p>
        </div>
      )}
      {orders.length > 0 && (
        <div className="grid gap-3 text-left">
          {orders.map((order) => (
            <div key={order.orderCode} className="rounded-xl bg-mint p-4">
              <p className="text-sm text-slate-600">{order.cooperative?.name ?? 'HTX'}</p>
              <p className="text-2xl font-bold text-leaf">{order.orderCode}</p>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p>Người nhận: {order.buyerName}</p>
                <p>Số điện thoại: {order.buyerPhone}</p>
                <p>Địa chỉ: {[order.address, order.province].filter(Boolean).join(', ')}</p>
                <p>Phương thức: {order.paymentMethod || 'COD'}</p>
                <p className="font-bold">Tổng tiền: {formatVnd(Number(order.totalAmount ?? 0))}</p>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
        <a href="tel:0900000000" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink sm:w-auto">
          <Phone size={18} aria-hidden="true" />
          Gọi hotline
        </a>
        <Link href="/tra-cuu-don-hang">
          <Button variant="ghost" className="w-full sm:w-auto">Tra cứu đơn</Button>
        </Link>
        <Link href="/san-pham">
          <Button className="w-full sm:w-auto">Tiếp tục mua hàng</Button>
        </Link>
      </div>
    </Panel>
  );
}
