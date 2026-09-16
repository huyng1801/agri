import { RoleSlug } from '@prisma/client';

export const AUTH_PORTALS = ['ADMIN', 'HTX', 'AGRIPASSPORT', 'PASSPORT'] as const;
export type AuthPortal = (typeof AUTH_PORTALS)[number];

const PORTAL_ROLES: Record<AuthPortal, readonly RoleSlug[]> = {
  ADMIN: [RoleSlug.SUPER_ADMIN],
  HTX: [RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER],
  AGRIPASSPORT: [RoleSlug.BUYER, RoleSlug.ENTERPRISE, RoleSlug.AUTHORITY],
  PASSPORT: [RoleSlug.BUYER, RoleSlug.FARMER, RoleSlug.ENTERPRISE, RoleSlug.AUTHORITY]
};

export function isAuthPortal(value: unknown): value is AuthPortal {
  return typeof value === 'string' && (AUTH_PORTALS as readonly string[]).includes(value);
}

export function rolesAllowedInPortal(roles: readonly RoleSlug[], portal: AuthPortal) {
  return roles.some((role) => PORTAL_ROLES[portal].includes(role));
}

export function publicRegistrationRole(portal: AuthPortal) {
  if (portal === 'AGRIPASSPORT' || portal === 'PASSPORT') return RoleSlug.BUYER;
  return null;
}
