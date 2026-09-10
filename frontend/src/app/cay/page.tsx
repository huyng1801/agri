import { redirect } from 'next/navigation';
import { QrCode, Sprout } from 'lucide-react';
import { PublicShell } from '@/components/public-shell';
import { PublicPageMain } from '@/components/public-layout';
import { Button, Input } from '@/components/ui';

export default async function TreeLookupPage({ searchParams }: { searchParams?: Promise<{ code?: string }> }) {
  const code = (await searchParams)?.code?.trim();
  if (code) redirect(`/cay/${encodeURIComponent(code)}`);
  return <PublicShell><PublicPageMain className="max-w-2xl"><section className="rounded-[2rem] border border-[var(--border)] bg-white p-6 text-center shadow-sm sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#ecf8ec] text-[#0d7a28]"><Sprout size={28} /></span><p className="mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#0d7a28]">Hộ chiếu cây</p><h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">Tra cứu hồ sơ cá thể</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Nhập mã cây trên tem QR để xem vùng sản xuất, giống cây và timeline đã được công khai.</p><form action="/cay" method="GET" className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row"><Input required name="code" placeholder="Ví dụ: XOI-VLM-01-000001" aria-label="Mã cây" /><Button type="submit"><QrCode size={18} />Tra cứu</Button></form></section></PublicPageMain></PublicShell>;
}
