import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleSlug, ZoneStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { CreateUserDto, UpdateUserDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PlanLimitsService } from '../../common/services/plan-limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { FarmerCertificationInput, FarmerSummary, summarizeFarmers } from './farmer-summary';

const HTX_ASSIGNABLE_ROLES: RoleSlug[] = [RoleSlug.MEMBER_HTX, RoleSlug.FARMER, RoleSlug.BUYER];
const ROLES_REQUIRING_COOPERATIVE: RoleSlug[] = [RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER];

type FarmerHarvestAggregate = {
  zoneId: string;
  seasonId: string | null;
  seasonName: string | null;
  seasonStartDate: Date | null;
  unit: string;
  quantity: Prisma.Decimal;
  harvestCount: number;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService,
    private readonly planLimits: PlanLimitsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.UserWhereInput = {};
    const cooperativeId = query.cooperativeId ? String(query.cooperativeId) : undefined;

    if (!isSuperAdmin(user)) {
      where.cooperativeId = requireTenant(user, cooperativeId);
    } else if (cooperativeId) {
      where.cooperativeId = cooperativeId;
    }
    if (query.search) {
      where.OR = [
        { email: { contains: String(query.search), mode: 'insensitive' } },
        { fullName: { contains: String(query.search), mode: 'insensitive' } },
        { phone: { contains: String(query.search), mode: 'insensitive' } }
      ];
    }
    if (query.role) {
      where.roles = { some: { role: { slug: String(query.role) as RoleSlug } } };
    }
    if (query.status) {
      where.status = String(query.status) as Prisma.EnumUserStatusFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: this.includeRoles(),
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.user.count({ where })
    ]);

    const summaries = await this.buildFarmerSummaries(data);
    return paginated(data.map((item) => this.serialize(item, summaries.get(item.id))), total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const found = await this.prisma.user.findUnique({
      where: { id },
      include: this.includeRoles()
    });
    if (!found) throw new NotFoundException('Không tìm thấy tài khoản');
    if (!isSuperAdmin(user) && found.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem tài khoản HTX khác');
    }
    const summaries = await this.buildFarmerSummaries([found]);
    return this.serialize(found, summaries.get(found.id));
  }

  async publicFarmer(id: string) {
    const farmer = await this.prisma.user.findUnique({ where: { id }, include: this.includeRoles() });
    const hasFarmerRole = farmer?.roles.some((item) => item.role.slug === RoleSlug.FARMER) ?? false;
    if (
      !farmer ||
      farmer.status !== 'ACTIVE' ||
      !hasFarmerRole ||
      !farmer.cooperative ||
      farmer.cooperative.status !== 'ACTIVE' ||
      (farmer.farmerProfile && (
        farmer.farmerProfile.status !== 'ACTIVE' ||
        farmer.farmerProfile.cooperativeId !== farmer.cooperativeId
      ))
    ) {
      throw new NotFoundException('Không tìm thấy hồ sơ nông hộ đang hoạt động');
    }

    const summaries = await this.buildFarmerSummaries([farmer], true);
    const baseUrl = (process.env.PASSPORT_PUBLIC_URL || process.env.FRONTEND_URL || 'https://hochieunongnghiep.com').replace(/\/+$/, '');
    const publicUrl = `${baseUrl}/nong-ho/${encodeURIComponent(farmer.id)}`;
    const qrDataUrl = await QRCode.toDataURL(publicUrl, { errorCorrectionLevel: 'M', margin: 1, width: 512 });

    return {
      publicUrl,
      qrDataUrl,
      farmer: {
        fullName: farmer.fullName,
        cooperative: { name: farmer.cooperative.name, code: farmer.cooperative.code },
        summary: summaries.get(farmer.id) ?? null
      }
    };
  }

  async create(actor: AuthUser, dto: CreateUserDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email đã tồn tại');

    const roleSlug = dto.role ?? RoleSlug.MEMBER_HTX;
    if (!isSuperAdmin(actor) && !HTX_ASSIGNABLE_ROLES.includes(roleSlug)) {
      throw new ForbiddenException('Admin HTX chỉ được tạo thành viên, nông dân hoặc người mua');
    }
    const cooperativeId = requireTenant(actor, dto.cooperativeId);
    if (ROLES_REQUIRING_COOPERATIVE.includes(roleSlug) && !cooperativeId) {
      throw new BadRequestException('Tài khoản HTX cần được gán HTX');
    }
    if (!isSuperAdmin(actor) && !cooperativeId) {
      throw new ForbiddenException('Thiếu HTX');
    }
    if (dto.assignedZoneIds !== undefined && roleSlug !== RoleSlug.FARMER) {
      throw new BadRequestException('Chỉ tài khoản nông dân mới được gán vùng trồng');
    }
    if (cooperativeId && ROLES_REQUIRING_COOPERATIVE.includes(roleSlug)) {
      await this.planLimits.assertCanCreate(cooperativeId, 'members');
    }

    const role = await this.prisma.role.findUniqueOrThrow({ where: { slug: roleSlug } });
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const created = await this.prisma.$transaction(async (tx) => {
      if (dto.assignedZoneIds !== undefined && cooperativeId) {
        await this.assertAssignableZones(cooperativeId, dto.assignedZoneIds, [], tx);
      }
      const user = await tx.user.create({
        data: {
          email,
          fullName: dto.fullName,
          phone: dto.phone,
          passwordHash,
          status: dto.status ?? 'ACTIVE',
          cooperativeId: cooperativeId ?? dto.cooperativeId,
          roles: { create: { roleId: role.id } }
        },
        include: this.includeRoles()
      });

      if (user.cooperativeId) {
        await tx.cooperativeMember.upsert({
          where: { cooperativeId_userId: { cooperativeId: user.cooperativeId, userId: user.id } },
          create: { cooperativeId: user.cooperativeId, userId: user.id, title: roleSlug, status: 'ACTIVE' },
          update: { status: 'ACTIVE', title: roleSlug }
        });
      }

      if (roleSlug === RoleSlug.FARMER && user.cooperativeId) {
        const profile = await tx.farmerProfile.upsert({
          where: { userId: user.id },
          create: { userId: user.id, cooperativeId: user.cooperativeId, status: 'ACTIVE' },
          update: { cooperativeId: user.cooperativeId, status: 'ACTIVE' }
        });
        if (dto.assignedZoneIds?.length) {
          await tx.farmerZoneAssignment.createMany({
            data: dto.assignedZoneIds.map((zoneId) => ({ farmerProfileId: profile.id, zoneId }))
          });
        }
      }

      return tx.user.findUniqueOrThrow({ where: { id: user.id }, include: this.includeRoles() });
    });

    await this.audit.record({
      user: actor,
      action: 'users.create',
      entity: 'User',
      entityId: created.id,
      cooperativeId: created.cooperativeId,
      metadata: { role: roleSlug, assignedZoneCount: dto.assignedZoneIds?.length ?? 0 }
    });

    const summaries = await this.buildFarmerSummaries([created]);
    return this.serialize(created, summaries.get(created.id));
  }

  async update(actor: AuthUser, id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id }, include: this.includeRoles() });
    if (!existing) throw new NotFoundException('Không tìm thấy tài khoản');
    if (!isSuperAdmin(actor) && existing.cooperativeId !== actor.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem tài khoản HTX khác');
    }
    if (!isSuperAdmin(actor) && dto.roles?.some((role) => !HTX_ASSIGNABLE_ROLES.includes(role))) {
      throw new ForbiddenException('Admin HTX chỉ được gán vai trò trong HTX');
    }

    const cooperativeId = dto.cooperativeId === undefined
      ? existing.cooperativeId
      : requireTenant(actor, dto.cooperativeId ?? null);
    const currentRoles = existing.roles.map((item) => item.role.slug);
    const nextRoles = dto.roles?.length ? dto.roles : currentRoles;
    const remainsFarmer = nextRoles.includes(RoleSlug.FARMER);
    const cooperativeChanged = cooperativeId !== existing.cooperativeId;

    if (nextRoles.some((role) => ROLES_REQUIRING_COOPERATIVE.includes(role)) && !cooperativeId) {
      throw new BadRequestException('Tài khoản HTX cần được gán HTX');
    }
    if (dto.assignedZoneIds !== undefined && !remainsFarmer) {
      throw new BadRequestException('Chỉ tài khoản nông dân mới được gán vùng trồng');
    }
    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 12) : undefined;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.assignedZoneIds !== undefined && cooperativeId) {
        const existingZoneIds = existing.farmerProfile?.cooperativeId === existing.cooperativeId
          ? existing.farmerProfile.zoneAssignments.map((item) => item.zoneId)
          : [];
        await this.assertAssignableZones(cooperativeId, dto.assignedZoneIds, existingZoneIds, tx);
      }
      const user = await tx.user.update({
        where: { id },
        data: {
          email: dto.email?.toLowerCase(),
          fullName: dto.fullName,
          phone: dto.phone,
          passwordHash,
          status: dto.status,
          cooperativeId: dto.cooperativeId === undefined ? undefined : cooperativeId
        }
      });

      if (dto.roles?.length) {
        const roles = await tx.role.findMany({ where: { slug: { in: dto.roles } } });
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({
          data: roles.map((role) => ({ userId: id, roleId: role.id })),
          skipDuplicates: true
        });
      }

      if (remainsFarmer && user.cooperativeId) {
        const profile = await tx.farmerProfile.upsert({
          where: { userId: id },
          create: { userId: id, cooperativeId: user.cooperativeId, status: 'ACTIVE' },
          update: { cooperativeId: user.cooperativeId }
        });

        if (dto.assignedZoneIds !== undefined || cooperativeChanged) {
          await tx.farmerZoneAssignment.deleteMany({ where: { farmerProfileId: profile.id } });
          if (dto.assignedZoneIds?.length) {
            await tx.farmerZoneAssignment.createMany({
              data: dto.assignedZoneIds.map((zoneId) => ({ farmerProfileId: profile.id, zoneId }))
            });
          }
        }
      } else if (!remainsFarmer && existing.farmerProfile) {
        await tx.farmerZoneAssignment.deleteMany({ where: { farmerProfileId: existing.farmerProfile.id } });
      }

      return tx.user.findUniqueOrThrow({ where: { id }, include: this.includeRoles() });
    });

    await this.audit.record({
      user: actor,
      action: 'users.update',
      entity: 'User',
      entityId: id,
      cooperativeId: updated.cooperativeId,
      metadata: dto.assignedZoneIds === undefined ? undefined : { assignedZoneCount: dto.assignedZoneIds.length }
    });

    const summaries = await this.buildFarmerSummaries([updated]);
    return this.serialize(updated, summaries.get(updated.id));
  }

  async remove(actor: AuthUser, id: string) {
    const found = await this.get(actor, id);
    if (actor.id === id) {
      throw new BadRequestException('Không thể khóa chính tài khoản đang đăng nhập');
    }
    if (found.roles.includes(RoleSlug.SUPER_ADMIN)) {
      const superCount = await this.prisma.userRole.count({ where: { role: { slug: RoleSlug.SUPER_ADMIN } } });
      if (superCount <= 1) throw new BadRequestException('Không thể xóa Super Admin cuối cùng');
    }
    await this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } });
    await this.audit.record({
      user: actor,
      action: 'users.disable',
      entity: 'User',
      entityId: id,
      cooperativeId: found.cooperativeId
    });
    return { disabled: true };
  }

  async roles(user: AuthUser) {
    const where = isSuperAdmin(user) ? {} : { slug: { in: HTX_ASSIGNABLE_ROLES } };
    return this.prisma.role.findMany({ where, orderBy: { slug: 'asc' } });
  }

  private includeRoles() {
    return {
      roles: { include: { role: true } },
      cooperative: true,
      farmerProfile: { select: { id: true, cooperativeId: true, status: true, zoneAssignments: { select: { zoneId: true } } } }
    } as const;
  }

  private async assertAssignableZones(
    cooperativeId: string,
    zoneIds: string[],
    existingZoneIds: string[] = [],
    client: Pick<Prisma.TransactionClient, 'zone'> = this.prisma
  ) {
    if (zoneIds.length > 100 || new Set(zoneIds).size !== zoneIds.length) {
      throw new BadRequestException('Danh sách vùng trồng không hợp lệ');
    }
    if (zoneIds.length === 0) return;

    const zones = await client.zone.findMany({
      where: {
        id: { in: zoneIds },
        cooperativeId,
        ...(existingZoneIds.length
          ? { OR: [{ status: ZoneStatus.ACTIVE }, { id: { in: existingZoneIds } }] }
          : { status: ZoneStatus.ACTIVE })
      },
      select: { id: true }
    });
    if (zones.length !== zoneIds.length) {
      throw new BadRequestException('Chỉ có thể gán vùng đang hoạt động thuộc đúng HTX');
    }
  }

  private async buildFarmerSummaries(
    users: Prisma.UserGetPayload<{ include: ReturnType<UsersService['includeRoles']> }>[],
    publicOnly = false
  ) {
    const farmers = users.filter((user) => user.roles.some((item) => item.role.slug === RoleSlug.FARMER) && user.farmerProfile);
    if (!farmers.length) return new Map<string, FarmerSummary>();

    const assignments = farmers.map((user) => ({
      userId: user.id,
      zoneIds: user.farmerProfile?.cooperativeId === user.cooperativeId
        ? user.farmerProfile.zoneAssignments.map((item) => item.zoneId)
        : []
    }));
    const zoneIds = [...new Set(assignments.flatMap((assignment) => assignment.zoneIds))];
    const cooperativeIds = [...new Set(farmers.map((user) => user.cooperativeId).filter((id): id is string => Boolean(id)))];
    if (!zoneIds.length || !cooperativeIds.length) return summarizeFarmers(assignments, [], [], []);

    const zones = await this.prisma.zone.findMany({
      where: {
        id: { in: zoneIds },
        cooperativeId: { in: cooperativeIds },
        ...(publicOnly ? { status: ZoneStatus.ACTIVE, isPublic: true } : {})
      },
      select: { id: true, areaM2: true }
    });
    const visibleZoneIds = publicOnly ? zones.map((zone) => zone.id) : zoneIds;
    const visibleAssignments = publicOnly
      ? assignments.map((assignment) => ({ ...assignment, zoneIds: assignment.zoneIds.filter((zoneId) => visibleZoneIds.includes(zoneId)) }))
      : assignments;
    if (!visibleZoneIds.length) return summarizeFarmers(visibleAssignments, zones, [], []);

    const [treeGroups, harvestGroups, certificationRows] = await Promise.all([
      this.prisma.tree.groupBy({
        by: ['zoneId', 'cropTypeId', 'variety', 'status'],
        where: {
          zoneId: { in: visibleZoneIds },
          cooperativeId: { in: cooperativeIds },
          status: { not: 'INACTIVE' },
          ...(publicOnly ? { publicVerified: true } : {})
        },
        _count: { _all: true }
      }),
      this.prisma.$queryRaw<FarmerHarvestAggregate[]>(Prisma.sql`
        SELECT
          tree."zoneId" AS "zoneId",
          harvest."seasonId" AS "seasonId",
          season."name" AS "seasonName",
          season."startDate" AS "seasonStartDate",
          harvest."unit" AS "unit",
          SUM(harvest."quantity") AS "quantity",
          COUNT(*)::int AS "harvestCount"
        FROM "harvests" AS harvest
        INNER JOIN "trees" AS tree ON tree."id" = harvest."treeId"
        LEFT JOIN "production_seasons" AS season
          ON season."id" = harvest."seasonId"
         AND season."cooperativeId" = harvest."cooperativeId"
        WHERE harvest."status" <> 'ARCHIVED'
          AND harvest."quantity" > 0
          AND harvest."cooperativeId" IN (${Prisma.join(cooperativeIds)})
          AND tree."cooperativeId" IN (${Prisma.join(cooperativeIds)})
          AND tree."zoneId" IN (${Prisma.join(visibleZoneIds)})
          ${publicOnly ? Prisma.sql`AND tree."publicVerified" = TRUE` : Prisma.empty}
        GROUP BY tree."zoneId", harvest."seasonId", season."name", season."startDate", harvest."unit"
      `),
      this.prisma.certification.findMany({
        where: {
          cooperativeId: { in: cooperativeIds },
          zoneId: { in: visibleZoneIds },
          ...(publicOnly ? { isPublic: true } : {})
        },
        select: {
          id: true,
          zoneId: true,
          name: true,
          issuer: true,
          issuedAt: true,
          expiresAt: true,
          isPublic: true,
          zone: { select: { name: true } }
        },
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }]
      })
    ]);

    const cropTypeIds = [...new Set(treeGroups.map((item) => item.cropTypeId))];
    const cropTypes = cropTypeIds.length
      ? await this.prisma.cropType.findMany({ where: { id: { in: cropTypeIds } }, select: { id: true, name: true } })
      : [];
    const cropTypeNames = new Map(cropTypes.map((item) => [item.id, item.name]));
    const treeAggregates = treeGroups.map((item) => ({
      zoneId: item.zoneId,
      cropTypeId: item.cropTypeId,
      cropTypeName: cropTypeNames.get(item.cropTypeId) ?? 'Loại cây chưa xác định',
      variety: item.variety,
      status: item.status,
      treeCount: item._count._all
    }));

    const certifications: FarmerCertificationInput[] = certificationRows.map((item) => ({
      id: item.id,
      zoneId: item.zoneId,
      name: item.name,
      issuer: item.issuer,
      issuedAt: item.issuedAt,
      expiresAt: item.expiresAt,
      isPublic: item.isPublic,
      zoneName: item.zone?.name ?? null
    }));

    return summarizeFarmers(visibleAssignments, zones, treeAggregates, harvestGroups, certifications);
  }

  private serialize(
    user: Prisma.UserGetPayload<{ include: ReturnType<UsersService['includeRoles']> }>,
    farmerSummary?: FarmerSummary
  ) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      cooperativeId: user.cooperativeId,
      cooperative: user.cooperative
        ? {
            id: user.cooperative.id,
            name: user.cooperative.name,
            code: user.cooperative.code
          }
        : null,
      roles: user.roles.map((item) => item.role.slug),
      permissions: user.roles.flatMap((item) => item.role.permissions as string[]),
      farmerProfile: user.farmerProfile
        ? {
            assignedZoneIds: user.farmerProfile.cooperativeId === user.cooperativeId
              ? user.farmerProfile.zoneAssignments.map((item) => item.zoneId)
              : []
          }
        : null,
      farmerSummary: farmerSummary ?? null,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
