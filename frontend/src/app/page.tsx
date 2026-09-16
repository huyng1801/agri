import type { Metadata } from 'next';
import { AgripassportHome } from '@/sites/agripassport/home';
import { HtxonlineHome } from '@/sites/htxonline/home';
import { PassportHome } from '@/sites/passport/home';
import { defaultPublicSiteProfileForSite } from '@/lib/public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const effectiveSiteKey = siteKey === 'local' ? 'passport' : siteKey;
  const profile = defaultPublicSiteProfileForSite(effectiveSiteKey);
  const canonical = await getRequestAbsoluteUrl('/');
  const title =
    effectiveSiteKey === 'htxonline'
      ? 'HTXONLINE — Hệ thống quản trị nội bộ cho hợp tác xã'
      : effectiveSiteKey === 'passport'
        ? 'Hộ chiếu nông nghiệp — Định danh tận cây, truy xuất tận nguồn'
        : 'AGRIPASSPORT — Nền tảng dữ liệu nông sản minh bạch';

  return {
    title,
    description: profile.pageContent.homeDescription,
    alternates: { canonical },
    openGraph: {
      title,
      description: profile.pageContent.homeDescription,
      url: canonical,
      siteName: profile.appName,
      locale: 'vi_VN',
      type: 'website'
    }
  };
}

export default async function HomePage() {
  const siteKey = await getRequestPublicSiteKey();

  if (siteKey === 'htxonline') return <HtxonlineHome />;
  if (siteKey === 'passport' || siteKey === 'local') return <PassportHome />;
  return <AgripassportHome />;
}
