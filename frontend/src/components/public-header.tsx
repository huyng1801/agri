'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LogIn, Menu, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, cn } from './ui';

const navItems = [
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/htx', label: 'HTX' },
  { href: '/ve-chung-toi', label: 'Về chúng tôi' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/lien-he', label: 'Liên hệ' }
] as const;

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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-lg font-bold text-ink">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-leaf text-white">
            <Leaf size={22} aria-hidden="true" />
          </span>
          <span className="truncate">{appName}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 md:flex" aria-label="Menu chính">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('transition hover:text-leaf', pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'text-leaf' : '')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/gio-hang" aria-label="Giỏ hàng" className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white">
            <ShoppingCart size={19} aria-hidden="true" />
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
          <nav className="relative border-t border-slate-200 bg-white px-4 py-4 shadow-lg" aria-label="Menu di động">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-3 text-base font-semibold',
                    pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-mint text-leaf' : 'text-slate-700'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
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
