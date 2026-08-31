import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, QrCode, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, productImage, publicListItems } from '@/components/public-marketplace';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
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
  const isInternal = siteKey === 'htxonline';
  const [products, siteProfile] = await Promise.all([getProducts(filters), getPublicSiteProfile(siteKey)]);
  const hasActiveFilter = Boolean(filters.search || filters.category || filters.cooperative || filters.province || filters.minPrice || filters.maxPrice || filters.hasQr || filters.sort);
  const qrProducts = products.filter((product) => product.passports?.length).length;
  const provinceCount = new Set(products.map((product) => product.cooperative?.province).filter(Boolean)).size;
  const categoryHighlights = Array.from(new Set(products.map((product) => product.category?.name).filter(Boolean))).slice(0, 6) as string[];
  const featuredProduct = products[0];
  const featuredProductSlug = featuredProduct?.slug ? `/san-pham/${featuredProduct.slug}` : '/san-pham';
  const featuredProductQr = featuredProduct?.passports?.[0];
  const featuredProductQrHref = featuredProductQr ? `/passport/${featuredProductQr.publicSlug || featuredProductQr.passportCode}` : null;
  const quickProductLinks = products.slice(1, 4);
  const heroTabs = [
    filters.category || categoryHighlights[0] || 'Tất cả',
    categoryHighlights.find((item) => item !== (filters.category || categoryHighlights[0])) || 'Có QR Passport',
    categoryHighlights.find((item) => item !== (filters.category || categoryHighlights[0]) && item !== categoryHighlights[1]) || 'Địa phương'
  ];

  return (
    <PublicShell>
      <PublicPageMain className={isInternal ? 'pt-5 sm:pt-8 lg:pt-10' : undefined}>
        {isInternal ? (
          <>
            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#2b8a3e] sm:text-sm">Khám phá sản phẩm</p>
                  <h1 className="mt-2 max-w-[11ch] text-[2rem] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#1f2233] sm:max-w-none sm:text-[3.2rem]">
                    Sản phẩm công khai được trình bày để quét nhanh hơn.
                  </h1>
                </div>
                <Link
                  href="/htx"
                  className="inline-flex min-h-11 w-fit items-center gap-2 self-start rounded-full border border-[#d8e7d8] bg-white px-5 text-base font-semibold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] sm:self-auto"
                >
                  Khám phá thêm
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1f9b4b] text-white">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </div>

              <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-3">
                  {heroTabs.map((tab, index) => (
                    <span
                      key={`${tab}-${index}`}
                      className={
                        index === 0
                          ? 'inline-flex min-h-12 items-center rounded-full bg-[#1f9b4b] px-6 text-[1.02rem] font-semibold text-white shadow-[0_14px_28px_rgba(31,155,75,0.18)]'
                          : 'inline-flex min-h-12 items-center rounded-full border border-[#d8e7d8] bg-white px-6 text-[1.02rem] font-semibold text-[#2f3b4f] shadow-sm'
                      }
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
                {featuredProduct ? (
                  <article className={`${publicCardClass} overflow-visible rounded-[2.2rem] border-[#dbe7d8] p-4 sm:p-5`}>
                    <div className="rounded-[1.7rem] border-2 border-[#1f9b4b] bg-white p-3 sm:p-4">
                      <div className="mx-auto inline-flex min-h-10 items-center gap-2 rounded-b-[1.2rem] rounded-t-[0.95rem] bg-[#1f9b4b] px-4 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(31,155,75,0.18)]">
                        <span>{siteProfile.appName}</span>
                        <span className="opacity-60">x</span>
                        <span>{featuredProduct.cooperative?.name || 'HTX Việt Nam'}</span>
                      </div>
                      <Link href={featuredProductSlug} className="mt-4 block overflow-hidden rounded-[1.5rem] bg-[#fbfdf9]">
                        <div className="aspect-[1/1] w-full bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf4_100%)] sm:aspect-[16/11]">
                          <img
                            src={productImage(featuredProduct)}
                            alt={featuredProduct.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                    </div>

                    <div className="px-2 pb-1 pt-5 text-center sm:px-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                        {featuredProduct.category?.name || 'Nông sản công khai'}
                      </p>
                      <Link
                        href={featuredProductSlug}
                        className="mt-3 block text-[1.38rem] font-extrabold leading-[1.16] tracking-[-0.03em] text-[#1f2233] transition hover:text-[#1f9b4b] sm:text-[1.72rem]"
                      >
                        {featuredProduct.name}
                      </Link>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {featuredProduct.cooperative?.province || featuredProduct.zone?.name || 'Sản phẩm đang được công khai trên HTXONLINE'}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href={featuredProductSlug}
                          className="inline-flex min-h-11 items-center rounded-full bg-[#1f9b4b] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(31,155,75,0.18)] transition hover:-translate-y-0.5"
                        >
                          Xem chi tiết
                        </Link>
                        {featuredProductQrHref ? (
                          <Link
                            href={featuredProductQrHref}
                            className="inline-flex min-h-11 items-center rounded-full border border-[#d8e7d8] bg-white px-5 text-sm font-bold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                          >
                            Mở QR Passport
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ) : (
                  <article className={`${publicCardClass} rounded-[2.2rem] border-[#dbe7d8] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf6_100%)] p-5 sm:p-6`}>
                    <div className="rounded-[1.8rem] border border-[#dbe7d8] bg-white/80 p-5 text-center shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Khối trưng bày sản phẩm</p>
                      <h2 className="mt-3 text-[1.4rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1f2233] sm:text-[1.8rem]">
                        Dữ liệu nổi bật sẽ xuất hiện ở đây khi HTX công khai sản phẩm.
                      </h2>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {hasActiveFilter
                          ? 'Bỏ bớt điều kiện lọc để xem lại sản phẩm đang có trên HTXONLINE.'
                          : 'Khi dữ liệu sản phẩm sẵn sàng, khu vực này sẽ chuyển thành thẻ trưng bày lớn để người dùng quét nhanh hơn.'}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href="/san-pham"
                          className="inline-flex min-h-11 items-center rounded-full bg-[#1f9b4b] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(31,155,75,0.18)] transition hover:-translate-y-0.5"
                        >
                          Xem toàn bộ sản phẩm
                        </Link>
                        <Link
                          href="/htx"
                          className="inline-flex min-h-11 items-center rounded-full border border-[#d8e7d8] bg-white px-5 text-sm font-bold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                        >
                          Xem danh sách HTX
                        </Link>
                      </div>
                    </div>
                  </article>
                )}

                <div className="grid gap-3">
                  <section className="rounded-[2rem] border border-[#dbe7d8] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-5">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#2b8a3e]">Quét nhanh theo ngữ cảnh</p>
                    <h2 className="mt-2 text-[1.36rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1f2233] sm:text-[1.7rem]">
                      Gọn hơn cho mobile nhưng vẫn giữ đủ thông tin để chọn đúng sản phẩm.
                    </h2>
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {[
                        { icon: Sparkles, title: 'Hiển thị', value: `${products.length}+` },
                        { icon: QrCode, title: 'Có QR', value: `${qrProducts}+` },
                        { icon: MapPin, title: 'Địa phương', value: `${provinceCount || 1}+` }
                      ].map((item) => (
                        <article key={item.title} className="rounded-[1.4rem] border border-[#e6ede1] bg-[#fbfcf8] px-3 py-4 text-center">
                          <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7ef] text-[#1f9b4b]">
                            <item.icon size={18} aria-hidden="true" />
                          </span>
                          <p className="mt-2 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#2b8a3e]">{item.title}</p>
                          <p className="mt-1 text-[1.2rem] font-extrabold text-[#1f2233]">{item.value}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  {quickProductLinks.length > 0 ? (
                    <section className="rounded-[2rem] border border-[#dbe7d8] bg-[linear-gradient(180deg,#ffffff_0%,#f9fbf7_100%)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e]">Lướt nhanh</p>
                          <p className="mt-1 text-[1.08rem] font-extrabold text-[#1f2233]">Sản phẩm nổi bật khác</p>
                        </div>
                        <Link href="/htx" className="text-sm font-semibold text-[#1f9b4b]">
                          Xem HTX
                        </Link>
                      </div>
                      <div className="mt-4 grid gap-2.5">
                        {quickProductLinks.map((product) => (
                          <Link
                            key={product.id}
                            href={`/san-pham/${product.slug}`}
                            className="flex items-center gap-3 rounded-[1.25rem] border border-[#e6ede1] bg-white px-3 py-3 transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
                          >
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-[#f3f7ef]">
                              <img src={productImage(product)} alt={product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#1f2233]">{product.name}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                {product.cooperative?.province || product.category?.name || 'HTXONLINE'}
                              </p>
                            </div>
                            <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-[#1f9b4b]" />
                          </Link>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <PublicPageHeader
              title="Sản phẩm"
              description={`${siteProfile.appName} đang công khai danh mục sản phẩm theo bố cục gọn, thoáng và ưu tiên quét nhanh trên mobile${products.length ? ` · ${products.length} kết quả` : ''}.`}
            />

            <section className="rounded-[2rem] border border-[#e8e4d8] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-5 lg:p-6">
              <div className="grid gap-3 lg:grid-cols-[0.88fr_1.12fr] lg:items-start xl:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e] sm:text-sm sm:tracking-[0.24em]">Danh mục công khai</p>
                  <h2 className="mt-2 text-[1.32rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#24283a] sm:text-[2rem] lg:text-[2.15rem]">Tìm nhanh theo HTX, địa phương và trạng thái QR truy xuất.</h2>
                  <p className="mt-2 hidden max-w-2xl text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:block sm:text-base sm:leading-7">
                    Phần sản phẩm được sắp lại theo bố cục sáng, card lớn và bộ lọc gọn để người mua quét nhanh hơn mà vẫn đủ thông tin cần thiết.
                  </p>
                  {categoryHighlights.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                      {categoryHighlights.map((category) => (
                        <span key={category} className="rounded-full border border-[#d8e7d8] bg-[#f6fbf4] px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm">
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
                  ].map((item) => (
                    <article key={item.title} className="rounded-[1.35rem] border border-[#e8e4d8] bg-[#fbfcf8] p-3 shadow-[0_14px_30px_rgba(15,23,42,0.04)] sm:rounded-[1.55rem] sm:p-4 lg:min-h-[132px]">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef7ef] text-[#1f9b4b] sm:h-11 sm:w-11">
                        <item.icon size={18} aria-hidden="true" />
                      </span>
                      <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#2b8a3e] sm:mt-3 sm:text-sm">{item.title}</p>
                      <p className="mt-1 text-[1.18rem] font-extrabold text-[#1f2233] sm:text-2xl">{item.value}</p>
                      <p className="mt-1 hidden text-sm leading-[1.6] text-slate-600 sm:block">{item.note}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <ProductFilterForm filters={filters} hasActiveFilter={hasActiveFilter} demeterLike={isInternal} categoryHighlights={categoryHighlights} />

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

function ProductFilterForm({
  filters,
  hasActiveFilter,
  demeterLike = false,
  categoryHighlights = []
}: {
  filters: ProductFilters;
  hasActiveFilter: boolean;
  demeterLike?: boolean;
  categoryHighlights?: string[];
}) {
  return (
    <form
      className={
        demeterLike
          ? 'mt-5 rounded-[2rem] border border-[#dbe7d8] bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:rounded-[2.2rem] sm:p-4'
          : 'mt-4 rounded-[1.7rem] border border-[#e8e4d8] bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:mt-5 sm:rounded-[2rem] sm:p-4'
      }
      action="/san-pham"
    >
      {demeterLike && categoryHighlights.length > 0 ? (
        <div className="-mx-1 mb-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2.5">
            {categoryHighlights.map((category, index) => (
              <span
                key={category}
                className={
                  category === filters.category || (!filters.category && index === 0)
                    ? 'inline-flex min-h-10 items-center rounded-full bg-[#1f9b4b] px-4 text-sm font-semibold text-white'
                    : 'inline-flex min-h-10 items-center rounded-full border border-[#d8e7d8] bg-[#fbfcf8] px-4 text-sm font-semibold text-[#314665]'
                }
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input
          name="search"
          defaultValue={filters.search ?? ''}
          placeholder="Tìm sản phẩm, HTX, mô tả"
          className={
            demeterLike
              ? 'min-h-12 w-full rounded-[1.2rem] border border-[#dbe7d8] bg-[#fbfcf8] pl-10 pr-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint'
              : 'min-h-11 w-full rounded-[1.1rem] border border-[#e8e4d8] bg-[#f7faf4] pl-10 pr-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint sm:min-h-12'
          }
        />
      </div>

      <details
        className={
          demeterLike
            ? 'mt-2.5 rounded-[1.3rem] border border-[#dbe7d8] bg-[#fbfcf8] p-2.5 lg:hidden'
            : 'mt-2.5 rounded-[1.2rem] border border-[#e8e4d8] bg-[#f7faf4] p-2.5 lg:hidden'
        }
        open={Boolean(filters.province || filters.minPrice || filters.maxPrice)}
      >
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Bộ lọc thêm</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            name="province"
            defaultValue={filters.province ?? ''}
            placeholder="Tỉnh/thành"
            className="min-h-11 w-full rounded-[1rem] border border-[#e8e4d8] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          <input
            name="minPrice"
            defaultValue={filters.minPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá từ"
            className="min-h-11 w-full rounded-[1rem] border border-[#e8e4d8] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          <input
            name="maxPrice"
            defaultValue={filters.maxPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá đến"
            className="min-h-11 w-full rounded-[1rem] border border-[#e8e4d8] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
        </div>
      </details>

      <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-3">
        <input
          name="province"
          defaultValue={filters.province ?? ''}
          placeholder="Tỉnh/thành"
          className="min-h-11 w-full rounded-[1rem] border border-[#e8e4d8] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
        <input
          name="minPrice"
          defaultValue={filters.minPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá từ"
          className="min-h-11 w-full rounded-[1rem] border border-[#e8e4d8] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
        <input
          name="maxPrice"
          defaultValue={filters.maxPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá đến"
          className="min-h-11 w-full rounded-[1rem] border border-[#e8e4d8] bg-white px-3 text-base outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
        />
      </div>

      <div className="mt-2.5 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <label
          className={
            demeterLike
              ? 'inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dbe7d8] bg-[#fbfcf8] px-4 text-sm font-semibold text-slate-700'
              : 'inline-flex min-h-11 items-center gap-2 rounded-[1rem] border border-[#e8e4d8] bg-[#f7faf4] px-3 text-sm font-semibold text-slate-700'
          }
        >
          <input name="hasQr" type="checkbox" value="true" defaultChecked={filters.hasQr === 'true'} className="peer sr-only" />
          <span className="relative h-5 w-5 shrink-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-leaf peer-checked:bg-leaf peer-focus-visible:ring-4 peer-focus-visible:ring-mint after:absolute after:left-[4px] after:top-[5px] after:h-2 after:w-3 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:opacity-0 after:transition peer-checked:after:opacity-100" aria-hidden="true" />
          Có QR Passport
        </label>
        <label
          className={
            demeterLike
              ? 'inline-flex min-h-11 items-center justify-between gap-2 rounded-full border border-[#dbe7d8] bg-[#fbfcf8] px-4 text-sm font-semibold text-slate-700'
              : 'inline-flex min-h-11 items-center justify-between gap-2 rounded-[1rem] border border-[#e8e4d8] bg-[#f7faf4] px-3 text-sm font-semibold text-slate-700'
          }
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <select name="sort" defaultValue={filters.sort ?? ''} className="min-h-11 bg-transparent pr-6 outline-none">
            <option value="">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </label>
        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        {filters.cooperative && <input type="hidden" name="cooperative" value={filters.cooperative} />}
        <Button className={demeterLike ? 'min-h-11 rounded-full px-5 lg:min-w-[150px]' : 'min-h-11 px-5 lg:min-w-[150px]'}>Tìm sản phẩm</Button>
        {hasActiveFilter && (
          <Link
            href="/san-pham"
            className={
              demeterLike
                ? 'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-600 hover:bg-[var(--surface-0)]'
                : 'inline-flex min-h-11 items-center justify-center rounded-[1rem] px-3 text-sm font-semibold text-slate-600 hover:bg-[var(--surface-0)]'
            }
          >
            Xóa lọc
          </Link>
        )}
      </div>
    </form>
  );
}
