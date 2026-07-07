import { ForbiddenException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const adminHtx = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['reports.overview']
  };

  function createService(prisma: Record<string, unknown>) {
    return new ReportsService(prisma as never);
  }

  it('returns localized overview metrics for Admin HTX', async () => {
    const service = createService({
      user: { count: jest.fn().mockResolvedValue(5) },
      product: { count: jest.fn().mockResolvedValue(3) },
      zone: { count: jest.fn().mockResolvedValue(2) },
      farmingLog: { count: jest.fn().mockResolvedValue(10) },
      traceabilityPassport: { count: jest.fn().mockResolvedValue(4) },
      subscriptionInvoice: { count: jest.fn().mockResolvedValue(1), aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 1000000 } }) },
      order: { count: jest.fn().mockResolvedValue(2) }
    });

    const result = await service.overview(adminHtx, { range: '30d' });

    expect(result.metrics.some((item) => item.label === 'Sản phẩm' && item.value === 3)).toBe(true);
    expect(result.metrics.some((item) => item.label === 'Nhật ký canh tác')).toBe(true);
  });

  it('blocks Admin HTX from downloading another cooperative snapshot', async () => {
    const service = createService({
      reportSnapshot: {
        findUnique: jest.fn().mockResolvedValue({ id: 'snap-1', cooperativeId: 'coop-2', payloadJson: {} })
      }
    });

    await expect(service.downloadSnapshot(adminHtx, 'snap-1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
