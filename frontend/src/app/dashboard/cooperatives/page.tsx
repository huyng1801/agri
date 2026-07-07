'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ExternalLink, Pencil, Plus, RefreshCcw, ShieldCheck, Trash2, UserCog, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency, formatDate, statusTone } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type CooperativeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

type Plan = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: string | number;
  priceYearly: string | number;
  isActive: boolean;
};

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  cooperativeId?: string | null;
  cooperative?: { name: string; code: string } | null;
};

type Subscription = {
  id: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  note?: string | null;
  plan?: Plan | null;
};

type Cooperative = {
  id: string;
  code: string;
  name: string;
  taxCode?: string | null;
  phone?: string | null;
  email?: string | null;
  address: string;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  representative?: string | null;
  avatarUrl?: string | null;
  status: CooperativeStatus;
  subscriptions?: Subscription[];
  _count?: {
    users?: number;
    products?: number;
    zones?: number;
    passports?: number;
  };
  createdAt: string;
  updatedAt: string;
};

type CooperativeForm = {
  name: string;
  code: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  representative: string;
  avatarUrl: string;
  status: CooperativeStatus;
};

type CooperativeStats = {
  products: number;
  zones: number;
  logs: number;
  passports: number;
  members: number;
  unpaidInvoices: number;
  qrScanTotal: number;
  subscriptionEndDate?: string | null;
  currentPlan?: string | null;
  subscriptionStatus?: string | null;
};

type DetailTab = 'info' | 'stats' | 'billing';

type SubscriptionForm = {
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  note: string;
  createInvoice: boolean;
  invoiceAmount: string;
  invoiceDueDate: string;
};

const emptyCooperativeForm: CooperativeForm = {
  name: '',
  code: '',
  taxCode: '',
  phone: '',
  email: '',
  address: '',
  province: '',
  district: '',
  ward: '',
  representative: '',
  avatarUrl: '',
  status: 'ACTIVE'
};

const emptySubscriptionForm: SubscriptionForm = {
  planId: '',
  status: 'ACTIVE',
  startDate: todayInputDate(),
  endDate: dateInputMonthsFromNow(12),
  autoRenew: false,
  note: '',
  createInvoice: true,
  invoiceAmount: '',
  invoiceDueDate: dateInputDaysFromNow(7)
};

