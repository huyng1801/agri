'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ZodSchema } from 'zod';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency, formatDate, statusTone } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from './ui';

export type FieldConfig = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'password' | 'textarea' | 'select';
  options?: string[];
  placeholder?: string;
};

export type ResourceConfig = {
  title: string;
  endpoint: string;
  schema: ZodSchema;
  fields: FieldConfig[];
  primary?: string;
  secondary?: string[];
  amountField?: string;
  dateField?: string;
  statusField?: string;
  createLabel?: string;
  createRoles?: string[];
  baseQuery?: Record<string, string>;
};

type ListResponse = {
  data?: unknown[];
  meta?: Record<string, unknown>;
};

export function ResourcePage({ config }: { config: ResourceConfig }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const canCreate = !config.createRoles?.length || config.createRoles.some((role) => user?.roles.includes(role));
  const queryClient = useQueryClient();
  const baseQueryKey = JSON.stringify(config.baseQuery ?? {});
  const queryKey = [config.endpoint, baseQueryKey, search];
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => apiFetch<ListResponse>(resourceListPath(config.endpoint, search, config.baseQuery))
  });
  const items = useMemo(() => {
    const payload = data?.data as ListResponse | unknown[] | undefined;
    if (Array.isArray(payload)) return payload as Record<string, unknown>[];
    if (payload && typeof payload === 'object' && Array.isArray((payload as ListResponse).data)) {
      return (payload as ListResponse).data as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(config.schema),
    defaultValues: {}
  });

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      apiFetch(config.endpoint, {
        method: 'POST',
        body: JSON.stringify(cleanValues(values))
      }),
    onSuccess: () => {
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey });
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold tracking-normal text-ink">{config.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          {canCreate && (
            <Button data-testid={createButtonTestId(config.endpoint)} onClick={() => setOpen(true)}>
              <Plus size={18} aria-hidden="true" />
              {config.createLabel ?? 'Thêm'}
            </Button>
          )}
        </div>
      </div>

      <div className="sticky top-[66px] z-10 flex gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm" className="pl-10" />
        </div>
        <Button variant="ghost" aria-label="Lọc">
          <SlidersHorizontal size={18} aria-hidden="true" />
        </Button>
      </div>

      {open && canCreate && (
        <Panel className="fixed inset-x-0 bottom-0 z-40 max-h-[86vh] overflow-y-auto rounded-b-none border-x-0 border-b-0 p-4 shadow-soft sm:static sm:rounded-md sm:border sm:shadow-sm">
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{config.createLabel ?? `Thêm ${config.title.toLowerCase()}`}</h2>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Đóng
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {config.fields.map((field) => (
                <label key={field.name} className={cn('space-y-1 text-sm font-semibold text-slate-700', field.type === 'textarea' && 'sm:col-span-2')}>
                  <span>{field.label}</span>
                  <Field field={field} endpoint={config.endpoint} register={form.register(field.name)} />
                  {form.formState.errors[field.name] && (
                    <span className="block text-sm font-medium text-rose-600">{String(form.formState.errors[field.name]?.message)}</span>
                  )}
                </label>
              ))}
            </div>
            {mutation.isError && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{(mutation.error as Error).message}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang lưu' : 'Lưu'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => form.reset()}>
                Xóa form
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {isLoading && <SkeletonList />}
      {isError && <Panel data-testid="error-state" className="text-rose-700">{(error as Error).message}</Panel>}
      {!isLoading && !isError && items.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có dữ liệu</Panel>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ResourceCard key={String(item.id ?? item.code ?? item.slug)} item={item} config={config} />
        ))}
      </div>
    </div>
  );
}

