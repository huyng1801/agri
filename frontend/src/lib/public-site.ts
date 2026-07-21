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

export const defaultMapEmbedUrl =
  'https://www.openstreetmap.org/export/embed.html?bbox=105.668%2C10.3958%2C105.768%2C10.4958&layer=mapnik&marker=10.4458%2C105.718';

export const defaultPublicSiteProfile: PublicSiteProfile = {
  appName: 'HTXONLINE',
  hotline: '0907001200',
  hotlineDisplay: '0907 001 200',
  supportEmail: 'Agripassport@gmail.com',
  address: 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp, Việt Nam',
  zaloUrl: '',
  messengerUrl: '',
  mapEmbedUrl: defaultMapEmbedUrl,
  faqs: [
    {
      question: 'HTXONLINE hỗ trợ gì cho hợp tác xã?',
      answer: 'Quản lý sản phẩm, vùng trồng, QR truy xuất và đơn COD trên cùng một nền tảng.'
    },
    {
      question: 'Người mua có cần đăng nhập để xem QR?',
      answer: 'Không. QR Passport public được mở trực tiếp cho khách truy cập.'
    }
  ],
  pageContent: {
    homeBadge: 'Nền tảng số cho hợp tác xã',
    homeTitle: 'HTXONLINE giúp hợp tác xã bán hàng minh bạch hơn trên môi trường số.',
    homeDescription:
      'Công khai sản phẩm, mở QR Passport cho người mua và vận hành quy trình đơn COD trên cùng một hệ thống gọn, rõ và dễ tin tưởng.',
    homeImageUrl:
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
    homeImageAlt: 'Nông sản tươi và hoạt động kết nối của hợp tác xã trên môi trường số',
    introTitle: 'Giới thiệu HTXONLINE',
    introDescription: 'Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.',
    introImageUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    introImageAlt: 'Khu vực trồng trọt xanh và nông dân đang chăm sóc nông sản',
    aboutTitle: 'Chúng tôi là HTXONLINE',
    aboutDescription:
      'Sàn nông sản số giúp hợp tác xã kết nối thị trường, minh bạch nguồn gốc và bán hàng COD hiệu quả.',
    aboutImageUrl:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    aboutImageAlt: 'Thành viên hợp tác xã và nông sản đặc trưng Việt Nam',
    contactTitle: 'Hãy để HTXONLINE kết nối và đồng hành cùng hợp tác xã của bạn',
    contactDescription:
      'Tư vấn tham gia sàn, QR truy xuất nguồn gốc, hỗ trợ đơn hàng COD và vận hành số cho HTX.',
    contactImageUrl:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    contactImageAlt: 'Không gian trao đổi và hỗ trợ vận hành cho hợp tác xã'
  }
};

export async function getPublicSiteProfile() {
  try {
    const response = await fetch(`${API_URL}/settings/public/site-profile`, { cache: 'no-store' });
    if (!response.ok) return defaultPublicSiteProfile;
    const body = (await response.json()) as ApiEnvelope<Partial<PublicSiteProfile>>;
    return normalizePublicSiteProfile(body.data);
  } catch {
    return defaultPublicSiteProfile;
  }
}

export function normalizePublicSiteProfile(profile?: Partial<PublicSiteProfile> | null): PublicSiteProfile {
  return {
    appName: stringValue(profile?.appName) || defaultPublicSiteProfile.appName,
    hotline: stringValue(profile?.hotline) || defaultPublicSiteProfile.hotline,
    hotlineDisplay: stringValue(profile?.hotlineDisplay) || stringValue(profile?.hotline) || defaultPublicSiteProfile.hotlineDisplay,
    supportEmail: stringValue(profile?.supportEmail) || defaultPublicSiteProfile.supportEmail,
    address: stringValue(profile?.address) || defaultPublicSiteProfile.address,
    zaloUrl: stringValue(profile?.zaloUrl),
    messengerUrl: stringValue(profile?.messengerUrl),
    mapEmbedUrl: stringValue(profile?.mapEmbedUrl) || defaultPublicSiteProfile.mapEmbedUrl,
    faqs: faqItems(profile?.faqs),
    pageContent: pageContentItems(profile?.pageContent)
  };
}

export function telHref(value: string) {
  return `tel:${value.replace(/\s+/g, '')}`;
}

function faqItems(value: unknown): PublicSiteFaq[] {
  if (!Array.isArray(value)) return defaultPublicSiteProfile.faqs;
  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const question = stringValue((item as PublicSiteFaq).question);
      const answer = stringValue((item as PublicSiteFaq).answer);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is PublicSiteFaq => Boolean(item));
  return items.length ? items : defaultPublicSiteProfile.faqs;
}

function pageContentItems(value: unknown): PublicPageContent {
  const object = value && typeof value === 'object' && !Array.isArray(value) ? (value as Partial<PublicPageContent>) : {};
  return {
    homeBadge: stringValue(object.homeBadge) || defaultPublicSiteProfile.pageContent.homeBadge,
    homeTitle: stringValue(object.homeTitle) || defaultPublicSiteProfile.pageContent.homeTitle,
    homeDescription: stringValue(object.homeDescription) || defaultPublicSiteProfile.pageContent.homeDescription,
    homeImageUrl: stringValue(object.homeImageUrl) || defaultPublicSiteProfile.pageContent.homeImageUrl,
    homeImageAlt: stringValue(object.homeImageAlt) || defaultPublicSiteProfile.pageContent.homeImageAlt,
    introTitle: stringValue(object.introTitle) || defaultPublicSiteProfile.pageContent.introTitle,
    introDescription: stringValue(object.introDescription) || defaultPublicSiteProfile.pageContent.introDescription,
    introImageUrl: stringValue(object.introImageUrl) || defaultPublicSiteProfile.pageContent.introImageUrl,
    introImageAlt: stringValue(object.introImageAlt) || defaultPublicSiteProfile.pageContent.introImageAlt,
    aboutTitle: stringValue(object.aboutTitle) || defaultPublicSiteProfile.pageContent.aboutTitle,
    aboutDescription: stringValue(object.aboutDescription) || defaultPublicSiteProfile.pageContent.aboutDescription,
    aboutImageUrl: stringValue(object.aboutImageUrl) || defaultPublicSiteProfile.pageContent.aboutImageUrl,
    aboutImageAlt: stringValue(object.aboutImageAlt) || defaultPublicSiteProfile.pageContent.aboutImageAlt,
    contactTitle: stringValue(object.contactTitle) || defaultPublicSiteProfile.pageContent.contactTitle,
    contactDescription: stringValue(object.contactDescription) || defaultPublicSiteProfile.pageContent.contactDescription,
    contactImageUrl: stringValue(object.contactImageUrl) || defaultPublicSiteProfile.pageContent.contactImageUrl,
    contactImageAlt: stringValue(object.contactImageAlt) || defaultPublicSiteProfile.pageContent.contactImageAlt
  };
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
