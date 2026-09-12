import type { LucideIcon } from 'lucide-react';
import { QrCode, Scan } from 'lucide-react';
import type { PublicSiteKey } from './domain';

export type PublicNavigationChild = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type PublicNavigationEntry =
  | { kind: 'link'; href: string; label: string }
  | { kind: 'dropdown'; href: string; label: string; items: readonly PublicNavigationChild[] };

const marketplaceNavigation = [
  { kind: 'link', href: '/', label: 'Trang chủ' },
  { kind: 'link', href: '/ve-chung-toi', label: 'Về Agripassport' },
  { kind: 'link', href: '/san-pham', label: 'Sản phẩm' },
  { kind: 'link', href: '/htx', label: 'Hợp tác xã' },
  { kind: 'link', href: '/san-pham?hasQr=true', label: 'Truy xuất QR' },
  { kind: 'link', href: '/tin-tuc', label: 'Tin tức' },
  { kind: 'link', href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

const internalNavigation = [
  { kind: 'link', href: '/', label: 'Trang chủ' },
  { kind: 'link', href: '/san-pham', label: 'Sản phẩm' },
  { kind: 'link', href: '/htx', label: 'HTX' },
  { kind: 'link', href: '/gioi-thieu', label: 'Dịch vụ' },
  { kind: 'link', href: '/tin-tuc', label: 'Tin tức' },
  { kind: 'link', href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

const passportNavigation = [
  { kind: 'link', href: '/', label: 'Trang chủ' },
  { kind: 'link', href: '/gioi-thieu', label: 'Giới thiệu' },
  {
    kind: 'dropdown',
    href: '/cay',
    label: 'Hộ chiếu cây',
    items: [
      {
        href: '/truy-xuat',
        label: 'Truy xuất',
        description: 'Tra cứu thông tin nguồn gốc',
        icon: Scan
      },
      {
        href: '/san-pham?hasQr=true',
        label: 'Sản phẩm có QR',
        description: 'Xem các hồ sơ đã cấp mã',
        icon: QrCode
      }
    ]
  },
  { kind: 'link', href: '/htx', label: 'Đối tác' },
  { kind: 'link', href: '/tin-tuc', label: 'Tin tức' },
  { kind: 'link', href: '/lien-he', label: 'Liên hệ' }
] as const satisfies readonly PublicNavigationEntry[];

export function getPublicNavigation(siteKey: PublicSiteKey): readonly PublicNavigationEntry[] {
  if (siteKey === 'passport') return passportNavigation;
  if (siteKey === 'htxonline') return internalNavigation;
  return marketplaceNavigation;
}
