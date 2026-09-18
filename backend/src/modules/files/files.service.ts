import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileVisibility, Prisma, RoleSlug } from '@prisma/client';
import { nanoid } from 'nanoid';
import { ConfirmUploadDto, CreateFarmerVoiceRecordingDto, PresignUploadDto } from '../../common/dto';
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
const ALLOWED_AUDIO_MIME = new Set(['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/aac']);
const MAX_VOICE_RECORDING_BYTES = 20 * 1024 * 1024;

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

  async upload(user: AuthUser, file?: { originalname: string; mimetype: string; size: number; buffer: Buffer }) {
    if (!file) throw new BadRequestException('Chưa chọn file để tải lên');
    this.validateFile(file.mimetype, file.size);

    const cooperativeId = requireTenant(user, undefined);
    const bucket = process.env.R2_BUCKET || 'agri-passport';
    const objectKey = this.objectKey(cooperativeId, file.originalname);
    const publicUrl = process.env.R2_PUBLIC_BASE_URL
      ? `${process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${objectKey}`
      : undefined;

    if (!publicUrl) throw new BadRequestException('Chưa cấu hình địa chỉ public cho kho ảnh');

    const client = this.s3Client();
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable'
    }));

    return this.confirm(user, {
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      objectKey,
      publicUrl,
      visibility: FileVisibility.PUBLIC
    });
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
    const voiceRecording = await this.prisma.farmerVoiceRecording.findUnique({ where: { fileAssetId: id }, select: { id: true } });
    if (voiceRecording) throw new BadRequestException('Hãy xóa bản ghi âm trong hồ sơ nông dân để dọn cả tệp lưu trữ');
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

  async listFarmerVoiceRecordings(user: AuthUser, farmerId: string) {
    const farmerProfile = await this.getFarmerProfile(user, farmerId);
    const records = await this.prisma.farmerVoiceRecording.findMany({
      where: { farmerProfileId: farmerProfile.id },
      include: {
        fileAsset: true,
        recordedBy: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    if (records.length === 0) return [];
    const client = this.s3Client();
    return Promise.all(records.map((record) => this.serializeVoiceRecording(record, client)));
  }

  async createFarmerVoiceRecording(
    user: AuthUser,
    farmerId: string,
    dto: CreateFarmerVoiceRecordingDto,
    file?: { originalname: string; mimetype: string; size: number; buffer: Buffer }
  ) {
    if (!dto.consentConfirmed) throw new BadRequestException('Cần xác nhận đã được nông dân đồng ý ghi âm');
    if (!Number.isInteger(dto.durationSeconds) || dto.durationSeconds < 1 || dto.durationSeconds > 600) {
      throw new BadRequestException('Thời lượng ghi âm phải từ 1 giây đến 10 phút');
    }
    if (!file) throw new BadRequestException('Chưa có tệp ghi âm');
    const mimeType = file.mimetype.split(';', 1)[0].trim().toLowerCase();
    if (!ALLOWED_AUDIO_MIME.has(mimeType)) throw new BadRequestException('Định dạng ghi âm không được hỗ trợ');
    if (file.size < 1 || file.size > MAX_VOICE_RECORDING_BYTES) {
      throw new BadRequestException('Tệp ghi âm phải nhỏ hơn 20 MB');
    }

    const farmerProfile = await this.getFarmerProfile(user, farmerId);
    if (farmerProfile.userStatus !== 'ACTIVE' || farmerProfile.status !== 'ACTIVE') {
      throw new BadRequestException('Chỉ có thể thêm bản ghi cho tài khoản nông dân đang hoạt động');
    }
    const bucket = process.env.R2_BUCKET || 'agri-passport';
    const extension = this.audioExtension(mimeType);
    const objectKey = this.objectKey(farmerProfile.cooperativeId, `ghi-am-${nanoid(8)}.${extension}`);
    const client = this.s3Client();

    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: file.buffer,
      ContentType: mimeType,
      CacheControl: 'private, no-store'
    }));

    let recording;
    try {
      recording = await this.prisma.$transaction(async (tx) => {
        const fileAsset = await tx.fileAsset.create({
          data: {
            cooperativeId: farmerProfile.cooperativeId,
            ownerId: user.id,
            bucket,
            objectKey,
            mimeType,
            sizeBytes: file.size,
            visibility: FileVisibility.PRIVATE
          }
        });
        return tx.farmerVoiceRecording.create({
          data: {
            farmerProfileId: farmerProfile.id,
            fileAssetId: fileAsset.id,
            recordedById: user.id,
            title: dto.title?.trim() || null,
            durationSeconds: dto.durationSeconds,
            consentedAt: new Date()
          },
          include: {
            fileAsset: true,
            recordedBy: { select: { id: true, fullName: true } }
          }
        });
      });
    } catch (error) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey })).catch(() => undefined);
      throw error;
    }

    await this.audit.record({
      user,
      action: 'farmers.voice_recording.create',
      entity: 'FarmerVoiceRecording',
      entityId: recording.id,
      cooperativeId: farmerProfile.cooperativeId,
      metadata: { farmerId, durationSeconds: recording.durationSeconds }
    });
    return this.serializeVoiceRecording(recording, client);
  }

  async deleteFarmerVoiceRecording(user: AuthUser, farmerId: string, recordingId: string) {
    const farmerProfile = await this.getFarmerProfile(user, farmerId);
    const recording = await this.prisma.farmerVoiceRecording.findFirst({
      where: { id: recordingId, farmerProfileId: farmerProfile.id },
      include: { fileAsset: true }
    });
    if (!recording) throw new NotFoundException('Không tìm thấy bản ghi âm');

    await this.s3Client().send(new DeleteObjectCommand({
      Bucket: recording.fileAsset.bucket,
      Key: recording.fileAsset.objectKey
    }));
    await this.prisma.$transaction(async (tx) => {
      await tx.farmerVoiceRecording.delete({ where: { id: recording.id } });
      await tx.fileAsset.delete({ where: { id: recording.fileAssetId } });
    });
    await this.audit.record({
      user,
      action: 'farmers.voice_recording.delete',
      entity: 'FarmerVoiceRecording',
      entityId: recording.id,
      cooperativeId: farmerProfile.cooperativeId
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
    const client = this.s3Client();
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

  private async getFarmerProfile(user: AuthUser, farmerId: string) {
    const cooperativeId = isSuperAdmin(user) ? undefined : requireTenant(user);
    const farmer = await this.prisma.user.findFirst({
      where: {
        id: farmerId,
        ...(cooperativeId ? { cooperativeId } : {}),
        roles: { some: { role: { slug: RoleSlug.FARMER } } }
      },
      select: {
        status: true,
        cooperativeId: true,
        farmerProfile: { select: { id: true, cooperativeId: true, status: true } }
      }
    });
    if (!farmer?.cooperativeId || !farmer.farmerProfile || farmer.farmerProfile.cooperativeId !== farmer.cooperativeId) {
      throw new NotFoundException('Không tìm thấy hồ sơ nông dân');
    }
    if (cooperativeId && farmer.cooperativeId !== cooperativeId) {
      throw new ForbiddenException('Không có quyền truy cập nông dân thuộc HTX khác');
    }
    return {
      ...farmer.farmerProfile,
      cooperativeId: farmer.cooperativeId,
      userStatus: farmer.status
    };
  }

  private async serializeVoiceRecording(record: {
    id: string;
    title: string | null;
    durationSeconds: number;
    consentedAt: Date;
    createdAt: Date;
    fileAsset: { bucket: string; objectKey: string; mimeType: string; sizeBytes: number };
    recordedBy: { id: string; fullName: string } | null;
  }, client = this.s3Client()) {
    const downloadUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: record.fileAsset.bucket, Key: record.fileAsset.objectKey }),
      { expiresIn: 900 }
    );
    return {
      id: record.id,
      title: record.title,
      durationSeconds: record.durationSeconds,
      consentedAt: record.consentedAt,
      createdAt: record.createdAt,
      fileSizeBytes: record.fileAsset.sizeBytes,
      downloadUrl,
      recordedBy: record.recordedBy
    };
  }

  private audioExtension(mimeType: string) {
    const extensions: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/aac': 'aac'
    };
    return extensions[mimeType];
  }

  private s3Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const configured =
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      ![accountId, accessKeyId, secretAccessKey].some((value) => value.includes('CHANGE_ME'));
    if (!configured) throw new BadRequestException('Chưa cấu hình kho ảnh R2');
    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey }
    });
  }
}
