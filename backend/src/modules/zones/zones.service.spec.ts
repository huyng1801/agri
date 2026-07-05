import { RoleSlug } from '@prisma/client';
import { ZonesService } from './zones.service';

describe('ZonesService', () => {
  const user = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['zones.*']
  };

  it('filters zones by public flag in list queries', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const service = new ZonesService(
      {
        zone: {
          findMany,
          count
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.list(user, { isPublic: 'false', limit: '20' });

    expect(findMany.mock.calls[0][0].where).toMatchObject({
      cooperativeId: 'coop-1',
      isPublic: false
    });
  });

  it('defaults new zones to public when visibility is omitted', async () => {
    const create = jest.fn(({ data }) => ({
      id: 'zone-1',
      ...data
    }));
    const service = new ZonesService(
      {
        zone: {
          create
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.create(user, {
      name: 'Vùng xoài',
      code: 'ZONE-001'
    });

    expect(create.mock.calls[0][0].data).toMatchObject({
      cooperativeId: 'coop-1',
      name: 'Vùng xoài',
      code: 'ZONE-001',
      isPublic: true,
      status: 'ACTIVE'
    });
  });

  it('persists explicit public visibility updates', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'zone-1',
      cooperativeId: 'coop-1'
    });
    const update = jest.fn(({ data }) => ({
      id: 'zone-1',
      ...data
    }));
    const service = new ZonesService(
      {
        zone: {
          findUnique,
          update
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.update(user, 'zone-1', {
      name: 'Vùng xoài',
      code: 'ZONE-001',
      isPublic: false
    });

    expect(update.mock.calls[0][0].data).toMatchObject({
      isPublic: false
    });
  });
});
