'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, FileText } from 'lucide-react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Button, Panel } from '@/components/ui';

type Overview = Record<string, number>;
type Revenue = { total: number; invoices: Array<Record<string, unknown>> };

export default function ReportsPage() {
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const canSnapshot = user?.roles.some((role) => role === 'SUPER_ADMIN' || role === 'ADMIN_HTX') ?? false;
  const overview = useQuery({ queryKey: ['reports', 'overview'], queryFn: () => apiFetch<Overview>('/reports/overview') });
  const revenue = useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: () => apiFetch<Revenue>('/reports/revenue'),
    enabled: isSuperAdmin
  });
  const stats = overview.data?.data ?? {};

  async function snapshot() {
    await apiFetch('/reports/snapshots/overview', { method: 'POST' });
    overview.refetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Báo cáo</h1>
        {canSnapshot && (
          <Button onClick={snapshot}>
            <Download size={18} aria-hidden="true" />
            Lưu snapshot
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <Panel key={key}>
            <BarChart3 className="mb-2 text-leaf" size={22} aria-hidden="true" />
            <p className="text-sm text-slate-500">{key}</p>
            <p className="text-xl font-bold">{key === 'revenue' ? formatCurrency(value) : value}</p>
          </Panel>
        ))}
      </div>

      {isSuperAdmin && (
        <Panel>
          <div className="mb-3 flex items-center gap-2">
            <FileText className="text-leaf" size={22} aria-hidden="true" />
            <h2 className="text-lg font-bold">Doanh thu SaaS</h2>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(revenue.data?.data.total ?? 0)}</p>
          <div className="mt-4 space-y-2">
            {revenue.data?.data.invoices.slice(0, 12).map((invoice) => (
              <div key={String(invoice.id)} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span className="font-semibold">{String(invoice.invoiceCode)}</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
