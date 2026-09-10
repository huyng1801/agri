'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, MapPinned, Plus, QrCode, RefreshCcw, Sprout, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { apiFetch as rawApiFetch, currentUser, type ApiEnvelope } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type ListResponse<T> = { data: T[]; meta?: { total?: number; totalPages?: number } };
type ApiItem<T> = { data: T };
type CropType = { id: string; code: string; name: string; isActive: boolean };
type Zone = { id: string; code: string; name: string; address?: string | null; latitude?: string | number | null; longitude?: string | number | null };
type Tree = {
  id: string;
  treeCode: string;
  cooperativeId: string;
  zoneId: string;
  cropTypeId: string;
  variety?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  plantedDate?: string | null;
  status: string;
  publicVerified: boolean;
  note?: string | null;
  zone?: Zone;
  cropType?: CropType;
  traceabilityCode?: { id: string; code: string; qrDataUrl?: string | null; status: string } | null;
  events?: TreeEvent[];
  harvests?: Harvest[];
  _count?: { events?: number; harvests?: number; lotTrees?: number };
};
type TreeEvent = { id: string; treeId: string; eventDate: string; eventType: string; description: string; status: string; inputs?: Array<{ materialName: string; quantity?: string | number | null; unit?: string | null }> };
type Harvest = { id: string; treeId: string; harvestDate: string; quantity: string | number; unit: string; status: string; tree?: Tree; lotTrees?: Array<{ lot?: { lotCode: string } }> };
type Lot = { id: string; lotCode: string; unit: string; totalQuantity: string | number; status: string; harvestDate?: string | null; packagingDate?: string | null; zone?: Zone | null; cropType?: CropType | null; lotTrees?: Array<{ tree?: { treeCode: string }; harvest?: Harvest }>; productBatches?: ProductBatch[] };
type Product = { id: string; code: string; name: string; unit: string; status: string; publicVerified?: boolean };
type ProductBatch = { id: string; productCode: string; quantity: string | number; unit: string; harvestDate?: string | null; packagingDate?: string | null; status: string; publicVerified: boolean; product?: Product; lot?: Lot; traceabilityCode?: TraceabilityCode | null };
type TraceabilityCode = { id: string; code: string; publicSlug: string; codeType: string; status: string; qrDataUrl?: string | null; tree?: { treeCode: string } | null; productBatch?: { productCode: string } | null };

type UnwrappedList<T> = T extends ListResponse<infer Item> ? Item[] : T;

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<UnwrappedList<T>>> {
  const response = await rawApiFetch<T>(path, init);
  const value = response.data as T;
  const data = value && typeof value === 'object' && 'data' in value && Array.isArray((value as ListResponse<unknown>).data)
    ? (value as ListResponse<unknown>).data
    : value;
  return { ...response, data: data as UnwrappedList<T> };
}

const eventTypes = [
  ['WATERING', 'Tưới nước'],
  ['FERTILIZING', 'Bón phân'],
  ['SPRAYING', 'Phun thuốc'],
  ['PRUNING', 'Cắt tỉa'],
  ['WEEDING', 'Làm cỏ'],
  ['FLOWERING', 'Ra hoa'],
  ['FRUITING', 'Đậu quả'],
  ['PEST_CONTROL', 'Sâu bệnh'],
  ['INSPECTION', 'Kiểm tra'],
  ['OTHER', 'Khác']
] as const;

const statusLabels: Record<string, string> = {
  ACTIVE: 'Đang sinh trưởng',
  NEEDS_ATTENTION: 'Cần theo dõi',
  ALERT: 'Có cảnh báo',
  HARVESTED: 'Đã thu hoạch',
  INACTIVE: 'Không hoạt động',
  DRAFT: 'Bản nháp',
  OPEN: 'Đang mở',
  PACKED: 'Đã đóng gói',
  PUBLISHED: 'Đang công khai',
  RECORDED: 'Đã ghi nhận',
  ALLOCATED: 'Đã phân bổ',
  PACKAGED: 'Đã đóng gói'
};

export function TreesDashboard({ detailId }: { detailId?: string }) {
  if (detailId) return <TreeDetailDashboard id={detailId} />;
  return <TreesListDashboard />;
}

function TreesListDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<ReturnType<typeof currentUser>>(null);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ zoneId: '', cropTypeId: '', variety: '', plantedDate: '', latitude: '', longitude: '', publicVerified: false, note: '' });
  useEffect(() => setUser(currentUser()), []);
  const trees = useQuery({ queryKey: ['plant-trees', search], queryFn: () => apiFetch<ListResponse<Tree>>(`/trees?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`) });
  const zones = useQuery({ queryKey: ['plant-zones'], queryFn: () => apiFetch<ListResponse<Zone>>('/zones?limit=100') });
  const cropTypes = useQuery({ queryKey: ['crop-types'], queryFn: () => apiFetch<ListResponse<CropType>>('/crop-types?limit=100') });
  const save = useMutation({
    mutationFn: () => apiFetch<Tree>('/trees', { method: 'POST', body: JSON.stringify({ ...form, latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined, plantedDate: form.plantedDate ? new Date(form.plantedDate).toISOString() : undefined }) }),
    onSuccess: () => {
      setForm({ zoneId: '', cropTypeId: '', variety: '', plantedDate: '', latitude: '', longitude: '', publicVerified: false, note: '' });
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['plant-trees'] });
    }
  });
  const items = trees.data?.data ?? [];
  const stats = { total: items.length, active: items.filter((tree) => tree.status === 'ACTIVE').length, attention: items.filter((tree) => ['NEEDS_ATTENTION', 'ALERT'].includes(tree.status)).length, harvested: items.filter((tree) => tree.status === 'HARVESTED').length };
  const canCreate = Boolean(user?.roles.some((role) => ['SUPER_ADMIN', 'ADMIN_HTX', 'MEMBER_HTX', 'FARMER'].includes(role)));

  return (
    <div className="space-y-5" data-testid="trees-screen">
      <PageHeader icon={Sprout} eyebrow="Hồ chiếu cây" title="Mỗi cây một hồ sơ sống" description="Định danh từng cá thể, ghi nhận vòng đời và nối thẳng dữ liệu thu hoạch về lô sản phẩm." onRefresh={() => trees.refetch()} action={canCreate ? <Button onClick={() => setFormOpen((open) => !open)}><Plus size={18} />{formOpen ? 'Đóng form' : 'Tạo hồ sơ cây'}</Button> : null} />
      <div className="grid gap-3 sm:grid-cols-4"><Metric label="Tổng cây" value={stats.total} icon={Sprout} /><Metric label="Đang sinh trưởng" value={stats.active} icon={CheckCircle2} tone="green" /><Metric label="Cần theo dõi" value={stats.attention} icon={TriangleAlert} tone="amber" /><Metric label="Đã thu hoạch" value={stats.harvested} icon={QrCode} tone="sky" /></div>

      {formOpen && canCreate && <Panel className="border-emerald-200 bg-emerald-50/50"><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}><div><h2 className="text-lg font-bold text-ink">Tạo hộ chiếu cây</h2><p className="text-sm text-slate-600">Mã cây sẽ tự sinh theo dạng `LOAI-MA_VUNG-000001` và không đổi sau khi cấp.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Field label="Vùng sản xuất"><Select required value={form.zoneId} onChange={(event) => setForm({ ...form, zoneId: event.target.value })}><option value="">Chọn vùng</option>{(zones.data?.data ?? []).map((zone) => <option key={zone.id} value={zone.id}>{zone.code} · {zone.name}</option>)}</Select></Field><Field label="Loại cây"><Select required value={form.cropTypeId} onChange={(event) => setForm({ ...form, cropTypeId: event.target.value })}><option value="">Chọn loại cây</option>{(cropTypes.data?.data ?? []).map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</Select></Field><Field label="Giống cây"><Input value={form.variety} onChange={(event) => setForm({ ...form, variety: event.target.value })} placeholder="Dona, Cát Chu..." /></Field><Field label="Ngày trồng"><Input type="date" value={form.plantedDate} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setForm({ ...form, plantedDate: event.target.value })} /></Field><Field label="Vĩ độ (nội bộ)"><Input type="number" step="0.000001" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} /></Field><Field label="Kinh độ (nội bộ)"><Input type="number" step="0.000001" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} /></Field></div><Field label="Ghi chú"><Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Đặc điểm nhận diện, tình trạng ban đầu..." /></Field><label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.publicVerified} onChange={(event) => setForm({ ...form, publicVerified: event.target.checked })} /> Đã xác minh cho phép hiển thị công khai</label>{save.isError && <ErrorMessage error={save.error} />}<Button type="submit" disabled={save.isPending}>{save.isPending ? 'Đang tạo...' : 'Tạo hộ chiếu cây'}</Button></form></Panel>}

      <Panel className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Danh sách cá thể cây</h2><p className="text-sm text-slate-500">Chọn một cây để xem timeline, thu hoạch và mã QR.</p></div><div className="flex gap-2"><Input aria-label="Tìm cây" placeholder="Tìm mã cây, giống, vùng..." value={search} onChange={(event) => setSearch(event.target.value)} /><Button variant="ghost" onClick={() => trees.refetch()} aria-label="Tải lại danh sách"><RefreshCcw size={18} /></Button></div></div>{trees.isError && <ErrorMessage error={trees.error} />}{!trees.isLoading && !items.length && <EmptyState label="Chưa có hồ sơ cây" /> }<div className="grid gap-3 lg:grid-cols-2">{items.map((tree) => <TreeCard key={tree.id} tree={tree} />)}</div></Panel>
    </div>
  );
}

