'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Package, Pencil, Plus, RefreshCcw, Save, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';

type FileAsset = {
  id: string;
  objectKey: string;
  publicUrl?: string | null;
};

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

type Zone = {
  id: string;
  name: string;
  code: string;
};

type Farmer = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
};

type DashboardProduct = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  unit: string;
  status: ProductStatus;
  categoryId?: string | null;
  thumbnailFileId?: string | null;
  zoneId?: string | null;
  farmerId?: string | null;
  packagingInfo?: string | null;
  specification?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory | null;
  zone?: Zone | null;
  farmer?: Farmer | null;
  thumbnail?: FileAsset | null;
  passports?: Array<{ id?: string; passportCode: string; status?: string }>;
  _count?: { farmingLogs?: number; passports?: number };
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

type ProductForm = {
  code: string;
  name: string;
  slug: string;
  price: string;
  unit: string;
  status: ProductStatus;
  categoryId: string;
  zoneId: string;
  farmerId: string;
  thumbnailFileId: string;
  imageUrl: string;
  description: string;
  packagingInfo: string;
  specification: string;
};

const emptyForm: ProductForm = {
  code: '',
  name: '',
  slug: '',
  price: '0',
  unit: 'kg',
  status: 'DRAFT',
  categoryId: '',
  zoneId: '',
  farmerId: '',
  thumbnailFileId: '',
  imageUrl: '',
  description: '',
  packagingInfo: '',
  specification: ''
};