function Field({
  field,
  endpoint,
  register
}: {
  field: FieldConfig;
  endpoint: string;
  register: ReturnType<typeof useForm>['register'] extends (...args: never[]) => infer R ? R : never;
}) {
  const testId = fieldTestId(endpoint, field);
  if (field.type === 'textarea') return <Textarea data-testid={testId} placeholder={field.placeholder} {...register} />;
  if (field.type === 'select') {
    return (
      <Select data-testid={testId} {...register}>
        <option value="">Chọn</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  }
  return <Input data-testid={testId} type={field.type ?? 'text'} placeholder={field.placeholder} {...register} />;
}

function ResourceCard({ item, config }: { item: Record<string, unknown>; config: ResourceConfig }) {
  const primary = String(item[config.primary ?? 'name'] ?? item.email ?? item.code ?? item.slug ?? 'Bản ghi');
  const status = String(item[config.statusField ?? 'status'] ?? '');
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-ink">{primary}</h2>
          <p className="mt-1 text-sm text-slate-500">{String(item.code ?? item.slug ?? item.email ?? item.id ?? '')}</p>
        </div>
        {status && <Badge className={statusTone(status)}>{status}</Badge>}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {config.secondary?.map((key) => (
          <div key={key}>
            <dt className="text-slate-500">{labelOf(key)}</dt>
            <dd className="mt-1 font-semibold text-ink">{displayValue(item[key])}</dd>
          </div>
        ))}
        {config.amountField && (
          <div>
            <dt className="text-slate-500">Giá trị</dt>
            <dd className="mt-1 font-semibold text-ink">{formatCurrency(item[config.amountField])}</dd>
          </div>
        )}
        {config.dateField && (
          <div>
            <dt className="text-slate-500">Ngày</dt>
            <dd className="mt-1 font-semibold text-ink">{formatDate(item[config.dateField])}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

function SkeletonList() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-40 animate-pulse rounded-md border border-slate-200 bg-white p-4">
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

function createButtonTestId(endpoint: string) {
  const prefix = resourcePrefix(endpoint);
  return prefix ? `${prefix}-create-button` : 'resource-create-button';
}

function fieldTestId(endpoint: string, field: FieldConfig) {
  const prefix = resourcePrefix(endpoint);
  if (!prefix) return `resource-${field.name}-input`;
  const aliasedName = fieldAlias(field.name);
  if (field.type === 'select' || ['categoryId', 'unit', 'zoneId', 'farmerId'].includes(field.name)) return `${prefix}-${aliasedName}-select`;
  if (field.type === 'textarea') return `${prefix}-${aliasedName}-editor`;
  return `${prefix}-${aliasedName}-input`;
}

function resourcePrefix(endpoint: string) {
  const prefixes: Record<string, string> = {
    '/products': 'product',
    '/farming-logs': 'farming-log',
    '/users': 'user',
    '/zones': 'zone',
    '/passports': 'passport',
    '/orders': 'order',
    '/subscription-plans': 'plan',
    '/invoices': 'invoice',
    '/cooperatives': 'cooperative'
  };
  return prefixes[endpoint];
}

function fieldAlias(fieldName: string) {
  const aliases: Record<string, string> = {
    categoryId: 'category',
    zoneId: 'zone',
    farmerId: 'farmer',
    thumbnailFileId: 'image',
    description: 'description'
  };
  return aliases[fieldName] ?? fieldName.replace(/Id$/, '');
}

function cleanValues(values: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    if ('name' in value) return String((value as { name: unknown }).name);
    return 'Đã nhập';
  }
  return String(value);
}

function resourceListPath(endpoint: string, search: string, baseQuery: Record<string, string> = {}) {
  const params = new URLSearchParams(baseQuery);
  if (search) params.set('search', search);
  const query = params.toString();
  return query ? `${endpoint}?${query}` : endpoint;
}

function labelOf(key: string) {
  const labels: Record<string, string> = {
    phone: 'SĐT',
    address: 'Địa chỉ',
    unit: 'Đơn vị',
    price: 'Giá',
    role: 'Vai trò',
    activityType: 'Hoạt động',
    cooperativeId: 'HTX',
    productId: 'Sản phẩm',
    maxProducts: 'Sản phẩm',
    viewCount: 'Lượt xem'
  };
  return labels[key] ?? key;
}