function TreeDetailDashboard({ id }: { id: string }) {
  const tree = useQuery({ queryKey: ['plant-tree', id], queryFn: () => apiFetch<Tree>(`/trees/${id}`) });
  const value = tree.data?.data;
  if (tree.isLoading) return <LoadingPanel />;
  if (tree.isError || !value) return <ErrorMessage error={tree.error} />;
  const timeline = [...(value.events ?? []), ...(value.harvests ?? []).map((harvest) => ({ ...harvest, eventDate: harvest.harvestDate, eventType: 'HARVESTING', description: `Thu hoạch ${harvest.quantity} ${harvest.unit}` }))].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  return <div className="space-y-5" data-testid="tree-detail-screen"><Link href="/dashboard/trees" className="text-sm font-bold text-emerald-700 hover:underline">← Về danh sách cây</Link><PageHeader icon={Sprout} eyebrow="Hộ chiếu cá thể" title={value.treeCode} description={`${value.cropType?.name ?? 'Nông sản'}${value.variety ? ` · ${value.variety}` : ''} · ${value.zone?.name ?? 'Chưa gắn vùng'}`} action={value.publicVerified ? <Link href={`/cay/${encodeURIComponent(value.treeCode)}`} target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink"><ExternalLink size={17} />Xem bản public</Link> : null} /><div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]"><Panel className="space-y-5"><div className="flex flex-wrap items-center gap-2"><Badge className={statusTone(value.status)}>{statusLabels[value.status] ?? value.status}</Badge>{value.publicVerified && <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2 size={14} />Đã xác minh public</Badge>}</div><div className="grid gap-4 sm:grid-cols-2"><Info label="Loại cây / giống" value={`${value.cropType?.name ?? '—'}${value.variety ? ` / ${value.variety}` : ''}`} /><Info label="Ngày trồng" value={value.plantedDate ? formatDate(value.plantedDate) : 'Chưa cập nhật'} /><Info label="Vùng sản xuất" value={`${value.zone?.code ?? '—'} · ${value.zone?.name ?? '—'}`} /><Info label="Tọa độ nội bộ" value={coordinates(value.latitude, value.longitude)} /></div><div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-800">Chuỗi truy xuất</p><p className="mt-2 text-sm font-semibold text-slate-700">Cây → Nhật ký → Thu hoạch → Lô → Sản phẩm → QR</p></div></Panel><Panel className="space-y-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Mã truy xuất cây</p><p className="mt-2 font-mono text-sm font-bold text-ink">{value.traceabilityCode?.code ?? 'Chưa cấp mã'}</p></div>{value.traceabilityCode?.qrDataUrl ? <img src={value.traceabilityCode.qrDataUrl} alt={`QR ${value.treeCode}`} className="mx-auto h-48 w-48 rounded-xl border border-slate-200 p-2" /> : <div className="grid h-48 place-items-center rounded-xl bg-slate-50 text-center text-sm text-slate-500"><QrCode className="mb-2 text-emerald-700" size={38} /><span>Cấp mã QR sau khi hồ sơ được xác minh</span></div>}</Panel></div><Panel><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700">Timeline vòng đời</p><h2 className="mt-1 text-xl font-bold">Dữ liệu phát sinh theo thời gian</h2></div>{!timeline.length ? <EmptyState label="Chưa có sự kiện hoặc thu hoạch" /> : <div className="relative ml-2 border-l-2 border-emerald-100 pl-6">{timeline.map((event) => <div key={`${event.eventType}-${event.id}`} className="relative pb-7 last:pb-0"><span className="absolute -left-[35px] top-1 grid h-4 w-4 place-items-center rounded-full border-4 border-white bg-emerald-600 shadow-sm" /><p className="text-xs font-semibold text-slate-500">{formatDate(event.eventDate)}</p><h3 className="mt-1 font-bold text-ink">{eventTypeLabel(event.eventType)}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{event.description}</p>{'inputs' in event && event.inputs?.length ? <p className="mt-2 text-xs text-slate-500">Vật tư: {event.inputs.map((input) => `${input.materialName}${input.quantity ? ` (${input.quantity} ${input.unit ?? ''})` : ''}`).join(', ')}</p> : null}</div>)}</div>}</Panel></div>;
}

export function TreeEventsDashboard() {
  const [selectedTree, setSelectedTree] = useState('');
  const [form, setForm] = useState({ eventDate: new Date().toISOString().slice(0, 10), eventType: 'INSPECTION', description: '', materialName: '', quantity: '', unit: '' });
  const queryClient = useQueryClient();
  const trees = useQuery({ queryKey: ['event-trees'], queryFn: () => apiFetch<ListResponse<Tree>>('/trees?limit=100') });
  useEffect(() => { if (!selectedTree && trees.data?.data?.[0]) setSelectedTree(trees.data.data[0].id); }, [selectedTree, trees.data]);
  const events = useQuery({ queryKey: ['tree-events', selectedTree], queryFn: () => apiFetch<ListResponse<TreeEvent>>(`/trees/${selectedTree}/events?limit=100`), enabled: Boolean(selectedTree) });
  const create = useMutation({ mutationFn: () => apiFetch<TreeEvent>(`/trees/${selectedTree}/events`, { method: 'POST', body: JSON.stringify({ eventDate: new Date(form.eventDate).toISOString(), eventType: form.eventType, description: form.description, inputs: form.materialName ? [{ materialName: form.materialName, quantity: form.quantity ? Number(form.quantity) : undefined, unit: form.unit || undefined }] : [] }) }), onSuccess: () => { setForm({ ...form, description: '', materialName: '', quantity: '', unit: '' }); queryClient.invalidateQueries({ queryKey: ['tree-events', selectedTree] }); queryClient.invalidateQueries({ queryKey: ['plant-tree', selectedTree] }); } });
  return <div className="space-y-5" data-testid="tree-events-screen"><PageHeader icon={RefreshCcw} eyebrow="Nhật ký cây" title="Ghi nhận đúng cá thể" description="Mỗi hoạt động được gắn với mã cây, người thực hiện và thời điểm cụ thể." /><div className="grid gap-4 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]"><Panel><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}><Field label="Chọn cây"><Select required value={selectedTree} onChange={(event) => setSelectedTree(event.target.value)}><option value="">Chọn hồ sơ cây</option>{(trees.data?.data ?? []).map((tree) => <option key={tree.id} value={tree.id}>{tree.treeCode} · {tree.cropType?.name}</option>)}</Select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Ngày ghi nhận"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} /></Field><Field label="Loại hoạt động"><Select value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value })}>{eventTypes.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</Select></Field></div><Field label="Mô tả"><Textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ví dụ: Kiểm tra tán cây, phát hiện..." /></Field><div className="grid gap-3 sm:grid-cols-3"><Field label="Vật tư"><Input value={form.materialName} onChange={(event) => setForm({ ...form, materialName: event.target.value })} placeholder="Tên vật tư" /></Field><Field label="Liều lượng"><Input type="number" min="0" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></Field><Field label="Đơn vị"><Input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="kg, lít..." /></Field></div>{create.isError && <ErrorMessage error={create.error} />}<Button type="submit" disabled={!selectedTree || create.isPending}>{create.isPending ? 'Đang lưu...' : 'Lưu nhật ký cây'}</Button></form></Panel><Panel><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Timeline nhật ký</h2><p className="text-sm text-slate-500">{selectedTree ? 'Các bản ghi mới nhất của cây đã chọn.' : 'Chọn cây để xem dữ liệu.'}</p></div></div>{events.isError && <ErrorMessage error={events.error} />}{!events.isLoading && !(events.data?.data ?? []).length && <EmptyState label="Chưa có nhật ký cho cây này" />}<div className="space-y-3">{(events.data?.data ?? []).map((event) => <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{eventTypeLabel(event.eventType)}</Badge><span className="text-xs font-semibold text-slate-500">{formatDate(event.eventDate)}</span></div><p className="mt-2 text-sm text-slate-700">{event.description}</p></div>)}</div></Panel></div></div>;
}

