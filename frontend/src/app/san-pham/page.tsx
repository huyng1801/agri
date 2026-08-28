import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, QrCode, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, publicListItems } from '@/components/public-marketplace';
import { PublicPageHeader, PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { Button } from '@/components/ui';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Sản phẩm',
    description: 'Danh mục sản phẩm nông nghiệp, đặc sản địa phương và sản phẩm có QR truy xuất từ các hợp tác xã trên nền tảng.',
    path: '/san-pham',
    openGraphTitle: 'Danh mục sản phẩm công khai',
    openGraphDescription: 'Tìm kiếm sản phẩm nông nghiệp từ hợp tác xã, lọc theo giá, địa phương và trạng thái QR truy xuất.'
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
  const siteKey = await getRequestPublicSiteKey();
  const [products, siteProfile] = await Promise.all([getProducts(filters), getPublicSiteProfile(siteKey)]);
  const hasActiveFilter = Boolean(filters.search || filters.category || filters.cooperative || filters.province || filters.minPrice || filters.maxPrice || filters.hasQr || filters.sort);
  const qrProducts = products.filter((product) => product.passports?.length).length;
  const provinceCount = new Set(products.map((product) => product.cooperative?.province).filter(Boolean)).size;
  const categoryHighlights = Array.from(new Set(products.map((product) => product.category?.name).filter(Boolean))).slice(0, 4) as string[];

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          title="Sản phẩm"
          description={`${siteProfile.appName} đang công khai danh mục sản phẩm theo nhịp card rõ ràng, ít nhiễu và tối ưu tốt hơn cho mobile${products.length ? ` · ${products.length} kết quả` : ''}.`}
        />

        <section className="rounded-[1.7rem] border border-[#e6d9c4] bg-[linear-gradient(180deg,rgba(255,253,248,0.96)_0%,rgba(245,239,227,0.88)_100%)] p-3 shadow-[var(--shadow-card)] backdrop-blur sm:rounded-[2rem] sm:p-5 lg:p-5">
          <div className="grid gap-3 lg:grid-cols-[0.88fr_1.12fr] lg:items-start xl:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-sm sm:tracking-[0.24em]">Bộ lọc thông minh</p>
              <h2 className="mt-1.5 text-[1.2rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink sm:text-2xl lg:text-[1.9rem]">Tìm nhanh theo HTX, địa phương và QR Passport.</h2>
              <p className="mt-2 hidden max-w-2xl text-[0.9rem] leading-[1.6] text-slate-600 sm:mt-3 sm:block sm:text-base sm:leading-7">
                Từ đặc sản địa phương đến nông sản có QR Passport, người mua có thể lọc nhanh theo vùng, mức giá và mức độ minh bạch ngay trên cùng một màn hình.
              </p>
              {categoryHighlights.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                  {categoryHighlights.map((category) => (
                    <span key={category} className="rounded-full border border-[#e6d9c4] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Sparkles, title: 'Kết quả hiển thị', value: `${products.length}+`, note: 'Sản phẩm công khai đang mở bán' },
                { icon: QrCode, title: 'Có QR Passport', value: `${qrProducts}+`, note: 'Sản phẩm có thể truy xuất nhanh' },
                { icon: MapPin, title: 'Địa phương', value: `${provinceCount || 1}+`, note: 'Tỉnh thành đang có mặt trên sàn' }
              ].map((item, index) => (
                <article key={item.title} className="rounded-[1.15rem] border border-[#e6d9c4] bg-white/88 p-2.5 shadow-sm sm:rounded-[1.45rem] sm:p-4 lg:min-h-[132px]">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-[var(--surface-0)] text-ink sm:h-11 sm:w-11">
                    <item.icon size={16} aria-hidden="true" />
                  </span>
                  <p className="mt-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-slate-500 sm:mt-3 sm:text-sm">{item.title}</p>
                  <p className="mt-0.5 text-[1.15rem] font-extrabold text-ink sm:text-2xl">{item.value}</p>
                  <p className="mt-1 hidden text-sm leading-[1.6] text-slate-600 sm:block">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ProductFilterForm filters={filters} hasActiveFilter={hasActiveFilter} />

        {products.length ? (
          <div className="mt-6 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPublicState title="Không tìm thấy sản phẩm" description="Thử tìm kiếm từ khóa khác hoặc quay lại sau khi HTX đăng công khai sản phẩm." />
          </div>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}

function ProductFilterForm({ filters, hasActiveFilter }: { filters: ProductFilters; hasActiveFilter: boolean }) {
  return (
    <form className="mt-4 rounded-[1.5rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.94)] p-2.5 shadow-[var(--shadow-card)] backdrop-blur-xl sm:mt-5 sm:rounded-[2rem] sm:p-3" action="/san-pham">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input
          name="search"
          defaultValue={filters.search ?? ''}
          placeholder="Tìm sản phẩm, HTX, mô tả"
          className="min-h-11 w-full rounded-[1.05rem] border border-[#e6d9c4] bg-[var(--surface-0)] pl-10 pr-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint sm:min-h-12"
        />
      </div>

      <details className="mt-2.5 rounded-[1.2rem] border border-[#e6d9c4] bg-[var(--surface-0)] p-2.5 lg:hidden" open={Boolean(filters.province || filters.minPrice || filters.maxPrice)}>
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Bộ lọc thêm</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            name="province"
            defaultValue={filters.province ?? ''}
            placeholder="Tỉnh/thành"
            className="min-h-11 w-full rounded-[1rem] border border-[#e6d9c4] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          <input
            name="minPrice"
            defaultValue={filters.minPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá từ"
            className="min-h-11 w-full rounded-[1rem] border border-[#e6d9c4] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          <input
            name="maxPrice"
            defaultValue={filters.maxPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá đến"
            className="min-h-11 w-full rounded-[1rem] border border-[#e6d9c4] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
        </div>
      </details>

      <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-3">
        <input
          name="province"
          defaultValue={filters.province ?? ''}
          placeholder="Tỉnh/thành"
          className="min-h-11 w-full rounded-[1rem] border border-[#e6d9c4] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
        <input
          name="minPrice"
          defaultValue={filters.minPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá từ"
          className="min-h-11 w-full rounded-[1rem] border border-[#e6d9c4] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
        <input
          name="maxPrice"
          defaultValue={filters.maxPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá đến"
          className="min-h-11 w-full rounded-[1rem] border border-[#e6d9c4] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
      </div>

      <div className="mt-2.5 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <label className="inline-flex min-h-11 items-center gap-2 rounded-[1rem] border border-[#e6d9c4] bg-[var(--surface-0)] px-3 text-sm font-semibold text-slate-700">
          <input name="hasQr" type="checkbox" value="true" defaultChecked={filters.hasQr === 'true'} className="peer sr-only" />
          <span className="relative h-5 w-5 shrink-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-leaf peer-checked:bg-leaf peer-focus-visible:ring-4 peer-focus-visible:ring-mint after:absolute after:left-[4px] after:top-[5px] after:h-2 after:w-3 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:opacity-0 after:transition peer-checked:after:opacity-100" aria-hidden="true" />
          Có QR Passport
        </label>
        <label className="inline-flex min-h-11 items-center justify-between gap-2 rounded-[1rem] border border-[#e6d9c4] bg-[var(--surface-0)] px-3 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <select name="sort" defaultValue={filters.sort ?? ''} className="min-h-11 bg-transparent pr-6 outline-none">
            <option value="">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </label>
        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        {filters.cooperative && <input type="hidden" name="cooperative" value={filters.cooperative} />}
        <Button className="min-h-11 px-5 lg:min-w-[150px]">Tìm sản phẩm</Button>
        {hasActiveFilter && (
          <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-[1rem] px-3 text-sm font-semibold text-slate-600 hover:bg-[var(--surface-0)]">
            Xóa lọc
          </Link>
        )}
      </div>
    </form>
  );
}
