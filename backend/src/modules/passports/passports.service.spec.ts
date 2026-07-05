import { BadRequestException } from '@nestjs/common';
import { PassportStatus, ProductStatus, RoleSlug } from '@prisma/client';
import { PassportsService } from './passports.service';

describe('PassportsService', () => {
  const user = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['passports.create']
  };

  it('rejects publishing a passport for an unpublished product', async () => {
    const service = new PassportsService(
      {
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'product-1',
            cooperativeId: 'coop-1',
            slug: 'gao-thom',
            status: ProductStatus.DRAFT
          })
        }
      } as never,
      { record: jest.fn() } as never
    );

    await expect(
      service.create(user, {
        productId: 'product-1',
        status: PassportStatus.PUBLISHED
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('hides non-public zones from the public passport payload', async () => {
    const update = jest.fn().mockResolvedValue({});
    const service = new PassportsService(
      {
        traceabilityPassport: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'passport-1',
            passportCode: 'AP-TEST',
            publicSlug: 'gao-thom-ap-test',
            status: PassportStatus.PUBLISHED,
            viewCount: 12,
            cooperative: {
              id: 'coop-1',
              name: 'HTX Test'
            },
            product: {
              id: 'product-1',
              name: 'Gạo thơm',
              status: ProductStatus.PUBLISHED,
              zone: {
                id: 'zone-1',
                name: 'Vùng nội bộ',
                isPublic: false
              },
              certifications: [],
              farmingLogs: [
                {
                  id: 'log-1',
                  logDate: new Date('2026-07-05T00:00:00.000Z'),
                  activityType: 'WATERING',
                  description: 'Tưới tiêu định kỳ',
                  imagesJson: [],
                  actor: {
                    id: 'user-1',
                    fullName: 'Nông dân A'
                  },
                  zone: {
                    id: 'zone-2',
                    name: 'Vùng nhật ký',
                    isPublic: false
                  }
                }
              ]
            }
          }),
          update
        }
      } as never,
      { record: jest.fn() } as never
    );

    const result = await service.publicPassport('AP-TEST');

    expect(result.product.zone).toBeNull();
    expect(result.product.farmingLogs[0]?.zone).toBeNull();
    expect(update).toHaveBeenCalledWith({
      where: { id: 'passport-1' },
      data: { viewCount: { increment: 1 } }
    });
  });
});
