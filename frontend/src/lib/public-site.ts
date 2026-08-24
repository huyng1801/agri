import { type PublicSiteKey } from './domain';
import { API_URL, type ApiEnvelope } from './api';

export type PublicSiteFaq = {
  question: string;
  answer: string;
};

export type PublicPageContent = {
  homeBadge: string;
  homeTitle: string;
  homeDescription: string;
  homeImageUrl: string;
  homeImageAlt: string;
  introTitle: string;
  introDescription: string;
  introImageUrl: string;
  introImageAlt: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  aboutImageAlt: string;
  contactTitle: string;
  contactDescription: string;
  contactImageUrl: string;
  contactImageAlt: string;
};

export type PublicSiteProfile = {
  appName: string;
  hotline: string;
  hotlineDisplay: string;
  supportEmail: string;
  address: string;
  zaloUrl: string;
  messengerUrl: string;
  mapEmbedUrl: string;
  faqs: PublicSiteFaq[];
  pageContent: PublicPageContent;
};

export type PublicMapLocation = {
  latitude: number;
  longitude: number;
};

export const defaultMapEmbedUrl =
  'https://www.openstreetmap.org/export/embed.html?bbox=105.668%2C10.3958%2C105.768%2C10.4958&layer=mapnik&marker=10.4458%2C105.718';

export const defaultPublicMapLocation: PublicMapLocation = {
  latitude: 10.4458,
  longitude: 105.718
};

const sharedContactProfile = {
  hotline: '0907001200',
  hotlineDisplay: '0907 001 200',
  supportEmail: 'Agripassport@gmail.com',
  address: 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp',
  zaloUrl: '',
  messengerUrl: '',
  mapEmbedUrl: defaultMapEmbedUrl
} as const;

