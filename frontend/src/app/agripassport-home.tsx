import Link from 'next/link';
import { ArrowRight, CheckCircle2, Database, Leaf, QrCode, ShoppingBag, Store, Users } from 'lucide-react';
import { NewsCard, PublicSearch } from '@/components/public-marketplace';
import { ProductSlider } from '@/components/product-slider';
import { PublicEcosystemShowcase } from '@/components/public-ecosystem-showcase';
import { PublicImage } from '@/components/public-image';
import { PublicMetricCarousel, type PublicMetricCarouselItem } from '@/components/public-metric-carousel';
import { publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';

export async function AgripassportHome() {
  const [catalog, news] = await Promise.all([
    fetchPublicCatalog(24),
    fetchPublicNews('/news/public?home=true&limit=3')
  ]);
  const products = catalog.products.slice(0, 10);
  const cooperatives = catalog.cooperatives.slice(0, 6);

  const metrics: PublicMetricCarouselItem[] = [
    {
      title: 'Sản phẩm công khai',
      value: `${catalog.totalProducts}+`,
      description: 'Tìm thông tin sản phẩm, đơn vị sản xuất và giá bán công khai.',
      icon: 'shoppingBag'
    },
    {
      title: 'HTX hiển thị',
      value: `${catalog.cooperatives.length} HTX`,
      description: 'Khám phá hồ sơ và các sản phẩm đang được giới thiệu.',
      icon: 'store'
    },
    {
      title: 'QR truy xuất',
      value: 'Mở nhanh',
      description: 'Quét mã để xem nguồn gốc và hành trình của sản phẩm.',
      icon: 'qrCode'
    },
    {
      title: 'Dữ liệu chuẩn hóa',
      value: 'Một mặt bằng dữ liệu',
      description: 'Thông tin được cập nhật thống nhất trên hồ sơ sản phẩm.',
      icon: 'boxes'
    },
  ];

  return (
    <PublicShell>
      <main id="main-content" className="overflow-hidden bg-[#fffdf8]">
        <section className="border-b border-[#e4eadf] bg-[radial-gradient(circle_at_50%_0%,rgba(185,225,178,0.34),transparent_42%),linear-gradient(180deg,#f8fbf4_0%,#fffdf8_100%)]">
          <div className={cn(publicContainerClass, 'px-4 py-10 text-center sm:px-5 sm:py-16 lg:px-6 lg:py-20')}>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-[#3d5871] sm:text-xs">
              <span className="rounded-full border border-white bg-white px-4 py-2 text-[#14773d] shadow-[0_10px_24px_rgba(28,79,45,0.06)]">AGRIPASSPORT</span>
              <span className="rounded-full border border-white bg-white px-4 py-2 shadow-[0_10px_24px_rgba(28,79,45,0.06)]">Hệ sinh thái Agri</span>
            </div>
            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1f9b4b] sm:mt-10 sm:text-sm">Số hóa nông sản, minh bạch nguồn gốc</p>
            <h1 className="mx-auto mt-3 max-w-[12ch] text-[2.65rem] font-extrabold leading-[0.96] tracking-[-0.055em] text-[#1e2233] sm:max-w-[13ch] sm:text-[4.3rem] lg:text-[5.25rem]">
              AGRIPASSPORT chuẩn hóa dữ liệu và công khai sản phẩm nông nghiệp
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-[1rem] leading-7 text-[#405b75] sm:mt-6 sm:text-[1.15rem] sm:leading-8">
              Đưa HTX, sản phẩm, vùng trồng và QR truy xuất lên cùng một mặt bằng dữ liệu để công khai bán hàng rõ ràng hơn.
            </p>
            <div className="mx-auto mt-7 max-w-3xl sm:mt-8">
              <PublicSearch placeholder="Tìm sản phẩm, HTX hoặc vùng trồng" className="border-[#e0e7d9] ring-0 shadow-[0_20px_46px_rgba(30,72,41,0.1)]" />
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1f9b4b] sm:text-sm">Đồng hành cùng nông nghiệp số</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1e2233] sm:text-5xl">Thắng lợi cùng nhà nông</h2>
            <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-[#52667a] sm:text-[1.08rem] sm:leading-8">
              Những thông tin cần thiết để tìm hiểu sản phẩm, đơn vị sản xuất và truy xuất nguồn gốc.
            </p>
          </div>

          <div className="mt-8 md:hidden"><PublicMetricCarousel items={metrics} variant="demeter" /></div>
          <div className="mt-10 hidden gap-x-6 gap-y-10 md:grid md:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric) => (
              <article key={`${metric.title}-${metric.value}`} className="text-center">
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_14px_30px_rgba(35,77,45,0.05)]">
                  {metric.icon === 'shoppingBag' ? <ShoppingBag size={38} strokeWidth={1.55} aria-hidden="true" /> : null}
                  {metric.icon === 'store' ? <Store size={38} strokeWidth={1.55} aria-hidden="true" /> : null}
                  {metric.icon === 'qrCode' ? <QrCode size={38} strokeWidth={1.55} aria-hidden="true" /> : null}
                  {metric.icon === 'boxes' ? <Database size={38} strokeWidth={1.55} aria-hidden="true" /> : null}
                  {metric.icon === 'users' ? <Users size={38} strokeWidth={1.55} aria-hidden="true" /> : null}
                </span>
                <p className="mt-5 min-h-10 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-[#1e2233]">{metric.title}</p>
                <p className="mt-2 min-h-12 text-[1.16rem] font-extrabold leading-tight tracking-[-0.03em] text-[#1f9b4b]">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-[#52667a]">{metric.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#e5e6dc] bg-[#f8f8f3] py-10 sm:py-14 lg:py-16">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-4xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1f9b4b] sm:text-sm">Sản phẩm nổi bật</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1e2233] sm:text-5xl">Sản phẩm đang được giới thiệu</h2>
                <p className="mt-4 max-w-3xl text-[1rem] leading-7 text-[#52667a] sm:text-[1.08rem] sm:leading-8">Chọn sản phẩm để xem giá, đơn vị sản xuất, vùng trồng và thông tin truy xuất trước khi liên hệ.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/san-pham" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1f9b4b] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(31,155,75,0.16)] transition hover:-translate-y-0.5">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></Link>
                <Link href="/san-pham?hasQr=true" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4e3d1] bg-white px-5 text-sm font-bold text-[#1b7138] shadow-sm transition hover:-translate-y-0.5">Có QR Passport</Link>
              </div>
            </div>

            {products.length ? <ProductSlider products={products} /> : <div className="mt-7 rounded-[1.6rem] border border-[#d7e5d2] bg-white p-6 text-[#52645b]">Sản phẩm công khai sẽ xuất hiện tại đây khi đơn vị hoàn thiện hồ sơ.</div>}
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1f9b4b] sm:text-sm">Chúng tôi bắt đầu từ dữ liệu</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1e2233] sm:text-5xl">Mỗi sản phẩm là một hồ sơ dữ liệu</h2>
            <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-[#52667a] sm:text-[1.08rem] sm:leading-8">Agripassport kết nối dữ liệu sản xuất, sản phẩm và thị trường trên một nền tảng số để thông tin rõ ràng hơn và dễ tiếp cận hơn.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Số hóa vùng sản xuất', 'Chuẩn hóa thông tin vùng trồng, đơn vị sản xuất và dữ liệu liên quan.', Leaf],
              ['Quản lý sản phẩm', 'Tập trung thông tin sản phẩm trên một hệ thống dễ quản lý và cập nhật.', Database],
              ['Truy xuất nguồn gốc', 'Kết nối sản phẩm với dữ liệu nguồn gốc thông qua mã QR.', QrCode],
              ['Minh bạch dữ liệu', 'Công khai những thông tin phù hợp để người dùng dễ dàng tiếp cận.', CheckCircle2]
            ].map(([title, description, Icon]) => (
              <article key={String(title)} className="rounded-[1.6rem] border border-[#dce8d8] bg-white p-5 shadow-[0_14px_32px_rgba(35,77,45,0.05)]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f5e7] text-[#1f9b4b]"><Icon size={22} aria-hidden="true" /></span>
                <h3 className="mt-5 text-lg font-extrabold leading-tight text-[#173327]">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64746b]">{String(description)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#e2e5da] bg-[#f5f7ef] py-10 sm:py-14 lg:py-16">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1f9b4b] sm:text-sm">Hệ sinh thái số cho nông nghiệp</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1e2233] sm:text-5xl">Nối các chủ thể trong nông nghiệp số</h2>
              <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-[#52667a] sm:text-[1.08rem] sm:leading-8">Từ quản lý hợp tác xã, số hóa sản phẩm đến truy xuất nguồn gốc và kết nối thị trường, các giải pháp được kết nối trên cùng một hệ sinh thái.</p>
            </div>
            <PublicEcosystemShowcase siteKey="agripassport" className="mt-8" showHeading={false} />
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1f9b4b] sm:text-sm">Đối tác trong hệ sinh thái</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1e2233] sm:text-5xl">Mỗi đơn vị đều có một điểm nhận diện rõ.</h2></div>
            <Link href="/htx" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#d4e3d1] bg-white px-5 text-sm font-bold text-[#1b7138] shadow-sm transition hover:-translate-y-0.5 sm:self-auto">Xem đối tác <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cooperatives.map((cooperative, index) => (
              <Link key={cooperative.id} href={`/htx/${cooperative.code}`} className="group flex min-h-[8.5rem] items-center gap-4 rounded-[1.55rem] border border-[#dce8d8] bg-white p-4 shadow-[0_12px_30px_rgba(35,77,45,0.05)] transition hover:-translate-y-1">
                <PublicImage src={cooperative.avatarUrl} alt={cooperative.name} decorative priority={index < 3} wrapperClassName="h-14 w-14 shrink-0 rounded-2xl bg-[#edf6e9]" className="h-full w-full object-cover" />
                <span className="min-w-0"><span className="block line-clamp-2 font-extrabold leading-5 text-[#173327]">{cooperative.name}</span><span className="mt-1 block text-sm text-[#6b7b72]">{cooperative.province || 'Việt Nam'} · {cooperative.productCount} sản phẩm</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[#e5e6dc] bg-[#fffdf8] py-10 sm:py-14 lg:py-16">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1f9b4b] sm:text-sm">Từ đội vận hành</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1e2233] sm:text-5xl">Tin tức và kiến thức thực tế.</h2></div><Link href="/tin-tuc" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#d4e3d1] bg-white px-5 text-sm font-bold text-[#1b7138] shadow-sm transition hover:-translate-y-0.5 sm:self-auto">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></Link></div>
            {news.data.length ? <div className="mt-7 grid gap-4 md:grid-cols-3">{news.data.slice(0, 3).map((article, index) => <NewsCard key={article.id} article={article} priority={index === 0} />)}</div> : null}
          </div>
        </section>

        <section className="bg-[#143d28] py-10 text-white sm:py-14"><div className={publicContainerClass}><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#a6ebb4] sm:text-sm">Bắt đầu cùng Agripassport</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">Số hóa sản phẩm bắt đầu từ dữ liệu</h2><p className="mt-4 text-[1rem] leading-7 text-white/78 sm:text-[1.08rem] sm:leading-8">Không cần thay đổi mọi thứ cùng lúc. Agripassport giúp các đơn vị từng bước chuẩn hóa dữ liệu và xây dựng nền tảng truy xuất phù hợp với nhu cầu thực tế.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/lien-he"><Button variant="inverse" className="min-h-12 w-full rounded-full px-6 sm:w-auto">Liên hệ tư vấn <ArrowRight size={17} aria-hidden="true" /></Button></Link><Link href="/ve-chung-toi"><Button variant="inverse-ghost" className="min-h-12 w-full rounded-full px-6 sm:w-auto">Khám phá giải pháp</Button></Link></div></div></div></section>
      </main>
    </PublicShell>
  );
}