export default function CooperativesPage() {
  const queryClient = useQueryClient();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const isAdminHtx = user?.roles.includes('ADMIN_HTX') ?? false;
  const ownCooperativeId = user?.cooperativeId ?? null;
  const canManagePlatform = isSuperAdmin;
  const canEditCooperative = (cooperative: Cooperative) =>
    isSuperAdmin || (isAdminHtx && cooperative.id === ownCooperativeId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CooperativeForm>(emptyCooperativeForm);
  const [selectedCooperative, setSelectedCooperative] = useState<Cooperative | null>(null);
  const [detailTab, setDetailTab] = useState<Record<string, DetailTab>>({});
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionForm>(emptySubscriptionForm);
  const [adminUserId, setAdminUserId] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const cooperatives = useQuery({
    queryKey: ['cooperatives-dashboard', search, statusFilter, planFilter],
    queryFn: () =>
      apiFetch<ListResponse<Cooperative>>(
        `/cooperatives?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${planFilter ? `&planId=${encodeURIComponent(planFilter)}` : ''}`
      )
  });
  const plans = useQuery({
    queryKey: ['plans-for-cooperatives'],
    queryFn: () => apiFetch<ListResponse<Plan>>('/subscription-plans?limit=100&isActive=true'),
    enabled: isSuperAdmin
  });
  const admins = useQuery({
    queryKey: ['admin-users-for-cooperatives'],
    queryFn: () => apiFetch<ListResponse<AdminUser>>('/users?role=ADMIN_HTX&limit=200'),
    enabled: isSuperAdmin
  });

  const cooperativeItems = listItems(cooperatives.data?.data);
  const planItems = listItems(plans.data?.data);
  const adminItems = listItems(admins.data?.data);
  const stats = useMemo(() => cooperativeStats(cooperativeItems), [cooperativeItems]);

  const saveCooperative = useMutation({
    mutationFn: () =>
      editingId
        ? apiFetch<Cooperative>(`/cooperatives/${editingId}`, { method: 'PATCH', body: JSON.stringify(cooperativePayload(form)) })
        : apiFetch<Cooperative>('/cooperatives', { method: 'POST', body: JSON.stringify(cooperativePayload(form)) }),
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromCooperative(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['cooperatives-dashboard'] });
    }
  });

  const archiveCooperative = useMutation({
    mutationFn: (id: string) => apiFetch<Cooperative>(`/cooperatives/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cooperatives-dashboard'] })
  });

  const assignSubscription = useMutation({
    mutationFn: () => {
      if (!selectedCooperative) throw new Error('Chọn HTX trước');
      return apiFetch<Subscription & { invoice?: unknown }>(`/cooperatives/${selectedCooperative.id}/subscription`, {
        method: 'POST',
        body: JSON.stringify(subscriptionPayload(subscriptionForm))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooperatives-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-dashboard'] });
    }
  });

  const cancelSubscription = useMutation({
    mutationFn: (cooperativeId: string) => apiFetch<Subscription>(`/cooperatives/${cooperativeId}/subscription/cancel`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cooperatives-dashboard'] })
  });

  const assignAdmin = useMutation({
    mutationFn: () => {
      if (!selectedCooperative || !adminUserId) throw new Error('Chọn HTX và Admin HTX');
      return apiFetch(`/cooperatives/${selectedCooperative.id}/assign-admin`, {
        method: 'POST',
        body: JSON.stringify({ userId: adminUserId })
      });
    },
    onSuccess: () => {
      setAdminUserId('');
      queryClient.invalidateQueries({ queryKey: ['cooperatives-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-for-cooperatives'] });
    }
  });

  function update<K extends keyof CooperativeForm>(key: K, value: CooperativeForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !current.code ? { code: codeLocal(String(value)) } : {})
    }));
  }

  function updateSubscription<K extends keyof SubscriptionForm>(key: K, value: SubscriptionForm[K]) {
    setSubscriptionForm((current) => ({ ...current, [key]: value }));
  }

  function newCooperative() {
    setEditingId(null);
    setForm(emptyCooperativeForm);
    setFormOpen(true);
  }

  function edit(cooperative: Cooperative) {
    setEditingId(cooperative.id);
    setForm(fromCooperative(cooperative));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openBilling(cooperative: Cooperative) {
    const current = cooperative.subscriptions?.[0];
    setSelectedCooperative(cooperative);
    setSubscriptionForm(current ? fromSubscription(current) : emptySubscriptionForm);
    setAdminUserId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function choosePlan(planId: string) {
    const plan = planItems.find((item) => item.id === planId);
    setSubscriptionForm((current) => ({
      ...current,
      planId,
      invoiceAmount: plan ? String(plan.priceYearly || plan.priceMonthly || '') : current.invoiceAmount
    }));
  }

  function setCooperativeTab(cooperativeId: string, tab: DetailTab) {
    setDetailTab((current) => ({ ...current, [cooperativeId]: tab }));
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true);
    try {
      const presign = await apiFetch<{ uploadUrl: string; publicUrl?: string; objectKey: string }>('/files/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          cooperativeId: editingId ?? undefined,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          visibility: 'PUBLIC'
        })
      });
      const response = await fetch(presign.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!response.ok) throw new Error('Không upload được ảnh đại diện lên R2');
      const confirmed = await apiFetch<{ publicUrl?: string }>('/files/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          cooperativeId: editingId ?? undefined,
          objectKey: presign.data.objectKey,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          visibility: 'PUBLIC',
          publicUrl: presign.data.publicUrl
        })
      });
      update('avatarUrl', confirmed.data.publicUrl ?? presign.data.publicUrl ?? '');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function cooperativeTab(cooperativeId: string): DetailTab {
    return detailTab[cooperativeId] ?? 'info';
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">{isSuperAdmin ? 'HTX cấp nền tảng' : 'Thông tin HTX'}</h1>
          <p className="text-sm text-slate-600">
            {canManagePlatform ? 'Quản lý hồ sơ HTX, gói SaaS, hóa đơn và Admin HTX ở cấp nền tảng.' : 'Xem và cập nhật thông tin HTX của bạn.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => cooperatives.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          {isSuperAdmin && (
            <Button data-testid="cooperative-create-button" type="button" onClick={newCooperative}>
              <Plus size={18} aria-hidden="true" />
              Thêm HTX
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng HTX" value={stats.total} />
        <Metric label="Active" value={stats.active} tone="leaf" />
        <Metric label="Có gói active" value={stats.withActiveSubscription} />
      </div>

      {formOpen && (canManagePlatform || (isAdminHtx && editingId === ownCooperativeId)) && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveCooperative.mutate(); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa HTX' : 'Thêm HTX'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex items-center gap-4">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" className="h-20 w-20 rounded-md object-cover border border-slate-200" />
                  ) : (
                    <span className="grid h-20 w-20 place-items-center rounded-md bg-mint text-leaf">
                      <Building2 size={32} aria-hidden="true" />
                    </span>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-ink">Ảnh đại diện HTX</p>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      {uploadingAvatar ? 'Đang upload...' : 'Upload ảnh'}
                      <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void uploadAvatar(event.target.files[0])} />
                    </label>
                    <Input value={form.avatarUrl} onChange={(event) => update('avatarUrl', event.target.value)} placeholder="Hoặc dán URL ảnh" />
                  </div>
                </div>
              </div>
              <Field label="Tên HTX">
                <Input data-testid="cooperative-name-input" value={form.name} onChange={(event) => update('name', event.target.value)} required />
              </Field>
              <Field label="Mã HTX">
                <Input
                  data-testid="cooperative-code-input"
                  value={form.code}
                  onChange={(event) => update('code', codeLocal(event.target.value))}
                  required
                  readOnly={!canManagePlatform && Boolean(editingId)}
                />
              </Field>
              <Field label="Mã số thuế">
                <Input value={form.taxCode} onChange={(event) => update('taxCode', event.target.value)} />
              </Field>
              <Field label="Số điện thoại">
                <Input data-testid="cooperative-phone-input" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
              </Field>
              <Field label="Người đại diện">
                <Input value={form.representative} onChange={(event) => update('representative', event.target.value)} />
              </Field>
              <Field label="Tỉnh/thành">
                <Input value={form.province} onChange={(event) => update('province', event.target.value)} />
              </Field>
              {canManagePlatform && (
                <Field label="Trạng thái">
                  <Select data-testid="cooperative-status-select" value={form.status} onChange={(event) => update('status', event.target.value as CooperativeStatus)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </Select>
                </Field>
              )}
              <Field label="Quận/huyện">
                <Input value={form.district} onChange={(event) => update('district', event.target.value)} />
              </Field>
              <Field label="Xã/phường">
                <Input value={form.ward} onChange={(event) => update('ward', event.target.value)} />
              </Field>
              <Field label="Địa chỉ">
                <Textarea data-testid="cooperative-address-editor" value={form.address} onChange={(event) => update('address', event.target.value)} required />
              </Field>
            </div>
            {saveCooperative.isError && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(saveCooperative.error)}</div>}
            <div className="flex flex-wrap gap-2">
              <Button data-testid="cooperative-save-button" type="submit" disabled={saveCooperative.isPending}>{saveCooperative.isPending ? 'Đang lưu' : 'Lưu HTX'}</Button>
              <Button type="button" variant="ghost" onClick={() => setForm(emptyCooperativeForm)}>Xóa form</Button>
            </div>
          </form>
        </Panel>
      )}

      {selectedCooperative && isSuperAdmin && (
        <Panel className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Gói và Admin HTX: {selectedCooperative.name}</h2>
              <p className="text-sm text-slate-600">Gán gói, gia hạn, tự tạo hóa đơn SaaS và gán Admin HTX phụ trách.</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => setSelectedCooperative(null)}>Đóng</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); assignSubscription.mutate(); }}>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Gói dịch vụ">
                  <Select data-testid="subscription-plan-select" value={subscriptionForm.planId} onChange={(event) => choosePlan(event.target.value)} required>
                    <option value="">Chọn gói</option>
                    {planItems.map((plan) => (
                      <option key={plan.id} value={plan.id}>{plan.name} - {formatCurrency(plan.priceMonthly)}/tháng</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Trạng thái gói">
                  <Select value={subscriptionForm.status} onChange={(event) => updateSubscription('status', event.target.value as SubscriptionStatus)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="TRIAL">TRIAL</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Select>
                </Field>
                <Field label="Ngày bắt đầu">
                  <Input type="date" value={subscriptionForm.startDate} onChange={(event) => updateSubscription('startDate', event.target.value)} required />
                </Field>
                <Field label="Ngày hết hạn">
                  <Input type="date" value={subscriptionForm.endDate} onChange={(event) => updateSubscription('endDate', event.target.value)} required />
                </Field>
                <Field label="Số tiền hóa đơn">
                  <Input type="number" min="0" value={subscriptionForm.invoiceAmount} onChange={(event) => updateSubscription('invoiceAmount', event.target.value)} placeholder="Theo gói nếu trống" />
                </Field>
                <Field label="Hạn hóa đơn">
                  <Input type="date" value={subscriptionForm.invoiceDueDate} onChange={(event) => updateSubscription('invoiceDueDate', event.target.value)} />
                </Field>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={subscriptionForm.autoRenew} onChange={(event) => updateSubscription('autoRenew', event.target.checked)} />
                Tự gia hạn
              </label>
              <label className="ml-4 inline-flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={subscriptionForm.createInvoice} onChange={(event) => updateSubscription('createInvoice', event.target.checked)} />
                Tự tạo hóa đơn
              </label>
              <Textarea value={subscriptionForm.note} onChange={(event) => updateSubscription('note', event.target.value)} placeholder="Ghi chú nội bộ" />
              {assignSubscription.isError && <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(assignSubscription.error)}</div>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={assignSubscription.isPending}>
                  <WalletCards size={16} aria-hidden="true" />
                  Gán/gia hạn gói
                </Button>
                {selectedCooperative.subscriptions?.[0] && (
                  <Button type="button" variant="danger" onClick={() => cancelSubscription.mutate(selectedCooperative.id)} disabled={cancelSubscription.isPending}>
                    Hủy gói
                  </Button>
                )}
              </div>
            </form>

            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); assignAdmin.mutate(); }}>
              <Field label="Gán Admin HTX">
                <Select value={adminUserId} onChange={(event) => setAdminUserId(event.target.value)}>
                  <option value="">Chọn Admin HTX</option>
                  {adminItems.map((admin) => (
                    <option key={admin.id} value={admin.id}>{admin.fullName} - {admin.email}</option>
                  ))}
                </Select>
              </Field>
              <p className="text-sm text-slate-600">Nếu chưa có tài khoản, tạo ở module Người dùng hệ thống với vai trò Admin HTX.</p>
              {assignAdmin.isError && <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(assignAdmin.error)}</div>}
              <Button type="submit" variant="ghost" disabled={!adminUserId || assignAdmin.isPending}>
                <UserCog size={16} aria-hidden="true" />
                Gán Admin
              </Button>
            </form>
          </div>
        </Panel>
      )}

      <div className={cn('sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0', canManagePlatform ? 'sm:grid-cols-[1fr_180px_180px]' : 'sm:grid-cols-[1fr_180px]')}>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, mã HTX, mã số thuế" />
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </Select>
        {canManagePlatform && (
          <Select value={planFilter} onChange={(event) => setPlanFilter(event.target.value)}>
            <option value="">Tất cả gói</option>
            {planItems.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </Select>
        )}
      </div>

      {cooperatives.isLoading && <SkeletonList />}
      {cooperatives.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(cooperatives.error)}</Panel>}
      {!cooperatives.isLoading && !cooperatives.isError && cooperativeItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có HTX</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cooperativeItems.map((cooperative) => (
          <CooperativeCard
            key={cooperative.id}
            cooperative={cooperative}
            tab={cooperativeTab(cooperative.id)}
            onTabChange={(tab) => setCooperativeTab(cooperative.id, tab)}
            canEdit={canEditCooperative(cooperative)}
            canManagePlatform={canManagePlatform}
            onEdit={() => edit(cooperative)}
            onBilling={() => openBilling(cooperative)}
            onArchive={() => archiveCooperative.mutate(cooperative.id)}
            archivePending={archiveCooperative.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function CooperativeCard({
  cooperative,
  tab,
  onTabChange,
  canEdit,
  canManagePlatform,
  onEdit,
  onBilling,
  onArchive,
  archivePending
}: {
  cooperative: Cooperative;
  tab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  canEdit: boolean;
  canManagePlatform: boolean;
  onEdit: () => void;
  onBilling: () => void;
  onArchive: () => void;
  archivePending: boolean;
}) {
  const currentSubscription = cooperative.subscriptions?.[0];
  const statsQuery = useQuery({
    queryKey: ['cooperative-stats', cooperative.id],
    queryFn: () => apiFetch<CooperativeStats>(`/cooperatives/${cooperative.id}/stats`),
    enabled: tab === 'stats' || tab === 'billing'
  });
  const statsData = statsQuery.data?.data;

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {cooperative.avatarUrl ? (
            <img src={cooperative.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-mint text-leaf">
              <Building2 size={24} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-ink">{cooperative.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{cooperative.code} · {cooperative.province || 'Đang cập nhật'}</p>
          </div>
        </div>
        <Badge className={statusTone(cooperative.status)}>{cooperative.status}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['info', 'stats', 'billing'] as DetailTab[]).map((item) => (
          <button
            key={item}
            type="button"
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              tab === item ? 'bg-leaf text-white' : 'bg-slate-100 text-slate-600'
            )}
            onClick={() => onTabChange(item)}
          >
            {item === 'info' ? 'Thông tin' : item === 'stats' ? 'Thống kê' : 'Gói & HĐ'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Info label="Điện thoại" value={cooperative.phone || '—'} />
            <Info label="Email" value={cooperative.email || '—'} />
            <Info label="Đại diện" value={cooperative.representative || '—'} />
            <Info label="Địa chỉ" value={cooperative.address || '—'} />
          </div>
        </>
      )}

      {tab === 'stats' && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {statsQuery.isLoading && <p className="col-span-2 text-slate-500">Đang tải thống kê...</p>}
          {statsData && (
            <>
              <Info label="Thành viên" value={String(statsData.members)} />
              <Info label="Sản phẩm" value={String(statsData.products)} />
              <Info label="Vùng trồng" value={String(statsData.zones)} />
              <Info label="Nhật ký" value={String(statsData.logs)} />
              <Info label="QR Passport" value={String(statsData.passports)} />
              <Info label="Lượt quét QR" value={String(statsData.qrScanTotal)} />
            </>
          )}
        </div>
      )}

      {tab === 'billing' && (
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-md bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-leaf" aria-hidden="true" />
              <p className="font-bold">{currentSubscription?.plan?.name ?? statsData?.currentPlan ?? 'Chưa gán gói'}</p>
            </div>
            {(currentSubscription || statsData?.subscriptionEndDate) && (
              <p className="mt-1 text-slate-600">
                {(currentSubscription?.status ?? statsData?.subscriptionStatus) || '—'} · hết hạn{' '}
                {formatDate(currentSubscription?.endDate ?? statsData?.subscriptionEndDate ?? '')}
              </p>
            )}
            {statsData && <p className="mt-1 text-slate-600">Hóa đơn chưa thanh toán: {statsData.unpaidInvoices}</p>}
          </div>
          {!canManagePlatform && (
            <Link href="/dashboard/invoices">
              <Button type="button" variant="ghost">Xem hóa đơn SaaS</Button>
            </Link>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {canEdit && (
          <Button data-testid="cooperative-edit-button" type="button" variant="ghost" onClick={onEdit}>
            <Pencil size={16} aria-hidden="true" />
            Sửa
          </Button>
        )}
        {canManagePlatform && (
          <Button type="button" onClick={onBilling}>
            <WalletCards size={16} aria-hidden="true" />
            Gói/HĐ
          </Button>
        )}
        <Link href={`/htx/${cooperative.code}`} target="_blank">
          <Button type="button" variant="ghost">
            <ExternalLink size={16} aria-hidden="true" />
            Public
          </Button>
        </Link>
        {canManagePlatform && cooperative.status !== 'ARCHIVED' && (
          <Button type="button" variant="danger" onClick={onArchive} disabled={archivePending}>
            <Trash2 size={16} aria-hidden="true" />
            Ngừng
          </Button>
        )}
      </div>
    </article>
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
      <Building2 className={cn('mb-3', tone === 'leaf' ? 'text-leaf' : 'text-slate-500')} size={22} aria-hidden="true" />
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
        <div key={index} className="h-72 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
          <div className="mt-8 h-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function cooperativePayload(form: CooperativeForm) {
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    taxCode: form.taxCode || undefined,
    phone: form.phone || undefined,
    email: form.email || undefined,
    address: form.address.trim(),
    province: form.province || undefined,
    district: form.district || undefined,
    ward: form.ward || undefined,
    representative: form.representative || undefined,
    avatarUrl: form.avatarUrl || undefined,
    status: form.status
  };
}

function subscriptionPayload(form: SubscriptionForm) {
  return {
    planId: form.planId,
    status: form.status,
    startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
    endDate: new Date(`${form.endDate}T23:59:59`).toISOString(),
    autoRenew: form.autoRenew,
    note: form.note || undefined,
    createInvoice: form.createInvoice,
    invoiceAmount: form.invoiceAmount ? Number(form.invoiceAmount) : undefined,
    invoiceDueDate: form.invoiceDueDate ? new Date(`${form.invoiceDueDate}T23:59:59`).toISOString() : undefined
  };
}

function fromCooperative(cooperative: Cooperative): CooperativeForm {
  return {
    name: cooperative.name,
    code: cooperative.code,
    taxCode: cooperative.taxCode ?? '',
    phone: cooperative.phone ?? '',
    email: cooperative.email ?? '',
    address: cooperative.address ?? '',
    province: cooperative.province ?? '',
    district: cooperative.district ?? '',
    ward: cooperative.ward ?? '',
    representative: cooperative.representative ?? '',
    avatarUrl: cooperative.avatarUrl ?? '',
    status: cooperative.status
  };
}

function fromSubscription(subscription: Subscription): SubscriptionForm {
  return {
    planId: subscription.plan?.id ?? '',
    status: subscription.status,
    startDate: dateInputValue(subscription.startDate),
    endDate: dateInputValue(subscription.endDate),
    autoRenew: subscription.autoRenew,
    note: subscription.note ?? '',
    createInvoice: true,
    invoiceAmount: subscription.plan ? String(subscription.plan.priceYearly || subscription.plan.priceMonthly || '') : '',
    invoiceDueDate: dateInputDaysFromNow(7)
  };
}

function cooperativeStats(items: Cooperative[]) {
  return {
    total: items.length,
    active: items.filter((item) => item.status === 'ACTIVE').length,
    withActiveSubscription: items.filter((item) => ['ACTIVE', 'TRIAL'].includes(item.subscriptions?.[0]?.status ?? '')).length
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateInputDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateInputMonthsFromNow(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function dateInputValue(value?: string | null) {
  if (!value) return todayInputDate();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return todayInputDate();
  return date.toISOString().slice(0, 10);
}

function codeLocal(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
