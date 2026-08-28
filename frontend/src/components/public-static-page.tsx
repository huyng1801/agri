import type { ReactNode } from 'react';
import { PublicImage } from './public-image';
import { PublicPageHeader, PublicPageMain } from './public-layout';
import { PublicShell } from './public-shell';
import { Panel } from './ui';

export function PublicStaticPage({
  title,
  description,
  heroImageUrl,
  heroImageAlt,
  children
}: {
  title: string;
  description: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <PublicShell>
      <PublicPageMain>
        <div className="mb-6 grid gap-4 lg:mb-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-end">
          <div className="rounded-[2rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.92)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <PublicPageHeader title={title} description={description} />
          </div>
          {heroImageUrl ? (
            <div className="overflow-hidden rounded-[2rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.92)] p-2 shadow-[var(--shadow-card)] backdrop-blur">
              <PublicImage
                src={heroImageUrl}
                alt={heroImageAlt || title}
                wrapperClassName="aspect-[16/10] rounded-[1.5rem]"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          ) : null}
        </div>
        {children ?? (
          <Panel>
            <p className="leading-7 text-slate-700">Nội dung đang được đội vận hành HTXONLINE cập nhật.</p>
          </Panel>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
