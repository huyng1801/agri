import { PublicBottomNav } from './public-bottom-nav';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';
import { FloatingContactClient } from './public-site-support';
import { getRequestPublicSiteKey } from '@/lib/request-site';
import { defaultPublicSiteProfileForSite } from '@/lib/public-site';

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const siteKey = await getRequestPublicSiteKey();
  const profile = defaultPublicSiteProfileForSite(siteKey);

  return (
    <div id="top" className="mobile-app-scroll min-h-screen bg-transparent text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-leaf focus:shadow-md"
      >
        Bỏ qua đến nội dung chính
      </a>
      <PublicHeader appName={profile.appName} siteKey={siteKey} />
      {children}
      <FloatingContactClient siteKey={siteKey} />
      <PublicBottomNav siteKey={siteKey} />
      <PublicFooter siteKey={siteKey} />
    </div>
  );
}
