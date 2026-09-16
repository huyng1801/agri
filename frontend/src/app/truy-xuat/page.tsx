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
    title: `Tra cứu mã QR nông sản - ${siteName}`,
    description: `Tra cứu hồ sơ số, vùng trồng, nhật ký canh tác và lịch sử thu hoạch bằng mã QR trên ${siteName}.`,
    path: '/truy-xuat',
    keywords: ['tra cứu mã QR nông sản', 'truy xuất nguồn gốc', 'hộ chiếu nông nghiệp', 'hồ sơ nông sản số']
  });
}

export default async function ProductLookupPage({ searchParams }: { searchParams?: Promise<{ code?: string }> }) {
  const code = (await searchParams)?.code?.trim();
  if (code) redirect(`/truy-xuat/${encodeURIComponent(code)}`);
  return <PublicShell><PublicLookupExperience kind="product" /></PublicShell>;
}
