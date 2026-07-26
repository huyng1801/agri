'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, Menu, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartCountBadge } from './cart-count-badge';
import { PublicLogo } from './public-logo';
import { Button, cn } from './ui';

const navItems = [
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'HTX' },
  { href: '/ve-chung-toi', label: 'Về chúng tôi' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader({ appName = 'HTXONLINE' }: { appName?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/88 backdrop-blur-xl supports-[backdrop-filter]:bg-white/72">
      <div className="mx-auto flex min-h-[58px] max-w-6xl items-center justify-between gap-2.5 px-3.5 py-2 md:min-h-[76px] md:px-4 md:py-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-[0.98rem] font-bold text-ink sm:gap-2.5 sm:text-lg"
          aria-label={`${appName} - Trang chủ`}
        >
          <PublicLogo size={36} className="sm:h-[42px] sm:w-[42px]" />
          <span className="max-w-[8.5rem] truncate sm:max-w-none">{appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 md:flex" aria-label="Menu chính">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 transition-colors hover:bg-mint/60 hover:text-leaf',
                  active && 'bg-mint text-leaf shadow-[inset_0_0_0_1px_rgba(47,132,81,0.12)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative grid h-10.5 w-10.5 place-items-center rounded-[1rem] border border-slate-200 bg-white/92 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-leaf hover:text-leaf sm:h-11 sm:w-11"
          >
            <ShoppingCart size={19} aria-hidden="true" />
            <CartCountBadge />
          </Link>
          <Link href="/login" className="hidden sm:inline-flex">
            <Button>Đăng nhập</Button>
          </Link>
          <button
            type="button"
            className="grid h-10.5 w-10.5 place-items-center rounded-[1rem] border border-slate-200 bg-white/92 shadow-sm md:hidden sm:h-11 sm:w-11"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 top-[58px] z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} />
          <nav
            className="relative max-h-[calc(100vh-3.625rem)] overflow-y-auto border-t border-slate-200 bg-white px-3.5 py-3 shadow-lg"
            aria-label="Menu di động"
          >
            <div className="grid gap-1">
              <Link
                href="/"
                className={cn('rounded-xl px-4 py-3 text-base font-semibold', pathname === '/' ? 'bg-leaf text-white' : 'text-slate-700')}
              >
                Trang chủ
              </Link>
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn('rounded-xl px-4 py-3 text-base font-semibold', active ? 'bg-leaf text-white' : 'text-slate-700')}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
              <Link href="/gio-hang" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <span>Giỏ hàng</span>
                <CartCountBadge className="static min-h-6 min-w-6 translate-none text-xs" />
              </Link>
              <Link href="/login">
                <Button className="w-full">
                  <LogIn size={18} aria-hidden="true" />
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/tra-cuu-don-hang" className="block rounded-md px-3 py-2 text-center text-sm font-semibold text-slate-600">
                Tra cứu đơn hàng
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
