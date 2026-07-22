'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EyeOff, Globe2, Layers3, MapPinned, Pencil, Plus, RefreshCcw, Route, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type ZoneStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

type DashboardZone = {
  id: string;
  cooperativeId: string;
  name: string;
  code: string;
  address?: string | null;
  areaM2?: string | number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  geojson?: Record<string, unknown> | null;
  isPublic: boolean;
  status: ZoneStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products?: number;
    farmingLogs?: number;
    certifications?: number;
  };
};

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type ZoneForm = {
  name: string;
  code: string;
  address: string;
  areaM2: string;
  latitude: string;
  longitude: string;
  geojsonText: string;
  isPublic: boolean;
  status: ZoneStatus;
};

const emptyForm: ZoneForm = {
  name: '',
  code: '',
  address: '',
  areaM2: '',
  latitude: '',
  longitude: '',
  geojsonText: '',
  isPublic: true,
  status: 'ACTIVE'
};

export default function ZonesPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<ReturnType<typeof currentUser>>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ZoneForm>(emptyForm);

  useEffect(() => {
    setUser(currentUser());
  }, []);

  const zones = useQuery({
    queryKey: ['zones-dashboard', search, statusFilter, publicFilter],
    queryFn: () => apiFetch<ListResponse<DashboardZone>>(zonesPath({ search, statusFilter, publicFilter }))
  });

  const zoneItems = listItems(zones.data?.data);
  const stats = useMemo(() => zoneStats(zoneItems), [zoneItems]);
  const canManage = Boolean(user?.roles.some((role) => role === 'ADMIN_HTX' || role === 'MEMBER_HTX'));
  const canArchive = Boolean(user?.roles.includes('ADMIN_HTX'));

  const saveZone = useMutation({
    mutationFn: () => {
      const payload = zonePayload(form);
      return editingId
        ? apiFetch<DashboardZone>(`/zones/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<DashboardZone>('/zones', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromZone(result.data));
      setFormOpen(true);
      invalidateZoneQueries(queryClient);
    }
  });

  const togglePublic = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      apiFetch<DashboardZone>(`/zones/${id}`, { method: 'PATCH', body: JSON.stringify({ isPublic }) }),
    onSuccess: () => invalidateZoneQueries(queryClient)
  });

  const archiveZone = useMutation({
    mutationFn: (id: string) => apiFetch<DashboardZone>(`/zones/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateZoneQueries(queryClient)
  });

  function update<K extends keyof ZoneForm>(key: K, value: ZoneForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !current.code ? { code: slugifyZoneCode(String(value)) } : {})
    }));
  }

  function newZone() {
    setEditingId(null);
    setForm({ ...emptyForm, code: nextZoneCode() });
    setFormOpen(true);
  }

  function edit(zone: DashboardZone) {
    setEditingId(zone.id);
    setForm(fromZone(zone));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">
            Vùng trồng
          </h1>
          <p className="text-sm text-slate-600">Quản lý vùng trồng, tọa độ, GeoJSON và trạng thái công khai trên sàn public.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => zones.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          {canManage && (
            <Button data-testid="zone-create-button" type="button" onClick={newZone}>
              <Plus size={18} aria-hidden="true" />
              Thêm vùng trồng
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Tổng vùng" value={stats.total} icon={MapPinned} />
        <Metric label="Đang public" value={stats.publicCount} icon={Globe2} tone="leaf" />
        <Metric label="Đang hoạt động" value={stats.activeCount} icon={ShieldCheck} tone="sky" />
        <Metric label="Sản phẩm đang gắn" value={stats.productCount} icon={Layers3} tone="stone" />
      </div>

      {user && !canManage && (
        <Panel className="border-sky/30 bg-sky/10 text-sm text-slate-700">
          Bạn đang ở chế độ chỉ đọc. Vai trò hiện tại có thể xem vùng trồng và trạng thái public, nhưng không thể tạo hoặc chỉnh sửa.
        </Panel>
      )}

      {formOpen && canManage && (
        <Panel className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveZone.mutate();
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">{editingId ? 'Cập nhật vùng trồng' : 'Tạo vùng trồng mới'}</h2>
                <p className="text-sm text-slate-500">Nên chỉ bật public cho vùng đã sẵn sàng hiển thị trên trang sản phẩm, HTX và QR Passport.</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Đóng
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tên vùng trồng">
                    <Input data-testid="zone-name-input" value={form.name} onChange={(event) => update('name', event.target.value)} required />
                  </Field>
                  <Field label="Mã vùng">
                    <Input data-testid="zone-code-input" value={form.code} onChange={(event) => update('code', event.target.value.toUpperCase())} required />
                  </Field>
                  <Field label="Địa chỉ">
                    <Input data-testid="zone-address-input" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Ấp/Xã/Huyện/Tỉnh" />
                  </Field>
                  <Field label="Diện tích (m²)">
                    <Input data-testid="zone-area-input" type="number" min="0" step="0.01" value={form.areaM2} onChange={(event) => update('areaM2', event.target.value)} />
                  </Field>
                  <Field label="Vĩ độ">
                    <Input data-testid="zone-latitude-input" type="number" step="0.000001" value={form.latitude} onChange={(event) => update('latitude', event.target.value)} />
                  </Field>
                  <Field label="Kinh độ">
                    <Input data-testid="zone-longitude-input" type="number" step="0.000001" value={form.longitude} onChange={(event) => update('longitude', event.target.value)} />
                  </Field>
                  <Field label="Trạng thái">
                    <Select value={form.status} onChange={(event) => update('status', event.target.value as ZoneStatus)}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Tạm dừng</option>
                      <option value="ARCHIVED">Lưu trữ</option>
                    </Select>
                  </Field>
                </div>

                <Field label="GeoJSON">
                  <Textarea
                    value={form.geojsonText}
                    onChange={(event) => update('geojsonText', event.target.value)}
                    placeholder='{"type":"Polygon","coordinates":[[[105.1,21.0],[105.2,21.0],[105.2,21.1],[105.1,21.0]]]}'
                    className="min-h-40 font-mono text-sm"
                  />
                </Field>

                <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input data-testid="zone-public-switch" type="checkbox" checked={form.isPublic} onChange={(event) => update('isPublic', event.target.checked)} />
                  Công khai vùng trồng này trên sàn public và QR Passport
                </label>
              </div>

              <aside className="space-y-4">
                <Panel className="space-y-3 bg-slate-50 shadow-none">
                  <h3 className="font-bold">Tóm tắt public</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={form.isPublic ? 'bg-mint text-leaf' : 'bg-stone-100 text-stone-700'}>{form.isPublic ? 'Công khai' : 'Ẩn public'}</Badge>
                    <Badge className={statusTone(form.status)}>{statusLabel(form.status)}</Badge>
                  </div>
                  <Info label="Tên vùng" value={form.name || 'Chưa nhập'} />
                  <Info label="Mã vùng" value={form.code || 'Chưa nhập'} />
                  <Info label="Tọa độ" value={coordinatesText(form.latitude, form.longitude)} />
                  <Info label="Diện tích" value={formatArea(form.areaM2)} />
                  <div className="grid gap-2">
                    <a
                      href={googleMapsUrl(form.latitude, form.longitude)}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink',
                        !hasCoordinates(form.latitude, form.longitude) && 'pointer-events-none opacity-50'
                      )}
                    >
                      <Route size={18} aria-hidden="true" />
                      Mở Google Maps
                    </a>
                  </div>
                </Panel>
              </aside>
            </div>

            {saveZone.isError && (
              <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {errorMessage(saveZone.error)}
              </div>
            )}

            <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
              <Button data-testid="zone-submit-button" type="submit" disabled={saveZone.isPending}>
                {saveZone.isPending ? 'Đang lưu' : editingId ? 'Lưu cập nhật' : 'Tạo vùng trồng'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                Xóa form
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 md:grid-cols-[minmax(0,1fr)_220px_220px] lg:top-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input
            data-testid="zone-search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên vùng, mã vùng, địa chỉ"
            className="pl-10"
          />
        </div>
        <Select data-testid="zone-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Tạm dừng</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </Select>
        <Select data-testid="zone-public-filter" value={publicFilter} onChange={(event) => setPublicFilter(event.target.value)}>
          <option value="">Tất cả trạng thái public</option>
          <option value="true">Đang public</option>
          <option value="false">Đang ẩn</option>
        </Select>
      </div>

      {zones.isLoading && <ZoneSkeleton />}
      {zones.isError && (
        <Panel data-testid="error-state" className="text-rose-700">
          {errorMessage(zones.error)}
        </Panel>
      )}
      {!zones.isLoading && !zones.isError && zoneItems.length === 0 && (
        <Panel data-testid="empty-state" className="text-slate-600">
          Chưa có vùng trồng phù hợp với bộ lọc hiện tại.
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zoneItems.map((zone) => (
          <article key={zone.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{zone.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{zone.code}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge className={zone.isPublic ? 'bg-mint text-leaf' : 'bg-stone-100 text-stone-700'}>{zone.isPublic ? 'Công khai' : 'Ẩn'}</Badge>
                <Badge className={statusTone(zone.status)}>{statusLabel(zone.status)}</Badge>
              </div>
            </div>

            <p className="mt-4 min-h-10 text-sm leading-6 text-slate-600">{zone.address || 'Chưa cập nhật địa chỉ vùng trồng.'}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Diện tích" value={formatArea(zone.areaM2)} />
              <Info label="Tọa độ" value={coordinatesText(zone.latitude, zone.longitude)} />
              <Info label="Sản phẩm" value={String(zone._count?.products ?? 0)} />
              <Info label="Nhật ký" value={String(zone._count?.farmingLogs ?? 0)} />
              <Info label="Chứng nhận" value={String(zone._count?.certifications ?? 0)} />
              <Info label="Cập nhật" value={formatDate(zone.updatedAt)} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {canManage && (
                <Button type="button" variant="ghost" onClick={() => edit(zone)}>
                  <Pencil size={16} aria-hidden="true" />
                  Sửa
                </Button>
              )}
              {canManage && zone.status !== 'ARCHIVED' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => togglePublic.mutate({ id: zone.id, isPublic: !zone.isPublic })}
                  disabled={togglePublic.isPending}
                >
                  {zone.isPublic ? <EyeOff size={16} aria-hidden="true" /> : <Globe2 size={16} aria-hidden="true" />}
                  {zone.isPublic ? 'Ẩn public' : 'Bật public'}
                </Button>
              )}
              <a
                href={googleMapsUrl(zone.latitude, zone.longitude)}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint',
                  !hasCoordinates(zone.latitude, zone.longitude) && 'pointer-events-none opacity-50'
                )}
              >
                <Route size={16} aria-hidden="true" />
                Bản đồ
              </a>
              {canArchive && zone.status !== 'ARCHIVED' && (
                <Button type="button" variant="danger" onClick={() => archiveZone.mutate(zone.id)} disabled={archiveZone.isPending}>
                  <Trash2 size={16} aria-hidden="true" />
                  Lưu trữ
                </Button>
              )}
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

function Metric({
  label,
  value,
  icon: Icon,
  tone = 'ink'
}: {
  label: string;
  value: number;
  icon: typeof MapPinned;
  tone?: 'ink' | 'leaf' | 'sky' | 'stone';
}) {
  return (
    <Panel>
      <Icon
        className={cn(
          'mb-3',
          tone === 'leaf' && 'text-leaf',
          tone === 'sky' && 'text-sky',
          tone === 'stone' && 'text-stone-500',
          tone === 'ink' && 'text-slate-500'
        )}
        size={22}
        aria-hidden="true"
      />
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={cn(
          'mt-1 text-3xl font-bold',
          tone === 'leaf' && 'text-leaf',
          tone === 'sky' && 'text-sky',
          tone === 'stone' && 'text-stone-700',
          tone === 'ink' && 'text-ink'
        )}
      >
        {value}
      </p>
    </Panel>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-ink">{value}</p>
    </div>
  );
}

function ZoneSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
          <div className="mt-6 h-12 rounded bg-slate-100" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function zonesPath({ search, statusFilter, publicFilter }: { search: string; statusFilter: string; publicFilter: string }) {
  const params = new URLSearchParams({ limit: '80' });
  if (search) params.set('search', search);
  if (statusFilter) params.set('status', statusFilter);
  if (publicFilter) params.set('isPublic', publicFilter);
  return `/zones?${params.toString()}`;
}

function zonePayload(form: ZoneForm) {
  const geojsonText = form.geojsonText.trim();
  let geojson: Record<string, unknown> | undefined;
  if (geojsonText) {
    const parsed = JSON.parse(geojsonText) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('GeoJSON phải là object JSON hợp lệ');
    }
    geojson = parsed as Record<string, unknown>;
  }
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    address: emptyToUndefined(form.address),
    areaM2: parseOptionalNumber(form.areaM2),
    latitude: parseOptionalNumber(form.latitude),
    longitude: parseOptionalNumber(form.longitude),
    geojson,
    isPublic: form.isPublic,
    status: form.status
  };
}

function fromZone(zone: DashboardZone): ZoneForm {
  return {
    name: zone.name,
    code: zone.code,
    address: zone.address ?? '',
    areaM2: stringValue(zone.areaM2),
    latitude: stringValue(zone.latitude),
    longitude: stringValue(zone.longitude),
    geojsonText: zone.geojson ? JSON.stringify(zone.geojson, null, 2) : '',
    isPublic: zone.isPublic,
    status: zone.status
  };
}

function zoneStats(items: DashboardZone[]) {
  return {
    total: items.length,
    publicCount: items.filter((item) => item.isPublic).length,
    activeCount: items.filter((item) => item.status === 'ACTIVE').length,
    productCount: items.reduce((sum, item) => sum + (item._count?.products ?? 0), 0)
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error('Tọa độ hoặc diện tích không hợp lệ');
  return parsed;
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function stringValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function formatArea(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 'Chưa cập nhật';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(parsed)} m²`;
}

function coordinatesText(latitude: string | number | null | undefined, longitude: string | number | null | undefined) {
  if (!hasCoordinates(latitude, longitude)) return 'Chưa cập nhật';
  return `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
}

function hasCoordinates(latitude: string | number | null | undefined, longitude: string | number | null | undefined) {
  if (latitude === null || latitude === undefined || latitude === '') return false;
  if (longitude === null || longitude === undefined || longitude === '') return false;
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
}

function googleMapsUrl(latitude: string | number | null | undefined, longitude: string | number | null | undefined) {
  if (!hasCoordinates(latitude, longitude)) return '#';
  return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function statusLabel(status: ZoneStatus) {
  if (status === 'ACTIVE') return 'Hoạt động';
  if (status === 'INACTIVE') return 'Tạm dừng';
  return 'Lưu trữ';
}

function statusTone(status: ZoneStatus) {
  if (status === 'ACTIVE') return 'bg-mint text-leaf';
  if (status === 'INACTIVE') return 'bg-amber-100 text-amber-700';
  return 'bg-stone-100 text-stone-700';
}

function nextZoneCode() {
  return `ZONE-${Date.now().toString().slice(-6)}`;
}

function slugifyZoneCode(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function invalidateZoneQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['zones-dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['zones-for-products'] });
  queryClient.invalidateQueries({ queryKey: ['zones-for-certifications'] });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
