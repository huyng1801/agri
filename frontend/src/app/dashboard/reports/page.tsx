'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, Download, FileText, LineChart as LineChartIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { API_URL, apiFetch, currentUser } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button, Input, Panel, cn } from '@/components/ui';

type Metric = { key: string; label: string; value: number; isCurrency?: boolean };
type Overview = { metrics: Metric[] };
type Production = { total: number; byActivity: Array<{ activityType: string; count: number }>; daily: Array<{ day: string; count: number }> };
type Traceability = { totalViews: number; topPassports: Array<{ code: string; productName: string; views: number }> };
type Quality = { total: number; active: number; expired: number; passRate: number };
type Revenue = { total: number; invoices: Array<Record<string, unknown>> };
type Snapshot = { id: string; type: string; createdAt: string };

const ranges = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'custom', label: 'Tùy chỉnh' }
] as const;

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const [range, setRange] = useState<string>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [section, setSection] = useState<'overview' | 'production' | 'traceability' | 'quality' | 'revenue'>('overview');

  const querySuffix = useMemo(() => {
    const params = new URLSearchParams();
    if (range !== 'custom') params.set('range', range);
    if (range === 'custom' && from) params.set('from', from);
    if (range === 'custom' && to) params.set('to', to);
    const value = params.toString();
    return value ? `?${value}` : '';
  }, [range, from, to]);

  const overview = useQuery({ queryKey: ['reports', 'overview', querySuffix], queryFn: () => apiFetch<Overview>(`/reports/overview${querySuffix}`) });
  const production = useQuery({ queryKey: ['reports', 'production', querySuffix], queryFn: () => apiFetch<Production>(`/reports/production${querySuffix}`), enabled: section === 'production' || section === 'overview' });
  const traceability = useQuery({ queryKey: ['reports', 'traceability', querySuffix], queryFn: () => apiFetch<Traceability>(`/reports/traceability${querySuffix}`), enabled: section === 'traceability' || section === 'overview' });
  const quality = useQuery({ queryKey: ['reports', 'quality', querySuffix], queryFn: () => apiFetch<Quality>(`/reports/quality${querySuffix}`), enabled: section === 'quality' || section === 'overview' });
  const revenue = useQuery({ queryKey: ['reports', 'revenue', querySuffix], queryFn: () => apiFetch<Revenue>(`/reports/revenue${querySuffix}`), enabled: isSuperAdmin && section === 'revenue' });
  const snapshots = useQuery({ queryKey: ['reports', 'snapshots'], queryFn: () => apiFetch<Snapshot[]>('/reports/snapshots') });

  const snapshotMutation = useMutation({
    mutationFn: () => apiFetch(`/reports/snapshots/overview${querySuffix}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'snapshots'] })
  });

  const metrics = overview.data?.data.metrics ?? [];

  async function downloadExport(type: 'excel' | 'pdf') {
    const token = window.localStorage.getItem('agri_access_token');
    const response = await fetch(`${API_URL}/reports/export/${type}${querySuffix}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!response.ok) throw new Error('Không xuất được báo cáo');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bao-cao.${type === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 data-testid="page-title" className="text-2xl font-bold">Báo cáo</h1>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="reports-snapshot-button" onClick={() => snapshotMutation.mutate()} disabled={snapshotMutation.isPending}>
            <Download size={18} aria-hidden="true" />
            Lưu snapshot
          </Button>
          <Button variant="ghost" onClick={() => downloadExport('excel')}>Xuất Excel</Button>
          <Button variant="ghost" onClick={() => downloadExport('pdf')}>Xuất PDF</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ranges.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`reports-range-${item.id}`}
            className={cn('rounded-full px-3 py-1 text-sm font-semibold', range === item.id ? 'bg-leaf text-white' : 'bg-slate-100 text-slate-600')}
            onClick={() => setRange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {range === 'custom' && (
        <Panel className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">
            <span>Từ ngày</span>
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Đến ngày</span>
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </Panel>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          ['overview', 'Tổng quan'],
          ['production', 'Sản xuất'],
          ['traceability', 'Truy xuất'],
          ['quality', 'Chất lượng'],
          ...(isSuperAdmin ? [['revenue', 'Doanh thu SaaS']] : [])
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn('rounded-md px-3 py-2 text-sm font-semibold', section === id ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200')}
            onClick={() => setSection(id as typeof section)}
          >
            {label}
          </button>
        ))}
      </div>

      {(section === 'overview' || section === 'production' || section === 'traceability' || section === 'quality') && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Panel key={metric.key}>
              <BarChart3 className="mb-2 text-leaf" size={22} aria-hidden="true" />
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="text-xl font-bold">{metric.isCurrency ? formatCurrency(metric.value) : metric.value}</p>
            </Panel>
          ))}
        </div>
      )}

      {section === 'production' && production.data?.data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="mb-3 flex items-center gap-2">
              <LineChartIcon className="text-leaf" size={20} />
              <h2 className="font-bold">Nhật ký theo ngày</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={production.data.data.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#15803d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel>
            <h2 className="mb-3 font-bold">Theo loại hoạt động</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={production.data.data.byActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activityType" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}

      {section === 'traceability' && traceability.data?.data && (
        <Panel>
          <h2 className="font-bold">Lượt quét QR hàng đầu</h2>
          <p className="mt-1 text-sm text-slate-600">Tổng lượt quét: {traceability.data.data.totalViews}</p>
          <div className="mt-4 space-y-2">
            {traceability.data.data.topPassports.map((item) => (
              <div key={item.code} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span className="font-semibold">{item.productName} · {item.code}</span>
                <span>{item.views} lượt</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {section === 'quality' && quality.data?.data && (
        <div className="grid gap-3 sm:grid-cols-4">
          <MetricCard label="Tổng chứng nhận" value={quality.data.data.total} />
          <MetricCard label="Đang hiệu lực" value={quality.data.data.active} />
          <MetricCard label="Hết hạn" value={quality.data.data.expired} />
          <MetricCard label="Tỷ lệ đạt" value={`${quality.data.data.passRate}%`} />
        </div>
      )}

      {section === 'revenue' && isSuperAdmin && (
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

      <Panel>
        <h2 className="font-bold">Snapshot đã lưu</h2>
        <div className="mt-3 space-y-2">
          {(snapshots.data?.data ?? []).map((snapshot) => (
            <div key={snapshot.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
              <span>{snapshot.type} · {formatDate(snapshot.createdAt)}</span>
              <Button variant="ghost" onClick={() => window.open(`${API_URL}/reports/snapshots/${snapshot.id}/download`, '_blank')}>Tải JSON</Button>
            </div>
          ))}
          {!snapshots.data?.data?.length && <p className="text-sm text-slate-600">Chưa có snapshot nào.</p>}
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Panel>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Panel>
  );
}
