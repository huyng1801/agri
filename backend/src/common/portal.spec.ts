import { RoleSlug } from '@prisma/client';
import { publicRegistrationRole, rolesAllowedInPortal } from './portal';

describe('auth portal policy', () => {
  it('keeps system, HTX, Agripassport and Passport roles in separate portals', () => {
    expect(rolesAllowedInPortal([RoleSlug.SUPER_ADMIN], 'ADMIN')).toBe(true);
    expect(rolesAllowedInPortal([RoleSlug.SUPER_ADMIN], 'HTX')).toBe(false);
    expect(rolesAllowedInPortal([RoleSlug.ADMIN_HTX], 'HTX')).toBe(true);
    expect(rolesAllowedInPortal([RoleSlug.ADMIN_HTX], 'ADMIN')).toBe(false);
    expect(rolesAllowedInPortal([RoleSlug.BUYER], 'AGRIPASSPORT')).toBe(true);
    expect(rolesAllowedInPortal([RoleSlug.BUYER], 'PASSPORT')).toBe(true);
  });

  it('only allows public buyer registration on the two public commerce portals', () => {
    expect(publicRegistrationRole('AGRIPASSPORT')).toBe(RoleSlug.BUYER);
    expect(publicRegistrationRole('PASSPORT')).toBe(RoleSlug.BUYER);
    expect(publicRegistrationRole('ADMIN')).toBeNull();
    expect(publicRegistrationRole('HTX')).toBeNull();
  });
});
