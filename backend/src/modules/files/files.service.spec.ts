import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FilesService } from './files.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://r2.example.test/private-audio?signature=short-lived')
}));

describe('FilesService farmer voice recordings', () => {
  const admin = {
    id: 'admin-1',
    email: 'admin@coop.test',
    fullName: 'HTX Admin',
    cooperativeId: 'coop-1',
    roles: [RoleSlug.ADMIN_HTX],
    permissions: ['users.read', 'users.update']
  };
  const farmer = {
    status: 'ACTIVE',
    cooperativeId: 'coop-1',
    farmerProfile: { id: 'profile-1', cooperativeId: 'coop-1', status: 'ACTIVE' }
  };

  beforeEach(() => jest.clearAllMocks());

  it('requires recorded consent before accepting or storing audio', async () => {
    const prisma = { user: { findFirst: jest.fn() } };
    const service = new FilesService(prisma as never, { record: jest.fn() } as never);

    await expect(service.createFarmerVoiceRecording(admin, 'farmer-1', {
      durationSeconds: 12,
      consentConfirmed: false
    }, {
      originalname: 'voice.webm',
      mimetype: 'audio/webm',
      size: 100,
      buffer: Buffer.from('audio')
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('does not allow a cooperative admin to inspect another tenant farmer', async () => {
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      farmerVoiceRecording: { findMany: jest.fn() }
    };
    const service = new FilesService(prisma as never, { record: jest.fn() } as never);

    await expect(service.listFarmerVoiceRecordings(admin, 'farmer-from-another-htx'))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'farmer-from-another-htx', cooperativeId: 'coop-1' })
    }));
    expect(prisma.farmerVoiceRecording.findMany).not.toHaveBeenCalled();
  });

  it('stores consented recordings as private assets and returns a short-lived playback URL', async () => {
    const createdAt = new Date('2026-09-18T05:00:00.000Z');
    const fileAsset = {
      id: 'file-1',
      bucket: 'voice-bucket',
      objectKey: 'coop-1/2026-09-18/voice.webm',
      mimeType: 'audio/webm',
      sizeBytes: 1200,
      visibility: 'PRIVATE'
    };
    const recording = {
      id: 'voice-1',
      title: 'Trao đổi vụ mùa',
      transcript: 'Nông dân muốn ghi nhật ký sản xuất.',
      durationSeconds: 42,
      consentedAt: createdAt,
      createdAt,
      fileAsset,
      recordedBy: { id: admin.id, fullName: admin.fullName }
    };
    const tx = {
      fileAsset: { create: jest.fn().mockResolvedValue(fileAsset) },
      farmerVoiceRecording: { create: jest.fn().mockResolvedValue(recording) }
    };
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue(farmer) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx))
    };
    const audit = { record: jest.fn() };
    const service = new FilesService(prisma as never, audit as never);
    const s3 = { send: jest.fn().mockResolvedValue({}) };
    jest.spyOn(service as never, 's3Client').mockReturnValue(s3 as never);

    const result = await service.createFarmerVoiceRecording(admin, 'farmer-1', {
      title: 'Trao đổi vụ mùa',
      transcript: 'Nông dân muốn ghi nhật ký sản xuất.',
      durationSeconds: 42,
      consentConfirmed: true
    }, {
      originalname: 'voice.webm',
      mimetype: 'audio/webm;codecs=opus',
      size: 1200,
      buffer: Buffer.from('recorded audio')
    });

    expect(s3.send).toHaveBeenCalledTimes(1);
    const putCommand = s3.send.mock.calls[0][0] as PutObjectCommand;
    expect(putCommand.input).toMatchObject({
      Bucket: 'agri-passport',
      ContentType: 'audio/webm',
      CacheControl: 'private, no-store'
    });
    expect(tx.fileAsset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cooperativeId: 'coop-1',
        ownerId: admin.id,
        visibility: 'PRIVATE',
        mimeType: 'audio/webm'
      })
    });
    expect(tx.farmerVoiceRecording.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ farmerProfileId: 'profile-1', fileAssetId: 'file-1', recordedById: admin.id, transcript: 'Nông dân muốn ghi nhật ký sản xuất.', durationSeconds: 42 })
    }));
    expect(result).toMatchObject({ id: 'voice-1', transcript: 'Nông dân muốn ghi nhật ký sản xuất.', downloadUrl: 'https://r2.example.test/private-audio?signature=short-lived' });
    expect(getSignedUrl).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'farmers.voice_recording.create', entityId: 'voice-1' }));
  });

  it('removes the private object as well as the database records', async () => {
    const recording = {
      id: 'voice-1',
      fileAssetId: 'file-1',
      fileAsset: { bucket: 'voice-bucket', objectKey: 'coop-1/private.webm' }
    };
    const tx = {
      farmerVoiceRecording: { delete: jest.fn() },
      fileAsset: { delete: jest.fn() }
    };
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue(farmer) },
      farmerVoiceRecording: { findFirst: jest.fn().mockResolvedValue(recording) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx))
    };
    const audit = { record: jest.fn() };
    const service = new FilesService(prisma as never, audit as never);
    const s3 = { send: jest.fn().mockResolvedValue({}) };
    jest.spyOn(service as never, 's3Client').mockReturnValue(s3 as never);

    await expect(service.deleteFarmerVoiceRecording(admin, 'farmer-1', 'voice-1')).resolves.toEqual({ deleted: true });
    expect(s3.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    expect(tx.farmerVoiceRecording.delete).toHaveBeenCalledWith({ where: { id: 'voice-1' } });
    expect(tx.fileAsset.delete).toHaveBeenCalledWith({ where: { id: 'file-1' } });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'farmers.voice_recording.delete' }));
  });
});
