'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Pencil, Plus, RefreshCcw, Search, Shield, Trash2, Unlock, UserRound, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatDate, statusTone } from '@/lib/format';
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

type DashboardUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  status: UserStatus;
  cooperativeId?: string | null;
  cooperative?: { id: string; name: string; code: string } | null;
  roles: RoleSlug[];
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

  const userItems = listItems(users.data?.data);
  const roleItems = roleOptions(roles.data?.data, isSuperAdmin, isFarmersMode);
  const cooperativeItems = listItems(cooperatives.data?.data);
  const stats = useMemo(() => userStats(userItems), [userItems]);
  const title = isFarmersMode ? 'Nông dân' : isSuperAdmin ? 'Người dùng hệ thống' : 'Thành viên HTX';

  const saveUser = useMutation({
    mutationFn: () => {
      const error = validateForm(form, Boolean(editingId), isSuperAdmin, isFarmersMode);
      if (error) throw new Error(error);
      const payload = editingId ? updatePayload(form, isSuperAdmin) : createPayload(form, isSuperAdmin);
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
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="LOCKED">LOCKED</option>
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
            </div>

            {(formError || saveUser.isError) && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{formError || errorMessage(saveUser.error)}</div>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saveUser.isPending}>{saveUser.isPending ? 'Đang lưu' : 'Lưu tài khoản'}</Button>
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
          <option value="ACTIVE">ACTIVE</option>
          <option value="LOCKED">LOCKED</option>
          <option value="INACTIVE">INACTIVE</option>
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
              <div className="mt-4 flex flex-wrap gap-2">
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
    status: 'ACTIVE'
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
    status: item.status
  };
}

function createPayload(form: UserForm, isSuperAdmin: boolean) {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    phone: form.phone || undefined,
    role: form.role,
    cooperativeId: isSuperAdmin ? form.cooperativeId || undefined : undefined,
    status: form.status
  };
}

function updatePayload(form: UserForm, isSuperAdmin: boolean) {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone || undefined,
    password: form.password || undefined,
    roles: [form.role],
    cooperativeId: isSuperAdmin && form.cooperativeId ? form.cooperativeId : undefined,
    status: form.status
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