const siteDefaults: Record<Exclude<PublicSiteKey, 'local'>, PublicSiteProfile> = {
  htxonline: {
    appName: 'HTXONLINE',
    ...sharedContactProfile,
    faqs: [
      {
        question: 'HTXONLINE hỗ trợ gì cho hợp tác xã?',
        answer: 'Quản lý thành viên, mức độ sử dụng dịch vụ, thu chi, xuất nhập và báo cáo vận hành nội bộ của hợp tác xã.'
      },
      {
        question: 'HTXONLINE có phải sàn bán hàng công khai không?',
        answer: 'Không. HTXONLINE giữ vai trò quản trị nội bộ và số hóa hoạt động của hợp tác xã.'
      },
      {
        question: 'Dữ liệu sản phẩm được xử lý ở đâu?',
        answer: 'Dữ liệu sản phẩm nông nghiệp, truy xuất và kênh công khai được đưa lên Agripassport để quản lý tập trung.'
      },
      {
        question: 'Nếu cần hỗ trợ vận hành hệ thống thì liên hệ ai?',
        answer: 'Gọi hotline 0907 001 200 hoặc email Agripassport@gmail.com để đội vận hành hỗ trợ nhanh.'
      }
    ],
    pageContent: {
      homeBadge: 'Hệ thống quản trị nội bộ cho hợp tác xã',
      homeTitle: 'HTXONLINE giúp hợp tác xã quản lý thành viên và vận hành nội bộ rõ ràng hơn.',
      homeDescription:
        'Tập trung hồ sơ xã viên, mức độ sử dụng dịch vụ, thu chi, xuất nhập và báo cáo điều hành trên một hệ thống số gọn, dễ theo dõi và dễ đối soát.',
      homeImageUrl:
        'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
      homeImageAlt: 'Hệ thống số hỗ trợ quản trị nội bộ cho hợp tác xã',
      introTitle: 'Giới thiệu HTXONLINE',
      introDescription: 'Nền tảng phục vụ quản trị thành viên, vận hành nội bộ và số hóa dữ liệu quản lý của hợp tác xã.',
      introImageUrl:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      introImageAlt: 'Hoạt động điều hành nội bộ và dữ liệu quản trị hợp tác xã',
      aboutTitle: 'HTXONLINE là lớp quản trị nội bộ của hợp tác xã',
      aboutDescription:
        'Nền tảng tập trung vào thành viên, dịch vụ, thu chi, xuất nhập và lịch sử hoạt động, thay vì lấy bán hàng công khai làm chức năng cốt lõi.',
      aboutImageUrl:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
      aboutImageAlt: 'Quản trị nội bộ hợp tác xã theo hướng số hóa',
      contactTitle: 'Cần tư vấn triển khai quản trị số cho hợp tác xã?',
      contactDescription:
        'Đội vận hành sẽ hỗ trợ chuẩn hóa quy trình quản lý nội bộ, phân quyền và luồng đồng bộ dữ liệu giữa HTXONLINE và Agripassport.',
      contactImageUrl:
        'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
      contactImageAlt: 'Tư vấn triển khai chuyển đổi số cho hợp tác xã'
    }
  },
  agripassport: {
    appName: 'AGRIPASSPORT',
    ...sharedContactProfile,
    faqs: [
      {
        question: 'Agripassport hỗ trợ gì cho hợp tác xã?',
        answer: 'Quản lý sản phẩm, vùng trồng, nhật ký, chứng nhận, QR truy xuất và kênh công khai tiêu thụ trên cùng một nền tảng.'
      },
      {
        question: 'Người mua có cần đăng nhập để xem QR không?',
        answer: 'Không. QR truy xuất và thông tin công khai có thể được mở trực tiếp cho khách truy cập.'
      },
      {
        question: 'Ai xác nhận đơn hàng COD?',
        answer: 'HTX hoặc bộ phận vận hành sẽ gọi điện xác nhận trước khi giao hàng.'
      },
      {
        question: 'Nếu tra cứu QR hoặc đơn hàng chưa ra kết quả thì liên hệ ai?',
        answer: 'Gọi hotline 0907 001 200 hoặc email Agripassport@gmail.com để đội vận hành hỗ trợ kiểm tra nhanh.'
      }
    ],
    pageContent: {
      homeBadge: 'Nền tảng dữ liệu sản phẩm nông nghiệp',
      homeTitle: 'AGRIPASSPORT giúp hợp tác xã công khai sản phẩm và QR truy xuất đồng bộ hơn.',
      homeDescription:
        'Chuẩn hóa tên hợp tác xã, dữ liệu sản phẩm, vùng trồng, chứng nhận và hồ sơ truy xuất để thuận lợi cho công khai, kết nối tiêu thụ và làm hồ sơ phù hợp quy định.',
      homeImageUrl:
        'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
      homeImageAlt: 'Nền tảng dữ liệu sản phẩm nông nghiệp và truy xuất số',
      introTitle: 'Giới thiệu AGRIPASSPORT',
      introDescription: 'Nền tảng chuyên trách cho dữ liệu sản phẩm nông nghiệp, QR truy xuất và kênh công khai tiêu thụ.',
      introImageUrl:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      introImageAlt: 'Dữ liệu sản phẩm, vùng trồng và truy xuất được chuẩn hóa',
      aboutTitle: 'Chúng tôi là AGRIPASSPORT',
      aboutDescription:
        'Nền tảng tập trung quản lý thông tin sản phẩm, vùng trồng, nhật ký, chứng nhận và hộ chiếu số để hỗ trợ minh bạch và kết nối thị trường.',
      aboutImageUrl:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
      aboutImageAlt: 'Sản phẩm nông nghiệp và dữ liệu truy xuất trên nền tảng số',
      contactTitle: 'Hãy để AGRIPASSPORT đồng hành cùng dữ liệu sản phẩm của hợp tác xã bạn',
      contactDescription:
        'Tư vấn chuẩn hóa danh mục sản phẩm, vùng trồng, QR truy xuất, chứng nhận và luồng công khai dữ liệu phục vụ kết nối tiêu thụ.',
      contactImageUrl:
        'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
      contactImageAlt: 'Không gian hỗ trợ chuẩn hóa dữ liệu sản phẩm nông nghiệp'
    }
  },
  passport: {
    appName: 'HỘ CHIẾU NÔNG NGHIỆP',
    ...sharedContactProfile,
    faqs: [
      {
        question: 'Hộ chiếu nông nghiệp là gì?',
        answer: 'Đây là hồ sơ số gắn với sản phẩm, lô sản phẩm hoặc vùng trồng để phục vụ truy xuất và minh bạch thông tin.'
      },
      {
        question: 'Tra cứu bằng cách nào?',
        answer: 'Quét QR Code hoặc mở đường dẫn hồ sơ công khai để xem nguồn gốc, vùng trồng, nhật ký và chứng nhận khi có.'
      },
      {
        question: 'Dữ liệu hộ chiếu được lấy từ đâu?',
        answer: 'Hộ chiếu số được tạo từ dữ liệu sản phẩm trên Agripassport và chỉ hiển thị thông tin đã được HTX phê duyệt công khai.'
      },
      {
        question: 'Nếu QR không mở đúng hồ sơ thì liên hệ ai?',
        answer: 'Gọi hotline 0907 001 200 hoặc email Agripassport@gmail.com để đội vận hành hỗ trợ kiểm tra nhanh.'
      }
    ],
    pageContent: {
      homeBadge: 'Hồ sơ số gắn với sản phẩm và lô sản phẩm',
      homeTitle: 'HỘ CHIẾU NÔNG NGHIỆP giúp người mua truy xuất nguồn gốc nhanh và rõ hơn.',
      homeDescription:
        'Mỗi QR mở ra một hồ sơ công khai về sản phẩm, vùng trồng, quá trình canh tác và chứng nhận phù hợp để minh bạch thông tin với người tiêu dùng và đối tác.',
      homeImageUrl:
        'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
      homeImageAlt: 'QR truy xuất cho sản phẩm nông nghiệp',
      introTitle: 'Giới thiệu Hộ chiếu nông nghiệp',
      introDescription: 'Hồ sơ số được tạo từ dữ liệu sản phẩm trên Agripassport để phục vụ truy xuất và minh bạch thông tin.',
      introImageUrl:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      introImageAlt: 'Hồ sơ QR và truy xuất nguồn gốc nông nghiệp',
      aboutTitle: 'Mỗi QR là một hồ sơ nguồn gốc công khai',
      aboutDescription:
        'Người mua, đối tác và các bên được phép tra cứu có thể xem vùng trồng, nhật ký, chứng nhận và dữ liệu nguồn gốc theo phạm vi HTX công khai.',
      aboutImageUrl:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
      aboutImageAlt: 'Minh bạch nguồn gốc thông qua hồ sơ số',
      contactTitle: 'Cần tư vấn triển khai QR và hộ chiếu số cho sản phẩm?',
      contactDescription:
        'Đội vận hành hỗ trợ chuẩn hóa dữ liệu truy xuất, cấu trúc QR và phạm vi thông tin công khai để hồ sơ số rõ ràng, đáng tin hơn.',
      contactImageUrl:
        'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
      contactImageAlt: 'Hỗ trợ triển khai QR và hồ sơ số cho nông sản'
    }
  }
};

