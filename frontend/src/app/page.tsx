import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Boxes, Leaf, QrCode, ShoppingBag, Sparkles, Store, Users, type LucideIcon } from 'lucide-react';
import { ProductSlider } from '@/components/product-slider';
import { CooperativeCard, EmptyPublicState, NewsCard, PublicSearch } from '@/components/public-marketplace';
import { PublicImage } from '@/components/public-image';
import { PublicSection, PublicSectionHeader, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, Panel, cn } from '@/components/ui';
import { marketplaceUrl } from '@/lib/domain';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { defaultPublicSiteProfileForSite, getPublicSiteProfile } from '@/lib/public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const profile = defaultPublicSiteProfileForSite(siteKey);
  const canonical = await getRequestAbsoluteUrl('/');
  const pageTitle =
    siteKey === 'htxonline'
      ? 'HTXONLINE — Hệ thống quản trị nội bộ cho hợp tác xã'
      : siteKey === 'passport'
        ? 'HỘ CHIẾU NÔNG NGHIỆP — QR truy xuất cho sản phẩm và lô sản phẩm'
        : 'AGRIPASSPORT — Nền tảng dữ liệu sản phẩm nông nghiệp';

  return {
    title: pageTitle,
    description: profile.pageContent.homeDescription,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: profile.pageContent.homeDescription,
      url: canonical,
      siteName: profile.appName,
      locale: 'vi_VN',
      type: 'website'
    }
  };
}

