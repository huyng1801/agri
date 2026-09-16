'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Boxes,
  ClipboardList,
  Database,
  FileText,
  History,
  Home,
  LogOut,
  Map,
  MapPinned,
  Menu,
  MessageSquareText,
  Newspaper,
  Package,
  QrCode,
  Settings,
  ShieldCheck,
  Sprout,
  X,
  Users,
  WalletCards
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch, currentUser, logout, type CurrentUser } from '@/lib/api';
import { dashboardAreaForRoles, isDashboardRouteAllowed } from '@/lib/dashboard-access';
import { authPortalFromHost, isRoleAllowedInArea, loginUrlForArea, loginUrlForPortal, siteAreaFromHost } from '@/lib/domain';
import type { AuthPortal, SiteArea } from '@/lib/domain';
import { PublicLogo } from './public-logo';
import { cn } from './ui';

type NavRole = 'SUPER_ADMIN' | 'ADMIN_HTX' | 'MEMBER_HTX' | 'FARMER' | 'BUYER';
type NavArea = 'admin' | 'htx';
type NavGroup = 'overview' | 'operations' | 'content' | 'system';
type NavItem = { href: string; label: string; icon: typeof Home; roles: NavRole[]; areas: NavArea[]; testId: string; group: NavGroup };

const nav: NavItem[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: Home, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-dashboard', group: 'overview' },
  { href: '/dashboard/cooperatives', label: 'HTX', icon: Boxes, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-cooperatives', group: 'operations' },
  { href: '/dashboard/users', label: 'Tài khoản', icon: Users, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-users', group: 'operations' },
  { href: '/dashboard/roles', label: 'Vai trò & quyền', icon: ShieldCheck, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-roles', group: 'system' },
  { href: '/dashboard/crop-types', label: 'Loại cây', icon: Sprout, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-crop-types', group: 'operations' },
  { href: '/dashboard/subscription-plans', label: 'Gói SaaS', icon: WalletCards, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-plans', group: 'system' },
  { href: '/dashboard/invoices', label: 'Hóa đơn SaaS', icon: FileText, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-invoices', group: 'system' },
  { href: '/dashboard/news', label: 'Tin tức', icon: Newspaper, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-news', group: 'content' },
  { href: '/dashboard/orders', label: 'Đơn COD', icon: ClipboardList, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-orders', group: 'operations' },
  { href: '/dashboard/contacts', label: 'Liên hệ', icon: MessageSquareText, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-contacts', group: 'content' },
  { href: '/dashboard/reports', label: 'Báo cáo tổng', icon: Bell, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-reports', group: 'content' },
  { href: '/dashboard/audit-logs', label: 'Nhật ký hệ thống', icon: History, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-audit-logs', group: 'system' },
  { href: '/dashboard/backups', label: 'Sao lưu', icon: Database, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-backups', group: 'system' },
  { href: '/dashboard/settings', label: 'Cấu hình sàn', icon: Settings, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-settings', group: 'system' },
  { href: '/dashboard', label: 'Tổng quan', icon: Home, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-dashboard', group: 'overview' },
  { href: '/dashboard/cooperatives', label: 'Thông tin HTX', icon: Boxes, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-profile', group: 'operations' },
  { href: '/dashboard/products', label: 'Sản phẩm', icon: Package, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-products', group: 'operations' },
  { href: '/dashboard/certifications', label: 'Chứng nhận', icon: ShieldCheck, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-certifications', group: 'operations' },
  { href: '/dashboard/zones', label: 'Vùng trồng', icon: Map, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-zones', group: 'operations' },
  { href: '/dashboard/trees', label: 'Cây', icon: Sprout, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-trees', group: 'operations' },
  { href: '/dashboard/map', label: 'Bản đồ cây', icon: MapPinned, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-tree-map', group: 'operations' },
  { href: '/dashboard/farming-logs', label: 'Nhật ký', icon: ClipboardList, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-farming-logs', group: 'operations' },
  { href: '/dashboard/tree-events', label: 'Nhật ký cây', icon: History, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-tree-events', group: 'operations' },
  { href: '/dashboard/harvests', label: 'Thu hoạch', icon: Package, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-harvests', group: 'operations' },
  { href: '/dashboard/lots', label: 'Lô sản phẩm', icon: Boxes, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-lots', group: 'operations' },
  { href: '/dashboard/traceability', label: 'Mã truy xuất', icon: QrCode, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-traceability', group: 'content' },
  { href: '/dashboard/passports', label: 'QR', icon: QrCode, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-passports', group: 'content' },
  { href: '/dashboard/orders', label: 'Đơn hàng', icon: ClipboardList, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-orders', group: 'content' },
  { href: '/dashboard/users', label: 'Thành viên', icon: Users, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-members', group: 'system' },
  { href: '/dashboard/farmers', label: 'Nông dân', icon: Users, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-farmers', group: 'system' },
  { href: '/dashboard/subscription-plans', label: 'Gói đang dùng', icon: WalletCards, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-subscription', group: 'system' },
  { href: '/dashboard/invoices', label: 'Hóa đơn SaaS', icon: FileText, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-invoices', group: 'system' },
  { href: '/dashboard/reports', label: 'Báo cáo HTX', icon: Bell, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-reports', group: 'content' }
];

const navGroupLabels: Record<NavGroup, string> = {
  overview: 'Điều hành',
  operations: 'Vận hành',
  content: 'Dữ liệu & nội dung',
  system: 'Hệ thống'
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof currentUser>>(null);
  const [area, setArea] = useState<SiteArea>('local');
  const [portal, setPortal] = useState<AuthPortal>('AGRIPASSPORT');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMounted(true);
    const storedUser = currentUser();
    setUser(storedUser);
    setArea(siteAreaFromHost(window.location.hostname));
    setPortal(authPortalFromHost(window.location.hostname));
    setMobileMenuOpen(false);
    if (!storedUser) {
      void apiFetch<CurrentUser>('/auth/me')
        .then((result) => {
          if (cancelled) return;
          window.localStorage.setItem('agri_user', JSON.stringify(result.data));
          setUser(result.data);
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const roleSet = new Set(user?.roles ?? []);
  const effectiveArea = area === 'local' ? dashboardAreaForRoles(user?.roles ?? []) : area;
  const portalAllowed = user ? !user.portal || area === 'local' || user.portal === portal : false;
  const allowed = user ? isRoleAllowedInArea(user.roles, area) && portalAllowed : false;
  const visibleNav = nav.filter((item) => item.areas.includes(effectiveArea as NavArea) && item.roles.some((role) => roleSet.has(role)));
  const routeAllowed =
    user && (effectiveArea === 'admin' || effectiveArea === 'htx') ? isDashboardRouteAllowed(pathname, effectiveArea, user.roles) : false;
  const activeMobileItem = visibleNav.find((item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)));
  const mobileNav = activeMobileItem
    ? [activeMobileItem, ...visibleNav.filter((item) => item !== activeMobileItem)].slice(0, 4)
    : visibleNav.slice(0, 4);
  const groupedNav = (['overview', 'operations', 'content', 'system'] as NavGroup[])
    .map((group) => ({ group, items: visibleNav.filter((item) => item.group === group) }))
    .filter((section) => section.items.length > 0);

  function signOut() {
    logout();
    const loginUrl = loginUrlForArea(area);
    if (loginUrl.startsWith('http')) window.location.assign(loginUrl);
    else router.replace(loginUrl);
  }

  if (!mounted) {
    return <LoadingState />;
  }

  if (!user) {
    return <AccessState title="Cần đăng nhập" message="Vui lòng đăng nhập đúng khu vực quản trị HTXONLINE." actionHref={loginUrlForArea(area)} actionLabel="Đăng nhập" />;
  }

  if (!allowed) {
    if (user.portal && user.portal !== portal) {
      return (
        <AccessState
          title="Sai cổng đăng nhập"
          message="Tài khoản này đang thuộc cổng khác. Hãy mở đúng trang đăng nhập để tránh lẫn dữ liệu giữa các website."
          actionHref={loginUrlForPortal(user.portal)}
          actionLabel="Mở đúng cổng"
        />
      );
    }
    const isSuperAdmin = user.roles.includes('SUPER_ADMIN');
    return (
      <AccessState
        title="Sai khu vực truy cập"
        message={isSuperAdmin ? 'Super Admin sử dụng admin.htxonline.vn.' : 'Admin HTX, thành viên HTX và nông dân sử dụng htx.htxonline.vn.'}
        actionHref={isSuperAdmin ? 'https://admin.htxonline.vn/dashboard' : 'https://htx.htxonline.vn/dashboard'}
        actionLabel="Mở đúng dashboard"
      />
    );
  }

  if (!routeAllowed) {
    return (
      <AccessState
        title="403 - Không có quyền truy cập"
        message="Route này không thuộc khu vực hoặc vai trò hiện tại của tài khoản."
        actionHref="/dashboard"
        actionLabel="Về tổng quan"
      />
    );
  }

  return (
    <div data-admin-shell className="admin-app-shell min-h-dvh lg:flex">
      <a href="#admin-main" className="admin-skip-link">Bỏ qua điều hướng</a>
      <aside data-testid="sidebar" className="admin-sidebar hidden lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <Link href="/dashboard" className="admin-brand-link">
          <div className="admin-brand-tile">
            <PublicLogo size={28} variant="htx" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="admin-brand-name">HTXONLINE</span>
            <span className="admin-brand-user">{user.fullName}</span>
          </div>
        </Link>
        <nav className="admin-sidebar-nav" aria-label="Điều hướng quản trị">
          {groupedNav.map(({ group, items }) => (
            <div key={group} className="admin-nav-group">
              <p className="admin-nav-group-label">{navGroupLabels[group]}</p>
              {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={cn(
                  'admin-nav-item',
                  active
                    ? 'is-active'
                    : ''
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
              })}
            </div>
          ))}
        </nav>
        <button type="button" data-testid="logout-button" onClick={signOut} className="admin-logout-button">
          <LogOut size={19} aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </aside>

      <main id="admin-main" tabIndex={-1} className="admin-main min-w-0 flex-1 pb-20 lg:pb-0">
        <header className="admin-mobile-header sticky top-0 z-20 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="admin-mobile-brand">
              <div className="admin-mobile-brand-tile">
                <PublicLogo size={22} variant="htx" className="h-full w-full object-contain" />
              </div>
              <span>HTXONLINE</span>
            </Link>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Mở menu quản trị" onClick={() => setMobileMenuOpen(true)} className="admin-icon-button">
                <Menu size={19} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Đăng xuất" onClick={signOut} className="admin-icon-button admin-icon-button-danger">
              <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>
        <div className="admin-main-content mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation for HTX Operations */}
      <nav className="admin-mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 lg:hidden" aria-label="Thao tác nhanh di động">
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'admin-mobile-nav-item',
                  active
                    ? 'is-active'
                    : ''
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="truncate max-w-full px-1">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="admin-mobile-nav-item"
            aria-label="Xem thêm chức năng"
            data-testid="mobile-more-button"
          >
            <Boxes size={18} aria-hidden="true" />
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      {/* Full Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div data-testid="mobile-more-menu" className="admin-mobile-sheet fixed inset-0 z-50 flex flex-col lg:hidden" role="dialog" aria-modal="true" aria-label="Menu quản trị">
          <div className="admin-mobile-sheet-panel flex-1 overflow-y-auto">
            <div className="admin-mobile-sheet-header">
              <div className="flex items-center gap-2">
                <div className="admin-mobile-brand-tile h-8 w-8 rounded-lg p-1">
                  <PublicLogo size={20} variant="htx" />
                </div>
                <span>Chức năng HTXONLINE</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="admin-icon-button"
                aria-label="Đóng"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>
            <div className="admin-mobile-sheet-groups">
              {groupedNav.map(({ group, items }) => (
                <section key={group} className="admin-mobile-sheet-group">
                  <h2>{navGroupLabels[group]}</h2>
                  <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={item.testId}
                    className={cn(
                      'admin-mobile-sheet-item',
                      active
                        ? 'is-active'
                        : ''
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
                  })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <main data-admin-shell data-testid="loading-skeleton" className="admin-state-screen grid min-h-dvh place-items-center px-4">
      <section className="admin-state-card w-full max-w-md">
        <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
        <div className="mt-4 h-6 w-2/3 rounded-lg bg-slate-100 animate-pulse" />
        <div className="mt-3 h-4 w-full rounded-md bg-slate-100 animate-pulse" />
        <div className="mt-2 h-4 w-4/5 rounded-md bg-slate-100 animate-pulse" />
      </section>
    </main>
  );
}

function AccessState({ title, message, actionHref, actionLabel }: { title: string; message: string; actionHref: string; actionLabel: string }) {
  return (
    <main data-admin-shell data-testid="error-state" className="admin-state-screen grid min-h-dvh place-items-center px-4">
      <section className="admin-state-card max-w-md text-center">
        <div className="admin-state-icon">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed">{message}</p>
        <Link href={actionHref} className="admin-state-action mt-6 inline-flex min-h-11 items-center justify-center px-6 py-2.5 text-sm font-bold">
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
