import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from './ui';

export const publicContainerClass = 'mx-auto max-w-6xl px-4';

export function PublicPageMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main id="main-content" className={cn(publicContainerClass, 'pb-8 pt-6 sm:py-10 lg:py-12', className)}>
      {children}
    </main>
  );
}

export function PublicDetailMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main id="main-content" className={cn(publicContainerClass, 'pb-8 pt-6 sm:py-10 lg:py-12', className)}>
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
    <div className="mb-7 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf/80">HTXONLINE</p>
        <h1 className="mt-2 max-w-[12ch] text-[2.15rem] font-bold leading-[0.98] tracking-tight text-ink sm:mt-3 sm:max-w-none sm:text-4xl sm:leading-none">{title}</h1>
        <p className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-slate-600 sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function PublicSection({ children, band = false, className }: { children: React.ReactNode; band?: boolean; className?: string }) {
  return (
    <section className={cn(band ? 'bg-white/88 py-12 backdrop-blur-sm' : 'py-12', className)}>
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[2rem]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {href && linkLabel ? (
        <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1 font-semibold text-leaf transition hover:gap-2">
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export const publicCardClass = 'overflow-hidden rounded-2xl border border-slate-200/80 bg-white/96 shadow-[var(--shadow-card)] backdrop-blur-sm';

export const publicProseClass = 'text-sm leading-7 text-slate-700';

export function PublicInfoTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
