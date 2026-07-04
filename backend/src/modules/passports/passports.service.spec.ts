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
});
