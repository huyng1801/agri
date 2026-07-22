import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { UpsertSettingDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FilesService } from '../files/files.service';
import { PrismaService } from '../prisma/prisma.service';

const SECRET_KEYS = new Set(['system.r2', 'system.email', 'system.security']);
const DEFAULT_MAP_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=105.668%2C10.3958%2C105.768%2C10.4958&layer=mapnik&marker=10.4458%2C105.718';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogsService,
    private readonly files: FilesService
  ) {}

  async list() {
    const settings = await this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
    return settings.map((setting) => ({
      ...setting,
      value: this.maskValue(setting.key, setting.value),
      hasSecret: SECRET_KEYS.has(setting.key)
    }));
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
      hotline: stringValue(publicProfile.hotline) || '0907001200',
      hotlineDisplay: stringValue(publicProfile.hotlineDisplay) || stringValue(publicProfile.hotline) || '0907 001 200',
      supportEmail: stringValue(publicProfile.supportEmail) || stringValue(systemProfile.supportEmail) || 'Agripassport@gmail.com',
      address: stringValue(publicProfile.address) || 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp',
      zaloUrl: stringValue(publicProfile.zaloUrl),
      messengerUrl: stringValue(publicProfile.messengerUrl) || '',
      mapEmbedUrl: stringValue(publicProfile.mapEmbedUrl) || DEFAULT_MAP_EMBED_URL,
      logoUrl: stringValue(publicProfile.logoUrl) || '',
      faqs: faqItems(publicProfile.faqs),
      pageContent: pageContentItems(publicProfile.pageContent)
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

  testR2() {
    return this.files.testConnection();
  }

  private maskValue(key: string, value: unknown) {
    if (!SECRET_KEYS.has(key)) return value;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { masked: true, hasValue: Boolean(value) };
    }
    const object = value as Record<string, unknown>;
    const masked: Record<string, unknown> = { masked: true };
    for (const [field, fieldValue] of Object.entries(object)) {
      if (/secret|password|key|token/i.test(field) && fieldValue) {
        masked[field] = '***';
        masked[`${field}HasValue`] = true;
      } else {
        masked[field] = fieldValue;
      }
    }
    return masked;
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

function pageContentItems(value: unknown) {
  const object = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return {
    homeBadge: stringValue(object.homeBadge) || 'Nền tảng số cho hợp tác xã',
    homeTitle: stringValue(object.homeTitle) || 'HTXONLINE giúp hợp tác xã bán hàng minh bạch hơn trên môi trường số.',
    homeDescription:
      stringValue(object.homeDescription) ||
      'Công khai sản phẩm, mở QR Passport cho người mua và vận hành quy trình đơn COD trên cùng một hệ thống gọn, rõ và dễ tin tưởng.',
    homeImageUrl:
      stringValue(object.homeImageUrl) ||
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
    homeImageAlt: stringValue(object.homeImageAlt) || 'Nông sản tươi và hoạt động kết nối của hợp tác xã trên môi trường số',
    introTitle: stringValue(object.introTitle) || 'Giới thiệu HTXONLINE',
    introDescription: stringValue(object.introDescription) || 'Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.',
    introImageUrl:
      stringValue(object.introImageUrl) ||
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    introImageAlt: stringValue(object.introImageAlt) || 'Khu vực trồng trọt xanh và nông dân đang chăm sóc nông sản',
    aboutTitle: stringValue(object.aboutTitle) || 'Chúng tôi là HTXONLINE',
    aboutDescription:
      stringValue(object.aboutDescription) ||
      'Sàn nông sản số giúp hợp tác xã kết nối thị trường, minh bạch nguồn gốc và bán hàng COD hiệu quả.',
    aboutImageUrl:
      stringValue(object.aboutImageUrl) ||
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    aboutImageAlt: stringValue(object.aboutImageAlt) || 'Thành viên hợp tác xã và nông sản đặc trưng Việt Nam',
    contactTitle: stringValue(object.contactTitle) || 'Hãy để HTXONLINE kết nối và đồng hành cùng hợp tác xã của bạn',
    contactDescription:
      stringValue(object.contactDescription) ||
      'Tư vấn tham gia sàn, QR truy xuất nguồn gốc, hỗ trợ đơn hàng COD và vận hành số cho HTX.',
    contactImageUrl:
      stringValue(object.contactImageUrl) ||
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    contactImageAlt: stringValue(object.contactImageAlt) || 'Không gian trao đổi và hỗ trợ vận hành cho hợp tác xã'
  };
}
