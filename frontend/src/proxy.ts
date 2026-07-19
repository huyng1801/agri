import { NextRequest, NextResponse } from 'next/server';
import { siteAreaFromHost, publicUrl } from './lib/domain';

const PUBLIC_MARKETPLACE_PATHS = [
  '/htx',
  '/san-pham',
  '/passport',
  '/qr',
  '/tin-tuc',
  '/gio-hang',
  '/thanh-toan',
  '/dat-hang-thanh-cong',
  '/tra-cuu-don-hang',
  '/lien-he',
  '/gioi-thieu',
  '/chinh-sach-bao-mat',
  '/dieu-khoan-su-dung',
  '/chinh-sach-doi-tra',
  '/chinh-sach-van-hanh',
  '/chinh-sach-van-chuyen',
  '/huong-dan-mua-hang'
];

export function proxy(request: NextRequest) {
  const area = siteAreaFromHost(request.nextUrl.hostname);
  const pathname = request.nextUrl.pathname;

  if ((area === 'admin' || area === 'htx') && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (area === 'public' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((area === 'admin' || area === 'htx') && PUBLIC_MARKETPLACE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(publicUrl(pathname));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)']
};
