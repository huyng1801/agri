import { API_URL, type ApiEnvelope } from './api';

export type PublicSiteFaq = {
  question: string;
  answer: string;
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
  ]
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
    faqs: faqItems(profile?.faqs)
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

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
