import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, QrCode, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, productImage, publicListItems } from '@/components/public-marketplace';
import { PublicImage } from '@/components/public-image';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { Button } from '@/components/ui';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';
import { passportUrl } from '@/lib/domain';

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
  const isInternal = siteKey === 'htxonline';
  const [products, siteProfile] = await Promise.all([getProducts(filters), getPublicSiteProfile(siteKey)]);
  const platformName = siteProfile.appName;
  const hasActiveFilter = Boolean(filters.search || filters.category || filters.cooperative || filters.province || filters.minPrice || filters.maxPrice || filters.hasQr || filters.sort);
  const qrProducts = products.filter((product) => product.passports?.length).length;
  const provinceCount = new Set(products.map((product) => product.cooperative?.province).filter(Boolean)).size;
  const categoryHighlights = Array.from(new Set(products.map((product) => product.category?.name).filter(Boolean))).slice(0, 6) as string[];
  const categoryOptions = Array.from(
    new Map(
      products
        .map((product) => product.category)
        .filter((category): category is NonNullable<PublicProduct['category']> => Boolean(category))
        .map((category) => [category.slug, category])
    ).values()
  ).slice(0, 6);
  const displayedProducts = products;
  const featuredProduct = products[0];
  const featuredProductSlug = featuredProduct?.slug ? `/san-pham/${featuredProduct.slug}` : '/san-pham';
  const featuredProductQr = featuredProduct?.passports?.[0];
  const featuredProductQrHref = featuredProductQr ? passportUrl(`/passport/${featuredProductQr.publicSlug || featuredProductQr.passportCode}`) : null;
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
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary-strong)] sm:text-sm">Khám phá sản phẩm</p>
                  <h1 className="type-h1 mt-2 max-w-[11ch] text-[2rem] sm:max-w-none sm:text-[3.2rem]">
                    Sản phẩm công khai được trình bày để quét nhanh hơn.
                  </h1>
                </div>
                <Link
                  href="/htx"
                  className="inline-flex min-h-11 w-fit items-center gap-2 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-base font-semibold text-[var(--text-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] sm:self-auto"
                >
                  Khám phá thêm
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand-primary)] text-white">
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
                          ? 'inline-flex min-h-12 items-center rounded-full bg-[var(--brand-primary)] px-6 text-[1.02rem] font-semibold text-white shadow-[0_14px_28px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)]'
                          : 'inline-flex min-h-12 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-6 text-[1.02rem] font-semibold text-[var(--text-secondary)] shadow-sm'
                      }
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
                {featuredProduct ? (
                  <article className={`${publicCardClass} overflow-visible rounded-[2.2rem] border-[var(--border-strong)] p-4 sm:p-5`}>
                    <div className="rounded-[1.7rem] border-2 border-[var(--brand-primary)] bg-[var(--surface-elevated)] p-3 sm:p-4">
                      <div className="mx-auto inline-flex min-h-10 items-center gap-2 rounded-b-[1.2rem] rounded-t-[0.95rem] bg-[var(--brand-primary)] px-4 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)]">
                        <span>{siteProfile.appName}</span>
                        <span className="opacity-60">x</span>
                        <span>{featuredProduct.cooperative?.name || 'HTX Việt Nam'}</span>
                      </div>
                      <Link href={featuredProductSlug} className="mt-4 block overflow-hidden rounded-[1.5rem] bg-[var(--surface-muted)]">
                        <PublicImage
                          src={productImage(featuredProduct)}
                          alt={featuredProduct.name}
                          priority
                          wrapperClassName="aspect-[1/1] w-full bg-[linear-gradient(180deg,var(--surface-elevated)_0%,var(--surface-muted)_100%)] sm:aspect-[16/11]"
                          className="h-full w-full object-cover"
                        />
                      </Link>
                    </div>

                    <div className="px-2 pb-1 pt-5 text-center sm:px-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary-strong)]">
                        {featuredProduct.category?.name || 'Nông sản công khai'}
                      </p>
                      <Link
                        href={featuredProductSlug}
                        className="mt-3 block text-[1.38rem] font-extrabold leading-[1.16] tracking-[-0.03em] text-[var(--text-primary)] transition hover:text-[var(--brand-primary)] sm:text-[1.72rem]"
                      >
                        {featuredProduct.name}
                      </Link>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {featuredProduct.cooperative?.province || featuredProduct.zone?.name || `Sản phẩm đang được công khai trên ${platformName}`}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href={featuredProductSlug}
                          className="inline-flex min-h-11 items-center rounded-full bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-[0_14px_28px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)] transition hover:-translate-y-0.5"
                        >
                          Xem chi tiết
                        </Link>
                        {featuredProductQrHref ? (
                          <a
                            href={featuredProductQrHref}
                            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-sm font-bold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                          >
                            Mở QR Passport
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ) : (
                  <article className={`${publicCardClass} rounded-[2.2rem] border-[var(--border-strong)] bg-[linear-gradient(180deg,var(--surface-elevated)_0%,var(--surface-muted)_100%)] p-5 sm:p-6`}>
                    <div className="rounded-[1.8rem] border border-[var(--border-strong)] bg-[var(--surface-elevated)]/80 p-5 text-center shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary-strong)]">Khối trưng bày sản phẩm</p>
                      <h2 className="mt-3 text-[1.4rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[1.8rem]">
                        Dữ liệu nổi bật sẽ xuất hiện ở đây khi HTX công khai sản phẩm.
                      </h2>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {hasActiveFilter
                          ? `Bỏ bớt điều kiện lọc để xem lại sản phẩm đang có trên ${platformName}.`
                          : 'Khi HTX công khai sản phẩm, thông tin sẽ được cập nhật tại đây để bạn dễ dàng tìm hiểu và lựa chọn.'}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Link
                          href="/san-pham"
                          className="inline-flex min-h-11 items-center rounded-full bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-[0_14px_28px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)] transition hover:-translate-y-0.5"
                        >
                          Xem toàn bộ sản phẩm
                        </Link>
                        <Link
                          href="/htx"
                          className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-sm font-bold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        >
                          Xem danh sách HTX
                        </Link>
                      </div>
                    </div>
                  </article>
                )}

                <div className="grid gap-3">
                  <section className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-5">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary-strong)]">Quét nhanh theo ngữ cảnh</p>
                    <h2 className="mt-2 text-[1.36rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[1.7rem]">
                      Tìm nhanh sản phẩm theo nhu cầu của bạn.
                    </h2>
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {[
                        { icon: Sparkles, title: 'Hiển thị', value: String(products.length) },
                        { icon: QrCode, title: 'Có QR', value: String(qrProducts) },
                        { icon: MapPin, title: 'Địa phương', value: String(provinceCount) }
                      ].map((item) => (
                        <article key={item.title} className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-4 text-center">
                          <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                            <item.icon size={18} aria-hidden="true" />
                          </span>
                          <p className="mt-2 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary-strong)]">{item.title}</p>
                          <p className="mt-1 text-[1.2rem] font-extrabold text-[var(--text-primary)]">{item.value}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  {quickProductLinks.length > 0 ? (
                    <section className="rounded-[2rem] border border-[var(--border-strong)] bg-[linear-gradient(180deg,var(--surface-elevated)_0%,var(--surface-muted)_100%)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary-strong)]">Lướt nhanh</p>
                          <p className="mt-1 text-[1.08rem] font-extrabold text-[var(--text-primary)]">Sản phẩm nổi bật khác</p>
                        </div>
                        <Link href="/htx" className="text-sm font-semibold text-[var(--brand-primary)]">
                          Xem HTX
                        </Link>
                      </div>
                      <div className="mt-4 grid gap-2.5">
                        {quickProductLinks.map((product) => (
                          <Link
                            key={product.id}
                            href={`/san-pham/${product.slug}`}
                            className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-3 transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)]"
                          >
                            <PublicImage
                              src={productImage(product)}
                              alt={product.name}
                              wrapperClassName="h-14 w-14 shrink-0 rounded-[1rem] bg-[var(--surface-muted)]"
                              className="h-full w-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[var(--text-primary)]">{product.name}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                {product.cooperative?.province || product.category?.name || platformName}
                              </p>
                            </div>
                            <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-[var(--brand-primary)]" />
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
              eyebrow="Nền tảng Agripassport"
              title="Sản phẩm nông nghiệp"
              description="Khám phá các sản phẩm được số hóa trên Agripassport từ nông sản, sản phẩm OCOP đến các sản phẩm của hợp tác xã và doanh nghiệp. Tìm hiểu thông tin sản phẩm, đơn vị sản xuất và dữ liệu truy xuất nguồn gốc được công khai trên hệ thống."
            />

            {categoryOptions.length > 0 ? (
              <nav aria-label="Lọc nhanh theo nhóm sản phẩm" className="-mx-1 mb-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max items-center gap-2">
                  <span className="mr-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Lọc nhanh</span>
                  <Link
                    href="/san-pham"
                    aria-current={!filters.category ? 'page' : undefined}
                    className={!filters.category ? 'inline-flex min-h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-sm font-bold text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--brand-primary)_15%,transparent)]' : 'inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)]'}
                  >
                    Tất cả
                  </Link>
                  {categoryOptions.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/san-pham?category=${encodeURIComponent(category.slug)}`}
                      aria-current={filters.category === category.slug ? 'page' : undefined}
                      className={filters.category === category.slug ? 'inline-flex min-h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-sm font-bold text-white shadow-[0_10px_22px_color-mix(in_srgb,var(--brand-primary)_15%,transparent)]' : 'inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)]'}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </nav>
            ) : null}

          </>
        )}

        <ProductFilterForm filters={filters} hasActiveFilter={hasActiveFilter} demeterLike={isInternal} categoryHighlights={categoryHighlights} />

        {displayedProducts.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:auto-rows-fr sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {displayedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} compact={!isInternal} />
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
          ? 'mt-5 rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-3 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:rounded-[2.2rem] sm:p-4'
          : 'mt-4 rounded-[1.45rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:mt-5 sm:rounded-[2rem] sm:p-4'
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
                    ? 'inline-flex min-h-10 items-center rounded-full bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white'
                    : 'inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--text-secondary)]'
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
          aria-label="Tìm sản phẩm, HTX, mô tả"
          className={
            demeterLike
              ? 'min-h-12 w-full rounded-[1.2rem] border border-[var(--border-strong)] bg-[var(--surface-muted)] pl-10 pr-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]'
              : 'min-h-11 w-full rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)] sm:min-h-12'
          }
        />
      </div>

      <details
        className={
          demeterLike
            ? 'mt-2.5 rounded-[1.3rem] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-2.5 lg:hidden'
            : 'mt-2.5 rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-muted)] p-2.5 lg:hidden'
        }
        open={Boolean(filters.province || filters.minPrice || filters.maxPrice)}
      >
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">Bộ lọc thêm</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            name="province"
            defaultValue={filters.province ?? ''}
            placeholder="Tỉnh/thành"
            aria-label="Tỉnh/thành"
            className="min-h-11 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]"
          />
          <input
            name="minPrice"
            defaultValue={filters.minPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá từ"
            aria-label="Giá từ"
            className="min-h-11 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]"
          />
          <input
            name="maxPrice"
            defaultValue={filters.maxPrice ?? ''}
            inputMode="numeric"
            placeholder="Giá đến"
            aria-label="Giá đến"
            className="min-h-11 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]"
          />
        </div>
      </details>

      <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-3">
        <input
          name="province"
          defaultValue={filters.province ?? ''}
          placeholder="Tỉnh/thành"
          aria-label="Tỉnh/thành"
          className="min-h-11 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]"
        />
        <input
          name="minPrice"
          defaultValue={filters.minPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá từ"
          aria-label="Giá từ"
          className="min-h-11 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]"
        />
        <input
          name="maxPrice"
          defaultValue={filters.maxPrice ?? ''}
          inputMode="numeric"
          placeholder="Giá đến"
          aria-label="Giá đến"
          className="min-h-11 w-full rounded-[1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-base outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]"
        />
      </div>

      <div className={
        demeterLike
          ? 'mt-2.5 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3'
          : 'mt-2.5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3'
      }>
        <label
          className={
            demeterLike
              ? 'inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--text-secondary)]'
              : 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[1rem] border border-[var(--border)] bg-[var(--surface-muted)] px-2 text-sm font-semibold text-[var(--text-secondary)] sm:w-auto sm:justify-start sm:px-3'
          }
        >
          <input name="hasQr" type="checkbox" value="true" defaultChecked={filters.hasQr === 'true'} className="peer sr-only" />
          <span className="relative h-5 w-5 shrink-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-leaf peer-checked:bg-leaf peer-focus-visible:ring-4 peer-focus-visible:ring-mint after:absolute after:left-[4px] after:top-[5px] after:h-2 after:w-3 after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:opacity-0 after:transition peer-checked:after:opacity-100" aria-hidden="true" />
          Có QR Passport
        </label>
        <label
          className={
            demeterLike
              ? 'inline-flex min-h-11 items-center justify-between gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--text-secondary)]'
              : 'inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-[1rem] border border-[var(--border)] bg-[var(--surface-muted)] px-2 text-sm font-semibold text-[var(--text-secondary)] sm:w-auto sm:px-3'
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
        <Button className={demeterLike ? 'min-h-11 rounded-full px-5 lg:min-w-[150px]' : 'col-span-2 min-h-11 px-5 sm:col-span-1 lg:min-w-[150px]'}>Tìm sản phẩm</Button>
        {hasActiveFilter && (
          <Link
            href="/san-pham"
            className={
              demeterLike
                ? 'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-600 hover:bg-[var(--surface-0)]'
                : 'col-span-2 inline-flex min-h-11 items-center justify-center rounded-[1rem] px-3 text-sm font-semibold text-slate-600 hover:bg-[var(--surface-0)] sm:col-span-1'
            }
          >
            Xóa lọc
          </Link>
        )}
      </div>
    </form>
  );
}
