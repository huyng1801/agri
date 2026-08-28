'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LogIn, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartCountBadge } from './cart-count-badge';
import { PublicLogo } from './public-logo';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';

const marketplaceNavItems = [
  { href: '/ve-chung-toi', label: 'Về chúng tôi' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'HTX' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

const internalNavItems = [
  { href: '/ve-chung-toi', label: 'Về hệ thống' },
  { href: '/gioi-thieu', label: 'Vai trò nền tảng' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

function isNavActive(pathname: string, href: string) {
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const navItems = siteKey === 'htxonline' ? internalNavItems : marketplaceNavItems;
  const showCart = siteKey !== 'htxonline';
  const supportText =
    siteKey === 'htxonline'
      ? 'Hệ thống số quản trị nội bộ cho hợp tác xã.'
      : siteKey === 'passport'
        ? 'QR truy xuất và hồ sơ số cho nông sản.'
        : 'Hệ sinh thái số cho hợp tác xã, sản phẩm và QR truy xuất.';
  const searchTarget = siteKey === 'htxonline' ? '/tin-tuc' : '/san-pham';
  const searchPlaceholder =
    siteKey === 'htxonline'
      ? 'Tìm tính năng, quy trình hoặc tin tức'
      : siteKey === 'passport'
        ? 'Tìm sản phẩm có QR, vùng trồng'
        : 'Tìm sản phẩm, hợp tác xã, vùng trồng';
  const searchLabel = siteKey === 'htxonline' ? 'Xem tính năng' : 'Khám phá';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e3d7] bg-white/96 shadow-[0_8px_28px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="border-b border-[#198f43] bg-[#1f9b4b] text-white">
        <div className="mx-auto max-w-[1220px] px-4 py-1.5 text-[0.76rem] font-medium leading-5 sm:px-5 lg:px-6 lg:text-sm">{supportText}</div>
      </div>

      <div className="mx-auto max-w-[1220px] px-4 sm:px-5 lg:px-6">
        <div className="flex min-h-[76px] items-center gap-3 py-3">
          <button
            type="button"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#dce9dc] bg-white text-[#1f9b4b] shadow-sm md:hidden"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${appName} - Trang chủ`}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#21253a] shadow-[0_14px_30px_rgba(33,37,58,0.16)] ring-1 ring-[#d7ddd2]">
              <PublicLogo size={38} className="h-[38px] w-[38px]" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e] sm:text-[0.72rem]">
                {siteKey === 'htxonline' ? 'Nền tảng HTX' : siteKey === 'passport' ? 'QR truy xuất' : 'Hệ sinh thái Agri'}
              </span>
              <span className="block truncate text-[1rem] font-extrabold tracking-[-0.03em] text-[#1f2233] sm:text-[1.2rem]">{appName}</span>
            </span>
          </Link>

          <form action={searchTarget} className="hidden flex-1 items-center md:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1f9b4b]" size={19} aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder={searchPlaceholder}
                className="h-12 w-full rounded-full border border-[#dfe7db] bg-[#f7faf4] pl-12 pr-4 text-sm text-[#1f2233] outline-none transition placeholder:text-slate-400 focus:border-[#1f9b4b] focus:ring-4 focus:ring-[#dff0e0]"
              />
            </div>
            <button
              type="submit"
              className="ml-3 inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[#1f9b4b] px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(31,155,75,0.24)] transition hover:-translate-y-0.5"
            >
              {searchLabel}
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={searchTarget}
              aria-label="Tìm kiếm"
              className="grid h-12 w-12 place-items-center rounded-full bg-[#1f9b4b] text-white shadow-[0_12px_26px_rgba(31,155,75,0.2)] md:hidden"
            >
              <Search size={21} aria-hidden="true" />
            </Link>
            {showCart ? (
              <Link
                href="/gio-hang"
                aria-label="Giỏ hàng"
                className="relative grid h-12 w-12 place-items-center rounded-full border border-[#dfe7db] bg-white text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
              >
                <ShoppingCart size={20} aria-hidden="true" />
                <CartCountBadge />
              </Link>
            ) : (
              <Link
                href="/gioi-thieu"
                aria-label="Vai trò nền tảng"
                className="grid h-12 w-12 place-items-center rounded-full border border-[#dfe7db] bg-white text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
              >
                <Briefcase size={18} aria-hidden="true" />
              </Link>
            )}
            <Link
              href="/login"
              className="hidden min-h-12 items-center rounded-full border border-[#dfe7db] bg-white px-5 text-sm font-semibold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] lg:inline-flex"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        <nav className="hidden border-t border-[#ece8dd] py-3 md:flex md:flex-wrap md:items-center md:justify-center md:gap-2" aria-label="Menu chính">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold transition',
                  active ? 'bg-[#1f9b4b] text-white shadow-[0_12px_24px_rgba(31,155,75,0.2)]' : 'text-slate-700 hover:bg-[#f4f8f1] hover:text-[#1f9b4b]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {menuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[7.5rem] z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-[#142419]/22 backdrop-blur-[1px]" aria-label="Đóng menu" onClick={closeMenu} />
          <div className="relative mx-3 max-h-full overflow-y-auto rounded-[2rem] border border-[#e7e3d7] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <form action={searchTarget} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1f9b4b]" size={18} aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder={searchPlaceholder}
                className="h-12 w-full rounded-full border border-[#dfe7db] bg-[#f7faf4] pl-11 pr-4 text-sm outline-none focus:border-[#1f9b4b] focus:ring-4 focus:ring-[#dff0e0]"
              />
            </form>

            <nav className="mt-4 grid gap-2" aria-label="Menu di động">
              <Link
                href="/"
                onClick={closeMenu}
                className={cn(
                  'rounded-[1.25rem] border border-[#e8e4d8] px-4 py-3 text-base font-semibold',
                  pathname === '/' ? 'bg-[#1f9b4b] text-white' : 'bg-[#fafaf6] text-[#1f2233]'
                )}
              >
                Trang chủ
              </Link>
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      'rounded-[1.25rem] border border-[#e8e4d8] px-4 py-3 text-base font-semibold',
                      active ? 'bg-[#1f9b4b] text-white' : 'bg-[#fafaf6] text-[#1f2233]'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-2 border-t border-[#ece8dd] pt-4">
              {showCart ? (
                <Link
                  href="/gio-hang"
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-[1.25rem] bg-[#f7faf4] px-4 py-3 text-sm font-semibold text-[#1f2233]"
                >
                  <span>Giỏ hàng</span>
                  <CartCountBadge className="static min-h-6 min-w-6 translate-none text-xs" />
                </Link>
              ) : (
                <Link
                  href="/gioi-thieu"
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-[1.25rem] bg-[#f7faf4] px-4 py-3 text-sm font-semibold text-[#1f2233]"
                >
                  <span>Vai trò nền tảng</span>
                  <Briefcase size={16} aria-hidden="true" />
                </Link>
              )}
              <Link
                href="/login"
                onClick={closeMenu}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f9b4b] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,155,75,0.22)]"
              >
                <LogIn size={18} aria-hidden="true" />
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
