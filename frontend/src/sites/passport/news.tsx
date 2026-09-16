import { SiteNewsPage, type SiteNewsConfig } from '@/sites/news/news-page';
import { generateSiteNewsMetadata, SiteNewsDetailPage } from '@/sites/news/news-detail-page';
import type { Metadata } from 'next';

export const passportNewsConfig: SiteNewsConfig = {
  siteKey: 'passport',
  siteName: 'Hộ chiếu nông nghiệp',
  eyebrow: 'Tin tức Hộ chiếu nông nghiệp',
  title: 'Tin tức truy xuất & hồ sơ số',
  description: 'Bài viết riêng về định danh tận cây, hồ sơ số, QR truy xuất và minh bạch nguồn gốc nông sản.',
  cardDescription: 'Truy xuất, hồ sơ số và dữ liệu nguồn gốc Hộ chiếu nông nghiệp.'
};

export async function PassportNewsPage({ searchParams }: { searchParams?: Promise<{ search?: string; category?: string; page?: string }> }) {
  return <SiteNewsPage searchParams={searchParams} config={passportNewsConfig} />;
}

export async function generatePassportNewsMetadata(slug: string): Promise<Metadata> {
  return generateSiteNewsMetadata(slug, passportNewsConfig);
}

export async function PassportNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <SiteNewsDetailPage params={params} config={passportNewsConfig} />;
}
