import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Leaf, QrCode, ShoppingBag, Sparkles, Store, type LucideIcon } from 'lucide-react';
import { ProductSlider } from '@/components/product-slider';
import { CooperativeCard, EmptyPublicState, NewsCard, PublicSearch, PublicShell } from '@/components/public-marketplace';
import { PublicImage } from '@/components/public-image';
import { PublicSection, PublicSectionHeader, publicContainerClass } from '@/components/public-layout';
import { Button, Panel, cn } from '@/components/ui';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'HTXONLINE — San nong san so cho hop tac xa Viet Nam',
  description: 'Ket noi nguoi mua voi san pham HTX minh bach, QR truy xuat nguon goc va dat hang COD tren HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/' },
  openGraph: {
    title: 'HTXONLINE — San nong san so',
    description: 'San nong san so cho hop tac xa Viet Nam voi QR Passport va dat hang COD.',
    url: 'https://htxonline.vn/',
    siteName: 'HTXONLINE',
    locale: 'vi_VN',
    type: 'website'
  }
};

export default async function HomePage() {
  const [catalog, news, siteProfile] = await Promise.all([
    fetchPublicCatalog(100),
    fetchPublicNews('/news/public?home=true&limit=3'),
    getPublicSiteProfile()
  ]);

  const featuredProducts = catalog.products.slice(0, 12);
  const featuredCooperatives = catalog.cooperatives.slice(0, 6);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['San pham public', catalog.totalProducts, ShoppingBag],
    ['HTX dang hien thi', catalog.cooperatives.length, Store],
    ['QR Passport', 'Truy xuat nhanh', QrCode]
  ];
  const heroSignals = [
    'Cong khai san pham va ho so HTX tren cung mot nen tang',
    'QR Passport mo truc tiep cho nguoi mua ma khong can dang nhap',
    'Dat hang COD nhanh, HTX chu dong xac nhan va xu ly'
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
              'relative grid items-center gap-5 pb-7 pt-4 sm:min-h-[78vh] sm:gap-10 sm:py-12 lg:grid-cols-[1.02fr_0.98fr]'
            )}
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-leaf/10 bg-white/88 px-3 py-1.5 text-[0.76rem] font-semibold text-leaf shadow-sm backdrop-blur sm:text-sm">
                <Leaf size={16} aria-hidden="true" />
                {siteProfile.pageContent.homeBadge}
              </div>

              <h1 className="max-w-[15.2ch] text-[1.68rem] font-bold leading-[1.01] tracking-[-0.03em] text-ink sm:max-w-3xl sm:text-5xl sm:leading-[0.98]">
                {siteProfile.pageContent.homeTitle}
              </h1>

              <p className="max-w-[24.5rem] text-[0.95rem] leading-[1.72] text-slate-700 sm:max-w-2xl sm:text-lg sm:leading-8">
                {siteProfile.pageContent.homeDescription}
              </p>

              <div className="max-w-[24.5rem] rounded-[1.55rem] border border-white/80 bg-white/76 p-2.5 shadow-[0_18px_44px_rgba(148,163,184,0.15)] backdrop-blur sm:max-w-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
                  <Link href="/san-pham" className="inline-flex sm:w-auto">
                    <Button className="min-h-[3.4rem] w-full rounded-2xl px-4 text-[0.96rem] shadow-[0_16px_32px_rgba(47,132,81,0.24)] sm:min-h-12 sm:w-auto sm:px-5">
                      Xem san pham
                      <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/htx" className="inline-flex sm:w-auto">
                    <Button
                      variant="ghost"
                      className="min-h-[3.4rem] w-full justify-center rounded-2xl border-white/90 bg-white/96 px-4 text-[0.96rem] text-slate-900 shadow-[0_14px_28px_rgba(148,163,184,0.16)] ring-1 ring-slate-100/80 hover:bg-white sm:min-h-12 sm:w-auto sm:px-5"
                    >
                      Kham pha HTX
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="max-w-2xl rounded-[1.55rem] border border-white/70 bg-white/82 p-1.5 shadow-[0_24px_60px_rgba(47,132,81,0.09)] backdrop-blur sm:p-2">
                <PublicSearch />
              </div>

              <div className="grid gap-2.5 sm:max-w-2xl sm:grid-cols-3">
                {heroSignals.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-white/80 bg-white/80 px-4 py-3.5 text-[0.9rem] leading-[1.62] text-slate-700 shadow-sm backdrop-blur sm:text-[0.95rem]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-[1.65rem] border border-white/75 bg-white/78 p-2 shadow-[0_22px_60px_rgba(15,23,42,0.08)] lg:hidden">
                <PublicImage
                  src={siteProfile.pageContent.homeImageUrl}
                  alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
                  wrapperClassName="aspect-[16/10] rounded-[1.15rem]"
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              <div className="overflow-hidden rounded-[1.65rem] border border-white/75 bg-[linear-gradient(145deg,#246d45_0%,#2f8451_100%)] p-3.5 text-white shadow-[0_24px_70px_rgba(25,58,40,0.15)] lg:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/74">QR Passport</p>
                    <h2 className="mt-1.5 text-[1.28rem] font-bold leading-[1.08]">Truy xuat nhanh va chot don gon hon tren mobile.</h2>
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
                <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/70 p-2">
                  <PublicImage
                    src={siteProfile.pageContent.homeImageUrl}
                    alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
                    wrapperClassName="aspect-[16/10] rounded-[1.1rem]"
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="rounded-[1.7rem] bg-[linear-gradient(145deg,#1f5f3d_0%,#2f8451_52%,#4f9b65_100%)] p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/74">HTXONLINE</p>
                      <h2 className="mt-2 max-w-xs text-2xl font-bold leading-tight sm:text-[2rem]">Mot lop trung bay san pham va truy xuat duoc thiet ke cho HTX.</h2>
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
                      Hanh trinh mua hang ro rang hon
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        ['01', 'San pham public', 'Trang hien thi ro gia, HTX va QR neu co'],
                        ['02', 'Quet QR Passport', 'Xem vung trong, nhat ky va chung nhan'],
                        ['03', 'Chot don COD', 'Nguoi mua gui don, HTX chu dong xac nhan']
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
          <PublicSectionHeader title="San pham noi bat" description="Nong san public tu cac HTX tren he thong." href="/san-pham" linkLabel="Xem tat ca" />
          {featuredProducts.length ? (
            <ProductSlider products={featuredProducts} />
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chua co san pham public" description="Khi HTX publish san pham, san pham se xuat hien tai day." />
            </div>
          )}
        </PublicSection>

        <PublicSection band>
          <PublicSectionHeader title="HTX noi bat" description="Ho so HTX dang co san pham public." href="/htx" linkLabel="Xem HTX" />
          {featuredCooperatives.length ? (
            <div className="mt-5 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
              {featuredCooperatives.map((cooperative, index) => (
                <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 3} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chua co HTX public" description="HTX se xuat hien khi co san pham duoc publish." />
            </div>
          )}
        </PublicSection>

        <PublicSection>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Minh bach nguon goc', 'QR Passport giup nguoi mua kiem tra nhat ky, vung trong va chung nhan public.', QrCode],
              ['Dat hang COD', 'Nguoi mua gui don nhanh, HTX lien he xac nhan va xu ly don.', ShoppingBag],
              ['HTX tu van hanh', 'San pham, vung trong, nhat ky va don hang do tung HTX tu quan ly.', BadgeCheck]
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
          <PublicSectionHeader title="Tin tuc moi nhat" description="Tin HTX, thi truong va truy xuat nguon goc tu doi van hanh HTXONLINE." href="/tin-tuc" linkLabel="Xem tin tuc" />
          {news.data.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {news.data.map((article, index) => (
                <NewsCard key={article.id} article={article} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chua co tin tuc public" description="Tin tuc do Super Admin publish se xuat hien tai day." />
            </div>
          )}
        </PublicSection>
      </main>
    </PublicShell>
  );
}
