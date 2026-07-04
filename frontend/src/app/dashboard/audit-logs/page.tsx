'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Input, Panel } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';

type AuditLog = {
  id: string;
  actorId?: string | null;
  cooperativeId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadataJson?: unknown;
  createdAt: string;
  actor?: {
    email: string;
    fullName: string;
  } | null;
};

export default function AuditLogsPage() {
  const [action, setAction] = useState('');
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (action.trim()) params.set('action', action.trim());
    return params.toString();
  }, [action]);
  const logs = useQuery({
    queryKey: ['audit-logs', query],
    queryFn: () => apiFetch<AuditLog[]>(`/audit-logs${query ? `?${query}` : ''}`)
  });
  const items = logs.data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Nhật ký hệ thống</h1>
          <p className="text-sm text-slate-600">{items.length} bản ghi</p>
        </div>
        <Button variant="ghost" onClick={() => logs.refetch()} aria-label="Tải lại">
          <RefreshCcw size={18} aria-hidden="true" />
        </Button>
      </div>

      <div className="sticky top-[66px] z-10 rounded-md border border-slate-200 bg-white p-2 lg:top-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={action} onChange={(event) => setAction(event.target.value)} placeholder="Lọc action" className="pl-10" />
        </div>
      </div>

      {logs.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-md border border-slate-200 bg-white p-4">
              <div className="h-5 w-1/2 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {logs.isError && <Panel className="text-sm font-semibold text-rose-700">{errorMessage(logs.error)}</Panel>}
      {!logs.isLoading && !logs.isError && items.length === 0 && <Panel className="text-slate-600">Chưa có nhật ký</Panel>}

      <div className="space-y-3">
        {items.map((log) => (
          <Panel key={log.id} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{log.action}</h2>
                <p className="text-sm text-slate-500">{log.actor?.email ?? log.actorId ?? 'system'}</p>
              </div>
              <time className="text-sm font-semibold text-slate-500">{formatDate(log.createdAt)}</time>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <dt className="text-slate-500">Entity</dt>
                <dd className="mt-1 break-words font-semibold">{log.entity}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Entity ID</dt>
                <dd className="mt-1 break-words font-semibold">{log.entityId ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">HTX</dt>
                <dd className="mt-1 break-words font-semibold">{log.cooperativeId ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Actor</dt>
                <dd className="mt-1 break-words font-semibold">{log.actor?.fullName ?? '-'}</dd>
              </div>
            </dl>

            <pre className="max-h-40 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
              {JSON.stringify(log.metadataJson ?? {}, null, 2)}
            </pre>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể tải nhật ký';
}
