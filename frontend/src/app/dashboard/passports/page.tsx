'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Eye, Link as LinkIcon, Pencil, Plus, QrCode, RefreshCcw, Save, ShieldCheck, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate, statusTone } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, cn } from '@/components/ui';

type PassportStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'EXPIRED';

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type Product = {
  id: string;
  code: string;
  name: string;
  slug: string;
  status: string;
  thumbnail?: { publicUrl?: string | null } | null;
  zone?: { name: string } | null;
};

type Passport = {
  id: string;
  passportCode: string;
  publicSlug: string;
  qrDataUrl?: string | null;
  status: PassportStatus;
  publishedAt?: string | null;
  expiredAt?: string | null;
  viewCount: number;
  productId: string;
  product?: Product | null;
  cooperative?: { name: string; code: string } | null;
  createdAt: string;
  updatedAt: string;
};

type PassportForm = {
  productId: string;
  status: PassportStatus;
  expiredAt: string;
};

const emptyForm: PassportForm = {
  productId: '',
  status: 'PUBLISHED',
  expiredAt: ''
};

export default function PassportsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PassportForm>(emptyForm);

  const passports = useQuery({
    queryKey: ['passports-dashboard', status],
    queryFn: () => apiFetch<ListResponse<Passport>>(`/passports?limit=80${status ? `&status=${status}` : ''}`)
  });
  const products = useQuery({
    queryKey: ['products-for-passports'],
    queryFn: () => apiFetch<ListResponse<Product>>('/products?limit=120&status=PUBLISHED')
  });

  const passportItems = listItems(passports.data?.data);
  const productItems = listItems(products.data?.data);
  const stats = useMemo(() => passportStats(passportItems), [passportItems]);

  const savePassport = useMutation({
    mutationFn: (statusOverride?: PassportStatus) => {
      const payload = passportPayload({ ...form, status: statusOverride ?? form.status }, !editingId);
      return editingId
        ? apiFetch<Passport>(`/passports/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<Passport>('/passports', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromPassport(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['passports-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-dashboard'] });
    }
  });

  const hidePassport = useMutation({
    mutationFn: (id: string) => apiFetch<Passport>(`/passports/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['passports-dashboard'] })
  });

  const setPassportStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: PassportStatus }) =>
      apiFetch<Passport>(`/passports/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['passports-dashboard'] })
  });

  function newPassport() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function edit(passport: Passport) {
    setEditingId(passport.id);
    setForm(fromPassport(passport));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">QR Passport</h1>
          <p className="text-sm text-slate-600">Tạo, publish và theo dõi mã truy xuất nguồn gốc public cho sản phẩm đã publish.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => passports.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button data-testid="passport-create-button" type="button" onClick={newPassport}>
            <Plus size={18} aria-hidden="true" />
            Tạo QR
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng QR" value={stats.total} />
        <Metric label="Đang public" value={stats.published} tone="leaf" />
        <Metric label="Lượt xem" value={stats.views} />
      </div>

      {formOpen && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); savePassport.mutate(undefined); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa QR Passport' : 'Tạo QR Passport'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Sản phẩm đã publish">
                <Select
                  data-testid="passport-product-select"
                  value={form.productId}
                  onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                  disabled={Boolean(editingId)}
                  required
                >
                  <option value="">Chọn sản phẩm</option>
                  {productItems.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} ({product.code})</option>
                  ))}
                </Select>
              </Field>
              <Field label="Trạng thái">
                <Select data-testid="passport-status-select" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as PassportStatus }))}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="HIDDEN">HIDDEN</option>
                  <option value="EXPIRED">EXPIRED</option>
                </Select>
              </Field>
              <Field label="Ngày hết hạn">
                <Input data-testid="passport-expiredAt-input" type="date" min={todayInputDate()} value={form.expiredAt} onChange={(event) => setForm((current) => ({ ...current, expiredAt: event.target.value }))} />
              </Field>
            </div>
            {savePassport.isError && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(savePassport.error)}</div>}
            <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
              <Button data-testid="passport-save-draft-button" type="button" variant="ghost" onClick={() => savePassport.mutate('DRAFT')} disabled={savePassport.isPending}>
                <Save size={18} aria-hidden="true" />
                Lưu nháp
              </Button>
              <Button data-testid="passport-publish-button" type="button" onClick={() => savePassport.mutate('PUBLISHED')} disabled={savePassport.isPending}>
                <ShieldCheck size={18} aria-hidden="true" />
                Publish QR
              </Button>
              <Button type="submit" disabled={savePassport.isPending}>{savePassport.isPending ? 'Đang lưu' : 'Lưu'}</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 flex gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0">
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="HIDDEN">HIDDEN</option>
          <option value="EXPIRED">EXPIRED</option>
        </Select>
      </div>

      {passports.isLoading && <SkeletonList />}
      {passports.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(passports.error)}</Panel>}
      {!passports.isLoading && !passports.isError && passportItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có QR Passport</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {passportItems.map((passport) => {
          const publicUrl = `/passport/${passport.passportCode}`;
          return (
            <article key={passport.id} className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[112px_1fr] gap-3 p-4">
                <div className="grid aspect-square place-items-center rounded-md bg-slate-50">
                  {passport.qrDataUrl ? (
                    <Image src={passport.qrDataUrl} width={104} height={104} alt={`QR ${passport.passportCode}`} className="rounded-md bg-white p-1" />
                  ) : (
                    <QrCode size={46} className="text-slate-400" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusTone(passport.status)}>{passport.status}</Badge>
                    <span className="text-xs text-slate-500">{passport.passportCode}</span>
                  </div>
                  <h2 className="mt-2 line-clamp-2 text-lg font-bold text-ink">{passport.product?.name ?? 'Sản phẩm'}</h2>
                  <p className="mt-1 text-sm text-slate-500">{passport.product?.code ?? passport.publicSlug}</p>
                </div>
              </div>
              <div className="space-y-3 px-4 pb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info icon={Eye} label="Lượt xem" value={String(passport.viewCount)} />
                  <Info icon={CalendarClock} label="Publish" value={formatDate(passport.publishedAt)} />
                  <Info icon={CalendarClock} label="Hết hạn" value={formatDate(passport.expiredAt)} />
                  <Info icon={LinkIcon} label="Vùng" value={passport.product?.zone?.name || '—'} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={() => edit(passport)}>
                    <Pencil size={16} aria-hidden="true" />
                    Sửa
                  </Button>
                  <Link href={publicUrl} target="_blank">
                    <Button type="button" variant="ghost">
                      <LinkIcon size={16} aria-hidden="true" />
                      Public
                    </Button>
                  </Link>
                  {passport.qrDataUrl && (
                    <a className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint" href={passport.qrDataUrl} download={`${passport.passportCode}.png`}>
                      Tải QR
                    </a>
                  )}
                  {passport.status !== 'PUBLISHED' && (
                    <Button type="button" onClick={() => setPassportStatus.mutate({ id: passport.id, nextStatus: 'PUBLISHED' })} disabled={setPassportStatus.isPending}>
                      Publish
                    </Button>
                  )}
                  <Button type="button" variant="danger" onClick={() => hidePassport.mutate(passport.id)} disabled={hidePassport.isPending}>
                    <Trash2 size={16} aria-hidden="true" />
                    Ẩn
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
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
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tone === 'leaf' ? 'text-leaf' : 'text-ink')}>{value}</p>
    </Panel>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div>
      <p className="inline-flex items-center gap-1 text-slate-500">
        <Icon size={14} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-24 w-24 rounded-md bg-slate-100" />
          <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function passportPayload(form: PassportForm, includeProduct: boolean) {
  return {
    ...(includeProduct ? { productId: form.productId || undefined } : {}),
    status: form.status,
    expiredAt: form.expiredAt ? new Date(`${form.expiredAt}T23:59:59`).toISOString() : undefined
  };
}

function fromPassport(passport: Passport): PassportForm {
  return {
    productId: passport.productId,
    status: passport.status,
    expiredAt: dateInputValue(passport.expiredAt)
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function passportStats(items: Passport[]) {
  return {
    total: items.length,
    published: items.filter((item) => item.status === 'PUBLISHED').length,
    views: items.reduce((sum, item) => sum + Number(item.viewCount ?? 0), 0)
  };
}

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
