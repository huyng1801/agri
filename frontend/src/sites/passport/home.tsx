import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Leaf,
  QrCode,
  Sprout,
  Store
} from 'lucide-react';
import { PassportHomeHero } from '@/components/passport-home-hero';
import { PublicEcosystemShowcase } from '@/components/public-ecosystem-showcase';
import { PublicImage } from '@/components/public-image';
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

  // Only show records that actually have a public QR passport.
  const qrProducts = catalog.products.filter((p) => Boolean(p.passports?.length));
  const featuredProducts = qrProducts.slice(0, 4);
  const featuredCooperatives = catalog.cooperatives.slice(0, 4);

  const journeySteps = [
    {
      step: '01',
      title: 'Ghi nhận tại vùng trồng',
      desc: 'Hợp tác xã nhập thông tin mùa vụ và hoạt động canh tác vào hệ thống.',
      image: '/hero/passport-journey-field.webp',
      alt: 'Nông dân ghi nhận thông tin mùa vụ bằng điện thoại tại vườn'
    },
    {
      step: '02',
      title: 'Gắn dữ liệu với sản phẩm',
      desc: 'Thông tin liên quan được tập hợp theo sản phẩm hoặc lô hàng.',
      image: '/hero/passport-journey-pack.webp',
      alt: 'Sản phẩm nông nghiệp được phân loại và đóng gói tại cơ sở'
    },
    {
      step: '03',
      title: 'Mở hồ sơ bằng QR',
      desc: 'Người mua xem những thông tin mà đơn vị sản xuất đã công khai.',
      image: '/hero/passport-journey-market.webp',
      alt: 'Người mua xem thông tin nông sản trên điện thoại tại chợ'
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

        {/* A visual, factual explanation of the public data journey. */}
        <section data-testid="passport-data-journey" className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-10 sm:py-16">
          <div className={publicContainerClass}>
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Hành trình dữ liệu</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">
                Từ vùng trồng đến hồ sơ QR
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
                Ba bước ngắn giúp người mua biết dữ liệu đến từ đâu và phần nào đang được công khai.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:mt-9 sm:grid-cols-3 sm:gap-5">
              {journeySteps.map((item) => (
                <article
                  key={item.step}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm sm:flex sm:flex-col sm:items-stretch sm:gap-0 sm:p-3"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--brand-primary-subtle)] sm:aspect-[16/10]">
                    <PublicImage
                      src={item.image}
                      alt={item.alt}
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/95 font-mono text-[11px] font-extrabold text-[var(--brand-primary)] shadow-sm sm:h-8 sm:w-8 sm:text-xs">
                      {item.step}
                    </span>
                  </div>
                  <div className="min-w-0 py-1 sm:px-3 sm:pb-3 sm:pt-4">
                    <h3 className="text-sm font-extrabold leading-5 text-[var(--text-primary)] sm:text-base sm:leading-6">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)] sm:mt-2 sm:text-sm sm:leading-6">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. SẢN PHẨM CÓ QR NỔI BẬT (FEATURED PRODUCTS)
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-10 sm:py-14">
          <div className={publicContainerClass}>
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Hồ sơ đang công khai</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  Sản phẩm có hồ sơ QR
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                  Xem thông tin sản phẩm và đơn vị sản xuất đang được chia sẻ công khai.
                </p>
              </div>

              <Link
                href="/san-pham?hasQr=true"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--border-strong)] px-4 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)] sm:self-auto"
              >
                <span>Xem tất cả {qrProducts.length > 0 ? `(${qrProducts.length})` : ''}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 2} siteKey={siteKey} />
                ))}
              </div>
            ) : (
              <EmptyPublicState
                title="Chưa có sản phẩm kèm hồ sơ QR công khai"
                description="Sản phẩm sẽ xuất hiện tại đây khi hồ sơ được mở công khai."
              />
            )}
          </div>
        </section>

        {/* =========================================================================
            5. START WITH THE RIGHT JOURNEY
           ========================================================================= */}
        <section className="border-b border-[var(--border)] bg-white py-14 sm:py-20">
          <div className={publicContainerClass}>
            <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-14">
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
                    Quét mã trên tem hoặc nhập mã để xem thông tin nguồn gốc được chia sẻ công khai.
                  </p>
                  <Link href="/truy-xuat" className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-extrabold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
                    Truy xuất QR <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>

                <article className="flex h-full flex-col rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[var(--brand-primary)] shadow-sm">
                    <Sprout size={21} aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold text-[var(--brand-primary)]">Dành cho hợp tác xã</p>
                  <h3 className="mt-2 text-xl font-extrabold text-[var(--text-primary)]">Tạo hồ sơ từ dữ liệu thật</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Sắp xếp thông tin vùng trồng, mùa vụ và nhật ký trước khi chia sẻ với người mua.
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
        <section className="border-b border-[var(--border)] bg-white py-10 sm:py-14">
          <div className={publicContainerClass}>
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary-subtle)] px-3 py-1 text-xs font-bold text-[var(--brand-primary)]">
                  <Store size={13} aria-hidden="true" />
                  <span>Mạng lưới sản xuất</span>
                </span>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  Hợp tác xã đang tham gia
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                  Tìm hiểu đơn vị sản xuất và thông tin liên hệ được đăng tải công khai.
                </p>
              </div>

              <Link
                href="/htx"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--border-strong)] px-4 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)] sm:self-auto"
              >
                <span>Xem tất cả {catalog.cooperatives.length > 0 ? `(${catalog.cooperatives.length})` : ''}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {featuredCooperatives.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
                {featuredCooperatives.map((coop, idx) => (
                  <CooperativeCard key={coop.id} cooperative={coop} priority={idx < 2} siteKey={siteKey} />
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

        <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-10 sm:py-14">
          <div className={publicContainerClass}>
            <PublicEcosystemShowcase siteKey="passport" compact />
          </div>
        </section>

        {/* =========================================================================
            8. TIN TỨC VÀ KIẾN THỨC NÔNG NGHIỆP SỐ
           ========================================================================= */}
        {newsList.length > 0 && (
          <section className="border-t border-[var(--border)] bg-white py-10 sm:py-14">
            <div className={publicContainerClass}>
              <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Kiến thức và xu hướng</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                    Tin tức chuyển đổi số nông nghiệp
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                    Câu chuyện, hướng dẫn và thông tin về truy xuất nông sản bằng dữ liệu.
                  </p>
                </div>

                <Link
                  href="/tin-tuc"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--border-strong)] px-4 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)] hover:text-[var(--brand-primary)] sm:self-auto"
                >
                  <span>Xem tất cả tin tức</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
