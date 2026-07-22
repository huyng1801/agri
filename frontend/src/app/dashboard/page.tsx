'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Boxes, ClipboardList, Database, FileText, LucideIcon, Map, Package, QrCode, Users, WalletCards } from 'lucide-react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Button, Panel } from '@/components/ui';

type Overview = {
  metrics: Array<{ key: string; label: string; value: number; isCurrency?: boolean }>;
};

function metricValue(overview: Overview | undefined, key: string) {
  return overview?.metrics.find((item) => item.key === key)?.value;
}

export default function DashboardPage() {
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const isFarmerOnly =
    user?.roles.includes('FARMER') && !user.roles.some((role) => role === 'ADMIN_HTX' || role === 'MEMBER_HTX' || role === 'SUPER_ADMIN');
  const { data, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => apiFetch<Overview>('/reports/overview')
  });
  const overview = data?.data;
  const stats: Array<{ label: string; value?: number; icon: LucideIcon }> = isSuperAdmin
    ? [
        { label: 'HTX', value: metricValue(overview, 'cooperatives'), icon: Boxes },
        { label: 'Người dùng', value: metricValue(overview, 'users'), icon: Users },
        { label: 'Liên hệ mới', value: metricValue(overview, 'contacts'), icon: ClipboardList },
        { label: 'Hóa đơn chưa thu', value: metricValue(overview, 'unpaidInvoices'), icon: FileText },
        { label: 'QR toàn hệ thống', value: metricValue(overview, 'passports'), icon: QrCode }
      ]
    : [
        { label: 'Sản phẩm', value: metricValue(overview, 'products'), icon: Package },
        { label: 'QR Passport', value: metricValue(overview, 'passports'), icon: QrCode },
        { label: 'Vùng trồng', value: metricValue(overview, 'zones'), icon: Map },
        { label: 'Nhật ký', value: metricValue(overview, 'logs'), icon: ClipboardList }
      ];
  const quickActions = isSuperAdmin
    ? [
        ['/dashboard/cooperatives', 'Quản lý HTX'],
        ['/dashboard/users', 'Quản lý tài khoản'],
        ['/dashboard/roles', 'Vai trò & quyền'],
        ['/dashboard/subscription-plans', 'Quản lý gói'],
        ['/dashboard/invoices', 'Hóa đơn'],
        ['/dashboard/orders', 'Đơn COD'],
        ['/dashboard/contacts', 'Liên hệ từ trang công khai'],
        ['/dashboard/audit-logs', 'Nhật ký hệ thống'],
        ['/dashboard/backups', 'Sao lưu']
      ]
    : isFarmerOnly
      ? [
          ['/dashboard/farming-logs', 'Ghi nhật ký'],
          ['/dashboard/orders', 'Xem đơn hàng'],
          ['/dashboard/products', 'Xem sản phẩm'],
          ['/dashboard/zones', 'Xem vùng trồng']
        ]
      : [
          ['/dashboard/farming-logs', 'Ghi nhật ký'],
          ['/dashboard/orders', 'Xem đơn hàng'],
          ['/dashboard/certifications', 'Quản lý chứng nhận'],
          ['/dashboard/passports', 'Tạo QR'],
          ['/dashboard/farmers', 'Thêm nông dân'],
          ['/dashboard/zones', 'Thêm vùng trồng']
        ];

  return (
    <div data-testid={isSuperAdmin ? 'admin-dashboard' : 'htx-dashboard'} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Tổng quan</h1>
          <p className="text-sm text-slate-600">{isSuperAdmin ? 'Quản trị hệ thống và SaaS HTX' : 'Vận hành HTX'}</p>
        </div>
        <Link href={isSuperAdmin ? '/dashboard/cooperatives' : '/dashboard/products'}>
          <Button>{isSuperAdmin ? 'Quản lý HTX' : 'Thêm sản phẩm'}</Button>
        </Link>
      </div>

      <Panel className="bg-leaf text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white/15">
            <WalletCards size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm opacity-90">{isSuperAdmin ? 'Doanh thu đã ghi nhận' : 'Gói và doanh thu HTX'}</p>
            <p className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(metricValue(overview, 'revenue') ?? 0)}</p>
          </div>
        </div>
      </Panel>

      <div className={isSuperAdmin ? 'grid grid-cols-2 gap-3 lg:grid-cols-5' : 'grid grid-cols-2 gap-3 lg:grid-cols-4'}>
        {stats.map(({ label, value, icon: Icon }) => (
          <Panel key={label}>
            <Icon className="mb-3 text-leaf" size={24} aria-hidden="true" />
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold">{isLoading ? '...' : Number(value ?? 0)}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {quickActions.map(([href, label]) => (
          <Link key={href} href={href}>
            <Panel className="transition hover:border-leaf hover:bg-mint">
              <span className="font-bold">{label}</span>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
