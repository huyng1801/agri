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

  it('scopes categories created by an HTX admin to that cooperative', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'category-1', cooperativeId: 'coop-1' });
    const service = new ProductsService(
      { productCategory: { create } } as never,
      { record: jest.fn() } as never,
      planLimits as never
    );

    await service.createCategory(user, { name: 'Rau xanh', slug: 'rau-xanh' });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ cooperativeId: 'coop-1' })
    });
  });

  it('deletes an unused category and records the cleanup audit event', async () => {
    const remove = jest.fn().mockResolvedValue({ id: 'category-1', name: 'E2E category' });
    const record = jest.fn();
    const service = new ProductsService(
      {
        productCategory: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'category-1', cooperativeId: 'coop-1', _count: { products: 0 }
          }),
          delete: remove
        }
      } as never,
      { record } as never,
      planLimits as never
    );

    await service.removeCategory(user, 'category-1');

    expect(remove).toHaveBeenCalledWith({ where: { id: 'category-1' } });
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ action: 'product_categories.delete', entityId: 'category-1' }));
  });

  it('rejects deleting a category that still has products', async () => {
    const service = new ProductsService(
      { productCategory: { findFirst: jest.fn().mockResolvedValue({ id: 'category-1', _count: { products: 1 } }) } } as never,
      { record: jest.fn() } as never,
      planLimits as never
    );

    await expect(service.removeCategory(user, 'category-1')).rejects.toThrow('đang được sản phẩm sử dụng');
  });
});
