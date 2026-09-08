import React from 'react';
import Link from 'next/link';
import {
  Boxes,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Store
} from 'lucide-react';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import { htxonlineUrl, marketplaceUrl, passportUrl, type PublicSiteKey } from '@/lib/domain';
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

  const ecosystemLinks = [
    {
      num: '01',
      name: isAgri ? 'HỆ THỐNG HTX' : 'HTXONLINE',
      label: 'Quản trị nội bộ HTX',
      href: isAgri ? '/htx' : htxonlineUrl('/'),
      isExternal: !isAgri,
      color: '#131935'
    },
    {
      num: '02',
      name: 'AGRIPASSPORT',
      label: 'Dữ liệu công khai & Thị trường',
      href: isAgri ? '/san-pham' : marketplaceUrl('/'),
      isExternal: !isAgri,
      color: '#106f8a'
    },
    {
      num: '03',
      name: 'HỘ CHIẾU NÔNG NGHIỆP',
      label: 'Truy xuất nguồn gốc QR',
      href: passportUrl('/'),
      isExternal: true,
      color: '#0d7a28'
    }
  ];

  const dataLinks = [
    { href: '/san-pham', label: 'Tất cả nông sản' },
    { href: '/san-pham?hasQr=true', label: 'Nông sản có QR Passport' },
    { href: '/htx', label: 'Danh bạ hợp tác xã' },
    { href: '/lien-he', label: 'Đăng ký kết nối HTX' }
  ];

  const aboutLinks = [
    { href: '/ve-chung-toi', label: 'Về Agripassport' },
    { href: '/gioi-thieu', label: 'Cách thức hoạt động' },
    { href: '/tin-tuc', label: 'Bản tin Nông nghiệp Số' },
    { href: '/cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' }
  ];

  const legalLinks = [
    { href: '/dieu-khoan-su-dung', label: 'Điều khoản dịch vụ' },
    { href: '/chinh-sach-bao-mat', label: 'Chính sách bảo mật dữ liệu' },
    { href: '/chinh-sach-van-hanh', label: 'Quy chuẩn xác thực nguồn gốc' }
  ];

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-white text-[var(--text-primary)] pb-[calc(5rem+var(--safe-bottom))] lg:pb-0">
      {/* Top Ecosystem Architecture Bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] py-4">
        <div className={cn(publicContainerClass, 'flex flex-col sm:flex-row items-center justify-between gap-4')}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            <span className="h-2 w-2 rounded-full bg-[#106f8a]" />
            <span>Hệ sinh thái dữ liệu nông nghiệp:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {ecosystemLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] shadow-xs"
              >
                <span className="font-mono text-[10px] font-bold text-[var(--text-tertiary)]">{item.num}</span>
                <span className="font-bold">{item.name}</span>
                {item.isExternal && <ExternalLink size={10} className="text-[var(--text-tertiary)]" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main 5-Column Grid */}
      <div className={cn(publicContainerClass, 'py-12 sm:py-16')}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Organization & Identity (4 cols) */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <PublicLogo size={36} variant={logoVariant} className="h-9 w-auto" />
            </Link>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#106f8a]">
              Hạ tầng Dữ liệu Nông sản & Minh bạch Nguồn gốc
            </p>

            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              Agripassport hỗ trợ các hợp tác xã chuẩn hóa dữ liệu vùng canh tác, quy trình sản xuất và cấp mã định danh số (QR Passport) kết nối nông sản trực tiếp với chuỗi tiêu thụ.
            </p>

            <div className="mt-5 space-y-2 text-xs text-[var(--text-secondary)]">
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#106f8a]" />
                <span>{profile.address || 'Đồng Tháp, Việt Nam'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-[#106f8a]" />
                <a href={telHref(profile.hotline)} className="font-semibold text-[var(--text-primary)] hover:underline">
                  Hotline: {profile.hotlineDisplay}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-[#106f8a]" />
                <a href={`mailto:${profile.supportEmail}`} className="font-semibold text-[var(--text-primary)] hover:underline">
                  {profile.supportEmail}
                </a>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-tertiary)]">
              <p>ĐKKD: 1402233422 do Sở KH&ĐT Đồng Tháp cấp ngày 13/07/2026.</p>
            </div>
          </div>

          {/* Column 2: Data & Solutions (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Khám phá Dữ liệu
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

          {/* Column 3: Ecosystem (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Phân hệ Hệ thống
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              {ecosystemLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 transition hover:text-[#106f8a]"
                  >
                    <span>{item.name}</span>
                    {item.isExternal && <ExternalLink size={10} className="text-[var(--text-tertiary)]" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: About & Knowledge (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Về Nền tảng
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

          {/* Column 5: Policy & Standards (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Chính sách & Quy chuẩn
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
