'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ClipboardList, ImagePlus, Pencil, Plus, RefreshCcw, Save, Search, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate, statusTone } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type ActivityType = 'SEEDING' | 'WATERING' | 'FERTILIZING' | 'PEST_CONTROL' | 'HARVESTING' | 'PACKAGING' | 'TRANSPORT' | 'OTHER';
type LogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type FileAsset = {
  id: string;
  objectKey: string;
  publicUrl?: string | null;
};

type UploadPlan = {
  objectKey: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  publicUrl?: string;
};

type Product = {
  id: string;
  code: string;
  name: string;
  status: string;
  zoneId?: string | null;
  thumbnail?: { publicUrl?: string | null } | null;
};

type Zone = {
  id: string;
  name: string;
  code: string;
  address?: string | null;
};

type LogImage = {
  url: string;
  fileId?: string;
  name?: string;
};

type FarmingLog = {
  id: string;
  productId: string;
  zoneId?: string | null;
  logDate: string;
  activityType: ActivityType;
  description: string;
  inputMaterialsJson?: unknown[];
  imagesJson?: unknown[];
  status: LogStatus;
  createdAt: string;
  updatedAt: string;
  product?: Product | null;
  zone?: Zone | null;
  actor?: { id: string; fullName: string; email?: string; phone?: string | null } | null;
};

type LogForm = {
  productId: string;
  zoneId: string;
  logDate: string;
  activityType: ActivityType;
  status: LogStatus;
  description: string;
  materials: string;
  images: LogImage[];
};

const activities: Array<[ActivityType, string]> = [
  ['SEEDING', 'Gieo trồng'],
  ['WATERING', 'Tưới nước'],
  ['FERTILIZING', 'Bón phân'],
  ['PEST_CONTROL', 'Phòng trừ sâu bệnh'],
  ['HARVESTING', 'Thu hoạch'],
  ['PACKAGING', 'Đóng gói'],
  ['TRANSPORT', 'Vận chuyển'],
  ['OTHER', 'Khác']
];

const emptyForm: LogForm = {
  productId: '',
  zoneId: '',
  logDate: todayInputDate(),
  activityType: 'SEEDING',
  status: 'PUBLISHED',
  description: '',
  materials: '',
  images: []
};

