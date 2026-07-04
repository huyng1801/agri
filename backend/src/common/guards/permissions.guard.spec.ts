import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

function contextWithPermissions(permissions: string[]) {
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
          roles: [],
          permissions
        }
      })
    })
  } as never;
}

describe('PermissionsGuard', () => {
  it('allows exact permission', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['products.create']) } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(guard.canActivate(contextWithPermissions(['products.create']))).toBe(true);
  });

  it('allows namespace wildcard permission', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['products.delete']) } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(guard.canActivate(contextWithPermissions(['products.*']))).toBe(true);
  });

  it('blocks the right role when its permission was removed', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['products.delete']) } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(() => guard.canActivate(contextWithPermissions(['products.read']))).toThrow(ForbiddenException);
  });
});
