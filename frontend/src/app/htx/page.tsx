import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Building2, MapPin, Search, ShieldCheck, Sparkles, Store, X } from 'lucide-react';
import { CooperativeCard, EmptyPublicState, PublicSearch } from '@/components/public-marketplace';
import { PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Danh bạ Hợp tác xã Nông nghiệp',
    description: 'Khám phá các hợp tác xã nông nghiệp đang công khai thông tin sản phẩm, vùng hoạt động và dữ liệu liên quan trên hệ thống.',
    path: '/htx',
    openGraphTitle: 'Danh bạ Hợp tác xã - AGRIPASSPORT',
    openGraphDescription: 'Danh bạ các hợp tác xã đang công khai thông tin sản xuất và dữ liệu liên quan.'
  });
}

type CooperativesPageProps = {
  searchParams?: Promise<{ search?: string; province?: string }>;
};

export default async function CooperativesPublicPage({ searchParams }: CooperativesPageProps) {
  const filters = (await searchParams) ?? {};
  const siteKey = await getRequestPublicSiteKey();
  const [catalog, siteProfile] = await Promise.all([fetchPublicCatalog(100), getPublicSiteProfile(siteKey)]);

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

  return (
    <PublicShell>
      <PublicPageMain className="py-8 sm:py-12">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6 mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#131935]">
                <Store size={14} />
                <span>Danh bạ hợp tác xã</span>
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Danh bạ Đơn vị Sản xuất & Hợp tác xã
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Khám phá các hồ sơ hợp tác xã đang công khai sản phẩm, vùng hoạt động và thông tin liên quan trên Agripassport.
              </p>
            </div>

            {/* Trust Metrics Pill Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 font-semibold text-[var(--text-primary)] shadow-sm">
                <strong className="text-[#131935] font-bold">{catalog.cooperatives.length}</strong> Hợp tác xã
              </span>
              <span className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 font-semibold text-[var(--text-primary)] shadow-sm">
                <strong className="text-[#106f8a] font-bold">{provinceCount}</strong> Tỉnh thành
              </span>
              <span className="rounded-lg border border-[#0d7a28]/30 bg-[#0d7a28]/10 px-3 py-1.5 font-semibold text-[#0d7a28]">
                <strong className="font-bold">{totalProducts}</strong> Sản phẩm công khai
              </span>
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
                  className={`inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-bold transition ${
                    !provinceFilter
                      ? 'bg-[#131935] text-white shadow-sm'
                      : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#131935] hover:text-[#131935]'
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
                      className={`inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#131935] text-white shadow-sm'
                          : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#131935] hover:text-[#131935]'
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
        <div className="mb-8">
          <form
            action="/htx"
            method="GET"
            className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-white p-1.5 sm:p-2 shadow-sm transition hover:border-[#131935]/40 focus-within:border-[#131935] focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#131935]/15"
          >
            <div className="flex flex-1 items-center min-w-0 pl-2.5 sm:pl-3">
              <Search
                size={18}
                className="shrink-0 text-slate-400 group-focus-within:text-[#131935] transition-colors"
                aria-hidden="true"
              />
              <input
                type="search"
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder="Tìm HTX theo tên gọi, mã định danh hoặc địa phương..."
                aria-label="Tìm kiếm hợp tác xã"
                className="h-10 sm:h-11 w-full min-w-0 bg-transparent px-2.5 text-sm text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:outline-none focus:ring-0 sm:text-base"
              />
            </div>
            {filters.province && <input type="hidden" name="province" value={filters.province} />}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="inline-flex h-9 sm:h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-[#131935] px-5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#1f284f] active:scale-[0.98]"
              >
                Tìm kiếm HTX
              </button>
              {hasActiveFilter && (
                <Link
                  href="/htx"
                  className="inline-flex h-9 sm:h-10 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3.5 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-slate-100 shrink-0"
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCooperatives.map((cooperative, index) => (
              <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 6} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-white p-8 sm:p-12 text-center shadow-xs">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[#131935]" aria-hidden="true">
              <Store size={22} />
            </span>
            <h2 className="mt-3 text-base sm:text-lg font-bold text-[var(--text-primary)]">Không tìm thấy hợp tác xã phù hợp</h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-md mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc tỉnh thành để xem toàn bộ danh bạ.
            </p>
            <div className="mt-5">
              <Link
                href="/htx"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#131935] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1f284f]"
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
