'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Download, PackageCheck, Phone, Printer, RefreshCcw, Search, Truck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type OrderStatus = 'DRAFT' | 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'FULFILLED' | 'CANCELLED';

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type Cooperative = {
  id: string;
  name: string;
  code: string;
  phone?: string | null;
  email?: string | null;
  province?: string | null;
};

type OrderItem = {
  id: string;
  quantity: string | number;
  unitPrice: string | number;
  status: OrderStatus;
  note?: string | null;
  cooperative?: Cooperative | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    unit: string;
    status?: string;
    thumbnail?: { publicUrl?: string | null } | null;
    cooperative?: Cooperative | null;
  } | null;
};

type Order = {
  id: string;
  cooperativeId: string;
  orderCode: string;
  status: OrderStatus;
  tenantStatus?: OrderStatus;
  totalAmount: string | number;
  visibleSubtotal?: number;
  visibleItemsCount?: number;
  buyerName?: string | null;
  buyerPhone?: string | null;
  buyerEmail?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  address?: string | null;
  paymentMethod?: string | null;
  note?: string | null;
  cooperative?: Cooperative | null;
  itemCooperatives?: Cooperative[];
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

const statusFlow: Array<{ status: OrderStatus; label: string; icon: typeof CheckCircle2 }> = [
  { status: 'CONFIRMED', label: 'Xác nhận', icon: CheckCircle2 },
  { status: 'PROCESSING', label: 'Chuẩn bị', icon: PackageCheck },
  { status: 'SHIPPING', label: 'Đang giao', icon: Truck },
  { status: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
  { status: 'CANCELLED', label: 'Hủy', icon: XCircle }
];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cooperativeFilter, setCooperativeFilter] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const orders = useQuery({
    queryKey: ['orders-dashboard', search, statusFilter, cooperativeFilter],
    queryFn: () => apiFetch<ListResponse<Order>>(ordersPath({ search, status: statusFilter, cooperativeId: cooperativeFilter }))
  });
  const cooperatives = useQuery({
    queryKey: ['cooperatives-for-orders'],
    queryFn: () => apiFetch<ListResponse<Cooperative>>('/cooperatives?limit=200&status=ACTIVE'),
    enabled: isSuperAdmin
  });

  const orderItems = listItems(orders.data?.data);
  const cooperativeItems = listItems(cooperatives.data?.data);
  const stats = useMemo(() => orderStats(orderItems, isSuperAdmin), [orderItems, isSuperAdmin]);

  const updateOrder = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ status: OrderStatus; note: string }> }) =>
      apiFetch<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders-dashboard'] })
  });

  function setOrderNote(order: Order, value: string) {
    setNotes((current) => ({ ...current, [order.id]: value }));
  }

  function noteValue(order: Order) {
    if (Object.prototype.hasOwnProperty.call(notes, order.id)) return notes[order.id];
    return order.items.find((item) => item.note)?.note ?? '';
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Đơn hàng COD</h1>
          <p className="text-sm text-slate-600">
            {isSuperAdmin ? 'Theo dõi đơn COD toàn sàn và HTX tham gia từng đơn.' : 'Xử lý đơn có sản phẩm thuộc HTX của bạn, không lẫn dữ liệu HTX khác.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => orders.refetch()} aria-label="Tải lại đơn hàng">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button data-testid="orders-export-button" type="button" variant="ghost" onClick={() => downloadCsv(orderItems, isSuperAdmin)}>
            <Download size={18} aria-hidden="true" />
            Excel CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Tổng đơn" value={stats.total} />
        <Metric label="Đơn mới" value={stats.newOrders} tone="sky" />
        <Metric label="Đang xử lý" value={stats.inProgress} />
        <Metric label="Giá trị COD" value={formatCurrency(stats.amount)} tone="leaf" />
      </div>

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0 md:grid-cols-[1fr_180px_240px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input
            data-testid="orders-search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, khách, số điện thoại, sản phẩm"
            className="pl-10"
          />
        </div>
        <Select data-testid="orders-status-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="NEW">Mới tạo</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="PROCESSING">Đang chuẩn bị</option>
          <option value="SHIPPING">Đang giao</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </Select>
        {isSuperAdmin && (
          <Select value={cooperativeFilter} onChange={(event) => setCooperativeFilter(event.target.value)}>
            <option value="">Tất cả HTX</option>
            {cooperativeItems.map((cooperative) => (
              <option key={cooperative.id} value={cooperative.id}>{cooperative.name}</option>
            ))}
          </Select>
        )}
      </div>

      {orders.isLoading && <SkeletonList />}
      {orders.isError && <Panel data-testid="error-state" className="text-sm font-semibold text-rose-700">{errorMessage(orders.error)}</Panel>}
      {!orders.isLoading && !orders.isError && orderItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có đơn hàng phù hợp.</Panel>}

      <div className="space-y-4">
        {orderItems.map((order) => {
          const currentStatus = order.tenantStatus ?? order.status;
          return (
            <article data-testid="order-card" key={order.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-ink">{order.orderCode}</h2>
                    <Badge className={orderStatusTone(currentStatus)}>{statusLabel(currentStatus)}</Badge>
                    <Badge className="bg-slate-100 text-slate-700">{order.paymentMethod || 'COD'}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Tạo ngày {formatDate(order.createdAt)} · {order.visibleItemsCount ?? order.items.length} sản phẩm hiển thị
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.buyerPhone && (
                    <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint" href={`tel:${order.buyerPhone}`}>
                      <Phone size={16} aria-hidden="true" />
                      Gọi khách
                    </a>
                  )}
                  <Button type="button" variant="ghost" onClick={() => printOrder(order, isSuperAdmin)}>
                    <Printer size={16} aria-hidden="true" />
                    In đơn
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-md bg-slate-50 p-3">
                      {item.product?.thumbnail?.publicUrl ? (
                        <img src={item.product.thumbnail.publicUrl} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
                      ) : (
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-white text-slate-400">
                          <ClipboardList size={22} aria-hidden="true" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink">{item.product?.name ?? 'Sản phẩm'}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.cooperative?.name ?? item.product?.cooperative?.name ?? 'HTX'} · x{Number(item.quantity)} · {formatCurrency(item.unitPrice)} / {item.product?.unit ?? 'đơn vị'}
                            </p>
                          </div>
                          <Badge className={orderStatusTone(item.status)}>{statusLabel(item.status)}</Badge>
                        </div>
                        {item.note && <p className="mt-2 rounded-md bg-white p-2 text-sm text-slate-600">Ghi chú xử lý: {item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="space-y-3 rounded-md border border-slate-200 p-3">
                  <Info label="Khách hàng" value={order.buyerName || 'Chưa có tên'} />
                  <Info label="Số điện thoại" value={order.buyerPhone || '—'} />
                  <Info label="Địa chỉ" value={formatAddress(order)} />
                  {order.buyerEmail && <Info label="Email" value={order.buyerEmail} />}
                  {order.note && <Info label="Ghi chú khách" value={order.note} />}
                  {isSuperAdmin && <Info label="HTX trong đơn" value={(order.itemCooperatives ?? []).map((item) => item.name).join(', ') || order.cooperative?.name || '—'} />}
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-sm text-slate-500">{isSuperAdmin ? 'Tổng đơn' : 'Tạm tính phần HTX'}</p>
                    <p className="mt-1 text-2xl font-bold text-leaf">{formatCurrency(isSuperAdmin ? order.totalAmount : order.visibleSubtotal ?? order.totalAmount)}</p>
                  </div>
                </aside>
              </div>

              {!isSuperAdmin && (
                <div className="mt-4 grid gap-3 rounded-md border border-slate-200 p-3 lg:grid-cols-[1fr_auto]">
                  <label className="space-y-1 text-sm font-semibold text-slate-700">
                    <span>Ghi chú xử lý nội bộ của HTX</span>
                    <Textarea value={noteValue(order)} onChange={(event) => setOrderNote(order, event.target.value)} placeholder="Ví dụ: đã gọi khách, hẹn giao chiều nay..." />
                  </label>
                  <div className="flex flex-wrap items-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => updateOrder.mutate({ id: order.id, payload: { note: noteValue(order) } })} disabled={updateOrder.isPending}>
                      Lưu ghi chú
                    </Button>
                    {statusFlow.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.status}
                          type="button"
                          variant={action.status === 'CANCELLED' ? 'danger' : action.status === currentStatus ? 'ghost' : 'primary'}
                          onClick={() => updateOrder.mutate({ id: order.id, payload: { status: action.status, note: noteValue(order) || undefined } })}
                          disabled={updateOrder.isPending || currentStatus === action.status}
                        >
                          <Icon size={16} aria-hidden="true" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {updateOrder.isError && <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage(updateOrder.error)}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, tone = 'ink' }: { label: string; value: number | string; tone?: 'ink' | 'leaf' | 'sky' }) {
  return (
    <Panel>
      <ClipboardList className={cn('mb-3', tone === 'leaf' && 'text-leaf', tone === 'sky' && 'text-sky-700', tone === 'ink' && 'text-slate-500')} size={22} aria-hidden="true" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tone === 'leaf' ? 'text-leaf' : 'text-ink')}>{value}</p>
    </Panel>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div data-testid="loading-skeleton" className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-6 w-56 rounded bg-slate-200" />
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              <div className="h-20 rounded bg-slate-100" />
              <div className="h-20 rounded bg-slate-100" />
            </div>
            <div className="h-44 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ordersPath({ search, status, cooperativeId }: { search: string; status: string; cooperativeId: string }) {
  const params = new URLSearchParams({ limit: '100' });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (cooperativeId) params.set('cooperativeId', cooperativeId);
  return `/orders?${params.toString()}`;
}

function orderStats(items: Order[], isSuperAdmin: boolean) {
  return {
    total: items.length,
    newOrders: items.filter((item) => (item.tenantStatus ?? item.status) === 'NEW').length,
    inProgress: items.filter((item) => ['CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(item.tenantStatus ?? item.status)).length,
    amount: items.reduce((sum, item) => sum + Number(isSuperAdmin ? item.totalAmount : item.visibleSubtotal ?? item.totalAmount), 0)
  };
}

function formatAddress(order: Order) {
  return [order.address, order.ward, order.district, order.province].filter(Boolean).join(', ') || '—';
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

function orderStatusTone(status?: string) {
  if (status === 'NEW') return 'bg-sky text-slate-700';
  if (['CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(status ?? '')) return 'bg-amber-100 text-amber-800';
  if (['COMPLETED', 'FULFILLED'].includes(status ?? '')) return 'bg-mint text-leaf';
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function downloadCsv(orders: Order[], isSuperAdmin: boolean) {
  const rows = [
    ['Mã đơn', 'Trạng thái', 'Khách hàng', 'Số điện thoại', 'Địa chỉ', 'HTX', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền'],
    ...orders.flatMap((order) =>
      order.items.map((item) => [
        order.orderCode,
        statusLabel(isSuperAdmin ? order.status : item.status),
        order.buyerName || '',
        order.buyerPhone || '',
        formatAddress(order),
        item.cooperative?.name ?? item.product?.cooperative?.name ?? '',
        item.product?.name ?? '',
        String(item.quantity),
        String(item.unitPrice),
        String(Number(item.quantity) * Number(item.unitPrice))
      ])
    )
  ];
  const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `don-cod-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function printOrder(order: Order, isSuperAdmin: boolean) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;
  const rows = order.items
    .map(
      (item) => `<tr><td>${escapeHtml(item.product?.name ?? 'Sản phẩm')}</td><td>${escapeHtml(item.cooperative?.name ?? item.product?.cooperative?.name ?? '')}</td><td>${Number(item.quantity)}</td><td>${escapeHtml(formatCurrency(item.unitPrice))}</td><td>${escapeHtml(formatCurrency(Number(item.quantity) * Number(item.unitPrice)))}</td><td>${escapeHtml(statusLabel(item.status))}</td></tr>`
    )
    .join('');
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(order.orderCode)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h1{font-size:24px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #d1d5db;padding:8px;text-align:left}.meta{line-height:1.7}.total{margin-top:16px;font-size:18px;font-weight:700}</style></head><body><h1>Đơn COD ${escapeHtml(order.orderCode)}</h1><div class="meta"><div>Khách hàng: ${escapeHtml(order.buyerName || '')}</div><div>Số điện thoại: ${escapeHtml(order.buyerPhone || '')}</div><div>Địa chỉ: ${escapeHtml(formatAddress(order))}</div><div>Trạng thái: ${escapeHtml(statusLabel(order.tenantStatus ?? order.status))}</div></div><table><thead><tr><th>Sản phẩm</th><th>HTX</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th><th>Trạng thái</th></tr></thead><tbody>${rows}</tbody></table><div class="total">${isSuperAdmin ? 'Tổng đơn' : 'Tạm tính phần HTX'}: ${escapeHtml(formatCurrency(isSuperAdmin ? order.totalAmount : order.visibleSubtotal ?? order.totalAmount))}</div><script>window.print(); window.close();</script></body></html>`);
  printWindow.document.close();
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] ?? char);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
