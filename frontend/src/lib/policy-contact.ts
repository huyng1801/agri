import type { PublicSiteProfile } from './public-site';

export function buildPolicyContactSection(siteProfile: PublicSiteProfile, lead: string) {
  return {
    title: 'Thông tin liên hệ',
    paragraphs: [lead],
    bullets: [
      `Địa chỉ: ${siteProfile.address}`,
      `Hotline: ${siteProfile.hotlineDisplay}`,
      `Email: ${siteProfile.supportEmail}`,
      'Website: htxonline.vn'
    ]
  };
}
