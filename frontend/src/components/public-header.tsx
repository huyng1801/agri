'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  ChevronRight,
  Home,
  Info,
  LogIn,
  Menu,
  Newspaper,
  Phone,
  QrCode,
  Scan,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Store,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicLogo } from './public-logo';
import { publicContainerClass } from './public-layout';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';

const marketplaceNavItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/ve-chung-toi', label: 'Về Agripassport' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'Hợp tác xã' },
  { href: '/san-pham?hasQr=true', label: 'Truy xuất QR' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

const internalNavItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'HTX' },
  { href: '/gioi-thieu', label: 'Dịch vụ' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

const passportNavItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/cay', label: 'Hộ chiếu cây' },
  { href: '/truy-xuat', label: 'Truy xuất' },
  { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR' },
  { href: '/htx', label: 'Đối tác' },
  { href: '/tuyen-cong-tac-vien', label: 'Cộng tác viên' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

// Categorized Mobile Menu Groups (Section 6 of Brief)
const mobileMenuGroups = [
  {
    title: 'Khám phá Dữ liệu',
    items: [
      { href: '/', label: 'Trang chủ', icon: Home },
      { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR Passport', icon: ShieldCheck },
      { href: '/san-pham', label: 'Danh mục Nông sản', icon: ShoppingBag },
      { href: '/htx', label: 'Đối tác & Hợp tác xã', icon: Store }
    ]
  },
  {
    title: 'Hệ sinh thái Nông nghiệp Số',
    items: [
      { href: '/cay', label: 'Hộ chiếu cây', icon: Sprout },
      { href: '/tuyen-cong-tac-vien', label: 'Cộng tác viên số hóa', icon: Users },
      { href: '/gioi-thieu', label: 'Giới thiệu giải pháp', icon: Info }
    ]
  },
  {
    title: 'Hỗ trợ & Kết nối',
    items: [
      { href: '/truy-xuat', label: 'Cổng tra cứu QR', icon: Scan },
      { href: '/tin-tuc', label: 'Tin tức & Chuyển đổi số', icon: Newspaper },
      { href: '/lien-he', label: 'Liên hệ hợp tác', icon: Phone }
    ]
  }
];

function isNavActive(pathname: string, hasQrQuery: boolean, href: string) {
  if (href.includes('?hasQr=true')) return pathname === '/san-pham' && hasQrQuery;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({
  appName = 'HỘ CHIẾU NÔNG NGHIỆP',
  siteKey = 'passport'
}: {
  appName?: string;
  siteKey?: PublicSiteKey;
}) {
  const pathname = usePathname();
  const [hasQrQuery, setHasQrQuery] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const isAgri = siteKey === 'agripassport' || siteKey === 'local';
  const navItems = isInternal ? internalNavItems : isPassport ? passportNavItems : marketplaceNavItems;
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';

  const navCta =
    isInternal
      ? { href: '/login', label: 'Quản trị HTX' }
      : isPassport
        ? { href: '/san-pham?hasQr=true', label: 'Tra cứu QR' }
        : { href: '/login', label: 'Đăng nhập' };

  const CtaIcon = isInternal ? Briefcase : isPassport ? QrCode : LogIn;

  useEffect(() => {
    setHasQrQuery(new URLSearchParams(window.location.search).get('hasQr') === 'true');
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      <div className={cn(publicContainerClass, 'flex h-[56px] sm:h-[64px] lg:h-[70px] items-center justify-between gap-3')}>
        {/* Brand / Logo */}
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 select-none" aria-label={`${appName} - Trang chủ`}>
            {isAgri || isPassport || isInternal ? (
              <PublicLogo size={34} variant={logoVariant} className="h-[30px] sm:h-[34px] lg:h-[38px] w-auto max-w-[8.5rem] sm:max-w-[11rem]" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand-primary)] text-white shadow-xs">
                  <PublicLogo size={22} className="h-5 w-5" variant="default" />
                </span>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-primary)]">{appName}</span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex min-w-0 items-center gap-0.5" aria-label="Menu chính">
          {navItems.map((item) => {
            const active = isNavActive(pathname, hasQrQuery, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.8rem] font-semibold transition duration-150 xl:px-3 xl:text-sm',
                  active
                    ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex shrink-0 items-center gap-2 xl:gap-3">
          {isPassport ? (
            <Link
              href="/login"
              className="inline-flex h-9 sm:h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border-strong)] bg-white px-3 text-[0.75rem] font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-muted)] shadow-xs"
            >
              <LogIn size={15} aria-hidden="true" className="text-[var(--brand-primary)]" />
              <span>Đăng nhập</span>
            </Link>
          ) : null}
          <Link
            href={navCta.href}
            className="inline-flex h-9 sm:h-10 max-w-[12rem] items-center gap-2 whitespace-nowrap rounded-lg bg-[#0d7a28] px-3.5 text-[0.75rem] font-bold text-white shadow-sm transition hover:bg-[#0a6120] active:scale-[0.98]"
          >
            <CtaIcon size={15} aria-hidden="true" />
            <span>{navCta.label}</span>
          </Link>
        </div>

        {/* Mobile App Bar Controls */}
        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <Link
            href={navCta.href}
            aria-label={navCta.label}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0d7a28] px-2.5 text-xs font-bold text-white shadow-xs active:scale-95 touch-action-manipulation"
          >
            <CtaIcon size={15} aria-hidden="true" />
            <span className="hidden xs:inline">{navCta.label}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
          >
            {mobileMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Categorized Mobile Menu Sheet (Section 6) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[320px] flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-250"
            style={{ paddingBottom: 'max(1rem, var(--safe-bottom, 0px))' }}
          >
            {/* Top Bar inside Menu */}
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5 shrink-0">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <PublicLogo size={30} variant={logoVariant} className="h-7 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Đóng menu"
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition active:scale-95"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Grouped Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
              {mobileMenuGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </p>
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, hasQrQuery, item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex h-[48px] items-center justify-between rounded-xl px-3 text-sm font-semibold transition active:scale-[0.99] touch-action-manipulation',
                            active
                              ? 'bg-[#0d7a28]/10 text-[#0d7a28] font-bold'
                              : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className={active ? 'text-[#0d7a28]' : 'text-slate-400'} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={15} className="text-slate-300" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions inside Menu */}
            <div className="border-t border-slate-100 p-4 space-y-2.5 bg-slate-50/70 shrink-0">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 shadow-xs hover:border-[#0d7a28] transition active:scale-95"
              >
                <LogIn size={15} className="text-[#0d7a28]" />
                <span>Đăng nhập Cổng Quản trị HTX</span>
              </Link>

              <div className="pt-1 text-center text-xs text-slate-500">
                <span>Hỗ trợ kỹ thuật: </span>
                <a href="tel:0907001200" className="font-bold text-[#0d7a28] hover:underline">
                  0907 001 200
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
