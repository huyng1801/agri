import { BadRequestException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const superAdmin = {
    id: 'super-1',
    email: 'admin@agri.test',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['users.create', 'users.delete']
  };

  it('requires a cooperative when Super Admin creates an HTX-scoped account', async () => {
    const service = new UsersService(
      {
        user: {
          findUnique: jest.fn().mockResolvedValue(null)
        }
      } as never,
      { record: jest.fn() } as never,
      { assertCanCreate: jest.fn() } as never
    );

    await expect(
      service.create(superAdmin, {
        email: 'admin-htx@example.com',
        password: 'StrongPass123!',
        fullName: 'Admin HTX',
        role: RoleSlug.ADMIN_HTX
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not allow a user to disable their own active account', async () => {
    const service = new UsersService(
      {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: superAdmin.id,
            email: superAdmin.email,
            fullName: superAdmin.fullName,
            phone: null,
            avatarUrl: null,
            status: 'ACTIVE',
            cooperativeId: null,
            cooperative: null,
            roles: [{ role: { slug: RoleSlug.SUPER_ADMIN, permissions: ['users.delete'] } }],
            lastLoginAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      } as never,
      { record: jest.fn() } as never,
      { assertCanCreate: jest.fn() } as never
    );

    await expect(service.remove(superAdmin, superAdmin.id)).rejects.toBeInstanceOf(BadRequestException);
  });
});
