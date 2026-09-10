import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getPublicMapLocation, getPublicSiteProfile, getPublicZaloUrl, telHref } from '@/lib/public-site';
import { htxonlineUrl, marketplaceUrl, passportUrl, type PublicSiteKey } from '@/lib/domain';
import { publicContainerClass } from './public-layout';
import { PublicLogo } from './public-logo';
import { PublicMapPreview } from './public-map-preview';
import { ZaloIcon } from './zalo-icon';
import { cn } from './ui';

type FooterLink = { href: string; label: string; external?: boolean };
type FooterSection = { title: string; links: FooterLink[] };

const agripassportFooterSections: FooterSection[] = [
  {
    title: 'Nền tảng Agripassport',
    links: [
      { href: '/san-pham', label: 'Danh mục nông sản' },
      { href: '/htx', label: 'Danh bạ hợp tác xã' },
      { href: '/san-pham?hasQr=true', label: 'Tra cứu QR' }
    ]
  },
  {
    title: 'Nội dung & hỗ trợ',
    links: [
      { href: '/ve-chung-toi', label: 'Về Agripassport' },
      { href: '/tin-tuc', label: 'Tin tức Agripassport' },
      { href: '/tuyen-dung', label: 'Cơ hội hợp tác' }
    ]
  },
  {
    title: 'Mắt xích hệ sinh thái',
    links: [
      { href: htxonlineUrl('/'), label: 'HTXONLINE', external: true },
      { href: passportUrl('/'), label: 'Hộ chiếu nông nghiệp', external: true },
      { href: '/lien-he', label: 'Liên hệ Agripassport' }
    ]
  }
];

