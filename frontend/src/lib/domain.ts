export type SiteArea = 'public' | 'admin' | 'htx' | 'local';

const PUBLIC_HOST = 'htxonline.vn';
const ADMIN_HOST = 'admin.htxonline.vn';
const HTX_HOST = 'htx.htxonline.vn';

export function siteAreaFromHost(hostname: string): SiteArea {
  const host = hostname.split(':')[0]?.toLowerCase() ?? '';
  if (host === ADMIN_HOST) return 'admin';
  if (host === HTX_HOST) return 'htx';
  if (host === PUBLIC_HOST || host === `www.${PUBLIC_HOST}`) return 'public';
  return 'local';
}

export function dashboardUrlForRoles(roles: string[], currentOrigin?: string) {
  const origin = currentOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const area = origin ? siteAreaFromHost(new URL(origin).hostname) : 'local';
  if (area === 'local') return '/dashboard';
  if (roles.includes('SUPER_ADMIN')) return `https://${ADMIN_HOST}/dashboard`;
  if (roles.some((role) => ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'].includes(role))) return `https://${HTX_HOST}/dashboard`;
  return `https://${PUBLIC_HOST}/`;
}

export function loginUrlForArea(area: SiteArea) {
  if (area === 'admin') return `https://${ADMIN_HOST}/login`;
  if (area === 'htx') return `https://${HTX_HOST}/login`;
  return '/login';
}

export function publicUrl(path = '/') {
  return `https://${PUBLIC_HOST}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isRoleAllowedInArea(roles: string[], area: SiteArea) {
  if (area === 'local') return true;
  if (area === 'admin') return roles.includes('SUPER_ADMIN');
  if (area === 'htx') return roles.some((role) => ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'].includes(role));
  return false;
}
