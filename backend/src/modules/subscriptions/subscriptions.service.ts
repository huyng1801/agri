import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssignSubscriptionDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { requireTenant } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async get(user: AuthUser, cooperativeId: string) {
    requireTenant(user, cooperativeId);
    return this.prisma.cooperativeSubscription.findFirst({
      where: { cooperativeId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async assign(user: AuthUser, cooperativeId: string, dto: AssignSubscriptionDto) {
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }
    const [cooperative, plan] = await Promise.all([
      this.prisma.cooperative.findUnique({ where: { id: cooperativeId } }),
      this.prisma.subscriptionPlan.findUnique({ where: { id: dto.planId } })
    ]);
    if (!cooperative) throw new NotFoundException('Không tìm thấy HTX');
    if (!plan) throw new NotFoundException('Không tìm thấy gói');
    if (!plan.isActive) throw new BadRequestException('Không thể gán gói inactive');

    await this.prisma.cooperativeSubscription.updateMany({
      where: { cooperativeId, status: { in: ['ACTIVE', 'TRIAL'] } },
      data: { status: 'CANCELLED' }
    });
    const created = await this.prisma.cooperativeSubscription.create({
      data: {
        cooperativeId,
        planId: dto.planId,
        status: dto.status,
        startDate: dto.startDate,
        endDate: dto.endDate,
        autoRenew: dto.autoRenew ?? false,
        note: dto.note,
        createdBy: user.id
      },
      include: { plan: true, cooperative: true }
    });
    await this.audit.record({
      user,
      action: 'subscriptions.assign',
      entity: 'CooperativeSubscription',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async update(user: AuthUser, cooperativeId: string, dto: Partial<AssignSubscriptionDto>) {
    const current = await this.get(user, cooperativeId);
    if (!current) throw new NotFoundException('HTX chưa có gói');
    if (dto.startDate && dto.endDate && dto.endDate <= dto.startDate) {
      throw new BadRequestException('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }
    const updated = await this.prisma.cooperativeSubscription.update({
      where: { id: current.id },
      data: {
        planId: dto.planId,
        status: dto.status,
        startDate: dto.startDate,
        endDate: dto.endDate,
        autoRenew: dto.autoRenew,
        note: dto.note
      },
      include: { plan: true }
    });
    await this.audit.record({
      user,
      action: 'subscriptions.update',
      entity: 'CooperativeSubscription',
      entityId: updated.id,
      cooperativeId
    });
    return updated;
  }

  async renew(user: AuthUser, cooperativeId: string, dto: AssignSubscriptionDto) {
    return this.assign(user, cooperativeId, dto);
  }

  async cancel(user: AuthUser, cooperativeId: string) {
    const current = await this.get(user, cooperativeId);
    if (!current) throw new NotFoundException('HTX chưa có gói');
    const updated = await this.prisma.cooperativeSubscription.update({
      where: { id: current.id },
      data: { status: 'CANCELLED' },
      include: { plan: true }
    });
    await this.audit.record({
      user,
      action: 'subscriptions.cancel',
      entity: 'CooperativeSubscription',
      entityId: updated.id,
      cooperativeId
    });
    return updated;
  }
}
