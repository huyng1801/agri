import type { MetadataRoute } from 'next';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';

const baseUrl = 'https://htxonline.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, news] = await Promise.all([fetchPublicCatalog(200), fetchPublicNews('/news/public?limit=200')]);

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/san-pham',
    '/htx',
    '/tin-tuc',
    '/ve-chung-toi',
    '/gioi-thieu',
    '/huong-dan-mua-hang',
    '/thanh-toan',
    '/tra-cuu-don-hang',
    '/lien-he',
    '/dieu-khoan-su-dung',
    '/chinh-sach-bao-mat',
    '/chinh-sach-doi-tra',
    '/chinh-sach-van-hanh'
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7
  }));

  const productPages: MetadataRoute.Sitemap = catalog.products.map((product) => ({
    url: `${baseUrl}/san-pham/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }));

  const cooperativePages: MetadataRoute.Sitemap = catalog.cooperatives.map((cooperative) => ({
    url: `${baseUrl}/htx/${cooperative.code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75
  }));

  const newsPages: MetadataRoute.Sitemap = news.data.map((article) => ({
    url: `${baseUrl}/tin-tuc/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt || article.createdAt || Date.now()),
    changeFrequency: 'monthly',
    priority: article.isFeatured ? 0.85 : 0.72
  }));

  return [...staticPages, ...productPages, ...cooperativePages, ...newsPages];
}
