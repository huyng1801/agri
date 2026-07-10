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
    <Panel data-testid="order-success" className="mx-auto max-w-5xl text-center lg:px-8 lg:py-7">
      <div className="mx-auto max-w-3xl">
        <CheckCircle2 className="mx-auto text-leaf" size={44} aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold sm:text-2xl">Cảm ơn bạn đã đặt hàng</h2>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">HTX hoặc bộ phận vận hành sẽ liên hệ xác nhận đơn hàng.</p>
      </div>

      {(groupCode || orders.length > 0) && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:items-stretch">
          {groupCode && (
            <div className="rounded-2xl bg-slate-50 p-5 text-left lg:flex lg:flex-col lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Mã nhóm đơn</p>
                <p className="mt-2 text-[1.85rem] font-bold leading-tight text-ink">{groupCode}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">Dùng mã này để tra cứu tất cả đơn trong cùng lần đặt hàng.</p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-xl border border-white bg-white/90 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Số HTX</p>
                  <p className="mt-1 text-lg font-bold text-ink">{orders.length || 1}</p>
                </div>
                <div className="rounded-xl border border-white bg-white/90 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trạng thái</p>
                  <p className="mt-1 text-lg font-bold text-leaf">Đã ghi nhận</p>
                </div>
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <div className="grid gap-3 text-left">
              {orders.map((order) => (
                <div key={order.orderCode} className="rounded-2xl bg-mint p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-600">{order.cooperative?.name ?? 'HTX'}</p>
                      <p className="text-[2rem] font-bold leading-tight text-leaf">{order.orderCode}</p>
                    </div>
                    <div className="rounded-xl bg-white/75 px-3 py-2 sm:min-w-[13rem]">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tổng tiền</p>
                      <p className="mt-1 text-xl font-bold text-ink">{formatVnd(Number(order.totalAmount ?? 0))}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <p>
                        <span className="font-semibold text-slate-500">Người nhận:</span> {order.buyerName}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500">Số điện thoại:</span> {order.buyerPhone}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p>
                        <span className="font-semibold text-slate-500">Địa chỉ:</span> {[order.address, order.province].filter(Boolean).join(', ')}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500">Phương thức:</span> {order.paymentMethod || 'COD'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center lg:mt-6">
        <a href="tel:0900000000" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink sm:w-auto">
          <Phone size={18} aria-hidden="true" />
          Gọi hotline
        </a>
        <Link href="/tra-cuu-don-hang">
          <Button variant="ghost" className="w-full sm:w-auto">
            Tra cứu đơn
          </Button>
        </Link>
        <Link href="/san-pham">
          <Button className="w-full sm:w-auto">Tiếp tục mua hàng</Button>
        </Link>
      </div>
    </Panel>
  );
}
