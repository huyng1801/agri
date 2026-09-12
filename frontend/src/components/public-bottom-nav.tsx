'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { BriefcaseBusiness, Home, Info, Leaf, Mail, Newspaper, QrCode, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './ui';
import type { PublicSiteKey } from '@/lib/domain';
import { getPublicNavigation, type PublicNavigationEntry } from '@/lib/public-navigation';

const iconByHref: Record<string, LucideIcon> = {
  '/': Home,
  '/ve-chung-toi': Info,
  '/gioi-thieu': Info,
  '/cay': Leaf,
  '/san-pham': ShoppingBag,
  '/san-pham?hasQr=true': QrCode,
  '/htx': Store,
  '/tin-tuc': Newspaper,
  '/lien-he': Mail,
  '/tuyen-cong-tac-vien': BriefcaseBusiness
};

function isHrefActive(pathname: string, hasQrQuery: boolean, href: string) {
  if (href.includes('?hasQr=true')) return pathname === '/san-pham' && hasQrQuery;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavigationEntryActive(pathname: string, hasQrQuery: boolean, entry: PublicNavigationEntry) {
  return isHrefActive(pathname, hasQrQuery, entry.href) ||
    (entry.kind === 'dropdown' && entry.items.some((item) => isHrefActive(pathname, hasQrQuery, item.href)));
}

function getNavigationIcon(entry: PublicNavigationEntry): LucideIcon {
  return iconByHref[entry.href] ?? (entry.kind === 'dropdown' ? Leaf : Info);
}

// Pages that must hide the global bottom nav to avoid collision with keyboard,
// reading mode, legal reading, or contextual bottom action bars
function shouldHideBottomNav(pathname: string): boolean {
  // Product passport detail pages have their own dedicated contextual bottom bar
  if (pathname.startsWith('/san-pham/') && pathname !== '/san-pham') return true;
  if (pathname.startsWith('/passport/')) return true;
  if (pathname.startsWith('/qr/')) return true;
  if (pathname.startsWith('/cay/') && pathname !== '/cay') return true;

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
  const [hasQrQuery, setHasQrQuery] = useState(false);
  const isHiddenContextually = shouldHideBottomNav(pathname);
  const navigation = getPublicNavigation(siteKey);

  useEffect(() => {
    setHasQrQuery(new URLSearchParams(window.location.search).get('hasQr') === 'true');
  }, [pathname]);

  if (isHiddenContextually) return null;

  return (
    <nav
      data-testid="public-bottom-nav"
      role="navigation"
      aria-label="Điều hướng chính di động"
      className="fixed bottom-0 left-0 right-0 z-30 overflow-x-auto border-t border-slate-200/90 bg-white/95 backdrop-blur-md transition-all duration-200 lg:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.04)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        paddingBottom: 'max(0.35rem, var(--safe-bottom, 0px))'
      }}
    >
      <div className="mx-auto flex h-[60px] w-max min-w-full max-w-md items-center justify-center px-2">
        {navigation.map((entry) => {
          const active = isNavigationEntryActive(pathname, hasQrQuery, entry);
          const Icon = getNavigationIcon(entry);

          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={active ? 'page' : undefined}
              className="group relative flex h-full min-w-[64px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-center transition-colors select-none touch-action-manipulation"
            >
              {/* Top Accent Indicator */}
              {active && (
                <span
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 h-[2.5px] w-7 rounded-full bg-[var(--brand-primary)] transition-all duration-200"
                  aria-hidden="true"
                />
              )}

              {/* Icon with Native Pill Indicator */}
              <div
                className={cn(
                  'grid h-8 w-12 place-items-center rounded-full transition-all duration-200 group-active:scale-95',
                  active
                    ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] shadow-2xs'
                    : 'text-slate-500 group-hover:text-slate-800'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
              </div>

              {/* Text Label */}
              <span
                className={cn(
                  'text-[11px] leading-tight tracking-tight transition-colors',
                  active ? 'font-bold text-[var(--brand-primary)]' : 'font-medium text-slate-500 group-hover:text-slate-800'
                )}
              >
                {entry.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
