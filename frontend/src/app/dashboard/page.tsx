'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, LucideIcon, Map, Package, QrCode, WalletCards } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Button, Panel } from '@/components/ui';

type Overview = {
  cooperatives: number;
  users: number;
  products: number;
  zones: number;
  logs: number;
  passports: number;
  unpaidInvoices: number;
  revenue: number;
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => apiFetch<Overview>('/reports/overview')
  });
  const overview = data?.data;
  const stats: Array<{ label: string; value?: number; icon: LucideIcon }> = [
    { label: 'Sản phẩm', value: overview?.products, icon: Package },
    { label: 'QR Passport', value: overview?.passports, icon: QrCode },
    { label: 'Vùng trồng', value: overview?.zones, icon: Map },
    { label: 'Nhật ký', value: overview?.logs, icon: ClipboardList }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Tổng quan</h1>
          <p className="text-sm text-slate-600">Agri Passport</p>
        </div>
        <Link href="/dashboard/products">
          <Button>Thêm sản phẩm</Button>
        </Link>
      </div>

      <Panel className="bg-leaf text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-white/15">
            <WalletCards size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm opacity-90">Doanh thu đã ghi nhận</p>
            <p className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(overview?.revenue)}</p>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Panel key={label}>
            <Icon className="mb-3 text-leaf" size={24} aria-hidden="true" />
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold">{isLoading ? '...' : Number(value ?? 0)}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['/dashboard/farming-logs', 'Ghi nhật ký'],
          ['/dashboard/passports', 'Tạo QR'],
          ['/dashboard/zones', 'Thêm vùng trồng']
        ].map(([href, label]) => (
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
