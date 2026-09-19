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

  it('rejects assigning zones that are not active in the farmer cooperative before creating the account', async () => {
    const tx = {
      zone: { findMany: jest.fn().mockResolvedValue([]) },
      user: { create: jest.fn() }
    };
    const service = new UsersService(
      {
        user: { findUnique: jest.fn().mockResolvedValue(null) },
        role: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'farmer-role' }) },
        $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx))
      } as never,
      { record: jest.fn() } as never,
      { assertCanCreate: jest.fn() } as never
    );

    await expect(service.create({
      id: 'admin-1',
      email: 'admin@coop.test',
      fullName: 'Admin HTX',
      cooperativeId: 'coop-1',
      roles: [RoleSlug.ADMIN_HTX],
      permissions: []
    }, {
      email: 'farmer@coop.test',
      password: 'StrongPass123!',
      fullName: 'Nông dân',
      role: RoleSlug.FARMER,
      assignedZoneIds: ['zone-1']
    })).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.zone.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: { in: ['zone-1'] }, cooperativeId: 'coop-1', status: 'ACTIVE' })
    }));
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it('saves a farmer zone assignment in the same transaction and returns its aggregate', async () => {
    const now = new Date('2026-09-01T00:00:00.000Z');
    const createdFarmer = {
      id: 'farmer-1',
      email: 'farmer@coop.test',
      fullName: 'Nông dân',
      phone: null,
      avatarUrl: null,
      status: 'ACTIVE',
      cooperativeId: 'coop-1',
      cooperative: { id: 'coop-1', name: 'HTX Demo', code: 'HTX-DEMO' },
      roles: [{ role: { slug: RoleSlug.FARMER, permissions: [] } }],
      farmerProfile: { cooperativeId: 'coop-1', zoneAssignments: [{ zoneId: 'zone-1' }] },
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    };
    const tx = {
      zone: { findMany: jest.fn().mockResolvedValue([{ id: 'zone-1' }]) },
      user: {
        create: jest.fn().mockResolvedValue({ id: 'farmer-1', cooperativeId: 'coop-1' }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(createdFarmer)
      },
      cooperativeMember: { upsert: jest.fn() },
      farmerProfile: { upsert: jest.fn().mockResolvedValue({ id: 'profile-1' }) },
      farmerZoneAssignment: { createMany: jest.fn() }
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      role: { findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'farmer-role' }) },
      zone: { findMany: jest.fn().mockResolvedValue([{ id: 'zone-1', areaM2: '10000' }]) },
      tree: {
        groupBy: jest.fn().mockResolvedValue([{
          zoneId: 'zone-1',
          cropTypeId: 'crop-1',
          variety: 'Cát Chu',
          status: 'ACTIVE',
          _count: { _all: 2 }
        }])
      },
      cropType: { findMany: jest.fn().mockResolvedValue([{ id: 'crop-1', name: 'Xoài' }]) },
      certification: { findMany: jest.fn().mockResolvedValue([]) },
      $queryRaw: jest.fn().mockResolvedValue([{
        zoneId: 'zone-1',
        seasonId: 'season-1',
        seasonName: 'Vụ 2026',
        seasonStartDate: new Date('2026-01-01T00:00:00.000Z'),
        unit: 'tấn',
        quantity: 1.25,
        harvestCount: 2
      }]),
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx))
    };
    const service = new UsersService(prisma as never, { record: jest.fn() } as never, { assertCanCreate: jest.fn() } as never);

    const result = await service.create({
      id: 'admin-1',
      email: 'admin@coop.test',
      fullName: 'Admin HTX',
      cooperativeId: 'coop-1',
      roles: [RoleSlug.ADMIN_HTX],
      permissions: []
    }, {
      email: 'farmer@coop.test',
      password: 'StrongPass123!',
      fullName: 'Nông dân',
      role: RoleSlug.FARMER,
      assignedZoneIds: ['zone-1']
    });

    expect(tx.farmerZoneAssignment.createMany).toHaveBeenCalledWith({
      data: [{ farmerProfileId: 'profile-1', zoneId: 'zone-1' }]
    });
    expect(result.farmerProfile?.assignedZoneIds).toEqual(['zone-1']);
    expect(result.farmerSummary).toMatchObject({
      assignedZoneCount: 1,
      areaM2: 10000,
      treeCount: 2,
      varieties: [{ cropTypeName: 'Xoài', variety: 'Cát Chu', treeCount: 2 }],
      seasonalProduction: [{ seasonId: 'season-1', recordedMassKg: 1250, harvestCount: 2 }]
    });
  });

  it('builds a personal QR from public farmer data only and excludes private or non-public zones', async () => {
    const farmer = {
      id: 'farmer-public',
      email: 'private@example.test',
      fullName: 'Nông dân công khai',
      phone: '0900000000',
      avatarUrl: null,
      status: 'ACTIVE',
      cooperativeId: 'coop-1',
      cooperative: { id: 'coop-1', name: 'HTX Công khai', code: 'HTX-1', status: 'ACTIVE' },
      roles: [{ role: { slug: RoleSlug.FARMER, permissions: [] } }],
      farmerProfile: {
        id: 'profile-1',
        cooperativeId: 'coop-1',
        status: 'ACTIVE',
        zoneAssignments: [{ zoneId: 'public-zone' }, { zoneId: 'private-zone' }]
      },
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(farmer) },
      zone: { findMany: jest.fn().mockResolvedValue([{ id: 'public-zone', areaM2: '12500' }]) },
      tree: {
        groupBy: jest.fn().mockResolvedValue([{
          zoneId: 'public-zone',
          cropTypeId: 'crop-1',
          variety: 'Cát Chu',
          status: 'ACTIVE',
          _count: { _all: 7 }
        }])
      },
      cropType: { findMany: jest.fn().mockResolvedValue([{ id: 'crop-1', name: 'Xoài' }]) },
      certification: {
        findMany: jest.fn().mockResolvedValue([{
          id: 'cert-public-1',
          zoneId: 'public-zone',
          name: 'VietGAP',
          issuer: 'Tổ chức chứng nhận',
          issuedAt: new Date('2026-02-01T00:00:00.000Z'),
          expiresAt: new Date('2027-02-01T00:00:00.000Z'),
          isPublic: true,
          zone: { name: 'Vườn công khai' }
        }])
      },
      $queryRaw: jest.fn().mockResolvedValue([{
        zoneId: 'public-zone',
        seasonId: 'season-1',
        seasonName: 'Vụ 2026',
        seasonStartDate: new Date('2026-01-01T00:00:00.000Z'),
        unit: 'kg',
        quantity: 2000,
        harvestCount: 2
      }])
    };
    const service = new UsersService(prisma as never, { record: jest.fn() } as never, { assertCanCreate: jest.fn() } as never);

    const result = await service.publicFarmer(farmer.id);

    expect(result.publicUrl).toContain('/nong-ho/farmer-public');
    expect(result.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.farmer).toEqual({
      fullName: 'Nông dân công khai',
      cooperative: { name: 'HTX Công khai', code: 'HTX-1' },
      summary: expect.objectContaining({
        assignedZoneCount: 1,
        areaM2: 12500,
        treeCount: 7,
        varieties: [{ cropTypeName: 'Xoài', variety: 'Cát Chu', treeCount: 7 }],
        certifications: [expect.objectContaining({ id: 'cert-public-1', name: 'VietGAP', zoneName: 'Vườn công khai', isPublic: true })],
        seasonalProduction: [expect.objectContaining({ recordedMassKg: 2000, harvestCount: 2 })]
      })
    });
    expect(result.farmer).not.toHaveProperty('email');
    expect(result.farmer).not.toHaveProperty('phone');
    expect(prisma.zone.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ status: 'ACTIVE', isPublic: true })
    }));
    expect(prisma.tree.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ publicVerified: true })
    }));
  });

  it('does not expose inactive farmer profiles through the personal QR endpoint', async () => {
    const service = new UsersService(
      { user: { findUnique: jest.fn().mockResolvedValue({ status: 'LOCKED', roles: [], cooperative: null, farmerProfile: null }) } } as never,
      { record: jest.fn() } as never,
      { assertCanCreate: jest.fn() } as never
    );

    await expect(service.publicFarmer('inactive-farmer')).rejects.toThrow('Không tìm thấy hồ sơ nông hộ đang hoạt động');
  });

  it('still gives an active farmer without a profile record a QR without production figures', async () => {
    const service = new UsersService(
      {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'farmer-without-profile',
            fullName: 'Nông dân mới',
            status: 'ACTIVE',
            cooperativeId: 'coop-1',
            cooperative: { name: 'HTX Công khai', code: 'HTX-1', status: 'ACTIVE' },
            roles: [{ role: { slug: RoleSlug.FARMER, permissions: [] } }],
            farmerProfile: null
          })
        }
      } as never,
      { record: jest.fn() } as never,
      { assertCanCreate: jest.fn() } as never
    );

    const result = await service.publicFarmer('farmer-without-profile');

    expect(result.publicUrl).toContain('/nong-ho/farmer-without-profile');
    expect(result.farmer.summary).toBeNull();
    expect(result.qrDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('revokes a farmer zone scope when the farmer role is removed', async () => {
    const existing = {
      id: 'farmer-1',
      email: 'farmer@coop.test',
      fullName: 'Nông dân',
      phone: null,
      avatarUrl: null,
      status: 'ACTIVE',
      cooperativeId: 'coop-1',
      cooperative: { id: 'coop-1', name: 'HTX Demo', code: 'HTX-DEMO' },
      roles: [{ role: { slug: RoleSlug.FARMER, permissions: [] } }],
      farmerProfile: { id: 'profile-1', cooperativeId: 'coop-1', zoneAssignments: [{ zoneId: 'zone-1' }] },
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updated = {
      ...existing,
      roles: [{ role: { slug: RoleSlug.MEMBER_HTX, permissions: [] } }],
      farmerProfile: { id: 'profile-1', cooperativeId: 'coop-1', zoneAssignments: [] }
    };
    const tx = {
      user: {
        update: jest.fn().mockResolvedValue({ id: 'farmer-1', cooperativeId: 'coop-1' }),
        findUniqueOrThrow: jest.fn().mockResolvedValue(updated)
      },
      role: { findMany: jest.fn().mockResolvedValue([{ id: 'member-role' }]) },
      userRole: { deleteMany: jest.fn(), createMany: jest.fn() },
      farmerZoneAssignment: { deleteMany: jest.fn() }
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(existing) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx))
    };
    const service = new UsersService(prisma as never, { record: jest.fn() } as never, { assertCanCreate: jest.fn() } as never);

    const result = await service.update({
      id: 'admin-1',
      email: 'admin@coop.test',
      fullName: 'Admin HTX',
      cooperativeId: 'coop-1',
      roles: [RoleSlug.ADMIN_HTX],
      permissions: []
    }, 'farmer-1', { roles: [RoleSlug.MEMBER_HTX] });

    expect(tx.farmerZoneAssignment.deleteMany).toHaveBeenCalledWith({ where: { farmerProfileId: 'profile-1' } });
    expect(result.roles).toEqual([RoleSlug.MEMBER_HTX]);
    expect(result.farmerProfile?.assignedZoneIds).toEqual([]);
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
