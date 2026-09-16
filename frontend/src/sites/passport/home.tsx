import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Leaf,
  MapPinned,
  QrCode,
  ShieldCheck,
  Sprout,
  Store
} from 'lucide-react';
import { PassportHomeHero } from '@/components/passport-home-hero';
import { CooperativeCard, EmptyPublicState, NewsCard, ProductCard } from '@/components/public-marketplace';
import { PublicShell } from '@/components/public-shell';
import { publicContainerClass } from '@/components/public-layout';
import { fetchPublicNews, normalizeNewsList } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getRequestAbsoluteUrl } from '@/lib/request-site';

export async function PassportHome() {
  const siteKey = 'passport' as const;
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

  const passportProofs = [
    {
      icon: MapPinned,
      title: 'Vùng trồng rõ ràng',
      desc: 'Biết sản phẩm đến từ vùng nào và hợp tác xã nào đang chịu trách nhiệm.'
    },
    {
      icon: CalendarDays,
      title: 'Nhật ký theo thời gian',
      desc: 'Theo dõi những mốc chăm sóc, thu hoạch và thông tin được phép công khai.'
    },
    {
      icon: ClipboardCheck,
      title: 'Hồ sơ có cấu trúc',
      desc: 'Thông tin sản phẩm, đơn vị sản xuất và chứng nhận được trình bày trong một hồ sơ thống nhất.'
    },
    {
      icon: ShieldCheck,
      title: 'Công khai đúng phạm vi',
      desc: 'Chỉ hiển thị dữ liệu đã được hợp tác xã phê duyệt và chuẩn hóa trước khi mở cho người mua.'
    }
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Hợp tác xã số hóa vùng canh tác và nhật ký',
      desc: 'Hợp tác xã ghi nhận diện tích canh tác, giống cây trồng và nhật ký chăm sóc ngay từ đồng ruộng vào hệ thống quản trị.',
      tag: 'Khai báo tại nguồn'
    },
    {
      step: '02',
      title: 'Thẩm định & cấp Hộ Chiếu Nông Nghiệp',
      desc: 'Dữ liệu được chuẩn hóa, đối chiếu tài liệu chứng nhận và cấp mã QR điện tử cho sản phẩm.',
      tag: 'Chứng thực số'
    },
    {
      step: '03',
      title: 'Người tiêu dùng quét QR kiểm chứng',
      desc: 'Chỉ với thao tác quét QR trên điện thoại, khách hàng tra cứu trọn vẹn hành trình từ nông trại đến bàn ăn.',
      tag: 'Minh bạch thị trường'
    }
  ];

  const organizationId = `${canonical}#organization`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Hộ chiếu nông nghiệp',
        url: canonical,
        description: 'Nền tảng hồ sơ số và dữ liệu nông sản minh bạch'
      },
      {
        '@type': 'WebSite',
        '@id': `${canonical}#website`,
        name: 'Hộ chiếu nông nghiệp',
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

      <main id="main-content" data-site-home="passport" className="space-y-0">
        {/* =========================================================================
            1. LOOKUP-FIRST HERO
           ========================================================================= */}
        <PassportHomeHero />

        {/* =========================================================================
            2. WHAT A PUBLIC PASSPORT CONTAINS
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-12 sm:py-16">
          <div className={publicContainerClass}>
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Mở hồ sơ để kiểm tra</p>
                <h2 className="mt-3 max-w-[14ch] text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">
                  Bạn sẽ thấy gì sau một lần quét?
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-[var(--text-secondary)]">
                  Hộ chiếu giúp người mua nhìn đúng những bằng chứng quan trọng, đủ nhanh để quyết định và đủ rõ để kiểm tra lại.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
              {passportProofs.map((metric) => {
                const Icon = metric.icon;
                return (
                  <article
                    key={metric.title}
                    className="flex gap-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold leading-6 text-[var(--text-primary)]">
                        {metric.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {metric.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. THE DATA JOURNEY
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-14 sm:py-20">
          <div className={publicContainerClass}>
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Hành trình dữ liệu</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
                Từ vùng trồng đến mã truy xuất
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
                Một hồ sơ tốt không chỉ có mã QR. Nó nối các mốc dữ liệu lại để người mua hiểu sản phẩm được tạo ra như thế nào.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
              {howItWorksSteps.map((item) => (
                <article
                  key={item.step}
                  className="group relative flex min-h-[248px] flex-col rounded-[1.4rem] border border-[var(--border)] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[0_18px_38px_rgba(15,81,37,0.1)] sm:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-primary)] font-mono text-sm font-black text-white">{item.step}</span>
                    <span className="text-right text-[11px] font-bold text-[var(--brand-primary)]">{item.tag}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-extrabold leading-7 text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.desc}</p>
                  <span className="mt-auto pt-5 text-xs font-bold text-[var(--brand-primary)] opacity-0 transition-opacity group-hover:opacity-100">Đã sẵn sàng để kiểm tra</span>
                </article>
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
                <p className="text-sm font-semibold text-[#0d7a28]">Hồ sơ điện tử</p>
                <h2 className="type-h2 text-[var(--text-primary)] lg:whitespace-nowrap">
                  Nông sản đã cấp hộ chiếu nông nghiệp
                </h2>
                <p className="type-body max-w-2xl text-[var(--text-secondary)] lg:max-w-none lg:whitespace-nowrap">
                  Các sản phẩm nông sản đã hoàn tất thẩm định, cấp mã QR và công khai minh bạch toàn bộ dữ liệu nguồn gốc.
                </p>
              </div>

              <Link
                href="/san-pham?hasQr=true"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28] hover:bg-[#0d7a28]/5"
              >
                <span>Xem tất cả ({catalog.products.length})</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="flex overflow-x-auto gap-3 pb-3 -mx-4 px-4 scroll-snap-x-mandatory no-scrollbar sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
                {featuredProducts.map((product, idx) => (
                  <div
                    key={product.id}
                    className="w-[210px] xs:w-[230px] shrink-0 scroll-snap-align-start sm:w-auto"
                  >
                    <ProductCard product={product} priority={idx < 4} siteKey={siteKey} />
                  </div>
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
            5. START WITH THE RIGHT JOURNEY
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-14 sm:py-20">
          <div className={publicContainerClass}>
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Bắt đầu từ nhu cầu của bạn</p>
                <h2 className="mt-3 max-w-[15ch] text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
                  Hai cách để đi sâu hơn
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-[var(--text-secondary)]">
                  Người mua cần một hồ sơ dễ hiểu. Hợp tác xã cần một quy trình số hóa có thể bắt đầu ngay từ dữ liệu đang có.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <article className="flex h-full flex-col rounded-[1.5rem] border border-[var(--brand-primary)]/25 bg-[var(--brand-primary-subtle)] p-5 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-primary)] text-white">
                    <QrCode size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold text-[var(--brand-primary)]">Dành cho người mua</p>
                  <h3 className="mt-2 text-xl font-extrabold text-[var(--text-primary)]">Tra cứu đúng sản phẩm</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Quét mã trên tem hoặc nhập mã hồ sơ để xem nguồn gốc, nhật ký và chứng nhận đã công khai.
                  </p>
                  <Link href="/truy-xuat" className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-extrabold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
                    Mở trang tra cứu <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>

                <article className="flex h-full flex-col rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[var(--brand-primary)] shadow-sm">
                    <Sprout size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold text-[var(--brand-primary)]">Dành cho hợp tác xã</p>
                  <h3 className="mt-2 text-xl font-extrabold text-[var(--text-primary)]">Tạo hồ sơ từ dữ liệu thật</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Chuẩn hóa vùng trồng, mùa vụ và nhật ký để sản phẩm có thông tin rõ ràng trước khi ra thị trường.
                  </p>
                  <Link href="/lien-he" className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-extrabold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
                    Đăng ký triển khai <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              </div>
            </div>

            <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[var(--brand-primary)] shadow-sm">
                <Leaf size={21} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[var(--text-primary)]">Muốn xem chi tiết tới từng cá thể cây?</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Hộ chiếu cây kết nối cây, vùng trồng, nhật ký và sản lượng trong một dòng thời gian riêng.</p>
              </div>
              <Link href="/cay" className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
                Xem Hộ chiếu cây <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. ĐỐI TÁC VÀ HỢP TÁC XÃ TIÊU BIỂU
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-14 sm:py-18">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/10 px-3 py-1 text-xs font-bold text-[#0d7a28]">
                  <Store size={13} aria-hidden="true" />
                  <span>Mạng lưới sản xuất</span>
                </span>
                <h2 className="type-h2 text-[var(--text-primary)]">
                  Hợp tác xã và vùng trồng tiêu biểu
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
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {featuredCooperatives.length > 0 ? (
              <div className="flex overflow-x-auto gap-3.5 pb-3 -mx-4 px-4 scroll-snap-x-mandatory no-scrollbar sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
                {featuredCooperatives.map((coop, idx) => (
                  <div
                    key={coop.id}
                    className="w-[280px] xs:w-[310px] shrink-0 scroll-snap-align-start sm:w-auto"
                  >
                    <CooperativeCard cooperative={coop} priority={idx < 3} siteKey={siteKey} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPublicState
                title="Chưa có thông tin hợp tác xã"
                description="Dữ liệu danh bạ hợp tác xã đang được cập nhật."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            7. CTA BANNER: DÀNH CHO HỢP TÁC XÃ VÀ DOANH NGHIỆP SẢN XUẤT
           ========================================================================= */}
        <section className="bg-[var(--surface-muted)] py-8 sm:py-14">
          <div className={publicContainerClass}>
            <div className="rounded-2xl bg-[#0d7a28] p-6 text-white sm:p-10 lg:p-14">
              <div className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d6f3c7]">Dành cho hợp tác xã và đơn vị sản xuất</p>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                  Nâng tầm giá trị nông sản bằng hộ chiếu nông nghiệp số
                </h2>

                <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-white/85">
                  Đăng ký tham gia nền tảng để được hỗ trợ số hóa hồ sơ vùng canh tác, chuẩn hóa quy trình VietGAP và OCOP, đồng thời cấp tem QR truy xuất nguồn gốc.
                </p>

                <div className="flex flex-col items-center gap-2.5 pt-3 sm:flex-row sm:justify-center sm:gap-3.5">
                  <Link
                    href="/lien-he"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[#062c22] transition hover:bg-[#d6f3c7] active:scale-95 sm:w-auto"
                  >
                    <span>Đăng ký cấp hộ chiếu</span>
                  </Link>

                  <Link
                    href="/ve-chung-toi"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/35 px-5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95 sm:w-auto"
                  >
                    <span>Tìm hiểu thêm về nền tảng</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. TIN TỨC VÀ KIẾN THỨC NÔNG NGHIỆP SỐ
           ========================================================================= */}
        {newsList.length > 0 && (
          <section className="border-t border-[var(--border)] bg-white py-14 sm:py-18">
            <div className={publicContainerClass}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0d7a28]">Kiến thức và xu hướng</p>
                  <h2 className="type-h2 text-[var(--text-primary)]">
                    Tin tức chuyển đổi số nông nghiệp
                  </h2>
                  <p className="type-body text-[var(--text-secondary)] max-w-none lg:whitespace-nowrap">
                    Cập nhật các mô hình ứng dụng công nghệ, tiêu chuẩn truy xuất và kinh nghiệm phát triển chuỗi nông sản bền vững.
                  </p>
                </div>

                <Link
                  href="/tin-tuc"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-5 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28] hover:bg-[#0d7a28]/5"
                >
                  <span>Xem tất cả tin tức</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {newsList.slice(0, 3).map((article, index) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    priority={index === 0}
                    fallback="/news/field-qr.webp"
                    imageWrapperClassName="aspect-[16/10] w-full bg-[var(--surface-muted)]"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicShell>
  );
}
