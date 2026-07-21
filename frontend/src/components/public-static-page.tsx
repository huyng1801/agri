import type { ReactNode } from 'react';
import { PublicShell } from './public-marketplace';
import { PublicImage } from './public-image';
import { PublicPageHeader, PublicPageMain } from './public-layout';
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
        <div className="mb-6 grid gap-4 lg:mb-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <PublicPageHeader title={title} description={description} />
          {heroImageUrl ? (
            <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-2 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <PublicImage
                src={heroImageUrl}
                alt={heroImageAlt || title}
                wrapperClassName="aspect-[16/10] rounded-[1.2rem]"
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
