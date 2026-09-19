import type { PublicSiteKey } from './domain';

export type PublicNavigationEntry = { href: string; label: string };

const marketplaceNavigation = [
  { href: '/', label: 'Trang chủ' },
  { href: '/ve-chung-toi', label: 'Về Agripassport' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'Hợp tác xã' },
  { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

const internalNavigation = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'HTX' },
  { href: '/gioi-thieu', label: 'Dịch vụ' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

const passportNavigation = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/truy-xuat', label: 'Tra cứu' },
  { href: '/htx', label: 'Đối tác' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

const mobileMarketplaceNavigation = marketplaceNavigation.filter((entry) => !['/ve-chung-toi', '/htx'].includes(entry.href));
const mobileInternalNavigation = internalNavigation.filter((entry) => entry.href !== '/gioi-thieu');
const mobilePassportNavigation = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/truy-xuat', label: 'Tra cứu' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

export function getPublicNavigation(siteKey: PublicSiteKey): readonly PublicNavigationEntry[] {
  if (siteKey === 'passport') return passportNavigation;
  if (siteKey === 'htxonline') return internalNavigation;
  return marketplaceNavigation;
}

/** Keep the persistent mobile bar focused on the five highest-value destinations. */
export function getPublicMobileNavigation(siteKey: PublicSiteKey): readonly PublicNavigationEntry[] {
  if (siteKey === 'passport') return mobilePassportNavigation;
  if (siteKey === 'htxonline') return mobileInternalNavigation;
  return mobileMarketplaceNavigation;
}