export function HarvestsDashboard() {
  const queryClient = useQueryClient();
  const [selectedTree, setSelectedTree] = useState('');
  const [form, setForm] = useState({ harvestDate: new Date().toISOString().slice(0, 10), quantity: '', unit: 'kg', note: '' });
  const trees = useQuery({ queryKey: ['harvest-trees'], queryFn: () => apiFetch<ListResponse<Tree>>('/trees?limit=100') });
  const harvests = useQuery({ queryKey: ['harvests'], queryFn: () => apiFetch<ListResponse<Harvest>>('/harvests?limit=100') });
  const create = useMutation({ mutationFn: () => apiFetch<Harvest>(`/trees/${selectedTree}/harvests`, { method: 'POST', body: JSON.stringify({ harvestDate: new Date(form.harvestDate).toISOString(), quantity: Number(form.quantity), unit: form.unit, note: form.note }) }), onSuccess: () => { setForm({ ...form, quantity: '', note: '' }); queryClient.invalidateQueries({ queryKey: ['harvests'] }); queryClient.invalidateQueries({ queryKey: ['harvest-trees'] }); } });
  return <div className="space-y-5" data-testid="harvests-screen"><PageHeader icon={Sprout} eyebrow="Thu hoạch" title="Nối sản lượng về đúng cây" description="Ghi nhận từng lần thu hoạch trước khi phân bổ vào lô sản phẩm." /><div className="grid gap-4 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]"><Panel><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}><Field label="Cây thu hoạch"><Select required value={selectedTree} onChange={(event) => setSelectedTree(event.target.value)}><option value="">Chọn cây</option>{(trees.data?.data ?? []).map((tree) => <option key={tree.id} value={tree.id}>{tree.treeCode} · {tree.cropType?.name}</option>)}</Select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Ngày thu hoạch"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.harvestDate} onChange={(event) => setForm({ ...form, harvestDate: event.target.value })} /></Field><Field label="Sản lượng"><Input required type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></Field></div><Field label="Đơn vị"><Input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} /></Field><Field label="Ghi chú"><Textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></Field>{create.isError && <ErrorMessage error={create.error} />}<Button type="submit" disabled={!selectedTree || !form.quantity || create.isPending}><Plus size={18} />{create.isPending ? 'Đang lưu...' : 'Ghi nhận thu hoạch'}</Button></form></Panel><Panel><h2 className="text-lg font-bold">Lịch sử thu hoạch</h2><div className="mt-4 space-y-3">{(harvests.data?.data ?? []).map((harvest) => <div key={harvest.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-ink">{harvest.tree?.treeCode ?? harvest.treeId}</p><p className="text-sm text-slate-500">{formatDate(harvest.harvestDate)} · {statusLabels[harvest.status] ?? harvest.status}</p></div><p className="text-lg font-extrabold text-emerald-700">{harvest.quantity} {harvest.unit}</p></div>)}{!harvests.isLoading && !(harvests.data?.data ?? []).length && <EmptyState label="Chưa có lần thu hoạch nào" />}</div></Panel></div></div>;
}

