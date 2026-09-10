import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from './ui';

export const publicContainerClass = 'mx-auto w-full max-w-[var(--public-container-max)] px-4 sm:px-5 lg:px-6';

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
    <Link href={href} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand-primary)] transition hover:text-[var(--brand-primary-hover)]">
      <ArrowLeft size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function PublicBreadcrumbTrail({ current, path, homeUrl = '/', currentUrl = path }: { current: string; path: string; homeUrl?: string; currentUrl?: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: current, item: currentUrl }
    ]
  };

  return (
    <>
      <nav
        aria-label="Đường dẫn"
        className="mb-4 inline-flex min-h-11 flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--text-primary)]"
      >
        <Link href="/" className="inline-flex min-h-11 items-center font-semibold transition hover:text-[var(--brand-primary)]">
          Trang chủ
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium">{current}</span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}

export function PublicStructuredData({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function PublicPageHeader({
  title,
  description,
  action,
  eyebrow = 'Nền tảng',
  titleClassName
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  eyebrow?: string;
  titleClassName?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3.5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div className="max-w-3xl">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary-strong)] sm:text-sm">{eyebrow}</p>
        <h1 className={cn('type-h1 mt-2 max-w-[18ch] text-[1.7rem] sm:mt-3 sm:max-w-none sm:text-[3.2rem] sm:leading-[0.96]', titleClassName)}>
          {title}
        </h1>
        <p className="mt-2.5 max-w-2xl text-[0.95rem] leading-[1.72] text-[var(--text-secondary)] sm:mt-3 sm:text-base sm:leading-[1.8]">{description}</p>
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
        <h2 className="type-h2 text-[#24283a]">{title}</h2>
        <p className="mt-2 max-w-3xl text-[0.95rem] leading-[1.72] text-[var(--text-secondary)] sm:text-base sm:leading-[1.8]">{description}</p>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 font-semibold text-[var(--brand-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)]"
        >
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export const publicCardClass = 'overflow-hidden rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--public-shadow-card)]';

export const publicProseClass = 'text-base leading-7 text-[var(--text-secondary)]';

export function PublicInfoTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

export function PublicFaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left font-semibold text-[var(--text-primary)] marker:hidden focus-visible:outline-none sm:px-5 [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[var(--brand-primary)] transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-[var(--border)] px-4 pb-4 pt-3 text-sm leading-6 text-[var(--text-secondary)] sm:px-5 sm:pb-5">
        {answer}
      </div>
    </details>
  );
}
