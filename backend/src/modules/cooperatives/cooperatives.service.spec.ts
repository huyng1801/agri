import { ForbiddenException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { UpdateCooperativeDto } from '../../common/dto';
import { CooperativesService } from './cooperatives.service';

describe('CooperativesService', () => {
  const superAdmin = {
    id: 'sa-1',
    email: 'admin@agri.local',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['cooperatives.update']
  };

  const adminHtx = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['cooperatives.update']
  };

  function createService(prisma: Record<string, unknown>) {
    return new CooperativesService(prisma as never, { record: jest.fn() } as never);
  }

  it('blocks Admin HTX from suspending their cooperative', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'coop-1', status: 'ACTIVE' });
    const service = createService({ cooperative: { findUnique } });

    await expect(service.update(adminHtx, 'coop-1', { status: 'SUSPENDED' } as UpdateCooperativeDto)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows Admin HTX to update profile fields on their cooperative', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'coop-1', status: 'ACTIVE' });
    const update = jest.fn().mockResolvedValue({ id: 'coop-1', name: 'HTX Mới', status: 'ACTIVE' });
    const service = createService({ cooperative: { findUnique, update } });

    const result = await service.update(adminHtx, 'coop-1', { name: 'HTX Mới' } as UpdateCooperativeDto);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'coop-1' },
      data: { name: 'HTX Mới' }
    });
    expect(result.name).toBe('HTX Mới');
  });

  it('allows Super Admin to archive a cooperative', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'coop-2', status: 'ACTIVE' });
    const update = jest.fn().mockResolvedValue({ id: 'coop-2', status: 'ARCHIVED' });
    const service = createService({ cooperative: { findUnique, update } });

    const result = await service.remove(superAdmin, 'coop-2');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'coop-2' },
      data: { status: 'ARCHIVED' }
    });
    expect(result.status).toBe('ARCHIVED');
  });

  it('returns extended stats including QR scan total and subscription end date', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'coop-1' });
    const service = createService({
      cooperative: { findUnique },
      product: { count: jest.fn().mockResolvedValue(3) },
      zone: { count: jest.fn().mockResolvedValue(2) },
      farmingLog: { count: jest.fn().mockResolvedValue(10) },
      traceabilityPassport: {
        count: jest.fn().mockResolvedValue(4),
        aggregate: jest.fn().mockResolvedValue({ _sum: { viewCount: 120 } })
      },
      cooperativeMember: { count: jest.fn().mockResolvedValue(5) },
      subscriptionInvoice: { count: jest.fn().mockResolvedValue(1) },
      cooperativeSubscription: {
        findFirst: jest.fn().mockResolvedValue({
          endDate: new Date('2026-12-31'),
          status: 'ACTIVE',
          plan: { name: 'Basic' }
        })
      }
    });

    const stats = await service.stats(adminHtx, 'coop-1');

    expect(stats).toMatchObject({
      products: 3,
      qrScanTotal: 120,
      currentPlan: 'Basic',
      subscriptionStatus: 'ACTIVE',
      unpaidInvoices: 1
    });
    expect(stats.subscriptionEndDate).toBeInstanceOf(Date);
  });
});
