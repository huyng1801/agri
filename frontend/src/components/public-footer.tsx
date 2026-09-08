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
  const isAgri = siteKey === 'agripassport' || siteKey === 'local';
  const logoVariant = isAgri ? 'agri-wordmark' : siteKey === 'passport' ? 'passport-wordmark' : 'htx-wordmark';

  const dataLinks = [
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
    <footer className="mt-16 border-t border-[var(--border)] bg-white text-[var(--text-primary)] pb-[calc(5rem+var(--safe-bottom))] lg:pb-0">
      {/* Main four-column grid */}
      <div className={cn(publicContainerClass, 'py-12 sm:py-16')}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Organization & Identity */}
          <div>
            <Link href="/" className="inline-block">
              <PublicLogo size={36} variant={logoVariant} className="h-9 w-auto" />
            </Link>

            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              Agripassport hỗ trợ các hợp tác xã chuẩn hóa dữ liệu vùng canh tác, quy trình sản xuất và QR Passport kết nối nông sản trực tiếp với chuỗi tiêu thụ.
            </p>
          </div>

          {/* Column 2: Data */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Khám phá dữ liệu
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              {dataLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-[#106f8a]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Về Agripassport
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-[#106f8a]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-[#106f8a]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact, map and registration row */}
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-[var(--border)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Liên hệ
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <p className="font-bold text-[var(--text-primary)]">Tổ hợp tác công nghệ nông nghiệp Agripassport</p>
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#106f8a]" aria-hidden="true" />
                <span>{profile.address || 'Đồng Tháp, Việt Nam'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-[#106f8a]" aria-hidden="true" />
                <a href={telHref(profile.hotline)} className="font-semibold text-[var(--text-primary)] hover:underline">
                  {profile.hotlineDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-[#106f8a]" aria-hidden="true" />
                <a href={`mailto:${profile.supportEmail}`} className="font-semibold text-[var(--text-primary)] hover:underline">
                  {profile.supportEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Thông tin pháp lý
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              ĐKKD: 1402233422 do Phòng Kinh tế Đồng Tháp cấp ngày 13/07/2026.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-footer Copyright Bar */}
      <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)] py-4">
        <div className={cn(publicContainerClass, 'flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]')}>
          <p>© {new Date().getFullYear()} AGRIPASSPORT. Nền tảng Nông nghiệp Số Việt Nam.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#0d7a28]" />
            <span>Dữ liệu được chuẩn hóa và đối chiếu thực địa trước khi công khai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
