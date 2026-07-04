'use client';

import Link from 'next/link';
import { CheckCircle2, Phone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LAST_ORDER_STORAGE_KEY, formatVnd } from '@/lib/cart';
import { Button, Panel } from './ui';

type LastOrder = {
  orderCode: string;
  status: string;
  totalAmount: string | number;
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

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<LastOrder | null>(null);
  const orderCode = order?.orderCode || searchParams.get('orderCode');

  useEffect(() => {
    const value = window.localStorage.getItem(LAST_ORDER_STORAGE_KEY);
    if (!value) return;
    try {
      setOrder(JSON.parse(value) as LastOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <Panel data-testid="order-success" className="text-center">
      <CheckCircle2 className="mx-auto text-leaf" size={44} aria-hidden="true" />
      <h2 className="mt-3 text-xl font-bold">Cảm ơn bạn đã đặt hàng</h2>
      <p className="mt-2 text-sm text-slate-600">HTX hoặc bộ phận vận hành sẽ liên hệ xác nhận đơn hàng.</p>
      {orderCode && (
        <div className="mx-auto mt-4 max-w-md rounded-md bg-mint p-4 text-left">
          <p className="text-sm text-slate-600">Mã đơn hàng</p>
          <p className="text-2xl font-bold text-leaf">{orderCode}</p>
          {order && (
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>Người nhận: {order.buyerName}</p>
              <p>Số điện thoại: {order.buyerPhone}</p>
              <p>Địa chỉ: {[order.address, order.province].filter(Boolean).join(', ')}</p>
              <p>Phương thức: {order.paymentMethod || 'COD'}</p>
              <p className="font-bold">Tổng tiền: {formatVnd(Number(order.totalAmount ?? 0))}</p>
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <a href="tel:0900000000" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink">
          <Phone size={18} aria-hidden="true" />
          Gọi hotline
        </a>
        <Link href="/san-pham">
          <Button>Tiếp tục mua hàng</Button>
        </Link>
      </div>
    </Panel>
  );
}
