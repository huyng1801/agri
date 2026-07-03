import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/query-provider';

export const metadata: Metadata = {
  title: 'Agri Passport',
  description: 'SaaS quản lý HTX, sản phẩm và QR truy xuất nguồn gốc',
  manifest: '/manifest.webmanifest'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2f7d4f'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
