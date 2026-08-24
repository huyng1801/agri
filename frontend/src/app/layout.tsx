import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/query-provider';
import { defaultPublicSiteProfileForSite } from '@/lib/public-site';
import { getRequestPublicOrigin, getRequestPublicSiteKey } from '@/lib/request-site';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap'
});

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const profile = defaultPublicSiteProfileForSite(siteKey);
  return {
    metadataBase: new URL(await getRequestPublicOrigin()),
    title: {
      default: profile.appName,
      template: `%s | ${profile.appName}`
    },
    description: profile.pageContent.homeDescription,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: '/logo.png',
      apple: '/logo.png'
    }
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2f7d4f'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={beVietnamPro.variable}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
