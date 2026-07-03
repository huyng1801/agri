import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { CreateOrderDto, UpdateOrderDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { requireTenant, tenantWhere } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.OrderWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({ where, include: { items: true, payments: true }, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.order.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async create(user: AuthUser, dto: CreateOrderDto) {
    const cooperativeId = requireTenant(user, dto.cooperativeId);
    return this.prisma.order.create({
      data: {
        cooperativeId: cooperativeId!,
        buyerId: dto.buyerId,
        orderCode: dto.orderCode ?? `ORD-${nanoid(8).toUpperCase()}`,
        status: dto.status ?? 'DRAFT',
        totalAmount: dto.totalAmount,
        note: dto.note
      }
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateOrderDto) {
    const found = await this.prisma.order.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy đơn hàng');
    requireTenant(user, found.cooperativeId);
    return this.prisma.order.update({ where: { id }, data: dto });
  }
}
