import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleSlug } from '@prisma/client';
import { AssignAdminDto, CreateCooperativeDto, UpdateCooperativeDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CooperativesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.CooperativeWhereInput = {};
    if (!isSuperAdmin(user)) {
      where.id = requireTenant(user);
    }
    if (query.search) {
      where.OR = [
        { name: { contains: String(query.search), mode: 'insensitive' } },
        { code: { contains: String(query.search), mode: 'insensitive' } },
        { taxCode: { contains: String(query.search), mode: 'insensitive' } }
      ];
    }
    if (query.status) where.status = String(query.status) as Prisma.EnumCooperativeStatusFilter;

    const [data, total] = await Promise.all([
      this.prisma.cooperative.findMany({
        where,
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: { users: true, products: true, zones: true, passports: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.cooperative.count({ where })
    ]);

    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    if (!isSuperAdmin(user)) requireTenant(user, id);
    const found = await this.prisma.cooperative.findUnique({
      where: { id },
      include: {
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { users: true, products: true, zones: true, farmingLogs: true, passports: true } }
      }
    });
    if (!found) throw new NotFoundException('Không tìm thấy HTX');
    return found;
  }

  async create(user: AuthUser, dto: CreateCooperativeDto) {
    if (!isSuperAdmin(user)) {
      throw new ForbiddenException('Chỉ Super Admin được tạo HTX');
    }
    const existing = await this.prisma.cooperative.findFirst({
      where: {
        OR: [{ code: dto.code }, ...(dto.taxCode ? [{ taxCode: dto.taxCode }] : [])]
      }
    });
    if (existing) throw new BadRequestException('Mã HTX hoặc mã số thuế đã tồn tại');

    const created = await this.prisma.cooperative.create({
      data: {
        ...dto,
        status: dto.status ?? 'ACTIVE'
      }
    });
    await this.audit.record({
      user,
      action: 'cooperatives.create',
      entity: 'Cooperative',
      entityId: created.id,
      cooperativeId: created.id
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateCooperativeDto) {
    await this.get(user, id);
    if (!isSuperAdmin(user) && dto.status && dto.status !== 'ACTIVE') {
      throw new ForbiddenException('Admin HTX không được suspend/archived HTX');
    }
    const updated = await this.prisma.cooperative.update({
      where: { id },
      data: dto
    });
    await this.audit.record({
      user,
      action: 'cooperatives.update',
      entity: 'Cooperative',
      entityId: id,
      cooperativeId: id
    });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    if (!isSuperAdmin(user)) throw new ForbiddenException('Chỉ Super Admin được ngừng hoạt động HTX');
    await this.get(user, id);
    const updated = await this.prisma.cooperative.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
    await this.audit.record({
      user,
      action: 'cooperatives.archive',
      entity: 'Cooperative',
      entityId: id,
      cooperativeId: id
    });
    return updated;
  }

  async assignAdmin(user: AuthUser, id: string, dto: AssignAdminDto) {
    if (!isSuperAdmin(user)) throw new ForbiddenException('Chỉ Super Admin được gán Admin HTX');
    const cooperative = await this.get(user, id);
    const target = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!target) throw new NotFoundException('Không tìm thấy tài khoản');
    const role = await this.prisma.role.findUniqueOrThrow({ where: { slug: RoleSlug.ADMIN_HTX } });
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        cooperativeId: id,
        roles: {
          deleteMany: {},
          create: { roleId: role.id }
        }
      }
    });
    await this.prisma.cooperativeMember.upsert({
      where: { cooperativeId_userId: { cooperativeId: id, userId: dto.userId } },
      create: { cooperativeId: id, userId: dto.userId, title: RoleSlug.ADMIN_HTX },
      update: { status: 'ACTIVE', title: RoleSlug.ADMIN_HTX }
    });
    await this.audit.record({
      user,
      action: 'cooperatives.assign_admin',
      entity: 'Cooperative',
      entityId: id,
      cooperativeId: id,
      metadata: { userId: dto.userId }
    });
    return { cooperative, userId: dto.userId, role: RoleSlug.ADMIN_HTX };
  }

  async stats(user: AuthUser, id: string) {
    await this.get(user, id);
    const [products, zones, logs, passports, members, unpaidInvoices] = await Promise.all([
      this.prisma.product.count({ where: { cooperativeId: id } }),
      this.prisma.zone.count({ where: { cooperativeId: id } }),
      this.prisma.farmingLog.count({ where: { cooperativeId: id } }),
      this.prisma.traceabilityPassport.count({ where: { cooperativeId: id } }),
      this.prisma.cooperativeMember.count({ where: { cooperativeId: id, status: 'ACTIVE' } }),
      this.prisma.subscriptionInvoice.count({ where: { cooperativeId: id, status: { in: ['UNPAID', 'OVERDUE'] } } })
    ]);
    return { products, zones, logs, passports, members, unpaidInvoices };
  }
}
