import { PublicBottomNav } from './public-bottom-nav';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';
import { FloatingContactClient } from './public-site-support';
import { getRequestPublicSiteKey } from '@/lib/request-site';
import { getPublicSiteProfile } from '@/lib/public-site';

export async function PublicShell({ children, hasQrQuery = false }: { children: React.ReactNode; hasQrQuery?: boolean }) {
  const siteKey = await getRequestPublicSiteKey();
  const profile = await getPublicSiteProfile(siteKey);

  return (
    <div id="top" data-public-site={siteKey} className="public-app-shell mobile-app-scroll min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--brand-primary)] focus:shadow-md"
      >
        Bỏ qua đến nội dung chính
      </a>
      <PublicHeader appName={profile.appName} siteKey={siteKey} hasQrQuery={hasQrQuery} />
      {children}
      <FloatingContactClient siteKey={siteKey} profile={profile} />
      <PublicBottomNav siteKey={siteKey} hasQrQuery={hasQrQuery} />
      <PublicFooter siteKey={siteKey} profile={profile} />
    </div>
  );
}
