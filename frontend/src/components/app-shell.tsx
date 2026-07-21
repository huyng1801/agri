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
  Leaf,
  LogOut,
  Map,
  MessageSquareText,
  Newspaper,
  Package,
  QrCode,
  Settings,
  ShieldCheck,
  Users,
  WalletCards
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { currentUser, logout } from '@/lib/api';
import { dashboardAreaForRoles, isDashboardRouteAllowed } from '@/lib/dashboard-access';
import { isRoleAllowedInArea, loginUrlForArea, siteAreaFromHost } from '@/lib/domain';
import type { SiteArea } from '@/lib/domain';
import { cn } from './ui';

type NavRole = 'SUPER_ADMIN' | 'ADMIN_HTX' | 'MEMBER_HTX' | 'FARMER' | 'BUYER';
type NavArea = 'admin' | 'htx';
type NavItem = { href: string; label: string; icon: typeof Home; roles: NavRole[]; areas: NavArea[]; testId: string };

const nav: NavItem[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: Home, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-dashboard' },
  { href: '/dashboard/cooperatives', label: 'HTX', icon: Boxes, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-cooperatives' },
  { href: '/dashboard/users', label: 'Tài khoản', icon: Users, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-users' },
  { href: '/dashboard/roles', label: 'Vai trò & quyền', icon: ShieldCheck, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-roles' },
  { href: '/dashboard/subscription-plans', label: 'Gói SaaS', icon: WalletCards, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-plans' },
  { href: '/dashboard/invoices', label: 'Hóa đơn SaaS', icon: FileText, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-invoices' },
  { href: '/dashboard/news', label: 'Tin tức', icon: Newspaper, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-news' },
  { href: '/dashboard/orders', label: 'Đơn COD', icon: ClipboardList, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-orders' },
  { href: '/dashboard/contacts', label: 'Liên hệ', icon: MessageSquareText, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-contacts' },
  { href: '/dashboard/reports', label: 'Báo cáo tổng', icon: Bell, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-reports' },
  { href: '/dashboard/audit-logs', label: 'Nhật ký hệ thống', icon: History, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-audit-logs' },
  { href: '/dashboard/backups', label: 'Sao lưu', icon: Database, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-backups' },
  { href: '/dashboard/settings', label: 'Cấu hình sàn', icon: Settings, roles: ['SUPER_ADMIN'], areas: ['admin'], testId: 'admin-menu-settings' },
  { href: '/dashboard', label: 'Tổng quan', icon: Home, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-dashboard' },
  { href: '/dashboard/cooperatives', label: 'Thông tin HTX', icon: Boxes, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-profile' },
  { href: '/dashboard/products', label: 'Sản phẩm', icon: Package, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-products' },
  { href: '/dashboard/certifications', label: 'Chứng nhận', icon: ShieldCheck, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-certifications' },
  { href: '/dashboard/zones', label: 'Vùng trồng', icon: Map, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-zones' },
  { href: '/dashboard/farming-logs', label: 'Nhật ký', icon: ClipboardList, roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'], areas: ['htx'], testId: 'htx-menu-farming-logs' },
  { href: '/dashboard/passports', label: 'QR', icon: QrCode, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-passports' },
  { href: '/dashboard/news', label: 'Tin tá»©c', icon: Newspaper, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-news' },
  { href: '/dashboard/orders', label: 'Đơn hàng', icon: ClipboardList, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-orders' },
  { href: '/dashboard/users', label: 'Thành viên', icon: Users, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-members' },
  { href: '/dashboard/farmers', label: 'Nông dân', icon: Users, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-farmers' },
  { href: '/dashboard/subscription-plans', label: 'Gói đang dùng', icon: WalletCards, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-subscription' },
  { href: '/dashboard/invoices', label: 'Hóa đơn SaaS', icon: FileText, roles: ['ADMIN_HTX'], areas: ['htx'], testId: 'htx-menu-invoices' },
  { href: '/dashboard/reports', label: 'Báo cáo HTX', icon: Bell, roles: ['ADMIN_HTX', 'MEMBER_HTX'], areas: ['htx'], testId: 'htx-menu-reports' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof currentUser>>(null);
  const [area, setArea] = useState<SiteArea>('local');

  useEffect(() => {
    setMounted(true);
    setUser(currentUser());
    setArea(siteAreaFromHost(window.location.hostname));
  }, [pathname]);

  const roleSet = new Set(user?.roles ?? []);
  const effectiveArea = area === 'local' ? dashboardAreaForRoles(user?.roles ?? []) : area;
  const allowed = user ? isRoleAllowedInArea(user.roles, area) : false;
  const visibleNav = nav.filter((item) => item.areas.includes(effectiveArea as NavArea) && item.roles.some((role) => roleSet.has(role)));
  const routeAllowed =
    user && (effectiveArea === 'admin' || effectiveArea === 'htx') ? isDashboardRouteAllowed(pathname, effectiveArea, user.roles) : false;
  const mobileNav = visibleNav.slice(0, 5);

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
    return <AccessState title="Cần đăng nhập" message="Vui lòng đăng nhập đúng khu vực quản trị." actionHref={loginUrlForArea(area)} actionLabel="Đăng nhập" />;
  }

  if (!allowed) {
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
        message="Route này không thuộc khu vực hoặc vai trò hiện tại."
        actionHref="/dashboard"
        actionLabel="Về tổng quan"
      />
    );
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside data-testid="sidebar" className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-md px-2 py-2">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-leaf text-white">
            <Leaf size={24} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-bold">Agri Passport</span>
            <span className="block text-xs text-slate-500">{user.fullName}</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-700 hover:bg-mint',
                  active && 'bg-leaf text-white hover:bg-leaf'
                )}
              >
                <Icon size={19} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button data-testid="logout-button" onClick={signOut} className="mt-4 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50">
          <LogOut size={19} aria-hidden="true" />
          Đăng xuất
        </button>
      </aside>

      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-leaf text-white">
                <Leaf size={22} aria-hidden="true" />
              </span>
              Agri Passport
            </Link>
            <button aria-label="Đăng xuất" onClick={signOut} className="touch-target rounded-md border border-slate-200 bg-white text-rose-700">
              <LogOut className="mx-auto" size={20} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">{children}</div>
      </main>

      <nav data-testid="mobile-bottom-nav" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[calc(var(--safe-bottom)+8px)] pt-2 shadow-soft backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-slate-500',
                  active && 'bg-mint text-leaf'
                )}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function LoadingState() {
  return (
    <main data-testid="loading-skeleton" className="grid min-h-screen place-items-center px-4">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-10 w-10 rounded-md bg-slate-100" />
        <div className="mt-4 h-6 w-2/3 rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full rounded bg-slate-100" />
        <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
      </section>
    </main>
  );
}

function AccessState({ title, message, actionHref, actionLabel }: { title: string; message: string; actionHref: string; actionLabel: string }) {
  return (
    <main data-testid="error-state" className="grid min-h-screen place-items-center px-4">
      <section className="max-w-md rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Leaf className="mx-auto text-leaf" size={40} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <Link href={actionHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white shadow-soft">
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
