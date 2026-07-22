'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheckBig, Clock3, Mail, MessageSquareText, PhoneCall, RefreshCcw, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type ContactStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'DONE' | 'SPAM';

type ContactInquiry = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  message: string;
  sourcePath?: string | null;
  status: ContactStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse<T> = {
  data: T[];
  meta?: Record<string, unknown>;
};

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { status: ContactStatus; note: string }>>({});

  const contacts = useQuery({
    queryKey: ['contacts-dashboard', search, statusFilter],
    queryFn: () => apiFetch<ListResponse<ContactInquiry>>(contactsPath({ search, statusFilter }))
  });

  const items = listItems(contacts.data?.data);
  const saveContact = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: ContactStatus; note: string }) =>
      apiFetch<ContactInquiry>(`/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: note || undefined })
      }),
    onSuccess: (result) => {
      setDrafts((current) => ({
        ...current,
        [result.data.id]: {
          status: result.data.status,
          note: result.data.note ?? ''
        }
      }));
      queryClient.invalidateQueries({ queryKey: ['contacts-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Liên hệ từ trang công khai</h1>
          <p className="text-sm text-slate-600">Theo dõi lead từ sàn công khai, cập nhật trạng thái xử lý và ghi chú nội bộ.</p>
        </div>
        <Button type="button" variant="ghost" onClick={() => contacts.refetch()} aria-label="Tải lại">
          <RefreshCcw size={18} aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Tổng liên hệ" value={items.length} icon={MessageSquareText} />
        <Metric label="Mới" value={items.filter((item) => item.status === 'NEW').length} icon={Clock3} tone="sky" />
        <Metric label="Đang xử lý" value={items.filter((item) => item.status === 'IN_PROGRESS').length} icon={ShieldCheck} tone="amber" />
        <Metric label="Hoàn tất" value={items.filter((item) => item.status === 'DONE').length} icon={CircleCheckBig} tone="leaf" />
      </div>

      <div className="sticky top-[66px] z-10 grid gap-2 rounded-md border border-slate-200 bg-white p-2 md:grid-cols-[minmax(0,1fr)_220px] lg:top-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, số điện thoại, email" className="pl-10" />
        </div>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{statusLabel(status)}</option>
          ))}
        </Select>
      </div>

      {contacts.isLoading && <ContactsSkeleton />}
      {contacts.isError && <Panel data-testid="error-state" className="text-rose-700">{errorMessage(contacts.error)}</Panel>}
      {!contacts.isLoading && !contacts.isError && items.length === 0 && (
        <Panel data-testid="empty-state" className="text-slate-600">Chưa có liên hệ nào.</Panel>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((contact) => {
          const draft = drafts[contact.id] ?? { status: contact.status, note: contact.note ?? '' };
          return (
            <article key={contact.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">{contact.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(contact.createdAt)} · {contact.sourcePath || '/lien-he'}</p>
                </div>
                <Badge className={statusTone(contact.status)}>{statusLabel(contact.status)}</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a href={`tel:${contact.phone}`} className="rounded-md bg-slate-50 p-3 text-sm">
                  <span className="mb-2 inline-flex items-center gap-2 font-semibold text-ink">
                    <PhoneCall size={16} aria-hidden="true" />
                    Gọi nhanh
                  </span>
                  <span className="block text-slate-600">{contact.phone}</span>
                </a>
                <a href={contact.email ? `mailto:${contact.email}` : '#'} className={cn('rounded-md bg-slate-50 p-3 text-sm', !contact.email && 'pointer-events-none opacity-60')}>
                  <span className="mb-2 inline-flex items-center gap-2 font-semibold text-ink">
                    <Mail size={16} aria-hidden="true" />
                    Email
                  </span>
                  <span className="block text-slate-600">{contact.email || 'Chưa cung cấp email'}</span>
                </a>
              </div>

              <Panel className="mt-4 bg-slate-50 shadow-none">
                <p className="text-xs font-semibold uppercase text-slate-500">Nội dung</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{contact.message}</p>
              </Panel>

              <div className="mt-4 grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  <span>Trạng thái</span>
                  <Select
                    value={draft.status}
                    onChange={(event) => setDrafts((current) => ({ ...current, [contact.id]: { ...draft, status: event.target.value as ContactStatus } }))}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{statusLabel(status)}</option>
                    ))}
                  </Select>
                </label>
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  <span>Ghi chú nội bộ</span>
                  <Textarea
                    value={draft.note}
                    onChange={(event) => setDrafts((current) => ({ ...current, [contact.id]: { ...draft, note: event.target.value } }))}
                    placeholder="Đã gọi lúc 10:30, khách muốn demo thêm..."
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={() => saveContact.mutate({ id: contact.id, status: draft.status, note: draft.note })} disabled={saveContact.isPending}>
                  Lưu xử lý
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone = 'ink'
}: {
  label: string;
  value: number;
  icon: typeof MessageSquareText;
  tone?: 'ink' | 'leaf' | 'sky' | 'amber';
}) {
  return (
    <Panel>
      <Icon className={cn('mb-3', tone === 'leaf' && 'text-leaf', tone === 'sky' && 'text-sky', tone === 'amber' && 'text-amber-700', tone === 'ink' && 'text-slate-500')} size={22} aria-hidden="true" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tone === 'leaf' && 'text-leaf', tone === 'sky' && 'text-sky', tone === 'amber' && 'text-amber-700', tone === 'ink' && 'text-ink')}>{value}</p>
    </Panel>
  );
}

function ContactsSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-md border border-slate-200 bg-white p-4">
          <div className="h-5 w-1/2 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
          <div className="mt-6 h-20 rounded bg-slate-100" />
          <div className="mt-4 h-24 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function contactsPath({ search, statusFilter }: { search: string; statusFilter: string }) {
  const params = new URLSearchParams({ limit: '80' });
  if (search) params.set('search', search);
  if (statusFilter) params.set('status', statusFilter);
  return `/contacts?${params.toString()}`;
}

function listItems<T>(payload: ListResponse<T> | T[] | undefined | null): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}

const statusOptions: ContactStatus[] = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'DONE', 'SPAM'];

function statusLabel(status: ContactStatus) {
  const labels: Record<ContactStatus, string> = {
    NEW: 'Mới',
    CONTACTED: 'Đã liên hệ',
    IN_PROGRESS: 'Đang xử lý',
    DONE: 'Hoàn tất',
    SPAM: 'Spam'
  };
  return labels[status];
}

function statusTone(status: ContactStatus) {
  const tones: Record<ContactStatus, string> = {
    NEW: 'bg-sky/10 text-sky',
    CONTACTED: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-violet-100 text-violet-700',
    DONE: 'bg-mint text-leaf',
    SPAM: 'bg-stone-100 text-stone-700'
  };
  return tones[status];
}