export function LotsDashboard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ lotCode: '', unit: 'kg', harvestDate: new Date().toISOString().slice(0, 10), packagingDate: '', zoneId: '', cropTypeId: '' });
  const [allocation, setAllocation] = useState({ lotId: '', harvestId: '', quantity: '' });
  const zones = useQuery({ queryKey: ['lot-zones'], queryFn: () => apiFetch<ListResponse<Zone>>('/zones?limit=100') });
  const cropTypes = useQuery({ queryKey: ['lot-crops'], queryFn: () => apiFetch<ListResponse<CropType>>('/crop-types?limit=100') });
  const lots = useQuery({ queryKey: ['lots'], queryFn: () => apiFetch<ListResponse<Lot>>('/lots?limit=100') });
  const harvests = useQuery({ queryKey: ['lot-harvests'], queryFn: () => apiFetch<ListResponse<Harvest>>('/harvests?limit=100') });
  const createLot = useMutation({ mutationFn: () => apiFetch<Lot>('/lots', { method: 'POST', body: JSON.stringify({ ...form, lotCode: form.lotCode || undefined, harvestDate: form.harvestDate ? new Date(form.harvestDate).toISOString() : undefined, packagingDate: form.packagingDate ? new Date(form.packagingDate).toISOString() : undefined }) }), onSuccess: () => { setForm({ ...form, lotCode: '' }); queryClient.invalidateQueries({ queryKey: ['lots'] }); } });
  const allocate = useMutation({ mutationFn: () => apiFetch<Lot>(`/lots/${allocation.lotId}/trees`, { method: 'POST', body: JSON.stringify({ harvestId: allocation.harvestId, quantity: Number(allocation.quantity), unit: 'kg' }) }), onSuccess: () => { setAllocation({ ...allocation, quantity: '' }); queryClient.invalidateQueries({ queryKey: ['lots'] }); queryClient.invalidateQueries({ queryKey: ['lot-harvests'] }); } });
  return <div className="space-y-5" data-testid="lots-screen"><PageHeader icon={MapPinned} eyebrow="Lô sản phẩm" title="Gom nhiều cây thành một lô minh bạch" description="Chỉ sản lượng đã thu hoạch mới được phân bổ vào lô; hệ thống tự kiểm tra không vượt số kg thực tế." /><div className="grid gap-4 xl:grid-cols-2"><Panel><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createLot.mutate(); }}><h2 className="text-lg font-bold">Tạo lô mới</h2><div className="grid gap-3 sm:grid-cols-2"><Field label="Mã lô"><Input value={form.lotCode} onChange={(event) => setForm({ ...form, lotCode: event.target.value.toUpperCase() })} placeholder="Tự sinh LO-2026-00001" /></Field><Field label="Đơn vị"><Input required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} /></Field><Field label="Ngày thu hoạch"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.harvestDate} onChange={(event) => setForm({ ...form, harvestDate: event.target.value })} /></Field><Field label="Ngày đóng gói"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.packagingDate} onChange={(event) => setForm({ ...form, packagingDate: event.target.value })} /></Field><Field label="Vùng"><Select value={form.zoneId} onChange={(event) => setForm({ ...form, zoneId: event.target.value })}><option value="">Không chọn</option>{(zones.data?.data ?? []).map((zone) => <option key={zone.id} value={zone.id}>{zone.code} · {zone.name}</option>)}</Select></Field><Field label="Loại cây"><Select value={form.cropTypeId} onChange={(event) => setForm({ ...form, cropTypeId: event.target.value })}><option value="">Không chọn</option>{(cropTypes.data?.data ?? []).map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</Select></Field></div>{createLot.isError && <ErrorMessage error={createLot.error} />}<Button type="submit" disabled={createLot.isPending}><Plus size={18} />Tạo lô</Button></form></Panel><Panel><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); allocate.mutate(); }}><h2 className="text-lg font-bold">Thêm cây vào lô</h2><Field label="Lô đích"><Select required value={allocation.lotId} onChange={(event) => setAllocation({ ...allocation, lotId: event.target.value })}><option value="">Chọn lô</option>{(lots.data?.data ?? []).map((lot) => <option key={lot.id} value={lot.id}>{lot.lotCode} · {lot.totalQuantity} {lot.unit}</option>)}</Select></Field><Field label="Lần thu hoạch"><Select required value={allocation.harvestId} onChange={(event) => setAllocation({ ...allocation, harvestId: event.target.value })}><option value="">Chọn sản lượng từ cây</option>{(harvests.data?.data ?? []).map((harvest) => <option key={harvest.id} value={harvest.id}>{harvest.tree?.treeCode ?? harvest.treeId} · {harvest.quantity} {harvest.unit}</option>)}</Select></Field><Field label="Sản lượng phân bổ (kg)"><Input required type="number" min="0.01" step="0.01" value={allocation.quantity} onChange={(event) => setAllocation({ ...allocation, quantity: event.target.value })} /></Field>{allocate.isError && <ErrorMessage error={allocate.error} />}<Button type="submit" disabled={allocate.isPending}>Phân bổ vào lô</Button></form></Panel></div><Panel><h2 className="text-lg font-bold">Danh sách lô</h2><div className="mt-4 grid gap-3 lg:grid-cols-2">{(lots.data?.data ?? []).map((lot) => <div key={lot.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><p className="font-mono font-bold text-ink">{lot.lotCode}</p><Badge className={statusTone(lot.status)}>{statusLabels[lot.status] ?? lot.status}</Badge></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><Info label="Khối lượng" value={`${lot.totalQuantity} ${lot.unit}`} /><Info label="Số cây" value={String(lot.lotTrees?.length ?? 0)} /><Info label="Vùng" value={lot.zone?.name ?? '—'} /><Info label="Đóng gói" value={lot.packagingDate ? formatDate(lot.packagingDate) : 'Chưa đóng gói'} /></div></div>)}{!lots.isLoading && !(lots.data?.data ?? []).length && <EmptyState label="Chưa có lô sản phẩm" />}</div></Panel></div>;
}

