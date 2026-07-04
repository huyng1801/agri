'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Download, RefreshCcw, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Button, Input, Panel } from '@/components/ui';

type BackupFile = {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  downloadPath: string;
  restoreConfirmation: string;
};

export default function BackupsPage() {
  const queryClient = useQueryClient();
  const [confirmations, setConfirmations] = useState<Record<string, string>>({});
  const backups = useQuery({ queryKey: ['backups'], queryFn: () => apiFetch<BackupFile[]>('/backups') });
  const createBackup = useMutation({
    mutationFn: () => apiFetch<BackupFile>('/backups', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['backups'] })
  });
  const download = useMutation({ mutationFn: downloadBackup });
  const restore = useMutation({
    mutationFn: ({ fileName, confirmation }: { fileName: string; confirmation: string }) =>
      apiFetch(`/backups/${encodeURIComponent(fileName)}/restore`, {
        method: 'POST',
        body: JSON.stringify({ confirmation })
      }),
    onSuccess: () => {
      setConfirmations({});
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    }
  });

  const items = backups.data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sao lưu</h1>
          <p className="text-sm text-slate-600">PostgreSQL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => backups.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button onClick={() => createBackup.mutate()} disabled={createBackup.isPending}>
            <Database size={18} aria-hidden="true" />
            {createBackup.isPending ? 'Đang tạo' : 'Tạo backup'}
          </Button>
        </div>
      </div>

      {(createBackup.isError || restore.isError || download.isError || backups.isError) && (
        <Panel className="text-sm font-semibold text-rose-700">
          {errorMessage(createBackup.error ?? restore.error ?? download.error ?? backups.error)}
        </Panel>
      )}

      {backups.isLoading && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-md border border-slate-200 bg-white p-4">
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
              <div className="mt-8 h-10 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {!backups.isLoading && items.length === 0 && <Panel className="text-slate-600">Chưa có backup</Panel>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((backup) => {
          const confirmation = confirmations[backup.fileName] ?? '';
          const canRestore = confirmation === backup.restoreConfirmation;
          return (
            <Panel key={backup.fileName} className="space-y-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-ink">{backup.fileName}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Ngày tạo</dt>
                    <dd className="mt-1 font-semibold">{formatDate(backup.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Dung lượng</dt>
                    <dd className="mt-1 font-semibold">{formatBytes(backup.sizeBytes)}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => download.mutate(backup.fileName)} disabled={download.isPending}>
                  <Download size={18} aria-hidden="true" />
                  Tải
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => restore.mutate({ fileName: backup.fileName, confirmation })}
                  disabled={!canRestore || restore.isPending}
                >
                  <RotateCcw size={18} aria-hidden="true" />
                  Khôi phục
                </Button>
              </div>

              <label className="block space-y-1 text-sm font-semibold text-slate-700">
                <span>Xác nhận restore</span>
                <Input
                  value={confirmation}
                  onChange={(event) => setConfirmations((current) => ({ ...current, [backup.fileName]: event.target.value }))}
                  placeholder={backup.restoreConfirmation}
                  autoComplete="off"
                />
              </label>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

async function downloadBackup(fileName: string) {
  const token = window.localStorage.getItem('agri_access_token');
  const response = await fetch(`${API_URL}/backups/${encodeURIComponent(fileName)}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include'
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string; errors?: Array<{ message?: string }> } | null;
    throw new Error(body?.errors?.[0]?.message || body?.message || 'Không tải được backup');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
