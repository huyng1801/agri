import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Leaf,
  QrCode,
  ShoppingBag,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ProductSlider } from "@/components/product-slider";
import { PublicMetricCarousel, type PublicMetricCarouselItem } from "@/components/public-metric-carousel";
import {
  EmptyPublicState,
  NewsCard,
  PublicSearch,
} from "@/components/public-marketplace";
import { PublicEcosystemShowcase } from "@/components/public-ecosystem-showcase";
import { PublicImage } from "@/components/public-image";
import {
  PublicSection,
  publicCardClass,
  publicContainerClass,
} from "@/components/public-layout";
import { PublicLogo } from "@/components/public-logo";
import { PublicShell } from "@/components/public-shell";
import { cn } from "@/components/ui";
import { marketplaceUrl } from "@/lib/domain";
import { fetchPublicNews } from "@/lib/news";
import { fetchPublicCatalog } from "@/lib/public-catalog";
import {
  defaultPublicSiteProfileForSite,
  getPublicSiteProfile,
} from "@/lib/public-site";
import {
  getRequestAbsoluteUrl,
  getRequestPublicSiteKey,
} from "@/lib/request-site";

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const profile = defaultPublicSiteProfileForSite(siteKey);
  const canonical = await getRequestAbsoluteUrl("/");
  const pageTitle =
    siteKey === "htxonline"
      ? "HTXONLINE — Hệ thống quản trị nội bộ cho hợp tác xã"
      : siteKey === "passport"
        ? "HỘ CHIẾU NÔNG NGHIỆP — QR truy xuất cho sản phẩm và lô sản phẩm"
        : "AGRIPASSPORT — Nền tảng dữ liệu sản phẩm nông nghiệp";

  return {
    title: pageTitle,
    description: profile.pageContent.homeDescription,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: profile.pageContent.homeDescription,
      url: canonical,
      siteName: profile.appName,
      locale: "vi_VN",
      type: "website",
    },
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

