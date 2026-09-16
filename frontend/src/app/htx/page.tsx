import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search, Store, X } from 'lucide-react';
import { CooperativeCard } from '@/components/public-marketplace';
import { PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { PublicPagination } from '@/components/public-pagination';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';
  return buildPublicMetadata({
    title: `Danh bạ Hợp tác xã Nông nghiệp - ${siteName}`,
    description: `Khám phá các hợp tác xã nông nghiệp đang công khai thông tin sản phẩm, vùng hoạt động và dữ liệu liên quan trên ${siteName}.`,
    path: '/htx',
    openGraphTitle: `Danh bạ Hợp tác xã - ${siteName}`,
    openGraphDescription: `Danh bạ các hợp tác xã đang công khai thông tin sản xuất và dữ liệu liên quan trên ${siteName}.`
  });
}

type CooperativesPageProps = {
  searchParams?: Promise<{ search?: string; province?: string; page?: string }>;
};

const COOPERATIVES_PAGE_SIZE = 12;

function buildPageUrl(filters: { search?: string; province?: string; page?: string }, newPage: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.province) params.set('province', filters.province);
  if (newPage > 1) params.set('page', String(newPage));
  const query = params.toString();
  return query ? `/htx?${query}` : '/htx';
}

export default async function CooperativesPublicPage({ searchParams }: CooperativesPageProps) {
  const filters = (await searchParams) ?? {};
  const siteKey = await getRequestPublicSiteKey();
  const catalog = await fetchPublicCatalog(100);
  const isPassport = siteKey === 'passport';
  const accentButtonClass = isPassport
    ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]'
    : 'bg-[#131935] hover:bg-[#1f284f]';
  const accentTextClass = isPassport ? 'text-[var(--brand-primary)]' : 'text-[#131935]';
  const accentBorderClass = isPassport ? 'hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]' : 'hover:border-[#131935] hover:text-[#131935]';
  const requestedPage = Math.max(1, parseInt(filters.page || '1', 10));

  const search = filters.search?.trim().toLowerCase();
  const provinceFilter = filters.province?.trim().toLowerCase();

  const filteredCooperatives = catalog.cooperatives.filter((coop) => {
    const matchesSearch = search
      ? [coop.name, coop.code, coop.province ?? ''].some((val) => val.toLowerCase().includes(search))
      : true;
    const matchesProvince = provinceFilter
      ? (coop.province ?? '').toLowerCase().includes(provinceFilter)
      : true;
    return matchesSearch && matchesProvince;
  });

  // Extract unique provinces for filter bar
  const uniqueProvinces = Array.from(
    new Set(
      catalog.cooperatives
        .map((c) => c.province)
        .filter((p): p is string => Boolean(p && p.trim()))
    )
  ).sort((a, b) => a.localeCompare(b, 'vi'));

  const provinceCount = uniqueProvinces.length;
  const totalProducts = catalog.cooperatives.reduce((sum, c) => sum + c.productCount, 0);

  const hasActiveFilter = Boolean(search || provinceFilter);
  const totalPages = Math.max(1, Math.ceil(filteredCooperatives.length / COOPERATIVES_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleCooperatives = filteredCooperatives.slice(
    (currentPage - 1) * COOPERATIVES_PAGE_SIZE,
    currentPage * COOPERATIVES_PAGE_SIZE
  );

  return (
    <PublicShell>
      <PublicPageMain className="public-cooperative-directory py-8 sm:py-12">
        {/* Page Header */}
        <div className="public-directory-heading border-b border-[var(--border)] pb-6 mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className={`text-sm font-semibold ${accentTextClass}`}>Danh bạ hợp tác xã</p>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Danh bạ Đơn vị Sản xuất & Hợp tác xã
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base lg:max-w-none lg:whitespace-nowrap lg:text-[0.8125rem] xl:text-sm">
                Khám phá các hồ sơ hợp tác xã đang công khai sản phẩm, vùng hoạt động và thông tin liên quan trên {isPassport ? 'Hộ chiếu nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport'}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
              <span><strong className="font-bold text-[var(--text-primary)]">{catalog.cooperatives.length}</strong> hợp tác xã</span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">/</span>
              <span><strong className="font-bold text-[var(--text-primary)]">{provinceCount}</strong> tỉnh thành</span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">/</span>
              <span><strong className="font-bold text-[#0d7a28]">{totalProducts}</strong> sản phẩm công khai</span>
            </div>
          </div>

          {/* Quick Province Filter Chips */}
          {uniqueProvinces.length > 0 && (
            <div className="mt-6 -mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mr-1">
                  Địa phương:
                </span>
                <Link
                  href="/htx"
                    className={`inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    !provinceFilter
                      ? `${accentButtonClass} text-white shadow-sm`
                      : `border border-[var(--border)] bg-white text-[var(--text-secondary)] ${accentBorderClass}`
                  }`}
                >
                  Tất cả tỉnh thành
                </Link>
                {uniqueProvinces.map((prov) => {
                  const isActive = provinceFilter === prov.toLowerCase();
                  return (
                    <Link
                      key={prov}
                      href={`/htx?province=${encodeURIComponent(prov)}`}
                      className={`inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                        isActive
                          ? `${accentButtonClass} text-white shadow-sm`
                          : `border border-[var(--border)] bg-white text-[var(--text-secondary)] ${accentBorderClass}`
                      }`}
                    >
                      {prov}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Directory Search Bar */}
        <div className="public-directory-filter mb-8">
          <form
            action="/htx"
            method="GET"
            className={`group flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 border-y border-[var(--border)] py-2 transition ${isPassport ? 'hover:border-[var(--brand-primary)]/40 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/15' : 'hover:border-[#131935]/40 focus-within:border-[#131935] focus-within:ring-2 focus-within:ring-[#131935]/15'}`}
          >
            <div className="flex flex-1 items-center min-w-0 pl-2.5 sm:pl-3">
              <Search
                size={18}
                className={`shrink-0 text-slate-400 transition-colors ${isPassport ? 'group-focus-within:text-[var(--brand-primary)]' : 'group-focus-within:text-[#131935]'}`}
                aria-hidden="true"
              />
              <input
                type="search"
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder="Tìm HTX theo tên gọi, mã định danh hoặc địa phương…"
                aria-label="Tìm kiếm hợp tác xã"
                className="min-h-11 w-full min-w-0 bg-transparent px-2.5 text-sm text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:outline-none focus:ring-0 sm:text-base"
              />
            </div>
            {filters.province && <input type="hidden" name="province" value={filters.province} />}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className={`inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-lg px-5 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-[0.98] ${accentButtonClass}`}
              >
                Tìm kiếm HTX
              </button>
              {hasActiveFilter && (
                <Link
                  href="/htx"
                  className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3.5 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-slate-100 shrink-0"
                >
                  <X size={15} />
                  <span>Xóa</span>
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* 3-Column Cooperative Grid */}
        {filteredCooperatives.length ? (
            <div className="space-y-10">
              <div className="public-directory-grid grid grid-cols-1 gap-x-10 md:grid-cols-2">
              {visibleCooperatives.map((cooperative, index) => (
              <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 6} siteKey={siteKey} variant="directory" />
              ))}
              </div>
              <PublicPagination
                currentPage={currentPage}
                totalPages={totalPages}
                hrefForPage={(page) => buildPageUrl(filters, page)}
                ariaLabel="Phân trang danh bạ hợp tác xã"
                accentClassName={isPassport ? 'bg-[var(--brand-primary)]' : 'bg-[#131935]'}
                hoverClassName={isPassport ? 'hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]' : 'hover:border-[#131935] hover:text-[#131935]'}
              />
              <div className="public-directory-callout flex flex-col gap-4 rounded-[var(--public-radius-card)] border border-[var(--brand-primary)]/20 bg-[var(--brand-primary-subtle)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.1em] text-[var(--brand-primary)]">Tìm đúng đối tác</p>
                  <h2 className="mt-2 text-lg font-extrabold text-[var(--text-primary)]">Xem sản phẩm và hành trình truy xuất theo từng HTX.</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Mỗi hồ sơ công khai là một điểm bắt đầu để kiểm chứng dữ liệu và kết nối trực tiếp.</p>
                </div>
                <Link href="/san-pham" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)]">Xem danh mục <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-white p-8 sm:p-12 text-center shadow-xs">
              <span className={`mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] ${accentTextClass}`} aria-hidden="true">
              <Store size={22} />
            </span>
            <h2 className="mt-3 text-base sm:text-lg font-bold text-[var(--text-primary)]">Không tìm thấy hợp tác xã phù hợp</h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-md mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc tỉnh thành để xem toàn bộ danh bạ.
            </p>
            <div className="mt-5">
              <Link
                href="/htx"
                className={`inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 text-xs font-bold text-white shadow-sm transition ${accentButtonClass}`}
              >
                Xem toàn bộ danh bạ HTX
              </Link>
            </div>
          </div>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