export function TraceabilityDashboard() {
  const queryClient = useQueryClient();
  const [batchForm, setBatchForm] = useState({ productId: '', lotId: '', quantity: '', unit: 'kg', packagingDate: '', publicVerified: false });
  const [codeBatchId, setCodeBatchId] = useState('');
  const products = useQuery({ queryKey: ['batch-products'], queryFn: () => apiFetch<ListResponse<Product>>('/products?limit=100') });
  const lots = useQuery({ queryKey: ['batch-lots'], queryFn: () => apiFetch<ListResponse<Lot>>('/lots?limit=100') });
  const batches = useQuery({ queryKey: ['product-batches'], queryFn: () => apiFetch<ListResponse<ProductBatch>>('/product-batches?limit=100') });
  const codes = useQuery({ queryKey: ['traceability-codes'], queryFn: () => apiFetch<ListResponse<TraceabilityCode>>('/traceability-codes?limit=100') });
  const createBatch = useMutation({ mutationFn: () => apiFetch<ProductBatch>('/product-batches', { method: 'POST', body: JSON.stringify({ ...batchForm, status: batchForm.publicVerified ? 'PUBLISHED' : 'DRAFT', quantity: Number(batchForm.quantity), packagingDate: batchForm.packagingDate ? new Date(batchForm.packagingDate).toISOString() : undefined }) }), onSuccess: () => { setBatchForm({ ...batchForm, quantity: '' }); queryClient.invalidateQueries({ queryKey: ['product-batches'] }); } });
  const createCode = useMutation({ mutationFn: () => apiFetch<TraceabilityCode>('/traceability-codes', { method: 'POST', body: JSON.stringify({ codeType: 'PRODUCT_BATCH', productBatchId: codeBatchId, status: 'PUBLISHED' }) }), onSuccess: () => { setCodeBatchId(''); queryClient.invalidateQueries({ queryKey: ['traceability-codes'] }); } });
  return <div className="space-y-5" data-testid="traceability-screen"><PageHeader icon={QrCode} eyebrow="Mã truy xuất" title="Cấp mã cho hành trình hai chiều" description="ProductBatch là sản phẩm truy xuất cụ thể; Product cũ vẫn giữ vai trò SKU/danh mục." /><div className="grid gap-4 xl:grid-cols-2"><Panel><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createBatch.mutate(); }}><h2 className="text-lg font-bold">Tạo ProductBatch</h2><Field label="SKU sản phẩm"><Select required value={batchForm.productId} onChange={(event) => setBatchForm({ ...batchForm, productId: event.target.value })}><option value="">Chọn SKU</option>{(products.data?.data ?? []).map((product) => <option key={product.id} value={product.id}>{product.code} · {product.name}</option>)}</Select></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Lô nguồn"><Select required value={batchForm.lotId} onChange={(event) => setBatchForm({ ...batchForm, lotId: event.target.value })}><option value="">Chọn lô</option>{(lots.data?.data ?? []).map((lot) => <option key={lot.id} value={lot.id}>{lot.lotCode} · {lot.totalQuantity} {lot.unit}</option>)}</Select></Field><Field label="Khối lượng"><Input required type="number" min="0.01" step="0.01" value={batchForm.quantity} onChange={(event) => setBatchForm({ ...batchForm, quantity: event.target.value })} /></Field><Field label="Đơn vị"><Input value={batchForm.unit} onChange={(event) => setBatchForm({ ...batchForm, unit: event.target.value })} /></Field><Field label="Ngày đóng gói"><Input type="date" max={new Date().toISOString().slice(0, 10)} value={batchForm.packagingDate} onChange={(event) => setBatchForm({ ...batchForm, packagingDate: event.target.value })} /></Field></div><label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={batchForm.publicVerified} onChange={(event) => setBatchForm({ ...batchForm, publicVerified: event.target.checked })} /> Cho phép công khai sau khi hoàn tất</label>{createBatch.isError && <ErrorMessage error={createBatch.error} />}<Button type="submit" disabled={createBatch.isPending}>Tạo sản phẩm truy xuất</Button></form></Panel><Panel><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createCode.mutate(); }}><h2 className="text-lg font-bold">Cấp QR sản phẩm</h2><p className="text-sm leading-relaxed text-slate-600">Chỉ cấp public QR khi ProductBatch, SKU, lô và danh sách cây đã đủ dữ liệu xác minh.</p><Field label="ProductBatch"><Select required value={codeBatchId} onChange={(event) => setCodeBatchId(event.target.value)}><option value="">Chọn ProductBatch</option>{(batches.data?.data ?? []).filter((batch) => !batch.traceabilityCode).map((batch) => <option key={batch.id} value={batch.id}>{batch.productCode} · {batch.quantity} {batch.unit}</option>)}</Select></Field>{createCode.isError && <ErrorMessage error={createCode.error} />}<Button type="submit" variant="secondary" disabled={!codeBatchId || createCode.isPending}><QrCode size={18} />Cấp mã public</Button></form></Panel></div><Panel><h2 className="text-lg font-bold">Các sản phẩm truy xuất</h2><div className="mt-4 grid gap-3 lg:grid-cols-2">{(batches.data?.data ?? []).map((batch) => <div key={batch.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><p className="font-mono font-bold">{batch.productCode}</p><Badge className={statusTone(batch.status)}>{statusLabels[batch.status] ?? batch.status}</Badge></div><p className="mt-2 text-sm text-slate-600">{batch.product?.name ?? 'Sản phẩm'} · {batch.quantity} {batch.unit} · {batch.lot?.lotCode ?? 'Chưa gắn lô'}</p>{batch.traceabilityCode ? <Link className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline" href={`/truy-xuat/${encodeURIComponent(batch.productCode)}`} target="_blank"><ExternalLink size={15} />Mở trang truy xuất</Link> : <p className="mt-3 text-xs text-slate-500">Chưa có mã public</p>}</div>)}{!batches.isLoading && !(batches.data?.data ?? []).length && <EmptyState label="Chưa có ProductBatch" />}</div></Panel><Panel><h2 className="text-lg font-bold">Lịch sử mã truy xuất</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{(codes.data?.data ?? []).map((code) => <div key={code.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><p className="font-mono text-sm font-bold">{code.code}</p><Badge className={statusTone(code.status)}>{statusLabels[code.status] ?? code.status}</Badge></div><p className="mt-2 text-xs text-slate-500">{code.tree?.treeCode ?? code.productBatch?.productCode ?? code.codeType}</p>{code.qrDataUrl && <img src={code.qrDataUrl} alt={`QR ${code.code}`} className="mt-3 h-28 w-28 rounded-lg border border-slate-200 p-1" />}</div>)}{!codes.isLoading && !(codes.data?.data ?? []).length && <EmptyState label="Chưa cấp mã truy xuất" />}</div></Panel></div>;
}

