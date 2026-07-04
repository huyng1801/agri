'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, RefreshCcw, Trash2, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

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
  maxCooperatives?: number | null;
  maxProducts?: number | null;
  maxMembers?: number | null;
  maxZones?: number | null;
  featuresJson?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PlanForm = {
  name: string;
  slug: string;
  priceMonthly: string;
  priceYearly: string;
  maxCooperatives: string;
  maxProducts: string;
  maxMembers: string;
  maxZones: string;
  features: string;
  isActive: string;
};

const emptyForm: PlanForm = {
  name: '',
  slug: '',
  priceMonthly: '0',
  priceYearly: '0',
  maxCooperatives: '',
  maxProducts: '',
  maxMembers: '',
  maxZones: '',
  features: '',
  isActive: 'true'
};

export default function SubscriptionPlansPage() {
  const queryClient = useQueryClient();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);

  const plans = useQuery({
    queryKey: ['subscription-plans-dashboard', search, activeFilter],
    queryFn: () => apiFetch<ListResponse<Plan>>(`/subscription-plans?limit=80${search ? `&search=${encodeURIComponent(search)}` : ''}${activeFilter ? `&isActive=${activeFilter}` : ''}`)
  });

  const planItems = listItems(plans.data?.data);
  const stats = useMemo(() => planStats(planItems), [planItems]);

  const savePlan = useMutation({
    mutationFn: () =>
      editingId
        ? apiFetch<Plan>(`/subscription-plans/${editingId}`, { method: 'PATCH', body: JSON.stringify(planPayload(form)) })
        : apiFetch<Plan>('/subscription-plans', { method: 'POST', body: JSON.stringify(planPayload(form)) }),
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromPlan(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['subscription-plans-dashboard'] });
    }
  });

  const disablePlan = useMutation({
    mutationFn: (id: string) => apiFetch<Plan>(`/subscription-plans/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription-plans-dashboard'] })
  });

  function update<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !current.slug ? { slug: slugifyLocal(String(value)) } : {})
    }));
  }

  function newPlan() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function edit(plan: Plan) {
    setEditingId(plan.id);
    setForm(fromPlan(plan));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Gói dịch vụ SaaS</h1>
          <p className="text-sm text-slate-600">Quản lý Free, Basic, Pro, Enterprise và giới hạn gói cho HTXONLINE.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => plans.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          {isSuperAdmin && (
            <Button data-testid="plan-create-button" type="button" onClick={newPlan}>
              <Plus size={18} aria-hidden="true" />
              Thêm gói
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng gói" value={stats.total} />
        <Metric label="Đang bật" value={stats.active} tone="leaf" />
        <Metric label="Có phí tháng" value={stats.paid} />
      </div>

      {formOpen && isSuperAdmin && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); savePlan.mutate(); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa gói' : 'Thêm gói'}</h2>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Tên gói">
                <Input data-testid="plan-name-input" value={form.name} onChange={(event) => update('name', event.target.value)} required />
              </Field>
              <Field label="Slug">
                <Input data-testid="plan-slug-input" value={form.slug} onChange={(event) => update('slug', slugifyLocal(event.target.value))} required />
              </Field>
              <Field label="Giá tháng">
                <Input data-testid="plan-priceMonthly-input" type="number" min="0" value={form.priceMonthly} onChange={(event) => update('priceMonthly', event.target.value)} />
              </Field>
              <Field label="Giá năm">
                <Input data-testid="plan-priceYearly-input" type="number" min="0" value={form.priceYearly} onChange={(event) => update('priceYearly', event.target.value)} />
              </Field>
              <Field label="Giới hạn HTX">
                <Input type="number" min="0" value={form.maxCooperatives} onChange={(event) => update('maxCooperatives', event.target.value)} placeholder="Không giới hạn nếu trống" />
              </Field>
              <Field label="Giới hạn sản phẩm">
                <Input type="number" min="0" value={form.maxProducts} onChange={(event) => update('maxProducts', event.target.value)} placeholder="Không giới hạn nếu trống" />
              </Field>
              <Field label="Giới hạn thành viên">
                <Input type="number" min="0" value={form.maxMembers} onChange={(event) => update('maxMembers', event.target.value)} placeholder="Không giới hạn nếu trống" />
              </Field>
              <Field label="Giới hạn vùng trồng">
                <Input type="number" min="0" value={form.maxZones} onChange={(event) => update('maxZones', event.target.value)} placeholder="Không giới hạn nếu trống" />
              </Field>
              <Field label="Trạng thái">
                <Select data-testid="plan-isActive-select" value={form.isActive} onChange={(event) => update('isActive', event.target.value)}>
                  <option value="true">Đang bật</option>
                  <option value="false">Tạm tắt</option>
                </Select>
              </Field>
              <Field label="Tính năng">
                <Textarea value={form.features} onChange={(event) => update('features', event.target.value)} placeholder="Mỗi dòng một tính năng" />
              </Field>
            </div>
            {savePlan.isError && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage(savePlan.error)}</div>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={savePlan.isPending}>{savePlan.isPending ? 'Đang lưu' : 'Lưu gói'}</Button>
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>Xóa form</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0 sm:grid-cols-[1fr_180px]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên gói hoặc slug" />
        <Select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
          <option value="">Tất cả</option>
          <option value="true">Đang bật</option>
          <option value="false">Tạm tắt</option>
        </Select>
      </div>

      {plans.isLoading && <SkeletonList />}
      {plans.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(plans.error)}</Panel>}
      {!plans.isLoading && !plans.isError && planItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có gói dịch vụ</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {planItems.map((plan) => (
          <article key={plan.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{plan.slug}</p>
              </div>
              <Badge className={plan.isActive ? 'bg-mint text-leaf' : 'bg-stone-100 text-stone-700'}>{plan.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Info label="Giá tháng" value={formatCurrency(plan.priceMonthly)} />
              <Info label="Giá năm" value={formatCurrency(plan.priceYearly)} />
              <Info label="Sản phẩm" value={limitText(plan.maxProducts)} />
              <Info label="Thành viên" value={limitText(plan.maxMembers)} />
              <Info label="Vùng trồng" value={limitText(plan.maxZones)} />
              <Info label="HTX" value={limitText(plan.maxCooperatives)} />
            </div>
            {plan.featuresJson?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.featuresJson.slice(0, 5).map((feature) => (
                  <Badge key={feature} className="bg-slate-100 text-slate-700">{feature}</Badge>
                ))}
              </div>
            ) : null}
            {isSuperAdmin && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => edit(plan)}>
                  <Pencil size={16} aria-hidden="true" />
                  Sửa
                </Button>
                {plan.isActive && (
                  <Button type="button" variant="danger" onClick={() => disablePlan.mutate(plan.id)} disabled={disablePlan.isPending}>
                    <Trash2 size={16} aria-hidden="true" />
                    Tắt
                  </Button>
                )}
              </div>
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
      <WalletCards className={cn('mb-3', tone === 'leaf' ? 'text-leaf' : 'text-slate-500')} size={22} aria-hidden="true" />
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
        <div key={index} className="h-64 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-5 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function planPayload(form: PlanForm) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    priceMonthly: Number(form.priceMonthly || 0),
    priceYearly: Number(form.priceYearly || 0),
    maxCooperatives: optionalNumber(form.maxCooperatives),
    maxProducts: optionalNumber(form.maxProducts),
    maxMembers: optionalNumber(form.maxMembers),
    maxZones: optionalNumber(form.maxZones),
    featuresJson: form.features.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
    isActive: form.isActive === 'true'
  };
}

function fromPlan(plan: Plan): PlanForm {
  return {
    name: plan.name,
    slug: plan.slug,
    priceMonthly: String(plan.priceMonthly ?? 0),
    priceYearly: String(plan.priceYearly ?? 0),
    maxCooperatives: valueOrEmpty(plan.maxCooperatives),
    maxProducts: valueOrEmpty(plan.maxProducts),
    maxMembers: valueOrEmpty(plan.maxMembers),
    maxZones: valueOrEmpty(plan.maxZones),
    features: plan.featuresJson?.join('\n') ?? '',
    isActive: String(plan.isActive)
  };
}

function optionalNumber(value: string) {
  return value === '' ? undefined : Number(value);
}

function valueOrEmpty(value?: number | null) {
  return value === null || value === undefined ? '' : String(value);
}

function limitText(value?: number | null) {
  return value === null || value === undefined ? 'Không giới hạn' : String(value);
}

function planStats(items: Plan[]) {
  return {
    total: items.length,
    active: items.filter((item) => item.isActive).length,
    paid: items.filter((item) => Number(item.priceMonthly) > 0).length
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function slugifyLocal(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
