import { NextRequest, NextResponse } from 'next/server';
import {
  isAliasPublicHost,
  marketplaceRedirectUrl,
  passportRedirectUrl,
  publicSiteKeyFromHost,
  siteAreaFromHost
} from './lib/domain';

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

const PASSPORT_PATHS = ['/passport', '/qr'];
const INTERNAL_MARKETPLACE_REDIRECT_PATHS = ['/san-pham', '/htx', '/gio-hang', '/thanh-toan', '/dat-hang-thanh-cong', '/tra-cuu-don-hang', '/tin-tuc'];

export function proxy(request: NextRequest) {
  const area = siteAreaFromHost(request.nextUrl.hostname);
  const siteKey = publicSiteKeyFromHost(request.nextUrl.hostname);
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  if (area === 'public' && isAliasPublicHost(request.nextUrl.hostname)) {
    return NextResponse.redirect(marketplaceRedirectUrl(pathname, search), 308);
  }

  if ((area === 'admin' || area === 'htx') && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (area === 'public' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((area === 'admin' || area === 'htx') && PUBLIC_MARKETPLACE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (PASSPORT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.redirect(passportRedirectUrl(pathname, search), 308);
    }
    return NextResponse.redirect(marketplaceRedirectUrl(pathname, search), 308);
  }

  if (area === 'public' && siteKey === 'htxonline' && INTERNAL_MARKETPLACE_REDIRECT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(marketplaceRedirectUrl(pathname, search), 308);
  }

  if (area === 'public' && siteKey === 'htxonline' && PASSPORT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(passportRedirectUrl(pathname, search), 308);
  }

  if (area === 'public' && siteKey === 'passport' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (area === 'public' && siteKey === 'passport' && ['/gio-hang', '/thanh-toan', '/dat-hang-thanh-cong', '/tra-cuu-don-hang', '/htx', '/san-pham', '/tin-tuc'].some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    if (PASSPORT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(marketplaceRedirectUrl(pathname, search), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)']
};
