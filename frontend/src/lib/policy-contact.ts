import { publicOriginForSite, type PublicSiteKey } from './domain';
import type { PublicSiteProfile } from './public-site';

export function buildPolicyContactSection(siteProfile: PublicSiteProfile, lead: string, siteKey: PublicSiteKey = 'agripassport') {
  return {
    kind: 'contact' as const,
    title: 'Thông tin liên hệ',
    paragraphs: [lead],
    bullets: [
      `Địa chỉ: ${siteProfile.address}`,
      `Hotline: ${siteProfile.hotlineDisplay}`,
      `Email: ${siteProfile.supportEmail}`,
      `Website: ${new URL(publicOriginForSite(siteKey)).host}`,
      'Thời gian hỗ trợ: Thứ Hai đến Thứ Sáu, 08:00 - 17:00 (Giờ Việt Nam)'
    ]
  };
}
