import { NextRequest, NextResponse } from 'next/server';
import {
  isAliasPublicHost,
  marketplaceRedirectUrl,
  normalizeHostname,
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
const INTERNAL_COMMERCE_REDIRECT_PATHS = ['/gio-hang', '/thanh-toan', '/dat-hang-thanh-cong', '/tra-cuu-don-hang'];
const PASSPORT_COMMERCE_REDIRECT_PATHS = ['/gio-hang', '/thanh-toan', '/dat-hang-thanh-cong', '/tra-cuu-don-hang'];

export function proxy(request: NextRequest) {
  const hostname = normalizeHostname(request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.hostname);
  const area = siteAreaFromHost(hostname);
  const siteKey = publicSiteKeyFromHost(hostname);
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  if (area === 'public' && isAliasPublicHost(hostname)) {
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

  if (area === 'public' && siteKey === 'htxonline' && INTERNAL_COMMERCE_REDIRECT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(marketplaceRedirectUrl(pathname, search), 308);
  }

  if (area === 'public' && siteKey === 'htxonline' && PASSPORT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(passportRedirectUrl(pathname, search), 308);
  }

  if (area === 'public' && siteKey === 'passport' && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (area === 'public' && siteKey === 'passport' && PASSPORT_COMMERCE_REDIRECT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.redirect(marketplaceRedirectUrl(pathname, search), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)']
};
