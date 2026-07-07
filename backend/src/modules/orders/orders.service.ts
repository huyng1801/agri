import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { CreateOrderDto, PublicCreateOrderDto, UpdateOrderDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

const ORDER_STATUSES = Object.values(OrderStatus);

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const cooperativeId = isSuperAdmin(user)
      ? query.cooperativeId
        ? String(query.cooperativeId)
        : undefined
      : requireTenant(user, query.cooperativeId ? String(query.cooperativeId) : undefined);
    const scopedCooperativeId = cooperativeId && !isSuperAdmin(user) ? cooperativeId : undefined;
    const where = this.buildWhere({
      cooperativeId,
      status: this.parseStatus(query.status),
      search: typeof query.search === 'string' ? query.search.trim() : '',
      scopedCooperativeId
    });
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: this.orderInclude(scopedCooperativeId),
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.order.count({ where })
    ]);
    return paginated(data.map((order) => this.presentOrder(order, scopedCooperativeId)), total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const scopedCooperativeId = isSuperAdmin(user) ? undefined : requireTenant(user);
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude(scopedCooperativeId)
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (scopedCooperativeId && order.cooperativeId !== scopedCooperativeId && !order.items.length) {
      throw new ForbiddenException('Không có quyền truy cập đơn hàng này');
    }
    return this.presentOrder(order, scopedCooperativeId);
  }

  async create(user: AuthUser, dto: CreateOrderDto) {
    const productIds = Array.from(new Set(dto.items?.map((item) => item.productId) ?? []));
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, cooperativeId: true, price: true }
        })
      : [];
    if (productIds.length && products.length !== productIds.length) {
      throw new BadRequestException('Sản phẩm trong đơn không hợp lệ');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const firstItemCooperativeId = products[0]?.cooperativeId;
    const cooperativeId = isSuperAdmin(user) ? (dto.cooperativeId ?? firstItemCooperativeId) : requireTenant(user, dto.cooperativeId ?? firstItemCooperativeId);
    if (!cooperativeId) throw new BadRequestException('Thiếu HTX của đơn hàng');

    const status = dto.status ?? OrderStatus.NEW;
    const itemData =
      dto.items?.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) throw new BadRequestException('Sản phẩm trong đơn không hợp lệ');
        if (!isSuperAdmin(user) && product.cooperativeId !== cooperativeId) {
          throw new ForbiddenException('Không thể tạo đơn chứa sản phẩm HTX khác');
        }
        return {
          productId: item.productId,
          cooperativeId: product.cooperativeId,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? product.price,
          status
        };
      }) ?? [];
    const totalAmount = dto.totalAmount ?? itemData.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

    return this.prisma.order.create({
      data: {
        cooperativeId,
        buyerId: dto.buyerId,
        orderCode: dto.orderCode ?? `ORD-${nanoid(8).toUpperCase()}`,
        status,
        totalAmount,
        buyerName: dto.buyerName,
        buyerPhone: dto.buyerPhone,
        buyerEmail: dto.buyerEmail,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        address: dto.address,
        paymentMethod: dto.paymentMethod ?? 'COD',
        note: dto.note,
        items: itemData.length ? { create: itemData } : undefined
      },
      include: { items: true, payments: true }
    });
  }

  async createPublic(dto: PublicCreateOrderDto) {
    if (!dto.items.length) throw new BadRequestException('Giỏ hàng không được rỗng');
    const productIds = Array.from(new Set(dto.items.map((item) => item.productId)));
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        name: true,
        cooperativeId: true,
        price: true,
        unit: true,
        cooperative: { select: { id: true, name: true, code: true, phone: true } }
      }
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Một số sản phẩm không còn public hoặc không tồn tại');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const itemData = dto.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new BadRequestException('Sản phẩm trong giỏ hàng không hợp lệ');
      return {
        productId: product.id,
        cooperativeId: product.cooperativeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? product.price,
        status: OrderStatus.NEW
      };
    });

    const groups = new Map<string, typeof itemData>();
    for (const item of itemData) {
      const bucket = groups.get(item.cooperativeId) ?? [];
      bucket.push(item);
      groups.set(item.cooperativeId, bucket);
    }

    const groupCode = groups.size > 1 ? `ORD-GRP-${nanoid(8).toUpperCase()}` : null;
    const orders = [];

    for (const [cooperativeId, items] of groups.entries()) {
      const totalAmount = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
      const order = await this.prisma.order.create({
        data: {
          cooperativeId,
          orderCode: `ORD-${nanoid(8).toUpperCase()}`,
          orderGroupCode: groupCode,
          status: OrderStatus.NEW,
          totalAmount,
          buyerName: dto.buyerName,
          buyerPhone: dto.buyerPhone,
          buyerEmail: dto.buyerEmail,
          province: dto.province,
          district: dto.district,
          ward: dto.ward,
          address: dto.address,
          paymentMethod: 'COD',
          note: dto.note,
          items: { create: items }
        },
        include: this.publicOrderInclude()
      });
      await this.payments.createForOrder(order.id, totalAmount, 'COD');
      orders.push(order);
    }

    if (orders.length === 1) {
      return { groupCode: orders[0].orderGroupCode, orders };
    }
    return { groupCode, orders };
  }

  async lookupPublic(orderCode: string, phone: string, groupCode?: string) {
    if (!phone) throw new BadRequestException('Nhập số điện thoại');
    if (!orderCode && !groupCode) throw new BadRequestException('Nhập mã đơn hàng hoặc mã nhóm đơn');

    if (groupCode) {
      const orders = await this.prisma.order.findMany({
        where: {
          orderGroupCode: groupCode,
          buyerPhone: phone
        },
        include: this.publicOrderInclude(),
        orderBy: { createdAt: 'asc' }
      });
      if (!orders.length) throw new NotFoundException('Không tìm thấy đơn hàng');
      return { groupCode, orders };
    }

    const order = await this.prisma.order.findFirst({
      where: {
        orderCode,
        buyerPhone: phone
      },
      include: this.publicOrderInclude()
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (order.orderGroupCode) {
      const orders = await this.prisma.order.findMany({
        where: {
          orderGroupCode: order.orderGroupCode,
          buyerPhone: phone
        },
        include: this.publicOrderInclude(),
        orderBy: { createdAt: 'asc' }
      });
      return { groupCode: order.orderGroupCode, orders };
    }

    return { groupCode: null, orders: [order] };
  }

  async update(user: AuthUser, id: string, dto: UpdateOrderDto) {
    const found = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { select: { id: true, cooperativeId: true, status: true } }
      }
    });
    if (!found) throw new NotFoundException('Không tìm thấy đơn hàng');
    const cooperativeId = requireTenant(user);

    if (!cooperativeId) {
      await this.prisma.order.update({
        where: { id },
        data: {
          status: dto.status,
          totalAmount: dto.totalAmount,
          note: dto.note
        }
      });
      return this.get(user, id);
    }

    const hasScopedItems = found.items.some((item) => item.cooperativeId === cooperativeId);
    const canUpdateLegacyItemlessOrder = found.cooperativeId === cooperativeId && found.items.length === 0;
    if (!hasScopedItems && !canUpdateLegacyItemlessOrder) {
      throw new ForbiddenException('Không có quyền cập nhật đơn hàng này');
    }

    if (hasScopedItems) {
      const itemData: Prisma.OrderItemUpdateManyMutationInput = {};
      if (dto.status) itemData.status = dto.status;
      if (dto.note !== undefined) itemData.note = dto.note;
      if (Object.keys(itemData).length) {
        await this.prisma.orderItem.updateMany({
          where: { orderId: id, cooperativeId },
          data: itemData
        });
      }
    }

    if (canUpdateLegacyItemlessOrder) {
      await this.prisma.order.update({
        where: { id },
        data: {
          status: dto.status,
          totalAmount: dto.totalAmount,
          note: dto.note
        }
      });
    } else if (dto.status) {
      await this.syncOrderStatus(id);
    }

    return this.get(user, id);
  }

  private buildWhere({
    cooperativeId,
    status,
    search,
    scopedCooperativeId
  }: {
    cooperativeId?: string;
    status?: OrderStatus;
    search?: string;
    scopedCooperativeId?: string;
  }): Prisma.OrderWhereInput {
    const and: Prisma.OrderWhereInput[] = [];
    if (cooperativeId) {
      and.push({
        OR: [{ cooperativeId }, { items: { some: { cooperativeId } } }]
      });
    }
    if (status) {
      and.push(
        scopedCooperativeId
          ? {
              OR: [
                { items: { some: { cooperativeId: scopedCooperativeId, status } } },
                { cooperativeId: scopedCooperativeId, status, items: { none: {} } }
              ]
            }
          : { status }
      );
    }
    if (search) {
      and.push({
        OR: [
          { orderCode: { contains: search, mode: 'insensitive' } },
          { buyerName: { contains: search, mode: 'insensitive' } },
          { buyerPhone: { contains: search } },
          { buyerEmail: { contains: search, mode: 'insensitive' } },
          { items: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
          { items: { some: { cooperative: { name: { contains: search, mode: 'insensitive' } } } } }
        ]
      });
    }
    return and.length ? { AND: and } : {};
  }

  private orderInclude(scopedCooperativeId?: string): Prisma.OrderInclude {
    return {
      cooperative: { select: { id: true, name: true, code: true, phone: true, email: true, province: true } },
      items: {
        where: scopedCooperativeId ? { cooperativeId: scopedCooperativeId } : undefined,
        include: {
          cooperative: { select: { id: true, name: true, code: true, phone: true, email: true, province: true } },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              unit: true,
              price: true,
              status: true,
              thumbnail: { select: { id: true, publicUrl: true, mimeType: true } },
              cooperative: { select: { id: true, name: true, code: true, phone: true, email: true, province: true } }
            }
          }
        },
        orderBy: { id: 'asc' }
      },
      payments: true
    };
  }

  private publicOrderInclude(): Prisma.OrderInclude {
    return {
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          status: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              unit: true,
              cooperative: { select: { id: true, name: true, code: true, phone: true } }
            }
          }
        }
      }
    };
  }

  private presentOrder(order: Record<string, any>, scopedCooperativeId?: string) {
    const items = Array.isArray(order.items) ? order.items : [];
    const visibleSubtotal = items.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0), 0);
    const itemCooperatives = Array.from(
      items
        .reduce((map, item) => {
          const cooperative = item.cooperative ?? item.product?.cooperative;
          if (cooperative?.id) map.set(cooperative.id, cooperative);
          return map;
        }, new Map<string, unknown>())
        .values()
    );

    return {
      ...order,
      visibleSubtotal,
      visibleItemsCount: items.length,
      tenantStatus: scopedCooperativeId ? this.aggregateStatus(items.map((item) => item.status), order.status) : order.status,
      itemCooperatives
    };
  }

  private parseStatus(status: unknown) {
    if (typeof status !== 'string') return undefined;
    return ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  }

  private aggregateStatus(statuses: Array<OrderStatus | string | null | undefined>, fallback: OrderStatus | string = OrderStatus.NEW): OrderStatus {
    const valid = statuses.filter((status): status is OrderStatus => ORDER_STATUSES.includes(status as OrderStatus));
    if (!valid.length) return this.parseStatus(fallback) ?? OrderStatus.NEW;
    const active = valid.filter((status) => status !== OrderStatus.CANCELLED);
    if (!active.length) return OrderStatus.CANCELLED;
    if (active.every((status) => status === OrderStatus.COMPLETED || status === OrderStatus.FULFILLED)) return OrderStatus.COMPLETED;
    if (active.includes(OrderStatus.SHIPPING)) return OrderStatus.SHIPPING;
    if (active.includes(OrderStatus.PROCESSING)) return OrderStatus.PROCESSING;
    const confirmedStatuses: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.FULFILLED];
    if (active.some((status) => confirmedStatuses.includes(status))) return OrderStatus.CONFIRMED;
    if (active.includes(OrderStatus.NEW)) return OrderStatus.NEW;
    return active[0];
  }

  private async syncOrderStatus(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
      select: { status: true }
    });
    if (!items.length) return;
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: this.aggregateStatus(items.map((item) => item.status)) }
    });
  }
}
