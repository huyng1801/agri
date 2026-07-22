'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileCheck2, FileUp, Globe, Pencil, Plus, RefreshCcw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type DashboardFile = {
  id: string;
  objectKey: string;
  publicUrl?: string | null;
  mimeType: string;
  sizeBytes: number;
  visibility?: string;
};

type DashboardProduct = {
  id: string;
  code: string;
  name: string;
  slug?: string;
  status?: string;
};

type DashboardZone = {
  id: string;
  code: string;
  name: string;
  status?: string;
};

type DashboardCertification = {
  id: string;
  cooperativeId: string;
  productId?: string | null;
  zoneId?: string | null;
  name: string;
  issuer?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  fileId?: string | null;
  isPublic: boolean;
  metadataJson?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  product?: DashboardProduct | null;
  zone?: DashboardZone | null;
  file?: DashboardFile | null;
};

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type UploadPlan = {
  objectKey: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  publicUrl?: string;
};

type CertificationForm = {
  name: string;
  issuer: string;
  productId: string;
  zoneId: string;
  issuedAt: string;
  expiresAt: string;
  fileId: string;
  fileUrl: string;
  fileObjectKey: string;
  isPublic: boolean;
  note: string;
};

const emptyForm: CertificationForm = {
  name: '',
  issuer: '',
  productId: '',
  zoneId: '',
  issuedAt: '',
  expiresAt: '',
  fileId: '',
  fileUrl: '',
  fileObjectKey: '',
  isPublic: true,
  note: ''
};

