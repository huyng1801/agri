import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Boxes, QrCode } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { STANDARD_PRODUCTS } from '@/lib/public-catalog';
import { EmptyPublicState, ProductCard, PublicProduct, publicListItems } from '@/components/public-marketplace';
import { PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { PublicPagination } from '@/components/public-pagination';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getRequestPublicSiteKey } from '@/lib/request-site';
import { ProductFilterBar, ProductFilterValues } from '@/components/product-filter-drawer';

type ProductFilters = ProductFilterValues & {
  page?: string;
};

type ProductsPageProps = {
  searchParams?: Promise<ProductFilters>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const isPassport = siteKey === 'passport';
  const filters = (await searchParams) ?? {};
  const page = parseInt(filters.page || '1', 10);
  const path = page > 1 ? `/san-pham?page=${page}` : '/san-pham';
  return buildPublicMetadata({
    title: page > 1 ? `Danh mục nông sản - Trang ${page}` : 'Danh mục sản phẩm nông sản',
    description: isPassport
      ? 'Tra cứu nông sản hợp tác xã, đặc sản vùng miền, tiêu chuẩn chất lượng và hồ sơ mã QR Hộ chiếu nông nghiệp.'
      : 'Tra cứu nông sản hợp tác xã, đặc sản vùng miền, tiêu chuẩn chất lượng và hồ sơ mã QR Agripassport.',
    path,
    openGraphTitle: isPassport ? 'Danh mục nông sản có hồ sơ truy xuất' : 'Danh mục nông sản chuẩn hóa - AGRIPASSPORT',
    openGraphDescription: isPassport
      ? 'Tìm kiếm sản phẩm nông nghiệp từ các hợp tác xã xác thực, lọc theo giá, địa phương và mã QR hộ chiếu số.'
      : 'Tìm kiếm sản phẩm nông nghiệp từ các hợp tác xã xác thực, lọc theo giá, địa phương và mã QR Passport.'
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

const emptyProductsResult = (page: number): GetProductsResult => ({ products: [], total: 0, totalPages: 1, currentPage: page });

function localPreviewProducts(filters: ProductFilters, page: number, limit: number): GetProductsResult {
  if (process.env.NODE_ENV === 'production') return emptyProductsResult(page);
  const query = String(filters.search || '').trim().toLowerCase();
  const products = query
    ? STANDARD_PRODUCTS.filter((product) => `${product.name} ${product.description || ''}`.toLowerCase().includes(query))
    : STANDARD_PRODUCTS;
  const start = (page - 1) * limit;
  return {
    products: products.slice(start, start + limit),
    total: products.length,
    totalPages: Math.max(1, Math.ceil(products.length / limit)),
    currentPage: page
  };
}

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
    if (!response.ok) return localPreviewProducts(filters, page, limit);
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
    return localPreviewProducts(filters, page, limit);
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
  const siteKey = await getRequestPublicSiteKey();
  const isPassport = siteKey === 'passport';
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
    <PublicShell hasQrQuery={filters.hasQr === 'true'}>
      <PublicPageMain className="public-product-directory py-8 sm:py-12">
        {/* Page Header */}
        <div className="public-directory-heading border-b border-[var(--border)] pb-6 mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className={`text-sm font-semibold text-[#0d7a28] ${!isPassport ? 'uppercase tracking-[0.12em]' : ''}`}>
                {isPassport ? 'Hồ sơ hộ chiếu nông nghiệp và dữ liệu nông sản minh bạch' : 'Nền tảng dữ liệu nông sản minh bạch'}
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Danh mục nông sản hợp tác xã
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base lg:max-w-none lg:whitespace-nowrap lg:text-[0.8125rem] xl:text-sm">
                Tra cứu thông tin nông sản chuẩn hóa từ các hợp tác xã uy tín. Dữ liệu công khai bao gồm quy cách đóng gói, vùng canh tác, chứng nhận an toàn và mã QR {isPassport ? 'Hộ chiếu nông nghiệp' : 'Agripassport'}.
              </p>
            </div>

            {/* Compact data summary: metadata, not promotional badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
              <span><strong className="font-bold text-[var(--text-primary)]">{total}</strong> sản phẩm</span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">/</span>
              <span>Trang <strong className="font-bold text-[var(--text-primary)]">{currentPage}</strong> / {totalPages}</span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">/</span>
              <span>{products.length} sản phẩm mỗi trang</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar (Mobile Drawer + Desktop Row) */}
        <div className="public-directory-filter"><ProductFilterBar initialFilters={filters} categoryOptions={categoryOptions} /></div>

        {/* 4-Column Product Grid */}
        {products.length ? (
          <div className="space-y-10">
            <div className="public-directory-grid grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} siteKey={siteKey} />
              ))}
            </div>

            <PublicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              hrefForPage={(page) => buildPageUrl(filters, page)}
              ariaLabel="Phân trang sản phẩm"
            />
            <div className="public-directory-callout flex flex-col gap-4 rounded-[var(--public-radius-card)] border border-[var(--brand-primary)]/20 bg-[var(--brand-primary-subtle)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-2 text-[var(--brand-primary)]"><QrCode size={18} aria-hidden="true" /><p className="text-xs font-bold tracking-[0.1em]">Đã có mã trên tem?</p></div>
                <h2 className="mt-2 text-lg font-extrabold text-[var(--text-primary)]">Mở thẳng hồ sơ nguồn gốc của sản phẩm.</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Nhập mã QR để xem vùng trồng, nhật ký và chứng nhận khi hồ sơ đã được công khai.</p>
              </div>
              <Link href="/truy-xuat" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)]">Tra cứu mã QR <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
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
