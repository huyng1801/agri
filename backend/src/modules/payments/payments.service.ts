import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.PaymentWhereInput = {};
    if (!isSuperAdmin(user)) {
      const cooperativeId = requireTenant(user);
      where.OR = [{ order: { cooperativeId } }, { invoice: { cooperativeId } }];
    } else if (query.cooperativeId) {
      const cooperativeId = String(query.cooperativeId);
      where.OR = [{ order: { cooperativeId } }, { invoice: { cooperativeId } }];
    }
    if (query.status) where.status = String(query.status) as PaymentStatus;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: { include: { cooperative: true } },
          invoice: { include: { cooperative: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.payment.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: { include: { cooperative: true } },
        invoice: { include: { cooperative: true } }
      }
    });
    if (!payment) throw new NotFoundException('Không tìm thấy thanh toán');
    if (!isSuperAdmin(user)) {
      const cooperativeId = requireTenant(user);
      const paymentCoopId = payment.order?.cooperativeId ?? payment.invoice?.cooperativeId;
      if (paymentCoopId !== cooperativeId) {
        throw new ForbiddenException('Không có quyền xem thanh toán HTX khác');
      }
    }
    return payment;
  }

  createForOrder(orderId: string, amount: number | string, method = 'COD') {
    return this.prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: PaymentStatus.PENDING
      }
    });
  }

  createForInvoice(invoiceId: string, amount: number | string, method = 'manual') {
    return this.prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        status: PaymentStatus.PAID,
        paidAt: new Date()
      }
    });
  }
}
