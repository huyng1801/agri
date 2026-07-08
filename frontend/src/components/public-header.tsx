'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, Menu, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartCountBadge } from './cart-count-badge';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur transition-shadow duration-200',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-lg font-bold text-ink" aria-label={`${appName} — Trang chủ`}>
          <img src="/icon.svg" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-md" />
          <span className="truncate">{appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-700 md:flex" aria-label="Menu chính">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 transition-colors hover:bg-mint/60 hover:text-leaf',
                  active && 'bg-mint text-leaf'
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
            className="relative grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-leaf hover:text-leaf"
          >
            <ShoppingCart size={19} aria-hidden="true" />
            <CartCountBadge />
          </Link>
          <Link href="/login" className="hidden sm:inline-flex">
            <Button>Đăng nhập</Button>
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white md:hidden"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} />
          <nav className="relative max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-lg" aria-label="Menu di động">
            <div className="grid gap-1">
              <Link
                href="/"
                className={cn(
                  'rounded-md px-3 py-3 text-base font-semibold',
                  pathname === '/' ? 'bg-mint text-leaf' : 'text-slate-700'
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
                    className={cn(
                      'rounded-md px-3 py-3 text-base font-semibold',
                      active ? 'bg-mint text-leaf' : 'text-slate-700'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
              <Link href="/gio-hang" className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-700">
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
