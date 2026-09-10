'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Home, Info, LogIn, Newspaper, Phone, QrCode, Search, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';

const marketplaceItems = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/san-pham', label: 'Sản phẩm', icon: ShoppingBag, match: (path: string) => path.startsWith('/san-pham') && !path.includes('hasQr=true') },
  { href: '/san-pham?hasQr=true', label: 'Tra cứu QR', icon: QrCode, match: (path: string) => path.includes('hasQr=true') || path.startsWith('/passport') || path.startsWith('/qr') },
  { href: '/htx', label: 'Hợp tác xã', icon: Store, match: (path: string) => path.startsWith('/htx') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') }
] as const;

const internalItems = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/san-pham', label: 'Sản phẩm', icon: ShoppingBag, match: (path: string) => path.startsWith('/san-pham') },
  { href: '/htx', label: 'HTX', icon: Store, match: (path: string) => path.startsWith('/htx') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') },
  { href: '/login', label: 'Đăng nhập', icon: LogIn, match: (path: string) => path.startsWith('/login') }
] as const;

const passportItems = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/san-pham?hasQr=true', label: 'Sản phẩm', icon: ShoppingBag, match: (path: string) => path.startsWith('/san-pham') && !path.startsWith('/truy-xuat') },
  { href: '/truy-xuat', label: 'Quét QR', icon: QrCode, match: (path: string) => path.startsWith('/truy-xuat') || path.startsWith('/passport') || path.startsWith('/qr') },
  { href: '/htx', label: 'Đối tác', icon: Store, match: (path: string) => path.startsWith('/htx') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') }
] as const;

export function PublicBottomNav({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const pathname = usePathname();
  const [footerVisible, setFooterVisible] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const items = siteKey === 'htxonline' ? internalItems : siteKey === 'passport' ? passportItems : marketplaceItems;
  const isMarketplace = siteKey === 'agripassport' || siteKey === 'local';
  const isPassport = siteKey === 'passport';
  const enableBottomNav = siteKey !== 'htxonline';
  const revealThreshold = pathname === '/' ? 520 : pathname.startsWith('/san-pham') || pathname.startsWith('/htx') ? 420 : 260;

  useEffect(() => {
    if (!enableBottomNav) {
      setFooterVisible(false);
      setScrollHidden(false);
    }
  }, [enableBottomNav]);

  useEffect(() => {
    if (!enableBottomNav) return;
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.18 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [enableBottomNav]);

  useEffect(() => {
    if (!enableBottomNav) return;
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) {
        setScrollHidden(false);
        lastY = y;
        return;
      }

      if (y < revealThreshold) {
        setScrollHidden(true);
      } else if (y + 8 < lastY) {
        setScrollHidden(false);
      } else if (y > lastY + 10) {
        setScrollHidden(true);
      }

      lastY = y;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enableBottomNav]);

  if (!enableBottomNav) return null;

  const hidden = footerVisible || scrollHidden;

  return (
    <nav
      data-testid="public-bottom-nav"
      aria-hidden={hidden || undefined}
      inert={hidden ? true : undefined}
      className={cn(
        'fixed bottom-[calc(var(--safe-bottom)+0.45rem)] left-1/2 z-30 w-[calc(100%-1rem)] max-w-[23rem] -translate-x-1/2 rounded-[1.55rem] border border-[var(--border-strong)] bg-[rgba(255,255,255,0.94)] px-1.5 py-1.5 shadow-[0_16px_34px_rgba(26,22,16,0.12)] backdrop-blur-xl transition duration-200 lg:hidden',
        hidden ? 'pointer-events-none invisible translate-y-10 opacity-0' : 'opacity-100'
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
                'relative flex min-h-[48px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition-colors',
                active
                  ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[var(--text-primary)]'
              )}
            >
              <span className="relative">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 max-w-full truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
