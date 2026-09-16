export function formatCurrency(value: unknown) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(number);
}

export function formatDate(value: unknown) {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  // Keep server and browser output identical when an ISO timestamp is close
  // to midnight in the server's UTC timezone.
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

export function statusTone(status?: string) {
  if (!status) return 'bg-slate-100 text-slate-700';
  if (['ACTIVE', 'PUBLISHED', 'PAID', 'READ'].includes(status)) return 'bg-mint text-leaf';
  if (['DRAFT', 'TRIAL', 'UNPAID'].includes(status)) return 'bg-sky text-slate-700';
  if (['SUSPENDED', 'OVERDUE', 'LOCKED', 'CANCELLED', 'HIDDEN'].includes(status)) return 'bg-rose-100 text-rose-700';
  return 'bg-stone-100 text-stone-700';
}
