import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Boxes, Leaf, QrCode, ShoppingBag, Store, Users, type LucideIcon } from 'lucide-react';
import { ProductSlider } from '@/components/product-slider';
import { EmptyPublicState, NewsCard, PublicSearch } from '@/components/public-marketplace';
import { PublicEcosystemShowcase } from '@/components/public-ecosystem-showcase';
import { PublicImage } from '@/components/public-image';
import { PublicSection, publicCardClass, publicContainerClass } from '@/components/public-layout';
import { PublicLogo } from '@/components/public-logo';
import { PublicOutcomeShowcase, type PublicOutcomeSlide } from '@/components/public-outcome-showcase';
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

type OutcomeTile = {
  title: string;
  value: string;
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
  const featureCards: Array<[string, string, LucideIcon]> = isInternal
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
    ? 'Giải pháp dịch vụ tiêu biểu'
    : isPassport
      ? 'Giải pháp dịch vụ tiêu biểu cho truy xuất và hồ sơ số'
      : 'Giải pháp dịch vụ tiêu biểu cho dữ liệu sản phẩm và bán hàng';
  const sectionDescription = isInternal
    ? 'Giữ vai trò đầu vào dữ liệu, nhưng giao diện public được kéo về nhịp sáng và card ngang như một landing page dịch vụ mobile-first.'
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

  const heroLeadTitle = isInternal
    ? 'Luồng dữ liệu rõ ràng cho hợp tác xã'
    : isPassport
      ? 'HỘ CHIẾU NÔNG NGHIỆP giúp tra cứu QR rõ ràng hơn trên điện thoại'
      : 'AGRIPASSPORT chuẩn hóa dữ liệu và công khai sản phẩm nông nghiệp';
  const heroLeadDescription = isInternal
    ? 'Giữ lớp quản trị nội bộ cho xã viên, dịch vụ và vận hành, nhưng vẫn mở được một giao diện public sáng, thoáng và dễ hiểu khi cần kết nối thị trường.'
    : isPassport
      ? 'Tập trung vào trải nghiệm quét mã, mở hồ sơ số và đọc nhanh những thông tin công khai quan trọng nhất trên di động.'
      : 'Đưa HTX, sản phẩm, vùng trồng và QR truy xuất lên cùng một mặt bằng dữ liệu để công khai bán hàng rõ ràng hơn.';
  const outcomeTitle = isInternal ? 'Vận hành rõ ràng cùng hợp tác xã' : 'Thắng lợi cùng nhà nông';
  const outcomeDescription = isInternal
    ? 'Giữ đúng bản chất HTXONLINE là lớp vận hành nội bộ, nhưng trình bày lợi ích bằng nhịp icon lớn và câu ngắn như landing page dịch vụ.'
    : 'Các tín hiệu quan trọng được kéo về nhịp icon, headline ngắn và khoảng thở lớn để trông gần ứng dụng native hơn trên mobile.';
  const serviceTabs = isInternal
    ? ['Tất cả', 'Quản trị nội bộ', 'Đồng bộ sản phẩm', 'Báo cáo điều hành']
    : isPassport
      ? ['Tất cả', 'QR truy xuất', 'Hồ sơ số', 'Nguồn gốc minh bạch']
      : ['Tất cả', 'Dữ liệu sản phẩm', 'Bán hàng công khai', 'Liên kết QR'];
  const featuredProductCategories = Array.from(
    new Set(
      featuredProducts
        .map((product) => product.category?.name?.trim())
        .filter((name): name is string => Boolean(name))
    )
  ).slice(0, 5);
  const productTabs = featuredProductCategories.length
    ? featuredProductCategories
    : isInternal
      ? ['Nông sản công khai', 'Sản phẩm đã đồng bộ', 'HTX đang hiển thị']
      : isPassport
        ? ['Sản phẩm có QR', 'Hồ sơ công khai', 'Vùng trồng minh bạch']
        : ['Nông sản nổi bật', 'Sản phẩm truy xuất', 'Đặt hàng công khai'];
  const productSectionTitle = isInternal
    ? 'Khám phá các sản phẩm sau lớp quản trị'
    : isPassport
      ? 'Khám phá hồ sơ số và sản phẩm QR'
      : 'Khám phá các sản phẩm';
  const productSectionDescription = isInternal
    ? 'Sau khi HTX quản trị dữ liệu nội bộ và xác định sản phẩm thực, các sản phẩm công khai sẽ hiển thị tại đây để tiếp cận thị trường.'
    : isPassport
      ? 'Ưu tiên những sản phẩm đã có lớp truy xuất rõ ràng để người mua tra cứu nhanh hơn.'
      : 'Giữ nhịp lướt nhanh trên mobile nhưng trình bày gọn và thoáng hơn theo hướng landing page hiện đại.';
  const partnerTitle = isInternal ? 'Đối tác và HTX trong hệ sinh thái' : 'Đối tác công khai trong hệ sinh thái';
  const partnerDescription = isInternal
    ? 'Chuyển từ cụm card nặng sang dải nhận diện gọn hơn, để phần giữa và cuối trang gần nhịp logo-strip của Demeter hơn.'
    : 'Giữ cảm giác một dải nhận diện đối tác gọn, sáng và dễ quét hơn thay vì các card hồ sơ nặng thông tin.';
  const partnerItems = featuredCooperatives.length ? featuredCooperatives : catalog.cooperatives.slice(0, 6);
  const heroPreviewProducts = featuredProducts.slice(0, 3);
  const heroPreviewCooperative = partnerItems[0];
  const serviceAction = isInternal ? '/gioi-thieu' : '/san-pham';
  const internalOutcomeSlides: PublicOutcomeSlide[] = [
    {
      title: 'Hồ sơ xã viên',
      value: '01 nơi theo dõi',
      description: 'Tập trung hồ sơ, lịch sử tham gia và mức độ dùng dịch vụ nội bộ trên cùng một lớp dữ liệu gọn, rõ và dễ kiểm tra hơn.',
      icon: 'users',
      note: 'Giảm thao tác gom nhiều bảng rời khi vận hành hằng ngày.'
    },
    {
      title: 'Thu chi nội bộ',
      value: 'Đối soát gọn hơn',
      description: 'Theo dõi khoản thu chi, lịch sử biến động và các điểm cần kiểm tra mà không phải ghép tay dữ liệu từ nhiều nơi.',
      icon: 'boxes',
      note: 'Giữ nhịp vận hành gọn như một bảng điều phối tập trung.'
    },
    {
      title: 'Xuất nhập',
      value: 'Dữ liệu liền mạch',
      description: 'Biến động nhập xuất và trạng thái vận hành đi cùng một luồng theo dõi duy nhất thay vì chia tách sang nhiều bước thủ công.',
      icon: 'shoppingBag',
      note: 'Giảm rủi ro lệch thông tin giữa quản trị và đầu ra công khai.'
    },
    {
      title: 'Sản phẩm thực',
      value: 'Chọn đúng đầu ra',
      description: 'Khoanh vùng sản phẩm hoặc lô sản phẩm thật sự sẵn sàng để đồng bộ ra AGRIPASSPORT, không phải đưa toàn bộ dữ liệu nội bộ ra ngoài.',
      icon: 'store',
      note: 'Giữ ranh giới rõ giữa quản trị nội bộ và lớp công khai.'
    },
    {
      title: 'Liên kết QR',
      value: 'Sẵn sàng truy xuất',
      description: 'Khi cần minh bạch sâu hơn, dữ liệu đã chuẩn có thể tiếp tục mở sang lớp QR và hồ sơ số mà không phải nhập lại từ đầu.',
      icon: 'qrCode',
      note: 'Tạo cảm giác một hành trình dữ liệu liền mạch hơn cho người dùng cuối.'
    },
    {
      title: 'Kiểm soát minh bạch',
      value: 'Vai trò rõ ràng',
      description: 'Mỗi nền tảng giữ đúng nhiệm vụ để tránh nhập liệu chồng chéo, đồng thời giúp giao diện public sáng và dễ hiểu hơn trên mobile.',
      icon: 'badgeCheck',
      note: 'Đây là khác biệt cốt lõi để hệ sinh thái trông gọn như một app native.'
    }
  ];
  const outcomeTiles: OutcomeTile[] = isPassport
      ? [
          { title: 'QR công khai', value: 'Mở nhanh', description: 'Điện thoại quét mã và vào thẳng hồ sơ số công khai đã được duyệt.', icon: QrCode },
          { title: 'Hồ sơ số', value: `${featuredProducts.length} hồ sơ`, description: 'Tập trung vào sản phẩm đã có lớp truy xuất rõ ràng và dễ đọc.', icon: ShoppingBag },
          { title: 'Nguồn gốc', value: 'Xem theo phạm vi', description: 'Chỉ hiển thị vùng trồng, nhật ký và chứng nhận theo quyền công khai.', icon: BadgeCheck },
          { title: 'Dữ liệu trung tâm', value: 'Một nguồn dữ liệu', description: 'Hồ sơ số lấy dữ liệu từ AGRIPASSPORT để tránh lệch thông tin.', icon: Store },
          { title: 'Trải nghiệm mobile', value: 'Đọc nhanh hơn', description: 'Cấu trúc ưu tiên điện thoại thay vì dồn mọi thứ vào một trang dài.', icon: Users },
          { title: 'Niềm tin thị trường', value: 'Hiểu đúng hơn', description: 'Thông tin quan trọng được sắp lại để người mua ra quyết định nhanh hơn.', icon: Leaf }
        ]
      : [
          { title: 'Sản phẩm công khai', value: `${catalog.totalProducts}+`, description: 'Danh mục công khai được kéo về bố cục dễ quét và dễ so sánh.', icon: ShoppingBag },
          { title: 'HTX hiển thị', value: `${catalog.cooperatives.length} HTX`, description: 'Mỗi HTX có nhận diện rõ hơn thay vì chìm trong một bảng danh sách.', icon: Store },
          { title: 'QR truy xuất', value: 'Mở nhanh', description: 'Khi cần truy xuất sâu hơn, sản phẩm tiếp tục mở sang hồ sơ số.', icon: QrCode },
          { title: 'Dữ liệu chuẩn hóa', value: 'Một mặt bằng dữ liệu', description: 'Tên HTX, vùng trồng và sản phẩm được chuẩn hóa trước khi công khai.', icon: BadgeCheck },
          { title: 'Bán hàng công khai', value: 'Giỏ hàng gọn hơn', description: 'Giữ hành vi lướt, xem và thêm giỏ gần với một app thương mại điện tử.', icon: Boxes },
          { title: 'Niềm tin người mua', value: 'Hiểu nhanh hơn', description: 'Thông tin được sắp theo nhịp card lớn, khoảng thở rộng và CTA rõ hơn.', icon: Users }
        ];
  const heroBannerPanel = (
    <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.1)] backdrop-blur sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">
            {isInternal ? 'Luồng nội bộ ra công khai' : isPassport ? 'Hồ sơ số công khai' : 'Dữ liệu công khai trung tâm'}
          </p>
          <p className="mt-1 text-[1rem] font-extrabold leading-tight text-[#1f2233] sm:text-[1.45rem]">{String(heroTiles[0].value)}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{heroNote}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <Link
            href={primaryCta.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f9b4b] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(31,155,75,0.22)] transition hover:-translate-y-0.5"
          >
            {primaryCta.label}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {secondaryCta.external ? (
            <a
              href={secondaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#dbe7da] bg-white px-5 text-sm font-bold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
            >
              {secondaryCta.label}
            </a>
          ) : (
            <Link
              href={secondaryCta.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#dbe7da] bg-white px-5 text-sm font-bold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const internalHeroSection = (
    <section className="border-b border-[#ece8dd] bg-white">
      <div className={cn(publicContainerClass, 'py-4 sm:py-6 lg:py-8')}>
        <div className="overflow-hidden rounded-[2.1rem] border border-[#e1e8da] bg-white shadow-[0_24px_54px_rgba(15,23,42,0.08)]">
          <div className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#f8fbf6_0%,#ffffff_40%,#eef7fb_100%)]">
            <PublicImage
              src={siteProfile.pageContent.homeImageUrl}
              alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
              wrapperClassName="absolute inset-0 h-full w-full"
              className="h-full w-full object-cover opacity-[0.32]"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,252,246,0.95)_0%,rgba(250,252,246,0.88)_46%,rgba(244,249,252,0.72)_100%)]" />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-90"
              style={{
                background:
                  'radial-gradient(circle at 14% 18%, rgba(255,255,255,0.82), transparent 22%), radial-gradient(circle at 72% 16%, rgba(255,255,255,0.36), transparent 18%), radial-gradient(circle at 88% 78%, rgba(31,155,75,0.12), transparent 18%)'
              }}
            />

            <div className="relative grid grid-cols-[7.7rem_minmax(0,1fr)] items-center gap-4 px-4 py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[16rem_minmax(0,1fr)_15rem] lg:gap-8 lg:px-8 lg:py-10">
              <div className="relative mx-auto w-[6.6rem] sm:w-[11rem] lg:mx-0 lg:w-[15rem]">
                <div className="absolute inset-0 rounded-[2.8rem] bg-[#0d6f80]/16 blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[2.3rem] border-[6px] border-[#1f2738] bg-[#f8fbf7] p-2 shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:p-2.5">
                  <div className="mx-auto mb-2 h-3.5 w-12 rounded-full bg-[#1f2738] sm:h-4 sm:w-16" aria-hidden="true" />
                  <div className="rounded-[1.45rem] bg-[linear-gradient(180deg,#ffffff_0%,#f4faf3_56%,#eef7fb_100%)] p-2.5 sm:rounded-[1.6rem] sm:p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1f2738] shadow-sm sm:h-9 sm:w-9">
                        <PublicLogo size={20} className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.44rem] font-semibold uppercase tracking-[0.14em] text-[#2b8a3e] sm:text-[0.55rem]">Điều phối HTX</p>
                        <p className="truncate text-[0.78rem] font-extrabold text-[#1f2233] sm:text-sm">HTXONLINE</p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-[1.25rem] bg-[linear-gradient(135deg,#108a42_0%,#1f9b4b_100%)] p-2.5 text-white shadow-[0_16px_26px_rgba(31,155,75,0.24)] sm:p-3">
                      <p className="text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-white/78 sm:text-[0.52rem]">Lớp dữ liệu nội bộ</p>
                      <p className="mt-1 text-[0.72rem] font-extrabold leading-tight sm:text-sm">
                        <span className="sm:hidden">Xã viên, thu chi, nhập xuất</span>
                        <span className="hidden sm:inline">Thành viên, dịch vụ, thu chi, xuất nhập</span>
                      </p>
                    </div>

                    <div className="mt-3 hidden gap-2 sm:grid">
                      {heroPreviewProducts.length ? (
                        heroPreviewProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className={cn('flex items-center gap-2 rounded-[1.1rem] border border-[#e0eadf] bg-white/92 p-2.5 shadow-sm', index > 0 && 'hidden lg:flex')}
                          >
                            <PublicImage
                              src={product.thumbnail?.publicUrl}
                              alt={product.name}
                              decorative
                              wrapperClassName="h-10 w-10 shrink-0 rounded-[0.85rem]"
                              className="h-full w-full rounded-[0.85rem] object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[0.66rem] font-bold leading-tight text-[#1f2233] sm:text-[0.74rem]">{product.name}</p>
                              <p className="mt-0.5 truncate text-[0.56rem] font-medium text-slate-500 sm:text-[0.62rem]">{product.cooperative?.name || 'HTX đang vận hành'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.1rem] border border-[#e0eadf] bg-white/92 p-2.5 text-[0.72rem] leading-5 text-slate-600 shadow-sm">
                          Sản phẩm sau khi được chuẩn hóa sẽ đồng bộ sang AGRIPASSPORT để công khai và tạo QR.
                        </div>
                      )}
                    </div>

                    <div className="mt-3 rounded-full border border-[#dfe8dc] bg-white/92 px-3 py-2 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#0f7d63] shadow-sm sm:hidden">
                      Đồng bộ sang AGRI
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <span className="inline-flex min-h-10 items-center rounded-full border border-white/80 bg-white/90 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#0f7d63] shadow-sm backdrop-blur">
                    HTXONLINE
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3d5871]">x</span>
                  <span className="inline-flex min-h-10 items-center rounded-full border border-white/80 bg-white/82 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#0d6f80] shadow-sm backdrop-blur sm:hidden">
                    AGRI
                  </span>
                  <span className="hidden min-h-10 items-center rounded-full border border-white/80 bg-white/82 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#0d6f80] shadow-sm backdrop-blur sm:inline-flex">
                    AGRIPASSPORT
                  </span>
                </div>

                <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#0f7d63] sm:text-[0.74rem]">Hệ sinh thái vận hành số</p>
                <h1 className="mt-3 max-w-[8ch] text-[1.46rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#0d6f80] sm:max-w-none sm:text-[2.7rem] lg:max-w-[11ch] lg:text-[4rem]">
                  Cùng hợp tác xã kiến tạo vận hành số bền vững
                </h1>
                <p className="mt-4 max-w-xl text-[0.9rem] leading-6 text-[#31556d] sm:text-[1.05rem] sm:leading-8">
                  Tập trung quản trị thành viên, dịch vụ, thu chi, xuất nhập rồi đồng bộ dữ liệu sang AGRIPASSPORT khi cần công khai sản phẩm và truy xuất QR.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-start">
                  <Link
                    href={primaryCta.href}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#1f9b4b] px-4 text-[0.86rem] font-bold text-white shadow-[0_14px_28px_rgba(31,155,75,0.22)] transition hover:-translate-y-0.5 sm:w-auto sm:px-6 sm:text-sm"
                  >
                    {primaryCta.label}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  {secondaryCta.external ? (
                    <a
                      href={secondaryCta.href}
                      className="hidden min-h-12 items-center justify-center rounded-full border border-[#d7e6d7] bg-white/92 px-6 text-sm font-bold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] sm:inline-flex"
                    >
                      {secondaryCta.label}
                    </a>
                  ) : (
                    <Link
                      href={secondaryCta.href}
                      className="hidden min-h-12 items-center justify-center rounded-full border border-[#d7e6d7] bg-white/92 px-6 text-sm font-bold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] sm:inline-flex"
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-start gap-2 text-sm text-[#0f7d63] sm:mt-5">
                  <span className="inline-flex min-h-10 items-center rounded-full bg-[#0d6f80] px-4 text-sm font-semibold text-white shadow-sm">
                    {featuredCooperatives.length} HTX đang hiển thị
                  </span>
                  <span className="hidden min-h-10 items-center rounded-full border border-[#d7e6d7] bg-white/88 px-4 font-semibold text-[#31556d] shadow-sm sm:inline-flex">
                    {featuredProducts.length}+ sản phẩm đồng bộ
                  </span>
                  <span className="hidden min-h-10 items-center rounded-full border border-[#d7e6d7] bg-white/88 px-4 font-semibold text-[#31556d] shadow-sm lg:inline-flex">
                    Hotline {siteProfile.hotlineDisplay}
                  </span>
                </div>
              </div>

              <div className="hidden lg:grid lg:gap-4">
                <div className="rounded-[1.8rem] border border-white/70 bg-white/88 p-4 text-left shadow-[0_18px_36px_rgba(15,23,42,0.12)] backdrop-blur">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">03 lớp nền tảng</p>
                  <p className="mt-2 text-[1.8rem] font-extrabold leading-tight text-[#1f9b4b]">1 nguồn dữ liệu</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{heroNote}</p>
                </div>

                <div className="rounded-[1.8rem] border border-white/70 bg-[rgba(19,32,49,0.92)] p-4 text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/70">Điểm triển khai</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/18 bg-white/10">
                      {heroPreviewCooperative ? (
                        <PublicImage
                          src={heroPreviewCooperative.avatarUrl}
                          alt={heroPreviewCooperative.name}
                          decorative
                          wrapperClassName="h-full w-full rounded-full"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PublicLogo size={28} className="h-7 w-7" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{heroPreviewCooperative?.name || 'Hệ sinh thái HTXONLINE'}</p>
                      <p className="mt-1 text-xs leading-5 text-white/72">{heroPreviewCooperative?.province || 'Đồng hành cùng hợp tác xã và sản phẩm địa phương'}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {heroSignals.slice(0, 2).map((signal, index) => (
                      <div key={signal} className="rounded-[1.2rem] border border-white/10 bg-white/8 p-3">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/60">Bước 0{index + 1}</p>
                        <p className="mt-1 text-sm leading-6 text-white/86">{signal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-[#e6eadf] bg-white px-4 py-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {featureCards.map(([title, text, Icon]) => (
              <article key={title} className="rounded-[1.5rem] border border-[#e5eadf] bg-[#fbfcf9] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eef7ee] text-[#1f9b4b] shadow-sm">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-base font-extrabold leading-tight text-[#1f2233]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <PublicShell>
      <main id="main-content">
        {isInternal ? (
          internalHeroSection
        ) : (
          <section className="border-b border-[#ece8dd] bg-[linear-gradient(180deg,#eff6ee_0%,#ffffff_64%,#ffffff_100%)]">
            <div className={cn(publicContainerClass, 'py-4 sm:py-6 lg:py-8')}>
              <div className="overflow-hidden rounded-[1.9rem] border border-[#e2e9da] bg-white shadow-[0_22px_48px_rgba(15,23,42,0.06)] sm:rounded-[2.15rem]">
                <div className="relative isolate overflow-hidden border-b border-[#e5eadf]">
                  <PublicImage
                    src={siteProfile.pageContent.homeImageUrl}
                    alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
                    wrapperClassName="aspect-[16/11] sm:aspect-[18/8] lg:aspect-[21/8]"
                    className="h-full w-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_42%,rgba(9,17,18,0.18)_100%)]" />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-80"
                    style={{
                      background:
                        'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.52), transparent 22%), radial-gradient(circle at 86% 12%, rgba(255,255,255,0.38), transparent 20%)'
                    }}
                  />
                  <div className="absolute inset-x-3 top-3 flex flex-wrap items-center gap-2 sm:inset-x-5 sm:top-5">
                    <span className="inline-flex min-h-10 items-center rounded-full border border-white/80 bg-white/90 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e] shadow-sm backdrop-blur">
                      {siteProfile.appName}
                    </span>
                    <span className="inline-flex min-h-10 items-center rounded-full border border-white/70 bg-[rgba(255,255,255,0.72)] px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-600 backdrop-blur">
                      Hệ sinh thái Agri
                    </span>
                  </div>
                </div>

                <div className="border-b border-[#e5eadf] bg-white px-4 py-4 sm:px-6 lg:px-8 lg:py-5">{heroBannerPanel}</div>

                <div className="px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe9dc] bg-[#f6fbf3] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                    <Leaf size={15} aria-hidden="true" className="text-[#1f9b4b]" />
                    {siteProfile.pageContent.homeBadge}
                  </div>
                  <h1 className="mx-auto mt-4 max-w-[10.5ch] text-[2.55rem] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#1f2233] sm:max-w-[14ch] sm:text-[3.55rem] lg:text-[4.3rem]">
                    {heroLeadTitle}
                  </h1>
                  <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-8 text-slate-600 sm:text-[1.05rem]">
                    {heroLeadDescription}
                  </p>
                  {!isInternal ? (
                    <div className="mx-auto mt-6 max-w-2xl rounded-[1.8rem] border border-[#e0e9dc] bg-[#f8fbf6] p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                      <PublicSearch placeholder={heroSearchPlaceholder} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        <PublicSection>
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-[2rem] font-extrabold leading-[1.03] tracking-[-0.04em] text-[#24283a] sm:text-[3.1rem]">
              {outcomeTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
              {outcomeDescription}
            </p>
          </div>

          {isInternal ? (
            <PublicOutcomeShowcase items={internalOutcomeSlides} />
          ) : (
            <div className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-6">
              {outcomeTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <article key={`${tile.title}-${tile.value}`} className="text-center">
                    <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                      <Icon size={36} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-[1.28rem] font-extrabold leading-tight text-[#1f9b4b]">{tile.value}</p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-[#1f2233]">{tile.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{tile.description}</p>
                  </article>
                );
              })}
            </div>
          )}
        </PublicSection>

        <PublicSection band={!isInternal}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">{sectionIntro}</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">{sectionDescription}</p>
            </div>
            <Link
              href={serviceAction}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#d8e7d8] bg-white px-5 font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
            >
              Khám phá thêm
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {serviceTabs.map((tab, index) => (
              <span
                key={tab}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold shadow-sm',
                  index === 0 ? 'border-[#1f9b4b] bg-[#1f9b4b] text-white' : 'border-[#dce6d8] bg-white text-slate-600'
                )}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <PublicEcosystemShowcase siteKey={siteKey} showHeading={false} />
          </div>
        </PublicSection>

        <PublicSection>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">{journeyTitle}</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">{journeyDescription}</p>
            </div>
          </div>

          <div className={cn('mt-6 grid gap-4', isInternal ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3')}>
            {journeyCards.map(([step, title, text]) => (
              <article key={`${step}-${title}`} className={cn(publicCardClass, 'h-full rounded-[2rem] p-5 sm:p-6')}>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{step}</p>
                <h2 className="mt-3 text-[1.18rem] font-extrabold leading-tight tracking-[-0.02em] text-[#1f2233] sm:text-[1.3rem]">{title}</h2>
                <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </PublicSection>

        <PublicSection band={!isInternal}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">{productSectionTitle}</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">{productSectionDescription}</p>
            </div>
            <Link
              href="/san-pham"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#d8e7d8] bg-white px-5 font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
            >
              Khám phá thêm
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {productTabs.map((tab, index) => (
              <span
                key={tab}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold shadow-sm',
                  index === 0 ? 'border-[#1f9b4b] bg-[#1f9b4b] text-white' : 'border-[#dce6d8] bg-white text-slate-600'
                )}
              >
                {tab}
              </span>
            ))}
          </div>

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">{partnerTitle}</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">{partnerDescription}</p>
            </div>
            <Link
              href="/htx"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#d8e7d8] bg-white px-5 font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
            >
              Xem HTX
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {partnerItems.length ? (
            <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#e2e9dc] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-5 lg:p-6">
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
                {partnerItems.map((cooperative, index) => (
                  <Link
                    key={cooperative.id}
                    href={`/htx/${cooperative.code}`}
                    className="group min-w-[12rem] shrink-0 rounded-[1.6rem] border border-[#e5eadf] bg-[linear-gradient(180deg,#ffffff_0%,#f9fcf8_100%)] p-4 text-center transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)] lg:min-w-0"
                  >
                    <span className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-[#dce7d8] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                      <PublicImage
                        src={cooperative.avatarUrl}
                        alt={cooperative.name}
                        decorative
                        priority={index < 4}
                        wrapperClassName="h-full w-full rounded-full"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    </span>
                    <p className="mt-4 line-clamp-2 text-sm font-extrabold uppercase tracking-[0.08em] text-[#1f2233]">{cooperative.name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{cooperative.province || 'Việt Nam'}</p>
                    <p className="mt-3 text-[0.78rem] font-semibold text-[#2b8a3e]">{cooperative.productCount} sản phẩm công khai</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPublicState title="Chưa có HTX công khai" description="HTX sẽ xuất hiện khi có dữ liệu sản phẩm được đăng công khai." />
            </div>
          )}
        </PublicSection>

        <PublicSection band={!isInternal}>
          <div className="relative isolate overflow-hidden rounded-[2.25rem] border border-[#dce6d8] shadow-[0_28px_60px_rgba(15,23,42,0.12)]">
            <PublicImage
              src={siteProfile.pageContent.homeImageUrl}
              alt={siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle}
              wrapperClassName="aspect-[16/11] sm:aspect-[18/7] lg:aspect-[21/7]"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,31,26,0.26)_0%,rgba(16,31,26,0.58)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%)]" />
            <div className="absolute inset-0 flex items-center justify-center px-5 py-8 text-center text-white sm:px-8">
              <div className="max-w-3xl">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/76">Kết nối công nghệ</p>
                <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-[2.9rem]">
                  {isInternal ? 'Đưa vận hành nội bộ ra thị trường bằng một luồng dữ liệu rõ ràng.' : 'Kéo dữ liệu nông nghiệp lên một giao diện công khai gọn, rõ và dễ hiểu hơn.'}
                </h2>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href={closingPrimaryCta.href}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#1f9b4b] shadow-[0_16px_32px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5"
                  >
                    {closingPrimaryCta.label}
                  </Link>
                  {closingSecondaryCta.external ? (
                    <a
                      href={closingSecondaryCta.href}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/24 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/16"
                    >
                      {closingSecondaryCta.label}
                    </a>
                  ) : (
                    <Link
                      href={closingSecondaryCta.href}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/24 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/16"
                    >
                      {closingSecondaryCta.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PublicSection>

        <PublicSection>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">Tin tức mới nhất</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">{newsDescription}</p>
            </div>
            <Link
              href="/tin-tuc"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#d8e7d8] bg-white px-5 font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
            >
              Xem tin tức
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

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
