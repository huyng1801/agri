import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FarmingActivityType, FarmingLogStatus, Prisma } from '@prisma/client';
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
    if (query.status) where.status = String(query.status) as FarmingLogStatus;
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { code: { contains: search, mode: 'insensitive' } } },
        { zone: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.farmingLog.findMany({
        where,
        include: {
          product: { include: { thumbnail: true } },
          zone: true,
          actor: { select: { id: true, fullName: true, email: true, phone: true } }
        },
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
      include: {
        product: { include: { thumbnail: true } },
        zone: true,
        actor: { select: { id: true, fullName: true, email: true, phone: true } }
      }
    });
    if (!log) throw new NotFoundException('Không tìm thấy nhật ký');
    if (!isSuperAdmin(user) && log.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem nhật ký HTX khác');
    }
    return log;
  }

  async create(user: AuthUser, dto: CreateFarmingLogDto) {
    if (dto.logDate > new Date()) throw new BadRequestException('Ngày nhật ký không được lớn hơn hiện tại');
    const product = await this.assertProduct(dto.productId);
    const cooperativeId = requireTenant(user, dto.cooperativeId ?? product.cooperativeId);
    if (product.cooperativeId !== cooperativeId) throw new BadRequestException('Sản phẩm không thuộc HTX');
    await this.assertZone(cooperativeId, dto.zoneId);
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
    if (dto.productId) {
      const product = await this.assertProduct(dto.productId);
      if (product.cooperativeId !== existing.cooperativeId) throw new BadRequestException('Sản phẩm không thuộc HTX');
    }
    await this.assertZone(existing.cooperativeId, dto.zoneId);
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

  private async assertProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  private async assertZone(cooperativeId: string, zoneId?: string) {
    if (!zoneId) return;
    const zone = await this.prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone || zone.cooperativeId !== cooperativeId) throw new BadRequestException('Vùng trồng không thuộc HTX');
  }
}
