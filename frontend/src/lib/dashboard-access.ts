export type DashboardRole = 'SUPER_ADMIN' | 'ADMIN_HTX' | 'MEMBER_HTX' | 'FARMER' | 'BUYER';
export type DashboardArea = 'admin' | 'htx';

type RouteRule = {
  prefix: string;
  exact?: boolean;
  areas: DashboardArea[];
  roles: DashboardRole[];
};

const ROUTE_RULES: RouteRule[] = [
  { prefix: '/dashboard', exact: true, areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard', exact: true, areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'] },
  { prefix: '/dashboard/cooperatives', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/cooperatives', areas: ['htx'], roles: ['ADMIN_HTX'] },
  { prefix: '/dashboard/users', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/users', areas: ['htx'], roles: ['ADMIN_HTX'] },
  { prefix: '/dashboard/roles', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/subscription-plans', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/subscription-plans', areas: ['htx'], roles: ['ADMIN_HTX'] },
  { prefix: '/dashboard/invoices', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/invoices', areas: ['htx'], roles: ['ADMIN_HTX'] },
  { prefix: '/dashboard/news', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/orders', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/contacts', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/orders', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX'] },
  { prefix: '/dashboard/reports', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/reports', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX'] },
  { prefix: '/dashboard/audit-logs', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/backups', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/settings', areas: ['admin'], roles: ['SUPER_ADMIN'] },
  { prefix: '/dashboard/products', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'] },
  { prefix: '/dashboard/certifications', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX'] },
  { prefix: '/dashboard/zones', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'] },
  { prefix: '/dashboard/farmers', areas: ['htx'], roles: ['ADMIN_HTX'] },
  { prefix: '/dashboard/farming-logs', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'] },
  { prefix: '/dashboard/passports', areas: ['htx'], roles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'] }
];

export function dashboardAreaForRoles(roles: string[]): DashboardArea {
  return roles.includes('SUPER_ADMIN') ? 'admin' : 'htx';
}

export function isDashboardRouteAllowed(pathname: string, area: DashboardArea, roles: string[]) {
  const path = normalizePath(pathname);
  const rules = findRouteRules(path);
  if (!rules.length) return !path.startsWith('/dashboard');
  return rules.some((rule) => rule.areas.includes(area) && rule.roles.some((role) => roles.includes(role)));
}

function findRouteRules(pathname: string) {
  return ROUTE_RULES.filter((rule) => {
    if (rule.exact) return pathname === rule.prefix;
    return pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`);
  });
}

function normalizePath(pathname: string) {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed || '/';
}