export function TreeMapDashboard() {
  const trees = useQuery({ queryKey: ['map-trees'], queryFn: () => apiFetch<ListResponse<Tree>>('/trees?limit=100') });
  const items = trees.data?.data ?? [];
  const withCoordinates = items.filter((tree) => tree.latitude !== null && tree.longitude !== null);
  return <div className="space-y-5" data-testid="tree-map-screen"><PageHeader icon={MapPinned} eyebrow="Bản đồ tận cây" title="Nhìn cả vùng, chạm từng cây" description="Tọa độ chính xác chỉ hiển thị sau đăng nhập; trang public chỉ nhận vùng và vị trí đã làm mờ." /><Panel className="overflow-hidden p-0"><div className="relative min-h-[480px]"><LeafletTreeMap trees={withCoordinates} /><div className="pointer-events-none absolute bottom-5 left-5 rounded-xl border border-white/70 bg-white/90 p-4 text-xs shadow-lg backdrop-blur"><p className="font-bold text-ink">{withCoordinates.length} cây có tọa độ</p><p className="mt-1 text-slate-500">{items.length - withCoordinates.length} cây chưa định vị</p><div className="mt-3 space-y-1.5"><Legend color="bg-emerald-600" label="Bình thường" /><Legend color="bg-amber-500" label="Cần theo dõi" /><Legend color="bg-rose-600" label="Cảnh báo" /><Legend color="bg-sky-600" label="Đã thu hoạch" /></div></div></div></Panel><div className="flex flex-wrap gap-2"><a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"><ExternalLink size={15} />Mở nền bản đồ OpenStreetMap</a><span className="text-sm text-slate-500">Bản đồ Leaflet dùng nền OpenStreetMap và tọa độ GPS trong dashboard.</span></div></div>;
}

function LeafletTreeMap({ trees }: { trees: Tree[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;

    import('leaflet').then((leaflet) => {
      if (disposed || !mapContainerRef.current) return;
      map = leaflet.map(mapContainerRef.current, { scrollWheelZoom: false }).setView([16.2, 107.9], 5);
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const bounds = leaflet.latLngBounds([]);
      for (const tree of trees) {
        const latitude = Number(tree.latitude);
        const longitude = Number(tree.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
        const marker = leaflet.circleMarker([latitude, longitude], {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: markerHex(tree.status),
          fillOpacity: 0.95
        }).addTo(map);
        marker.bindTooltip(tree.treeCode, { direction: 'top', offset: [0, -8] });
        marker.on('click', () => window.location.assign(`/dashboard/trees/${tree.id}`));
        bounds.extend([latitude, longitude]);
      }
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.25));
      mapRef.current = map;
    });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [trees]);

  return <div ref={mapContainerRef} className="min-h-[480px] w-full bg-[#d1fae5]" aria-label="Bản đồ vị trí cây" />;
}

export function TreeCodesDashboard() {
  const queryClient = useQueryClient();
  const [treeId, setTreeId] = useState('');
  const trees = useQuery({ queryKey: ['traceability-trees'], queryFn: () => apiFetch<ListResponse<Tree>>('/trees?limit=100') });
  const issueCode = useMutation({
    mutationFn: () => apiFetch<TraceabilityCode>('/traceability-codes', {
      method: 'POST',
      body: JSON.stringify({ codeType: 'TREE', treeId, status: 'PUBLISHED' })
    }),
    onSuccess: () => {
      setTreeId('');
      queryClient.invalidateQueries({ queryKey: ['traceability-trees'] });
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      queryClient.invalidateQueries({ queryKey: ['traceability-codes'] });
    }
  });

  const availableTrees = (trees.data?.data ?? []).filter((tree) => !tree.traceabilityCode && tree.publicVerified && tree.status !== 'INACTIVE');
  return <Panel data-testid="tree-codes-panel"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700">Mã truy xuất cây</p><h2 className="mt-1 text-lg font-bold">Cấp QR cho hồ sơ đã xác minh</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">QR cây mở trực tiếp hồ sơ public và giữ liên kết bất biến với mã cây. Tọa độ chính xác vẫn chỉ nằm trong dashboard.</p></div><form className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[22rem] sm:flex-row" onSubmit={(event) => { event.preventDefault(); issueCode.mutate(); }}><Select required value={treeId} onChange={(event) => setTreeId(event.target.value)}><option value="">Chọn cây đã xác minh</option>{availableTrees.map((tree) => <option key={tree.id} value={tree.id}>{tree.treeCode} · {tree.cropType?.name ?? 'Cây'}</option>)}</Select><Button type="submit" variant="secondary" disabled={!treeId || issueCode.isPending}><QrCode size={17} />Cấp QR cây</Button></form></div>{issueCode.isError && <div className="mt-4"><ErrorMessage error={issueCode.error} /></div>}{!trees.isLoading && !availableTrees.length && <p className="mt-4 text-sm text-slate-500">Không có cây mới đủ điều kiện cấp QR public.</p>}</Panel>;
}

