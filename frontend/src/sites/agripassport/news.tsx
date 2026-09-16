import { SiteNewsPage, type SiteNewsConfig } from '@/sites/news/news-page';
import { generateSiteNewsMetadata, SiteNewsDetailPage } from '@/sites/news/news-detail-page';
import type { Metadata } from 'next';

export const agripassportNewsConfig: SiteNewsConfig = {
  siteKey: 'agripassport',
  siteName: 'Agripassport',
  eyebrow: 'Tin tức Agripassport',
  title: 'Tin tức dữ liệu nông nghiệp',
  description: 'Bài viết riêng về sản phẩm, truy xuất, thị trường và chuẩn hóa dữ liệu nông nghiệp trên Agripassport.',
  cardDescription: 'Kiến thức, thị trường và dữ liệu sản phẩm Agripassport.'
};

export async function AgripassportNewsPage({ searchParams }: { searchParams?: Promise<{ search?: string; category?: string; page?: string }> }) {
  return <SiteNewsPage searchParams={searchParams} config={agripassportNewsConfig} />;
}

export async function generateAgripassportNewsMetadata(slug: string): Promise<Metadata> {
  return generateSiteNewsMetadata(slug, agripassportNewsConfig);
}

export async function AgripassportNewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <SiteNewsDetailPage params={params} config={agripassportNewsConfig} />;
}
