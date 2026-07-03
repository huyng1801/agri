import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ZoneStatus } from '@prisma/client';
import { CreateZoneDto, UpdateZoneDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.ZoneWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    if (query.search) {
      where.OR = [
        { name: { contains: String(query.search), mode: 'insensitive' } },
        { code: { contains: String(query.search), mode: 'insensitive' } }
      ];
    }
    if (query.status) where.status = String(query.status) as ZoneStatus;
    const [data, total] = await Promise.all([
      this.prisma.zone.findMany({
        where,
        include: { cooperative: true, _count: { select: { products: true, farmingLogs: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.zone.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: { products: true, farmingLogs: { orderBy: { logDate: 'desc' }, take: 20 } }
    });
    if (!zone) throw new NotFoundException('Không tìm thấy vùng trồng');
    if (!isSuperAdmin(user) && zone.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem vùng trồng HTX khác');
    }
    return zone;
  }

  async create(user: AuthUser, dto: CreateZoneDto) {
    const cooperativeId = requireTenant(user, dto.cooperativeId);
    const created = await this.prisma.zone.create({
      data: {
        cooperativeId: cooperativeId!,
        name: dto.name,
        code: dto.code,
        address: dto.address,
        areaM2: dto.areaM2,
        geojson: dto.geojson as Prisma.InputJsonValue | undefined,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status ?? 'ACTIVE'
      }
    });
    await this.audit.record({
      user,
      action: 'zones.create',
      entity: 'Zone',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateZoneDto) {
    const existing = await this.get(user, id);
    const updated = await this.prisma.zone.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        address: dto.address,
        areaM2: dto.areaM2,
        geojson: dto.geojson as Prisma.InputJsonValue | undefined,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.status
      }
    });
    await this.audit.record({
      user,
      action: 'zones.update',
      entity: 'Zone',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.get(user, id);
    const updated = await this.prisma.zone.update({ where: { id }, data: { status: 'ARCHIVED' } });
    await this.audit.record({
      user,
      action: 'zones.archive',
      entity: 'Zone',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }
}
