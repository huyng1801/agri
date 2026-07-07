import { BadRequestException } from '@nestjs/common';
import { FileVisibility, ProductStatus, RoleSlug } from '@prisma/client';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const user = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['products.create']
  };

  const planLimits = { assertCanCreate: jest.fn().mockResolvedValue(undefined) };

  it('rejects product thumbnails from another cooperative', async () => {
    const service = new ProductsService(
      {
        fileAsset: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'file-1',
            cooperativeId: 'coop-2',
            mimeType: 'image/png',
            visibility: FileVisibility.PUBLIC,
            publicUrl: 'https://cdn.htxonline.vn/coop-2/file.png'
          })
        }
      } as never,
      { record: jest.fn() } as never,
      planLimits as never
    );

    await expect(
      service.create(user, {
        code: 'SP001',
        name: 'Gạo thơm',
        price: 120000,
        unit: 'kg',
        thumbnailFileId: 'file-1',
        status: ProductStatus.PUBLISHED
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('persists a public R2 thumbnail for a product in the same cooperative', async () => {
    const create = jest.fn(({ data }) => ({
      id: 'product-1',
      ...data,
      category: null,
      zone: null
    }));
    const service = new ProductsService(
      {
        fileAsset: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'file-1',
            cooperativeId: 'coop-1',
            mimeType: 'image/webp',
            visibility: FileVisibility.PUBLIC,
            publicUrl: 'https://cdn.htxonline.vn/coop-1/file.webp'
          })
        },
        product: {
          create
        }
      } as never,
      { record: jest.fn() } as never,
      planLimits as never
    );

    await service.create(user, {
      code: 'SP001',
      name: 'Gạo thơm',
      price: 120000,
      unit: 'kg',
      thumbnailFileId: 'file-1',
      status: ProductStatus.PUBLISHED
    });

    expect(create.mock.calls[0][0].data).toMatchObject({
      cooperativeId: 'coop-1',
      thumbnailFileId: 'file-1',
      slug: 'gao-thom'
    });
  });

  it('hides a non-public zone from the public product detail payload', async () => {
    const service = new ProductsService(
      {
        product: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'product-1',
            code: 'SP001',
            slug: 'gao-thom',
            name: 'Gạo thơm',
            status: ProductStatus.PUBLISHED,
            zone: {
              id: 'zone-1',
              name: 'Vùng nội bộ',
              isPublic: false
            },
            certifications: [],
            farmingLogs: []
          })
        }
      } as never,
      { record: jest.fn() } as never,
      planLimits as never
    );

    const result = await service.publicDetail('gao-thom');

    expect(result.zone).toBeNull();
  });
});
