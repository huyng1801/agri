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

  const payments = { createForOrder: jest.fn().mockResolvedValue({ id: 'pay-1' }) };

  function createService(prisma: Record<string, unknown>) {
    return new OrdersService(prisma as never, payments as never);
  }

  it('splits public checkout into multiple orders grouped by cooperative', async () => {
    const create = jest
      .fn()
      .mockResolvedValueOnce({ id: 'order-1', orderCode: 'ORD-A', orderGroupCode: 'ORD-GRP-TEST', cooperativeId: 'coop-1', items: [] })
      .mockResolvedValueOnce({ id: 'order-2', orderCode: 'ORD-B', orderGroupCode: 'ORD-GRP-TEST', cooperativeId: 'coop-2', items: [] });
    const service = createService({
      product: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'p1', cooperativeId: 'coop-1', price: 100000, name: 'A', unit: 'kg' },
          { id: 'p2', cooperativeId: 'coop-2', price: 50000, name: 'B', unit: 'kg' }
        ])
      },
      order: { create }
    });

    const result = await service.createPublic({
      buyerName: 'Khách',
      buyerPhone: '0912345678',
      province: 'HCM',
      address: '123',
      items: [
        { productId: 'p1', quantity: 1 },
        { productId: 'p2', quantity: 2 }
      ]
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(result.orders).toHaveLength(2);
    expect(result.groupCode).toMatch(/^ORD-GRP-/);
    expect(payments.createForOrder).toHaveBeenCalledTimes(2);
  });

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
    const service = createService({
      order: {
        findUnique: orderFindUnique,
        update: orderUpdate
      },
      orderItem: {
        updateMany: orderItemUpdateMany,
        findMany: jest.fn().mockResolvedValue([{ status: OrderStatus.NEW }, { status: OrderStatus.PROCESSING }])
      }
    });

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
    const service = createService({
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-1',
          cooperativeId: 'coop-1',
          items: [{ id: 'item-1', cooperativeId: 'coop-1', status: OrderStatus.NEW }]
        })
      }
    });

    await expect(service.update(htxUser, 'order-1', { status: OrderStatus.CONFIRMED })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('looks up all orders in a group by group code and phone', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 'order-1', orderCode: 'ORD-A' }, { id: 'order-2', orderCode: 'ORD-B' }]);
    const service = createService({ order: { findMany } });

    const result = await service.lookupPublic('', '0912345678', 'ORD-GRP-TEST');

    expect(findMany).toHaveBeenCalled();
    expect(result.orders).toHaveLength(2);
    expect(result.groupCode).toBe('ORD-GRP-TEST');
  });
});