export default async function HomePage() {
  const siteKey = await getRequestPublicSiteKey();
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const [catalog, news, siteProfile] = await Promise.all([
    fetchPublicCatalog(100),
    fetchPublicNews('/news/public?home=true&limit=3'),
    getPublicSiteProfile(siteKey)
  ]);

  const featuredProducts = (isPassport ? catalog.products.filter((product) => Boolean(product.passports?.length)) : catalog.products).slice(0, 12);
  const featuredCooperatives = catalog.cooperatives.slice(0, 6);
  const stats: Array<[string, string | number, LucideIcon]> = isInternal
    ? [
        ['Thành viên', 'Hồ sơ tập trung', Users],
        ['Vận hành', 'Thu chi - xuất nhập', Boxes],
        ['Kết nối', 'Đồng bộ sang Agripassport', QrCode]
      ]
    : isPassport
      ? [
          ['QR truy xuất', 'Mở nhanh', QrCode],
          ['Sản phẩm có hồ sơ', featuredProducts.length, ShoppingBag],
          ['Công khai', 'Theo phạm vi phê duyệt', BadgeCheck]
        ]
      : [
          ['Sản phẩm công khai', catalog.totalProducts, ShoppingBag],
          ['HTX đang hiển thị', catalog.cooperatives.length, Store],
          ['QR truy xuất', 'Mở nhanh', QrCode]
        ];
  const heroSignals = isInternal
    ? [
        'Tập trung hồ sơ thành viên, xã viên và lịch sử hoạt động trên cùng một hệ thống',
        'Theo dõi mức độ sử dụng dịch vụ, thu chi, xuất nhập và dữ liệu đối soát nội bộ',
        'Đồng bộ dữ liệu sản phẩm thực tế sang AGRIPASSPORT khi cần công khai và truy xuất'
      ]
    : isPassport
      ? [
          'Mỗi QR mở ra hồ sơ số gắn với sản phẩm, lô sản phẩm hoặc vùng trồng',
          'Hiển thị vùng trồng, nhật ký, chứng nhận và nguồn gốc theo phạm vi được công khai',
          'Tạo từ dữ liệu sản phẩm trên AGRIPASSPORT để người mua tra cứu nhanh hơn'
        ]
      : [
          'Chuẩn hóa thông tin hợp tác xã, sản phẩm và nhận diện trên cùng một nền tảng',
          'Mở QR truy xuất cho người mua mà không cần đăng nhập',
          'Công khai dữ liệu sản phẩm và kết nối tiêu thụ thuận tiện hơn'
        ];
  const primaryCta = isInternal
    ? { href: '/login', label: 'Đăng nhập quản trị' }
    : isPassport
      ? { href: '/san-pham?hasQr=true', label: 'Xem sản phẩm có QR' }
      : { href: '/san-pham', label: 'Xem sản phẩm' };
  const secondaryCta = isInternal
    ? { href: marketplaceUrl('/'), label: 'Mở AGRIPASSPORT', external: true }
    : isPassport
      ? { href: '/ve-chung-toi', label: 'Cách hoạt động', external: false }
      : { href: '/htx', label: 'Khám phá HTX', external: false };
  const heroNote = isInternal
    ? 'HTXONLINE giữ vai trò quản trị nội bộ. Dữ liệu sản phẩm công khai và QR truy xuất được đẩy sang AGRIPASSPORT.'
    : isPassport
      ? 'Mở nhanh hồ sơ QR, thông tin nguồn gốc và các dữ liệu công khai theo một luồng gọn trên điện thoại.'
      : 'Mở nhanh sản phẩm, hồ sơ HTX và QR truy xuất theo một luồng gọn trên điện thoại.';
  const spotlightLabel = isInternal ? 'HTXONLINE' : siteProfile.appName;
  const spotlightTitle = isInternal
    ? 'Một lớp quản trị nội bộ được thiết kế để HTX nắm thành viên, dịch vụ và vận hành rõ ràng hơn.'
    : isPassport
      ? 'Một lớp hồ sơ số giúp QR truy xuất rõ ràng hơn cho người mua và đối tác.'
      : 'Một lớp dữ liệu sản phẩm và truy xuất được thiết kế để HTX công khai minh bạch hơn.';
  const spotlightSteps = isInternal
    ? [
        ['01', 'Hồ sơ xã viên', 'Quản lý thông tin thành viên, trạng thái tham gia và dữ liệu sử dụng dịch vụ'],
        ['02', 'Vận hành nội bộ', 'Theo dõi thu chi, xuất nhập và lịch sử hoạt động theo từng nhu cầu quản trị'],
        ['03', 'Đồng bộ sản phẩm', 'Đưa dữ liệu sản phẩm thực tế sang AGRIPASSPORT khi cần công khai và truy xuất']
      ]
    : isPassport
      ? [
          ['01', 'Quét QR', 'Mở nhanh hồ sơ số của sản phẩm hoặc lô sản phẩm'],
          ['02', 'Xem nguồn gốc', 'Kiểm tra vùng trồng, nhật ký và chứng nhận công khai'],
          ['03', 'Đối chiếu hồ sơ', 'Sử dụng dữ liệu rõ ràng hơn với người mua, đối tác và cơ quan liên quan']
        ]
      : [
          ['01', 'Chuẩn hóa dữ liệu', 'Đồng bộ tên HTX, sản phẩm và thông tin nhận diện trên một nền tảng'],
          ['02', 'Mở QR truy xuất', 'Xem vùng trồng, nhật ký và chứng nhận theo phạm vi công khai'],
          ['03', 'Kết nối tiêu thụ', 'Công khai dữ liệu sản phẩm để hỗ trợ kênh tiêu thụ phù hợp']
        ];
  const featureCards = isInternal
    ? [
        ['Hồ sơ thành viên', 'Lưu trữ tập trung thông tin xã viên, trạng thái tham gia và dữ liệu quản trị cần thiết.', Users],
        ['Thu chi - xuất nhập', 'Theo dõi các khoản thu chi, nhập xuất và lịch sử biến động phục vụ đối soát nội bộ.', Boxes],
        ['Kết nối dữ liệu sản phẩm', 'Khi cần công khai hoặc truy xuất, dữ liệu thực tế sẽ được đồng bộ sang AGRIPASSPORT.', QrCode]
      ]
    : isPassport
      ? [
          ['QR truy xuất rõ ràng', 'Mỗi mã QR dẫn tới một hồ sơ số có vùng trồng, nhật ký và chứng nhận công khai.', QrCode],
          ['Nguồn gốc minh bạch', 'Người mua và đối tác xem dữ liệu theo đúng phạm vi mà HTX đã phê duyệt.', BadgeCheck],
          ['Dữ liệu từ AGRIPASSPORT', 'Hồ sơ số được tạo từ dữ liệu sản phẩm đã chuẩn hóa trên nền tảng trung tâm.', ShoppingBag]
        ]
      : [
          ['Minh bạch nguồn gốc', 'QR truy xuất giúp người mua kiểm tra nhật ký, vùng trồng và chứng nhận công khai.', QrCode],
          ['Công khai sản phẩm', 'Dữ liệu sản phẩm, hợp tác xã và thông tin nhận diện được trình bày đồng bộ hơn.', ShoppingBag],
          ['Kết nối tiêu thụ', 'Sản phẩm có thể được dùng cho các kênh công khai và kết nối tiêu thụ phù hợp.', BadgeCheck]
        ];
  const internalFlow = [
    ['Bước 1', 'HTXONLINE', 'Hợp tác xã quản lý thông tin thành viên, dịch vụ và hoạt động nội bộ trên HTXONLINE.'],
    ['Bước 2', 'Danh mục thực tế', 'Hợp tác xã xác định danh mục sản phẩm thực tế cần số hóa và công khai.'],
    ['Bước 3', 'AGRIPASSPORT', 'Dữ liệu sản phẩm được đưa lên AGRIPASSPORT để thống nhất tên HTX, chủ thể và tên sản phẩm.'],
    ['Bước 4', 'Truy xuất', 'Bổ sung vùng trồng, nhật ký, chứng nhận và các dữ liệu truy xuất phù hợp trên AGRIPASSPORT.'],
    ['Bước 5', 'Hộ chiếu số', 'Tạo QR và hồ sơ số gắn với sản phẩm hoặc lô sản phẩm trên HỘ CHIẾU NÔNG NGHIỆP.'],
    ['Bước 6', 'Công khai - kết nối', 'Người mua hoặc đối tác quét QR để xem thông tin được phép công khai và kết nối tiêu thụ phù hợp.']
  ] as const;
  const newsDescription = isInternal
    ? 'Tin về vận hành HTX, chuẩn hóa dữ liệu và chuyển đổi số nội bộ từ đội triển khai.'
    : isPassport
      ? 'Tin về truy xuất, hồ sơ số và chuẩn hóa dữ liệu công khai cho sản phẩm nông nghiệp.'
      : 'Tin về sản phẩm, truy xuất, thị trường và chuẩn hóa dữ liệu nông nghiệp từ đội vận hành.';

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
              'relative grid items-start gap-3.5 pb-4 pt-3.5 sm:gap-10 sm:py-12 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[0.95fr_1.05fr] lg:py-12'
            )}
          >
            <div className="space-y-3 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-leaf/10 bg-white/88 px-3 py-1.5 text-[0.7rem] font-semibold text-leaf shadow-sm backdrop-blur sm:text-sm">
                <Leaf size={16} aria-hidden="true" />
                {siteProfile.pageContent.homeBadge}
              </div>

              <h1 className="max-w-[19ch] text-[1.36rem] font-bold leading-[1.06] tracking-normal text-ink min-[390px]:text-[1.48rem] sm:max-w-3xl sm:text-[3.35rem] sm:leading-[0.98] lg:text-[3.15rem] xl:text-[3.35rem]">
                {siteProfile.pageContent.homeTitle}
              </h1>

              <p className="max-w-[24.5rem] text-[0.86rem] leading-[1.52] text-slate-700 sm:max-w-2xl sm:text-[1.05rem] sm:leading-8">
                {siteProfile.pageContent.homeDescription}
              </p>

              <div className="max-w-[24.5rem] rounded-[1.1rem] border border-white/85 bg-white/74 p-1.5 shadow-[0_14px_30px_rgba(148,163,184,0.12)] backdrop-blur sm:max-w-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                <div className="grid gap-2 min-[430px]:grid-cols-[1.06fr_0.94fr] sm:flex sm:flex-wrap">
                  <Link href={primaryCta.href} className="inline-flex sm:w-auto">
                    <Button className="min-h-[2.7rem] w-full justify-center whitespace-nowrap rounded-[0.95rem] px-4 text-[0.88rem] shadow-[0_14px_28px_rgba(47,132,81,0.22)] sm:min-h-12 sm:w-auto sm:px-5">
                      {primaryCta.label}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                  </Link>
                  {secondaryCta.external ? (
                    <a href={secondaryCta.href} className="inline-flex sm:w-auto">
                      <Button
                        variant="ghost"
                        className="min-h-[2.7rem] w-full whitespace-nowrap justify-center rounded-[0.95rem] border border-leaf/10 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf7_100%)] px-4 text-[0.88rem] font-semibold text-leaf shadow-[0_12px_24px_rgba(148,163,184,0.12)] ring-1 ring-white/85 hover:border-leaf/30 hover:bg-[#f7fbf8] hover:text-leaf sm:min-h-12 sm:w-auto sm:px-5"
                      >
                        {secondaryCta.label}
                      </Button>
                    </a>
                  ) : (
                    <Link href={secondaryCta.href} className="inline-flex sm:w-auto">
                      <Button
                        variant="ghost"
                        className="min-h-[2.7rem] w-full whitespace-nowrap justify-center rounded-[0.95rem] border border-leaf/10 bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf7_100%)] px-4 text-[0.88rem] font-semibold text-leaf shadow-[0_12px_24px_rgba(148,163,184,0.12)] ring-1 ring-white/85 hover:border-leaf/30 hover:bg-[#f7fbf8] hover:text-leaf sm:min-h-12 sm:w-auto sm:px-5"
                      >
                        {secondaryCta.label}
                      </Button>
                    </Link>
                  )}
                </div>
                <p className="mt-2 px-1 text-[0.72rem] leading-5 text-slate-500 sm:hidden">{heroNote}</p>
              </div>

              {!isInternal ? (
                <div className="max-w-2xl rounded-[1.2rem] border border-white/70 bg-white/82 p-1.5 shadow-[0_18px_44px_rgba(47,132,81,0.08)] backdrop-blur sm:p-2">
                  <PublicSearch placeholder={isPassport ? 'Tìm hồ sơ có QR, sản phẩm hoặc HTX' : 'Tìm sản phẩm, HTX, vùng trồng'} />
                </div>
              ) : null}

              <div className="grid gap-1.5 sm:max-w-2xl sm:grid-cols-3 lg:max-w-xl">
                {heroSignals.map((item) => (
                  <div key={item} className="rounded-[0.95rem] border border-white/80 bg-white/80 px-3 py-2.5 text-[0.78rem] leading-[1.42] text-slate-700 shadow-sm backdrop-blur sm:text-[0.95rem] sm:leading-[1.62]">
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
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/74">{spotlightLabel}</p>
                    <h2 className="mt-1.5 text-[1.28rem] font-bold leading-[1.08]">{spotlightTitle}</h2>
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
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/75 bg-white/82 p-4 shadow-[0_28px_80px_rgba(25,58,40,0.14)] backdrop-blur">
                <div className="mb-3 overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/70 p-2">
                  <PublicImage
                    src={siteProfile.pageContent.homeImageUrl}
                    alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
                    wrapperClassName="aspect-[16/10] rounded-[1.1rem]"
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="rounded-[1.45rem] bg-[linear-gradient(145deg,#1f5f3d_0%,#2f8451_52%,#4f9b65_100%)] p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/74">{spotlightLabel}</p>
                      <h2 className="mt-2 max-w-md text-[1.65rem] font-bold leading-tight">{spotlightTitle}</h2>
                    </div>
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                      <Sparkles size={20} aria-hidden="true" className="text-mint" />
                    </span>
                  </div>

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                    {stats.map(([title, value, Icon]) => (
                      <div key={String(title)} className="rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/12">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/14 text-mint">
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/72">{String(title)}</p>
                        <p className="mt-1 text-2xl font-bold">{String(value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-[1.35rem] bg-black/12 p-3.5 ring-1 ring-white/10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/84">
                      <BadgeCheck size={16} aria-hidden="true" />
                      {isInternal ? 'Luồng đồng bộ nhiều lớp rõ ràng hơn' : isPassport ? 'Hành trình tra cứu rõ ràng hơn' : 'Luồng dữ liệu và công khai rõ ràng hơn'}
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                      {spotlightSteps.map(([step, title, text]) => (
                        <div key={title} className="rounded-2xl bg-white/10 p-3.5">
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

        {isInternal ? (
          <>
            <PublicSection>
              <PublicSectionHeader
                title="Những lớp dữ liệu trọng tâm của HTXONLINE"
                description="Bám theo tài liệu mô tả: thành viên, dịch vụ, thu chi, xuất nhập và dữ liệu vận hành nội bộ phải được quản lý tập trung trước khi công khai sản phẩm."
              />
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {featureCards.map(([title, text, Icon]) => (
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
                title="Luồng kết nối giữa HTXONLINE, AGRIPASSPORT và HỘ CHIẾU NÔNG NGHIỆP"
                description="Dữ liệu nội bộ không đứng riêng lẻ: nó là đầu vào để chuẩn hóa sản phẩm, tạo hồ sơ QR và phục vụ công khai đúng vai trò từng hệ thống."
              />
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {internalFlow.map(([step, title, text]) => (
                  <Panel key={step} className="h-full p-4 sm:p-5">
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-leaf/80">{step}</p>
                    <h3 className="mt-2 text-lg font-bold text-ink">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                  </Panel>
                ))}
              </div>
            </PublicSection>
          </>
        ) : (
          <>
            <PublicSection>
              <PublicSectionHeader
                title={isPassport ? 'Sản phẩm đang có QR hoặc hồ sơ công khai' : 'Sản phẩm nổi bật'}
                description={isPassport ? 'Ưu tiên những sản phẩm đã có lớp truy xuất rõ ràng để người mua tra cứu nhanh hơn.' : 'Dữ liệu sản phẩm nông nghiệp đang được công khai từ các HTX trên hệ thống.'}
                href="/san-pham"
                linkLabel="Xem tất cả"
              />
              {featuredProducts.length ? (
                <ProductSlider products={featuredProducts} />
              ) : (
                <div className="mt-5">
                  <EmptyPublicState
                    title={isPassport ? 'Chưa có sản phẩm có QR công khai' : 'Chưa có sản phẩm công khai'}
                    description={isPassport ? 'Khi HTX tạo QR và mở phạm vi công khai, hồ sơ sẽ xuất hiện tại đây.' : 'Khi HTX công khai dữ liệu sản phẩm, sản phẩm sẽ xuất hiện tại đây.'}
                  />
                </div>
              )}
            </PublicSection>

            <PublicSection band>
              <PublicSectionHeader
                title={isPassport ? 'Hợp tác xã đang có hồ sơ truy xuất' : 'HTX nổi bật'}
                description={isPassport ? 'Những HTX đã có sản phẩm, QR hoặc dữ liệu công khai phục vụ truy xuất.' : 'Hồ sơ HTX đang có dữ liệu sản phẩm công khai.'}
                href="/htx"
                linkLabel="Xem HTX"
              />
              {featuredCooperatives.length ? (
                <div className="mt-5 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
                  {featuredCooperatives.map((cooperative, index) => (
                    <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 3} />
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyPublicState
                    title={isPassport ? 'Chưa có HTX công khai hồ sơ truy xuất' : 'Chưa có HTX công khai'}
                    description={isPassport ? 'HTX sẽ xuất hiện khi đã có sản phẩm hoặc QR được mở công khai.' : 'HTX sẽ xuất hiện khi có dữ liệu sản phẩm được đăng công khai.'}
                  />
                </div>
              )}
            </PublicSection>
          </>
        )}

        <PublicSection>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map(([title, text, Icon]) => (
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
          <PublicSectionHeader title="Tin tức mới nhất" description={newsDescription} href="/tin-tuc" linkLabel="Xem tin tức" />
          {news.data.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {news.data.map((article, index) => (
                <NewsCard key={article.id} article={article} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có tin tức công khai" description="Tin tức do đội vận hành đăng sẽ xuất hiện tại đây." />
            </div>
          )}
        </PublicSection>
      </main>
    </PublicShell>
  );
}
