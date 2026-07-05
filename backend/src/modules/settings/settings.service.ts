import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { UpsertSettingDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService
  ) {}

  list() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async publicSiteProfile() {
    const [publicProfileSetting, systemProfileSetting] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: 'public.siteProfile' } }),
      this.prisma.setting.findUnique({ where: { key: 'system.profile' } })
    ]);
    const publicProfile = jsonObject(publicProfileSetting?.value);
    const systemProfile = jsonObject(systemProfileSetting?.value);
    return {
      appName: stringValue(publicProfile.appName) || 'HTXONLINE',
      hotline: stringValue(publicProfile.hotline) || '0900000000',
      hotlineDisplay: stringValue(publicProfile.hotlineDisplay) || stringValue(publicProfile.hotline) || '0900 000 000',
      supportEmail: stringValue(publicProfile.supportEmail) || stringValue(systemProfile.supportEmail) || 'support@htxonline.vn',
      address: stringValue(publicProfile.address) || 'Việt Nam',
      zaloUrl: stringValue(publicProfile.zaloUrl) || 'https://zalo.me',
      messengerUrl: stringValue(publicProfile.messengerUrl) || '',
      mapEmbedUrl: stringValue(publicProfile.mapEmbedUrl) || '',
      faqs: faqItems(publicProfile.faqs)
    };
  }

  upsert(user: AuthUser, dto: UpsertSettingDto) {
    this.audit.record({ user, action: 'settings.upsert', entity: 'Setting', entityId: dto.key });
    return this.prisma.setting.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        value: dto.value as Prisma.InputJsonValue,
        description: dto.description
      },
      update: {
        value: dto.value as Prisma.InputJsonValue,
        description: dto.description
      }
    });
  }
}

function jsonObject(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function faqItems(value: unknown) {
  const items = Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const question = stringValue((item as Record<string, unknown>).question);
          const answer = stringValue((item as Record<string, unknown>).answer);
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter((item): item is { question: string; answer: string } => Boolean(item))
    : [];

  if (items.length) return items;
  return [
    {
      question: 'HTXONLINE hỗ trợ gì cho hợp tác xã?',
      answer: 'Quản lý sản phẩm, vùng trồng, QR truy xuất và đơn COD trên cùng một nền tảng.'
    },
    {
      question: 'Người mua có cần đăng nhập để xem QR?',
      answer: 'Không. Khách truy cập có thể xem QR Passport public trực tiếp.'
    }
  ];
}
