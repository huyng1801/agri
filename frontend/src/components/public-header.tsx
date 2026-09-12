'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  LogIn,
  Menu,
  QrCode,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PublicLogo } from './public-logo';
import { publicContainerClass } from './public-layout';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';
import { getPublicNavigation, type PublicNavigationEntry } from '@/lib/public-navigation';

function isNavActive(pathname: string, hasQrQuery: boolean, href: string) {
  if (href.includes('?hasQr=true')) return pathname === '/san-pham' && hasQrQuery;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavigationEntryActive(pathname: string, hasQrQuery: boolean, entry: PublicNavigationEntry) {
  return isNavActive(pathname, hasQrQuery, entry.href) ||
    (entry.kind === 'dropdown' && entry.items.some((item) => isNavActive(pathname, hasQrQuery, item.href)));
}

export function PublicHeader({
  appName = 'Hộ chiếu nông nghiệp',
  siteKey = 'passport'
}: {
  appName?: string;
  siteKey?: PublicSiteKey;
}) {
  const pathname = usePathname();
  const [hasQrQuery, setHasQrQuery] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passportMenuOpen, setPassportMenuOpen] = useState(false);
  const [mobilePassportMenuOpen, setMobilePassportMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const passportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const isAgri = siteKey === 'agripassport' || siteKey === 'local';
  const navigation = getPublicNavigation(siteKey);
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
    setPassportMenuOpen(false);
    setMobilePassportMenuOpen(false);
  }, [pathname]);

  // Dismiss open navigation layers with Escape.
  useEffect(() => {
    if (!mobileMenuOpen && !passportMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setPassportMenuOpen(false);
        setMobilePassportMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, passportMenuOpen]);

  useEffect(() => {
    if (!passportMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!passportMenuRef.current?.contains(event.target as Node)) {
        setPassportMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [passportMenuOpen]);

  // Strict multi-layer scroll locking for iOS WebKit & Android Chrome
  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) setMobilePassportMenuOpen(false);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all pt-[var(--safe-top,0px)]">
        <div className={cn(publicContainerClass, 'flex h-[56px] sm:h-[64px] lg:h-[70px] items-center justify-between gap-3')}>
          {/* Brand / Logo */}
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 select-none" aria-label={`${appName} - Trang chủ`}>
              {isAgri || isPassport || isInternal ? (
                <PublicLogo size={56} variant={logoVariant} className="h-14 w-auto max-w-[12rem]" />
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
            {navigation.map((entry) => {
              const active = isNavigationEntryActive(pathname, hasQrQuery, entry);
              const linkClass = cn(
                'whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.8rem] font-semibold transition duration-150 xl:px-3 xl:text-sm',
                active
                  ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              );

              if (entry.kind === 'link') {
                return (
                  <Link key={entry.href} href={entry.href} className={linkClass} aria-current={active ? 'page' : undefined}>
                    {entry.label}
                  </Link>
                );
              }

              return (
                <div key={entry.href} ref={passportMenuRef} className="relative flex items-center">
                  <Link href={entry.href} className={cn(linkClass, 'rounded-r-none pr-1.5')} aria-current={active ? 'page' : undefined}>
                    {entry.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPassportMenuOpen((open) => !open)}
                    aria-expanded={passportMenuOpen}
                    aria-haspopup="menu"
                    aria-label={`${passportMenuOpen ? 'Đóng' : 'Mở'} menu ${entry.label}`}
                    className={cn(
                      linkClass,
                      'rounded-l-none pl-1 pr-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-inset'
                    )}
                  >
                    <ChevronDown size={14} className={cn('transition-transform', passportMenuOpen && 'rotate-180')} aria-hidden="true" />
                  </button>
                  {passportMenuOpen ? (
                    <div
                      role="menu"
                      aria-label={`Các trang trong ${entry.label}`}
                      className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl"
                    >
                      {entry.items.map((item) => {
                        const ItemIcon = item.icon;
                        const itemActive = isNavActive(pathname, hasQrQuery, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setPassportMenuOpen(false)}
                            aria-current={itemActive ? 'page' : undefined}
                            className={cn(
                              'flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-[var(--surface-muted)]',
                              itemActive && 'bg-[var(--brand-primary-subtle)]'
                            )}
                          >
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                              <ItemIcon size={16} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-[var(--text-primary)]">{item.label}</span>
                              <span className="mt-0.5 block text-xs leading-5 text-[var(--text-secondary)]">{item.description}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
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
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#0d7a28] px-3 text-xs font-bold text-white shadow-xs active:scale-95 touch-action-manipulation"
            >
              <CtaIcon size={16} aria-hidden="true" />
              <span className="hidden xs:inline">{navCta.label}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
              className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
            >
              {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Categorized Mobile Navigation Drawer Portaled to Document Body (Escapes header backdrop-filter containing block) */}
      {mounted && mobileMenuOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex justify-end lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu điều hướng"
            >
              {/* Dimmed Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer Container */}
              <div
                className="relative z-[71] flex h-[100dvh] max-h-[100dvh] w-[85vw] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-250 ease-out"
                style={{
                  paddingTop: 'max(0.75rem, var(--safe-top, 0px))',
                  paddingBottom: 'max(1rem, var(--safe-bottom, 0px))'
                }}
              >
                {/* Top Bar inside Menu */}
                <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 shrink-0">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <PublicLogo size={56} variant={logoVariant} className="h-14 w-auto max-w-[10rem]" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Đóng menu"
                    className="grid h-11 w-11 min-h-11 min-w-11 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition active:scale-95 touch-action-manipulation"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>

                {/* Use the same ordered navigation model as desktop. */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-3 space-y-5 overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div data-testid={isPassport ? 'passport-mobile-nav' : 'public-mobile-nav'} className="space-y-1">
                    {navigation.map((entry) => {
                      const active = isNavigationEntryActive(pathname, hasQrQuery, entry);
                      if (entry.kind === 'link') {
                        return (
                          <Link
                            key={entry.href}
                            href={entry.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex min-h-[48px] items-center justify-between rounded-xl px-3 text-sm font-semibold transition active:scale-[0.99] touch-action-manipulation',
                              active
                                ? 'bg-[#0d7a28]/10 text-[#0d7a28] font-bold'
                                : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                            )}
                            aria-current={active ? 'page' : undefined}
                          >
                            <span>{entry.label}</span>
                            <ChevronRight size={15} className="text-slate-300" aria-hidden="true" />
                          </Link>
                        );
                      }

                      return (
                        <div key={entry.href} className="rounded-xl">
                          <div
                            className={cn(
                              'flex min-h-[48px] items-center rounded-xl px-3 text-sm font-semibold transition',
                              active ? 'bg-[#0d7a28]/10 text-[#0d7a28]' : 'text-slate-700'
                            )}
                          >
                            <Link
                              href={entry.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex min-h-[48px] flex-1 items-center font-semibold"
                              aria-current={active ? 'page' : undefined}
                            >
                              {entry.label}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setMobilePassportMenuOpen((open) => !open)}
                              aria-expanded={mobilePassportMenuOpen}
                              aria-controls="passport-mobile-submenu"
                              aria-label={`${mobilePassportMenuOpen ? 'Đóng' : 'Mở'} menu ${entry.label}`}
                              className="grid h-11 w-11 min-h-11 min-w-11 place-items-center rounded-lg text-[#0d7a28] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
                            >
                              <ChevronDown size={17} className={cn('transition-transform', mobilePassportMenuOpen && 'rotate-180')} aria-hidden="true" />
                            </button>
                          </div>
                          {mobilePassportMenuOpen ? (
                            <div id="passport-mobile-submenu" className="ml-3 mt-1 space-y-1 border-l border-[#0d7a28]/20 pl-3">
                              {entry.items.map((item) => {
                                const ItemIcon = item.icon;
                                const itemActive = isNavActive(pathname, hasQrQuery, item.href);
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                      'flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm transition active:scale-[0.99] touch-action-manipulation',
                                      itemActive
                                        ? 'bg-[#0d7a28]/10 font-bold text-[#0d7a28]'
                                        : 'font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                    )}
                                    aria-current={itemActive ? 'page' : undefined}
                                  >
                                    <ItemIcon size={17} className={itemActive ? 'text-[#0d7a28]' : 'text-slate-400'} aria-hidden="true" />
                                    <span>{item.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Actions inside Menu */}
                <div className="border-t border-slate-100 p-4 space-y-2.5 bg-slate-50/70 shrink-0">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 shadow-xs hover:border-[#0d7a28] transition active:scale-95 touch-action-manipulation"
                  >
                    <LogIn size={15} className="text-[#0d7a28]" />
                    <span>Đăng nhập cổng quản trị hợp tác xã</span>
                  </Link>

                  <div className="pt-1 text-center text-xs text-slate-500">
                    <span>Hỗ trợ kỹ thuật: </span>
                    <a
                      href="tel:0907001200"
                      className="inline-flex min-h-[36px] items-center font-bold text-[#0d7a28] hover:underline touch-action-manipulation"
                    >
                      0907 001 200
                    </a>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
