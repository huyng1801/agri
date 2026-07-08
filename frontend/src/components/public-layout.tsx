import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from './ui';

export const publicContainerClass = 'mx-auto max-w-6xl px-4';

export function PublicPageMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn(publicContainerClass, 'py-10', className)}>{children}</main>;
}

export function PublicDetailMain({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn(publicContainerClass, 'py-8 sm:py-10', className)}>{children}</main>;
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
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function PublicSection({ children, band = false, className }: { children: React.ReactNode; band?: boolean; className?: string }) {
  return (
    <section className={cn(band ? 'bg-white py-10' : 'py-10', className)}>
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
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {href && linkLabel ? (
        <Link href={href} className="inline-flex min-h-11 shrink-0 items-center gap-1 font-semibold text-leaf">
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export const publicCardClass = 'overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm';

export function PublicInfoTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
