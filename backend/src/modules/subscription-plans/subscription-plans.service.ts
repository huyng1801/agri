import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.SubscriptionPlanWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: String(query.search), mode: 'insensitive' } },
        { slug: { contains: String(query.search), mode: 'insensitive' } }
      ];
    }
    if (query.isActive !== undefined) where.isActive = String(query.isActive) === 'true';
    const [data, total] = await Promise.all([
      this.prisma.subscriptionPlan.findMany({ where, orderBy: { priceMonthly: 'asc' }, skip, take }),
      this.prisma.subscriptionPlan.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(id: string) {
    const found = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy gói dịch vụ');
    return found;
  }

  async create(user: AuthUser, dto: CreateSubscriptionPlanDto) {
    const existing = await this.prisma.subscriptionPlan.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug gói đã tồn tại');
    const created = await this.prisma.subscriptionPlan.create({
      data: {
        ...dto,
        featuresJson: dto.featuresJson ?? [],
        isActive: dto.isActive ?? true
      }
    });
    await this.audit.record({ user, action: 'subscription_plans.create', entity: 'SubscriptionPlan', entityId: created.id });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateSubscriptionPlanDto) {
    await this.get(id);
    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto
    });
    await this.audit.record({ user, action: 'subscription_plans.update', entity: 'SubscriptionPlan', entityId: id });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    await this.get(id);
    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false }
    });
    await this.audit.record({ user, action: 'subscription_plans.disable', entity: 'SubscriptionPlan', entityId: id });
    return updated;
  }
}