const passportFooterSections: FooterSection[] = [
  {
    title: 'Hộ chiếu cây',
    links: [
      { href: '/cay', label: 'Danh sách cây' },
      { href: '/cay', label: 'Bản đồ tận cây' },
      { href: '/tuyen-cong-tac-vien', label: 'Cộng tác viên' }
    ]
  },
  {
    title: 'Truy xuất công khai',
    links: [
      { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR' },
      { href: '/truy-xuat', label: 'Truy xuất sản phẩm' },
      { href: '/htx', label: 'Vùng trồng & đối tác' }
    ]
  },
  {
    title: 'Kết nối hệ sinh thái',
    links: [
      { href: marketplaceUrl('/'), label: 'AGRIPASSPORT', external: true },
      { href: htxonlineUrl('/'), label: 'HTXONLINE', external: true },
      { href: '/lien-he', label: 'Liên hệ Hộ chiếu' }
    ]
  }
];

const internalFooterSections: FooterSection[] = [
  {
    title: 'Khám phá dữ liệu',
    links: [
      { href: '/san-pham', label: 'Sản phẩm công khai' },
      { href: '/htx', label: 'Hợp tác xã đối tác' },
      { href: '/gioi-thieu', label: 'Dịch vụ vận hành' }
    ]
  },
  {
    title: 'Giải pháp & quy trình',
    links: [
      { href: '/gioi-thieu', label: 'Giới thiệu HTXONLINE' },
      { href: '/tin-tuc', label: 'Bản tin nông nghiệp' },
      { href: '/huong-dan-mua-hang', label: 'Hướng dẫn sử dụng' }
    ]
  },
  {
    title: 'Hỗ trợ khách hàng',
    links: [
      { href: '/cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' },
      { href: '/dieu-khoan-su-dung', label: 'Điều khoản dịch vụ' },
      { href: '/chinh-sach-bao-mat', label: 'Chính sách bảo mật' }
    ]
  }
];

export async function PublicFooter({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const profile = await getPublicSiteProfile(siteKey);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`;
  const mapLocation = getPublicMapLocation(profile);
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const zaloUrl = isPassport ? getPublicZaloUrl(profile, true) : '';
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';
  const footerSections = isInternal ? internalFooterSections : isPassport ? passportFooterSections : agripassportFooterSections;

  const brandName = isInternal ? 'HTXONLINE' : isPassport ? 'HỘ CHIẾU NÔNG NGHIỆP' : 'AGRIPASSPORT';
  const brandDescription = isInternal
    ? 'Hệ thống quản trị nội bộ cho hợp tác xã: chuẩn hóa dữ liệu thành viên, quản lý sản xuất, tài chính và đồng bộ công khai.'
    : isPassport
      ? 'Nền tảng định danh tận cây: mỗi cá thể có một hồ sơ sống, mỗi sản phẩm có thể truy ngược về vùng và cây tạo ra.'
      : 'Nền tảng dữ liệu công khai cho nông sản và hợp tác xã: chuẩn hóa sản phẩm, mở hồ sơ QR và kết nối thị trường.';

  const brandOrg = isInternal
    ? 'Hệ thống Quản trị Hợp tác xã HTXONLINE'
    : isPassport
      ? 'Hệ thống truy xuất Hộ chiếu nông nghiệp'
      : 'Tổ hợp tác công nghệ nông nghiệp Agripassport';

  const copyrightText = isInternal
    ? `© ${new Date().getFullYear()} HTXONLINE. Nền tảng Quản trị Hợp tác xã Số.`
    : isPassport
      ? `© ${new Date().getFullYear()} HỘ CHIẾU NÔNG NGHIỆP`
      : `© ${new Date().getFullYear()} AGRIPASSPORT`;

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-white text-[var(--text-primary)]">
      {/* Main four-column grid */}
      <div className={cn(publicContainerClass, 'py-10 sm:py-12 lg:py-14')}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Organization & Identity */}
          <div className="space-y-3">
            <Link href="/" className="inline-block" aria-label={`${brandName} - Trang chủ`}>
              <PublicLogo size={38} variant={logoVariant} className="h-[38px] w-auto" />
            </Link>

            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {brandDescription}
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">{section.title}</h3>
              <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noreferrer" className="inline-flex min-h-[32px] items-center py-0.5 transition hover:text-[var(--brand-primary)]">{link.label}</a>
                    ) : (
                      <Link href={link.href} className="inline-flex min-h-[32px] items-center py-0.5 transition hover:text-[var(--brand-primary)]">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact, map and registration row */}
        <div className="mt-8 grid w-full grid-cols-1 gap-8 border-t border-[var(--border)] pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Thông tin liên hệ
            </h3>
            <div className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              <p className="text-[var(--text-secondary)]">{brandOrg}</p>
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                <span>{profile.address || 'Đồng Tháp, Việt Nam'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href={telHref(profile.hotline)} className="inline-flex min-h-[36px] items-center font-normal text-[var(--text-secondary)] hover:underline">
                    {profile.hotlineDisplay}
                  </a>
                  {zaloUrl ? (
                    <a
                      href={zaloUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Nhắn Zalo"
                      className="inline-flex min-h-[36px] items-center gap-1 font-normal text-[var(--text-secondary)] hover:underline"
                    >
                      <ZaloIcon size={15} />
                      Zalo
                    </a>
                  ) : null}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                <a href={`mailto:${profile.supportEmail}`} className="inline-flex min-h-[36px] items-center font-normal text-[var(--text-secondary)] hover:underline">
                  {profile.supportEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Bản đồ địa điểm
              </h3>
            </div>
            <PublicMapPreview
              address={profile.address || 'Đồng Tháp, Việt Nam'}
              location={mapLocation}
              mapSearchUrl={mapSearchUrl}
              mapEmbedUrl={profile.mapEmbedUrl}
              compact
              className="min-h-[10rem]"
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Thông tin pháp lý
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              ĐKKD: 1402233422 do Phòng Kinh tế cấp ngày 13/07/2026.
            </p>
            <img
              src="/legal/online-gov-banner.png"
              alt="Đã thông báo Bộ Công Thương"
              width={600}
              height={223}
              className="mt-3 h-auto w-40 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Sub-footer Copyright Bar */}
      <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] py-4 pb-[calc(1rem+var(--safe-bottom))] lg:pb-4">
        <div className={cn(publicContainerClass, 'flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]')}>
          <p>{copyrightText}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#0d7a28]" />
            <span>Dữ liệu được chuẩn hóa và đối chiếu thực địa trước khi công khai</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