export function CropTypesDashboard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: '', name: '' });
  const cropTypes = useQuery({ queryKey: ['crop-types-admin'], queryFn: () => apiFetch<CropType[]>('/crop-types?includeInactive=true') });
  const create = useMutation({
    mutationFn: () => apiFetch<CropType>('/crop-types', { method: 'POST', body: JSON.stringify({ code: form.code, name: form.name }) }),
    onSuccess: () => {
      setForm({ code: '', name: '' });
      queryClient.invalidateQueries({ queryKey: ['crop-types-admin'] });
      queryClient.invalidateQueries({ queryKey: ['crop-types'] });
    }
  });
  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiFetch<CropType>(`/crop-types/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crop-types-admin'] });
      queryClient.invalidateQueries({ queryKey: ['crop-types'] });
    }
  });
  return <div className="space-y-5" data-testid="crop-types-screen"><PageHeader icon={Sprout} eyebrow="Quản trị danh mục" title="Loại cây dùng chung" description="Bổ sung loại cây mới mà không phải thay đổi kiến trúc dữ liệu hoặc tạo hệ thống riêng cho từng nông sản." /><Panel><form className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}><Field label="Mã loại cây"><Input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="CACAO" /></Field><Field label="Tên loại cây"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Cacao" /></Field><Button type="submit" disabled={create.isPending}><Plus size={18} />Thêm loại cây</Button></form>{create.isError && <div className="mt-4"><ErrorMessage error={create.error} /></div>}</Panel><Panel><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(cropTypes.data?.data ?? []).map((crop) => <div key={crop.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-mono text-sm font-bold text-ink">{crop.code}</p><p className="mt-1 font-semibold text-slate-700">{crop.name}</p></div><Badge className={crop.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}>{crop.isActive ? 'Đang dùng' : 'Đã ẩn'}</Badge></div><button type="button" className="mt-4 text-xs font-bold text-emerald-700 hover:underline" onClick={() => toggle.mutate({ id: crop.id, isActive: !crop.isActive })}>{crop.isActive ? 'Ẩn loại cây' : 'Bật lại'}</button></div>)}{!cropTypes.isLoading && !(cropTypes.data?.data ?? []).length && <EmptyState label="Chưa có danh mục cây trồng" />}</div></Panel></div>;
}

function TreeCard({ tree }: { tree: Tree }) { return <Link href={`/dashboard/trees/${tree.id}`} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-bold text-ink">{tree.treeCode}</p><p className="mt-1 font-semibold text-slate-700">{tree.cropType?.name ?? 'Loại cây'}{tree.variety ? ` · ${tree.variety}` : ''}</p></div><Badge className={statusTone(tree.status)}>{statusLabels[tree.status] ?? tree.status}</Badge></div><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><Info label="Vùng" value={tree.zone?.name ?? '—'} /><Info label="Ngày trồng" value={tree.plantedDate ? formatDate(tree.plantedDate) : 'Chưa cập nhật'} /><Info label="Nhật ký" value={`${tree._count?.events ?? 0} bản ghi`} /><Info label="Thu hoạch" value={`${tree._count?.harvests ?? 0} lần`} /></div><p className="mt-4 text-sm font-bold text-emerald-700 transition group-hover:translate-x-1">Mở hộ chiếu cây →</p></Link>; }
function PageHeader({ icon: Icon, eyebrow, title, description, action, onRefresh }: { icon: typeof Sprout; eyebrow: string; title: string; description: string; action?: React.ReactNode; onRefresh?: () => void }) { return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex gap-3"><div className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Icon size={22} /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">{eyebrow}</p><h1 data-testid="page-title" className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1><p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p></div></div><div className="flex gap-2">{onRefresh && <Button variant="ghost" onClick={onRefresh} aria-label="Tải lại"><RefreshCcw size={18} /></Button>}{action}</div></div>; }
function Metric({ label, value, icon: Icon, tone = 'green' }: { label: string; value: number; icon: typeof Sprout; tone?: 'green' | 'amber' | 'sky' }) { return <Panel className="flex items-center gap-3 p-4"><div className={cn('grid h-10 w-10 place-items-center rounded-xl', tone === 'amber' ? 'bg-amber-100 text-amber-700' : tone === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700')}><Icon size={19} /></div><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="text-2xl font-extrabold text-ink">{value.toLocaleString('vi-VN')}</p></div></Panel>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-1.5 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-800">{value}</p></div>; }
function ErrorMessage({ error }: { error: unknown }) { return <div className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error instanceof Error ? error.message : 'Không thể xử lý yêu cầu'}</div>; }
function EmptyState({ label }: { label: string }) { return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">{label}</div>; }
function LoadingPanel() { return <Panel className="animate-pulse"><div className="h-6 w-1/3 rounded bg-slate-100" /><div className="mt-4 h-24 rounded bg-slate-100" /></Panel>; }
function BadgeTone({ children }: { children: React.ReactNode }) { return <Badge>{children}</Badge>; }
function statusTone(status: string) { return status === 'ALERT' || status === 'NEEDS_ATTENTION' ? 'border-amber-200 bg-amber-50 text-amber-700' : status === 'INACTIVE' || status === 'ARCHIVED' ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'; }
function markerTone(status: string) { return status === 'ALERT' ? 'bg-rose-600' : status === 'NEEDS_ATTENTION' ? 'bg-amber-500' : status === 'HARVESTED' ? 'bg-sky-600' : 'bg-emerald-600'; }
function markerHex(status: string) { return status === 'ALERT' ? '#e11d48' : status === 'NEEDS_ATTENTION' ? '#f59e0b' : status === 'HARVESTED' ? '#0284c7' : '#059669'; }
function eventTypeLabel(code: string) { return eventTypes.find(([key]) => key === code)?.[1] ?? (code === 'HARVESTING' ? 'Thu hoạch' : code); }
function coordinates(latitude?: string | number | null, longitude?: string | number | null) { return latitude === null || latitude === undefined || longitude === null || longitude === undefined ? 'Chưa định vị' : `${latitude}, ${longitude}`; }
function Legend({ color, label }: { color: string; label: string }) { return <div className="flex items-center gap-2"><span className={cn('h-2.5 w-2.5 rounded-full', color)} />{label}</div>; }
