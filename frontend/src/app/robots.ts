import type { MetadataRoute } from 'next';
import { getRequestPublicOrigin } from '@/lib/request-site';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getRequestPublicOrigin();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/auth/']
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
