import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Boxes,
  Calendar,
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { HomeHeroSlider } from './home-hero-slider';
import { CooperativeCard, EmptyPublicState, NewsCard, ProductCard, PublicSearch } from './public-marketplace';
import { PublicImage } from './public-image';
import { PublicShell } from './public-shell';
import { PublicSection, publicCardClass, publicContainerClass } from './public-layout';
import { Button, cn } from './ui';
import { fetchPublicNews, normalizeNewsList, NewsArticle } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export async function PublicHomeRedesign() {
  const siteKey = await getRequestPublicSiteKey();
  const [catalog, newsRaw, canonical] = await Promise.all([
    fetchPublicCatalog(100),
    fetchPublicNews('/news/public?home=true&limit=4', siteKey),
    getRequestAbsoluteUrl('/')
  ]);

  const newsList = normalizeNewsList(newsRaw).data;

  // Featured products with active QR passports (fallback to all products)
  const qrProducts = catalog.products.filter((p) => Boolean(p.passports?.length));
  const featuredProducts = (qrProducts.length >= 4 ? qrProducts : catalog.products).slice(0, 8);
  const featuredCooperatives = catalog.cooperatives.slice(0, 6);

  // Latest news: 1 featured + 3 compact
  const featuredArticle = newsList[0];
  const sideArticles = newsList.slice(1, 4);

  const trustMetrics = [
    {
      icon: Database,
      title: 'Dữ liệu thực từ Vùng trồng',
      desc: 'Thông tin được cập nhật trực tiếp từ nhật ký sản xuất của các HTX thành viên.'
    },
    {
      icon: QrCode,
      title: '100% Hồ sơ cấp mã QR',
      desc: 'Mỗi sản phẩm hoặc lô hàng sở hữu mã định danh điện tử độc bản không thể làm giả.'
    },
    {
      icon: Calendar,
      title: 'Minh bạch Nhật ký canh tác',
      desc: 'Chi tiết từng mốc gieo giống, chăm sóc, vật tư sử dụng, thời gian cách ly và thu hoạch.'
    },
    {
      icon: ShieldCheck,
      title: 'Chuẩn hóa VietGAP & OCOP',
      desc: 'Hồ sơ pháp lý, chứng chỉ kiểm nghiệm và tiêu chuẩn chất lượng được số hóa công khai.'
    }
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'HTX số hóa vùng canh tác & nhật ký',
      desc: 'Hợp tác xã ghi nhận diện tích canh tác, giống cây trồng và nhật ký chăm sóc ngay từ đồng ruộng vào hệ thống quản trị.',
      tag: 'Khai báo tại nguồn',
      color: '#131935'
    },
    {
      step: '02',
      title: 'Thẩm định & cấp Hộ Chiếu Nông Nghiệp',
      desc: 'Dữ liệu được chuẩn hóa, đối chiếu tài liệu chứng nhận và cấp mã định danh QR Passport điện tử cho sản phẩm.',
      tag: 'Chứng thực số',
      color: '#0d7a28'
    },
    {
      step: '03',
      title: 'Người tiêu dùng quét QR kiểm chứng',
      desc: 'Chỉ với thao tác quét QR trên điện thoại, khách hàng tra cứu trọn vẹn hành trình từ nông trại đến bàn ăn.',
      tag: 'Minh bạch thị trường',
      color: '#106f8a'
    }
  ];

  const organizationId = `${canonical}#organization`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'HỘ CHIẾU NÔNG NGHIỆP',
        url: canonical,
        description: 'Nền tảng Hộ Chiếu Nông Nghiệp & Dữ liệu Nông sản Minh bạch'
      },
      {
        '@type': 'WebSite',
        '@id': `${canonical}#website`,
        name: 'HỘ CHIẾU NÔNG NGHIỆP',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />

      <main id="main-content" className="space-y-0">
        {/* =========================================================================
            1. COMMERCIAL HERO BANNER SLIDER
           ========================================================================= */}
        <HomeHeroSlider />

        {/* =========================================================================
            2. TRUST STRIP / QUICK PROOF BAR (4 CORE METRICS)
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-8 sm:py-10">
          <div className={publicContainerClass}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {trustMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 sm:p-5 transition hover:border-[#0d7a28]/30 hover:shadow-xs"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d7a28]/10 text-[#0d7a28]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[var(--text-primary)]">
                        {metric.title}
                      </h2>
                      <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                        {metric.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. CÁCH HOẠT ĐỘNG (HOW IT WORKS - 3 VISUAL STEPS)
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-14 sm:py-18">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
                <Sprout size={13} />
                <span>Quy trình vận hành</span>
              </span>
              <h2 className="type-h2 text-[var(--text-primary)]">
                Ba bước minh bạch hóa chuỗi giá trị nông sản
              </h2>
              <p className="type-body text-[var(--text-secondary)]">
                Hệ sinh thái Hộ Chiếu Nông Nghiệp kết nối liền mạch dữ liệu từ đồng ruộng của HTX đến người tiêu dùng và đối tác thương mại.
              </p>
            </div>

            <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {howItWorksSteps.map((item, idx) => (
                <div
                  key={item.step}
                  className="relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-[#0d7a28]/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-[#0d7a28]">
                        {item.step}
                      </span>
                      <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs font-semibold text-[#0d7a28]">
                    <CheckCircle2 size={14} />
                    <span>Được bảo chứng bằng công nghệ số</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. SẢN PHẨM CÓ QR NỔI BẬT (FEATURED PRODUCTS)
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-14 sm:py-18">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
                  <QrCode size={13} />
                  <span>Hồ sơ điện tử</span>
                </span>
                <h2 className="type-h2 text-[var(--text-primary)]">
                  Nông sản đã cấp Hộ Chiếu Nông Nghiệp
                </h2>
                <p className="type-body text-[var(--text-secondary)] max-w-2xl">
                  Các sản phẩm nông sản đã hoàn tất thẩm định, cấp mã QR và công khai minh bạch toàn bộ dữ liệu nguồn gốc.
                </p>
              </div>

              <Link
                href="/san-pham?hasQr=true"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28] hover:bg-[#0d7a28]/5"
              >
                <span>Xem tất cả ({catalog.products.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {featuredProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} priority={idx < 4} />
                ))}
              </div>
            ) : (
              <EmptyPublicState
                title="Chưa có nông sản công khai"
                description="Hệ thống đang đồng bộ dữ liệu từ các vùng trồng và hợp tác xã thành viên."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            5. HỆ SINH THÁI NÔNG NGHIỆP SỐ (BRAND HIERARCHY CARDS)
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-14 sm:py-18">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-2xl text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#106f8a]/20 bg-[#106f8a]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#106f8a]">
                <Layers size={13} />
                <span>Kiến trúc giải pháp</span>
              </span>
              <h2 className="type-h2 text-[var(--text-primary)]">
                Một nguồn dữ liệu — Ba tầng ứng dụng chuyên biệt
              </h2>
              <p className="type-body text-[var(--text-secondary)]">
                Phân định vai trò chuẩn xác nhằm đáp ứng nhu cầu của từng nhóm người dùng: người mua cuối, đối tác thương mại và cơ sở sản xuất HTX.
              </p>
            </div>

            <div className="mt-10 sm:mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {/* Layer 1: HỘ CHIẾU NÔNG NGHIỆP */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-[#0d7a28]/30 bg-white p-6 sm:p-8 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#0d7a28]/10 px-2.5 py-1 text-[11px] font-bold text-[#0d7a28]">
                      <QrCode size={12} />
                      CỔNG TRUY XUẤT CÔNG KHAI
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[var(--text-primary)]">
                    HỘ CHIẾU NÔNG NGHIỆP
                  </h3>
                  <p className="mt-2 text-xs font-bold text-[#0d7a28]">
                    Dành cho người tiêu dùng & đối tác bán lẻ
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Trang tra cứu nhanh bằng mã QR trên nhãn mác. Cung cấp chứng thư số, xác nhận vùng trồng, lịch sử chăm sóc và chứng chỉ an toàn thực phẩm.
                  </p>

                  <ul className="mt-5 space-y-2 text-xs text-[var(--text-secondary)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#0d7a28] shrink-0" />
                      <span>Quét tức thì, không cần tải ứng dụng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#0d7a28] shrink-0" />
                      <span>Chứng thư số chuẩn định danh nông sản</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#0d7a28] shrink-0" />
                      <span>Xem nhật ký canh tác theo timeline</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--border)]">
                  <Link
                    href="/san-pham?hasQr=true"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0d7a28] text-xs font-bold text-white shadow-xs transition hover:bg-[#0a6120]"
                  >
                    <span>Khám phá sản phẩm có QR</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Layer 2: AGRIPASSPORT */}
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#106f8a]/10 px-2.5 py-1 text-[11px] font-bold text-[#106f8a]">
                      <Database size={12} />
                      SÀN DỮ LIỆU THỊ TRƯỜNG
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[var(--text-primary)]">
                    AGRIPASSPORT
                  </h3>
                  <p className="mt-2 text-xs font-bold text-[#106f8a]">
                    Dành cho doanh nghiệp thu mua & xuất khẩu
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Sàn dữ liệu danh mục nông sản toàn diện. Kết nối cung cầu, tra cứu năng lực cung ứng của các HTX và thông tin kiểm định chất lượng hàng hóa.
                  </p>

                  <ul className="mt-5 space-y-2 text-xs text-[var(--text-secondary)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#106f8a] shrink-0" />
                      <span>Danh mục nông sản đa dạng vùng miền</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#106f8a] shrink-0" />
                      <span>Thông tin giá tham chiếu & sản lượng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#106f8a] shrink-0" />
                      <span>Kết nối trực tiếp tới lãnh đạo HTX</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--border)]">
                  <Link
                    href="/san-pham"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white text-xs font-bold text-[var(--text-primary)] transition hover:border-[#106f8a] hover:text-[#106f8a]"
                  >
                    <span>Xem danh mục nông sản</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Layer 3: HTXONLINE */}
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#131935]/10 px-2.5 py-1 text-[11px] font-bold text-[#131935]">
                      <Store size={12} />
                      QUẢN TRỊ NỘI BỘ HTX
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-extrabold text-[var(--text-primary)]">
                    HTXONLINE
                  </h3>
                  <p className="mt-2 text-xs font-bold text-[#131935]">
                    Dành cho Ban quản trị HTX & Xã viên
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Nền tảng nghiệp vụ vận hành khép kín: quản lý xã viên, bản đồ số vùng canh tác, ghi chép nhật ký phân bón/thuốc BVTV và điều hành vụ mùa.
                  </p>

                  <ul className="mt-5 space-y-2 text-xs text-[var(--text-secondary)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#131935] shrink-0" />
                      <span>Số hóa hồ sơ thành viên & ruộng đất</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#131935] shrink-0" />
                      <span>Ghi chép mùa vụ và dự báo sản lượng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#131935] shrink-0" />
                      <span>Đồng bộ tự động ra Hộ Chiếu Nông Nghiệp</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--border)]">
                  <Link
                    href="/login"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white text-xs font-bold text-[var(--text-primary)] transition hover:border-[#131935] hover:text-[#131935]"
                  >
                    <span>Cổng đăng nhập HTX</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. ĐỐI TÁC & HỢP TÁC XÃ TIÊU BIỂU
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-14 sm:py-18">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
                  <Store size={13} />
                  <span>Mạng lưới sản xuất</span>
                </span>
                <h2 className="type-h2 text-[var(--text-primary)]">
                  Hợp tác xã & Vùng trồng tiêu biểu
                </h2>
                <p className="type-body text-[var(--text-secondary)] max-w-2xl">
                  Mạng lưới các đơn vị sản xuất uy tín đã hoàn thành chuẩn hóa dữ liệu và số hóa chuỗi canh tác.
                </p>
              </div>

              <Link
                href="/htx"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28] hover:bg-[#0d7a28]/5"
              >
                <span>Xem tất cả ({catalog.cooperatives.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {featuredCooperatives.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {featuredCooperatives.map((coop, idx) => (
                  <CooperativeCard key={coop.id} cooperative={coop} priority={idx < 3} />
                ))}
              </div>
            ) : (
              <EmptyPublicState
                title="Chưa có thông tin hợp tác xã"
                description="Dữ liệu danh bạ HTX đang được cập nhật."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            7. CTA BANNER: DÀNH CHO HỢP TÁC XÃ & DOANH NGHIỆP SẢN XUẤT
           ========================================================================= */}
        <section className="bg-[var(--surface-muted)] py-12 sm:py-16">
          <div className={publicContainerClass}>
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#062c22_0%,#0d7a28_60%,#106f8a_100%)] p-8 sm:p-12 lg:p-16 text-white shadow-xl">
              {/* Background decorative circles */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[28px] border-white/10" />
              <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-white/5 blur-2xl" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#d6f3c7]">
                  <Sparkles size={14} />
                  <span>Dành cho Hợp tác xã & Đơn vị sản xuất</span>
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Nâng tầm giá trị nông sản bằng Hộ Chiếu Nông Nghiệp Số
                </h2>

                <p className="text-sm sm:text-base leading-relaxed text-white/85">
                  Đăng ký tham gia nền tảng để được hỗ trợ số hóa hồ sơ vùng canh tác, chuẩn hóa quy trình VietGAP/OCOP và cấp tem mã QR truy xuất nguồn gốc chính hãng.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-4">
                  <Link
                    href="/lien-he"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#062c22] shadow-md transition hover:bg-[#d6f3c7] active:scale-95"
                  >
                    <span>Đăng ký Cấp Hộ Chiếu</span>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/ve-chung-toi"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                  >
                    <span>Tìm hiểu thêm về nền tảng</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. TIN TỨC & KIẾN THỨC NÔNG NGHIỆP SỐ
           ========================================================================= */}
        {newsList.length > 0 && (
          <section className="border-t border-[var(--border)] bg-white py-14 sm:py-18">
            <div className={publicContainerClass}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
                    <Sparkles size={13} />
                    <span>Kiến thức & Xu hướng</span>
                  </span>
                  <h2 className="type-h2 text-[var(--text-primary)]">
                    Tin tức chuyển đổi số nông nghiệp
                  </h2>
                  <p className="type-body text-[var(--text-secondary)] max-w-2xl">
                    Cập nhật các mô hình ứng dụng công nghệ, tiêu chuẩn truy xuất và kinh nghiệm phát triển chuỗi nông sản bền vững.
                  </p>
                </div>

                <Link
                  href="/tin-tuc"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28] hover:bg-[#0d7a28]/5"
                >
                  <span>Xem tất cả tin tức</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Left: Featured Large Article (7 cols) */}
                {featuredArticle && (
                  <article className="lg:col-span-7 group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xs transition hover:border-[#0d7a28]/40 hover:shadow-md">
                    <div>
                      <Link href={`/tin-tuc/${featuredArticle.slug}`} className="block overflow-hidden rounded-xl bg-[var(--surface-muted)] aspect-[16/9] w-full">
                        <PublicImage
                          src={featuredArticle.coverImageUrl}
                          alt={featuredArticle.title}
                          fallback="/news/field-qr.webp"
                          wrapperClassName="h-full w-full"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </Link>

                      <div className="mt-5 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        <span className="rounded-md bg-[#0d7a28]/10 px-2.5 py-1 text-[11px] font-bold text-[#0d7a28]">
                          Tiêu điểm
                        </span>
                        <span>•</span>
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      </div>

                      <Link href={`/tin-tuc/${featuredArticle.slug}`}>
                        <h3 className="mt-3 text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[#0d7a28] transition line-clamp-2">
                          {featuredArticle.title}
                        </h3>
                      </Link>

                      <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border)]">
                      <Link
                        href={`/tin-tuc/${featuredArticle.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d7a28] group-hover:underline"
                      >
                        <span>Đọc toàn bộ bài viết</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                )}

                {/* Right: 3 Compact Side Articles (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
                  {sideArticles.map((article) => (
                    <article
                      key={article.id}
                      className="group flex gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-xs transition hover:border-[#0d7a28]/40 hover:shadow-xs"
                    >
                      <Link
                        href={`/tin-tuc/${article.slug}`}
                        className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]"
                      >
                        <PublicImage
                          src={article.coverImageUrl}
                          alt={article.title}
                          fallback="/news/field-qr.webp"
                          wrapperClassName="h-full w-full"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </Link>

                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
                            {formatDate(article.publishedAt)}
                          </span>
                          <Link href={`/tin-tuc/${article.slug}`}>
                            <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[#0d7a28] transition line-clamp-2">
                              {article.title}
                            </h4>
                          </Link>
                        </div>

                        <Link
                          href={`/tin-tuc/${article.slug}`}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#0d7a28]"
                        >
                          <span>Xem chi tiết</span>
                          <ArrowRight size={11} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicShell>
  );
}