export type SiteArea = 'public' | 'admin' | 'htx' | 'local';
export type PublicSiteKey = 'htxonline' | 'agripassport' | 'passport' | 'local';

export const HTXONLINE_HOST = 'htxonline.vn';
export const HTXONLINE_WWW_HOST = 'www.htxonline.vn';
export const ADMIN_HOST = 'admin.htxonline.vn';
export const HTX_HOST = 'htx.htxonline.vn';
export const MARKETPLACE_HOST = 'agripassport.com';
export const MARKETPLACE_WWW_HOST = 'www.agripassport.com';
export const PASSPORT_HOST = 'hochieunongnghiep.com';
export const PASSPORT_WWW_HOST = 'www.hochieunongnghiep.com';
export const MARKETPLACE_ALIAS_HOST = 'ketnoinongnghiep.vn';
export const MARKETPLACE_ALIAS_WWW_HOST = 'www.ketnoinongnghiep.vn';

const HTXONLINE_HOSTS = new Set([HTXONLINE_HOST, HTXONLINE_WWW_HOST]);
const MARKETPLACE_HOSTS = new Set([MARKETPLACE_HOST, MARKETPLACE_WWW_HOST, MARKETPLACE_ALIAS_HOST, MARKETPLACE_ALIAS_WWW_HOST]);
const PASSPORT_HOSTS = new Set([PASSPORT_HOST, PASSPORT_WWW_HOST]);
const PUBLIC_HOSTS = new Set([...HTXONLINE_HOSTS, ...MARKETPLACE_HOSTS, ...PASSPORT_HOSTS]);
const MARKETPLACE_ALIAS_HOSTS = new Set([MARKETPLACE_ALIAS_HOST, MARKETPLACE_ALIAS_WWW_HOST]);

export const HTXONLINE_ORIGIN = `https://${HTXONLINE_HOST}`;
export const MARKETPLACE_ORIGIN = `https://${MARKETPLACE_HOST}`;
export const PASSPORT_ORIGIN = `https://${PASSPORT_HOST}`;

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export function normalizeHostname(hostname: string) {
  return hostname.split(':')[0]?.trim().toLowerCase() ?? '';
}

export function publicSiteKeyFromHost(hostname: string): PublicSiteKey {
  const host = normalizeHostname(hostname);
  if (HTXONLINE_HOSTS.has(host)) return 'htxonline';
  if (MARKETPLACE_HOSTS.has(host)) return 'agripassport';
  if (PASSPORT_HOSTS.has(host)) return 'passport';
  return 'local';
}

export function primaryHostForPublicSite(siteKey: PublicSiteKey) {
  if (siteKey === 'htxonline') return HTXONLINE_HOST;
  if (siteKey === 'passport') return PASSPORT_HOST;
  return MARKETPLACE_HOST;
}

export function publicOriginForSite(siteKey: PublicSiteKey) {
  if (siteKey === 'htxonline') return HTXONLINE_ORIGIN;
  if (siteKey === 'passport') return PASSPORT_ORIGIN;
  return MARKETPLACE_ORIGIN;
}

export function publicOriginFromHost(hostname: string) {
  return publicOriginForSite(publicSiteKeyFromHost(hostname));
}

export function isAliasPublicHost(hostname: string) {
  return MARKETPLACE_ALIAS_HOSTS.has(normalizeHostname(hostname));
}

export function siteAreaFromHost(hostname: string): SiteArea {
  const host = normalizeHostname(hostname);
  if (host === ADMIN_HOST) return 'admin';
  if (host === HTX_HOST) return 'htx';
  if (PUBLIC_HOSTS.has(host)) return 'public';
  return 'local';
}

export function dashboardUrlForRoles(roles: string[], currentOrigin?: string) {
  const origin = currentOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const area = origin ? siteAreaFromHost(new URL(origin).hostname) : 'local';
  if (area === 'local') return '/dashboard';
  if (roles.includes('SUPER_ADMIN')) return `https://${ADMIN_HOST}/dashboard`;
  if (roles.some((role) => ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'].includes(role))) return `https://${HTX_HOST}/dashboard`;
  return MARKETPLACE_ORIGIN;
}

export function loginUrlForArea(area: SiteArea) {
  if (area === 'admin') return `https://${ADMIN_HOST}/login`;
  if (area === 'htx') return `https://${HTX_HOST}/login`;
  return '/login';
}

export function htxonlineUrl(path = '/') {
  return `${HTXONLINE_ORIGIN}${normalizePath(path)}`;
}

export function marketplaceUrl(path = '/') {
  return `${MARKETPLACE_ORIGIN}${normalizePath(path)}`;
}

export function passportUrl(path = '/') {
  return `${PASSPORT_ORIGIN}${normalizePath(path)}`;
}

export function publicUrl(path = '/', hostname?: string) {
  if (!hostname) return marketplaceUrl(path);
  return `${publicOriginFromHost(hostname)}${normalizePath(path)}`;
}

export function marketplaceRedirectUrl(path = '/', search = '') {
  return `${marketplaceUrl(path)}${search}`;
}

export function passportRedirectUrl(path = '/', search = '') {
  return `${passportUrl(path)}${search}`;
}

export function normalizedPublicOrigin(hostname: string) {
  return publicOriginForSite(publicSiteKeyFromHost(hostname));
}

export function isRoleAllowedInArea(roles: string[], area: SiteArea) {
  if (area === 'local') return true;
  if (area === 'admin') return roles.includes('SUPER_ADMIN');
  if (area === 'htx') return roles.some((role) => ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'].includes(role));
  return false;
}