export default function CertificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CertificationForm>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const certifications = useQuery({
    queryKey: ['certifications-dashboard', search, publicFilter],
    queryFn: () => apiFetch<ListResponse<DashboardCertification>>(certificationsPath({ search, publicFilter }))
  });
  const products = useQuery({
    queryKey: ['products-for-certifications'],
    queryFn: () => apiFetch<ListResponse<DashboardProduct>>('/products?limit=200')
  });
  const zones = useQuery({
    queryKey: ['zones-for-certifications'],
    queryFn: () => apiFetch<ListResponse<DashboardZone>>('/zones?limit=200&status=ACTIVE')
  });

  const certificationItems = listItems(certifications.data?.data);
  const productItems = listItems(products.data?.data);
  const zoneItems = listItems(zones.data?.data);
  const stats = useMemo(() => certificationStats(certificationItems), [certificationItems]);

  const saveCertification = useMutation({
    mutationFn: () =>
      editingId
        ? apiFetch<DashboardCertification>(`/certifications/${editingId}`, { method: 'PATCH', body: JSON.stringify(certificationPayload(form)) })
        : apiFetch<DashboardCertification>('/certifications', { method: 'POST', body: JSON.stringify(certificationPayload(form)) }),
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromCertification(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['certifications-dashboard'] });
    }
  });

  const removeCertification = useMutation({
    mutationFn: (id: string) => apiFetch<{ deleted: boolean }>(`/certifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certifications-dashboard'] })
  });

  function update<K extends keyof CertificationForm>(key: K, value: CertificationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function newCertification() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function edit(certification: DashboardCertification) {
    setEditingId(certification.id);
    setForm(fromCertification(certification));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const visibility = form.isPublic ? 'PUBLIC' : 'PRIVATE';
      const plan = await apiFetch<UploadPlan>('/files/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          visibility
        })
      });
      const response = await fetch(plan.data.uploadUrl, {
        method: plan.data.method || 'PUT',
        headers: plan.data.headers,
        body: file
      });
      if (!response.ok) throw new Error('Không upload được file chứng nhận lên R2');
      const confirmed = await apiFetch<DashboardFile>('/files/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          objectKey: plan.data.objectKey,
          publicUrl: plan.data.publicUrl,
          visibility
        })
      });
      setForm((current) => ({
        ...current,
        fileId: confirmed.data.id,
        fileUrl: confirmed.data.publicUrl || plan.data.publicUrl || '',
        fileObjectKey: confirmed.data.objectKey
      }));
    } catch (error) {
      window.alert(errorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Chứng nhận</h1>
          <p className="text-sm text-slate-600">Quản lý chứng nhận công khai của HTX, gắn vào sản phẩm hoặc vùng trồng và đính kèm tài liệu R2.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => certifications.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button data-testid="certification-create-button" type="button" onClick={newCertification}>
            <Plus size={18} aria-hidden="true" />
            Thêm chứng nhận
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng chứng nhận" value={stats.total} />
        <Metric label="Đang công khai" value={stats.publicCount} tone="leaf" />
        <Metric label="Sắp hết hạn 30 ngày" value={stats.expiringSoon} tone="rose" />
      </div>

      {formOpen && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveCertification.mutate(); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa chứng nhận' : 'Thêm chứng nhận'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tên chứng nhận">
                    <Input data-testid="certification-name-input" value={form.name} onChange={(event) => update('name', event.target.value)} required />
                  </Field>
                  <Field label="Đơn vị cấp">
                    <Input value={form.issuer} onChange={(event) => update('issuer', event.target.value)} />
                  </Field>
                  <Field label="Sản phẩm">
                    <Select value={form.productId} onChange={(event) => update('productId', event.target.value)}>
                      <option value="">Chứng nhận cấp HTX</option>
                      {productItems.map((product) => (
                        <option key={product.id} value={product.id}>{product.name} ({product.code})</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Vùng trồng">
                    <Select value={form.zoneId} onChange={(event) => update('zoneId', event.target.value)}>
                      <option value="">Không gắn vùng</option>
                      {zoneItems.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name} ({zone.code})</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ngày cấp">
                    <Input type="date" value={form.issuedAt} onChange={(event) => update('issuedAt', event.target.value)} />
                  </Field>
                  <Field label="Ngày hết hạn">
                    <Input type="date" value={form.expiresAt} onChange={(event) => update('expiresAt', event.target.value)} />
                  </Field>
                </div>

                <Field label="Ghi chú nội bộ">
                  <Textarea value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="Ghi chú thêm nếu cần" />
                </Field>

                <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={form.isPublic} onChange={(event) => update('isPublic', event.target.checked)} />
                  Công khai chứng nhận trên trang sản phẩm và QR Passport
                </label>
              </div>

              <aside className="space-y-4">
                <Panel className="space-y-3 bg-slate-50 shadow-none">
                  <h3 className="font-bold">Tài liệu chứng nhận</h3>
                  <div className="grid aspect-[4/3] place-items-center rounded-md bg-white text-slate-400">
                    <FileCheck2 size={40} aria-hidden="true" />
                  </div>
                  <Input data-testid="certification-file-input" value={form.fileUrl || form.fileObjectKey} readOnly placeholder="PDF hoặc ảnh chứng nhận" className="bg-slate-100 text-slate-600" />
                  <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint">
                    <FileUp size={18} aria-hidden="true" />
                    {uploading ? 'Đang tải tệp lên' : 'Tải PDF/ảnh lên'}
                    <input
                      className="sr-only"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0])}
                    />
                  </label>
                  {form.fileUrl && (
                    <a href={form.fileUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint">
                      <Globe size={18} aria-hidden="true" />
                      Xem tệp đã tải lên
                    </a>
                  )}
                </Panel>
              </aside>
            </div>

            {saveCertification.isError && (
              <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {errorMessage(saveCertification.error)}
              </div>
            )}

            <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
              <Button type="submit" disabled={saveCertification.isPending}>
                {saveCertification.isPending ? 'Đang lưu' : 'Lưu chứng nhận'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Xóa form</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên chứng nhận, đơn vị cấp, sản phẩm" className="pl-10" />
        </div>
        <Select value={publicFilter} onChange={(event) => setPublicFilter(event.target.value)}>
          <option value="">Tất cả trạng thái công khai</option>
          <option value="true">Đang công khai</option>
          <option value="false">Đang ẩn</option>
        </Select>
      </div>

      {certifications.isLoading && <CertificationSkeleton />}
      {certifications.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(certifications.error)}</Panel>}
      {!certifications.isLoading && !certifications.isError && certificationItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có chứng nhận</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certificationItems.map((certification) => (
          <article key={certification.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{certification.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{certification.issuer || 'Đơn vị cấp đang cập nhật'}</p>
              </div>
              <Badge className={certification.isPublic ? 'bg-mint text-leaf' : 'bg-stone-100 text-stone-700'}>
                {certification.isPublic ? 'Công khai' : 'Ẩn'}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Sản phẩm" value={certification.product?.name || 'Cấp HTX'} />
              <Info label="Vùng trồng" value={certification.zone?.name || '—'} />
              <Info label="Ngày cấp" value={formatDate(certification.issuedAt)} />
              <Info label="Hết hạn" value={formatDate(certification.expiresAt)} />
            </div>

            {certification.file && (
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-ink">{fileLabel(certification.file)}</p>
                <p className="mt-1 text-xs">{formatFileSize(certification.file.sizeBytes)} · {certification.file.visibility}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => edit(certification)}>
                <Pencil size={16} aria-hidden="true" />
                Sửa
              </Button>
              {certification.file?.publicUrl && (
                <a href={certification.file.publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint">
                  <Globe size={16} aria-hidden="true" />
                  Xem file
                </a>
              )}
              <Button type="button" variant="danger" onClick={() => removeCertification.mutate(certification.id)} disabled={removeCertification.isPending}>
                <Trash2 size={16} aria-hidden="true" />
                Xóa
              </Button>
            </div>
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

function Metric({ label, value, tone = 'ink' }: { label: string; value: number; tone?: 'ink' | 'leaf' | 'rose' }) {
  return (
    <Panel>
      <ShieldCheck className={cn('mb-3', tone === 'leaf' ? 'text-leaf' : tone === 'rose' ? 'text-rose-700' : 'text-slate-500')} size={22} aria-hidden="true" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tone === 'leaf' ? 'text-leaf' : tone === 'rose' ? 'text-rose-700' : 'text-ink')}>{value}</p>
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

function CertificationSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function certificationsPath({ search, publicFilter }: { search: string; publicFilter: string }) {
  const params = new URLSearchParams({ limit: '80' });
  if (search) params.set('search', search);
  if (publicFilter) params.set('isPublic', publicFilter);
  return `/certifications?${params.toString()}`;
}

function certificationPayload(form: CertificationForm) {
  return {
    name: form.name.trim(),
    issuer: form.issuer || undefined,
    productId: form.productId || undefined,
    zoneId: form.zoneId || undefined,
    issuedAt: form.issuedAt ? new Date(`${form.issuedAt}T00:00:00`).toISOString() : undefined,
    expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : undefined,
    fileId: form.fileId || undefined,
    isPublic: form.isPublic,
    metadataJson: form.note ? { note: form.note } : {}
  };
}

function fromCertification(certification: DashboardCertification): CertificationForm {
  const metadataNote =
    certification.metadataJson && typeof certification.metadataJson.note === 'string' ? certification.metadataJson.note : '';
  return {
    name: certification.name,
    issuer: certification.issuer ?? '',
    productId: certification.productId ?? '',
    zoneId: certification.zoneId ?? '',
    issuedAt: dateInputValue(certification.issuedAt),
    expiresAt: dateInputValue(certification.expiresAt),
    fileId: certification.fileId ?? certification.file?.id ?? '',
    fileUrl: certification.file?.publicUrl ?? '',
    fileObjectKey: certification.file?.objectKey ?? '',
    isPublic: certification.isPublic,
    note: metadataNote
  };
}

function certificationStats(items: DashboardCertification[]) {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return {
    total: items.length,
    publicCount: items.filter((item) => item.isPublic).length,
    expiringSoon: items.filter((item) => {
      if (!item.expiresAt) return false;
      const expiry = new Date(item.expiresAt).getTime();
      return expiry >= now && expiry - now <= thirtyDays;
    }).length
  };
}

function fileLabel(file: DashboardFile) {
  const parts = file.objectKey.split('/');
  return parts[parts.length - 1] || file.objectKey;
}

function formatFileSize(sizeBytes: number) {
  if (!sizeBytes) return '0 B';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
