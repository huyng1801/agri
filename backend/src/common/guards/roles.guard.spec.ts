import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleSlug } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function contextWithRoles(roles: RoleSlug[]) {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          id: 'user-id',
          email: 'user@example.com',
          fullName: 'User',
          cooperativeId: 'coop-id',
          roles,
          permissions: []
        }
      })
    })
  } as never;
}

describe('RolesGuard', () => {
  it('does not let Super Admin bypass HTX-only routes unless explicitly allowed', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RoleSlug.ADMIN_HTX])
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(contextWithRoles([RoleSlug.SUPER_ADMIN]))).toThrow(ForbiddenException);
  });

  it('allows Super Admin when the route explicitly includes Super Admin', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RoleSlug.SUPER_ADMIN])
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(contextWithRoles([RoleSlug.SUPER_ADMIN]))).toBe(true);
  });

  it('allows HTX roles on HTX routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX])
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(contextWithRoles([RoleSlug.MEMBER_HTX]))).toBe(true);
  });
});
