import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FarmingActivityType, Prisma } from '@prisma/client';
import { CreateFarmingLogDto, UpdateFarmingLogDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FarmingLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.FarmingLogWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    if (query.productId) where.productId = String(query.productId);
    if (query.zoneId) where.zoneId = String(query.zoneId);
    if (query.activityType) where.activityType = String(query.activityType) as FarmingActivityType;
    const [data, total] = await Promise.all([
      this.prisma.farmingLog.findMany({
        where,
        include: { product: true, zone: true, actor: true },
        orderBy: { logDate: 'desc' },
        skip,
        take
      }),
      this.prisma.farmingLog.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const log = await this.prisma.farmingLog.findUnique({
      where: { id },
      include: { product: true, zone: true, actor: true }
    });
    if (!log) throw new NotFoundException('Không tìm thấy nhật ký');
    if (!isSuperAdmin(user) && log.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem nhật ký HTX khác');
    }
    return log;
  }

  async create(user: AuthUser, dto: CreateFarmingLogDto) {
    if (dto.logDate > new Date()) throw new BadRequestException('Ngày nhật ký không được lớn hơn hiện tại');
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    const cooperativeId = requireTenant(user, dto.cooperativeId ?? product.cooperativeId);
    if (product.cooperativeId !== cooperativeId) throw new BadRequestException('Sản phẩm không thuộc HTX');
    if (dto.zoneId) {
      const zone = await this.prisma.zone.findUnique({ where: { id: dto.zoneId } });
      if (!zone || zone.cooperativeId !== cooperativeId) throw new BadRequestException('Vùng trồng không thuộc HTX');
    }
    const created = await this.prisma.farmingLog.create({
      data: {
        cooperativeId,
        productId: dto.productId,
        zoneId: dto.zoneId,
        actorId: user.id,
        logDate: dto.logDate,
        activityType: dto.activityType,
        description: dto.description,
        inputMaterialsJson: (dto.inputMaterialsJson ?? []) as Prisma.InputJsonValue,
        imagesJson: (dto.imagesJson ?? []) as Prisma.InputJsonValue,
        status: dto.status ?? 'PUBLISHED'
      },
      include: { product: true, zone: true }
    });
    await this.audit.record({
      user,
      action: 'farming_logs.create',
      entity: 'FarmingLog',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateFarmingLogDto) {
    const existing = await this.get(user, id);
    if (dto.logDate && dto.logDate > new Date()) {
      throw new BadRequestException('Ngày nhật ký không được lớn hơn hiện tại');
    }
    const updated = await this.prisma.farmingLog.update({
      where: { id },
      data: {
        productId: dto.productId,
        zoneId: dto.zoneId,
        logDate: dto.logDate,
        activityType: dto.activityType,
        description: dto.description,
        inputMaterialsJson: dto.inputMaterialsJson as Prisma.InputJsonValue | undefined,
        imagesJson: dto.imagesJson as Prisma.InputJsonValue | undefined,
        status: dto.status
      }
    });
    await this.audit.record({
      user,
      action: 'farming_logs.update',
      entity: 'FarmingLog',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.get(user, id);
    const updated = await this.prisma.farmingLog.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
    await this.audit.record({
      user,
      action: 'farming_logs.archive',
      entity: 'FarmingLog',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }
}
