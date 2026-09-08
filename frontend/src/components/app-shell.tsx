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
import { PublicLogo } from './public-logo';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(currentUser());
    setArea(siteAreaFromHost(window.location.hostname));
    setMobileMenuOpen(false);
  }, [pathname]);

  const roleSet = new Set(user?.roles ?? []);
  const effectiveArea = area === 'local' ? dashboardAreaForRoles(user?.roles ?? []) : area;
  const allowed = user ? isRoleAllowedInArea(user.roles, area) : false;
  const visibleNav = nav.filter((item) => item.areas.includes(effectiveArea as NavArea) && item.roles.some((role) => roleSet.has(role)));
  const routeAllowed =
    user && (effectiveArea === 'admin' || effectiveArea === 'htx') ? isDashboardRouteAllowed(pathname, effectiveArea, user.roles) : false;
  const mobileNav = visibleNav.slice(0, 4);

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
    <div className="min-h-screen lg:flex bg-[#f8fafc]">
      <aside data-testid="sidebar" className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col shadow-xs">
        <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#131935] p-1.5 shadow-sm">
            <PublicLogo size={28} variant="htx" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-base font-extrabold tracking-tight text-[#131935]">HTXONLINE</span>
            <span className="block truncate text-xs font-semibold text-slate-500">{user.fullName}</span>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Điều hướng quản trị">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition',
                  active
                    ? 'bg-[#131935] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-[#eef0fa] hover:text-[#131935]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button data-testid="logout-button" onClick={signOut} className="mt-4 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
          <LogOut size={19} aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </aside>

      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden shadow-xs">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 font-bold">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#131935] p-1 shadow-sm">
                <PublicLogo size={22} variant="htx" className="h-full w-full object-contain" />
              </div>
              <span className="text-base font-extrabold text-[#131935]">HTXONLINE</span>
            </Link>
            <button aria-label="Đăng xuất" onClick={signOut} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-rose-700 shadow-sm active:bg-slate-50">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation for HTX Operations */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-2 py-1 lg:hidden shadow-lg" aria-label="Thao tác nhanh di động">
        <div className="grid grid-cols-5 gap-1">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold transition',
                  active
                    ? 'text-[#131935]'
                    : 'text-slate-500 hover:text-[#131935]'
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
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-[#131935]"
            aria-label="Xem thêm chức năng"
          >
            <Boxes size={18} aria-hidden="true" />
            <span>Thêm</span>
          </button>
        </div>
      </nav>

      {/* Full Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="flex-1 overflow-y-auto bg-white p-5 mt-16 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#131935] p-1">
                  <PublicLogo size={20} variant="htx" />
                </div>
                <span className="font-extrabold text-[#131935]">Chức năng HTXONLINE</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600 font-bold"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl p-3 text-xs font-bold transition border',
                      active
                        ? 'border-[#131935] bg-[#131935] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <main data-testid="loading-skeleton" className="grid min-h-screen place-items-center px-4 bg-[#f8fafc]">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
    <main data-testid="error-state" className="grid min-h-screen place-items-center px-4 bg-[#f8fafc]">
      <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="grid h-12 w-12 mx-auto place-items-center rounded-xl bg-[#131935] text-white shadow-sm mb-4">
          <ShieldCheck size={26} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-extrabold text-[#131935]">{title}</h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">{message}</p>
        <Link href={actionHref} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#131935] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#090d1d]">
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
