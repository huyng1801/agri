import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleSlug } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const HTX_ASSIGNABLE_ROLES: RoleSlug[] = [RoleSlug.MEMBER_HTX, RoleSlug.FARMER, RoleSlug.BUYER];
const ROLES_REQUIRING_COOPERATIVE: RoleSlug[] = [RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
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

    return paginated(data.map((item) => this.serialize(item)), total, page, limit);
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
    return this.serialize(found);
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

    const role = await this.prisma.role.findUniqueOrThrow({ where: { slug: roleSlug } });
    const created = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 12),
        status: dto.status ?? 'ACTIVE',
        cooperativeId: cooperativeId ?? dto.cooperativeId,
        roles: {
          create: {
            roleId: role.id
          }
        }
      },
      include: this.includeRoles()
    });

    if (created.cooperativeId) {
      await this.prisma.cooperativeMember.upsert({
        where: {
          cooperativeId_userId: {
            cooperativeId: created.cooperativeId,
            userId: created.id
          }
        },
        create: {
          cooperativeId: created.cooperativeId,
          userId: created.id,
          title: roleSlug,
          status: 'ACTIVE'
        },
        update: {
          status: 'ACTIVE',
          title: roleSlug
        }
      });
    }

    if (roleSlug === RoleSlug.FARMER && created.cooperativeId) {
      await this.prisma.farmerProfile.upsert({
        where: { userId: created.id },
        create: {
          userId: created.id,
          cooperativeId: created.cooperativeId,
          status: 'ACTIVE'
        },
        update: { status: 'ACTIVE' }
      });
    }

    await this.audit.record({
      user: actor,
      action: 'users.create',
      entity: 'User',
      entityId: created.id,
      cooperativeId: created.cooperativeId
    });

    return this.serialize(created);
  }

  async update(actor: AuthUser, id: string, dto: UpdateUserDto) {
    await this.get(actor, id);
    if (!isSuperAdmin(actor) && dto.roles?.some((role) => !HTX_ASSIGNABLE_ROLES.includes(role))) {
      throw new ForbiddenException('Admin HTX chỉ được gán vai trò trong HTX');
    }

    const cooperativeId =
      dto.cooperativeId === undefined ? undefined : requireTenant(actor, dto.cooperativeId ?? null);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email?.toLowerCase(),
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash: dto.password ? await bcrypt.hash(dto.password, 12) : undefined,
        status: dto.status,
        cooperativeId
      },
      include: this.includeRoles()
    });

    if (dto.roles?.length) {
      const roles = await this.prisma.role.findMany({ where: { slug: { in: dto.roles } } });
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({
        data: roles.map((role) => ({ userId: id, roleId: role.id })),
        skipDuplicates: true
      });
    }

    await this.audit.record({
      user: actor,
      action: 'users.update',
      entity: 'User',
      entityId: id,
      cooperativeId: updated.cooperativeId
    });

    return this.get(actor, id);
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
    return { roles: { include: { role: true } }, cooperative: true } as const;
  }

  private serialize(user: Prisma.UserGetPayload<{ include: ReturnType<UsersService['includeRoles']> }>) {
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
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
