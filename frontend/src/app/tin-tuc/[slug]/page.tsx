import type { Metadata } from 'next';
import { AgripassportNewsDetailPage, generateAgripassportNewsMetadata } from '@/sites/agripassport/news';
import { HtxonlineNewsDetailPage, generateHtxonlineNewsMetadata } from '@/sites/htxonline/news';
import { PassportNewsDetailPage, generatePassportNewsMetadata } from '@/sites/passport/news';
import { getRequestPublicSiteKey } from '@/lib/request-site';

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteKey = await getRequestPublicSiteKey();
  if (siteKey === 'local') return generatePassportNewsMetadata(slug);
  if (siteKey === 'htxonline') return generateHtxonlineNewsMetadata(slug);
  if (siteKey === 'passport') return generatePassportNewsMetadata(slug);
  return generateAgripassportNewsMetadata(slug);
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const siteKey = await getRequestPublicSiteKey();
  if (siteKey === 'local') return <PassportNewsDetailPage params={params} />;
  if (siteKey === 'htxonline') return <HtxonlineNewsDetailPage params={params} />;
  if (siteKey === 'passport') return <PassportNewsDetailPage params={params} />;
  return <AgripassportNewsDetailPage params={params} />;
}
