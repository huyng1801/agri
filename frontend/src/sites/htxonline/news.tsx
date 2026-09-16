import { SiteNewsPage, type SiteNewsConfig } from '@/sites/news/news-page';
import { generateSiteNewsMetadata, SiteNewsDetailPage } from '@/sites/news/news-detail-page';
import type { Metadata } from 'next';

export const htxonlineNewsConfig: SiteNewsConfig = {
  siteKey: 'htxonline',
  siteName: 'HTXONLINE',
  eyebrow: 'Bản tin HTXONLINE',
  title: 'Tin tức vận hành hợp tác xã',
  description: 'Bài viết riêng về quản trị HTX, số hóa vận hành, thành viên và luồng dữ liệu nội bộ.',
  cardDescription: 'Vận hành HTX, chuyển đổi số và dữ liệu nội bộ.'
};

export async function HtxonlineNewsPage({ searchParams }: { searchParams?: Promise<{ search?: string; category?: string; page?: string }> }) {
  return <SiteNewsPage searchParams={searchParams} config={htxonlineNewsConfig} />;
}

export async function generateHtxonlineNewsMetadata(slug: string): Promise<Metadata> {
  return generateSiteNewsMetadata(slug, htxonlineNewsConfig);
}

export async function HtxonlineNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <SiteNewsDetailPage params={params} config={htxonlineNewsConfig} />;
}
