import { ForbiddenException } from '@nestjs/common';
import { OrderStatus, RoleSlug } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const htxUser = {
    id: 'admin-htx-2',
    email: 'admin@coop2.test',
    fullName: 'Admin HTX 2',
    cooperativeId: 'coop-2',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['orders.read', 'orders.update']
  };

  it('updates only the current HTX order items and syncs the aggregate order status', async () => {
    const orderFindUnique = jest
      .fn()
      .mockResolvedValueOnce({
        id: 'order-1',
        cooperativeId: 'coop-1',
        items: [
          { id: 'item-1', cooperativeId: 'coop-1', status: OrderStatus.NEW },
          { id: 'item-2', cooperativeId: 'coop-2', status: OrderStatus.NEW }
        ]
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        cooperativeId: 'coop-1',
        orderCode: 'ORD-001',
        status: OrderStatus.PROCESSING,
        totalAmount: 300000,
        items: [
          {
            id: 'item-2',
            cooperativeId: 'coop-2',
            quantity: 2,
            unitPrice: 100000,
            status: OrderStatus.PROCESSING,
            note: 'Đã gọi khách',
            cooperative: { id: 'coop-2', name: 'HTX 2' },
            product: { id: 'product-2', name: 'Cà phê', unit: 'kg', cooperative: { id: 'coop-2', name: 'HTX 2' } }
          }
        ]
      });
    const orderUpdate = jest.fn().mockResolvedValue({});
    const orderItemUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const service = new OrdersService({
      order: {
        findUnique: orderFindUnique,
        update: orderUpdate
      },
      orderItem: {
        updateMany: orderItemUpdateMany,
        findMany: jest.fn().mockResolvedValue([{ status: OrderStatus.NEW }, { status: OrderStatus.PROCESSING }])
      }
    } as never);

    const result = await service.update(htxUser, 'order-1', { status: OrderStatus.PROCESSING, note: 'Đã gọi khách' });

    expect(orderItemUpdateMany).toHaveBeenCalledWith({
      where: { orderId: 'order-1', cooperativeId: 'coop-2' },
      data: { status: OrderStatus.PROCESSING, note: 'Đã gọi khách' }
    });
    expect(orderUpdate).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: OrderStatus.PROCESSING }
    });
    expect(result.visibleSubtotal).toBe(200000);
    expect((result as any).items).toHaveLength(1);
  });

  it('rejects updating an order that has no item for the current HTX', async () => {
    const service = new OrdersService({
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-1',
          cooperativeId: 'coop-1',
          items: [{ id: 'item-1', cooperativeId: 'coop-1', status: OrderStatus.NEW }]
        })
      }
    } as never);

    await expect(service.update(htxUser, 'order-1', { status: OrderStatus.CONFIRMED })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not select internal HTX item notes in public order lookup', async () => {
    const findFirst = jest.fn().mockResolvedValue({
      id: 'order-1',
      orderCode: 'ORD-001',
      buyerPhone: '0912345678',
      items: []
    });
    const service = new OrdersService({
      order: {
        findFirst
      }
    } as never);

    await service.lookupPublic('ORD-001', '0912345678');

    expect(findFirst.mock.calls[0][0].include.items.select).toMatchObject({
      id: true,
      quantity: true,
      unitPrice: true,
      status: true
    });
    expect(findFirst.mock.calls[0][0].include.items.select.note).toBeUndefined();
  });
});
