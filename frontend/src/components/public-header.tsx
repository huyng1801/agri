'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LogIn, QrCode, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicLogo } from './public-logo';
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
  { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR' },
  { href: '/htx', label: 'HTX' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

function isNavActive(pathname: string, hasQrQuery: boolean, href: string) {
  if (href.includes('?hasQr=true')) return pathname === '/san-pham' && hasQrQuery;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({
  appName = 'AGRIPASSPORT',
  siteKey = 'agripassport'
}: {
  appName?: string;
  siteKey?: PublicSiteKey;
}) {
  const pathname = usePathname();
  const [hasQrQuery, setHasQrQuery] = useState(false);
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
        : { href: '/login', label: 'Đăng nhập tài khoản' };

  const platformBadge =
    isInternal
      ? 'Quản trị HTX'
      : isPassport
        ? 'Truy xuất nguồn gốc'
        : '';

  const CtaIcon = isInternal ? Briefcase : isPassport ? QrCode : LogIn;

  useEffect(() => {
    setHasQrQuery(new URLSearchParams(window.location.search).get('hasQr') === 'true');
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
      <div className="mx-auto flex h-[74px] max-w-[var(--public-container-wide)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 xl:gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${appName} - Trang chủ`}>
            {isAgri || isPassport || isInternal ? (
              <PublicLogo size={38} variant={logoVariant} className="h-[38px] w-auto max-w-[10rem] sm:max-w-[12rem]" />
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--brand-primary)] text-white shadow-sm">
                  <PublicLogo size={24} className="h-6 w-6" variant="default" />
                </span>
                <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">{appName}</span>
              </div>
            )}
          </Link>

          {!isAgri && (
            <span className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
              {platformBadge}
            </span>
          )}
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
          <Link
            href={navCta.href}
            className="inline-flex h-10 max-w-[11rem] items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border-strong)] bg-white px-3 text-[0.7rem] font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-muted)] shadow-sm"
          >
            <CtaIcon size={15} aria-hidden="true" className="text-[var(--brand-primary)]" />
            <span>{navCta.label}</span>
          </Link>
        </div>

        <Link
          href={navCta.href}
          aria-label={navCta.label}
          title={navCta.label}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white text-[var(--brand-primary)] shadow-sm transition hover:border-[var(--brand-primary)] hover:bg-[var(--surface-muted)] sm:hidden"
        >
          {isAgri ? <UserRound size={18} aria-hidden="true" /> : <CtaIcon size={18} aria-hidden="true" />}
        </Link>

      </div>
    </header>
  );
}
