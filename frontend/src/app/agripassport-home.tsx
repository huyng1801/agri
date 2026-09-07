import Link from 'next/link';
import { ArrowRight, Boxes, CheckCircle2, Database, Leaf, QrCode, Store } from 'lucide-react';
import { EmptyPublicState, NewsCard, PublicSearch } from '@/components/public-marketplace';
import { ProductSlider } from '@/components/product-slider';
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
    fetchPublicCatalog(24),
    fetchPublicNews('/news/public?home=true&limit=3'),
    getRequestAbsoluteUrl('/')
  ]);
  const products = catalog.products.slice(0, 5);
  const cooperatives = catalog.cooperatives.slice(0, 6);
  const qrProductCount = catalog.products.filter((product) => product.passports?.length).length;

  const platformPillars = [
    {
      title: 'Số hóa vùng sản xuất',
      description: 'Chuẩn hóa thông tin vùng trồng, đơn vị sản xuất và dữ liệu liên quan.',
      icon: Leaf
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Tập trung thông tin sản phẩm trên một hệ thống dễ quản lý và cập nhật.',
      icon: Database
    },
    {
      title: 'Truy xuất nguồn gốc',
      description: 'Kết nối sản phẩm với dữ liệu nguồn gốc thông qua mã QR.',
      icon: QrCode
    },
    {
      title: 'Minh bạch dữ liệu',
      description: 'Công khai những thông tin phù hợp để người dùng dễ dàng tiếp cận.',
      icon: CheckCircle2
    },
    {
      title: 'Kết nối thị trường',
      description: 'Hỗ trợ sản phẩm tiếp cận đối tác, nhà phân phối và người tiêu dùng.',
      icon: Store
    },
    {
      title: 'Chuyển đổi số',
      description: 'Từng bước đưa hoạt động quản lý nông nghiệp lên môi trường số.',
      icon: Boxes
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
      <main id="main-content" className="overflow-hidden bg-[var(--surface-1)]">
        <section className="border-b border-[var(--border)] bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--brand-primary)_14%,transparent),transparent_42%),linear-gradient(180deg,var(--brand-primary-subtle)_0%,var(--surface-1)_100%)]">
          <div className={cn(publicContainerClass, 'px-4 py-10 text-center sm:px-5 sm:py-16 lg:px-6 lg:py-20')}>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-primary)] sm:text-sm">Agripassport</p>
            <h1 className="type-h1 mx-auto mt-4 max-w-[16ch] text-[clamp(2.2rem,9.8vw,2.8rem)] sm:max-w-[14ch] sm:text-[4.3rem] lg:text-[5.25rem]">
              Số hóa nông sản, minh bạch nguồn gốc bằng QR
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-[1rem] leading-7 text-[var(--text-secondary)] sm:mt-6 sm:text-[1.15rem] sm:leading-8">
              Agripassport chuẩn hóa dữ liệu và công khai sản phẩm nông nghiệp để người mua tìm hiểu nguồn gốc, đơn vị sản xuất và thông tin QR rõ ràng hơn.
            </p>
            <div className="mx-auto mt-7 max-w-3xl sm:mt-8">
              <PublicSearch placeholder="Nhập mã sản phẩm hoặc mã QR để tra cứu nguồn gốc" className="rounded-[var(--public-radius-surface)] border-[var(--border-strong)] ring-0 shadow-[var(--public-shadow-card)]" />
            </div>
          </div>
        </section>

        <section aria-label="Tổng quan dữ liệu công khai" className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
          <div className={cn(publicContainerClass, 'grid grid-cols-3 divide-x divide-[var(--border)] py-4 sm:py-5')}>
            {[
              { value: catalog.products.length, label: 'Sản phẩm công khai' },
              { value: catalog.cooperatives.length, label: 'HTX đang kết nối' },
              { value: qrProductCount, label: 'Sản phẩm có QR' }
            ].map((stat) => (
              <div key={stat.label} className="px-2 text-center first:pl-0 last:pr-0 sm:px-4">
                <p className="text-xl font-extrabold tracking-[-0.04em] text-[var(--brand-primary)] sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[0.68rem] font-semibold leading-4 text-[var(--text-secondary)] sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-primary)] sm:text-sm">Đồng hành cùng nông nghiệp số</p>
            <h2 className="type-h2 mt-3 text-3xl sm:text-5xl">Dữ liệu rõ ràng cho từng bước sản xuất</h2>
            <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">
              Agripassport kết nối dữ liệu sản xuất, sản phẩm và thị trường trên một nền tảng số, giúp các chủ thể nông nghiệp từng bước chuẩn hóa thông tin và nâng cao giá trị sản phẩm.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {platformPillars.map(({ title, description, icon: Icon }) => (
              <article key={title} className="flex h-full flex-col rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--public-shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--public-shadow-hover)] sm:p-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] sm:h-11 sm:w-11"><Icon size={21} aria-hidden="true" /></span>
                <h3 className="mt-4 text-[0.98rem] font-extrabold leading-[1.2] text-[var(--text-primary)] sm:text-lg">{title}</h3>
                <p className="mt-2 text-[0.78rem] leading-5 text-[var(--text-secondary)] sm:text-sm sm:leading-6">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface-muted)] py-10 sm:py-14 lg:py-16">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-4xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-primary)] sm:text-sm">Sản phẩm nổi bật</p>
                <h2 className="type-h2 mt-3 text-3xl sm:text-5xl">Sản phẩm đang được giới thiệu</h2>
                <p className="mt-4 max-w-3xl text-[1rem] leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">Chọn sản phẩm để xem giá, đơn vị sản xuất, vùng trồng và thông tin truy xuất trước khi liên hệ.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/san-pham" className="brand-gradient-bg inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-[0_12px_24px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)] transition hover:-translate-y-0.5">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link href="/san-pham?hasQr=true" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-sm font-bold text-[var(--brand-primary)] shadow-sm transition hover:-translate-y-0.5">Có QR Passport</Link>
              </div>
            </div>

            {products.length ? <ProductSlider products={products} /> : <div className="mt-7 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 text-[var(--text-secondary)]">Sản phẩm công khai sẽ xuất hiện tại đây khi đơn vị hoàn thiện hồ sơ.</div>}
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-primary)] sm:text-sm">Đối tác trong hệ sinh thái</p><h2 className="type-h2 mt-3 text-3xl sm:text-5xl">Mỗi đơn vị đều có một điểm nhận diện rõ.</h2></div>
            <Link href="/htx" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-sm font-bold text-[var(--brand-primary)] shadow-sm transition hover:-translate-y-0.5 sm:self-auto">Xem HTX <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cooperatives.length ? cooperatives.map((cooperative, index) => (
              <Link key={cooperative.id} href={`/htx/${cooperative.code}`} className="group flex min-h-[8.5rem] items-center gap-4 rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--public-shadow-card)] transition hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-[var(--public-shadow-hover)]">
                <PublicImage src={cooperative.avatarUrl} alt={cooperative.name} decorative priority={index < 3} wrapperClassName="h-14 w-14 shrink-0 rounded-[var(--public-radius-control)] bg-[var(--brand-primary-subtle)]" className="h-full w-full object-cover" />
                <span className="min-w-0"><span className="block line-clamp-2 font-extrabold leading-5 text-[var(--text-primary)]">{cooperative.name}</span><span className="mt-1 block text-sm text-[var(--text-secondary)]">{cooperative.province || 'Việt Nam'} · {cooperative.productCount} sản phẩm</span></span>
              </Link>
            )) : <EmptyPublicState title="Chưa có HTX công khai" description="HTX sẽ xuất hiện khi có dữ liệu đã được đối chiếu và mở phạm vi công khai." />}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface-muted)] py-10 sm:py-14 lg:py-16">
          <div className={cn(publicContainerClass, 'max-w-5xl')}>
            <PublicEcosystemShowcase siteKey="agripassport" compact />
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface-1)] py-10 sm:py-14 lg:py-16">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-primary)] sm:text-sm">Từ đội vận hành</p><h2 className="type-h2 mt-3 text-3xl sm:text-5xl">Tin tức và kiến thức thực tế.</h2></div><Link href="/tin-tuc" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 text-sm font-bold text-[var(--brand-primary)] shadow-sm transition hover:-translate-y-0.5 sm:self-auto">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></Link></div>
            {news.data.length ? <div className="mt-7 grid gap-4 md:grid-cols-3">{news.data.slice(0, 3).map((article, index) => <NewsCard key={article.id} article={article} priority={index === 0} />)}</div> : <div className="mt-7"><EmptyPublicState title="Chưa có tin tức công khai" description="Tin tức đã được biên tập và công khai sẽ xuất hiện tại đây." /></div>}
          </div>
        </section>

        <section className="brand-gradient-bg py-10 text-white sm:py-14"><div className={publicContainerClass}><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/80 sm:text-sm">Bắt đầu cùng Agripassport</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">Số hóa sản phẩm bắt đầu từ dữ liệu</h2><p className="mt-4 text-[1rem] leading-7 text-white/80 sm:text-[1.08rem] sm:leading-8">Không cần thay đổi mọi thứ cùng lúc. Agripassport giúp các đơn vị từng bước chuẩn hóa dữ liệu và xây dựng nền tảng truy xuất phù hợp với nhu cầu thực tế.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/lien-he"><Button variant="inverse" className="min-h-12 w-full rounded-full px-6 sm:w-auto">Liên hệ tư vấn <ArrowRight size={17} aria-hidden="true" /></Button></Link><Link href="/ve-chung-toi"><Button variant="inverse-ghost" className="min-h-12 w-full rounded-full px-6 sm:w-auto">Khám phá giải pháp</Button></Link></div></div></div></section>
      </main>
    </PublicShell>
  );
}
