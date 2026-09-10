'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, QrCode, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';

// Core 4 destinations preferred for native-like public mobile experience
const coreNavItems = [
  {
    href: '/',
    label: 'Trang chủ',
    icon: Home,
    match: (path: string) => path === '/'
  },
  {
    href: '/san-pham',
    label: 'Sản phẩm',
    icon: ShoppingBag,
    match: (path: string) => path === '/san-pham' || (path.startsWith('/san-pham') && !path.includes('/san-pham/'))
  },
  {
    href: '/truy-xuat',
    label: 'Quét QR',
    icon: QrCode,
    match: (path: string) => path === '/truy-xuat' || path.startsWith('/truy-xuat/')
  },
  {
    href: '/htx',
    label: 'Đối tác',
    icon: Store,
    match: (path: string) => path === '/htx' || path.startsWith('/htx/')
  }
] as const;

// Pages that must hide the global bottom nav to avoid collision with keyboard,
// reading mode, legal reading, or contextual bottom action bars
function shouldHideBottomNav(pathname: string): boolean {
  // Product passport detail pages have their own dedicated contextual bottom bar
  if (pathname.startsWith('/san-pham/') && pathname !== '/san-pham') return true;
  if (pathname.startsWith('/passport/')) return true;
  if (pathname.startsWith('/qr/')) return true;

  // Article deep reading mode
  if (pathname.startsWith('/tin-tuc/') && pathname !== '/tin-tuc') return true;

  // Contact page (avoids virtual keyboard collision)
  if (pathname === '/lien-he' || pathname.startsWith('/lien-he/')) return true;

  // Legal / policy / FAQ pages
  const legalRoutes = [
    '/dieu-khoan-su-dung',
    '/chinh-sach-bao-mat',
    '/chinh-sach-doi-tra',
    '/chinh-sach-van-chuyen',
    '/chinh-sach-van-hanh',
    '/cau-hoi-thuong-gap'
  ];
  if (legalRoutes.includes(pathname)) return true;

  return false;
}

export function PublicBottomNav({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const pathname = usePathname();
  const [footerIntersecting, setFooterIntersecting] = useState(false);

  const isHiddenContextually = shouldHideBottomNav(pathname);

  // Observe footer so bottom nav doesn't permanently obscure footer copyright
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterIntersecting(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (isHiddenContextually) return null;

  return (
    <nav
      data-testid="public-bottom-nav"
      aria-label="Điều hướng chính di động"
      aria-hidden={footerIntersecting || undefined}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-200 lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.03)]',
        footerIntersecting ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      )}
      style={{
        paddingBottom: 'max(0.25rem, var(--safe-bottom, 0px))'
      }}
    >
      <div className="mx-auto grid h-[58px] grid-cols-4 max-w-md items-center px-2">
        {coreNavItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex h-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-center transition-colors select-none touch-action-manipulation',
                active
                  ? 'text-[#0d7a28]'
                  : 'text-slate-500 hover:text-slate-800 active:text-[#0d7a28]'
              )}
            >
              {/* Subtle top indicator for active tab */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] w-6 rounded-full bg-[#0d7a28]"
                  aria-hidden="true"
                />
              )}

              <span className="relative grid place-items-center transition-transform group-active:scale-90">
                <Icon size={21} strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
              </span>

              <span
                className={cn(
                  'text-[11px] leading-tight tracking-tight',
                  active ? 'font-bold' : 'font-medium'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