export const defaultPublicSiteProfile = siteDefaults.agripassport;

export function defaultPublicSiteProfileForSite(siteKey: PublicSiteKey) {
  return siteDefaults[siteKey === 'local' ? 'agripassport' : siteKey];
}

export async function getPublicSiteProfile(siteKey: PublicSiteKey = 'agripassport') {
  try {
    const response = await fetch(`${API_URL}/settings/public/site-profile`, { cache: 'no-store' });
    if (!response.ok) return defaultPublicSiteProfileForSite(siteKey);
    const body = (await response.json()) as ApiEnvelope<Partial<PublicSiteProfile>>;
    return normalizePublicSiteProfile(body.data, siteKey);
  } catch {
    return defaultPublicSiteProfileForSite(siteKey);
  }
}

export function normalizePublicSiteProfile(profile?: Partial<PublicSiteProfile> | null, siteKey: PublicSiteKey = 'agripassport'): PublicSiteProfile {
  const defaults = defaultPublicSiteProfileForSite(siteKey);
  const allowMarketingOverrides = siteKey === 'agripassport';
  return {
    appName: defaults.appName,
    hotline: stringValue(profile?.hotline) || defaults.hotline,
    hotlineDisplay: stringValue(profile?.hotlineDisplay) || stringValue(profile?.hotline) || defaults.hotlineDisplay,
    supportEmail: stringValue(profile?.supportEmail) || defaults.supportEmail,
    address: normalizeBrandCopy(stringValue(profile?.address), siteKey) || defaults.address,
    zaloUrl: stringValue(profile?.zaloUrl),
    messengerUrl: stringValue(profile?.messengerUrl),
    mapEmbedUrl: stringValue(profile?.mapEmbedUrl) || defaults.mapEmbedUrl,
    faqs: faqItems(profile?.faqs, defaults, siteKey, allowMarketingOverrides),
    pageContent: pageContentItems(profile?.pageContent, defaults, siteKey, allowMarketingOverrides)
  };
}

export function telHref(value: string) {
  return `tel:${value.replace(/\s+/g, '')}`;
}

export function getPublicMapLocation(profile?: Pick<PublicSiteProfile, 'mapEmbedUrl'> | null): PublicMapLocation {
  const source = stringValue(profile?.mapEmbedUrl);
  if (!source) return defaultPublicMapLocation;

  try {
    const url = new URL(source);
    const markerValue = url.searchParams.get('marker') || url.searchParams.get('ll') || url.searchParams.get('q');
    if (markerValue) {
      const location = parseCoordinates(markerValue);
      if (location) return location;
    }

    if (url.hash.startsWith('#map=')) {
      const hashLocation = parseCoordinates(url.hash.replace('#map=', '').split('/').slice(-2).join(','));
      if (hashLocation) return hashLocation;
    }
  } catch {
    const location = parseCoordinates(source);
    if (location) return location;
  }

  return defaultPublicMapLocation;
}

