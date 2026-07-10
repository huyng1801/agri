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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/96 px-2 pb-[calc(var(--safe-bottom)+8px)] pt-1 shadow-[0_-10px_30px_rgba(23,33,27,0.08)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-[50px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-colors',
                active ? 'bg-mint text-leaf shadow-[inset_0_0_0_1px_rgba(47,132,81,0.10)]' : 'text-slate-500'
              )}
            >
              <span className="relative">
                <Icon size={18} aria-hidden="true" />
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
