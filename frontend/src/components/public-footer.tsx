import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import { type PublicSiteKey } from '@/lib/domain';
import { publicContainerClass } from './public-layout';
import { PublicLogo } from './public-logo';
import { PublicMapPreview } from './public-map-preview';
import { cn } from './ui';

export async function PublicFooter({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const profile = await getPublicSiteProfile(siteKey);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`;
  const mapLocation = getPublicMapLocation(profile);
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';

  const brandName = isInternal ? 'HTXONLINE' : isPassport ? 'HỘ CHIẾU NÔNG NGHIỆP' : 'AGRIPASSPORT';
  const brandDescription = isInternal
    ? 'Hệ thống quản trị nội bộ cho hợp tác xã: chuẩn hóa dữ liệu thành viên, quản lý sản xuất, tài chính và đồng bộ công khai.'
    : isPassport
      ? 'Nền tảng hồ sơ số và truy xuất nguồn gốc nông sản bằng mã QR: minh bạch dữ liệu thực địa từ vùng trồng đến người mua.'
      : 'Nền tảng số hóa nông sản, chuẩn hóa dữ liệu vùng canh tác, quy trình sản xuất và QR Passport kết nối thị trường tiêu thụ.';

  const brandOrg = isInternal
    ? 'Hệ thống Quản trị Hợp tác xã HTXONLINE'
    : isPassport
      ? 'Hệ thống Truy xuất Hộ Chiếu Nông Nghiệp'
      : 'Tổ hợp tác công nghệ nông nghiệp Agripassport';

  const copyrightText = isInternal
    ? `© ${new Date().getFullYear()} HTXONLINE. Nền tảng Quản trị Hợp tác xã Số.`
    : isPassport
      ? `© ${new Date().getFullYear()} HỘ CHIẾU NÔNG NGHIỆP. Nền tảng Truy xuất Nguồn gốc Số.`
      : `© ${new Date().getFullYear()} AGRIPASSPORT`;

  const dataLinks = isInternal
    ? [
        { href: '/san-pham', label: 'Sản phẩm công khai' },
        { href: '/htx', label: 'Hợp tác xã đối tác' },
        { href: '/gioi-thieu', label: 'Dịch vụ vận hành' }
      ]
    : isPassport
      ? [
          { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR' },
          { href: '/htx', label: 'Vùng trồng & HTX' },
          { href: '/huong-dan-mua-hang', label: 'Tra cứu QR' }
        ]
      : [
          { href: '/san-pham', label: 'Sản phẩm' },
          { href: '/htx', label: 'Hợp tác xã' },
          { href: '/san-pham?hasQr=true', label: 'Truy xuất QR' }
        ];

  const aboutLinks = [
    { href: '/huong-dan-mua-hang', label: 'Hướng dẫn sử dụng' },
    { href: '/tin-tuc', label: 'Bản tin nông nghiệp' },
    { href: '/cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' }
  ];

  const legalLinks = [
    { href: '/dieu-khoan-su-dung', label: 'Điều khoản dịch vụ' },
    { href: '/chinh-sach-bao-mat', label: 'Chính sách bảo mật' },
    { href: '/chinh-sach-van-hanh', label: 'Quy chuẩn xác thực' }
  ];

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-white text-[var(--text-primary)]">
      {/* Main four-column grid */}
      <div className={cn(publicContainerClass, 'py-12 sm:py-16')}>
        <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-6xl lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Organization & Identity */}
          <div>
            <Link href="/" className="inline-block" aria-label={`${brandName} - Trang chủ`}>
              <PublicLogo size={36} variant={logoVariant} className="h-9 w-auto" />
            </Link>

            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              {brandDescription}
            </p>
          </div>

          {/* Column 2: Data */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Khám phá dữ liệu
            </h3>
            <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
              {dataLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-[36px] items-center py-1 transition hover:text-[var(--brand-primary)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Về {brandName}
            </h3>
            <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-[36px] items-center py-1 transition hover:text-[var(--brand-primary)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer support */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex min-h-[36px] items-center py-1 transition hover:text-[var(--brand-primary)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact, map and registration row */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[var(--border)] pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
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
                <a href={telHref(profile.hotline)} className="inline-flex min-h-[36px] items-center font-normal text-[var(--text-secondary)] hover:underline">
                  {profile.hotlineDisplay}
                </a>
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
              className="min-h-[12rem]"
            />
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Thông tin pháp lý
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              ĐKKD: 1402233422 do Phòng Kinh tế cấp ngày 13/07/2026.
            </p>
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