const units = ['kg', 'g', 'tấn', 'bao', 'thùng', 'hộp', 'chai', 'bó', 'cái'];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', slug: '' });
  const [uploading, setUploading] = useState(false);

  const products = useQuery({
    queryKey: ['products-dashboard', search],
    queryFn: () => apiFetch<ListResponse<DashboardProduct>>(`/products?limit=60${search ? `&search=${encodeURIComponent(search)}` : ''}`)
  });
  const categories = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => apiFetch<ProductCategory[]>('/products/categories')
  });
  const zones = useQuery({
    queryKey: ['zones-for-products'],
    queryFn: () => apiFetch<ListResponse<Zone>>('/zones?limit=100&status=ACTIVE')
  });
  const farmers = useQuery({
    queryKey: ['farmers-for-products'],
    queryFn: () => apiFetch<ListResponse<Farmer>>('/users?role=FARMER&limit=100')
  });

  const productItems = listItems(products.data?.data);
  const categoryItems = Array.isArray(categories.data?.data) ? categories.data.data : [];
  const zoneItems = listItems(zones.data?.data);
  const farmerItems = listItems(farmers.data?.data);
  const stats = useMemo(() => productStats(productItems), [productItems]);

  const saveProduct = useMutation({
    mutationFn: (statusOverride?: ProductStatus) => {
      const payload = productPayload({ ...form, status: statusOverride ?? form.status });
      return editingId
        ? apiFetch<DashboardProduct>(`/products/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<DashboardProduct>('/products', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromProduct(result.data));
      setFormOpen(true);
      queryClient.invalidateQueries({ queryKey: ['products-dashboard'] });
    }
  });

  const archiveProduct = useMutation({
    mutationFn: (id: string) => apiFetch<DashboardProduct>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products-dashboard'] })
  });

  const createCategory = useMutation({
    mutationFn: () =>
      apiFetch<ProductCategory>('/products/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryDraft.name,
          slug: categoryDraft.slug || slugifyLocal(categoryDraft.name)
        })
      }),
    onSuccess: (result) => {
      setCategoryDraft({ name: '', slug: '' });
      setForm((current) => ({ ...current, categoryId: result.data.id }));
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    }
  });

  function update<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !current.slug ? { slug: slugifyLocal(String(value)) } : {})
    }));
  }

  function newProduct() {
    setEditingId(null);
    setForm({ ...emptyForm, code: nextProductCode() });
    setFormOpen(true);
  }

  function edit(product: DashboardProduct) {
    setEditingId(product.id);
    setForm(fromProduct(product));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadImage(file: File) {
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
      const response = await fetch(plan.data.uploadUrl, {
        method: plan.data.method || 'PUT',
        headers: plan.data.headers,
        body: file
      });
      if (!response.ok) throw new Error('Không upload được ảnh sản phẩm lên R2');
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
      setForm((current) => ({
        ...current,
        thumbnailFileId: confirmed.data.id,
        imageUrl: confirmed.data.publicUrl || plan.data.publicUrl || ''
      }));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Sản phẩm</h1>
          <p className="text-sm text-slate-600">Quản lý sản phẩm, ảnh R2, vùng trồng và trạng thái public của HTX.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => products.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button data-testid="product-create-button" type="button" onClick={newProduct}>
            <Plus size={18} aria-hidden="true" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tổng sản phẩm" value={stats.total} />
        <Metric label="Đang public" value={stats.published} tone="leaf" />
        <Metric label="Có QR" value={stats.withQr} />
      </div>

      {formOpen && (
        <Panel className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveProduct.mutate(undefined); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Đóng</Button>
                {editingId && (
                  <Link href={`/san-pham/${form.slug}`} target="_blank">
                    <Button type="button" variant="ghost">Preview public</Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Mã sản phẩm">
                    <Input data-testid="product-code-input" value={form.code} onChange={(event) => update('code', event.target.value)} required />
                  </Field>
                  <Field label="Tên sản phẩm">
                    <Input data-testid="product-name-input" value={form.name} onChange={(event) => update('name', event.target.value)} required />
                  </Field>
                  <Field label="Slug">
                    <Input data-testid="product-slug-input" value={form.slug} onChange={(event) => update('slug', slugifyLocal(event.target.value))} />
                  </Field>
                  <Field label="Trạng thái">
                    <Select data-testid="product-status-select" value={form.status} onChange={(event) => update('status', event.target.value as ProductStatus)}>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="HIDDEN">HIDDEN</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </Select>
                  </Field>
                  <Field label="Danh mục">
                    <Select data-testid="product-category-select" value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}>
                      <option value="">Không chọn</option>
                      {categoryItems.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Đơn vị">
                    <Select data-testid="product-unit-select" value={form.unit} onChange={(event) => update('unit', event.target.value)}>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Giá">
                    <Input data-testid="product-price-input" type="number" min="0" value={form.price} onChange={(event) => update('price', event.target.value)} required />
                  </Field>
                  <Field label="Vùng trồng">
                    <Select data-testid="product-zone-select" value={form.zoneId} onChange={(event) => update('zoneId', event.target.value)}>
                      <option value="">Không chọn</option>
                      {zoneItems.map((zone) => (
                        <option key={zone.id} value={zone.id}>{zone.name} ({zone.code})</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Nông dân phụ trách">
                    <Select data-testid="product-farmer-select" value={form.farmerId} onChange={(event) => update('farmerId', event.target.value)}>
                      <option value="">Không chọn</option>
                      {farmerItems.map((farmer) => (
                        <option key={farmer.id} value={farmer.id}>{farmer.fullName}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Mô tả">
                  <Textarea data-testid="product-description-editor" value={form.description} onChange={(event) => update('description', event.target.value)} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Đóng gói">
                    <Textarea data-testid="product-packagingInfo-editor" value={form.packagingInfo} onChange={(event) => update('packagingInfo', event.target.value)} />
                  </Field>
                  <Field label="Quy cách">
                    <Textarea data-testid="product-specification-editor" value={form.specification} onChange={(event) => update('specification', event.target.value)} />
                  </Field>
                </div>
              </div>

              <aside className="space-y-4">
                <Panel className="space-y-3 bg-slate-50 shadow-none">
                  <h3 className="font-bold">Ảnh sản phẩm</h3>
                  <div className="aspect-[4/3] overflow-hidden rounded-md bg-white">
                    {form.imageUrl ? (
                      <img data-testid="product-image-preview" src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-slate-400">
                        <ImagePlus size={36} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <Input data-testid="product-image-input" value={form.imageUrl} readOnly placeholder="Upload R2 để tạo URL ảnh public" className="bg-slate-100 text-slate-600" />
                  <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint">
                    <ImagePlus size={18} aria-hidden="true" />
                    {uploading ? 'Đang upload' : 'Upload R2'}
                    <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0])} />
                  </label>
                </Panel>

                <Panel className="space-y-3 bg-slate-50 shadow-none">
                  <h3 className="font-bold">Tạo nhanh danh mục</h3>
                  <Input value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || slugifyLocal(event.target.value) }))} placeholder="Tên danh mục" />
                  <Input value={categoryDraft.slug} onChange={(event) => setCategoryDraft((current) => ({ ...current, slug: slugifyLocal(event.target.value) }))} placeholder="slug" />
                  <Button type="button" variant="ghost" onClick={() => createCategory.mutate()} disabled={!categoryDraft.name || createCategory.isPending}>
                    <Plus size={18} aria-hidden="true" />
                    Thêm danh mục
                  </Button>
                </Panel>
              </aside>
            </div>

            {(saveProduct.isError || createCategory.isError) && (
              <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                {errorMessage(saveProduct.error ?? createCategory.error)}
              </div>
            )}

            <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
              <Button data-testid="product-save-draft-button" type="button" variant="ghost" onClick={() => saveProduct.mutate('DRAFT')} disabled={saveProduct.isPending}>
                <Save size={18} aria-hidden="true" />
                Lưu nháp
              </Button>
              <Button data-testid="product-publish-button" type="button" onClick={() => saveProduct.mutate('PUBLISHED')} disabled={saveProduct.isPending}>
                <Save size={18} aria-hidden="true" />
                Publish
              </Button>
              <Button type="submit" disabled={saveProduct.isPending}>
                {saveProduct.isPending ? 'Đang lưu' : 'Lưu'}
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="sticky top-[66px] z-10 flex gap-2 rounded-md border border-slate-200 bg-white p-2 lg:top-0">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm" className="pl-10" />
        </div>
      </div>

      {products.isLoading && <ProductSkeleton />}
      {products.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(products.error)}</Panel>}
      {!products.isLoading && !products.isError && productItems.length === 0 && <Panel data-testid="empty-state" className="text-slate-600">Chưa có sản phẩm</Panel>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {productItems.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-slate-100">
              {product.thumbnail?.publicUrl ? (
                <img src={product.thumbnail.publicUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-slate-400">
                  <Package size={40} aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-ink">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{product.code}</p>
                </div>
                <Badge className={statusClass(product.status)}>{product.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Giá" value={formatVnd(product.price)} />
                <Info label="Đơn vị" value={product.unit} />
                <Info label="Danh mục" value={product.category?.name || '—'} />
                <Info label="Vùng" value={product.zone?.name || '—'} />
                <Info label="Nhật ký" value={String(product._count?.farmingLogs ?? 0)} />
                <Info label="QR" value={String(product._count?.passports ?? product.passports?.length ?? 0)} />
              </div>
              <p className="text-xs text-slate-500">Cập nhật {formatDate(product.updatedAt || product.createdAt)}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => edit(product)}>
                  <Pencil size={16} aria-hidden="true" />
                  Sửa
                </Button>
                <Link href={`/san-pham/${product.slug}`} target="_blank">
                  <Button type="button" variant="ghost">Public</Button>
                </Link>
                <Button type="button" variant="danger" onClick={() => archiveProduct.mutate(product.id)} disabled={archiveProduct.isPending}>
                  <Trash2 size={16} aria-hidden="true" />
                  Ẩn
                </Button>
              </div>
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

function ProductSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-md border border-slate-200 bg-white">
          <div className="h-44 bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function productPayload(form: ProductForm) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    slug: form.slug || undefined,
    price: Number(form.price || 0),
    unit: form.unit,
    status: form.status,
    categoryId: form.categoryId || undefined,
    zoneId: form.zoneId || undefined,
    farmerId: form.farmerId || undefined,
    thumbnailFileId: form.thumbnailFileId || undefined,
    description: form.description || undefined,
    packagingInfo: form.packagingInfo || undefined,
    specification: form.specification || undefined
  };
}

function fromProduct(product: DashboardProduct): ProductForm {
  return {
    code: product.code,
    name: product.name,
    slug: product.slug,
    price: String(product.price ?? 0),
    unit: product.unit || 'kg',
    status: product.status,
    categoryId: product.categoryId ?? '',
    zoneId: product.zoneId ?? '',
    farmerId: product.farmerId ?? '',
    thumbnailFileId: product.thumbnailFileId ?? product.thumbnail?.id ?? '',
    imageUrl: product.thumbnail?.publicUrl ?? '',
    description: product.description ?? '',
    packagingInfo: product.packagingInfo ?? '',
    specification: product.specification ?? ''
  };
}

function productStats(items: DashboardProduct[]) {
  return {
    total: items.length,
    published: items.filter((item) => item.status === 'PUBLISHED').length,
    withQr: items.filter((item) => (item._count?.passports ?? item.passports?.length ?? 0) > 0).length
  };
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function nextProductCode() {
  return `SP-${Date.now().toString().slice(-6)}`;
}

function formatVnd(value: string | number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

function statusClass(status: ProductStatus) {
  if (status === 'PUBLISHED') return 'bg-mint text-leaf';
  if (status === 'DRAFT') return 'bg-sky text-slate-700';
  if (status === 'HIDDEN') return 'bg-stone-100 text-stone-700';
  return 'bg-rose-50 text-rose-700';
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
