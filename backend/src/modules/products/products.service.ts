import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateCategoryDto, CreateProductDto, UpdateProductDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slugify';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.ProductWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    if (query.search) {
      where.OR = [
        { name: { contains: String(query.search), mode: 'insensitive' } },
        { code: { contains: String(query.search), mode: 'insensitive' } },
        { slug: { contains: String(query.search), mode: 'insensitive' } }
      ];
    }
    if (query.status) where.status = String(query.status) as ProductStatus;
    if (query.categoryId) where.categoryId = String(query.categoryId);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          cooperative: true,
          zone: true,
          passports: { orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { farmingLogs: true, passports: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.product.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async publicList(query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.ProductWhereInput = { status: 'PUBLISHED' };
    if (query.search) {
      where.OR = [{ name: { contains: String(query.search), mode: 'insensitive' } }];
    }
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { cooperative: true, category: true, zone: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.product.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        cooperative: true,
        zone: true,
        farmingLogs: { orderBy: { logDate: 'desc' }, take: 30 },
        passports: { orderBy: { createdAt: 'desc' } },
        certifications: true
      }
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    if (!isSuperAdmin(user) && product.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem sản phẩm HTX khác');
    }
    return product;
  }

  async create(user: AuthUser, dto: CreateProductDto) {
    const cooperativeId = requireTenant(user, dto.cooperativeId);
    if (!cooperativeId) throw new BadRequestException('Thiếu cooperativeId');
    await this.validateRelations(cooperativeId, dto.zoneId, dto.farmerId);
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const created = await this.prisma.product.create({
      data: {
        cooperativeId,
        categoryId: dto.categoryId,
        code: dto.code,
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        unit: dto.unit,
        status: dto.status ?? 'DRAFT',
        thumbnailFileId: dto.thumbnailFileId,
        zoneId: dto.zoneId,
        farmerId: dto.farmerId,
        packagingInfo: dto.packagingInfo,
        specification: dto.specification,
        createdBy: user.id
      },
      include: { category: true, zone: true }
    });
    await this.audit.record({
      user,
      action: 'products.create',
      entity: 'Product',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateProductDto) {
    const existing = await this.get(user, id);
    const cooperativeId = existing.cooperativeId;
    await this.validateRelations(cooperativeId, dto.zoneId, dto.farmerId);
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        code: dto.code,
        name: dto.name,
        slug: dto.slug ? slugify(dto.slug) : dto.name ? slugify(dto.name) : undefined,
        description: dto.description,
        price: dto.price,
        unit: dto.unit,
        status: dto.status,
        thumbnailFileId: dto.thumbnailFileId,
        zoneId: dto.zoneId,
        farmerId: dto.farmerId,
        packagingInfo: dto.packagingInfo,
        specification: dto.specification
      }
    });
    await this.audit.record({
      user,
      action: 'products.update',
      entity: 'Product',
      entityId: id,
      cooperativeId
    });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.get(user, id);
    const updated = await this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
    await this.audit.record({
      user,
      action: 'products.archive',
      entity: 'Product',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }

  async categories(user: AuthUser, query: Record<string, unknown>) {
    const cooperativeId = isSuperAdmin(user) ? (query.cooperativeId ? String(query.cooperativeId) : undefined) : user.cooperativeId;
    return this.prisma.productCategory.findMany({
      where: {
        OR: [{ cooperativeId }, { cooperativeId: null }]
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(user: AuthUser, dto: CreateCategoryDto) {
    const cooperativeId = dto.cooperativeId ? requireTenant(user, dto.cooperativeId) : null;
    const created = await this.prisma.productCategory.create({
      data: {
        cooperativeId,
        name: dto.name,
        slug: slugify(dto.slug),
        description: dto.description
      }
    });
    await this.audit.record({
      user,
      action: 'product_categories.create',
      entity: 'ProductCategory',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  private async validateRelations(cooperativeId: string, zoneId?: string, farmerId?: string) {
    if (zoneId) {
      const zone = await this.prisma.zone.findUnique({ where: { id: zoneId } });
      if (!zone || zone.cooperativeId !== cooperativeId) throw new BadRequestException('Vùng trồng không thuộc HTX');
    }
    if (farmerId) {
      const farmer = await this.prisma.user.findUnique({ where: { id: farmerId } });
      if (!farmer || farmer.cooperativeId !== cooperativeId) throw new BadRequestException('Nông dân không thuộc HTX');
    }
  }
}
