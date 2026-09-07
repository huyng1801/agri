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
const PUBLIC_MEDIA_PLACEHOLDER_URL = '/public-media-placeholder.svg';
const DEFAULT_PUBLIC_FAQS = [
  {
    question: 'Agripassport hỗ trợ gì cho hợp tác xã?',
    answer: 'Chuẩn hóa dữ liệu sản phẩm, vùng trồng, nhật ký, chứng nhận, QR truy xuất và thông tin công khai.'
  },
  {
    question: 'Người mua có cần đăng nhập để xem QR?',
    answer: 'Không. Khách truy cập có thể xem QR Passport công khai trực tiếp.'
  },
  {
    question: 'Dữ liệu công khai được kiểm soát thế nào?',
    answer: 'Chỉ thông tin và hồ sơ đã được hợp tác xã xác minh, phê duyệt công khai mới xuất hiện trên Agripassport.'
  },
  {
    question: 'Nếu tra cứu QR chưa ra kết quả thì liên hệ ai?',
    answer: 'Gọi hotline 0907 001 200 hoặc email Agripassport@gmail.com để chúng tôi hỗ trợ kiểm tra nhanh.'
  }
] as const;

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
      appName: 'AGRIPASSPORT',
      hotline: stringValue(publicProfile.hotline) || '0907001200',
      hotlineDisplay: stringValue(publicProfile.hotlineDisplay) || stringValue(publicProfile.hotline) || '0907 001 200',
      supportEmail: stringValue(publicProfile.supportEmail) || stringValue(systemProfile.supportEmail) || 'Agripassport@gmail.com',
      address: normalizePublicCopy(stringValue(publicProfile.address)) || 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp',
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
          const question = normalizePublicCopy(stringValue((item as Record<string, unknown>).question));
          const answer = normalizePublicCopy(stringValue((item as Record<string, unknown>).answer));
          if (!question || !answer) return null;
          return { question, answer };
        })
        .filter((item): item is { question: string; answer: string } => Boolean(item))
    : [];

  if (items.length) return items;
  return [...DEFAULT_PUBLIC_FAQS];
}

function approvedPublicImageUrl(value: unknown) {
  const imageUrl = stringValue(value);
  if (!imageUrl || /(picsum\.photos|images\.unsplash\.com|source\.unsplash\.com)/i.test(imageUrl)) {
    return PUBLIC_MEDIA_PLACEHOLDER_URL;
  }
  return imageUrl;
}

function pageContentItems(value: unknown) {
  const object = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return {
    homeBadge: normalizePublicCopy(stringValue(object.homeBadge)) || 'Nền tảng số cho hợp tác xã',
    homeTitle: normalizePublicCopy(stringValue(object.homeTitle)) || 'Agripassport giúp hợp tác xã công khai sản phẩm và dữ liệu truy xuất rõ ràng hơn.',
    homeDescription:
      normalizePublicCopy(stringValue(object.homeDescription)) ||
      'Chuẩn hóa sản phẩm, mở QR truy xuất cho người mua và kết nối dữ liệu công khai trên cùng một hệ thống gọn, rõ và dễ tin tưởng.',
    homeImageUrl: approvedPublicImageUrl(object.homeImageUrl),
    homeImageAlt: normalizePublicCopy(stringValue(object.homeImageAlt)) || 'Nông sản tươi và hoạt động kết nối của hợp tác xã trên môi trường số',
    introTitle: normalizePublicCopy(stringValue(object.introTitle)) || 'Giới thiệu Agripassport',
    introDescription: normalizePublicCopy(stringValue(object.introDescription)) || 'Nền tảng dữ liệu sản phẩm và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.',
    introImageUrl: approvedPublicImageUrl(object.introImageUrl),
    introImageAlt: normalizePublicCopy(stringValue(object.introImageAlt)) || 'Khu vực trồng trọt xanh và nông dân đang chăm sóc nông sản',
    aboutTitle: normalizePublicCopy(stringValue(object.aboutTitle)) || 'Chúng tôi là Agripassport',
    aboutDescription:
      normalizePublicCopy(stringValue(object.aboutDescription)) ||
      'Nền tảng dữ liệu giúp hợp tác xã kết nối thị trường và minh bạch nguồn gốc sản phẩm.',
    aboutImageUrl: approvedPublicImageUrl(object.aboutImageUrl),
    aboutImageAlt: normalizePublicCopy(stringValue(object.aboutImageAlt)) || 'Thành viên hợp tác xã và nông sản đặc trưng Việt Nam',
    contactTitle: normalizePublicCopy(stringValue(object.contactTitle)) || 'Hãy để Agripassport đồng hành cùng hợp tác xã của bạn',
    contactDescription:
      normalizePublicCopy(stringValue(object.contactDescription)) ||
      'Tư vấn chuẩn hóa dữ liệu sản phẩm, QR truy xuất nguồn gốc và kết nối tiêu thụ cho HTX.',
    contactImageUrl: approvedPublicImageUrl(object.contactImageUrl),
    contactImageAlt: normalizePublicCopy(stringValue(object.contactImageAlt)) || 'Không gian trao đổi và hỗ trợ vận hành cho hợp tác xã'
  };
}

function normalizePublicCopy(value: string) {
  if (!value) return '';
  return value
    .replace(/\bQR Passport public\b/gi, 'QR Passport công khai')
    .replace(/\btrang public\b/gi, 'trang công khai')
    .replace(/\bsản phẩm public\b/gi, 'sản phẩm công khai')
    .replace(/\bchứng nhận public\b/gi, 'chứng nhận công khai')
    .replace(/\bHTX public\b/gi, 'HTX công khai')
    .replace(/\bđã publish\b/gi, 'đã đăng công khai')
    .replace(/\bpublish\b/gi, 'đăng công khai')
    .replace(/\bpublic\b/gi, 'công khai')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
