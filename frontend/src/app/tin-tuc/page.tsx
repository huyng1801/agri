import type { Metadata } from 'next';
import { AgripassportNewsPage, agripassportNewsConfig } from '@/sites/agripassport/news';
import { HtxonlineNewsPage, htxonlineNewsConfig } from '@/sites/htxonline/news';
import { PassportNewsPage, passportNewsConfig } from '@/sites/passport/news';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getRequestPublicSiteKey } from '@/lib/request-site';

type NewsPageProps = {
  searchParams?: Promise<{ search?: string; category?: string; page?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const effectiveSiteKey = siteKey === 'local' ? 'passport' : siteKey;
  const config = effectiveSiteKey === 'htxonline' ? htxonlineNewsConfig : effectiveSiteKey === 'passport' ? passportNewsConfig : agripassportNewsConfig;
  return buildPublicMetadata({
    title: config.title,
    description: config.description,
    path: '/tin-tuc',
    keywords: ['tin tức hợp tác xã', 'tin nông sản', 'chuyển đổi số hợp tác xã', 'QR truy xuất', 'dữ liệu sản phẩm'],
    openGraphTitle: config.title,
    openGraphDescription: config.description
  });
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const siteKey = await getRequestPublicSiteKey();
  if (siteKey === 'local') return <PassportNewsPage searchParams={searchParams} />;
  if (siteKey === 'htxonline') return <HtxonlineNewsPage searchParams={searchParams} />;
  if (siteKey === 'passport') return <PassportNewsPage searchParams={searchParams} />;
  return <AgripassportNewsPage searchParams={searchParams} />;
}
