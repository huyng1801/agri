import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from './ui';

export const publicContainerClass = 'mx-auto max-w-[1220px] px-4 sm:px-5 lg:px-6';

export function PublicPageMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main
      id="main-content"
      className={cn(publicContainerClass, 'pb-[calc(8.8rem+var(--safe-bottom))] pt-6 sm:pb-10 sm:pt-10 lg:py-12', className)}
    >
      {children}
    </main>
  );
}

export function PublicDetailMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main
      id="main-content"
      className={cn(publicContainerClass, 'pb-[calc(8.8rem+var(--safe-bottom))] pt-6 sm:pb-10 sm:pt-10 lg:py-12', className)}
    >
      {children}
    </main>
  );
}

export function PublicBreadcrumb({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-leaf">
      <ArrowLeft size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function PublicPageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3.5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div className="max-w-3xl">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#2b8a3e] sm:text-sm">Nền tảng</p>
        <h1 className="mt-2 max-w-[18ch] text-[1.7rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#1f2233] sm:mt-3 sm:max-w-none sm:text-[3.2rem] sm:leading-[0.96]">
          {title}
        </h1>
        <p className="mt-2.5 max-w-2xl text-[0.95rem] leading-[1.72] text-slate-600 sm:mt-3 sm:text-base sm:leading-[1.85]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function PublicSection({ children, band = false, className }: { children: React.ReactNode; band?: boolean; className?: string }) {
  return (
    <section
      className={cn(
        band ? 'border-y border-[#ece8dd] bg-[#f7f7f2] py-10 sm:py-12 lg:py-14' : 'bg-white py-10 sm:py-12 lg:py-14',
        className
      )}
    >
      <div className={publicContainerClass}>{children}</div>
    </section>
  );
}

export function PublicSectionHeader({
  title,
  description,
  href,
  linkLabel
}: {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[1.82rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#24283a] sm:text-[2.65rem]">{title}</h2>
        <p className="mt-2 max-w-3xl text-[0.95rem] leading-[1.72] text-slate-600 sm:text-base sm:leading-[1.85]">{description}</p>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[#d8e7d8] bg-white px-5 font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
        >
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export const publicCardClass = 'overflow-hidden rounded-[1.9rem] border border-[#e8e4d8] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]';

export const publicProseClass = 'text-sm leading-7 text-slate-700';

export function PublicInfoTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#e8e4d8] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <p className="font-semibold text-[#1f2233]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
