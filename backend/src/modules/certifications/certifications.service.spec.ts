import { BadRequestException } from '@nestjs/common';
import { FileVisibility, RoleSlug } from '@prisma/client';
import { CertificationsService } from './certifications.service';

describe('CertificationsService', () => {
  const user = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['certifications.create']
  };

  it('rejects certification files from another cooperative', async () => {
    const service = new CertificationsService(
      {
        fileAsset: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'file-1',
            cooperativeId: 'coop-2',
            mimeType: 'application/pdf',
            visibility: FileVisibility.PUBLIC
          })
        },
        certification: {
          create: jest.fn()
        }
      } as never,
      { record: jest.fn() } as never
    );

    await expect(
      service.create(user, {
        name: 'VietGAP 2026',
        fileId: 'file-1'
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a public certification when the file belongs to the same cooperative', async () => {
    const create = jest.fn(({ data }) => ({
      id: 'cert-1',
      ...data,
      cooperative: { id: 'coop-1', name: 'HTX 1', code: 'HTX1' },
      product: null,
      zone: null,
      file: {
        id: 'file-1',
        publicUrl: 'https://cdn.htxonline.vn/coop-1/cert.pdf',
        objectKey: 'coop-1/cert.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        visibility: FileVisibility.PUBLIC
      }
    }));
    const service = new CertificationsService(
      {
        fileAsset: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'file-1',
            cooperativeId: 'coop-1',
            mimeType: 'application/pdf',
            visibility: FileVisibility.PUBLIC
          })
        },
        certification: {
          create
        }
      } as never,
      { record: jest.fn() } as never
    );

    const result = await service.create(user, {
      name: 'VietGAP 2026',
      issuer: 'Bureau Veritas',
      fileId: 'file-1'
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cooperativeId: 'coop-1',
          fileId: 'file-1',
          isPublic: true
        })
      })
    );
    expect(result.file?.id).toBe('file-1');
  });
});
