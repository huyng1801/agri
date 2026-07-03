import Link from 'next/link';
import { ArrowRight, Leaf, QrCode, ShieldCheck } from 'lucide-react';
import { Button, Panel } from '@/components/ui';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:py-10">
      <section className="grid min-h-[78vh] content-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-sm font-semibold text-leaf">
            <Leaf size={16} aria-hidden="true" />
            Agri Passport
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">Agri Passport</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Quản lý HTX, sản phẩm, vùng trồng, nhật ký canh tác và QR truy xuất nguồn gốc trên một nền tảng web mobile-first.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button>
                Đăng nhập
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-3">
          {[
            ['QR Passport', 'Mã truy xuất công khai cho người mua', QrCode],
            ['Multi-tenant', 'Dữ liệu HTX được phân quyền riêng', ShieldCheck],
            ['Mobile-first', 'Form ngắn, card list, bottom nav', Leaf]
          ].map(([title, text, Icon]) => (
            <Panel key={String(title)} className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-leaf text-white">
                <Icon size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-bold">{String(title)}</span>
                <span className="block text-sm text-slate-600">{String(text)}</span>
              </span>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
