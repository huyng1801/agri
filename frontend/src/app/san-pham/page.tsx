import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, QrCode, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, PublicShell, publicListItems } from '@/components/public-marketplace';
import { PublicPageHeader, PublicPageMain } from '@/components/public-layout';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Sản phẩm | HTXONLINE',
  description: 'Sàn sản phẩm nông nghiệp, đặc sản địa phương và sản phẩm có QR Passport từ các hợp tác xã trên HTXONLINE.',
  alternates: {
    canonical: 'https://htxonline.vn/san-pham'
  },
  openGraph: {
    title: 'Sản phẩm HTXONLINE',
    description: 'Tìm kiếm sản phẩm nông nghiệp từ hợp tác xã, lọc theo giá, địa phương và QR Passport.',
    url: 'https://htxonline.vn/san-pham',
    siteName: 'HTXONLINE',
    locale: 'vi_VN',
    type: 'website'
  }
};

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
  const params = new URLSearchParams({ limit: '24' });
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
  const products = await getProducts(filters);
  const hasActiveFilter = Boolean(filters.search || filters.category || filters.cooperative || filters.province || filters.minPrice || filters.maxPrice || filters.hasQr || filters.sort);
  const qrProducts = products.filter((product) => product.passports?.length).length;
  const provinceCount = new Set(products.map((product) => product.cooperative?.province).filter(Boolean)).size;
  const categoryHighlights = Array.from(new Set(products.map((product) => product.category?.name).filter(Boolean))).slice(0, 4) as string[];

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          title="Sản phẩm"
          description={`Sản phẩm public từ các HTX trên HTXONLINE${products.length ? ` · ${products.length} kết quả` : ''}.`}
        />

        <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(244,250,243,0.94)_100%)] p-4 shadow-[var(--shadow-card)] backdrop-blur sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf/80">Bộ lọc thông minh</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Tìm nhanh sản phẩm phù hợp theo HTX, địa phương và tín hiệu truy xuất.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Từ đặc sản địa phương đến nông sản có QR Passport, người mua có thể lọc nhanh theo vùng, mức giá và mức độ minh bạch ngay trên cùng một màn hình.
              </p>
              {categoryHighlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categoryHighlights.map((category) => (
                    <span key={category} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: Sparkles, title: 'Kết quả hiển thị', value: `${products.length}+`, note: 'Sản phẩm public đang mở bán' },
                { icon: QrCode, title: 'Có QR Passport', value: `${qrProducts}+`, note: 'Sản phẩm có thể truy xuất nhanh' },
                { icon: MapPin, title: 'Địa phương', value: `${provinceCount || 1}+`, note: 'Tỉnh thành đang có mặt trên sàn' }
              ].map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200/80 bg-white/86 p-4 shadow-sm">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-leaf">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{item.title}</p>
                  <p className="mt-1 text-2xl font-bold text-ink">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProductFilterForm filters={filters} hasActiveFilter={hasActiveFilter} />

        {products.length ? (
          <div className="mt-6 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPublicState title="Không tìm thấy sản phẩm" description="Thử tìm kiếm từ khóa khác hoặc quay lại sau khi HTX publish sản phẩm." />
          </div>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}

function ProductFilterForm({ filters, hasActiveFilter }: { filters: ProductFilters; hasActiveFilter: boolean }) {
  return (
    <form className="mt-5 rounded-[2rem] border border-slate-200/80 bg-white/94 p-2.5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-3" action="/san-pham">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input
          name="search"
          defaultValue={filters.search ?? ''}
          placeholder="Tìm sản phẩm, HTX, mô tả"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint sm:min-h-12"
        />
      </div>

      <details className="mt-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 lg:hidden" open={Boolean(filters.province || filters.minPrice || filters.maxPrice)}>
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Bộ lọc thêm</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            name="province"
            defaultValue={filters.province ?? ''}
            placeholder="Tỉnh/thành"
            className="min-h-10.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          <input
            name="minPrice"
            defaultValue={filters.minPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá từ"
            className="min-h-10.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          <input
            name="maxPrice"
            defaultValue={filters.maxPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá đến"
            className="min-h-10.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
        </div>
      </details>

      <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-3">
        <input
          name="province"
          defaultValue={filters.province ?? ''}
          placeholder="Tỉnh/thành"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
        <input
          name="minPrice"
          defaultValue={filters.minPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá từ"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
        <input
          name="maxPrice"
          defaultValue={filters.maxPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá đến"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
      </div>

      <div className="mt-2.5 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <label className="inline-flex min-h-10.5 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
          <input name="hasQr" type="checkbox" value="true" defaultChecked={filters.hasQr === 'true'} className="h-4 w-4 accent-leaf" />
          Có QR Passport
        </label>
        <label className="inline-flex min-h-10.5 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <select name="sort" defaultValue={filters.sort ?? ''} className="bg-transparent outline-none">
            <option value="">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </label>
        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        {filters.cooperative && <input type="hidden" name="cooperative" value={filters.cooperative} />}
        <Button>Tìm sản phẩm</Button>
        {hasActiveFilter && (
          <Link href="/san-pham" className="inline-flex min-h-10.5 items-center justify-center rounded-md px-3 text-sm font-semibold text-slate-600 hover:bg-mint">
            Xóa lọc
          </Link>
        )}
      </div>
    </form>
  );
}
