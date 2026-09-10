import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProductBatchStatus, RoleSlug, TraceabilityCodeStatus, TraceabilityCodeType, TreeEventType, TreeStatus } from '@prisma/client';
import { PlantTraceabilityService } from './plant-traceability.service';

const admin = {
  id: 'user-1',
  email: 'admin@coop.test',
  fullName: 'Admin HTX',
  cooperativeId: 'coop-1',
  roles: [RoleSlug.ADMIN_HTX],
  permissions: []
};

const farmer = {
  id: 'farmer-1',
  email: 'farmer@coop.test',
  fullName: 'Nông hộ',
  cooperativeId: 'coop-1',
  roles: [RoleSlug.FARMER],
  permissions: []
};

describe('PlantTraceabilityService', () => {
  it('generates a readable immutable-style tree code from crop and zone', async () => {
    const prisma = {
      zone: { findUnique: jest.fn().mockResolvedValue({ id: 'zone-1', cooperativeId: 'coop-1', code: 'VLM-01' }) },
      cropType: { findUnique: jest.fn().mockResolvedValue({ id: 'crop-1', code: 'XOI', name: 'Xoài', isActive: true }) },
      tree: {
        findFirst: jest.fn().mockResolvedValue({ treeCode: 'XOI-VLM-01-000004' }),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'tree-1', treeCode: 'XOI-VLM-01-000005' })
      },
      auditLog: { create: jest.fn() }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    const created = await service.createTree(admin, { zoneId: 'zone-1', cropTypeId: 'crop-1' });

    expect(prisma.tree.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ treeCode: 'XOI-VLM-01-000005' }) }));
    expect(created.treeCode).toBe('XOI-VLM-01-000005');
  });

  it('blocks a tree read from another cooperative', async () => {
    const prisma = {
      tree: { findUnique: jest.fn().mockResolvedValue({ id: 'tree-2', cooperativeId: 'coop-2', zoneId: 'zone-2', zone: {}, cropType: {} }) },
      farmerProfile: { findUnique: jest.fn() }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.getTree(admin, 'tree-2')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns no tree rows for a farmer with no assigned zones', async () => {
    const prisma = {
      farmerProfile: { findUnique: jest.fn().mockResolvedValue({ assignedZones: [] }) },
      tree: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await service.listTrees(farmer, {});

    expect(prisma.tree.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ zoneId: { in: [] } }) }));
    expect(prisma.tree.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ zoneId: { in: [] } }) }));
  });

  it('blocks a farmer from a tree outside assigned zones', async () => {
    const prisma = {
      farmerProfile: { findUnique: jest.fn().mockResolvedValue({ assignedZones: ['zone-1'] }) },
      tree: { findUnique: jest.fn().mockResolvedValue({ id: 'tree-2', cooperativeId: 'coop-1', zoneId: 'zone-2', zone: {}, cropType: {} }) }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.getTree(farmer, 'tree-2')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks a farmer from updating an event outside assigned zones', async () => {
    const prisma = {
      farmerProfile: { findUnique: jest.fn().mockResolvedValue({ assignedZones: ['zone-1'] }) },
      treeEvent: { findUnique: jest.fn().mockResolvedValue({ id: 'event-2', cooperativeId: 'coop-1', tree: { zoneId: 'zone-2' } }) }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.updateTreeEvent(farmer, 'event-2', { eventDate: new Date('2026-01-01'), eventType: TreeEventType.WATERING, description: 'Tưới' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects changing a tree code after it has been issued', async () => {
    const prisma = {
      tree: { findUnique: jest.fn().mockResolvedValue({ id: 'tree-1', cooperativeId: 'coop-1', zoneId: 'zone-1', treeCode: 'XOI-VLM-01-000001', zone: {}, cropType: {} }) },
      farmerProfile: { findUnique: jest.fn() }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.updateTree(admin, 'tree-1', { treeCode: 'XOI-VLM-01-000002' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects allocating more than the harvest quantity', async () => {
    const prisma = {
      lot: { findUnique: jest.fn().mockResolvedValue({ id: 'lot-1', cooperativeId: 'coop-1', unit: 'kg', lotTrees: [], productBatches: [] }) },
      harvest: { findUnique: jest.fn().mockResolvedValue({ id: 'harvest-1', cooperativeId: 'coop-1', treeId: 'tree-1', quantity: 100, unit: 'kg', tree: { zoneId: 'zone-1', cropTypeId: 'crop-1' } }) },
      lotTree: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 80 } }) }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.allocateLotTree(admin, 'lot-1', { harvestId: 'harvest-1', quantity: 21, unit: 'kg' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('translates a database unique violation into a safe duplicate-code response', async () => {
    const prisma = {
      zone: { findUnique: jest.fn().mockResolvedValue({ id: 'zone-1', cooperativeId: 'coop-1', code: 'VLM-01' }) },
      cropType: { findUnique: jest.fn().mockResolvedValue({ id: 'crop-1', code: 'XOI', name: 'Xoài', isActive: true }) },
      tree: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockRejectedValue({ code: 'P2002' })
      },
      auditLog: { create: jest.fn() }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.createTree(admin, { zoneId: 'zone-1', cropTypeId: 'crop-1' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not allow publishing a product batch with an unverified tree', async () => {
    const prisma = {
      productBatch: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'batch-1',
          cooperativeId: 'coop-1',
          publicVerified: true,
          status: ProductBatchStatus.PUBLISHED,
          product: { status: 'PUBLISHED', publicVerified: true },
          lot: { status: 'OPEN', zoneId: 'zone-1', lotTrees: [{ tree: { publicVerified: false, status: TreeStatus.ACTIVE } }] }
        })
      },
      traceabilityCode: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    await expect(service.createTraceabilityCode(admin, { codeType: TraceabilityCodeType.PRODUCT_BATCH, productBatchId: 'batch-1', status: TraceabilityCodeStatus.PUBLISHED })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.traceabilityCode.create).not.toHaveBeenCalled();
  });

  it('does not expose exact tree coordinates in the public payload', async () => {
    const prisma = {
      traceabilityCode: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'code-1',
          code: 'TREE-XOI-VLM-01-000001',
          tree: {
            treeCode: 'XOI-VLM-01-000001',
            publicVerified: true,
            status: 'ACTIVE',
            latitude: 10.445812,
            longitude: 105.718921,
            cropType: { id: 'crop-1', code: 'XOI', name: 'Xoài', sortOrder: 10, isActive: true },
            zone: { name: 'Vườn A', address: 'Đồng Tháp', isPublic: true, latitude: 10.4458, longitude: 105.718 },
            events: [{ id: 'event-1', eventDate: new Date('2026-01-01'), eventType: 'WATERING', description: 'Tưới', inputs: [{ id: 'input-1', eventId: 'event-1', materialName: 'Nước', createdAt: new Date() }] }],
            harvests: []
          }
        }),
        update: jest.fn()
      }
    };
    const service = new PlantTraceabilityService(prisma as never, { record: jest.fn() } as never);

    const result = await service.publicTree('XOI-VLM-01-000001');

    expect(result.tree).not.toHaveProperty('latitude');
    expect(result.tree).not.toHaveProperty('longitude');
    expect(result.tree.zone).toMatchObject({ latitude: 10.45, longitude: 105.72 });
    expect(result.tree.cropType).toEqual(expect.objectContaining({ code: 'XOI', name: 'Xoài' }));
    expect(result.tree.cropType).not.toHaveProperty('id');
    expect(result.tree.events[0].inputs[0]).not.toHaveProperty('id');
  });
});
