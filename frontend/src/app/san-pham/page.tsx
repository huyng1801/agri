import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Boxes, Filter, MapPin, QrCode, Search, SlidersHorizontal, Sparkles, Store, X } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, publicListItems } from '@/components/public-marketplace';
import { PublicPageHeader, PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { Button } from '@/components/ui';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Danh mục Sản phẩm Nông sản',
    description: 'Tra cứu nông sản hợp tác xã, đặc sản vùng miền, tiêu chuẩn chất lượng và hồ sơ mã QR Hộ Chiếu Nông Nghiệp.',
    path: '/san-pham',
    openGraphTitle: 'Danh mục Nông sản Chuẩn hóa - AGRIPASSPORT',
    openGraphDescription: 'Tìm kiếm sản phẩm nông nghiệp từ các hợp tác xã xác thực, lọc theo giá, địa phương và mã QR Passport.'
  });
}

type ProductList = {
  data: PublicProduct[];
};

type ProductFilters = {
  search?: string;
  category?: string;
  cooperative?: string;
  province?: string;
  minPrice?: string;
  maxPrice?: string;
  hasQr?: string;
  sort?: string;
};

type ProductsPageProps = {
  searchParams?: Promise<ProductFilters>;
};

async function getProducts(filters: ProductFilters) {
  const params = new URLSearchParams({ limit: '100' });
  for (const key of ['search', 'category', 'cooperative', 'province', 'minPrice', 'maxPrice', 'hasQr', 'sort'] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }

  try {
    const response = await fetch(`${API_URL}/products/public?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductList | PublicProduct[]>;
    return publicListItems(body.data);
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = (await searchParams) ?? {};
  const siteKey = await getRequestPublicSiteKey();
  const [products, siteProfile] = await Promise.all([getProducts(filters), getPublicSiteProfile(siteKey)]);

  const hasActiveFilter = Boolean(
    filters.search ||
      filters.category ||
      filters.cooperative ||
      filters.province ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.hasQr ||
      filters.sort
  );

  const qrProductsCount = products.filter((product) => product.passports?.length).length;
  const provinceCount = new Set(products.map((product) => product.cooperative?.province).filter(Boolean)).size;

  // Extract category options from fetched products
  const categoryOptions = Array.from(
    new Map(
      products
        .map((product) => product.category)
        .filter((category): category is NonNullable<PublicProduct['category']> => Boolean(category))
        .map((category) => [category.slug, category])
    ).values()
  ).slice(0, 8);

  return (
    <PublicShell>
      <PublicPageMain className="py-8 sm:py-12">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#106f8a]">
                <Sparkles size={13} />
                <span>Hạ tầng Dữ liệu Nông sản Quốc gia</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Danh mục Nông sản Hợp tác xã
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Tra cứu thông tin nông sản chuẩn hóa từ các hợp tác xã uy tín. Dữ liệu công khai bao gồm quy cách, vùng canh tác, chứng nhận an toàn và mã QR Hộ Chiếu Nông Nghiệp.
              </p>
            </div>

            {/* Live Data Summary Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 font-semibold text-[var(--text-primary)] shadow-sm">
                <strong className="text-[#106f8a] font-bold">{products.length}</strong> sản phẩm
              </span>
              <span className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 font-semibold text-[var(--text-primary)] shadow-sm">
                <strong className="text-[#131935] font-bold">{provinceCount}</strong> tỉnh thành
              </span>
              <span className="rounded-lg border border-[#0d7a28]/30 bg-[#0d7a28]/10 px-3 py-1.5 font-semibold text-[#0d7a28]">
                <strong className="font-bold">{qrProductsCount}</strong> có QR Passport
              </span>
            </div>
          </div>

          {/* Quick Category Chips */}
          {categoryOptions.length > 0 && (
            <div className="mt-6 -mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mr-1">
                  Ngành hàng:
                </span>
                <Link
                  href="/san-pham"
                  aria-current={!filters.category ? 'page' : undefined}
                  className={`inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-bold transition ${
                    !filters.category
                      ? 'bg-[#106f8a] text-white shadow-sm'
                      : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#106f8a] hover:text-[#106f8a]'
                  }`}
                >
                  Tất cả ngành hàng
                </Link>
                {categoryOptions.map((cat) => {
                  const isActive = filters.category === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/san-pham?category=${encodeURIComponent(cat.slug)}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#106f8a] text-white shadow-sm'
                          : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#106f8a] hover:text-[#106f8a]'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Search & Filter Bar */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm mb-8">
          <form action="/san-pham" method="GET" className="space-y-3">
            {/* Row 1: Primary Search Input */}
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                aria-hidden="true"
              />
              <input
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder="Nhập tên sản phẩm, hợp tác xã hoặc từ khóa..."
                aria-label="Tìm kiếm sản phẩm"
                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[#106f8a] focus:bg-white focus:ring-2 focus:ring-[#106f8a]/20"
              />
            </div>

            {/* Row 2: Secondary Filters & Actions */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
              {/* Province input */}
              <div className="lg:col-span-3">
                <input
                  name="province"
                  defaultValue={filters.province ?? ''}
                  placeholder="Tỉnh / Thành phố"
                  aria-label="Lọc theo tỉnh thành"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#106f8a] focus:bg-white focus:ring-2 focus:ring-[#106f8a]/20"
                />
              </div>

              {/* Price from */}
              <div className="lg:col-span-2">
                <input
                  name="minPrice"
                  defaultValue={filters.minPrice ?? ''}
                  inputMode="numeric"
                  placeholder="Giá từ (đ)"
                  aria-label="Giá tối thiểu"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#106f8a] focus:bg-white focus:ring-2 focus:ring-[#106f8a]/20"
                />
              </div>

              {/* Price to */}
              <div className="lg:col-span-2">
                <input
                  name="maxPrice"
                  defaultValue={filters.maxPrice ?? ''}
                  inputMode="numeric"
                  placeholder="Giá đến (đ)"
                  aria-label="Giá tối đa"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#106f8a] focus:bg-white focus:ring-2 focus:ring-[#106f8a]/20"
                />
              </div>

              {/* Sort selector */}
              <div className="lg:col-span-2">
                <select
                  name="sort"
                  defaultValue={filters.sort ?? ''}
                  aria-label="Sắp xếp kết quả"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-2 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#106f8a] focus:bg-white focus:ring-2 focus:ring-[#106f8a]/20"
                >
                  <option value="">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>
              </div>

              {/* QR Checkbox Toggle */}
              <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    name="hasQr"
                    value="true"
                    defaultChecked={filters.hasQr === 'true'}
                    className="h-4 w-4 rounded border-[var(--border-strong)] text-[#106f8a] focus:ring-[#106f8a]"
                  />
                  <span>Chỉ sản phẩm có QR</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[#106f8a] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d596e]"
                  >
                    Lọc dữ liệu
                  </button>
                  {hasActiveFilter && (
                    <Link
                      href="/san-pham"
                      className="inline-flex h-11 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-slate-100"
                    >
                      <X size={13} />
                      <span>Xóa lọc</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Hidden inputs to preserve query context */}
            {filters.category && <input type="hidden" name="category" value={filters.category} />}
            {filters.cooperative && <input type="hidden" name="cooperative" value={filters.cooperative} />}
          </form>
        </div>

        {/* 4-Column Product Grid */}
        {products.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-white p-8 sm:p-12 text-center shadow-xs">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[#106f8a]" aria-hidden="true">
              <Boxes size={22} />
            </span>
            <h2 className="mt-3 text-base sm:text-lg font-bold text-[var(--text-primary)]">Không tìm thấy sản phẩm phù hợp</h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-md mx-auto">
              Thử thay đổi bộ lọc hoặc xóa từ khóa tìm kiếm để xem danh mục đầy đủ.
            </p>
            <div className="mt-5">
              <Link
                href="/san-pham"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#106f8a] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d596e]"
              >
                Xem toàn bộ danh mục
              </Link>
            </div>
          </div>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
