import { ForbiddenException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const adminHtx = {
    id: 'admin-htx',
    email: 'admin@htx.test',
    fullName: 'Admin HTX',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['payments.read']
  };

  it('creates a pending COD payment for an order', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'pay-1', orderId: 'order-1', status: 'PENDING' });
    const service = new PaymentsService({ payment: { create } } as never);

    await service.createForOrder('order-1', 150000);

    expect(create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        amount: 150000,
        method: 'COD',
        status: 'PENDING'
      }
    });
  });

  it('blocks Admin HTX from viewing another cooperative payment', async () => {
    const service = new PaymentsService({
      payment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'pay-1',
          order: { cooperativeId: 'coop-2' },
          invoice: null
        })
      }
    } as never);

    await expect(service.get(adminHtx, 'pay-1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
