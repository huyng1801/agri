import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileVisibility, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { ConfirmUploadDto, PresignUploadDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { paginated, parsePagination } from '../../common/utils/pagination';
import { isSuperAdmin, requireTenant, tenantWhere } from '../../common/utils/tenant';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  async list(user: AuthUser, query: Record<string, unknown>) {
    const { page, limit, skip, take } = parsePagination(query);
    const where: Prisma.FileAssetWhereInput = {
      ...tenantWhere(user, query.cooperativeId ? String(query.cooperativeId) : undefined)
    };
    const [data, total] = await Promise.all([
      this.prisma.fileAsset.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.fileAsset.count({ where })
    ]);
    return paginated(data, total, page, limit);
  }

  async presign(user: AuthUser, dto: PresignUploadDto) {
    this.validateFile(dto.mimeType, dto.sizeBytes);
    const cooperativeId = requireTenant(user, dto.cooperativeId);
    const bucket = process.env.R2_BUCKET || 'agri-passport';
    const objectKey = this.objectKey(cooperativeId, dto.fileName);
    const visibility = dto.visibility ?? FileVisibility.PRIVATE;
    const publicUrl =
      visibility === FileVisibility.PUBLIC && process.env.R2_PUBLIC_BASE_URL
        ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${objectKey}`
        : undefined;

    const uploadUrl = await this.createSignedUrl(bucket, objectKey, dto.mimeType);
    return {
      bucket,
      objectKey,
      uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': dto.mimeType
      },
      publicUrl,
      expiresInSeconds: 300
    };
  }

  async confirm(user: AuthUser, dto: ConfirmUploadDto) {
    this.validateFile(dto.mimeType, dto.sizeBytes);
    const cooperativeId = requireTenant(user, dto.cooperativeId);
    const created = await this.prisma.fileAsset.create({
      data: {
        cooperativeId,
        ownerId: user.id,
        bucket: process.env.R2_BUCKET || 'agri-passport',
        objectKey: dto.objectKey,
        publicUrl: dto.publicUrl,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        checksum: dto.checksum,
        visibility: dto.visibility ?? 'PRIVATE'
      }
    });
    await this.audit.record({
      user,
      action: 'files.confirm_upload',
      entity: 'FileAsset',
      entityId: created.id,
      cooperativeId
    });
    return created;
  }

  async get(user: AuthUser, id: string) {
    const file = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Không tìm thấy file');
    if (!isSuperAdmin(user) && file.cooperativeId && file.cooperativeId !== user.cooperativeId) {
      throw new ForbiddenException('Không có quyền xem file HTX khác');
    }
    return file;
  }

  async remove(user: AuthUser, id: string) {
    const file = await this.get(user, id);
    await this.prisma.fileAsset.delete({ where: { id } });
    await this.audit.record({
      user,
      action: 'files.delete',
      entity: 'FileAsset',
      entityId: id,
      cooperativeId: file.cooperativeId
    });
    return { deleted: true };
  }

  async testConnection() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const configured =
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      ![accountId, accessKeyId, secretAccessKey].some((value) => value.includes('CHANGE_ME'));
    if (!configured) {
      return { ok: false, message: 'Chưa cấu hình R2 trong biến môi trường' };
    }
    try {
      const bucket = process.env.R2_BUCKET || 'agri-passport';
      await this.createSignedUrl(bucket, 'health-check.txt', 'text/plain');
      return { ok: true, message: 'Kết nối R2 thành công', bucket };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Không thể kết nối R2' };
    }
  }

  private validateFile(mimeType: string, sizeBytes: number) {
    if (!ALLOWED_MIME.has(mimeType)) throw new BadRequestException('Loại file không được hỗ trợ');
    const limit = mimeType.startsWith('image/') ? 10 * 1024 * 1024 : 20 * 1024 * 1024;
    if (sizeBytes > limit) throw new BadRequestException('File vượt quá dung lượng cho phép');
  }

  private objectKey(cooperativeId: string | undefined, fileName: string) {
    const safeName = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    return `${cooperativeId ?? 'system'}/${new Date().toISOString().slice(0, 10)}/${nanoid(10)}-${safeName}`;
  }

  private async createSignedUrl(bucket: string, objectKey: string, mimeType: string) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const configured =
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      ![accountId, accessKeyId, secretAccessKey].some((value) => value.includes('CHANGE_ME'));
    if (!configured) {
      return `https://r2-placeholder.local/${bucket}/${objectKey}?missing=R2_KEYS`;
    }
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    return getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        ContentType: mimeType
      }),
      { expiresIn: 300 }
    );
  }
}