function faqItems(value: unknown, defaults: PublicSiteProfile, siteKey: PublicSiteKey, allowOverrides: boolean): PublicSiteFaq[] {
  if (!allowOverrides || !Array.isArray(value)) return defaults.faqs;
  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const question = normalizeBrandCopy(stringValue((item as PublicSiteFaq).question), siteKey);
      const answer = normalizeBrandCopy(stringValue((item as PublicSiteFaq).answer), siteKey);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is PublicSiteFaq => Boolean(item));
  return items.length ? items : defaults.faqs;
}

function pageContentItems(
  value: unknown,
  defaults: PublicSiteProfile,
  siteKey: PublicSiteKey,
  allowOverrides: boolean
): PublicPageContent {
  const object = value && typeof value === 'object' && !Array.isArray(value) ? (value as Partial<PublicPageContent>) : {};
  if (!allowOverrides) return defaults.pageContent;
  return {
    homeBadge: normalizeBrandCopy(stringValue(object.homeBadge), siteKey) || defaults.pageContent.homeBadge,
    homeTitle: normalizeBrandCopy(stringValue(object.homeTitle), siteKey) || defaults.pageContent.homeTitle,
    homeDescription: normalizeBrandCopy(stringValue(object.homeDescription), siteKey) || defaults.pageContent.homeDescription,
    homeImageUrl: stringValue(object.homeImageUrl) || defaults.pageContent.homeImageUrl,
    homeImageAlt: normalizeBrandCopy(stringValue(object.homeImageAlt), siteKey) || defaults.pageContent.homeImageAlt,
    introTitle: normalizeBrandCopy(stringValue(object.introTitle), siteKey) || defaults.pageContent.introTitle,
    introDescription: normalizeBrandCopy(stringValue(object.introDescription), siteKey) || defaults.pageContent.introDescription,
    introImageUrl: stringValue(object.introImageUrl) || defaults.pageContent.introImageUrl,
    introImageAlt: normalizeBrandCopy(stringValue(object.introImageAlt), siteKey) || defaults.pageContent.introImageAlt,
    aboutTitle: normalizeBrandCopy(stringValue(object.aboutTitle), siteKey) || defaults.pageContent.aboutTitle,
    aboutDescription: normalizeBrandCopy(stringValue(object.aboutDescription), siteKey) || defaults.pageContent.aboutDescription,
    aboutImageUrl: stringValue(object.aboutImageUrl) || defaults.pageContent.aboutImageUrl,
    aboutImageAlt: normalizeBrandCopy(stringValue(object.aboutImageAlt), siteKey) || defaults.pageContent.aboutImageAlt,
    contactTitle: normalizeBrandCopy(stringValue(object.contactTitle), siteKey) || defaults.pageContent.contactTitle,
    contactDescription: normalizeBrandCopy(stringValue(object.contactDescription), siteKey) || defaults.pageContent.contactDescription,
    contactImageUrl: stringValue(object.contactImageUrl) || defaults.pageContent.contactImageUrl,
    contactImageAlt: normalizeBrandCopy(stringValue(object.contactImageAlt), siteKey) || defaults.pageContent.contactImageAlt
  };
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizePublicCopy(value: string) {
  if (!value) return '';
  return value
    .replace(/\bQR Passport public\b/gi, 'QR Passport công khai')
    .replace(/\btrang public\b/gi, 'trang công khai')
    .replace(/\bsản phẩm public\b/gi, 'sản phẩm công khai')
    .replace(/\bchứng nhận public\b/gi, 'chứng nhận công khai')
    .replace(/\bHTX public\b/gi, 'HTX công khai')
    .replace(/\bđã publish\b/gi, 'đã đăng công khai')
    .replace(/\bpublish\b/gi, 'đăng công khai')
    .replace(/\bpublic\b/gi, 'công khai')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeBrandCopy(value: string, siteKey: PublicSiteKey) {
  const normalized = normalizePublicCopy(value);
  if (!normalized) return '';
  if (siteKey === 'htxonline') {
    return normalized
      .replace(/\bAGRIPASSPORT\b/gi, 'HTXONLINE')
      .replace(/\bAgri Passport\b/gi, 'HTXONLINE');
  }
  if (siteKey === 'passport') {
    return normalized
      .replace(/\bHTXONLINE\b/gi, 'Hộ chiếu nông nghiệp')
      .replace(/\bAGRIPASSPORT\b/gi, 'Hộ chiếu nông nghiệp')
      .replace(/\bAgri Passport\b/gi, 'Hộ chiếu nông nghiệp')
      .replace(/\bQR Passport\b/gi, 'hộ chiếu số');
  }
  return normalized
    .replace(/\bHTXONLINE\b/gi, 'AGRIPASSPORT')
    .replace(/\bAgri Passport\b/gi, 'AGRIPASSPORT');
}

function parseCoordinates(value: string): PublicMapLocation | null {
  const matches = value.match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 2) return null;
  const latitude = Number(matches[0]);
  const longitude = Number(matches[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}
