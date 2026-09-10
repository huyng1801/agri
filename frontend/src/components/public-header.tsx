'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LogIn,
  Menu,
  QrCode,
  UserRound,
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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
      <div className={cn(publicContainerClass, 'flex h-[64px] sm:h-[74px] items-center justify-between gap-3')}>
        <div className="flex min-w-0 items-center gap-3 xl:gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${appName} - Trang chủ`}>
            {isAgri || isPassport || isInternal ? (
              <PublicLogo size={36} variant={logoVariant} className="h-[34px] sm:h-[38px] w-auto max-w-[9.5rem] sm:max-w-[12rem]" />
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--brand-primary)] text-white shadow-sm">
                  <PublicLogo size={24} className="h-6 w-6" variant="default" />
                </span>
                <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">{appName}</span>
              </div>
            )}
          </Link>
        </div>

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

        <div className="hidden sm:flex shrink-0 items-center gap-2 xl:gap-3">
          {isPassport ? (
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border-strong)] bg-white px-3 text-[0.75rem] font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-muted)] shadow-xs"
            >
              <LogIn size={15} aria-hidden="true" className="text-[var(--brand-primary)]" />
              <span>Đăng nhập</span>
            </Link>
          ) : null}
          <Link
            href={navCta.href}
            className="inline-flex h-10 max-w-[12rem] items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--brand-primary)] px-3.5 text-[0.75rem] font-bold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)] active:scale-[0.98]"
          >
            <CtaIcon size={15} aria-hidden="true" />
            <span>{navCta.label}</span>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Link
            href={navCta.href}
            aria-label={navCta.label}
            title={navCta.label}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 text-xs font-bold text-white shadow-xs"
          >
            <CtaIcon size={16} aria-hidden="true" />
            <span className="hidden xs:inline">{navCta.label}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)]"
          >
            {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu di động"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <PublicLogo size={32} variant={logoVariant} className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Đóng menu"
                className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] text-slate-600 hover:bg-slate-100"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-muted)]">
              <Link
                href={navCta.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)]"
              >
                <CtaIcon size={18} aria-hidden="true" />
                <span>{navCta.label}</span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1" aria-label="Menu di động">
              {navItems.map((item) => {
                const active = isNavActive(pathname, hasQrQuery, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex min-h-[48px] items-center rounded-xl px-3.5 text-sm font-bold transition',
                      active
                        ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[var(--border)] p-4 space-y-2 bg-[var(--surface-muted)]">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] shadow-xs"
              >
                <LogIn size={15} aria-hidden="true" className="text-[var(--brand-primary)]" />
                <span>Đăng nhập hệ thống</span>
              </Link>
              <div className="pt-2 text-center text-xs text-[var(--text-tertiary)]">
                <span>Hotline: </span>
                <a href="tel:0907001200" className="font-bold text-[var(--brand-primary)] hover:underline">
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
