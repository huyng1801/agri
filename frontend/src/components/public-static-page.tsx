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
      <PublicPageMain className="pt-4 sm:pt-8 lg:pt-10">
        <div className="mb-6 overflow-hidden rounded-[2.1rem] border border-[#e7e3d7] bg-white shadow-[0_22px_48px_rgba(15,23,42,0.06)] lg:mb-8">
          <div
            className="grid gap-4 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf7_100%)] p-4 sm:p-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:p-7"
            style={{
              backgroundImage:
                'radial-gradient(circle at top left, rgba(255,255,255,0.94), transparent 32%), radial-gradient(circle at 88% 16%, rgba(47,132,81,0.08), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f8fbf7 100%)'
            }}
          >
            <div className="rounded-[2rem] border border-[#e7e3d7] bg-[rgba(255,255,255,0.9)] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
              <PublicPageHeader title={title} description={description} />
            </div>
            {heroImageUrl ? (
              <div className="overflow-hidden rounded-[2rem] border border-[#e7e3d7] bg-white p-2 shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur">
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
