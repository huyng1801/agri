import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCertificationDto, UpdateCertificationDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.CertificationWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    if (query.search) {
      const search = String(query.search);
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { issuer: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { zone: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (query.productId) where.productId = String(query.productId);
    if (query.zoneId) where.zoneId = String(query.zoneId);
    const isPublic = this.parseBoolean(query.isPublic);
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [data, total] = await Promise.all([
      this.prisma.certification.findMany({
        where,
        include: this.certificationInclude(),
        orderBy: [{ expiresAt: 'asc' }, { createdAt: 'desc' }],
        skip,
        take
      }),
      this.prisma.certification.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const certification = await this.prisma.certification.findUnique({
      where: { id },
      include: this.certificationInclude()
    });
    if (!certification) throw new NotFoundException('Không tìm thấy chứng nhận');
    if (!isSuperAdmin(user) && certification.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem chứng nhận HTX khác');
    }
    return certification;
  }

  async create(user: AuthUser, dto: CreateCertificationDto) {
    const cooperativeId = requireTenant(user, dto.cooperativeId);
    if (!cooperativeId) throw new BadRequestException('Thiếu cooperativeId');
    await this.assertRelations(cooperativeId, dto.productId, dto.zoneId);
    await this.assertFile(cooperativeId, dto.fileId);
    this.assertDates(dto.issuedAt, dto.expiresAt);

    const created = await this.prisma.certification.create({
      data: {
        cooperativeId,
        productId: dto.productId,
        zoneId: dto.zoneId,
        name: dto.name,
        issuer: dto.issuer,
        issuedAt: dto.issuedAt,
        expiresAt: dto.expiresAt,
        fileId: dto.fileId,
        isPublic: dto.isPublic ?? true,
        metadataJson: (dto.metadataJson ?? {}) as Prisma.InputJsonValue
      },
      include: this.certificationInclude()
    });
    await this.audit.record({
      user,
      action: 'certifications.create',
      entity: 'Certification',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdateCertificationDto) {
    const existing = await this.get(user, id);
    await this.assertRelations(existing.cooperativeId, dto.productId, dto.zoneId);
    await this.assertFile(existing.cooperativeId, dto.fileId);
    this.assertDates(dto.issuedAt, dto.expiresAt);

    const updated = await this.prisma.certification.update({
      where: { id },
      data: {
        productId: dto.productId,
        zoneId: dto.zoneId,
        name: dto.name,
        issuer: dto.issuer,
        issuedAt: dto.issuedAt,
        expiresAt: dto.expiresAt,
        fileId: dto.fileId,
        isPublic: dto.isPublic,
        metadataJson: dto.metadataJson ? (dto.metadataJson as Prisma.InputJsonValue) : undefined
      },
      include: this.certificationInclude()
    });
    await this.audit.record({
      user,
      action: 'certifications.update',
      entity: 'Certification',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.get(user, id);
    await this.prisma.certification.delete({ where: { id } });
    await this.audit.record({
      user,
      action: 'certifications.delete',
      entity: 'Certification',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return { deleted: true };
  }

  private certificationInclude(): Prisma.CertificationInclude {
    return {
      cooperative: { select: { id: true, name: true, code: true } },
      product: { select: { id: true, code: true, name: true, slug: true, status: true } },
      zone: { select: { id: true, code: true, name: true, status: true } },
      file: {
        select: {
          id: true,
          objectKey: true,
          publicUrl: true,
          mimeType: true,
          sizeBytes: true,
          visibility: true
        }
      }
    };
  }

  private async assertRelations(cooperativeId: string, productId?: string, zoneId?: string) {
    if (productId) {
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product || product.cooperativeId !== cooperativeId) {
        throw new BadRequestException('Sản phẩm không thuộc HTX');
      }
    }
    if (zoneId) {
      const zone = await this.prisma.zone.findUnique({ where: { id: zoneId } });
      if (!zone || zone.cooperativeId !== cooperativeId) {
        throw new BadRequestException('Vùng trồng không thuộc HTX');
      }
    }
  }

  private async assertFile(cooperativeId: string, fileId?: string) {
    if (!fileId) return;
    const file = await this.prisma.fileAsset.findUnique({ where: { id: fileId } });
    if (!file) throw new BadRequestException('Tệp chứng nhận không tồn tại');
    if (file.cooperativeId && file.cooperativeId !== cooperativeId) {
      throw new BadRequestException('Tệp chứng nhận không thuộc HTX');
    }
    const allowed = file.mimeType === 'application/pdf' || file.mimeType.startsWith('image/');
    if (!allowed) {
      throw new BadRequestException('Tệp chứng nhận phải là PDF hoặc ảnh');
    }
  }

  private assertDates(issuedAt?: Date, expiresAt?: Date) {
    if (issuedAt && expiresAt && expiresAt < issuedAt) {
      throw new BadRequestException('Ngày hết hạn phải lớn hơn hoặc bằng ngày cấp');
    }
  }

  private parseBoolean(value: unknown) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return undefined;
  }
}
