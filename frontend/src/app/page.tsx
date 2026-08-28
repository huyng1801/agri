import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Boxes, Leaf, QrCode, ShoppingBag, Store, Users, type LucideIcon } from 'lucide-react';
import { ProductSlider } from '@/components/product-slider';
import { CooperativeCard, EmptyPublicState, NewsCard, PublicSearch } from '@/components/public-marketplace';
import { PublicEcosystemShowcase } from '@/components/public-ecosystem-showcase';
import { PublicImage } from '@/components/public-image';
import { PublicSection, PublicSectionHeader, publicCardClass, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { cn } from '@/components/ui';
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

type HighlightTile = {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

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
  const heroSignals = isInternal
    ? [
        'Tập trung hồ sơ xã viên, lịch sử tham gia và các dịch vụ nội bộ trên cùng một lớp dữ liệu.',
        'Theo dõi thu chi, xuất nhập và các báo cáo quản trị mà không phải gom dữ liệu thủ công.',
        'Khi cần công khai sản phẩm hoặc tạo QR, dữ liệu thực được đồng bộ sang AGRIPASSPORT.'
      ]
    : isPassport
      ? [
          'Mỗi QR mở ra một hồ sơ số rõ vùng trồng, nhật ký và chứng nhận theo phạm vi công khai.',
          'Ưu tiên trải nghiệm tra cứu nhanh, rõ và đáng tin trên điện thoại cho người mua cuối.',
          'Dữ liệu hồ sơ được sinh từ lớp sản phẩm đã chuẩn hóa trên AGRIPASSPORT.'
        ]
      : [
          'Chuẩn hóa tên HTX, sản phẩm, vùng trồng và thông tin truy xuất trên cùng một nền tảng.',
          'Mở kênh công khai, đặt hàng và giỏ hàng mà không cần dựng thêm website riêng cho mỗi HTX.',
          'Liên kết sang Hộ chiếu nông nghiệp khi người mua cần tra cứu sâu hơn bằng QR.'
        ];
  const stats: Array<[string, string | number, LucideIcon]> = isInternal
    ? [
        ['Thành viên', 'Hồ sơ tập trung', Users],
        ['Vận hành', 'Thu chi - xuất nhập', Boxes],
        ['Kết nối', 'Sang AGRIPASSPORT', QrCode]
      ]
    : isPassport
      ? [
          ['QR công khai', 'Mở nhanh', QrCode],
          ['Hồ sơ số', featuredProducts.length, ShoppingBag],
          ['Độ tin cậy', 'Theo phạm vi duyệt', BadgeCheck]
        ]
      : [
          ['Sản phẩm công khai', catalog.totalProducts, ShoppingBag],
          ['HTX hiển thị', catalog.cooperatives.length, Store],
          ['QR truy xuất', 'Mở nhanh', QrCode]
        ];
  const heroTiles: HighlightTile[] = stats.map(([label, value, icon], index) => ({
    label: String(label),
    value,
    description: heroSignals[index] ?? '',
    icon
  }));
  const featureCards = isInternal
    ? [
        ['Hồ sơ thành viên', 'Lưu trữ tập trung thông tin xã viên, trạng thái tham gia và lịch sử sử dụng dịch vụ quan trọng.', Users],
        ['Thu chi - xuất nhập', 'Theo dõi khoản thu chi, biến động nhập xuất và tình hình vận hành nội bộ của hợp tác xã.', Boxes],
        ['Đồng bộ sản phẩm', 'Khi cần đưa sản phẩm ra ngoài thị trường hoặc tạo QR, dữ liệu được đẩy sang AGRIPASSPORT.', QrCode]
      ]
    : isPassport
      ? [
          ['QR truy xuất rõ ràng', 'Mỗi mã QR dẫn tới một hồ sơ số công khai gọn, dễ đọc và phù hợp cho màn hình điện thoại.', QrCode],
          ['Nguồn gốc minh bạch', 'Người mua và đối tác có thể xem vùng trồng, nhật ký và chứng nhận theo đúng phạm vi HTX mở.', BadgeCheck],
          ['Kết nối dữ liệu trung tâm', 'Hồ sơ số lấy dữ liệu từ AGRIPASSPORT để đảm bảo một nguồn dữ liệu thống nhất.', ShoppingBag]
        ]
      : [
          ['Chuẩn hóa danh mục', 'Tên HTX, sản phẩm, vùng trồng và dữ liệu nhận diện được quản lý thống nhất trước khi công khai.', ShoppingBag],
          ['Bán hàng và công khai', 'Sản phẩm, giỏ hàng và thông tin HTX được trình bày rõ ràng hơn để tăng khả năng ra quyết định.', Store],
          ['Liên kết QR truy xuất', 'Khi cần truy xuất sâu hơn, mỗi sản phẩm có thể mở sang hồ sơ số trên Hộ chiếu nông nghiệp.', QrCode]
        ];
  const journeyCards = isInternal
    ? [
        ['Bước 1', 'HTXONLINE', 'Quản lý xã viên, dịch vụ và dữ liệu vận hành nội bộ của hợp tác xã.'],
        ['Bước 2', 'Xác định sản phẩm thực', 'Chọn những sản phẩm hoặc lô sản phẩm cần số hóa và công khai ra bên ngoài.'],
        ['Bước 3', 'Đồng bộ sang AGRIPASSPORT', 'Chuẩn hóa tên sản phẩm, hình ảnh, vùng trồng và thông tin bán hàng trên nền tảng trung tâm.'],
        ['Bước 4', 'Mở Hộ chiếu nông nghiệp', 'Sinh QR và hồ sơ số để truy xuất minh bạch khi cần làm thị trường hoặc hồ sơ.']
      ]
    : isPassport
      ? [
          ['Bước 1', 'Chuẩn hóa dữ liệu gốc', 'Sản phẩm được tạo và duyệt từ lớp dữ liệu trung tâm trước khi sinh hồ sơ công khai.'],
          ['Bước 2', 'Tạo hồ sơ số', 'QR liên kết trực tiếp tới vùng trồng, nhật ký, chứng nhận và dữ liệu nền tảng đã cho phép hiển thị.'],
          ['Bước 3', 'Người mua tra cứu', 'Điện thoại mở ra một hành trình truy xuất gọn, rõ và ít thao tác hơn.']
        ]
      : [
          ['Bước 1', 'Chuẩn hóa HTX và sản phẩm', 'Thiết lập dữ liệu nhận diện, tên gọi, hình ảnh và thông tin cần công khai trên cùng hệ thống.'],
          ['Bước 2', 'Đăng lên AGRIPASSPORT', 'Mở kênh công khai sản phẩm, giỏ hàng và nội dung giới thiệu HTX cho thị trường.'],
          ['Bước 3', 'Liên kết QR', 'Khi người mua cần xem sâu hơn, sản phẩm tiếp tục mở sang Hộ chiếu nông nghiệp.']
        ];
  const newsDescription = isInternal
    ? 'Tin về vận hành HTX, số hóa nội bộ và kinh nghiệm triển khai thực tế từ đội vận hành.'
    : isPassport
      ? 'Tin về truy xuất, hồ sơ số và chuẩn hóa dữ liệu công khai cho sản phẩm nông nghiệp.'
      : 'Tin về sản phẩm, truy xuất, thị trường và chuẩn hóa dữ liệu nông nghiệp từ đội vận hành.';
  const heroNote = isInternal
    ? 'HTXONLINE là lớp quản trị nội bộ. Khi cần công khai hoặc truy xuất, dữ liệu sẽ được đẩy sang AGRIPASSPORT và Hộ chiếu nông nghiệp theo đúng vai trò.'
    : isPassport
      ? 'Hộ chiếu nông nghiệp ưu tiên trải nghiệm truy xuất cho người mua, còn dữ liệu gốc vẫn được chuẩn hóa từ AGRIPASSPORT.'
      : 'AGRIPASSPORT là lớp trung tâm của hệ sinh thái, kết nối dữ liệu sản phẩm, công khai bán hàng và QR truy xuất.';
  const sectionIntro = isInternal
    ? 'Các khối chức năng quan trọng của HTXONLINE'
    : isPassport
      ? 'Giải pháp dịch vụ tiêu biểu cho truy xuất và hồ sơ số'
      : 'Giải pháp dịch vụ tiêu biểu cho dữ liệu sản phẩm và bán hàng';
  const sectionDescription = isInternal
    ? 'Bám sát đúng mô tả nghiệp vụ: thành viên, dịch vụ, thu chi, xuất nhập và đồng bộ ra lớp công khai khi cần.'
    : isPassport
      ? 'Thay vì dồn hết thông tin vào một màn hình, bố cục mới ưu tiên hành trình quét QR, đọc nhanh và hiểu đúng.'
      : 'Theo hướng trình bày gần Demeter hơn: rõ khối chức năng, card lớn và hành trình công khai bám sát người dùng cuối.';
  const journeyTitle = isInternal ? 'Luồng dữ liệu từ quản trị nội bộ ra thị trường' : 'Luồng triển khai từ dữ liệu gốc đến người mua';
  const journeyDescription = isInternal
    ? 'HTXONLINE đứng ở lớp đầu vào, AGRIPASSPORT là lớp công khai trung tâm và Hộ chiếu nông nghiệp là lớp truy xuất minh bạch.'
    : 'Ba nền tảng không chồng lấn vai trò; chúng nối tiếp nhau để tạo một hành trình dữ liệu rõ ràng hơn.';
  const heroSearchPlaceholder = isPassport ? 'Tìm hồ sơ có QR, sản phẩm hoặc HTX' : 'Tìm sản phẩm, HTX hoặc vùng trồng';
  const closingPrimaryCta = isInternal
    ? { href: '/lien-he', label: 'Nhận tư vấn triển khai', external: false }
    : isPassport
      ? { href: '/san-pham?hasQr=true', label: 'Mở danh mục QR', external: false }
      : { href: '/san-pham', label: 'Tới danh mục công khai', external: false };
  const closingSecondaryCta = isInternal
    ? { href: marketplaceUrl('/'), label: 'Mở AGRIPASSPORT', external: true }
    : { href: '/lien-he', label: 'Liên hệ đội vận hành', external: false };
  const ecosystemTitle = isInternal ? 'Ba lớp hệ thống trong hệ sinh thái Agri' : 'Giải pháp dịch vụ tiêu biểu';
  const ecosystemDescription = isInternal
    ? 'HTXONLINE quản trị nội bộ, AGRIPASSPORT công khai dữ liệu trung tâm và Hộ chiếu nông nghiệp phụ trách lớp truy xuất QR.'
    : 'Kéo giao diện về nhịp card lớn, nền sáng và phân vai rõ như một landing page mobile-first dễ quét hơn.';

  return (
    <PublicShell>
      <main id="main-content">
        <section className="border-b border-[#ece8dd] bg-[linear-gradient(180deg,#f2f7ef_0%,#ffffff_56%,#ffffff_100%)]">
          <div className={cn(publicContainerClass, 'py-4 sm:py-6 lg:py-8')}>
            <div className="overflow-hidden rounded-[2.2rem] border border-[#e8e4d8] bg-white/95 shadow-[0_30px_72px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:p-8">
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe9dc] bg-[#f6fbf3] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                    <Leaf size={15} aria-hidden="true" className="text-[#1f9b4b]" />
                    {siteProfile.pageContent.homeBadge}
                  </div>

                  <h1 className="mt-4 max-w-[11ch] text-[2.5rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#1f2233] sm:text-[3.35rem] lg:text-[4.2rem]">
                    {siteProfile.pageContent.homeTitle}
                  </h1>
                  <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
                    {siteProfile.pageContent.homeDescription}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={primaryCta.href}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f9b4b] px-6 text-sm font-bold text-white shadow-[0_16px_34px_rgba(31,155,75,0.22)] transition hover:-translate-y-0.5"
                    >
                      {primaryCta.label}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                    {secondaryCta.external ? (
                      <a
                        href={secondaryCta.href}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#dbe7da] bg-white px-6 text-sm font-bold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                      >
                        {secondaryCta.label}
                      </a>
                    ) : (
                      <Link
                        href={secondaryCta.href}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#dbe7da] bg-white px-6 text-sm font-bold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                      >
                        {secondaryCta.label}
                      </Link>
                    )}
                  </div>

                  {!isInternal ? (
                    <div className="mt-5 max-w-xl rounded-[1.7rem] border border-[#e0e9dc] bg-[#f8fbf6] p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                      <PublicSearch placeholder={heroSearchPlaceholder} />
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {heroSignals.map((signal, index) => (
                      <article key={signal} className="rounded-[1.45rem] border border-[#e7e3d7] bg-[#fbfaf6] px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.04)]">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">0{index + 1}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{signal}</p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.65rem] border border-[#dfe9dc] bg-[linear-gradient(135deg,#f7fbf4_0%,#edf6ef_100%)] px-4 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">Vai trò nền tảng</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{heroNote}</p>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <div className="rounded-[2rem] border border-[#e5eadf] bg-[linear-gradient(180deg,#f8fbf5_0%,#f3f8f1_100%)] p-3 shadow-[0_24px_58px_rgba(15,23,42,0.08)] sm:p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex min-h-10 items-center rounded-full border border-[#d9e7d6] bg-white px-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">
                        {siteProfile.appName}
                      </span>
                      <span className="inline-flex min-h-10 items-center rounded-full border border-[#d9e7d6] bg-white px-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Hệ sinh thái Agri
                      </span>
                    </div>

                    <div className="relative mt-3 overflow-hidden rounded-[1.8rem] border border-[#dbe6d9] bg-white shadow-[0_20px_42px_rgba(15,23,42,0.08)]">
                      <PublicImage
                        src={siteProfile.pageContent.homeImageUrl}
                        alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
                        wrapperClassName="aspect-[5/4] sm:aspect-[16/10] lg:aspect-[5/4]"
                        className="h-full w-full object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.14)_100%)]" />
                      <div className="absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-white/80 bg-white/88 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e] shadow-sm backdrop-blur">
                          Luồng dữ liệu số
                        </span>
                      </div>
                      <div className="absolute inset-x-4 bottom-4 rounded-[1.6rem] border border-white/75 bg-white/92 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.1)] backdrop-blur">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{heroTiles[0].label}</p>
                        <p className="mt-1 text-[1.2rem] font-extrabold leading-tight text-[#1f2233]">{String(heroTiles[0].value)}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{heroTiles[0].description}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {heroTiles.slice(1).map((tile) => {
                        const Icon = tile.icon;
                        return (
                          <article key={tile.label} className="rounded-[1.55rem] border border-[#e7e3d7] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                            <div className="flex items-start gap-3">
                              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eef7ef] text-[#1f9b4b]">
                                <Icon size={20} aria-hidden="true" />
                              </span>
                              <div>
                                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{tile.label}</p>
                                <p className="mt-1 text-[1.08rem] font-extrabold leading-tight text-[#1f2233]">{String(tile.value)}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{tile.description}</p>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-[#ece8dd] bg-[#fbfaf6] px-4 py-4 sm:grid-cols-3 sm:px-6 sm:py-5">
                {featureCards.map(([title, text, Icon], index) => (
                  <article key={String(title)} className="rounded-[1.55rem] border border-[#e7e3d7] bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">0{index + 1}</p>
                        <p className="mt-2 text-[1.08rem] font-extrabold leading-tight text-[#1f2233]">{String(title)}</p>
                      </div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef7ef] text-[#1f9b4b]">
                        <Icon size={19} aria-hidden="true" />
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{String(text)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PublicSection band>
          <PublicSectionHeader title={ecosystemTitle} description={ecosystemDescription} />
          <div className="mt-6">
            <PublicEcosystemShowcase siteKey={siteKey} showHeading={false} />
          </div>
        </PublicSection>

        <PublicSection>
          <PublicSectionHeader title={sectionIntro} description={sectionDescription} />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featureCards.map(([title, text, Icon], index) => (
              <article key={String(title)} className={cn(publicCardClass, 'flex h-full flex-col rounded-[2rem] p-5 sm:p-6')}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">0{index + 1}</span>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#eef7ef] text-[#1f9b4b]">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                </div>
                <h2 className="mt-5 text-[1.22rem] font-extrabold leading-tight tracking-[-0.02em] text-[#1f2233] sm:text-[1.38rem]">{String(title)}</h2>
                <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">{String(text)}</p>
              </article>
            ))}
          </div>
        </PublicSection>

        <PublicSection>
          <PublicSectionHeader title={journeyTitle} description={journeyDescription} />
          <div className={cn('mt-6 grid gap-4', isInternal ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3')}>
            {journeyCards.map(([step, title, text]) => (
              <article key={`${step}-${title}`} className={cn(publicCardClass, 'h-full rounded-[2rem] p-5 sm:p-6')}>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{step}</p>
                <h2 className="mt-3 text-[1.12rem] font-extrabold leading-tight tracking-[-0.02em] text-[#1f2233] sm:text-[1.28rem]">{title}</h2>
                <p className="mt-3 text-[0.92rem] leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </PublicSection>

        {!isInternal ? (
          <>
            <PublicSection band>
              <PublicSectionHeader
                title={isPassport ? 'Sản phẩm đang có QR hoặc hồ sơ công khai' : 'Sản phẩm nổi bật'}
                description={
                  isPassport
                    ? 'Ưu tiên những sản phẩm đã có lớp truy xuất rõ ràng để người mua tra cứu nhanh hơn.'
                    : 'Giữ nhịp lướt nhanh trên mobile nhưng trình bày gọn và thoáng hơn theo hướng landing page hiện đại.'
                }
                href="/san-pham"
                linkLabel="Xem tất cả"
              />
              {featuredProducts.length ? (
                <div className="mt-6">
                  <ProductSlider products={featuredProducts} />
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyPublicState
                    title={isPassport ? 'Chưa có sản phẩm có QR công khai' : 'Chưa có sản phẩm công khai'}
                    description={isPassport ? 'Khi HTX tạo QR và mở phạm vi công khai, hồ sơ sẽ xuất hiện tại đây.' : 'Khi HTX công khai dữ liệu sản phẩm, sản phẩm sẽ xuất hiện tại đây.'}
                  />
                </div>
              )}
            </PublicSection>

            <PublicSection>
              <PublicSectionHeader
                title={isPassport ? 'HTX đang có hồ sơ truy xuất' : 'HTX tiêu biểu trong hệ sinh thái'}
                description={
                  isPassport
                    ? 'Những HTX đã có sản phẩm, QR hoặc dữ liệu công khai phục vụ truy xuất.'
                    : 'Thay cho cảm giác danh sách khô, phần này được giữ thoáng hơn để đóng vai trò gần với cụm đối tác trên landing page.'
                }
                href="/htx"
                linkLabel="Xem HTX"
              />
              {featuredCooperatives.length ? (
                <div className="mt-6 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
                  {featuredCooperatives.map((cooperative, index) => (
                    <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 3} />
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyPublicState
                    title={isPassport ? 'Chưa có HTX công khai hồ sơ truy xuất' : 'Chưa có HTX công khai'}
                    description={isPassport ? 'HTX sẽ xuất hiện khi đã có sản phẩm hoặc QR được mở công khai.' : 'HTX sẽ xuất hiện khi có dữ liệu sản phẩm được đăng công khai.'}
                  />
                </div>
              )}
            </PublicSection>
          </>
        ) : null}

        <PublicSection band>
          <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#1d7f3e_0%,#25a34d_55%,#2db95a_100%)] px-5 py-6 text-white shadow-[0_28px_60px_rgba(31,155,75,0.2)] sm:px-7 sm:py-8">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/78">Tối ưu trải nghiệm công khai</p>
                <h2 className="mt-2 text-[1.8rem] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[2.5rem]">
                  Giao diện public đang được dựng lại theo hướng gần landing page native hơn, gọn hơn và dễ hiểu hơn.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href={closingPrimaryCta.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#1f9b4b] shadow-[0_16px_32px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
                >
                  {closingPrimaryCta.label}
                </Link>
                {closingSecondaryCta.external ? (
                  <a
                    href={closingSecondaryCta.href}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/22 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/16"
                  >
                    {closingSecondaryCta.label}
                  </a>
                ) : (
                  <Link
                    href={closingSecondaryCta.href}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/22 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/16"
                  >
                    {closingSecondaryCta.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </PublicSection>

        <PublicSection>
          <PublicSectionHeader title="Tin tức mới nhất" description={newsDescription} href="/tin-tuc" linkLabel="Xem tin tức" />
          {news.data.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {news.data.map((article, index) => (
                <NewsCard key={article.id} article={article} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPublicState title="Chưa có tin tức công khai" description="Tin tức do đội vận hành đăng sẽ xuất hiện tại đây." />
            </div>
          )}
        </PublicSection>
      </main>
    </PublicShell>
  );
}
