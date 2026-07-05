import { ContactInquiryStatus, RoleSlug } from '@prisma/client';
import { ContactsService } from './contacts.service';

describe('ContactsService', () => {
  const user = {
    id: 'super-admin',
    email: 'admin@example.com',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['contacts.read', 'contacts.update']
  };

  it('stores a public contact inquiry with NEW status', async () => {
    const create = jest.fn(({ data }) => ({ id: 'contact-1', ...data }));
    const service = new ContactsService(
      {
        contactInquiry: {
          create
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.createPublic({
      fullName: 'Nguyen Van A',
      phone: '0912345678',
      email: 'buyer@example.com',
      message: 'Toi can duoc tu van them ve nen tang.',
      sourcePath: '/lien-he'
    });

    expect(create.mock.calls[0][0].data).toMatchObject({
      fullName: 'Nguyen Van A',
      phone: '0912345678',
      email: 'buyer@example.com',
      message: 'Toi can duoc tu van them ve nen tang.',
      sourcePath: '/lien-he',
      status: 'NEW'
    });
  });

  it('filters contacts by search and status', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const service = new ContactsService(
      {
        contactInquiry: {
          findMany,
          count
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.list({ search: 'dong thap', status: 'IN_PROGRESS', limit: '20' });

    expect(findMany.mock.calls[0][0].where).toMatchObject({
      status: ContactInquiryStatus.IN_PROGRESS
    });
    expect(findMany.mock.calls[0][0].where.OR).toHaveLength(4);
  });

  it('updates contact status and note', async () => {
    const update = jest.fn(({ data }) => ({ id: 'contact-1', ...data }));
    const record = jest.fn();
    const service = new ContactsService(
      {
        contactInquiry: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'contact-1',
            status: 'NEW'
          }),
          update
        }
      } as never,
      { record } as never
    );

    await service.update(user, 'contact-1', {
      status: ContactInquiryStatus.DONE,
      note: 'Da goi lai va gui bang gia'
    });

    expect(update.mock.calls[0][0].data).toMatchObject({
      status: ContactInquiryStatus.DONE,
      note: 'Da goi lai va gui bang gia'
    });
    expect(record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'contacts.update',
        entity: 'ContactInquiry',
        entityId: 'contact-1'
      })
    );
  });
});
