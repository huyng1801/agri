'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, Lock, Mic, Pencil, Plus, QrCode, RefreshCcw, Search, Shield, Trash2, Unlock, UserRound, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatDate, statusTone } from '@/lib/format';
import { FarmerVoiceRecordings } from './farmer-voice-recordings';
import { Badge, Button, Input, Panel, Select, cn } from './ui';

type RoleSlug = 'SUPER_ADMIN' | 'ADMIN_HTX' | 'MEMBER_HTX' | 'FARMER' | 'BUYER';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type RoleOption = {
  id: string;
  slug: RoleSlug;
  name: string;
};

type Cooperative = {
  id: string;
  code: string;
  name: string;
  status: string;
};

type FarmerZone = {
  id: string;
  code: string;
  name: string;
  areaM2?: string | number | null;
  status: string;
};

type FarmerSummary = {
  assignedZoneCount: number;
  areaM2: number | null;
  zonesWithArea: number;
  treeCount: number;
  varieties: Array<{ cropTypeName: string; variety: string | null; treeCount: number }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
    isPublic: boolean;
    zoneName: string | null;
  }>;
  seasonalProduction: Array<{
    seasonId: string | null;
    seasonName: string;
    harvestCount: number;
    recordedMassKg: number | null;
    otherUnits: Array<{ unit: string; quantity: number }>;
  }>;
};

type FarmerPublicQr = {
  publicUrl: string;
  qrDataUrl: string;
  farmer: {
    fullName: string;
    cooperative: { name: string; code: string };
    summary: FarmerSummary | null;
  };
};

type DashboardUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  status: UserStatus;
  cooperativeId?: string | null;
  cooperative?: { id: string; name: string; code: string } | null;
  roles: RoleSlug[];
  farmerProfile?: { assignedZoneIds: string[] } | null;
  farmerSummary?: FarmerSummary | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserForm = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: RoleSlug;
  cooperativeId: string;
  status: UserStatus;
  assignedZoneIds: string[];
};

type UsersDashboardMode = 'users' | 'farmers';

const roleLabels: Record<RoleSlug, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_HTX: 'Admin HTX',
  MEMBER_HTX: 'Thành viên HTX',
  FARMER: 'Nông dân',
  BUYER: 'Người mua'
};

