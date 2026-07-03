import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../../common/types';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = isSuperAdmin(user)
      ? query.cooperativeId
        ? String(query.cooperativeId)
        : undefined
      : requireTenant(user);
    const tenant = cooperativeId ? { cooperativeId } : {};
    const [cooperatives, users, products, zones, logs, passports, unpaidInvoices, revenue] = await Promise.all([
      isSuperAdmin(user) ? this.prisma.cooperative.count() : Promise.resolve(1),
      this.prisma.user.count({ where: tenant }),
      this.prisma.product.count({ where: tenant }),
      this.prisma.zone.count({ where: tenant }),
      this.prisma.farmingLog.count({ where: tenant }),
      this.prisma.traceabilityPassport.count({ where: tenant }),
      this.prisma.subscriptionInvoice.count({ where: { ...tenant, status: { in: ['UNPAID', 'OVERDUE'] } } }),
      this.prisma.subscriptionInvoice.aggregate({
        where: { ...tenant, status: 'PAID' },
        _sum: { amount: true }
      })
    ]);
    return {
      cooperatives,
      users,
      products,
      zones,
      logs,
      passports,
      unpaidInvoices,
      revenue: Number(revenue._sum.amount ?? 0)
    };
  }

  async revenue(user: AuthUser, query: Record<string, unknown>) {
    const where: Prisma.SubscriptionInvoiceWhereInput = { status: 'PAID' };
    if (!isSuperAdmin(user)) where.cooperativeId = requireTenant(user);
    if (query.cooperativeId && isSuperAdmin(user)) where.cooperativeId = String(query.cooperativeId);
    const invoices = await this.prisma.subscriptionInvoice.findMany({
      where,
      include: { cooperative: true },
      orderBy: { paidAt: 'desc' },
      take: 200
    });
    return {
      total: invoices.reduce((sum, item) => sum + Number(item.amount), 0),
      invoices
    };
  }

  async exportSnapshot(user: AuthUser, type: string, query: Record<string, unknown>) {
    const overview = await this.overview(user, query);
    return this.prisma.reportSnapshot.create({
      data: {
        cooperativeId: isSuperAdmin(user) ? (query.cooperativeId ? String(query.cooperativeId) : undefined) : user.cooperativeId,
        type,
        payloadJson: overview
      }
    });
  }
}