export default function FarmingLogsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LogForm>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const logs = useQuery({
    queryKey: ['farming-logs-dashboard', search, status],
    queryFn: () => apiFetch<ListResponse<FarmingLog>>(`/farming-logs?limit=80${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${status}` : ''}`)
  });
  const products = useQuery({
    queryKey: ['products-for-farming-logs'],
    queryFn: () => apiFetch<ListResponse<Product>>('/products?limit=120')
  });
  const zones = useQuery({
    queryKey: ['zones-for-farming-logs'],
    queryFn: () => apiFetch<ListResponse<Zone>>('/zones?limit=120&status=ACTIVE')
  });

  const logItems = listItems(logs.data?.data);
  const productItems = listItems(products.data?.data);
  const zoneItems = listItems(zones.data?.data);
  const stats = useMemo(() => logStats(logItems), [logItems]);

  const saveLog = useMutation({
    mutationFn: (statusOverride?: LogStatus) => {
      const payload = logPayload({ ...form, status: statusOverride ?? form.status });
      return editingId
        ? apiFetch<FarmingLog>(`/farming-logs/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<FarmingLog>('/farming-logs', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromLog(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['farming-logs-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-dashboard'] });
    }
  });

  const archiveLog = useMutation({
    mutationFn: (id: string) => apiFetch<FarmingLog>(`/farming-logs/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farming-logs-dashboard'] })
  });

  function update<K extends keyof LogForm>(key: K, value: LogForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function newLog() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function edit(log: FarmingLog) {
    setEditingId(log.id);
    setForm(fromLog(log));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectProduct(productId: string) {
    const product = productItems.find((item) => item.id === productId);
    setForm((current) => ({
      ...current,
      productId,
      zoneId: current.zoneId || product?.zoneId || ''
    }));
  }

  async function uploadEvidence(file: File) {
    if (!file.type.startsWith('image/')) {
      window.alert('Ảnh minh chứng phải là file ảnh');
      return;
    }
    setUploading(true);
    try {
      const plan = await apiFetch<UploadPlan>('/files/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          visibility: 'PUBLIC'
        })
      });
      if (!plan.data.publicUrl) throw new Error('Thiếu R2_PUBLIC_BASE_URL cho ảnh public');
      const uploadResponse = await fetch(plan.data.uploadUrl, {
        method: plan.data.method || 'PUT',
        headers: plan.data.headers,
        body: file
      });
      if (!uploadResponse.ok) throw new Error('Không upload được ảnh minh chứng lên R2');
      const confirmed = await apiFetch<FileAsset>('/files/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          objectKey: plan.data.objectKey,
          publicUrl: plan.data.publicUrl,
          visibility: 'PUBLIC'
        })
      });
      const image = {
        url: confirmed.data.publicUrl || plan.data.publicUrl || '',
        fileId: confirmed.data.id,
        name: file.name
      };
      setForm((current) => ({ ...current, images: [...current.images, image] }));
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
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Nhật ký canh tác</h1>
          <p className="text-sm text-slate-600">Ghi nhận hoạt động sản xuất, ảnh minh chứng R2 và dữ liệu public cho QR Passport.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => logs.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button data-testid="farming-log-create-button" type="button" onClick={newLog}>
            <Plus size={18} aria-hidden="true" />
            Thêm nhật ký
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng nhật ký" value={stats.total} />
        <Metric label="Public" value={stats.published} tone="leaf" />
        <Metric label="Có ảnh" value={stats.withImages} />
      </div>

      {formOpen && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveLog.mutate(undefined); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa nhật ký' : 'Thêm nhật ký'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Sản phẩm">
                    <Select data-testid="farming-log-product-select" value={form.productId} onChange={(event) => selectProduct(event.target.value)} required>
                      <option value="">Chọn sản phẩm</option>
                      {productItems.map((product) => (
                        <option key={product.id} value={product.id}>{product.name} ({product.code})</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Vùng trồng">
                    <Select data-testid="farming-log-zone-select" value={form.zoneId} onChange={(event) => update('zoneId', event.target.value)}>
                      <option value="">Không chọn</option>
                      {zoneItems.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name} ({zone.code})</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ngày nhật ký">
                    <Input data-testid="farming-log-date-input" type="date" max={todayInputDate()} value={form.logDate} onChange={(event) => update('logDate', event.target.value)} required />
                  </Field>
                  <Field label="Hoạt động">
                    <Select data-testid="farming-log-activityType-select" value={form.activityType} onChange={(event) => update('activityType', event.target.value as ActivityType)}>
                      {activities.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Trạng thái">
                    <Select data-testid="farming-log-status-select" value={form.status} onChange={(event) => update('status', event.target.value as LogStatus)}>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </Select>
                  </Field>
                  <Field label="Vật tư đầu vào">
                    <Textarea value={form.materials} onChange={(event) => update('materials', event.target.value)} placeholder="Mỗi dòng một vật tư hoặc ghi chú" />
                  </Field>
                </div>
                <Field label="Nội dung nhật ký">
                  <Textarea data-testid="farming-log-description-editor" value={form.description} onChange={(event) => update('description', event.target.value)} required className="min-h-36" />
                </Field>
              </div>

              <aside className="space-y-4">
                <Panel className="space-y-3 bg-slate-50 shadow-none">
                  <h3 className="font-bold">Ảnh minh chứng</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {form.images.map((image) => (
                      <div key={image.url} className="group relative overflow-hidden rounded-md bg-white">
                        <img src={image.url} alt="" className="aspect-square w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-rose-700 opacity-0 shadow-sm group-hover:opacity-100"
                          onClick={() => setForm((current) => ({ ...current, images: current.images.filter((item) => item.url !== image.url) }))}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    {form.images.length === 0 && (
                      <div className="col-span-2 grid aspect-[4/3] place-items-center rounded-md bg-white text-slate-400">
                        <ImagePlus size={36} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint">
                    <Upload size={18} aria-hidden="true" />
                    {uploading ? 'Đang upload' : 'Upload R2'}
                    <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadEvidence(event.target.files[0])} />
                  </label>
                </Panel>
              </aside>
            </div>

            {saveLog.isError && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(saveLog.error)}</div>}

            <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
              <Button data-testid="farming-log-save-draft-button" type="button" variant="ghost" onClick={() => saveLog.mutate('DRAFT')} disabled={saveLog.isPending}>
                <Save size={18} aria-hidden="true" />
                Lưu nháp
              </Button>
              <Button data-testid="farming-log-publish-button" type="button" onClick={() => saveLog.mutate('PUBLISHED')} disabled={saveLog.isPending}>
                <Save size={18} aria-hidden="true" />
                Publish
              </Button>
              <Button type="submit" disabled={saveLog.isPending}>{saveLog.isPending ? 'Đang lưu' : 'Lưu'}</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo sản phẩm, vùng, nội dung" className="pl-10" />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </Select>
      </div>

      {logs.isLoading && <SkeletonList />}
      {logs.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(logs.error)}</Panel>}
      {!logs.isLoading && !logs.isError && logItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có nhật ký</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {logItems.map((log) => {
          const images = logImages(log.imagesJson);
          return (
            <article key={log.id} className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-lg font-bold text-ink">{log.product?.name ?? 'Sản phẩm'}</h2>
                  <p className="mt-1 text-sm text-slate-500">{activityLabel(log.activityType)} · {formatDate(log.logDate)}</p>
                </div>
                <Badge className={statusTone(log.status)}>{log.status}</Badge>
              </div>
              {images[0]?.url ? (
                <img src={images[0].url} alt="" className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div className="grid aspect-[16/9] place-items-center bg-slate-100 text-slate-400">
                  <ClipboardList size={38} aria-hidden="true" />
                </div>
              )}
              <div className="space-y-3 p-4">
                <p className="line-clamp-3 text-sm leading-6 text-slate-700">{log.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="Vùng" value={log.zone?.name || '—'} />
                  <Info label="Người nhập" value={log.actor?.fullName || '—'} />
                  <Info label="Ảnh" value={String(images.length)} />
                  <Info label="Vật tư" value={String(Array.isArray(log.inputMaterialsJson) ? log.inputMaterialsJson.length : 0)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={() => edit(log)}>
                    <Pencil size={16} aria-hidden="true" />
                    Sửa
                  </Button>
                  <Button type="button" variant="danger" onClick={() => archiveLog.mutate(log.id)} disabled={archiveLog.isPending}>
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
        <div key={index} className="h-72 animate-pulse rounded-md border border-slate-200 bg-white">
          <div className="h-24 p-4">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
          </div>
          <div className="h-36 bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function logPayload(form: LogForm) {
  return {
    productId: form.productId,
    zoneId: form.zoneId || undefined,
    logDate: new Date(`${form.logDate}T00:00:00`).toISOString(),
    activityType: form.activityType,
    description: form.description.trim(),
    inputMaterialsJson: form.materials.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
    imagesJson: form.images,
    status: form.status
  };
}

function fromLog(log: FarmingLog): LogForm {
  return {
    productId: log.productId,
    zoneId: log.zoneId ?? '',
    logDate: dateInputValue(log.logDate),
    activityType: log.activityType,
    status: log.status,
    description: log.description,
    materials: Array.isArray(log.inputMaterialsJson) ? log.inputMaterialsJson.map((item) => String(item)).join('\n') : '',
    images: logImages(log.imagesJson)
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function logImages(value: unknown): LogImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return { url: item };
      if (item && typeof item === 'object' && typeof (item as { url?: unknown }).url === 'string') return item as LogImage;
      return null;
    })
    .filter((item): item is LogImage => Boolean(item?.url));
}

function logStats(items: FarmingLog[]) {
  return {
    total: items.length,
    published: items.filter((item) => item.status === 'PUBLISHED').length,
    withImages: items.filter((item) => logImages(item.imagesJson).length > 0).length
  };
}

function activityLabel(value: ActivityType) {
  return activities.find(([activity]) => activity === value)?.[1] ?? value;
}

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateInputValue(value?: string | null) {
  if (!value) return todayInputDate();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayInputDate();
  return date.toISOString().slice(0, 10);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
