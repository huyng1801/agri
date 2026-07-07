import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';

export type PlanResource = 'products' | 'members' | 'zones' | 'passports';

const RESOURCE_LABELS: Record<PlanResource, string> = {
  products: 'sản phẩm',
  members: 'thành viên',
  zones: 'vùng trồng',
  passports: 'QR Passport'
};

const LIMIT_FIELDS: Record<PlanResource, 'maxProducts' | 'maxMembers' | 'maxZones' | null> = {
  products: 'maxProducts',
  members: 'maxMembers',
  zones: 'maxZones',
  passports: null
};

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  isEnabled() {
    return process.env.PLAN_ENFORCEMENT !== 'false';
  }

  async assertCanCreate(cooperativeId: string, resource: PlanResource) {
    if (!this.isEnabled()) return;

    const subscription = await this.prisma.cooperativeSubscription.findFirst({
      where: { cooperativeId, status: { in: ['ACTIVE', 'TRIAL'] } },
      orderBy: { createdAt: 'desc' },
      include: { plan: true }
    });
    if (!subscription?.plan) return;

    const limitField = LIMIT_FIELDS[resource];
    if (!limitField) return;
    const limit = subscription.plan[limitField];
    if (limit == null) return;

    const current = await this.countResource(cooperativeId, resource);
    if (current >= limit) {
      throw new ForbiddenException(
        `Gói ${subscription.plan.name} chỉ cho phép tối đa ${limit} ${RESOURCE_LABELS[resource]}. Vui lòng nâng cấp gói.`
      );
    }
  }

  private countResource(cooperativeId: string, resource: PlanResource) {
    switch (resource) {
      case 'products':
        return this.prisma.product.count({ where: { cooperativeId } });
      case 'members':
        return this.prisma.user.count({ where: { cooperativeId } });
      case 'zones':
        return this.prisma.zone.count({ where: { cooperativeId } });
      case 'passports':
        return this.prisma.traceabilityPassport.count({ where: { cooperativeId } });
      default:
        return Promise.resolve(0);
    }
  }
}