export function UsersDashboard({ mode = 'users' }: { mode?: UsersDashboardMode }) {
  const queryClient = useQueryClient();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const isFarmersMode = mode === 'farmers';
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleSlug | ''>(isFarmersMode ? 'FARMER' : '');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm(isFarmersMode));
  const [formError, setFormError] = useState('');
  const [qrFarmerId, setQrFarmerId] = useState<string | null>(null);
  const [voiceFarmerId, setVoiceFarmerId] = useState<string | null>(null);

  const users = useQuery({
    queryKey: ['users-dashboard', mode, search, roleFilter, statusFilter],
    queryFn: () => apiFetch<ListResponse<DashboardUser>>(usersPath({ search, role: roleFilter, status: statusFilter, forceFarmer: isFarmersMode }))
  });
  const roles = useQuery({
    queryKey: ['user-role-options'],
    queryFn: () => apiFetch<RoleOption[]>('/users/roles')
  });
  const cooperatives = useQuery({
    queryKey: ['cooperatives-for-users'],
    queryFn: () => apiFetch<ListResponse<Cooperative>>('/cooperatives?limit=200&status=ACTIVE'),
    enabled: isSuperAdmin
  });
  const farmerZones = useQuery({
    queryKey: ['farmer-zone-options', user?.cooperativeId, form.cooperativeId],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '100' });
      if (isSuperAdmin && form.cooperativeId) params.set('cooperativeId', form.cooperativeId);
      return apiFetch<ListResponse<FarmerZone>>(`/zones?${params.toString()}`);
    },
    enabled: isFarmersMode && formOpen && (!isSuperAdmin || Boolean(form.cooperativeId))
  });
  const farmerQr = useQuery({
    queryKey: ['farmer-personal-qr', qrFarmerId],
    queryFn: () => apiFetch<FarmerPublicQr>(`/public/farmers/${encodeURIComponent(qrFarmerId!)}`),
    enabled: Boolean(qrFarmerId)
  });

  const userItems = listItems(users.data?.data);
  const roleItems = roleOptions(roles.data?.data, isSuperAdmin, isFarmersMode);
  const cooperativeItems = listItems(cooperatives.data?.data);
  const stats = useMemo(() => userStats(userItems), [userItems]);
  const title = isFarmersMode ? 'Nông dân' : isSuperAdmin ? 'Người dùng hệ thống' : 'Thành viên HTX';

  const saveUser = useMutation({
    mutationFn: () => {
      const error = validateForm(form, Boolean(editingId), isSuperAdmin, isFarmersMode);
      if (error) throw new Error(error);
      const payload = editingId ? updatePayload(form, isSuperAdmin, isFarmersMode) : createPayload(form, isSuperAdmin, isFarmersMode);
      return editingId
        ? apiFetch<DashboardUser>(`/users/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<DashboardUser>('/users', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromUser(result.data, isFarmersMode));
      setFormOpen(true);
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['users-dashboard'] });
    },
    onError: (error) => setFormError(errorMessage(error))
  });

  const setUserStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      apiFetch<DashboardUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-dashboard'] })
  });

  const disableUser = useMutation({
    mutationFn: (id: string) => apiFetch<{ disabled: boolean }>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users-dashboard'] })
  });

  function newUser() {
    setEditingId(null);
    setForm(emptyForm(isFarmersMode));
    setFormError('');
    setFormOpen(true);
  }

  function edit(item: DashboardUser) {
    setEditingId(item.id);
    setForm(fromUser(item, isFarmersMode));
    setFormError('');
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function update<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-slate-600">
            {isFarmersMode ? 'Quản lý nông dân, tài khoản nhập nhật ký và trạng thái hoạt động.' : 'Tạo, phân quyền, khóa/mở và theo dõi tài khoản theo đúng vùng quản trị.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => users.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button data-testid={isFarmersMode ? 'farmer-create-button' : 'user-create-button'} type="button" onClick={newUser}>
            <Plus size={18} aria-hidden="true" />
            {isFarmersMode ? 'Thêm nông dân' : 'Thêm tài khoản'}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng tài khoản" value={stats.total} />
        <Metric label="Đang hoạt động" value={stats.active} tone="leaf" />
        <Metric label="Bị khóa/ngừng" value={stats.locked} />
      </div>

      {formOpen && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveUser.mutate(); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa tài khoản' : isFarmersMode ? 'Thêm nông dân' : 'Thêm tài khoản'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Họ tên">
                <Input data-testid={isFarmersMode ? 'farmer-name-input' : 'user-name-input'} value={form.fullName} onChange={(event) => update('fullName', event.target.value)} required />
              </Field>
              <Field label="Email">
                <Input data-testid={isFarmersMode ? 'farmer-email-input' : 'user-email-input'} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
              </Field>
              <Field label={editingId ? 'Mật khẩu mới' : 'Mật khẩu'}>
                <Input
                  data-testid={isFarmersMode ? 'farmer-password-input' : 'user-password-input'}
                  type="password"
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  placeholder={editingId ? 'Để trống nếu không đổi' : 'Tối thiểu 8 ký tự'}
                  required={!editingId}
                />
              </Field>
              <Field label="Số điện thoại">
                <Input data-testid={isFarmersMode ? 'farmer-phone-input' : 'user-phone-input'} value={form.phone} onChange={(event) => update('phone', event.target.value)} />
              </Field>
              {!isFarmersMode && (
                <Field label="Vai trò">
                  <Select data-testid="user-role-select" value={form.role} onChange={(event) => update('role', event.target.value as RoleSlug)}>
                    {roleItems.map((role) => (
                      <option key={role} value={role}>{roleLabels[role]}</option>
                    ))}
                  </Select>
                </Field>
              )}
              {isFarmersMode && (
                <Field label="Vai trò">
                  <Input value={roleLabels.FARMER} readOnly className="bg-slate-100 text-slate-600" />
                </Field>
              )}
              <Field label="Trạng thái">
                <Select data-testid={isFarmersMode ? 'farmer-status-select' : 'user-status-select'} value={form.status} onChange={(event) => update('status', event.target.value as UserStatus)}>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm dừng</option>
                  <option value="LOCKED">Đã khóa</option>
                </Select>
              </Field>
              {isSuperAdmin && (
                <Field label="HTX">
                  <Select data-testid="user-cooperative-select" value={form.cooperativeId} onChange={(event) => update('cooperativeId', event.target.value)}>
                    <option value="">Không gán HTX</option>
                    {cooperativeItems.map((cooperative) => (
                      <option key={cooperative.id} value={cooperative.id}>{cooperative.name} ({cooperative.code})</option>
                    ))}
                  </Select>
                </Field>
              )}
              {isFarmersMode && (
                <FarmerZoneAssignmentField
                  zones={listItems(farmerZones.data?.data)}
                  zoneIds={form.assignedZoneIds}
                  isLoading={farmerZones.isLoading}
                  error={farmerZones.isError ? errorMessage(farmerZones.error) : ''}
                  onRetry={() => farmerZones.refetch()}
                  onChange={(zoneIds) => update('assignedZoneIds', zoneIds)}
                />
              )}
            </div>

            {(formError || saveUser.isError) && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{formError || errorMessage(saveUser.error)}</div>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saveUser.isPending || (isFarmersMode && (farmerZones.isLoading || farmerZones.isError || (isSuperAdmin && !form.cooperativeId)))}>{saveUser.isPending ? 'Đang lưu' : 'Lưu tài khoản'}</Button>
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm(isFarmersMode))}>Xóa form</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, email, số điện thoại" className="pl-10" />
        </div>
        {!isFarmersMode ? (
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleSlug | '')}>
            <option value="">Tất cả vai trò</option>
            {roleItems.map((role) => (
              <option key={role} value={role}>{roleLabels[role]}</option>
            ))}
          </Select>
        ) : (
          <Select value="FARMER" disabled>
            <option value="FARMER">Nông dân</option>
          </Select>
        )}
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as UserStatus | '')}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
          <option value="INACTIVE">Tạm dừng</option>
        </Select>
      </div>

      {users.isLoading && <SkeletonList />}
      {users.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(users.error)}</Panel>}
      {!users.isLoading && !users.isError && userItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có tài khoản</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {userItems.map((item) => {
          const primaryRole = item.roles[0] ?? 'BUYER';
          return (
            <article key={item.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-ink">{item.fullName}</h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{item.email}</p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-mint text-leaf">
                  {isFarmersMode ? <UserRound size={22} aria-hidden="true" /> : <Users size={22} aria-hidden="true" />}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className={statusTone(item.status)}>{item.status}</Badge>
                {item.roles.map((role) => (
                  <Badge key={role} className="bg-slate-100 text-slate-700">{roleLabels[role]}</Badge>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Info label="HTX" value={item.cooperative?.name || '—'} />
                <Info label="SĐT" value={item.phone || '—'} />
                <Info label="Đăng nhập cuối" value={formatDate(item.lastLoginAt)} />
                <Info label="Ngày tạo" value={formatDate(item.createdAt)} />
              </div>
              {isFarmersMode && <FarmerProductionSummary summary={item.farmerSummary} />}
              <div className="mt-4 flex flex-wrap gap-2">
                {isFarmersMode && item.status === 'ACTIVE' && (
                  <Button data-testid={`farmer-qr-button-${item.id}`} type="button" variant="ghost" onClick={() => setQrFarmerId(item.id)}>
                    <QrCode size={16} aria-hidden="true" />
                    QR cá nhân
                  </Button>
                )}
                {isFarmersMode && (
                  <Button data-testid={`farmer-record-button-${item.id}`} type="button" variant="ghost" onClick={() => setVoiceFarmerId(item.id)}>
                    <Mic size={16} aria-hidden="true" />
                    Ghi âm
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => edit(item)}>
                  <Pencil size={16} aria-hidden="true" />
                  Sửa
                </Button>
                {item.status === 'ACTIVE' ? (
                  <Button type="button" variant="ghost" onClick={() => setUserStatus.mutate({ id: item.id, status: 'LOCKED' })} disabled={setUserStatus.isPending}>
                    <Lock size={16} aria-hidden="true" />
                    Khóa
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={() => setUserStatus.mutate({ id: item.id, status: 'ACTIVE' })} disabled={setUserStatus.isPending}>
                    <Unlock size={16} aria-hidden="true" />
                    Mở
                  </Button>
                )}
                {primaryRole !== 'SUPER_ADMIN' && (
                  <Button type="button" variant="danger" onClick={() => disableUser.mutate(item.id)} disabled={disableUser.isPending}>
                    <Trash2 size={16} aria-hidden="true" />
                    Ngừng
                  </Button>
                )}
              </div>
              {(setUserStatus.isError || disableUser.isError) && <p className="mt-3 text-sm font-semibold text-rose-700">{errorMessage(setUserStatus.error ?? disableUser.error)}</p>}
            </article>
          );
        })}
      </div>

      {qrFarmerId ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setQrFarmerId(null); }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="farmer-qr-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <Button type="button" variant="ghost" aria-label="Đóng mã QR cá nhân" className="absolute right-3 top-3" onClick={() => setQrFarmerId(null)}>
              <X size={18} aria-hidden="true" />
            </Button>
            <div className="pr-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-leaf">Hồ sơ nông hộ</p>
              <h2 id="farmer-qr-title" className="mt-1 text-xl font-bold text-ink">QR cá nhân</h2>
            </div>
            {farmerQr.isLoading ? <p role="status" className="py-10 text-center text-sm text-slate-600">Đang tạo mã QR…</p> : null}
            {farmerQr.isError ? (
              <div role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                {errorMessage(farmerQr.error)}
                <Button type="button" variant="ghost" className="mt-2" onClick={() => farmerQr.refetch()}>Thử lại</Button>
              </div>
            ) : null}
            {farmerQr.data?.data ? (
              <div className="mt-5 text-center">
                <p className="font-semibold text-ink">{farmerQr.data.data.farmer.fullName}</p>
                <p className="mt-1 text-sm text-slate-600">{farmerQr.data.data.farmer.cooperative.name}</p>
                <img src={farmerQr.data.data.qrDataUrl} alt={`QR hồ sơ nông hộ ${farmerQr.data.data.farmer.fullName}`} width={240} height={240} className="mx-auto mt-4 h-60 w-60 rounded-xl border border-slate-200 bg-white p-2" />
                <p className="mt-3 break-all text-xs text-slate-500">{farmerQr.data.data.publicUrl}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <a href={farmerQr.data.data.qrDataUrl} download={`QR-nong-ho-${qrFarmerId}.png`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white hover:bg-leaf/90">
                    <Download size={16} aria-hidden="true" />Tải ảnh QR
                  </a>
                  <a href={farmerQr.data.data.publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
                    <ExternalLink size={16} aria-hidden="true" />Mở hồ sơ
                  </a>
                </div>
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-left text-xs leading-5 text-amber-900">QR chỉ hiển thị dữ liệu công khai trên vùng được HTX phân công. Vùng dùng chung có thể làm số liệu xuất hiện ở nhiều hồ sơ; không xem đây là sản lượng sở hữu riêng.</p>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {voiceFarmerId ? (() => {
        const voiceFarmer = userItems.find((item) => item.id === voiceFarmerId);
        return voiceFarmer ? (
          <FarmerVoiceRecordings
            farmerId={voiceFarmer.id}
            farmerName={voiceFarmer.fullName}
            canRecord={voiceFarmer.status === 'ACTIVE'}
            onClose={() => setVoiceFarmerId(null)}
          />
        ) : null;
      })() : null}
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

function FarmerZoneAssignmentField({
  zones,
  zoneIds,
  isLoading,
  error,
  onRetry,
  onChange
}: {
  zones: FarmerZone[];
  zoneIds: string[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onChange: (zoneIds: string[]) => void;
}) {
  return (
    <fieldset data-testid="farmer-zone-assignment-field" className="rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2">
      <legend className="px-1 text-sm font-semibold text-slate-700">Vùng trồng được phân công</legend>
      <p className="text-xs leading-5 text-slate-500">
        Diện tích lấy từ vùng trồng; cây/giống từ hồ sơ cây; sản lượng lấy từ thu hoạch đã gắn mùa vụ. Vùng dùng chung có thể xuất hiện ở nhiều tài khoản.
      </p>
      {error ? <div role="alert" className="mt-3 rounded-md bg-rose-50 p-2 text-sm text-rose-700">Không tải được danh sách vùng trồng: {error} <button type="button" className="ml-2 underline" onClick={onRetry}>Thử tải lại</button></div> : null}
      {isLoading ? <p className="mt-3 text-sm text-slate-500">Đang tải vùng trồng…</p> : null}
      {!isLoading && !error && zones.length === 0 ? <p className="mt-3 text-sm text-slate-500">HTX chưa có vùng trồng. Tạo vùng trồng trước khi phân công.</p> : null}
      {!isLoading && !error && zones.length > 0 ? (
        <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
          {zones.map((zone) => {
            const checked = zoneIds.includes(zone.id);
            const inactive = zone.status !== 'ACTIVE';
            return (
              <label key={zone.id} className={cn('flex min-h-12 items-start gap-2 rounded-md border bg-white p-2.5 text-sm', checked ? 'border-leaf/40' : 'border-slate-200')}>
                <input
                  data-testid={`farmer-zone-checkbox-${zone.id}`}
                  type="checkbox"
                  checked={checked}
                  disabled={inactive && !checked}
                  onChange={(event) => onChange(event.target.checked ? [...new Set([...zoneIds, zone.id])] : zoneIds.filter((id) => id !== zone.id))}
                  className="mt-0.5 h-4 w-4 accent-emerald-700"
                />
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-medium text-ink">{zone.name} <span className="text-xs text-slate-500">· {zone.code}</span></span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {zone.areaM2 === null || zone.areaM2 === undefined ? 'Chưa nhập diện tích' : `${formatHectares(zone.areaM2)} ha`}
                    {inactive ? ' · Ngừng hoạt động' : ''}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      ) : null}
    </fieldset>
  );
}

function FarmerProductionSummary({ summary }: { summary?: FarmerSummary | null }) {
  if (!summary) {
    return <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-500">Chưa có hồ sơ sản xuất để tổng hợp.</p>;
  }

  const area = summary.assignedZoneCount === 0
    ? 'Chưa gán vùng'
    : summary.areaM2 === null
      ? 'Chưa nhập diện tích'
      : `${formatHectares(summary.areaM2)} ha`;

  return (
    <section data-testid="farmer-production-summary" className="mt-4 space-y-3 border-t border-slate-200 pt-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">Quy mô sản xuất đã ghi nhận</h3>
        <p className="text-xs text-slate-500">Tổng hợp từ {summary.assignedZoneCount} vùng được phân công; không phải dự báo sản lượng.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Diện tích vùng" value={area} />
        <Info label="Cây đã lập hồ sơ" value={`${formatCount(summary.treeCount)} cây`} />
      </div>
      {summary.assignedZoneCount > summary.zonesWithArea && summary.assignedZoneCount > 0 ? (
        <p className="text-xs text-amber-700">Diện tích mới có ở {summary.zonesWithArea}/{summary.assignedZoneCount} vùng được phân công.</p>
      ) : null}
      <div>
        <p className="text-xs font-semibold text-slate-600">Loại cây và giống</p>
        {summary.varieties.length ? (
          <>
            <ul className="mt-1 space-y-1 text-xs text-slate-700">
              {summary.varieties.slice(0, 3).map((item) => <FarmerVarietyRow key={`${item.cropTypeName}-${item.variety ?? ''}`} item={item} />)}
            </ul>
            {summary.varieties.length > 3 ? (
              <details className="mt-1 text-xs text-slate-600">
                <summary className="cursor-pointer">Xem thêm {summary.varieties.length - 3} loại cây/giống</summary>
                <ul className="mt-1 space-y-1">
                  {summary.varieties.slice(3).map((item) => <FarmerVarietyRow key={`${item.cropTypeName}-${item.variety ?? ''}`} item={item} />)}
                </ul>
              </details>
            ) : null}
          </>
        ) : <p className="mt-1 text-xs text-slate-500">Chưa có hồ sơ cây trong các vùng được phân công.</p>}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-600">Sản lượng thu hoạch theo vụ</p>
        {summary.seasonalProduction.length ? (
          <>
            <ul className="mt-1 space-y-1 text-xs text-slate-700">
              {summary.seasonalProduction.slice(0, 2).map((season) => <FarmerSeasonRow key={season.seasonId ?? 'no-season'} season={season} />)}
            </ul>
            {summary.seasonalProduction.length > 2 ? (
              <details className="mt-1 text-xs text-slate-600">
                <summary className="cursor-pointer">Xem thêm {summary.seasonalProduction.length - 2} vụ</summary>
                <ul className="mt-1 space-y-1">
                  {summary.seasonalProduction.slice(2).map((season, index) => <FarmerSeasonRow key={`${season.seasonId ?? 'no-season'}-${index}`} season={season} />)}
                </ul>
              </details>
            ) : null}
          </>
        ) : <p className="mt-1 text-xs text-slate-500">Chưa ghi nhận thu hoạch.</p>}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-600">Chứng nhận gắn với vùng</p>
        {summary.certifications.length ? (
          <ul className="mt-1 space-y-2 text-xs text-slate-700">
            {summary.certifications.map((certification) => <FarmerCertificationRow key={certification.id} certification={certification} />)}
          </ul>
        ) : <p className="mt-1 text-xs text-slate-500">Chưa có chứng nhận nào gắn với vùng được phân công.</p>}
      </div>
    </section>
  );
}

function FarmerVarietyRow({ item }: { item: FarmerSummary['varieties'][number] }) {
  return <li>{item.cropTypeName}{item.variety ? ` · ${item.variety}` : ' · Chưa rõ giống'}: <span className="font-medium">{formatCount(item.treeCount)} cây</span></li>;
}

function FarmerSeasonRow({ season }: { season: FarmerSummary['seasonalProduction'][number] }) {
  const yieldParts = [
    season.recordedMassKg === null ? null : `${formatNumber(season.recordedMassKg / 1000)} t`,
    ...season.otherUnits.map((item) => `${formatNumber(item.quantity)} ${item.unit}`),
    `${formatCount(season.harvestCount)} lần`
  ].filter((value): value is string => Boolean(value));
  return <li className="flex flex-wrap justify-between gap-x-2 gap-y-0.5"><span>{season.seasonName}</span><span className="font-medium">{yieldParts.join(' · ')}</span></li>;
}

function FarmerCertificationRow({ certification }: { certification: FarmerSummary['certifications'][number] }) {
  const details = [
    certification.issuer ? `Cấp bởi ${certification.issuer}` : null,
    certification.issuedAt ? `Ngày cấp ${formatDate(certification.issuedAt)}` : null,
    certification.expiresAt ? `Hạn ${formatDate(certification.expiresAt)}` : 'Không thời hạn',
    certification.zoneName ? `Vùng ${certification.zoneName}` : null
  ].filter((value): value is string => Boolean(value));

  return (
    <li className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-ink">{certification.name}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', certification.isPublic ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600')}>
          {certification.isPublic ? 'Công khai' : 'Nội bộ'}
        </span>
      </div>
      <p className="mt-1 text-slate-500">{details.join(' · ')}</p>
    </li>
  );
}

function formatHectares(areaM2: number | string) {
  const area = Number(areaM2);
  return Number.isFinite(area) ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(area / 10_000) : '—';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
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

function emptyForm(isFarmersMode: boolean): UserForm {
  return {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: isFarmersMode ? 'FARMER' : 'MEMBER_HTX',
    cooperativeId: '',
    status: 'ACTIVE',
    assignedZoneIds: []
  };
}

function fromUser(item: DashboardUser, isFarmersMode: boolean): UserForm {
  return {
    fullName: item.fullName,
    email: item.email,
    password: '',
    phone: item.phone ?? '',
    role: isFarmersMode ? 'FARMER' : item.roles[0] ?? 'MEMBER_HTX',
    cooperativeId: item.cooperativeId ?? '',
    status: item.status,
    assignedZoneIds: item.farmerProfile?.assignedZoneIds ?? []
  };
}

function createPayload(form: UserForm, isSuperAdmin: boolean, isFarmersMode: boolean) {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    phone: form.phone || undefined,
    role: form.role,
    cooperativeId: isSuperAdmin ? form.cooperativeId || undefined : undefined,
    status: form.status,
    assignedZoneIds: isFarmersMode ? form.assignedZoneIds : undefined
  };
}

function updatePayload(form: UserForm, isSuperAdmin: boolean, isFarmersMode: boolean) {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone || undefined,
    password: form.password || undefined,
    roles: [form.role],
    cooperativeId: isSuperAdmin && form.cooperativeId ? form.cooperativeId : undefined,
    status: form.status,
    assignedZoneIds: isFarmersMode ? form.assignedZoneIds : undefined
  };
}

function validateForm(form: UserForm, editing: boolean, isSuperAdmin: boolean, isFarmersMode: boolean) {
  if (!form.fullName.trim()) return 'Họ tên bắt buộc';
  if (!form.email.includes('@')) return 'Email không hợp lệ';
  if (!editing && form.password.length < 8) return 'Mật khẩu tối thiểu 8 ký tự';
  if (editing && form.password && form.password.length < 8) return 'Mật khẩu mới tối thiểu 8 ký tự';
  if (isSuperAdmin && ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'].includes(isFarmersMode ? 'FARMER' : form.role) && !form.cooperativeId) {
    return 'Tài khoản HTX cần chọn HTX';
  }
  return '';
}

function usersPath({ search, role, status, forceFarmer }: { search: string; role: string; status: string; forceFarmer: boolean }) {
  const params = new URLSearchParams({ limit: '100' });
  if (search) params.set('search', search);
  if (forceFarmer) params.set('role', 'FARMER');
  else if (role) params.set('role', role);
  if (status) params.set('status', status);
  return `/users?${params.toString()}`;
}

function roleOptions(records: RoleOption[] | undefined, isSuperAdmin: boolean, isFarmersMode: boolean): RoleSlug[] {
  if (isFarmersMode) return ['FARMER'];
  const fallback: RoleSlug[] = isSuperAdmin ? ['SUPER_ADMIN', 'ADMIN_HTX', 'MEMBER_HTX', 'FARMER', 'BUYER'] : ['MEMBER_HTX', 'FARMER', 'BUYER'];
  const slugs = records?.map((item) => item.slug).filter(Boolean) ?? [];
  return slugs.length ? slugs : fallback;
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function userStats(items: DashboardUser[]) {
  return {
    total: items.length,
    active: items.filter((item) => item.status === 'ACTIVE').length,
    locked: items.filter((item) => item.status !== 'ACTIVE').length
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
