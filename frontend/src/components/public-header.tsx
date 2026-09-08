'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, ExternalLink, LogIn, Menu, QrCode, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicLogo } from './public-logo';
import { cn } from './ui';
import { htxonlineUrl, passportUrl, type PublicSiteKey } from '@/lib/domain';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const isAgri = siteKey === 'agripassport' || siteKey === 'local';
  const navItems = isInternal ? internalNavItems : isPassport ? passportNavItems : marketplaceNavItems;
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';

  const searchTarget = '/san-pham';
  const searchPlaceholder =
    isInternal
      ? 'Tìm sản phẩm, HTX...'
      : isPassport
        ? 'Tìm mã QR, vùng trồng...'
        : 'Tìm sản phẩm, HTX, mã QR...';

  const navCta =
    isInternal
      ? { href: '/login', label: 'Quản trị HTX' }
      : isPassport
        ? { href: '/san-pham?hasQr=true', label: 'Tra cứu QR' }
        : { href: '/login', label: 'Cổng đối tác' };

  const platformBadge =
    isInternal
      ? 'Quản trị HTX'
      : isPassport
        ? 'Truy xuất nguồn gốc'
        : '';

  const CtaIcon = isInternal ? Briefcase : isPassport ? QrCode : LogIn;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setHasQrQuery(new URLSearchParams(window.location.search).get('hasQr') === 'true');
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

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
          <form action={searchTarget} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} aria-hidden="true" />
            <input
              type="search"
              name="search"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 w-44 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] pl-9 pr-3 text-xs text-[var(--text-primary)] outline-none transition focus:w-60 focus:border-[var(--brand-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary-ring)] xl:w-56"
            />
          </form>

          <Link
            href={navCta.href}
            className="inline-flex h-10 max-w-[9.5rem] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-white px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-[var(--surface-muted)] shadow-sm"
          >
            <CtaIcon size={15} aria-hidden="true" className="text-[var(--brand-primary)]" />
            <span>{navCta.label}</span>
          </Link>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <Link
            href={searchTarget}
            aria-label="Tìm kiếm nông sản, HTX"
            className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-primary)] shadow-sm active:bg-slate-50"
          >
            <Search size={18} aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-primary)] shadow-sm active:bg-slate-50 focus:outline-none"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 top-[68px] z-50 flex flex-col bg-black/40 backdrop-blur-sm md:hidden">
          <div className="flex-1 overflow-y-auto bg-white p-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <form action={searchTarget} className="relative mb-5" onSubmit={closeMenu}>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-ring)]"
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="grid gap-1.5" aria-label="Menu di động">
              {navItems.map((item) => {
                const active = isNavActive(pathname, hasQrQuery, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      'flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-bold transition',
                      active
                        ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />}
                  </Link>
                );
              })}
            </nav>

            {/* Ecosystem Links */}
            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <p className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Hệ sinh thái số</p>
              <div className="mt-3 grid gap-2">
                <a
                  href={siteKey === 'agripassport' || siteKey === 'local' ? '/htx' : htxonlineUrl('/')}
                  className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-xs font-semibold text-slate-700 hover:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#131935]" />
                    <span>01 {siteKey === 'agripassport' || siteKey === 'local' ? 'HỢP TÁC XÃ ONLINE' : 'HTXONLINE'} — Quản trị nội bộ</span>
                  </span>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
                <div className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--brand-primary)] bg-[var(--brand-primary-subtle)] px-4 text-xs font-bold text-[var(--brand-primary)]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
                    <span>02 AGRIPASSPORT — Dữ liệu & Thị trường</span>
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-wider font-extrabold bg-[var(--brand-primary)] text-white px-2 py-0.5 rounded">Hiện tại</span>
                </div>
                <a
                  href={passportUrl('/')}
                  className="flex min-h-12 items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-xs font-semibold text-slate-700 hover:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0d7a28]" />
                    <span>03 HỘ CHIẾU NÔNG NGHIỆP — Truy xuất</span>
                  </span>
                  <ExternalLink size={14} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-6 pt-3">
              <Link
                href={navCta.href}
                onClick={closeMenu}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white shadow-sm transition active:opacity-90"
              >
                <CtaIcon size={16} aria-hidden="true" />
                <span>{navCta.label}</span>
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="h-24 w-full cursor-default"
            aria-label="Đóng menu"
            onClick={closeMenu}
          />
        </div>
      )}
    </header>
  );
}
