import Link from 'next/link';
import { ArrowRight, Boxes, Calendar, Database, QrCode, Store, Users } from 'lucide-react';
import { EmptyPublicState, NewsCard, ProductCard } from '@/components/public-marketplace';
import { PublicImage } from '@/components/public-image';
import { PublicStructuredData, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getRequestAbsoluteUrl } from '@/lib/request-site';

const siteKey = 'htxonline' as const;

const workflow = [
  ['01', 'Quản lý xã viên', 'Tập trung hồ sơ thành viên, vai trò và lịch sử tham gia trong một luồng nội bộ rõ ràng.'],
  ['02', 'Theo dõi vận hành', 'Ghi nhận dịch vụ, thu chi, xuất nhập và các đầu việc cần bàn giao trong HTX.'],
  ['03', 'Chuẩn hóa dữ liệu', 'Chuẩn bị thông tin sản phẩm, vùng trồng và hồ sơ cần đồng bộ sang Agripassport.'],
  ['04', 'Mở kênh công khai', 'Khi dữ liệu đủ chuẩn, tạo cầu nối tới sản phẩm công khai và Hộ chiếu nông nghiệp.']
] as const;

const capabilities = [
  { title: 'Hồ sơ thành viên', description: 'Một nơi quản lý xã viên, trạng thái tham gia và lịch sử hỗ trợ.', icon: Users },
  { title: 'Vận hành nội bộ', description: 'Theo dõi thu chi, xuất nhập và dịch vụ theo cùng một mặt bằng dữ liệu.', icon: Boxes },
  { title: 'Sẵn sàng đồng bộ', description: 'Chuẩn hóa sản phẩm và dữ liệu đầu ra trước khi mở sang Agripassport.', icon: Database }
] as const;

export async function HtxonlineHome() {
  const [catalog, news, canonical] = await Promise.all([
    fetchPublicCatalog(100),
    fetchPublicNews('/news/public?home=true&limit=3', siteKey),
    getRequestAbsoluteUrl('/')
  ]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${canonical}#organization`,
        name: 'HTXONLINE',
        url: canonical,
        description: 'Hệ thống quản trị nội bộ cho hợp tác xã'
      },
      {
        '@type': 'WebSite',
        '@id': `${canonical}#website`,
        name: 'HTXONLINE',
        url: canonical,
        publisher: { '@id': `${canonical}#organization` }
      }
    ]
  };

  return (
    <PublicShell>
      <PublicStructuredData data={structuredData} />
      <main id="main-content" data-site-home="htxonline">
        <section className="border-b border-[var(--border)] bg-[linear-gradient(135deg,#131935_0%,#1e2b54_52%,#106f8a_100%)] py-10 text-white sm:py-16 lg:py-24">
          <div className={publicContainerClass}>
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
                  <Store size={14} aria-hidden="true" /> Quản trị hợp tác xã
                </span>
                <h1 className="mt-5 max-w-[12ch] text-[2.55rem] font-extrabold leading-[0.96] tracking-[-0.055em] sm:text-[4.35rem]">
                  HTXONLINE giúp vận hành rõ ràng hơn.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                  Tập trung hồ sơ xã viên, dịch vụ, thu chi, xuất nhập và dữ liệu cần chuẩn hóa trước khi kết nối thị trường.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#131935] shadow-lg transition hover:-translate-y-0.5">
                    Vào hệ thống quản trị <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link href="/gioi-thieu" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16">
                    Xem quy trình
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-[0_24px_60px_rgba(4,15,42,0.22)] backdrop-blur sm:p-6">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/30 bg-white">
                  <PublicImage
                    src="/hero/htx-farmer-hero-v2.webp"
                    alt="Nông hộ sử dụng dữ liệu số cùng hợp tác xã"
                    fallback="/hero/htx-farmer-hero-v2.webp"
                    priority
                    wrapperClassName="aspect-[16/11] w-full bg-slate-100"
                    className="h-full w-full object-cover"
                  />
                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                    <div className="rounded-xl bg-[#eef2ff] p-3 text-[#131935]"><p className="text-xs font-bold uppercase tracking-[0.14em]">Thành viên</p><p className="mt-1 text-sm font-extrabold">Hồ sơ tập trung</p></div>
                    <div className="rounded-xl bg-[#e7f7f8] p-3 text-[#106f8a]"><p className="text-xs font-bold uppercase tracking-[0.14em]">Kết nối</p><p className="mt-1 text-sm font-extrabold">Sang Agripassport</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)] bg-white py-10 sm:py-14">
          <div className={publicContainerClass}>
            <div className="grid gap-4 md:grid-cols-3">
              {capabilities.map(({ title, description, icon: Icon }) => (
                <article key={title} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[var(--public-shadow-card)]">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#131935]/10 text-[#131935]"><Icon size={21} aria-hidden="true" /></span>
                  <h2 className="mt-4 text-lg font-extrabold text-[var(--text-primary)]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-10 sm:py-16">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#131935]">Luồng triển khai riêng</p>
              <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[3rem]">Từ quản trị nội bộ đến dữ liệu sẵn sàng công khai</h2>
              <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">HTXONLINE giữ đúng vai trò quản trị. Các lớp sản phẩm và truy xuất được kết nối sau khi dữ liệu đã đủ rõ.</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map(([step, title, description]) => (
                <article key={step} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[var(--public-shadow-card)]">
                  <p className="font-mono text-2xl font-black text-[#131935]">{step}</p>
                  <h3 className="mt-4 text-lg font-extrabold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)] bg-white py-10 sm:py-16">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#131935]">Dữ liệu đang kết nối</p><h2 className="mt-2 text-[2rem] font-extrabold leading-tight text-[var(--text-primary)]">Sản phẩm và HTX trong hệ sinh thái</h2></div>
              <Link href="/san-pham" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 text-sm font-bold text-[#131935]">Xem danh mục <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            {catalog.products.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{catalog.products.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}</div> : <div className="mt-6"><EmptyPublicState title="Chưa có sản phẩm công khai" description="Sản phẩm sẽ hiển thị sau khi HTX hoàn tất dữ liệu cần thiết." /></div>}
          </div>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-10 sm:py-16">
          <div className={publicContainerClass}>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#131935]">Bản tin HTXONLINE</p><h2 className="mt-2 text-[2rem] font-extrabold leading-tight text-[var(--text-primary)]">Tin tức vận hành</h2></div><Link href="/tin-tuc" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#131935]">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></Link></div>
            {news.data.length ? <div className="mt-6 grid gap-4 md:grid-cols-3">{news.data.map((article, index) => <NewsCard key={article.id} article={article} priority={index === 0} />)}</div> : <div className="mt-6"><EmptyPublicState title="Chưa có tin tức HTXONLINE" description="Bài viết vận hành sẽ hiển thị tại đây khi được công khai." /></div>}
          </div>
        </section>

        <section className="bg-[#131935] py-12 text-white sm:py-16">
          <div className={publicContainerClass}><div className="mx-auto max-w-3xl text-center"><Calendar className="mx-auto" size={26} aria-hidden="true" /><h2 className="mt-4 text-[2rem] font-extrabold leading-tight sm:text-[3rem]">Sẵn sàng số hóa hoạt động HTX?</h2><p className="mt-3 text-base leading-7 text-white/75">Bắt đầu từ hồ sơ thành viên và một quy trình vận hành rõ ràng.</p><Link href="/lien-he" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#131935]">Nhận tư vấn <ArrowRight size={16} aria-hidden="true" /></Link></div></div>
        </section>
      </main>
    </PublicShell>
  );
}
