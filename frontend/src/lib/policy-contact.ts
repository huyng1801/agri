import type { PublicSiteProfile } from './public-site';

export function buildPolicyContactSection(siteProfile: PublicSiteProfile, lead: string) {
  return {
    title: 'Thong tin lien he',
    paragraphs: [lead],
    bullets: [
      `Dia chi: ${siteProfile.address}`,
      `Hotline: ${siteProfile.hotlineDisplay}`,
      `Email: ${siteProfile.supportEmail}`,
      'Website: htxonline.vn',
      'Thoi gian ho tro: Thu Hai den Thu Sau, 08:00 - 17:00 (Gio Viet Nam)'
    ]
  };
}
