import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicShell } from '@/components/public-shell';
import { PublicLookupExperience } from '@/components/public-lookup-experience';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';
  return buildPublicMetadata({
    title: `Tra cứu Hộ chiếu cây - ${siteName}`,
    description: `Tra cứu mã cây để xem vùng sản xuất, giống cây, hình ảnh và dòng thời gian canh tác đã được công khai trên ${siteName}.`,
    path: '/cay',
    keywords: ['Hộ chiếu cây', 'tra cứu mã cây', 'vùng trồng', 'dòng thời gian canh tác']
  });
}

export default async function TreeLookupPage({ searchParams }: { searchParams?: Promise<{ code?: string }> }) {
  const code = (await searchParams)?.code?.trim();
  if (code) redirect(`/cay/${encodeURIComponent(code)}`);
  return <PublicShell><PublicLookupExperience kind="tree" /></PublicShell>;
}
