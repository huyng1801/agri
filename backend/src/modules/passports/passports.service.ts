import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PassportStatus, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import { CreatePassportDto, UpdatePassportDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PassportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.TraceabilityPassportWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    if (query.productId) where.productId = String(query.productId);
    if (query.status) where.status = String(query.status) as PassportStatus;
    const [data, total] = await Promise.all([
      this.prisma.traceabilityPassport.findMany({
        where,
        include: { product: { include: { thumbnail: true, zone: true } }, cooperative: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.traceabilityPassport.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async get(user: AuthUser, id: string) {
    const passport = await this.prisma.traceabilityPassport.findUnique({
      where: { id },
      include: { product: { include: { thumbnail: true, zone: true } }, cooperative: true }
    });
    if (!passport) throw new NotFoundException('Không tìm thấy QR Passport');
    if (!isSuperAdmin(user) && passport.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem passport HTX khác');
    }
    return passport;
  }

  async create(user: AuthUser, dto: CreatePassportDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    const cooperativeId = requireTenant(user, dto.cooperativeId ?? product.cooperativeId);
    if (product.cooperativeId !== cooperativeId) throw new BadRequestException('Sản phẩm không thuộc HTX');
    const status = dto.status ?? 'PUBLISHED';
    this.assertPublishableProduct(product.status, status);
    this.assertExpiration(dto.expiredAt, status);

    const code = `AP-${nanoid(10).toUpperCase()}`;
    const publicSlug = `${product.slug}-${code.toLowerCase()}`;
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/passport/${code}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 512
    });
    const now = new Date();
    const created = await this.prisma.traceabilityPassport.create({
      data: {
        cooperativeId,
        productId: dto.productId,
        passportCode: code,
        publicSlug,
        qrDataUrl,
        status,
        publishedAt: status === 'PUBLISHED' ? now : null,
        expiredAt: dto.expiredAt
      },
      include: { product: { include: { thumbnail: true, zone: true } }, cooperative: true }
    });
    await this.audit.record({
      user,
      action: 'passports.create',
      entity: 'TraceabilityPassport',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async update(user: AuthUser, id: string, dto: UpdatePassportDto) {
    const existing = await this.get(user, id);
    const nextStatus = dto.status ?? existing.status;
    const nextExpiredAt = dto.expiredAt ?? existing.expiredAt ?? undefined;
    this.assertPublishableProduct(existing.product.status, nextStatus);
    this.assertExpiration(nextExpiredAt, nextStatus);
    const updated = await this.prisma.traceabilityPassport.update({
      where: { id },
      data: {
        status: dto.status,
        publishedAt: dto.status === 'PUBLISHED' && existing.status !== 'PUBLISHED' ? new Date() : undefined,
        expiredAt: dto.expiredAt
      },
      include: { product: { include: { thumbnail: true, zone: true } }, cooperative: true }
    });
    await this.audit.record({
      user,
      action: 'passports.update',
      entity: 'TraceabilityPassport',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.get(user, id);
    const updated = await this.prisma.traceabilityPassport.update({ where: { id }, data: { status: 'HIDDEN' } });
    await this.audit.record({
      user,
      action: 'passports.hide',
      entity: 'TraceabilityPassport',
      entityId: id,
      cooperativeId: existing.cooperativeId
    });
    return updated;
  }

  async publicPassport(code: string) {
    const passport = await this.prisma.traceabilityPassport.findFirst({
      where: {
        AND: [
          { OR: [{ passportCode: code }, { publicSlug: code }] },
          { OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }] }
        ],
        status: 'PUBLISHED'
      },
      include: {
        cooperative: true,
        product: {
          include: {
            category: true,
            zone: true,
            thumbnail: true,
            certifications: {
              where: { isPublic: true },
              orderBy: { createdAt: 'desc' },
              include: {
                file: { select: { id: true, publicUrl: true, objectKey: true, mimeType: true } }
              }
            },
            farmingLogs: {
              where: { status: 'PUBLISHED' },
              orderBy: { logDate: 'asc' },
              take: 80,
              include: {
                actor: { select: { id: true, fullName: true } },
                zone: true
              }
            }
          }
        }
      }
    });
    if (!passport || passport.product.status !== 'PUBLISHED') {
      throw new NotFoundException('Passport không tồn tại hoặc chưa được công khai');
    }
    await this.prisma.traceabilityPassport.update({
      where: { id: passport.id },
      data: { viewCount: { increment: 1 } }
    });
    const productZone = passport.product.zone?.isPublic === false ? null : passport.product.zone;
    const farmingLogs = passport.product.farmingLogs.map((log) => ({
      ...log,
      zone: log.zone?.isPublic === false ? null : log.zone
    }));
    return {
      ...passport,
      product: {
        ...passport.product,
        zone: productZone,
        farmingLogs
      },
      verified: true,
      publicUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/passport/${passport.passportCode}`
    };
  }

  private assertPublishableProduct(productStatus: string, passportStatus?: PassportStatus) {
    if (passportStatus === 'PUBLISHED' && productStatus !== 'PUBLISHED') {
      throw new BadRequestException('Chỉ tạo passport public cho sản phẩm đã publish');
    }
  }

  private assertExpiration(expiredAt?: Date, passportStatus?: PassportStatus) {
    if (passportStatus === 'PUBLISHED' && expiredAt && expiredAt <= new Date()) {
      throw new BadRequestException('Ngày hết hạn passport public phải lớn hơn hiện tại');
    }
  }
}
