import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Boxes, Sparkles } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, publicListItems } from '@/components/public-marketplace';
import { PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { ProductFilterBar, ProductFilterValues } from '@/components/product-filter-drawer';

type ProductFilters = ProductFilterValues & {
  page?: string;
};

type ProductsPageProps = {
  searchParams?: Promise<ProductFilters>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const filters = (await searchParams) ?? {};
  const page = parseInt(filters.page || '1', 10);
  const path = page > 1 ? `/san-pham?page=${page}` : '/san-pham';
  return buildPublicMetadata({
    title: page > 1 ? `Danh mục Nông sản - Trang ${page}` : 'Danh mục Sản phẩm Nông sản',
    description: 'Tra cứu nông sản hợp tác xã, đặc sản vùng miền, tiêu chuẩn chất lượng và hồ sơ mã QR Hộ Chiếu Nông Nghiệp.',
    path,
    openGraphTitle: 'Danh mục Nông sản Chuẩn hóa - AGRIPASSPORT',
    openGraphDescription: 'Tìm kiếm sản phẩm nông nghiệp từ các hợp tác xã xác thực, lọc theo giá, địa phương và mã QR Passport.'
  });
}

type ProductList = {
  data: PublicProduct[];
};

type GetProductsResult = {
  products: PublicProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
};

async function getProducts(filters: ProductFilters, page: number = 1, limit: number = 12): Promise<GetProductsResult> {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page)
  });
  for (const key of ['search', 'category', 'cooperative', 'province', 'minPrice', 'maxPrice', 'hasQr', 'sort'] as const) {
    if (filters[key]) params.set(key, filters[key] as string);
  }

  try {
    const response = await fetch(`${API_URL}/products/public?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return { products: [], total: 0, totalPages: 1, currentPage: page };
    const body = (await response.json()) as ApiEnvelope<ProductList | PublicProduct[]> & {
      meta?: { total?: number; totalPages?: number; page?: number; limit?: number };
    };
    const products = publicListItems(body.data);
    const total = Number(body.meta?.total ?? products.length);
    const totalPages = Number(body.meta?.totalPages ?? (Math.ceil(total / limit) || 1));
    return {
      products,
      total,
      totalPages,
      currentPage: page
    };
  } catch {
    return { products: [], total: 0, totalPages: 1, currentPage: page };
  }
}

async function getCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const response = await fetch(`${API_URL}/products/public/categories`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = await response.json();
    if (Array.isArray(body?.data)) {
      return body.data;
    }
    return [];
  } catch {
    return [];
  }
}

function buildPageUrl(filters: ProductFilters, newPage: number) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v && k !== 'page') params.set(k, v as string);
  }
  if (newPage > 1) params.set('page', String(newPage));
  const qs = params.toString();
  return qs ? `/san-pham?${qs}` : '/san-pham';
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = (await searchParams) ?? {};
  const currentPage = Math.max(1, parseInt(filters.page || '1', 10));
  const [productsData, categoriesData] = await Promise.all([
    getProducts(filters, currentPage, 12),
    getCategories()
  ]);

  const { products, total, totalPages } = productsData;

  // Extract or use categories
  const categoryOptions = categoriesData.length > 0
    ? categoriesData.slice(0, 12)
    : Array.from(
        new Map(
          products
            .map((product) => product.category)
            .filter((category): category is NonNullable<PublicProduct['category']> => Boolean(category))
            .map((category) => [category.slug, category])
        ).values()
      ).slice(0, 10);

  return (
    <PublicShell>
      <PublicPageMain className="py-8 sm:py-12">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
                <Sparkles size={13} />
                <span>Nền tảng Hộ Chiếu Nông Nghiệp & Dữ liệu Nông sản Minh bạch</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Danh mục Nông sản Hợp tác xã
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Tra cứu thông tin nông sản chuẩn hóa từ các hợp tác xã uy tín. Dữ liệu công khai bao gồm quy cách đóng gói, vùng canh tác, chứng nhận an toàn và mã QR Hộ Chiếu Nông Nghiệp.
              </p>
            </div>

            {/* Live Data Summary Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 font-semibold text-[var(--text-primary)] shadow-xs">
                Tổng cộng <strong className="text-[#106f8a] font-bold">{total}</strong> sản phẩm
              </span>
              <span className="rounded-xl border border-[var(--border)] bg-white px-3.5 py-2 font-semibold text-[var(--text-primary)] shadow-xs">
                Trang <strong className="text-[#131935] font-bold">{currentPage}</strong> / {totalPages}
              </span>
              <span className="rounded-xl border border-[#0d7a28]/30 bg-[#0d7a28]/10 px-3.5 py-2 font-semibold text-[#0d7a28]">
                Hiển thị <strong className="font-bold">{products.length}</strong> sản phẩm / trang
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar (Mobile Drawer + Desktop Row) */}
        <ProductFilterBar initialFilters={filters} categoryOptions={categoryOptions} />

        {/* 4-Column Product Grid */}
        {products.length ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Phân trang sản phẩm" className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--border)]">
                {currentPage > 1 && (
                  <Link
                    href={buildPageUrl(filters, currentPage - 1)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] shadow-xs transition hover:border-[#0d7a28] hover:text-[#0d7a28]"
                  >
                    Trang trước
                  </Link>
                )}

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <Link
                        key={p}
                        href={buildPageUrl(filters, p)}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold transition ${
                          isCurrent
                            ? 'bg-[#0d7a28] text-white shadow-xs'
                            : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#0d7a28] hover:text-[#0d7a28]'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={buildPageUrl(filters, currentPage + 1)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] shadow-xs transition hover:border-[#0d7a28] hover:text-[#0d7a28]"
                  >
                    Trang sau
                  </Link>
                )}
              </nav>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 sm:p-12 text-center shadow-xs">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] text-[#0d7a28]" aria-hidden="true">
              <Boxes size={26} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-[var(--text-primary)]">Không tìm thấy nông sản phù hợp</h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-md mx-auto">
              Thử thay đổi bộ lọc, chọn tỉnh thành khác hoặc xóa từ khóa tìm kiếm để xem danh mục đầy đủ.
            </p>
            <div className="mt-6">
              <Link
                href="/san-pham"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0d7a28] px-6 text-xs font-bold text-white shadow-xs transition hover:bg-[#0a6120]"
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
