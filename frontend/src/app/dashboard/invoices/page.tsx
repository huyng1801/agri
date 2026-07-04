'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Pencil, Plus, RefreshCcw, Search, WalletCards, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { API_URL, apiFetch, currentUser } from '@/lib/api';
import { formatCurrency, formatDate, statusTone } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type Cooperative = {
  id: string;
  name: string;
  code: string;
  status: string;
};

type Subscription = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  plan?: {
    id: string;
    name: string;
    priceMonthly: string | number;
    priceYearly: string | number;
  } | null;
} | null;

type Invoice = {
  id: string;
  cooperativeId: string;
  subscriptionId?: string | null;
  invoiceCode: string;
  amount: string | number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  note?: string | null;
  cooperative?: Cooperative | null;
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
};

type InvoiceForm = {
  cooperativeId: string;
  subscriptionId: string;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  dueDate: string;
  paymentMethod: string;
  note: string;
};

const emptyForm: InvoiceForm = {
  cooperativeId: '',
  subscriptionId: '',
  amount: '0',
  currency: 'VND',
  status: 'UNPAID',
  dueDate: dateInputDaysFromNow(7),
  paymentMethod: '',
  note: ''
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cooperativeFilter, setCooperativeFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [downloadingId, setDownloadingId] = useState('');

  const invoices = useQuery({
    queryKey: ['invoices-dashboard', search, statusFilter, cooperativeFilter],
    queryFn: () => apiFetch<ListResponse<Invoice>>(invoicePath({ search, status: statusFilter, cooperativeId: cooperativeFilter }))
  });
  const cooperatives = useQuery({
    queryKey: ['cooperatives-for-invoices'],
    queryFn: () => apiFetch<ListResponse<Cooperative>>('/cooperatives?limit=200&status=ACTIVE'),
    enabled: isSuperAdmin
  });
  const selectedSubscription = useQuery({
    queryKey: ['invoice-selected-subscription', form.cooperativeId],
    queryFn: () => apiFetch<Subscription>(`/cooperatives/${form.cooperativeId}/subscription`),
    enabled: isSuperAdmin && Boolean(form.cooperativeId) && !editingId
  });

  const invoiceItems = listItems(invoices.data?.data);
  const cooperativeItems = listItems(cooperatives.data?.data);
  const stats = useMemo(() => invoiceStats(invoiceItems), [invoiceItems]);

  const saveInvoice = useMutation({
    mutationFn: () =>
      editingId
        ? apiFetch<Invoice>(`/invoices/${editingId}`, { method: 'PATCH', body: JSON.stringify(updatePayload(form)) })
        : apiFetch<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(createPayload(form)) }),
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromInvoice(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['invoices-dashboard'] });
    }
  });

  const markPaid = useMutation({
    mutationFn: (id: string) => apiFetch<Invoice>(`/invoices/${id}/mark-paid`, { method: 'POST', body: JSON.stringify({ paymentMethod: 'manual' }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices-dashboard'] })
  });
  const markUnpaid = useMutation({
    mutationFn: (id: string) => apiFetch<Invoice>(`/invoices/${id}/mark-unpaid`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices-dashboard'] })
  });
  const cancelInvoice = useMutation({
    mutationFn: (id: string) => apiFetch<Invoice>(`/invoices/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices-dashboard'] })
  });

  function update<K extends keyof InvoiceForm>(key: K, value: InvoiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function newInvoice() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function edit(invoice: Invoice) {
    setEditingId(invoice.id);
    setForm(fromInvoice(invoice));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectCooperative(cooperativeId: string) {
    setForm((current) => ({ ...current, cooperativeId, subscriptionId: '', amount: current.amount || '0' }));
  }

  function applyCurrentSubscription() {
    const subscription = selectedSubscription.data?.data;
    if (!subscription?.id) return;
    setForm((current) => ({
      ...current,
      subscriptionId: subscription.id,
      amount: String(subscription.plan?.priceMonthly ?? current.amount)
    }));
  }

  async function downloadPdf(invoice: Invoice) {
    setDownloadingId(invoice.id);
    try {
      const token = window.localStorage.getItem('agri_access_token');
      const response = await fetch(`${API_URL}/invoices/${invoice.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!response.ok) throw new Error('Không tải được PDF hóa đơn');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${invoice.invoiceCode}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(errorMessage(error));
    } finally {
      setDownloadingId('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Hóa đơn SaaS</h1>
          <p className="text-sm text-slate-600">Hóa đơn giữa nền tảng HTXONLINE và HTX, tách biệt với đơn hàng COD.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => invoices.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          {isSuperAdmin && (
            <Button data-testid="invoice-create-button" type="button" onClick={newInvoice}>
              <Plus size={18} aria-hidden="true" />
              Tạo hóa đơn
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng hóa đơn" value={stats.total} />
        <Metric label="Đã thu" value={stats.paid} tone="leaf" />
        <Metric label="Chưa thu" value={stats.unpaid} />
      </div>

      {formOpen && isSuperAdmin && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveInvoice.mutate(); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa hóa đơn' : 'Tạo hóa đơn'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="HTX">
                <Select data-testid="invoice-cooperative-select" value={form.cooperativeId} onChange={(event) => selectCooperative(event.target.value)} disabled={Boolean(editingId)} required>
                  <option value="">Chọn HTX</option>
                  {cooperativeItems.map((cooperative) => (
                    <option key={cooperative.id} value={cooperative.id}>{cooperative.name} ({cooperative.code})</option>
                  ))}
                </Select>
              </Field>
              <Field label="Gói đang dùng">
                <div className="flex gap-2">
                  <Input value={selectedSubscription.data?.data?.plan?.name ?? (form.subscriptionId ? 'Đã gắn subscription' : 'Không gắn')} readOnly className="bg-slate-100 text-slate-600" />
                  {!editingId && selectedSubscription.data?.data?.id && (
                    <Button type="button" variant="ghost" onClick={applyCurrentSubscription}>Dùng gói</Button>
                  )}
                </div>
              </Field>
              <Field label="Số tiền">
                <Input data-testid="invoice-amount-input" type="number" min="0" value={form.amount} onChange={(event) => update('amount', event.target.value)} required />
              </Field>
              <Field label="Tiền tệ">
                <Input value={form.currency} onChange={(event) => update('currency', event.target.value.toUpperCase())} required />
              </Field>
              <Field label="Trạng thái">
                <Select data-testid="invoice-status-select" value={form.status} onChange={(event) => update('status', event.target.value as InvoiceStatus)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="CANCELLED">CANCELLED</option>
                </Select>
              </Field>
              <Field label="Hạn thanh toán">
                <Input data-testid="invoice-dueDate-input" type="date" value={form.dueDate} onChange={(event) => update('dueDate', event.target.value)} required />
              </Field>
              <Field label="Phương thức thanh toán">
                <Input value={form.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)} placeholder="manual, bank-transfer..." />
              </Field>
              <Field label="Ghi chú">
                <Textarea value={form.note} onChange={(event) => update('note', event.target.value)} />
              </Field>
            </div>
            {saveInvoice.isError && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(saveInvoice.error)}</div>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saveInvoice.isPending}>{saveInvoice.isPending ? 'Đang lưu' : 'Lưu hóa đơn'}</Button>
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Xóa form</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0 md:grid-cols-[1fr_170px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hóa đơn hoặc HTX" className="pl-10" />
        </div>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="DRAFT">DRAFT</option>
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

      {invoices.isLoading && <SkeletonList />}
      {invoices.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(invoices.error)}</Panel>}
      {!invoices.isLoading && !invoices.isError && invoiceItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có hóa đơn</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {invoiceItems.map((invoice) => (
          <article key={invoice.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{invoice.invoiceCode}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">{invoice.cooperative?.name ?? invoice.cooperativeId}</p>
              </div>
              <Badge className={statusTone(invoice.status)}>{invoice.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Số tiền" value={formatCurrency(invoice.amount)} />
              <Info label="Gói" value={invoice.subscription?.plan?.name ?? '—'} />
              <Info label="Hạn thanh toán" value={formatDate(invoice.dueDate)} />
              <Info label="Đã thu" value={formatDate(invoice.paidAt)} />
            </div>
            {invoice.note && <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{invoice.note}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {isSuperAdmin && (
                <Button type="button" variant="ghost" onClick={() => edit(invoice)}>
                  <Pencil size={16} aria-hidden="true" />
                  Sửa
                </Button>
              )}
              {isSuperAdmin && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <Button type="button" onClick={() => markPaid.mutate(invoice.id)} disabled={markPaid.isPending}>
                  <WalletCards size={16} aria-hidden="true" />
                  Mark paid
                </Button>
              )}
              {isSuperAdmin && invoice.status === 'PAID' && (
                <Button type="button" variant="ghost" onClick={() => markUnpaid.mutate(invoice.id)} disabled={markUnpaid.isPending}>
                  Mark unpaid
                </Button>
              )}
              {isSuperAdmin && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <Button type="button" variant="danger" onClick={() => cancelInvoice.mutate(invoice.id)} disabled={cancelInvoice.isPending}>
                  <XCircle size={16} aria-hidden="true" />
                  Hủy
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => downloadPdf(invoice)} disabled={downloadingId === invoice.id}>
                <Download size={16} aria-hidden="true" />
                PDF
              </Button>
            </div>
            {(markPaid.isError || markUnpaid.isError || cancelInvoice.isError) && (
              <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage(markPaid.error ?? markUnpaid.error ?? cancelInvoice.error)}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, tone = 'ink' }: { label: string; value: number; tone?: 'ink' | 'leaf' }) {
  return (
    <Panel className="bg-white">
      <FileText className={cn('mb-3', tone === 'leaf' ? 'text-leaf' : 'text-slate-500')} size={22} aria-hidden="true" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tone === 'leaf' ? 'text-leaf' : 'text-ink')}>{value}</p>
    </Panel>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-60 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function createPayload(form: InvoiceForm) {
  return {
    cooperativeId: form.cooperativeId,
    subscriptionId: form.subscriptionId || undefined,
    amount: Number(form.amount || 0),
    currency: form.currency || 'VND',
    status: form.status,
    dueDate: new Date(`${form.dueDate}T23:59:59`).toISOString(),
    paymentMethod: form.paymentMethod || undefined,
    note: form.note || undefined
  };
}

function updatePayload(form: InvoiceForm) {
  return {
    amount: Number(form.amount || 0),
    status: form.status,
    dueDate: new Date(`${form.dueDate}T23:59:59`).toISOString(),
    paymentMethod: form.paymentMethod || undefined,
    note: form.note || undefined
  };
}

function fromInvoice(invoice: Invoice): InvoiceForm {
  return {
    cooperativeId: invoice.cooperativeId,
    subscriptionId: invoice.subscriptionId ?? '',
    amount: String(invoice.amount ?? 0),
    currency: invoice.currency || 'VND',
    status: invoice.status,
    dueDate: dateInputValue(invoice.dueDate),
    paymentMethod: invoice.paymentMethod ?? '',
    note: invoice.note ?? ''
  };
}

function invoicePath({ search, status, cooperativeId }: { search: string; status: string; cooperativeId: string }) {
  const params = new URLSearchParams({ limit: '100' });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (cooperativeId) params.set('cooperativeId', cooperativeId);
  return `/invoices?${params.toString()}`;
}

function invoiceStats(items: Invoice[]) {
  return {
    total: items.length,
    paid: items.filter((item) => item.status === 'PAID').length,
    unpaid: items.filter((item) => ['UNPAID', 'OVERDUE'].includes(item.status)).length
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function dateInputDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateInputValue(value?: string | null) {
  if (!value) return dateInputDaysFromNow(7);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dateInputDaysFromNow(7);
  return date.toISOString().slice(0, 10);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
