import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Leaf, QrCode, ShoppingBag, Sparkles, Store, type LucideIcon } from 'lucide-react';
import { ProductSlider } from '@/components/product-slider';
import {
  CooperativeCard,
  EmptyPublicState,
  NewsCard,
  PublicSearch,
  PublicShell
} from '@/components/public-marketplace';
import { PublicSection, PublicSectionHeader, publicContainerClass } from '@/components/public-layout';
import { Button, Panel, cn } from '@/components/ui';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';

export const metadata: Metadata = {
  title: 'HTXONLINE — Sàn nông sản số cho hợp tác xã Việt Nam',
  description: 'Kết nối người mua với sản phẩm HTX minh bạch, QR truy xuất nguồn gốc và đặt hàng COD trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/' },
  openGraph: {
    title: 'HTXONLINE — Sàn nông sản số',
    description: 'Sàn nông sản số cho hợp tác xã Việt Nam với QR Passport và đặt hàng COD.',
    url: 'https://htxonline.vn/',
    siteName: 'HTXONLINE',
    locale: 'vi_VN',
    type: 'website'
  }
};

export default async function HomePage() {
  const [catalog, news] = await Promise.all([fetchPublicCatalog(100), fetchPublicNews('/news/public?home=true&limit=3')]);
  const featuredProducts = catalog.products.slice(0, 12);
  const featuredCooperatives = catalog.cooperatives.slice(0, 6);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['Sản phẩm public', catalog.totalProducts, ShoppingBag],
    ['HTX đang hiển thị', catalog.cooperatives.length, Store],
    ['QR Passport', 'Truy xuất nhanh', QrCode]
  ];
  const heroSignals = [
    'Công khai sản phẩm và hồ sơ HTX trên cùng một nền tảng',
    'QR Passport mở trực tiếp cho người mua không cần đăng nhập',
    'Đặt hàng COD nhanh, HTX chủ động xác nhận và xử lý'
  ] as const;

  return (
    <PublicShell>
      <main id="main-content">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f4faf3_0%,#eff8f2_42%,#ffffff_100%)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 32%), radial-gradient(circle at 85% 18%, rgba(47,132,81,0.16), transparent 24%), radial-gradient(circle at 18% 78%, rgba(188,230,204,0.6), transparent 28%)'
            }}
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/70" />

          <div
            className={cn(
              publicContainerClass,
              'relative grid items-center gap-4 pb-6 pt-3 sm:min-h-[78vh] sm:gap-10 sm:py-12 lg:grid-cols-[1.02fr_0.98fr]'
            )}
          >
            <div className="space-y-3 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-leaf/10 bg-white/82 px-3 py-1.5 text-[0.78rem] font-semibold text-leaf shadow-sm backdrop-blur sm:text-sm">
                <Leaf size={16} aria-hidden="true" />
                Nền tảng số cho hợp tác xã
              </div>

              <h1 className="max-w-[13.4ch] text-[1.58rem] font-bold leading-[1] tracking-tight text-ink sm:max-w-3xl sm:text-5xl">
                HTXONLINE giúp hợp tác xã bán hàng minh bạch hơn trên môi trường số.
              </h1>

              <p className="max-w-[21.5rem] text-[0.92rem] leading-[1.58] text-slate-700 sm:max-w-2xl sm:text-lg sm:leading-8">
                Công khai sản phẩm, mở QR Passport cho người mua và vận hành quy trình đơn COD trên cùng một hệ thống gọn, rõ và dễ tin tưởng.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <Link href="/san-pham" className="inline-flex">
                  <Button className="min-h-12 w-full sm:w-auto">
                    Xem sản phẩm
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/htx" className="inline-flex">
                  <Button variant="ghost" className="min-h-12 w-full justify-center sm:w-auto">
                    Khám phá HTX
                  </Button>
                </Link>
              </div>

              <div className="max-w-2xl rounded-[1.55rem] border border-white/70 bg-white/82 p-1.5 shadow-[0_24px_60px_rgba(47,132,81,0.09)] backdrop-blur sm:p-2">
                <PublicSearch />
              </div>

              <div className="grid gap-2.5 sm:max-w-2xl sm:grid-cols-3">
                {heroSignals.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-white/80 bg-white/74 px-4 py-3 text-[0.95rem] leading-[1.62] text-slate-700 shadow-sm backdrop-blur">
                    {item}
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-[1.65rem] border border-white/75 bg-[linear-gradient(145deg,#246d45_0%,#2f8451_100%)] p-3.5 text-white shadow-[0_24px_70px_rgba(25,58,40,0.15)] lg:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/74">QR Passport</p>
                    <h2 className="mt-1.5 text-[1.28rem] font-bold leading-[1.08]">Truy xuất nhanh và chốt đơn gọn hơn trên mobile.</h2>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] bg-white/12 ring-1 ring-white/15">
                    <Sparkles size={16} aria-hidden="true" className="text-mint" />
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {stats.map(([title, value, Icon]) => (
                    <div key={String(title)} className="rounded-[1rem] bg-white/10 p-2.5 ring-1 ring-white/10">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-white/14 text-mint">
                        <Icon size={15} aria-hidden="true" />
                      </span>
                      <p className="mt-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/68">{String(title)}</p>
                      <p className="mt-0.5 text-[0.98rem] font-bold leading-tight">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -right-6 top-10 hidden h-28 w-28 rounded-full bg-mint/55 blur-3xl sm:block" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/82 p-4 shadow-[0_28px_80px_rgba(25,58,40,0.14)] backdrop-blur sm:p-5">
                <div className="rounded-[1.7rem] bg-[linear-gradient(145deg,#1f5f3d_0%,#2f8451_52%,#4f9b65_100%)] p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/74">HTXONLINE</p>
                      <h2 className="mt-2 max-w-xs text-2xl font-bold leading-tight sm:text-[2rem]">
                        Một lớp trưng bày sản phẩm và truy xuất được thiết kế cho HTX.
                      </h2>
                    </div>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                      <Sparkles size={20} aria-hidden="true" className="text-mint" />
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {stats.map(([title, value, Icon]) => (
                      <div key={String(title)} className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/12">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/14 text-mint">
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/72">{String(title)}</p>
                        <p className="mt-1 text-2xl font-bold">{String(value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.5rem] bg-black/12 p-4 ring-1 ring-white/10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/84">
                      <BadgeCheck size={16} aria-hidden="true" />
                      Hành trình mua hàng rõ ràng hơn
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ['01', 'Sản phẩm public', 'Trang hiển thị rõ giá, HTX và QR nếu có'],
                        ['02', 'Quét QR Passport', 'Xem vùng trồng, nhật ký và chứng nhận'],
                        ['03', 'Chốt đơn COD', 'Người mua gửi đơn, HTX chủ động xác nhận']
                      ].map(([step, title, text]) => (
                        <div key={title} className="rounded-2xl bg-white/10 p-4">
                          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/62">{step}</p>
                          <p className="mt-2 text-base font-bold">{title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/78">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PublicSection>
          <PublicSectionHeader
            title="Sản phẩm nổi bật"
            description="Nông sản public từ các HTX trên hệ thống."
            href="/san-pham"
            linkLabel="Xem tất cả"
          />
          {featuredProducts.length ? (
            <ProductSlider products={featuredProducts} />
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có sản phẩm public" description="Khi HTX publish sản phẩm, sản phẩm sẽ xuất hiện tại đây." />
            </div>
          )}
        </PublicSection>

        <PublicSection band>
          <PublicSectionHeader title="HTX nổi bật" description="Hồ sơ HTX đang có sản phẩm public." href="/htx" linkLabel="Xem HTX" />
          {featuredCooperatives.length ? (
            <div className="mt-5 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
              {featuredCooperatives.map((cooperative, index) => (
                <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có HTX public" description="HTX sẽ xuất hiện khi có sản phẩm được publish." />
            </div>
          )}
        </PublicSection>

        <PublicSection>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Minh bạch nguồn gốc', 'QR Passport giúp người mua kiểm tra nhật ký, vùng trồng và chứng nhận public.', QrCode],
              ['Đặt hàng COD', 'Người mua gửi đơn nhanh, HTX liên hệ xác nhận và xử lý đơn.', ShoppingBag],
              ['HTX tự vận hành', 'Sản phẩm, vùng trồng, nhật ký và đơn hàng do từng HTX tự quản lý.', BadgeCheck]
            ].map(([title, text, Icon]) => (
              <Panel key={String(title)} className="h-full p-3.5 sm:p-5">
                <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-mint text-leaf sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-[1.02rem] font-bold leading-tight text-ink sm:mt-3.5 sm:text-lg">{String(title)}</h3>
                <p className="mt-1.5 text-[0.84rem] leading-[1.62] text-slate-600 sm:mt-2 sm:text-sm sm:leading-[1.75]">{String(text)}</p>
              </Panel>
            ))}
          </div>
        </PublicSection>

        <PublicSection band>
          <PublicSectionHeader
            title="Tin tức mới nhất"
            description="Tin HTX, thị trường và truy xuất nguồn gốc từ đội vận hành HTXONLINE."
            href="/tin-tuc"
            linkLabel="Xem tin tức"
          />
          {news.data.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {news.data.map((article, index) => (
                <NewsCard key={article.id} article={article} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có tin tức public" description="Tin tức do Super Admin publish sẽ xuất hiện tại đây." />
            </div>
          )}
        </PublicSection>
      </main>
    </PublicShell>
  );
}