function cooperativeMonogram(name: string) {
  return name
    .replace(/^HTX\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function HomePage() {
  const siteKey = await getRequestPublicSiteKey();
  const isInternal = siteKey === "htxonline";
  const isPassport = siteKey === "passport";
  const [catalog, news, siteProfile] = await Promise.all([
    fetchPublicCatalog(100),
    fetchPublicNews("/news/public?home=true&limit=3"),
    getPublicSiteProfile(siteKey),
  ]);

  const featuredProducts = (
    isPassport
      ? catalog.products.filter((product) => Boolean(product.passports?.length))
      : catalog.products
  ).slice(0, 12);
  const featuredCooperatives = catalog.cooperatives.slice(0, 6);
  const primaryCta = isInternal
    ? { href: "/login", label: "Đăng nhập quản trị" }
    : isPassport
      ? { href: "/san-pham?hasQr=true", label: "Xem sản phẩm có QR" }
      : { href: "/san-pham", label: "Xem sản phẩm" };
  const secondaryCta = isInternal
    ? { href: marketplaceUrl("/"), label: "Mở AGRIPASSPORT", external: true }
    : isPassport
      ? { href: "/ve-chung-toi", label: "Cách hoạt động", external: false }
      : { href: "/htx", label: "Khám phá HTX", external: false };
  const heroSignals = isInternal
    ? [
        "Tập trung hồ sơ xã viên, lịch sử tham gia và các dịch vụ nội bộ trên cùng một lớp dữ liệu.",
        "Theo dõi thu chi, xuất nhập và các báo cáo quản trị mà không phải gom dữ liệu thủ công.",
        "Khi cần công khai sản phẩm hoặc tạo QR, dữ liệu thực được đồng bộ sang AGRIPASSPORT.",
      ]
    : isPassport
      ? [
          "Mỗi QR mở ra một hồ sơ số rõ vùng trồng, nhật ký và chứng nhận theo phạm vi công khai.",
          "Ưu tiên trải nghiệm tra cứu nhanh, rõ và đáng tin trên điện thoại cho người mua cuối.",
          "Dữ liệu hồ sơ được sinh từ lớp sản phẩm đã chuẩn hóa trên AGRIPASSPORT.",
        ]
      : [
          "Chuẩn hóa tên HTX, sản phẩm, vùng trồng và thông tin truy xuất trên cùng một nền tảng.",
          "Mở kênh công khai, đặt hàng và giỏ hàng mà không cần dựng thêm website riêng cho mỗi HTX.",
          "Liên kết sang Hộ chiếu nông nghiệp khi người mua cần tra cứu sâu hơn bằng QR.",
        ];
  const stats: Array<[string, string | number, LucideIcon]> = isInternal
    ? [
        ["Thành viên", "Hồ sơ tập trung", Users],
        ["Vận hành", "Thu chi - xuất nhập", Boxes],
        ["Kết nối", "Sang AGRIPASSPORT", QrCode],
      ]
    : isPassport
      ? [
          ["QR công khai", "Mở nhanh", QrCode],
          ["Hồ sơ số", featuredProducts.length, ShoppingBag],
          ["Độ tin cậy", "Theo phạm vi duyệt", BadgeCheck],
        ]
      : [
          ["Sản phẩm công khai", catalog.totalProducts, ShoppingBag],
          ["HTX hiển thị", catalog.cooperatives.length, Store],
          ["QR truy xuất", "Mở nhanh", QrCode],
        ];
  const heroTiles: HighlightTile[] = stats.map(
    ([label, value, icon], index) => ({
      label: String(label),
      value,
      description: heroSignals[index] ?? "",
      icon,
    }),
  );
  const featureCards: Array<[string, string, LucideIcon]> = isInternal
    ? [
        [
          "Hồ sơ thành viên",
          "Lưu trữ tập trung thông tin xã viên, trạng thái tham gia và lịch sử sử dụng dịch vụ quan trọng.",
          Users,
        ],
        [
          "Thu chi - xuất nhập",
          "Theo dõi khoản thu chi, biến động nhập xuất và tình hình vận hành nội bộ của hợp tác xã.",
          Boxes,
        ],
        [
          "Đồng bộ sản phẩm",
          "Khi cần đưa sản phẩm ra ngoài thị trường hoặc tạo QR, dữ liệu được đẩy sang AGRIPASSPORT.",
          QrCode,
        ],
      ]
    : isPassport
      ? [
          [
            "QR truy xuất rõ ràng",
            "Mỗi mã QR dẫn tới một hồ sơ số công khai gọn, dễ đọc và phù hợp cho màn hình điện thoại.",
            QrCode,
          ],
          [
            "Nguồn gốc minh bạch",
            "Người mua và đối tác có thể xem vùng trồng, nhật ký và chứng nhận theo đúng phạm vi HTX mở.",
            BadgeCheck,
          ],
          [
            "Kết nối dữ liệu trung tâm",
            "Hồ sơ số lấy dữ liệu từ AGRIPASSPORT để đảm bảo một nguồn dữ liệu thống nhất.",
            ShoppingBag,
          ],
        ]
      : [
          [
            "Chuẩn hóa danh mục",
            "Tên HTX, sản phẩm, vùng trồng và dữ liệu nhận diện được quản lý thống nhất trước khi công khai.",
            ShoppingBag,
          ],
          [
            "Bán hàng và công khai",
            "Sản phẩm, giỏ hàng và thông tin HTX được trình bày rõ ràng hơn để tăng khả năng ra quyết định.",
            Store,
          ],
          [
            "Liên kết QR truy xuất",
            "Khi cần truy xuất sâu hơn, mỗi sản phẩm có thể mở sang hồ sơ số trên Hộ chiếu nông nghiệp.",
            QrCode,
          ],
        ];
  const journeyCards = isInternal
    ? [
        [
          "Bước 1",
          "HTXONLINE",
          "Quản lý xã viên, dịch vụ và dữ liệu vận hành nội bộ của hợp tác xã.",
        ],
        [
          "Bước 2",
          "Xác định sản phẩm thực",
          "Chọn những sản phẩm hoặc lô sản phẩm cần số hóa và công khai ra bên ngoài.",
        ],
        [
          "Bước 3",
          "Đồng bộ sang AGRIPASSPORT",
          "Chuẩn hóa tên sản phẩm, hình ảnh, vùng trồng và thông tin bán hàng trên nền tảng trung tâm.",
        ],
        [
          "Bước 4",
          "Mở Hộ chiếu nông nghiệp",
          "Sinh QR và hồ sơ số để truy xuất minh bạch khi cần làm thị trường hoặc hồ sơ.",
        ],
      ]
    : isPassport
      ? [
          [
            "Bước 1",
            "Chuẩn hóa dữ liệu gốc",
            "Sản phẩm được tạo và duyệt từ lớp dữ liệu trung tâm trước khi sinh hồ sơ công khai.",
          ],
          [
            "Bước 2",
            "Tạo hồ sơ số",
            "QR liên kết trực tiếp tới vùng trồng, nhật ký, chứng nhận và dữ liệu nền tảng đã cho phép hiển thị.",
          ],
          [
            "Bước 3",
            "Người mua tra cứu",
            "Điện thoại mở ra một hành trình truy xuất gọn, rõ và ít thao tác hơn.",
          ],
        ]
      : [
          [
            "Bước 1",
            "Chuẩn hóa HTX và sản phẩm",
            "Thiết lập dữ liệu nhận diện, tên gọi, hình ảnh và thông tin cần công khai trên cùng hệ thống.",
          ],
          [
            "Bước 2",
            "Đăng lên AGRIPASSPORT",
            "Mở kênh công khai sản phẩm, giỏ hàng và nội dung giới thiệu HTX cho thị trường.",
          ],
          [
            "Bước 3",
            "Liên kết QR",
            "Khi người mua cần xem sâu hơn, sản phẩm tiếp tục mở sang Hộ chiếu nông nghiệp.",
          ],
        ];
  const newsDescription = isInternal
    ? "Tin về vận hành HTX, số hóa nội bộ và kinh nghiệm triển khai thực tế từ đội vận hành."
    : isPassport
      ? "Tin về truy xuất, hồ sơ số và chuẩn hóa dữ liệu công khai cho sản phẩm nông nghiệp."
      : "Tin về sản phẩm, truy xuất, thị trường và chuẩn hóa dữ liệu nông nghiệp từ đội vận hành.";
  const heroNote = isInternal
    ? "HTXONLINE là lớp quản trị nội bộ. Khi cần công khai hoặc truy xuất, dữ liệu sẽ được đẩy sang AGRIPASSPORT và Hộ chiếu nông nghiệp theo đúng vai trò."
    : isPassport
      ? "Hộ chiếu nông nghiệp ưu tiên trải nghiệm truy xuất cho người mua, còn dữ liệu gốc vẫn được chuẩn hóa từ AGRIPASSPORT."
      : "AGRIPASSPORT là lớp trung tâm của hệ sinh thái, kết nối dữ liệu sản phẩm, công khai bán hàng và QR truy xuất.";
  const sectionIntro = isInternal
    ? "Giải pháp dịch vụ tiêu biểu"
    : isPassport
      ? "Giải pháp dịch vụ tiêu biểu cho truy xuất và hồ sơ số"
      : "Giải pháp dịch vụ tiêu biểu cho dữ liệu sản phẩm và bán hàng";
  const sectionDescription = isInternal
    ? "Ba lớp nền tảng được kéo về đúng nhịp card gradient đậm, headline ngắn và mô tả gọn để phong cách bám sát Demeter hơn ngay từ lần chạm đầu."
    : isPassport
      ? "Thay vì dồn hết thông tin vào một màn hình, bố cục mới ưu tiên hành trình quét QR, đọc nhanh và hiểu đúng."
      : "Theo hướng trình bày gần Demeter hơn: rõ khối chức năng, card lớn và hành trình công khai bám sát người dùng cuối.";
  const journeyTitle = isInternal
    ? "Luồng dữ liệu từ quản trị nội bộ ra thị trường"
    : "Luồng triển khai từ dữ liệu gốc đến người mua";
  const journeyDescription = isInternal
    ? "HTXONLINE đứng ở lớp đầu vào, AGRIPASSPORT là lớp công khai trung tâm và Hộ chiếu nông nghiệp là lớp truy xuất minh bạch."
    : "Ba nền tảng không chồng lấn vai trò; chúng nối tiếp nhau để tạo một hành trình dữ liệu rõ ràng hơn.";
  const heroSearchPlaceholder = isPassport
    ? "Tìm hồ sơ có QR, sản phẩm hoặc HTX"
    : "Tìm sản phẩm, HTX hoặc vùng trồng";
  const closingPrimaryCta = isInternal
    ? { href: "/lien-he", label: "Nhận tư vấn triển khai", external: false }
    : isPassport
      ? {
          href: "/san-pham?hasQr=true",
          label: "Mở danh mục QR",
          external: false,
        }
      : { href: "/san-pham", label: "Tới danh mục công khai", external: false };
  const closingSecondaryCta = isInternal
    ? { href: marketplaceUrl("/"), label: "Mở AGRIPASSPORT", external: true }
    : { href: "/lien-he", label: "Liên hệ đội vận hành", external: false };

  const heroLeadTitle = isInternal
    ? "Luồng dữ liệu rõ ràng cho hợp tác xã"
    : isPassport
      ? "HỘ CHIẾU NÔNG NGHIỆP giúp tra cứu QR rõ ràng hơn trên điện thoại"
      : "AGRIPASSPORT chuẩn hóa dữ liệu và công khai sản phẩm nông nghiệp";
  const heroLeadDescription = isInternal
    ? "Giữ lớp quản trị nội bộ cho xã viên, dịch vụ và vận hành, nhưng vẫn mở được một giao diện public sáng, thoáng và dễ hiểu khi cần kết nối thị trường."
    : isPassport
      ? "Tập trung vào trải nghiệm quét mã, mở hồ sơ số và đọc nhanh những thông tin công khai quan trọng nhất trên di động."
      : "Đưa HTX, sản phẩm, vùng trồng và QR truy xuất lên cùng một mặt bằng dữ liệu để công khai bán hàng rõ ràng hơn.";
  const outcomeTitle = isInternal
    ? "Thắng lợi cùng hợp tác xã"
    : "Thắng lợi cùng nhà nông";
  const outcomeDescription = isInternal
    ? "HTXONLINE vẫn là lớp vận hành nội bộ, nhưng cách trình bày được kéo về nhịp icon lớn, khoảng thở rộng và câu ngắn như landing page của Demeter."
    : "Các tín hiệu quan trọng được kéo về nhịp icon, headline ngắn và khoảng thở lớn để trông gần ứng dụng native hơn trên mobile.";
  const serviceTabs = isInternal
    ? ["Tất cả", "Quản trị nội bộ", "Đồng bộ sản phẩm", "Báo cáo điều hành"]
    : isPassport
      ? ["Tất cả", "QR truy xuất", "Hồ sơ số", "Nguồn gốc minh bạch"]
      : ["Tất cả", "Dữ liệu sản phẩm", "Bán hàng công khai", "Liên kết QR"];
  const featuredProductCategories = Array.from(
    new Set(
      featuredProducts
        .map((product) => product.category?.name?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ).slice(0, 5);
  const productTabs = featuredProductCategories.length
    ? featuredProductCategories
    : isInternal
      ? ["Nông sản công khai", "Sản phẩm đã đồng bộ", "HTX đang hiển thị"]
      : isPassport
        ? ["Sản phẩm có QR", "Hồ sơ công khai", "Vùng trồng minh bạch"]
        : ["Nông sản nổi bật", "Sản phẩm truy xuất", "Đặt hàng công khai"];
  const productSectionTitle = isInternal
    ? "Khám phá các sản phẩm"
    : isPassport
      ? "Khám phá hồ sơ số và sản phẩm QR"
      : "Khám phá các sản phẩm";
  const productSectionDescription = isInternal
    ? "Khi HTX xác định được sản phẩm thực và đồng bộ ra lớp công khai, các sản phẩm sẽ hiển thị tại đây theo nhịp lướt nhanh như một app mobile."
    : isPassport
      ? "Ưu tiên những sản phẩm đã có lớp truy xuất rõ ràng để người mua tra cứu nhanh hơn."
      : "Giữ nhịp lướt nhanh trên mobile nhưng trình bày gọn và thoáng hơn theo hướng landing page hiện đại.";
  const partnerTitle = isInternal
    ? "Đối tác"
    : "Đối tác công khai trong hệ sinh thái";
  const partnerDescription = isInternal
    ? "Các HTX và đơn vị trong hệ sinh thái được đưa về một dải nhận diện gọn, sáng và dễ quét hơn thay vì card hồ sơ dày thông tin."
    : "Giữ cảm giác một dải nhận diện đối tác gọn, sáng và dễ quét hơn thay vì các card hồ sơ nặng thông tin.";
  const partnerItems = featuredCooperatives.length
    ? featuredCooperatives
    : catalog.cooperatives.slice(0, 6);
  const heroPreviewProducts = featuredProducts.slice(0, 3);
  const heroPreviewCooperative = partnerItems[0];
  const internalHeroPreviewImage = siteProfile.pageContent.homeImageUrl;
  const internalHeroPreviewAlt =
    siteProfile.pageContent.homeImageAlt || siteProfile.pageContent.homeTitle;
  const serviceAction = isInternal ? "/gioi-thieu" : "/san-pham";
  const internalServicePanels = [
    {
      key: "htxonline-panel",
      eyebrow: "Giải pháp quản trị nội bộ",
      title: "HTXONLINE",
      description:
        "Quản lý xã viên, dịch vụ, thu chi và lịch sử vận hành trên một lớp dữ liệu gọn, rõ và dễ theo dõi hơn.",
      href: "/ve-chung-toi",
      cta: "Xem chi tiết",
      image: siteProfile.pageContent.homeImageUrl,
      imageAlt: siteProfile.pageContent.homeImageAlt || "Giải pháp HTXONLINE",
    },
    {
      key: "agripassport-panel",
      eyebrow: "Dữ liệu sản phẩm công khai",
      title: "AGRIPASSPORT",
      description:
        "Chuẩn hóa tên HTX, sản phẩm và vùng trồng trước khi mở kênh công khai, bán hàng hoặc kết nối truy xuất.",
      href: marketplaceUrl("/"),
      cta: "Khám phá thêm",
      image: siteProfile.pageContent.homeImageUrl,
      imageAlt:
        heroPreviewProducts[0]?.name || "Nền tảng AGRIPASSPORT",
    },
    {
      key: "passport-panel",
      eyebrow: "QR truy xuất minh bạch",
      title: "HỘ CHIẾU NÔNG NGHIỆP",
      description:
        "Tạo hồ sơ số cho sản phẩm và lô sản phẩm để người mua quét QR, xem nguồn gốc và hiểu đúng dữ liệu công khai.",
      href: "https://hochieunongnghiep.com/",
      cta: "Tra cứu QR",
      image: siteProfile.pageContent.homeImageUrl,
      imageAlt: "Hộ chiếu nông nghiệp",
    },
  ] as const;
  const internalProductPanels = [
    ...featuredProducts.slice(0, 2).map((product) => ({
      key: product.id,
      href: `/san-pham/${product.slug}`,
      image: product.thumbnail?.publicUrl || siteProfile.pageContent.homeImageUrl,
      title: product.name,
      eyebrow: product.category?.name || "Sản phẩm công khai",
      note: product.cooperative?.name || product.zone?.name || "HTXONLINE",
    })),
    {
      key: "sync-preview",
      href: "/gioi-thieu",
      image: siteProfile.pageContent.homeImageUrl,
      title: "Danh mục đang đồng bộ",
      eyebrow: "Lớp công khai sản phẩm",
      note: "Dữ liệu từ HTXONLINE sang AGRIPASSPORT",
    },
    {
      key: "qr-preview",
      href: "https://hochieunongnghiep.com/",
      image: siteProfile.pageContent.homeImageUrl,
      title: "Sẵn sàng mở QR truy xuất",
      eyebrow: "Hộ chiếu nông nghiệp",
      note: "Mở hồ sơ số khi cần minh bạch sâu hơn",
    },
  ] as const;
  const internalOutcomeTiles: OutcomeTile[] = [
    {
      title: "Hồ sơ xã viên",
      value: "01 nơi theo dõi",
      description: "Tập trung hồ sơ, lịch sử tham gia và mức độ dùng dịch vụ nội bộ trên cùng một lớp dữ liệu.",
      icon: Users,
    },
    {
      title: "Thu chi nội bộ",
      value: "Đối soát gọn hơn",
      description: "Theo dõi khoản thu chi, lịch sử biến động và các điểm cần kiểm tra mà không phải ghép tay dữ liệu.",
      icon: Boxes,
    },
    {
      title: "Xuất nhập",
      value: "Dữ liệu liền mạch",
      description: "Biến động nhập xuất và trạng thái vận hành đi cùng một luồng theo dõi duy nhất.",
      icon: ShoppingBag,
    },
    {
      title: "Sản phẩm thực",
      value: "Chọn đúng đầu ra",
      description: "Khoanh vùng sản phẩm hoặc lô sản phẩm thật sự sẵn sàng để đồng bộ ra AGRIPASSPORT.",
      icon: Store,
    },
    {
      title: "Liên kết QR",
      value: "Sẵn sàng truy xuất",
      description: "Khi cần minh bạch sâu hơn, dữ liệu đã chuẩn có thể tiếp tục mở sang lớp QR và hồ sơ số.",
      icon: QrCode,
    },
    {
      title: "Kiểm soát minh bạch",
      value: "Vai trò rõ ràng",
      description: "Mỗi nền tảng giữ đúng nhiệm vụ để tránh nhập liệu chồng chéo và giúp giao diện public dễ hiểu hơn.",
      icon: BadgeCheck,
    },
  ];
  const internalOutcomeCarouselItems: PublicMetricCarouselItem[] = [
    {
      title: "Hồ sơ xã viên",
      value: "01 nơi theo dõi",
      description: "Tập trung hồ sơ, lịch sử tham gia và mức độ dùng dịch vụ nội bộ trên cùng một lớp dữ liệu.",
      icon: "users",
    },
    {
      title: "Thu chi nội bộ",
      value: "Đối soát gọn hơn",
      description: "Theo dõi khoản thu chi và lịch sử biến động mà không phải ghép tay dữ liệu.",
      icon: "boxes",
    },
    {
      title: "Xuất nhập",
      value: "Dữ liệu liền mạch",
      description: "Biến động nhập xuất và trạng thái vận hành đi cùng một luồng theo dõi duy nhất.",
      icon: "shoppingBag",
    },
    {
      title: "Sản phẩm thực",
      value: "Chọn đúng đầu ra",
      description: "Khoanh vùng sản phẩm sẵn sàng để đồng bộ sang AGRIPASSPORT khi cần công khai.",
      icon: "store",
    },
    {
      title: "Liên kết QR",
      value: "Sẵn sàng truy xuất",
      description: "Dữ liệu đã chuẩn có thể tiếp tục mở sang lớp QR và hồ sơ số rõ ràng hơn.",
      icon: "qrCode",
    },
    {
      title: "Kiểm soát minh bạch",
      value: "Vai trò rõ ràng",
      description: "Mỗi nền tảng giữ đúng nhiệm vụ để giao diện public dễ hiểu và ít chồng chéo hơn.",
      icon: "badgeCheck",
    },
  ];
  const outcomeTiles: OutcomeTile[] = isPassport
    ? [
        {
          title: "QR công khai",
          value: "Mở nhanh",
          description:
            "Điện thoại quét mã và vào thẳng hồ sơ số công khai đã được duyệt.",
          icon: QrCode,
        },
        {
          title: "Hồ sơ số",
          value: `${featuredProducts.length} hồ sơ`,
          description:
            "Tập trung vào sản phẩm đã có lớp truy xuất rõ ràng và dễ đọc.",
          icon: ShoppingBag,
        },
        {
          title: "Nguồn gốc",
          value: "Xem theo phạm vi",
          description:
            "Chỉ hiển thị vùng trồng, nhật ký và chứng nhận theo quyền công khai.",
          icon: BadgeCheck,
        },
        {
          title: "Dữ liệu trung tâm",
          value: "Một nguồn dữ liệu",
          description:
            "Hồ sơ số lấy dữ liệu từ AGRIPASSPORT để tránh lệch thông tin.",
          icon: Store,
        },
        {
          title: "Trải nghiệm mobile",
          value: "Đọc nhanh hơn",
          description:
            "Cấu trúc ưu tiên điện thoại thay vì dồn mọi thứ vào một trang dài.",
          icon: Users,
        },
        {
          title: "Niềm tin thị trường",
          value: "Hiểu đúng hơn",
          description:
            "Thông tin quan trọng được sắp lại để người mua ra quyết định nhanh hơn.",
          icon: Leaf,
        },
      ]
    : [
        {
          title: "Sản phẩm công khai",
          value: `${catalog.totalProducts}+`,
          description:
            "Danh mục công khai được kéo về bố cục dễ quét và dễ so sánh.",
          icon: ShoppingBag,
        },
        {
          title: "HTX hiển thị",
          value: `${catalog.cooperatives.length} HTX`,
          description:
            "Mỗi HTX có nhận diện rõ hơn thay vì chìm trong một bảng danh sách.",
          icon: Store,
        },
        {
          title: "QR truy xuất",
          value: "Mở nhanh",
          description:
            "Khi cần truy xuất sâu hơn, sản phẩm tiếp tục mở sang hồ sơ số.",
          icon: QrCode,
        },
        {
          title: "Dữ liệu chuẩn hóa",
          value: "Một mặt bằng dữ liệu",
          description:
            "Tên HTX, vùng trồng và sản phẩm được chuẩn hóa trước khi công khai.",
          icon: BadgeCheck,
        },
        {
          title: "Bán hàng công khai",
          value: "Giỏ hàng gọn hơn",
          description:
            "Giữ hành vi lướt, xem và thêm giỏ gần với một app thương mại điện tử.",
          icon: Boxes,
        },
        {
          title: "Niềm tin người mua",
          value: "Hiểu nhanh hơn",
          description:
            "Thông tin được sắp theo nhịp card lớn, khoảng thở rộng và CTA rõ hơn.",
          icon: Users,
        },
      ];
  const heroBannerPanel = (
    <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.1)] backdrop-blur sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">
            {isInternal
              ? "Luồng nội bộ ra công khai"
              : isPassport
                ? "Hồ sơ số công khai"
                : "Dữ liệu công khai trung tâm"}
          </p>
          <p className="mt-1 text-[1rem] font-extrabold leading-tight text-[#1f2233] sm:text-[1.45rem]">
            {String(heroTiles[0].value)}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {heroNote}
          </p>
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
      <div className="relative isolate overflow-hidden border-y border-[#e4eadf] bg-[#f8fbf7]">
        <PublicImage
          src={siteProfile.pageContent.homeImageUrl}
          alt={
            siteProfile.pageContent.homeImageAlt ||
            siteProfile.pageContent.homeTitle
          }
          wrapperClassName="absolute inset-0 h-full w-full"
          className="h-full w-full object-cover object-center"
          priority
          fallback={internalHeroPreviewImage}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.62)_30%,rgba(255,255,255,0.92)_76%,rgba(255,255,255,0.98)_100%)] lg:bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.42)_18%,rgba(255,255,255,0.92)_48%,rgba(255,255,255,0.6)_78%,rgba(255,255,255,0.18)_100%)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 14% 18%, rgba(255,255,255,0.78), transparent 22%), radial-gradient(circle at 84% 18%, rgba(255,255,255,0.56), transparent 20%), radial-gradient(circle at 18% 80%, rgba(119,201,94,0.14), transparent 18%), radial-gradient(circle at 82% 78%, rgba(13,111,128,0.14), transparent 18%)",
          }}
        />
        <div
          className="absolute left-[4%] top-[12%] h-20 w-20 rounded-full bg-white/36 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute right-[6%] top-[16%] h-24 w-24 rounded-full bg-[#77c95e]/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.82)_70%,#ffffff_100%)] lg:h-24"
          aria-hidden="true"
        />

        <div
          className={cn(
            publicContainerClass,
            "relative min-h-[22rem] px-4 py-4 sm:min-h-[27rem] sm:px-5 sm:py-6 lg:min-h-[31rem] lg:px-6 lg:py-9",
          )}
        >
          <div className="absolute left-[-0.4rem] bottom-0 z-10 w-[5.6rem] sm:left-0 sm:w-[8rem] lg:left-2 lg:w-[13.6rem]">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-[2.2rem] bg-[#0d6f80]/16 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[1.9rem] border-[4px] border-[#22283a] bg-white p-1.5 shadow-[0_22px_46px_rgba(15,23,42,0.24)] sm:rounded-[2.2rem] sm:border-[5px] sm:p-2 lg:border-[6px] lg:p-2.5">
                <div
                  className="mx-auto mb-1.5 h-2.5 w-8 rounded-full bg-[#22283a] sm:mb-2 sm:h-3 sm:w-12 lg:h-4 lg:w-16"
                  aria-hidden="true"
                />
                <div className="rounded-[1.15rem] bg-[linear-gradient(180deg,#ffffff_0%,#f5fbf3_58%,#eef7fb_100%)] p-1.5 sm:rounded-[1.35rem] sm:p-2.5 lg:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1d2436] sm:h-7 sm:w-7 lg:h-9 lg:w-9">
                      <PublicLogo
                        size={18}
                        className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px] lg:h-[22px] lg:w-[22px]"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.32rem] font-semibold uppercase tracking-[0.14em] text-[#2b8a3e] sm:text-[0.42rem] lg:text-[0.55rem]">
                        Điều phối HTX
                      </p>
                      <p className="truncate text-[0.52rem] font-extrabold text-[#1f2233] sm:text-[0.68rem] lg:text-sm">
                        HTXONLINE
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-[0.95rem] bg-[linear-gradient(135deg,#128a42_0%,#1f9b4b_100%)] px-2 py-2 text-white shadow-[0_12px_22px_rgba(31,155,75,0.24)] sm:mt-2.5 sm:rounded-[1.1rem] sm:px-2.5 sm:py-2.5 lg:rounded-[1.2rem] lg:p-3">
                    <p className="text-[0.34rem] font-semibold uppercase tracking-[0.12em] text-white/78 sm:text-[0.42rem] lg:text-[0.52rem]">
                      Dữ liệu nội bộ
                    </p>
                    <p className="mt-1 text-[0.54rem] font-extrabold leading-tight sm:text-[0.72rem] lg:text-sm">
                      Xã viên, thu chi, nhập xuất
                    </p>
                  </div>
                  <div className="mt-2 rounded-full border border-[#dfe8dc] bg-white/92 px-2 py-1 text-center text-[0.36rem] font-semibold uppercase tracking-[0.12em] text-[#0f7d63] shadow-sm sm:px-2.5 sm:py-1.5 sm:text-[0.44rem] lg:text-[0.58rem]">
                    Đồng bộ sang AGRI
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-[-0.45rem] bottom-0 z-10 w-[7rem] sm:right-0 sm:w-[9rem] lg:right-0 lg:w-[15rem]">
            <div className="relative overflow-hidden rounded-[1.65rem] border border-white/70 bg-white/84 p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:rounded-[1.9rem] sm:p-2.5 lg:p-3">
              <PublicImage
                src={siteProfile.pageContent.aboutImageUrl}
                alt={
                  siteProfile.pageContent.aboutImageAlt ||
                  internalHeroPreviewAlt
                }
                fallback={internalHeroPreviewImage}
                wrapperClassName="aspect-[10/13] w-full overflow-hidden rounded-[1.25rem] bg-[linear-gradient(180deg,#eef6ef_0%,#ffffff_100%)] sm:rounded-[1.45rem]"
                className="h-full w-full object-cover object-center"
                priority
              />
              <div className="absolute inset-x-2 bottom-2 rounded-[1rem] bg-[linear-gradient(180deg,rgba(9,17,18,0.04)_0%,rgba(9,17,18,0.74)_100%)] p-2.5 text-white sm:inset-x-3 sm:bottom-3 sm:rounded-[1.1rem] sm:p-3">
                <p className="text-[0.48rem] font-semibold uppercase tracking-[0.18em] text-white/72 sm:text-[0.56rem]">
                  Điểm triển khai
                </p>
                <p className="mt-1 text-[0.68rem] font-extrabold leading-4 sm:text-[0.82rem] sm:leading-5 lg:text-sm">
                  {heroPreviewCooperative?.name || "Hệ sinh thái HTXONLINE"}
                </p>
                <p className="mt-1 text-[0.56rem] leading-4 text-white/82 sm:text-[0.64rem] lg:text-[0.72rem]">
                  {heroPreviewProducts[0]?.name ||
                    heroPreviewCooperative?.province ||
                    "Kết nối dữ liệu nội bộ với sản phẩm công khai và QR."}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-20 mx-auto flex min-h-[15rem] max-w-[17rem] flex-col items-center justify-center px-[3.9rem] pt-2 text-center sm:min-h-[18rem] sm:max-w-[24rem] sm:px-[5.6rem] sm:pt-4 lg:min-h-[22rem] lg:max-w-[39rem] lg:px-0 lg:pt-0">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/80 bg-white/90 px-2.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-[#0f7d63] shadow-sm backdrop-blur sm:min-h-9 sm:px-3 sm:text-[0.62rem] lg:min-h-10 lg:px-4 lg:text-[0.72rem]">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1d2436] sm:h-6 sm:w-6 lg:h-7 lg:w-7">
                  <PublicLogo
                    size={16}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]"
                  />
                </span>
                HTXONLINE
              </span>
              <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#3d5871] sm:text-xs lg:text-sm">
                x
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-white/70 bg-white/84 px-2.5 text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-[#0d6f80] shadow-sm backdrop-blur sm:min-h-9 sm:px-3 sm:text-[0.62rem] lg:min-h-10 lg:px-4 lg:text-[0.72rem]">
                AGRIPASSPORT
              </span>
            </div>

            <p className="mt-3 text-[0.56rem] font-semibold uppercase tracking-[0.26em] text-[#2b8a3e] sm:text-[0.64rem] lg:text-[0.78rem]">
              Hệ sinh thái vận hành số
            </p>
            <h1 className="mx-auto mt-2 max-w-[10ch] text-[1.85rem] font-extrabold leading-[0.92] tracking-[-0.055em] text-[#0d6f80] sm:max-w-[10.5ch] sm:text-[2.85rem] lg:max-w-[10.8ch] lg:text-[4.2rem]">
              Cùng HTX kiến tạo vận hành số bền vững
            </h1>
            <p className="mx-auto mt-2.5 max-w-[30rem] text-[0.74rem] leading-5 text-[#31556d] sm:text-[0.9rem] sm:leading-6 lg:max-w-[33rem] lg:text-[1.08rem] lg:leading-7">
              Quản trị xã viên, thu chi và xuất nhập rồi đồng bộ sang
              AGRIPASSPORT khi cần công khai và truy xuất QR.
            </p>

            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-[#0d6f80] px-3 py-2 text-[0.62rem] font-semibold text-white shadow-[0_16px_30px_rgba(13,111,128,0.24)] sm:px-4 sm:text-[0.72rem] lg:text-sm">
              <span>{featuredCooperatives.length} HTX đang hiển thị</span>
              <span className="opacity-45">•</span>
              <span>{featuredProducts.length}+ sản phẩm đồng bộ</span>
              <span className="hidden sm:inline opacity-45">•</span>
              <span className="hidden sm:inline">{siteProfile.hotlineDisplay}</span>
            </div>

            <div className="mt-3 flex w-full max-w-[14rem] flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Link
                href={primaryCta.href}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#1f9b4b] px-4 text-[0.8rem] font-bold text-white shadow-[0_14px_28px_rgba(31,155,75,0.22)] transition hover:-translate-y-0.5 sm:min-h-11 sm:px-5 sm:text-sm"
              >
                {primaryCta.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              {secondaryCta.external ? (
                <a
                  href={secondaryCta.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7e6d7] bg-white/92 px-4 text-[0.8rem] font-bold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] sm:min-h-11 sm:px-5 sm:text-sm"
                >
                  {secondaryCta.label}
                </a>
              ) : (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7e6d7] bg-white/92 px-4 text-[0.8rem] font-bold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] sm:min-h-11 sm:px-5 sm:text-sm"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>

          <div className="absolute left-[24%] top-[18%] hidden rounded-full border border-white/70 bg-white/84 px-3 py-1.5 text-[0.66rem] font-semibold text-[#0f7d63] shadow-sm backdrop-blur lg:inline-flex">
            Quản trị HTX
          </div>
          <div className="absolute right-[18%] top-[20%] hidden rounded-full border border-white/70 bg-white/84 px-3 py-1.5 text-[0.66rem] font-semibold text-[#1f2233] shadow-sm backdrop-blur lg:inline-flex">
            Sản phẩm công khai
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
            <div className={cn(publicContainerClass, "py-4 sm:py-6 lg:py-8")}>
              <div className="overflow-hidden rounded-[1.9rem] border border-[#e2e9da] bg-white shadow-[0_22px_48px_rgba(15,23,42,0.06)] sm:rounded-[2.15rem]">
                <div className="relative isolate overflow-hidden border-b border-[#e5eadf]">
                  <PublicImage
                    src={siteProfile.pageContent.homeImageUrl}
                    alt={
                      siteProfile.pageContent.homeImageAlt ||
                      siteProfile.pageContent.homeTitle
                    }
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
                        "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.52), transparent 22%), radial-gradient(circle at 86% 12%, rgba(255,255,255,0.38), transparent 20%)",
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

                <div className="border-b border-[#e5eadf] bg-white px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
                  {heroBannerPanel}
                </div>

                <div className="px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe9dc] bg-[#f6fbf3] px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                    <Leaf
                      size={15}
                      aria-hidden="true"
                      className="text-[#1f9b4b]"
                    />
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
            <>
              <div className="mt-6 lg:hidden">
                <PublicMetricCarousel items={internalOutcomeCarouselItems} />
              </div>
              <div className="mt-8 hidden gap-x-4 gap-y-8 lg:grid lg:grid-cols-6">
                {internalOutcomeTiles.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <article
                      key={`${tile.title}-${tile.value}`}
                      className="text-center"
                    >
                      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                        <Icon size={36} strokeWidth={1.7} aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-sm font-bold uppercase tracking-[0.08em] text-[#1f2233]">
                        {tile.title}
                      </p>
                      <p className="mt-2 text-[1.28rem] font-extrabold leading-tight text-[#1f9b4b]">
                        {tile.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {tile.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-6">
              {outcomeTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <article
                    key={`${tile.title}-${tile.value}`}
                    className="text-center"
                  >
                    <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                      <Icon size={36} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-[1.28rem] font-extrabold leading-tight text-[#1f9b4b]">
                      {tile.value}
                    </p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-[#1f2233]">
                      {tile.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {tile.description}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </PublicSection>

        <PublicSection band={!isInternal}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">
                {sectionIntro}
              </h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                {sectionDescription}
              </p>
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
                  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold shadow-sm",
                  index === 0
                    ? "border-[#1f9b4b] bg-[#1f9b4b] text-white"
                    : "border-[#dce6d8] bg-white text-slate-600",
                )}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="mt-6">
            {isInternal ? (
              <div className="relative">
                <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible">
                  {internalServicePanels.map((card, index) => {
                    return (
                      <a
                        key={card.key}
                        href={card.href}
                        className="group w-[min(90vw,24rem)] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-[#e3eadf] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(15,23,42,0.08)] lg:w-auto"
                      >
                        <div className="relative overflow-hidden border-b border-[#e5eadf] bg-[#fbfdf8] p-3">
                          <PublicImage
                            src={card.image}
                            alt={card.imageAlt}
                            priority={index < 3}
                            wrapperClassName="aspect-[16/10] rounded-[1.4rem]"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(8,15,24,0.06)_0%,rgba(8,15,24,0.62)_100%)] p-3 text-white">
                            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/72">
                              {card.eyebrow}
                            </p>
                            <p className="mt-1 text-[1.05rem] font-extrabold leading-tight">
                              {card.title}
                            </p>
                          </div>
                        </div>

                        <div className="p-5">
                          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">
                            {card.eyebrow}
                          </p>
                          <h3 className="mt-2 text-[1.3rem] font-extrabold leading-tight tracking-[-0.03em] text-[#1f2233]">
                            {card.title}
                          </h3>
                          <p className="mt-3 text-[0.94rem] leading-7 text-slate-600">
                            {card.description}
                          </p>
                          <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8e7d8] bg-[#f7fbf5] px-5 text-sm font-bold text-[#1f9b4b] transition group-hover:border-[#1f9b4b] group-hover:bg-white">
                            {card.cta}
                            <ArrowRight size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : (
              <PublicEcosystemShowcase siteKey={siteKey} showHeading={false} />
            )}
          </div>
        </PublicSection>

        {!isInternal ? (
          <PublicSection>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">
                  {journeyTitle}
                </h2>
                <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {journeyDescription}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "mt-6 grid gap-4",
                isInternal ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3",
              )}
            >
              {journeyCards.map(([step, title, text]) => (
                <article
                  key={`${step}-${title}`}
                  className={cn(
                    publicCardClass,
                    "h-full rounded-[2rem] p-5 sm:p-6",
                  )}
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                    {step}
                  </p>
                  <h2 className="mt-3 text-[1.18rem] font-extrabold leading-tight tracking-[-0.02em] text-[#1f2233] sm:text-[1.3rem]">
                    {title}
                  </h2>
                  <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </PublicSection>
        ) : null}

        <PublicSection band={!isInternal}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">
                {productSectionTitle}
              </h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                {productSectionDescription}
              </p>
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
                  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold shadow-sm",
                  index === 0
                    ? "border-[#1f9b4b] bg-[#1f9b4b] text-white"
                    : "border-[#dce6d8] bg-white text-slate-600",
                )}
              >
                {tab}
              </span>
            ))}
          </div>

          {featuredProducts.length ? (
            isInternal ? (
              <div className="mt-6">
                <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible">
                  {internalProductPanels.map((panel, index) => (
                    <a
                      key={panel.key}
                      href={panel.href}
                      className="group w-[min(76vw,18rem)] shrink-0 snap-start rounded-[1.9rem] border border-[#e3eadf] bg-white p-3 shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.08)] lg:w-auto"
                    >
                      <div className="overflow-hidden rounded-[1.45rem] border border-[#dbe7da] bg-[#fbfdf9]">
                        <PublicImage
                          src={panel.image}
                          alt={panel.title}
                          fallback={siteProfile.pageContent.homeImageUrl}
                          priority={index < 3}
                          wrapperClassName="aspect-[1/1] w-full"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">
                          {panel.eyebrow}
                        </p>
                        <p className="mt-2 line-clamp-2 min-h-[3rem] text-[1.04rem] font-extrabold leading-6 text-[#1f2233]">
                          {panel.title}
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                          {panel.note}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <ProductSlider products={featuredProducts} />
              </div>
            )
          ) : (
            <div className="mt-6">
              <EmptyPublicState
                title={
                  isPassport
                    ? "Chưa có sản phẩm có QR công khai"
                    : "Chưa có sản phẩm công khai"
                }
                description={
                  isPassport
                    ? "Khi HTX tạo QR và mở phạm vi công khai, hồ sơ sẽ xuất hiện tại đây."
                    : "Khi HTX công khai dữ liệu sản phẩm, sản phẩm sẽ xuất hiện tại đây."
                }
              />
            </div>
          )}
        </PublicSection>

        <PublicSection>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">
                {partnerTitle}
              </h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                {partnerDescription}
              </p>
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
            isInternal ? (
              <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#edf1ea] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-5">
                <div className="-mx-1 flex items-center gap-3 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 lg:pb-0">
                  {partnerItems.map((cooperative, index) => (
                    <Link
                      key={cooperative.id}
                      href={`/htx/${cooperative.code}`}
                      className="group min-w-[10rem] shrink-0 rounded-[1.55rem] border border-transparent px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#e5eadf] hover:bg-[#f8fbf7] lg:min-w-0"
                    >
                      <span className="mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-[#dce7d8] bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf4_100%)] shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:h-20 sm:w-20">
                        <span className="text-[0.88rem] font-extrabold uppercase tracking-[0.08em] text-[#1f9b4b] sm:text-[1.02rem]">
                          {cooperativeMonogram(cooperative.name)}
                        </span>
                      </span>
                      <p className="mt-3 line-clamp-2 text-[0.82rem] font-extrabold uppercase tracking-[0.06em] leading-5 text-[#1f2233] sm:text-[0.9rem]">
                        {cooperative.name}
                      </p>
                      <p className="mt-1 text-[0.72rem] text-slate-500">
                        {cooperative.province || "Việt Nam"}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
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
                      <p className="mt-4 line-clamp-2 text-sm font-extrabold uppercase tracking-[0.08em] text-[#1f2233]">
                        {cooperative.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {cooperative.province || "Việt Nam"}
                      </p>
                      <p className="mt-3 text-[0.78rem] font-semibold text-[#2b8a3e]">
                        {cooperative.productCount} sản phẩm công khai
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="mt-6">
              <EmptyPublicState
                title="Chưa có HTX công khai"
                description="HTX sẽ xuất hiện khi có dữ liệu sản phẩm được đăng công khai."
              />
            </div>
          )}
        </PublicSection>

        <PublicSection band={!isInternal}>
          <div className="relative isolate overflow-hidden rounded-[2.25rem] border border-[#dce6d8] shadow-[0_28px_60px_rgba(15,23,42,0.12)]">
            <PublicImage
              src={siteProfile.pageContent.homeImageUrl}
              alt={
                siteProfile.pageContent.homeImageAlt ||
                siteProfile.pageContent.homeTitle
              }
              wrapperClassName="aspect-[16/11] sm:aspect-[18/7] lg:aspect-[21/7]"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,31,26,0.26)_0%,rgba(16,31,26,0.58)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_30%)]" />
            <div className="absolute inset-0 flex items-center justify-center px-5 py-8 text-center text-white sm:px-8">
              <div className="max-w-3xl">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/76">
                  Kết nối công nghệ
                </p>
                <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-[2.9rem]">
                  {isInternal
                    ? "Đưa dữ liệu HTX ra thị trường bằng một luồng rõ ràng."
                    : "Kéo dữ liệu nông nghiệp lên một giao diện công khai gọn, rõ và dễ hiểu hơn."}
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

        {isInternal ? (
          <PublicSection>
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div className="max-w-[28rem]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e]">
                  Mô hình triển khai
                </p>
                <h2 className="mt-3 text-[2rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[3rem]">
                  {journeyTitle}
                </h2>
                <p className="mt-3 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {journeyDescription}
                </p>
                <Link
                  href="/gioi-thieu"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1f9b4b] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,155,75,0.18)] transition hover:-translate-y-0.5"
                >
                  Xem chi tiết hệ sinh thái
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {journeyCards.map(([step, title, text], index) => (
                  <article
                    key={`${step}-${title}`}
                    className={cn(
                      publicCardClass,
                      "h-full rounded-[2rem] p-5 sm:p-6",
                      index === 0
                        ? "bg-[linear-gradient(145deg,#0d1324_0%,#15324b_48%,#1f9b4b_100%)] text-white"
                        : "bg-white",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[0.72rem] font-semibold uppercase tracking-[0.18em]",
                        index === 0 ? "text-white/70" : "text-[#2b8a3e]",
                      )}
                    >
                      {step}
                    </p>
                    <h2
                      className={cn(
                        "mt-3 text-[1.18rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[1.3rem]",
                        index === 0 ? "text-white" : "text-[#1f2233]",
                      )}
                    >
                      {title}
                    </h2>
                    <p
                      className={cn(
                        "mt-3 text-[0.95rem] leading-7",
                        index === 0 ? "text-white/82" : "text-slate-600",
                      )}
                    >
                      {text}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </PublicSection>
        ) : null}

        <PublicSection>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#24283a] sm:text-[2.8rem]">
                Tin tức mới nhất
              </h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                {newsDescription}
              </p>
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
                <NewsCard
                  key={article.id}
                  article={article}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyPublicState
                title="Chưa có tin tức công khai"
                description="Tin tức do đội vận hành đăng sẽ xuất hiện tại đây."
              />
            </div>
          )}
        </PublicSection>
      </main>
    </PublicShell>
  );
}
