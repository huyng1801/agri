'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
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
import { getPublicNavigation } from '@/lib/public-navigation';

function isNavActive(pathname: string, hasQrQuery: boolean, href: string) {
  if (href.includes('?hasQr=true')) return pathname === '/san-pham' && hasQrQuery;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({
  appName = 'Hộ chiếu nông nghiệp',
  siteKey = 'passport',
  hasQrQuery = false
}: {
  appName?: string;
  siteKey?: PublicSiteKey;
  hasQrQuery?: boolean;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const isAgri = siteKey === 'agripassport' || siteKey === 'local';
  const navigation = getPublicNavigation(siteKey);
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';

  function setMobileNavigationOpen(open: boolean) {
    setMobileMenuOpen(open);
    if (typeof document !== 'undefined') {
      if (open) document.documentElement.dataset.publicMobileMenuOpen = 'true';
      else delete document.documentElement.dataset.publicMobileMenuOpen;
    }
  }

  const navCta =
    isInternal
      ? { href: '/login', label: 'Quản trị HTX' }
      : isPassport
        ? { href: '/truy-xuat', label: 'Tra cứu' }
        : { href: '/login', label: 'Đăng nhập' };

  const CtaIcon = isInternal ? Briefcase : isPassport ? QrCode : LogIn;

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      setMobileNavigationOpen(false);
    }
  }, [pathname]);

  useEffect(() => () => {
    delete document.documentElement.dataset.publicMobileMenuOpen;
  }, []);

  // Dismiss the mobile drawer with Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavigationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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

  // Keep keyboard focus inside the modal drawer while it is open. This prevents
  // keyboard users from tabbing into the page behind a visually modal layer.
  useEffect(() => {
    if (!mobileMenuOpen || !mounted) return;
    const drawer = mobileDrawerRef.current;
    if (!drawer) return;

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => drawer.querySelector<HTMLElement>(focusableSelector)?.focus();
    const frame = window.requestAnimationFrame(focusFirst);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    drawer.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      drawer.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen, mounted]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-[background-color,box-shadow,border-color] pt-[var(--safe-top,0px)]">
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
              const active = isNavActive(pathname, hasQrQuery, entry.href);
              const linkClass = cn(
                'whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.8rem] font-semibold transition duration-150 xl:px-3 xl:text-sm',
                active
                  ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              );

              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={linkClass}
                  aria-current={active ? 'page' : undefined}
                >
                  {entry.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex shrink-0 items-center gap-2 xl:gap-3">
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
              className="inline-flex h-9 sm:h-10 max-w-[12rem] items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--brand-primary)] px-3.5 text-[0.75rem] font-bold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
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
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3 text-xs font-bold text-white shadow-xs active:scale-95 touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
            >
              <CtaIcon size={16} aria-hidden="true" />
              <span className="hidden xs:inline">{navCta.label}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileNavigationOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
              className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            >
              {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Portaled to Document Body (escapes the header backdrop-filter containing block) */}
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
                onClick={() => setMobileNavigationOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer Container */}
              <div
                ref={mobileDrawerRef}
                className="relative z-[71] flex h-[100dvh] max-h-[100dvh] w-[85vw] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-250 ease-out"
                style={{
                  paddingTop: 'max(0.75rem, var(--safe-top, 0px))',
                  paddingBottom: 'max(1rem, var(--safe-bottom, 0px))'
                }}
              >
                {/* Top Bar inside Menu */}
                <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 shrink-0">
                  <Link href="/" onClick={() => setMobileNavigationOpen(false)} className="flex items-center">
                    <PublicLogo size={56} variant={logoVariant} className="h-14 w-auto max-w-[10rem]" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileNavigationOpen(false)}
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
                      const active = isNavActive(pathname, hasQrQuery, entry.href);
                      return (
                        <Link
                          key={entry.href}
                          href={entry.href}
                          onClick={() => setMobileNavigationOpen(false)}
                          className={cn(
                            'flex min-h-[48px] items-center justify-between rounded-xl px-3 text-sm font-semibold transition active:scale-[0.99] touch-action-manipulation',
                            active
                              ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] font-bold'
                              : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span>{entry.label}</span>
                          <ChevronRight size={15} className="text-slate-300" aria-hidden="true" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Actions inside Menu */}
                <div className="border-t border-slate-100 p-4 space-y-2.5 bg-slate-50/70 shrink-0">
                  <Link
                    href="/login"
                    onClick={() => setMobileNavigationOpen(false)}
                   className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 shadow-xs transition hover:border-[var(--brand-primary)] active:scale-95 touch-action-manipulation"
                  >
                    <LogIn size={15} className="text-[var(--brand-primary)]" aria-hidden="true" />
                    <span>{isInternal ? 'Đăng nhập cổng quản trị hợp tác xã' : isPassport ? 'Đăng nhập quản trị' : 'Đăng nhập hệ thống'}</span>
                  </Link>

                  <div className="pt-1 text-center text-xs text-slate-500">
                    <span>Hỗ trợ kỹ thuật: </span>
                    <a
                      href="tel:0907001200"
                      className="inline-flex min-h-[36px] items-center font-bold text-[var(--brand-primary)] hover:underline touch-action-manipulation"
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
