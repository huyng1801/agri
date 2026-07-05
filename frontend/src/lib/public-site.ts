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

export const defaultPublicSiteProfile: PublicSiteProfile = {
  appName: 'HTXONLINE',
  hotline: '0900000000',
  hotlineDisplay: '0900 000 000',
  supportEmail: 'support@htxonline.vn',
  address: 'Viet Nam',
  zaloUrl: 'https://zalo.me',
  messengerUrl: '',
  mapEmbedUrl: '',
  faqs: [
    {
      question: 'HTXONLINE ho tro gi cho hop tac xa?',
      answer: 'Quan ly san pham, vung trong, QR truy xuat va don COD tren cung mot nen tang.'
    },
    {
      question: 'Nguoi mua co can dang nhap de xem QR?',
      answer: 'Khong. QR Passport public duoc mo truc tiep cho khach truy cap.'
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
    zaloUrl: stringValue(profile?.zaloUrl) || defaultPublicSiteProfile.zaloUrl,
    messengerUrl: stringValue(profile?.messengerUrl),
    mapEmbedUrl: stringValue(profile?.mapEmbedUrl),
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
