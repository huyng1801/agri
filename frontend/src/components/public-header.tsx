'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LogIn, Menu, QrCode, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicLogo } from './public-logo';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';

const marketplaceNavItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/ve-chung-toi', label: 'Về AgriPassport' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'Đối tác' },
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
  const isInternal = siteKey === 'htxonline';
  const isMarketplace = siteKey === 'agripassport' || siteKey === 'local';
  const navItems = isInternal ? internalNavItems : siteKey === 'passport' ? passportNavItems : marketplaceNavItems;
  const supportText =
    isInternal
      ? 'Điều phối dữ liệu cho hợp tác xã vận hành bền vững.'
      : siteKey === 'passport'
        ? 'QR truy xuất và hồ sơ số cho nông sản.'
        : 'Số hóa dữ liệu nông nghiệp - Minh bạch nguồn gốc - Kết nối thị trường.';
  const searchTarget = '/san-pham';
  const searchPlaceholder =
    isInternal
      ? 'Tìm sản phẩm, HTX hoặc dịch vụ'
      : siteKey === 'passport'
        ? 'Tìm sản phẩm có QR, vùng trồng'
        : 'Nhập mã sản phẩm hoặc mã QR để tra cứu nguồn gốc';
  const searchLabel = 'Tìm kiếm';
  const navCta =
    siteKey === 'passport'
      ? { href: '/san-pham?hasQr=true', label: 'Tìm QR' }
      : { href: '/login', label: 'Cộng tác viên' };
  const brandBadge =
    isInternal
      ? 'Điều phối HTX'
      : siteKey === 'passport'
        ? 'QR truy xuất'
        : 'Dữ liệu nông nghiệp số';
  const brandCaption =
    isInternal
      ? 'Luồng nội bộ, công khai và QR trong một hệ sinh thái.'
      : siteKey === 'passport'
        ? 'Tra cứu hồ sơ số gọn hơn trên điện thoại.'
        : 'Sản phẩm, vùng trồng và QR được tổ chức thành một hành trình truy xuất rõ ràng.';
  const desktopAuthLabel = isInternal ? 'Đăng nhập / Đăng ký' : 'Đăng nhập';
  const mobilePanelTitle =
    isInternal
      ? 'Quản trị HTX, mở sản phẩm công khai và kết nối QR trên cùng hệ sinh thái.'
      : siteKey === 'passport'
        ? 'Tra cứu sản phẩm có QR và hồ sơ số nhanh hơn trên điện thoại.'
        : 'Khám phá dữ liệu sản phẩm, đối tác và hành trình truy xuất nguồn gốc.';
  const mobilePanelTags =
    isInternal
      ? ['Sản phẩm', 'HTX', 'Tin tức']
      : siteKey === 'passport'
        ? ['Có QR', 'Hồ sơ số', 'HTX']
        : ['Sản phẩm', 'Đối tác', 'Truy xuất'];
  const CtaIcon = isInternal ? Briefcase : siteKey === 'passport' ? QrCode : LogIn;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  if (isInternal) {
    return (
      <header className="sticky top-0 z-40 border-b border-[#e7e3d7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
        <div className="bg-[#1d9b49] text-white">
          <div className="mx-auto max-w-[1220px] px-4 py-1.5 text-left text-[0.65rem] font-medium leading-4 sm:px-5 sm:text-center sm:text-[0.76rem] lg:px-6 lg:py-1.5 lg:text-[0.84rem]">
            {supportText}
          </div>
        </div>

        <div className="mx-auto max-w-[1220px] px-4 sm:px-5 lg:px-6">
          <div className="flex items-center gap-2 py-2 md:hidden">
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d9e5d7] bg-white text-[#1f9b4b] shadow-sm transition hover:text-[#16753d]"
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>

            <div className="flex flex-1 justify-center">
              <Link
                href="/"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#111827] shadow-[0_14px_28px_rgba(15,23,42,0.12)] ring-1 ring-[#d9e4d6]"
                aria-label={`${appName} - Trang chủ`}
              >
                <PublicLogo size={28} className="h-7 w-7" />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={searchTarget}
                aria-label="Tìm kiếm"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f9b4b] text-white shadow-[0_12px_24px_rgba(31,155,75,0.2)]"
              >
                <Search size={21} aria-hidden="true" />
              </Link>
              <Link
                href={navCta.href}
                aria-label={navCta.label}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d8e5d6] bg-white text-[#252b3d] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
              >
                <CtaIcon size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="mb-2 flex snap-x snap-mandatory scroll-px-4 gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex min-h-9 shrink-0 snap-start items-center rounded-full border px-3 text-[0.72rem] font-semibold transition',
                    active
                      ? 'border-[#132031] bg-[#132031] text-white shadow-[0_12px_24px_rgba(19,32,49,0.16)]'
                      : 'border-[#dfe8db] bg-[#f8faf5] text-[#27513a]'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden min-h-[82px] items-center gap-6 py-3.5 md:flex">
            <Link href="/" className="flex shrink-0 items-center" aria-label={`${appName} - Trang chủ`}>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#111827] shadow-[0_14px_28px_rgba(15,23,42,0.12)] ring-1 ring-[#dae4d7]">
                <PublicLogo size={36} className="h-[36px] w-[36px]" />
              </span>
              <span className="sr-only">{appName}</span>
            </Link>

            <form action={searchTarget} className="flex flex-1 justify-center">
              <div className="flex w-full max-w-[34rem] items-center rounded-full border border-[#dde8da] bg-white px-5 shadow-none">
                <Search className="shrink-0 text-[#1f9b4b]" size={18} aria-hidden="true" />
                <input
                  type="search"
                  name="search"
                  placeholder={searchPlaceholder}
                  className="h-11 flex-1 border-0 bg-transparent px-3 text-sm text-[#1f2233] outline-none placeholder:text-slate-400"
                />
                <span className="h-5 w-px bg-[#dce6d8]" aria-hidden="true" />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center px-4 text-sm font-medium text-[#1f2233] transition hover:text-[#1f9b4b]"
                >
                  {searchLabel}
                </button>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-5">
              <Link href="/login" className="text-sm font-medium text-[#1f2233] transition hover:text-[#1f9b4b]">
                {desktopAuthLabel}
              </Link>
              <Link
                href={navCta.href}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#dde8da] bg-white text-[#1f2233] shadow-sm transition hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                aria-label={navCta.label}
              >
                <LogIn size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ece8dd] bg-white">
          <div className="mx-auto max-w-[1220px] px-4 sm:px-5 lg:px-6">
            <nav className="hidden items-center justify-center gap-3 overflow-x-auto py-3.5 md:flex" aria-label="Menu chính">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-[0.95rem] transition',
                      active
                        ? 'bg-[#132031] font-semibold text-white shadow-[0_12px_24px_rgba(19,32,49,0.16)]'
                        : 'font-medium text-[#27513a] hover:bg-[#f5faf2] hover:text-[#1f9b4b]'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={navCta.href}
                className="inline-flex min-h-11 items-center rounded-full border border-[#cfe5d2] bg-[#1f9b4b] px-5 text-[0.95rem] font-semibold text-white shadow-[0_12px_24px_rgba(31,155,75,0.16)] transition hover:-translate-y-0.5"
              >
                {navCta.label}
              </Link>
            </nav>
          </div>
        </div>

        {menuOpen ? (
          <div className="fixed inset-x-0 bottom-0 top-[8.6rem] z-40 md:hidden">
            <button type="button" className="absolute inset-0 bg-[#13231a]/24 backdrop-blur-[1px]" aria-label="Đóng menu" onClick={closeMenu} />
            <div className="relative mx-3 max-h-full overflow-y-auto rounded-[2rem] border border-[#e7e3d7] bg-white p-4 shadow-[0_26px_60px_rgba(15,23,42,0.14)]">
              <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#0f172a_0%,#17314b_48%,#1f9b4b_100%)] p-4 text-white">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/72">{appName}</p>
                <p className="mt-2 text-[1.15rem] font-extrabold leading-tight">{mobilePanelTitle}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em]">
                  {mobilePanelTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-white/88">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <form action={searchTarget} className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1f9b4b]" size={18} aria-hidden="true" />
                <input
                  type="search"
                  name="search"
                  placeholder={searchPlaceholder}
                  className="h-12 w-full rounded-full border border-[#dfe7db] bg-[#f7faf4] pl-11 pr-4 text-sm outline-none focus:border-[#1f9b4b] focus:ring-4 focus:ring-[#dff0e0]"
                />
              </form>

              <nav className="mt-4 grid gap-2" aria-label="Menu di động">
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'rounded-[1.25rem] border px-4 py-3 text-base font-semibold',
                        active ? 'border-[#111827] bg-[#111827] text-white' : 'border-[#e8e4d8] bg-[#fafaf6] text-[#1f2233]'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 grid gap-2 border-t border-[#ece8dd] pt-4">
                <Link
                  href={navCta.href}
                  onClick={closeMenu}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f9b4b] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,155,75,0.22)]"
                >
                  <CtaIcon size={18} aria-hidden="true" />
                  {navCta.label}
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e3d7] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
      <div className="hidden border-b border-[#198f43] bg-[#1f9b4b] text-white md:block">
        <div className="mx-auto max-w-[1220px] px-3 py-1.5 text-[0.76rem] font-medium leading-5 sm:px-5 lg:px-6 lg:text-[0.88rem]">{supportText}</div>
      </div>

      <div className="mx-auto max-w-[1220px] px-4 sm:px-5 lg:px-6">
        <div className="flex items-center gap-2 py-2.5 md:hidden">
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d9e5d7] bg-white text-[#1f9b4b] shadow-sm transition hover:text-[#16753d] md:hidden"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>

          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 px-1 py-1"
            aria-label={`${appName} - Trang chủ`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0f7d63] shadow-[0_8px_18px_rgba(15,125,99,0.18)] ring-1 ring-[#d7ddd2]">
              <PublicLogo size={27} className="h-6 w-6" variant={siteKey === 'agripassport' || siteKey === 'local' ? 'agri' : 'default'} />
            </span>
            <span className="min-w-0">
              <span className="hidden truncate text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#2b8a3e] sm:block">{brandBadge}</span>
              <span className="block truncate text-[0.8rem] font-extrabold text-[#1f2233] sm:mt-0.5 sm:text-sm">{appName}</span>
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
              className="grid h-11 w-11 place-items-center rounded-full bg-[#1f9b4b] text-white shadow-[0_12px_26px_rgba(31,155,75,0.22)] md:hidden"
            >
              <Search size={21} aria-hidden="true" />
            </Link>
            {!isMarketplace ? (
              <Link
                href={navCta.href}
                aria-label={navCta.label}
                className="hidden h-10 w-10 place-items-center text-[#2b8a3e] transition hover:text-[#1f9b4b] md:grid"
              >
                <CtaIcon size={19} aria-hidden="true" />
              </Link>
            ) : null}
            <Link
              href="/login"
              className="hidden min-h-12 items-center rounded-full border border-[#dfe7db] bg-white px-5 text-sm font-semibold text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b] lg:inline-flex"
            >
              {desktopAuthLabel}
            </Link>
          </div>
        </div>

        <div className="hidden mb-2 snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex min-h-10 shrink-0 snap-start items-center rounded-full border px-4 text-[0.78rem] font-semibold transition',
                  active
                    ? 'border-[#132031] bg-[#132031] text-white shadow-[0_12px_24px_rgba(19,32,49,0.16)]'
                    : 'border-[#dfe8db] bg-[#f8faf5] text-[#27513a]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden min-h-[82px] items-center gap-6 py-4 md:flex">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${appName} - Trang chủ`}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#0f7d63] ring-1 ring-[#d8ddd3]">
              <PublicLogo size={40} className="h-[40px] w-[40px]" variant={siteKey === 'agripassport' || siteKey === 'local' ? 'agri' : 'default'} />
            </span>
          </Link>

          <form action={searchTarget} className="flex flex-1 justify-center">
            <div className="flex w-full max-w-[34rem] items-center rounded-full border border-[#e1e7dd] bg-white px-5 shadow-sm">
              <Search className="shrink-0 text-[#1f9b4b]" size={18} aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder={searchPlaceholder}
                className="h-11 flex-1 border-0 bg-transparent px-3 text-sm text-[#1f2233] outline-none placeholder:text-slate-400"
              />
              <span className="h-5 w-px bg-[#e6eadf]" aria-hidden="true" />
              <button type="submit" className="inline-flex h-11 shrink-0 items-center px-4 text-sm font-medium text-[#1f2233] transition hover:text-[#1f9b4b]">
                {searchLabel}
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#1f2233] transition hover:text-[#1f9b4b]">
              Đăng nhập
            </Link>
            <Link href={navCta.href} aria-label={navCta.label} className="grid h-11 w-11 place-items-center text-[#1f2233] transition hover:text-[#1f9b4b]">
              <CtaIcon size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <nav className="hidden border-t border-[#ece8dd] py-3 md:flex md:flex-wrap md:items-center md:justify-center md:gap-8" aria-label="Menu chính">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full px-2 py-2 text-[0.98rem] font-medium transition',
                  active
                    ? 'bg-[#58b95c] px-5 text-white shadow-[0_0_0_4px_rgba(88,185,92,0.18)]'
                    : 'text-[#2f7d4f] hover:text-[#1f9b4b]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          {!isMarketplace ? (
            <Link
              href={navCta.href}
              className="inline-flex min-h-12 items-center rounded-full bg-[#58b95c] px-5 text-[1rem] font-semibold text-white shadow-[0_0_0_4px_rgba(88,185,92,0.18)] transition hover:-translate-y-0.5"
            >
              {navCta.label}
            </Link>
          ) : null}
        </nav>
      </div>

      {menuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[6.2rem] z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-[#142419]/22 backdrop-blur-[1px]" aria-label="Đóng menu" onClick={closeMenu} />
          <div className="relative mx-3 max-h-full overflow-y-auto rounded-[2rem] border border-[#e7e3d7] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#0f172a_0%,#17314b_48%,#1f9b4b_100%)] p-4 text-white">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/72">{appName}</p>
              <p className="mt-2 text-[1.15rem] font-extrabold leading-tight">{mobilePanelTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/78">{brandCaption}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em]">
                {mobilePanelTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-white/88">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <form action={searchTarget} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1f9b4b]" size={18} aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder={searchPlaceholder}
                className="mt-4 h-12 w-full rounded-full border border-[#dfe7db] bg-[#f7faf4] pl-11 pr-4 text-sm outline-none focus:border-[#1f9b4b] focus:ring-4 focus:ring-[#dff0e0]"
              />
            </form>

            <nav className="mt-4 grid gap-2" aria-label="Menu di động">
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

            {!isMarketplace ? (
              <div className="mt-4 grid gap-2 border-t border-[#ece8dd] pt-4">
                <Link
                  href={navCta.href}
                  onClick={closeMenu}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f9b4b] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,155,75,0.22)]"
                >
                  <CtaIcon size={18} aria-hidden="true" />
                  {navCta.label}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
