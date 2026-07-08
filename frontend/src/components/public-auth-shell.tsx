import Link from 'next/link';
import { PublicLogo } from './public-logo';

export function PublicAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mint/35 via-white to-white">
      <header className="flex justify-center px-4 pt-8 pb-2">
        <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold text-ink" aria-label="HTXONLINE — Trang chủ">
          <PublicLogo size={48} className="ring-1 ring-slate-200" />
          <span>HTXONLINE</span>
        </Link>
      </header>
      <main className="grid place-items-center px-4 py-6">{children}</main>
    </div>
  );
}
