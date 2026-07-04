import { BadRequestException } from '@nestjs/common';
import { FarmingActivityType, FarmingLogStatus, RoleSlug } from '@prisma/client';
import { UpdateFarmingLogDto } from '../../common/dto';
import { FarmingLogsService } from './farming-logs.service';

describe('FarmingLogsService', () => {
  const user = {
    id: 'member-1',
    email: 'member@htx.test',
    fullName: 'Member HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.MEMBER_HTX],
    permissions: ['farming_logs.update']
  };

  const existingLog = {
    id: 'log-1',
    cooperativeId: 'coop-1',
    productId: 'product-1',
    zoneId: 'zone-1',
    logDate: new Date('2026-07-01'),
    activityType: FarmingActivityType.SEEDING,
    description: 'Gieo giống',
    inputMaterialsJson: [],
    imagesJson: [],
    status: FarmingLogStatus.PUBLISHED,
    product: { id: 'product-1', cooperativeId: 'coop-1' },
    zone: { id: 'zone-1', cooperativeId: 'coop-1' },
    actor: null
  };

  it('rejects updating a log to a product from another cooperative', async () => {
    const service = new FarmingLogsService(
      {
        farmingLog: {
          findUnique: jest.fn().mockResolvedValue(existingLog)
        },
        product: {
          findUnique: jest.fn().mockResolvedValue({ id: 'product-2', cooperativeId: 'coop-2' })
        }
      } as never,
      { record: jest.fn() } as never
    );

    await expect(service.update(user, 'log-1', { productId: 'product-2' } as UpdateFarmingLogDto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects updating a log to a zone from another cooperative', async () => {
    const service = new FarmingLogsService(
      {
        farmingLog: {
          findUnique: jest.fn().mockResolvedValue(existingLog)
        },
        zone: {
          findUnique: jest.fn().mockResolvedValue({ id: 'zone-2', cooperativeId: 'coop-2' })
        }
      } as never,
      { record: jest.fn() } as never
    );

    await expect(service.update(user, 'log-1', { zoneId: 'zone-2' } as UpdateFarmingLogDto)).rejects.toBeInstanceOf(BadRequestException);
  });
});
