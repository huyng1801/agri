import { ForbiddenException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { AuthUser } from '../types';
import { requireTenant, tenantWhere } from './tenant';

const admin: AuthUser = {
  id: 'u1',
  email: 'admin@example.com',
  fullName: 'Admin',
  cooperativeId: 'coop-a',
  roles: [RoleSlug.ADMIN_HTX],
  permissions: []
};

describe('tenant utilities', () => {
  it('scopes non-super users to their cooperative', () => {
    expect(tenantWhere(admin)).toEqual({ cooperativeId: 'coop-a' });
  });

  it('blocks cross-tenant access', () => {
    expect(() => requireTenant(admin, 'coop-b')).toThrow(ForbiddenException);
  });

  it('allows super admin to request any tenant', () => {
    expect(requireTenant({ ...admin, roles: [RoleSlug.SUPER_ADMIN] }, 'coop-b')).toBe('coop-b');
  });
});
