'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, ShoppingCart, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartCountBadge } from './cart-count-badge';
import { cn } from './ui';

const items = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/san-pham', label: 'Sản phẩm', icon: ShoppingBag, match: (path: string) => path.startsWith('/san-pham') },
  { href: '/htx', label: 'HTX', icon: Store, match: (path: string) => path.startsWith('/htx') },
  { href: '/gio-hang', label: 'Giỏ hàng', icon: ShoppingCart, match: (path: string) => path.startsWith('/gio-hang') || path.startsWith('/thanh-toan') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') }
] as const;

export function PublicBottomNav() {
  const pathname = usePathname();
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      data-testid="public-bottom-nav"
      aria-hidden={footerVisible}
      className={cn(
        'fixed bottom-[calc(var(--safe-bottom)+0.5rem)] left-1/2 z-30 w-[calc(100%-1rem)] max-w-[25rem] -translate-x-1/2 rounded-[1.6rem] border border-white/80 bg-white/84 px-2 py-1.5 shadow-[0_18px_44px_rgba(23,33,27,0.14)] backdrop-blur-2xl transition duration-200 lg:hidden',
        footerVisible ? 'pointer-events-none translate-y-6 opacity-0' : 'opacity-100'
      )}
    >
      <div className="mx-auto grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[9px] font-semibold transition-colors',
                active
                  ? 'bg-mint/80 text-leaf shadow-[inset_0_0_0_1px_rgba(47,132,81,0.08)]'
                  : 'text-slate-500/90'
              )}
            >
              <span className="relative">
                <Icon size={17} aria-hidden="true" />
                {item.href === '/gio-hang' && <CartCountBadge className="-right-2 -top-2" />}
              </span>
              <span className="max-w-full truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
