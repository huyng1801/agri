import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Database,
  FileCheck2,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { CooperativeCard, EmptyPublicState, NewsCard, ProductCard, PublicSearch } from '@/components/public-marketplace';
import { PublicImage } from '@/components/public-image';
import { PublicEcosystemShowcase } from '@/components/public-ecosystem-showcase';
import { PublicStructuredData, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getRequestAbsoluteUrl } from '@/lib/request-site';

export async function AgripassportHome() {
  const [catalog, news, canonical] = await Promise.all([
    fetchPublicCatalog(100),
    fetchPublicNews('/news/public?home=true&limit=3'),
    getRequestAbsoluteUrl('/')
  ]);

  const featuredProducts = catalog.products.slice(0, 8);
  const cooperatives = catalog.cooperatives.slice(0, 6);
  const qrProductCount = catalog.products.filter((product) => product.passports?.length).length;

  // Extract unique provinces for live metrics
  const uniqueProvinces = Array.from(
    new Set(
      catalog.cooperatives
        .map((c) => c.province)
        .filter((p): p is string => Boolean(p && p.trim()))
    )
  );
  const provinceCountDisplay = uniqueProvinces.length > 0 ? uniqueProvinces.length.toLocaleString('vi-VN') : '—';

  const pipelineSteps = [
    {
      num: '01',
      title: 'Thu thập & Khai báo tại nguồn',
      platform: 'HỢP TÁC XÃ',
      platformColor: '#131935',
      desc: 'Hợp tác xã số hóa hồ sơ xã viên, diện tích vùng trồng, mùa vụ và nhật ký canh tác thực tế ngay trên đồng ruộng.'
    },
    {
      num: '02',
      title: 'Chuẩn hóa dữ liệu',
      platform: 'AGRIPASSPORT',
      platformColor: '#106f8a',
      desc: 'Hệ thống chuẩn hóa thông số sản phẩm, quy cách đóng gói và thông tin chứng nhận khi có trong hồ sơ.'
    },
    {
      num: '03',
      title: 'Cấp mã định danh QR Passport',
      platform: 'HỘ CHIẾU NÔNG NGHIỆP',
      platformColor: '#0d7a28',
      desc: 'Mỗi sản phẩm hoặc lô hàng có thể gắn mã QR để người dùng mở thông tin truy xuất được công khai theo hồ sơ.'
    },
    {
      num: '04',
      title: 'Minh bạch & Kết nối thị trường',
      platform: 'HỆ SINH THÁI MỞ',
      platformColor: '#106f8a',
      desc: 'Người tiêu dùng, doanh nghiệp bán lẻ và đối tác xuất khẩu tra cứu trực tiếp thông tin minh bạch chỉ với một thao tác quét.'
    }
  ];

  const organizationId = `${canonical}#organization`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'AGRIPASSPORT',
        url: canonical,
        email: 'Agripassport@gmail.com',
        telephone: '+84907001200'
      },
      {
        '@type': 'WebSite',
        '@id': `${canonical}#website`,
        name: 'AGRIPASSPORT',
        url: canonical,
        publisher: { '@id': organizationId },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${canonical}san-pham?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <PublicShell>
      <PublicStructuredData data={structuredData} />
      <main id="main-content" className="bg-[var(--surface-1)]">
        {/* =========================================================================
            SECTION 1: INDUSTRIAL DATA HERO (Asymmetric Split 60 / 40)
           ========================================================================= */}
        <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-subtle)] via-white to-white py-12 sm:py-16 lg:py-20">
          {/* Subtle Grid Background Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(#106f8a 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
            aria-hidden="true"
          />

          <div className={cn(publicContainerClass, 'relative')}>
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Left Column (60%): Institutional Copy, Search & Primary Actions */}
              <div className="lg:col-span-7">
                {/* Institutional Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/25 bg-[var(--brand-primary-subtle)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                  <span className="tracking-wide uppercase text-[11px] font-bold">
                    Dữ liệu nông nghiệp công khai
                  </span>
                </div>

                {/* H1 Heading */}
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                  Agripassport số hóa nông sản, minh bạch hành trình bằng QR
                </h1>

                {/* Subtitle */}
                <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-[var(--brand-primary-strong)] sm:text-base sm:leading-8">
                  Kết nối dữ liệu từ sản xuất đến sản phẩm, giúp hợp tác xã quản lý hiệu quả và người tiêu dùng dễ dàng kiểm chứng thông tin.
                </p>

                {/* Unified Single-Surface Search Bar */}
                <div className="mt-6 max-w-2xl">
                  <PublicSearch
                    placeholder="Nhập tên nông sản, hợp tác xã, mã vùng trồng hoặc mã QR..."
                    className="w-full"
                  />
                </div>

                {/* Primary Action Row */}
                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/san-pham"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#106f8a] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d596e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#106f8a] focus-visible:ring-offset-2 sm:w-auto"
                  >
                    <span>Khám phá danh mục nông sản</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/htx"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] sm:w-auto"
                  >
                    <Store size={16} aria-hidden="true" />
                    <span>Hợp tác xã công khai</span>
                  </Link>
                </div>
              </div>

              {/* Right Column (40%): Live Traceability Pipeline Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-lg sm:p-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d7a28]/10 text-[#0d7a28]">
                        <ShieldCheck size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">
                          Chứng nhận số & Truy xuất
                        </h2>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          Luồng dữ liệu chuỗi cung ứng minh bạch
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0d7a28]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0d7a28] border border-[#0d7a28]/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0d7a28]" />
                      Dữ liệu công khai
                    </span>
                  </div>

                  {/* Flow Steps */}
                  <div className="mt-4 space-y-3.5">
                    {/* Item 1: Cooperative */}
                    <div className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#131935] text-white text-xs font-bold">
                        1
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                            Đơn vị sản xuất
                          </span>
                          <span className="font-mono text-[11px] text-[#131935] font-semibold">
                            HỒ SƠ HỢP TÁC XÃ
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 truncate">
                          Thông tin đơn vị sản xuất
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          Thông tin được cung cấp theo hồ sơ công khai
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Production Zone */}
                    <div className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#106f8a] text-white text-xs font-bold">
                        2
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                            Vùng trồng & Giám sát
                          </span>
                          <span className="font-mono text-[11px] text-[#106f8a] font-semibold">
                            VN-71-342-01
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                          Vùng sản xuất
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          Thông tin vùng trồng và mùa vụ khi có trong hồ sơ
                        </p>
                      </div>
                    </div>

                    {/* Item 3: Digital Passport */}
                    <div className="flex items-start gap-3 rounded-lg border border-[#0d7a28]/30 bg-[#0d7a28]/5 p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0d7a28] text-white text-xs font-bold">
                        3
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0d7a28]">
                            Mã QR Hộ Chiếu Nông Nghiệp
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#0d7a28]">
                            <QrCode size={12} /> HỒ SƠ TRUY XUẤT
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                          Sản phẩm và mã QR
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Thông tin truy xuất được công khai theo từng hồ sơ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer info */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-tertiary)]">Cơ chế bảo mật</span>
                    <span className="font-semibold text-[var(--text-primary)] inline-flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-[#0d7a28]" />
                      Hiển thị theo dữ liệu hồ sơ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: PLATFORM LIVE TRUST METRICS (4-Column Data Strip)
           ========================================================================= */}
        <section aria-label="Số liệu hoạt động thực tế" className="border-b border-[var(--border)] bg-white">
          <div className={cn(publicContainerClass, 'py-6 sm:py-8')}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:divide-x lg:divide-[var(--border)]">
              {/* Stat 1: Total Products */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:px-6 first:pl-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#106f8a]/10 text-[#106f8a]">
                  <Boxes size={24} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {catalog.totalProducts.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    Sản phẩm chuẩn hóa
                  </p>
                </div>
              </div>

              {/* Stat 2: Cooperatives */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:px-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#131935]/10 text-[#131935]">
                  <Store size={24} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {catalog.cooperatives.length}
                  </p>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    Hợp tác xã công khai
                  </p>
                </div>
              </div>

              {/* Stat 3: QR Passports */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:px-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d7a28]/10 text-[#0d7a28]">
                  <QrCode size={24} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {qrProductCount}
                  </p>
                  <p className="text-[0.68rem] font-semibold uppercase leading-5 tracking-wide text-[var(--text-secondary)] sm:text-xs">
                    Sản phẩm có QR Passport
                  </p>
                </div>
              </div>

              {/* Stat 4: Provinces */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:px-6 last:pr-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <MapPin size={24} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {provinceCountDisplay}
                  </p>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    Độ phủ dữ liệu thực địa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: PRODUCT DISCOVERY GRID (4-Column Enterprise Catalog)
           ========================================================================= */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className={publicContainerClass}>
            {/* Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border)] pb-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#106f8a]">
                  <Boxes size={14} />
                  <span>Danh mục Dữ liệu Công khai</span>
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Nông sản hợp tác xã tiêu biểu
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-2xl">
                  Mỗi sản phẩm hiển thị những thông tin được đơn vị công khai, cùng lối dẫn tới hồ sơ liên quan khi có.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/san-pham?hasQr=true"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#0d7a28]/30 bg-[#0d7a28]/10 px-3.5 text-xs font-bold text-[#0d7a28] transition hover:bg-[#0d7a28] hover:text-white"
                >
                  <QrCode size={13} aria-hidden="true" />
                  <span>Chỉ xem có QR Passport</span>
                </Link>
                <Link
                  href="/san-pham"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#106f8a] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d596e]"
                >
                  <span>Xem tất cả ({catalog.totalProducts})</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* 4-Column Product Grid */}
            {featuredProducts.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>
            ) : (
              <EmptyPublicState
                icon={Boxes}
                title="Chưa có sản phẩm công khai"
                description="Danh mục sản phẩm sẽ hiển thị tại đây khi có hồ sơ đủ thông tin công khai."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: VERIFIED COOPERATIVE DIRECTORY
           ========================================================================= */}
        <section className="border-t border-[var(--border)] bg-[var(--surface-subtle)] py-12 sm:py-16 lg:py-20">
          <div className={publicContainerClass}>
            {/* Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border)] pb-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#131935]">
                  <Store size={14} />
                  <span>Danh bạ Đơn vị Sản xuất</span>
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Danh bạ hợp tác xã
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-2xl">
                  Khám phá các hồ sơ hợp tác xã đang công khai thông tin sản phẩm, vùng hoạt động và dữ liệu liên quan.
                </p>
              </div>

              <Link
                href="/htx"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] shadow-sm transition hover:border-[#106f8a] hover:text-[#106f8a]"
              >
                <span>Xem toàn bộ HTX ({catalog.cooperatives.length})</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            {/* 3-Column Cooperatives Grid */}
            {cooperatives.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cooperatives.map((coop, index) => (
                  <CooperativeCard key={coop.id} cooperative={coop} priority={index < 3} />
                ))}
              </div>
            ) : (
              <EmptyPublicState
                icon={Store}
                title="Chưa có hợp tác xã công khai"
                description="Hồ sơ hợp tác xã sẽ xuất hiện tại đây khi có thông tin đủ điều kiện công khai."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: DATA INTEGRITY PIPELINE (4-Step Architectural Flow)
           ========================================================================= */}
        <section className="border-t border-[var(--border)] bg-white py-12 sm:py-16 lg:py-20">
          <div className={publicContainerClass}>
            <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                <CheckCircle2 size={13} className="text-[#106f8a]" />
                <span className="uppercase tracking-wider text-[11px] font-bold">Chu trình Khép kín</span>
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Quy trình chuẩn hóa & Bảo toàn dữ liệu
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
                Dữ liệu không tự sinh ra mà được đối chiếu từ canh tác thực tế của từng xã viên đến chứng thư điện tử.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pipelineSteps.map((step) => (
                <div
                  key={step.num}
                  className="relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-6 transition duration-200 hover:border-[var(--brand-primary)] hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-[var(--text-tertiary)]">
                      {step.num}
                    </span>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: step.platformColor }}
                    >
                      {step.platform}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: THREE-PILLAR ECOSYSTEM SHOWCASE
           ========================================================================= */}
        <section className="border-t border-[var(--border)] bg-[var(--surface-subtle)] py-12 sm:py-16 lg:py-20">
          <div className={publicContainerClass}>
            <PublicEcosystemShowcase siteKey="agripassport" showHeading={true} />
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: OPERATIONAL NEWS & EDITORIAL INSIGHTS
           ========================================================================= */}
        <section className="border-t border-[var(--border)] bg-white py-12 sm:py-16 lg:py-20">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--border)] pb-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#106f8a]">
                  <TrendingUp size={14} />
                  <span>Bản tin Chuyển đổi số</span>
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Tin tức vận hành nông nghiệp
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Cập nhật các mô hình hợp tác xã tiêu biểu, tiêu chuẩn thị trường và hướng dẫn ứng dụng công nghệ thực tế.
                </p>
              </div>

              <Link
                href="/tin-tuc"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] shadow-sm transition hover:border-[#106f8a] hover:text-[#106f8a]"
              >
                <span>Xem tất cả tin tức</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            {news.data.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {news.data.slice(0, 3).map((article, index) => (
                  <NewsCard key={article.id} article={article} priority={index === 0} />
                ))}
              </div>
            ) : (
              <EmptyPublicState
                icon={FileCheck2}
                title="Chưa có tin tức công khai"
                description="Các bài viết hướng dẫn và tin tức vận hành nông nghiệp sẽ xuất hiện tại đây."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: INSTITUTIONAL ONBOARDING ACTION SURFACE
           ========================================================================= */}
        <section className="border-t border-[var(--border)] bg-gradient-to-r from-[#131935] via-[#106f8a] to-[#0d7a28] py-14 text-white sm:py-16">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white/90">
                <Sparkles size={13} /> Dành cho Hợp tác xã & Doanh nghiệp
              </span>

              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                <span className="block">Đưa hợp tác xã & nông sản của bạn lên bản đồ</span>
                <span className="block">nông nghiệp số</span>
              </h2>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/80 max-w-2xl mx-auto">
                Không cần thay đổi toàn bộ quy trình cùng lúc. Đội ngũ chuyên gia Agripassport sẽ đồng hành cùng hợp tác xã
                khảo sát thực địa, số hóa hồ sơ xã viên và cấp mã QR Passport đạt chuẩn theo từng giai đoạn.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="font-mono text-xs font-bold text-white/60">BƯỚC 01</span>
                  <p className="font-bold text-sm text-white mt-1">Khảo sát & Chuẩn hóa</p>
                  <p className="text-xs text-white/70 mt-1">Xác lập danh bạ thành viên và định vị tọa độ vùng trồng.</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="font-mono text-xs font-bold text-white/60">BƯỚC 02</span>
                  <p className="font-bold text-sm text-white mt-1">Số hóa & Cấp mã QR</p>
                  <p className="text-xs text-white/70 mt-1">Tạo hồ sơ số chứng minh nguồn gốc và in ấn tem truy xuất.</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="font-mono text-xs font-bold text-white/60">BƯỚC 03</span>
                  <p className="font-bold text-sm text-white mt-1">Mở kênh kết nối</p>
                  <p className="text-xs text-white/70 mt-1">Tiếp cận chuỗi bán lẻ, siêu thị và đối tác xuất khẩu.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/lien-he"
                  className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-[#106f8a] shadow-sm transition hover:bg-slate-100"
                >
                  <span>Liên hệ đội ngũ triển khai</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="/ve-chung-toi"
                  className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <span>Tìm hiểu tiêu chuẩn dữ liệu</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
