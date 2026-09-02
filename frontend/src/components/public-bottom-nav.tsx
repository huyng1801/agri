'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Home, LogIn, Newspaper, QrCode, Search, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';

const marketplaceItems = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/san-pham', label: 'Sản phẩm', icon: ShoppingBag, match: (path: string) => path.startsWith('/san-pham') },
  { href: '/htx', label: 'Đối tác', icon: Store, match: (path: string) => path.startsWith('/htx') },
  { href: '/san-pham?hasQr=true', label: 'Tra cứu', icon: Search, match: (path: string) => path.startsWith('/passport') || path.startsWith('/qr') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') }
] as const;

const internalItems = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/gioi-thieu', label: 'Vai trò', icon: Briefcase, match: (path: string) => path.startsWith('/gioi-thieu') || path.startsWith('/ve-chung-toi') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') },
  { href: '/lien-he', label: 'Liên hệ', icon: Store, match: (path: string) => path.startsWith('/lien-he') },
  { href: '/login', label: 'Đăng nhập', icon: LogIn, match: (path: string) => path.startsWith('/login') }
] as const;

const passportItems = [
  { href: '/', label: 'Trang chủ', icon: Home, match: (path: string) => path === '/' },
  { href: '/san-pham?hasQr=true', label: 'Có QR', icon: QrCode, match: (path: string) => path.startsWith('/san-pham') },
  { href: '/htx', label: 'HTX', icon: Store, match: (path: string) => path.startsWith('/htx') },
  { href: '/gioi-thieu', label: 'Giới thiệu', icon: Briefcase, match: (path: string) => path.startsWith('/gioi-thieu') || path.startsWith('/ve-chung-toi') },
  { href: '/tin-tuc', label: 'Tin tức', icon: Newspaper, match: (path: string) => path.startsWith('/tin-tuc') }
] as const;

export function PublicBottomNav({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const pathname = usePathname();
  const [footerVisible, setFooterVisible] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const items = siteKey === 'htxonline' ? internalItems : siteKey === 'passport' ? passportItems : marketplaceItems;
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
      aria-hidden={hidden}
      className={cn(
        'fixed bottom-[calc(var(--safe-bottom)+0.45rem)] left-1/2 z-30 w-[calc(100%-1rem)] max-w-[23rem] -translate-x-1/2 rounded-[1.55rem] border border-[#eadfce] bg-[rgba(255,251,244,0.92)] px-1.5 py-1.5 shadow-[0_16px_34px_rgba(26,22,16,0.12)] backdrop-blur-xl transition duration-200 lg:hidden',
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
                'relative flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-[1rem] px-1 text-[9px] font-semibold transition-colors',
                active
                  ? 'bg-[#132031] text-white shadow-[0_14px_24px_rgba(19,32,49,0.18)]'
                  : 'text-slate-500/90'
              )}
            >
              <span className="relative">
                <Icon size={15} aria-hidden="true" />
              </span>
              <span className="max-w-full truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
