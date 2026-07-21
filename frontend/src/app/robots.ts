import type { MetadataRoute } from 'next';

const baseUrl = 'https://htxonline.vn';

export default function robots(): MetadataRoute.Robots {
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
