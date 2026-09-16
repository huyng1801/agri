import type { ReactNode } from 'react';
import { PublicImage } from './public-image';
import { PublicPageHeader, PublicPageMain } from './public-layout';
import { PublicShell } from './public-shell';
import { cn, Panel } from './ui';
import { brandizeSiteText } from '@/lib/page-metadata';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function PublicStaticPage({
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
  const siteKey = await getRequestPublicSiteKey();
  const displayTitle = brandizeSiteText(title, siteKey);
  const displayDescription = brandizeSiteText(description, siteKey);
  return (
    <PublicShell>
      <PublicPageMain className="pt-4 sm:pt-8 lg:pt-10">
        <div data-public-static-page="true" className="public-static-page mb-6 overflow-hidden lg:mb-8">
          <div
            className={cn(
              'public-static-hero grid gap-4 bg-[linear-gradient(180deg,var(--surface-elevated)_0%,var(--surface-muted)_100%)] p-4 sm:p-6 lg:items-center lg:p-7',
              heroImageUrl ? 'lg:grid-cols-[0.94fr_1.06fr]' : 'public-static-hero--compact'
            )}
            style={{
              backgroundImage:
                'radial-gradient(circle at top left, rgba(255,255,255,0.94), transparent 32%), radial-gradient(circle at 88% 16%, color-mix(in srgb, var(--brand-primary) 8%, transparent), transparent 24%), linear-gradient(180deg, var(--surface-elevated) 0%, var(--surface-muted) 100%)'
            }}
          >
            <div className="public-static-hero-content rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[rgba(255,255,255,0.9)] p-5 shadow-[var(--public-shadow-card)] backdrop-blur sm:p-6">
              <PublicPageHeader
                title={displayTitle}
                description={displayDescription}
                eyebrowClassName={siteKey === 'passport' ? 'normal-case tracking-normal' : undefined}
              />
            </div>
            {heroImageUrl ? (
              <div className="overflow-hidden rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-2 shadow-[var(--public-shadow-card)] backdrop-blur">
                <PublicImage
                  src={heroImageUrl}
                  alt={brandizeSiteText(heroImageAlt || displayTitle, siteKey)}
                  wrapperClassName="aspect-[16/10] rounded-[1.5rem]"
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            ) : null}
            {!heroImageUrl ? <div className="public-static-hero-art" aria-hidden="true"><span /><span /><span /></div> : null}
          </div>
        </div>
        {children ?? (
          <Panel>
            <p className="leading-7 text-slate-700">{brandizeSiteText('Nội dung đang được đội vận hành cập nhật.', siteKey)}</p>
          </Panel>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
