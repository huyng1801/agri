'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, ShoppingCart, Store } from 'lucide-react';
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

  return (
    <nav
      data-testid="public-bottom-nav"
      className="fixed bottom-[calc(var(--safe-bottom)+0.35rem)] left-1/2 z-30 w-[calc(100%-0.75rem)] max-w-[26rem] -translate-x-1/2 rounded-[1.75rem] border border-white/75 bg-white/78 px-2 py-1 shadow-[0_16px_42px_rgba(23,33,27,0.12)] backdrop-blur-2xl lg:hidden"
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
                'relative flex min-h-[42px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[9px] font-semibold transition-colors',
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
