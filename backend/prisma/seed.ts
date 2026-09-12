import { NewsSite, NewsStatus, Prisma, PrismaClient, RoleSlug } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { preparePassportNewsBody } from './passport-news-content';
import { PASSPORT_PRODUCTION_ARTICLES, passportNewsCoverUrl } from './passport-news-production';
import { resolveNewsSeedSlug } from './news-seed-slug';

const prisma = new PrismaClient();

async function seedPassportNews(superAdminId: string) {
  const categories = await prisma.newsCategory.findMany();
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item.id]));

  for (const [index, article] of PASSPORT_PRODUCTION_ARTICLES.entries()) {
    const existingBySlug = await prisma.newsArticle.findUnique({
      where: { slug: article.slug },
      select: { slug: true, siteKey: true, title: true }
    });
    const existingPassportByTitle = await prisma.newsArticle.findFirst({
      where: { title: article.title, siteKey: NewsSite.PASSPORT },
      select: { slug: true }
    });
    const needsScopedSlug = Boolean(
      existingBySlug &&
      !existingPassportByTitle &&
      !(existingBySlug.siteKey === NewsSite.PASSPORT && existingBySlug.title === article.title)
    );
    const occupiedScopedSlugs = needsScopedSlug
      ? new Set(
          (await prisma.newsArticle.findMany({
            where: { slug: { startsWith: `${article.slug}-ho-chieu` } },
            select: { slug: true }
          })).map((item) => item.slug)
        )
      : undefined;
    const existingSlug = resolveNewsSeedSlug({
      requestedSlug: article.slug,
      title: article.title,
      siteKey: NewsSite.PASSPORT,
      existingBySlug,
      existingBySiteTitle: existingPassportByTitle,
      occupiedSlugs: occupiedScopedSlugs
    });
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - index * 3);
    const bodyHtml = preparePassportNewsBody(article.bodyHtml);
    const coverImageUrl = passportNewsCoverUrl(article.coverKey);
    const coverImageAlt = `Ảnh minh họa: ${article.title}`;
    const tagsJson = [article.focusKeyword, article.category, 'Hộ chiếu nông nghiệp'];

    await prisma.newsArticle.upsert({
      where: { slug: existingSlug },
      create: {
        siteKey: NewsSite.PASSPORT,
        categoryId: categoryBySlug.get(article.category),
        authorId: superAdminId,
        title: article.title,
        slug: existingSlug,
        excerpt: article.excerpt,
        bodyHtml,
        coverImageUrl,
        coverImageAlt,
        status: NewsStatus.PUBLISHED,
        publicVerified: true,
        isFeatured: index < 4,
        showOnHome: index < 6,
        focusKeyword: article.focusKeyword,
        publishedAt,
        viewCount: 120 + index * 17,
        seoTitle: article.title,
        seoDescription: article.seoDescription,
        ogTitle: article.title,
        ogDescription: article.seoDescription,
        ogImageUrl: coverImageUrl,
        twitterTitle: article.title,
        twitterDescription: article.seoDescription,
        twitterImageUrl: coverImageUrl,
        tagsJson,
        seoScore: 92,
        readabilityScore: 86
      },
      update: {
        siteKey: NewsSite.PASSPORT,
        categoryId: categoryBySlug.get(article.category),
        authorId: superAdminId,
        title: article.title,
        slug: existingSlug,
        excerpt: article.excerpt,
        bodyHtml,
        coverImageUrl,
        coverImageAlt,
        status: NewsStatus.PUBLISHED,
        publicVerified: true,
        isFeatured: index < 4,
        showOnHome: index < 6,
        focusKeyword: article.focusKeyword,
        publishedAt,
        seoTitle: article.title,
        seoDescription: article.seoDescription,
        ogTitle: article.title,
        ogDescription: article.seoDescription,
        ogImageUrl: coverImageUrl,
        twitterTitle: article.title,
        twitterDescription: article.seoDescription,
        twitterImageUrl: coverImageUrl,
        tagsJson,
        seoScore: 92,
        readabilityScore: 86
      }
    });

    // Align Passport duplicates only; do not alter same-title articles on other sites.
    await prisma.newsArticle.updateMany({
      where: { title: article.title, siteKey: NewsSite.PASSPORT },
      data: {
        siteKey: NewsSite.PASSPORT,
        categoryId: categoryBySlug.get(article.category),
        authorId: superAdminId,
        excerpt: article.excerpt,
        bodyHtml,
        coverImageUrl,
        coverImageAlt,
        status: NewsStatus.PUBLISHED,
        publicVerified: true,
        isFeatured: index < 4,
        showOnHome: index < 6,
        focusKeyword: article.focusKeyword,
        seoTitle: article.title,
        seoDescription: article.seoDescription,
        ogTitle: article.title,
        ogDescription: article.seoDescription,
        ogImageUrl: coverImageUrl,
        twitterTitle: article.title,
        twitterDescription: article.seoDescription,
        twitterImageUrl: coverImageUrl,
        tagsJson,
        seoScore: 92,
        readabilityScore: 86
      }
    });
  }

  return PASSPORT_PRODUCTION_ARTICLES.length;
}

const defaultPublicFaqs = [
  {
    question: 'Agripassport hỗ trợ gì cho hợp tác xã?',
    answer: 'Chuẩn hóa dữ liệu sản phẩm, vùng trồng, nhật ký, chứng nhận, QR truy xuất và thông tin công khai.'
  },
  {
    question: 'Người mua có cần tài khoản để xem QR không?',
    answer: 'Không. QR Passport công khai được mở trực tiếp cho khách truy cập.'
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

const permissions = {
  SUPER_ADMIN: [
    'system.*',
    'users.*',
    'roles.*',
    'permissions.*',
    'cooperatives.*',
    'subscription_plans.*',
    'subscriptions.*',
    'invoices.*',
    'payments.read',
    'reports.overview',
    'reports.revenue',
    'reports.snapshots',
    'settings.*',
    'contacts.read',
    'contacts.update',
    'audit_logs.*',
    'backups.*',
    'notifications.*',
    'product_categories.*',
    'certifications.read',
    'orders.read',
    'news.*',
    'files.*',
    'crop_types.*',
    'trees.*',
    'tree_events.*',
    'seasons.*',
    'harvests.*',
    'lots.*',
    'product_batches.*',
    'traceability_codes.*'
  ],
  ADMIN_HTX: [
    'cooperatives.read',
    'cooperatives.update',
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'subscription_plans.read',
    'subscriptions.read',
    'invoices.read',
    'payments.read',
    'product_categories.*',
    'products.*',
    'certifications.*',
    'zones.*',
    'farming_logs.*',
    'passports.*',
    'reports.overview',
    'reports.snapshots',
    'files.*',
    'notifications.*',
    'orders.*',
    'news.*',
    'crop_types.read',
    'trees.*',
    'tree_events.*',
    'seasons.*',
    'harvests.*',
    'lots.*',
    'product_batches.*',
    'traceability_codes.*'
  ],
  MEMBER_HTX: [
    'products.read',
    'products.create',
    'products.update',
    'product_categories.read',
    'certifications.read',
    'certifications.create',
    'certifications.update',
    'zones.read',
    'farming_logs.*',
    'passports.read',
    'passports.create',
    'files.*',
    'reports.overview',
    'notifications.read',
    'notifications.update',
    'orders.*',
    'crop_types.read',
    'trees.read',
    'trees.create',
    'trees.update',
    'tree_events.*',
    'seasons.read',
    'seasons.create',
    'seasons.update',
    'harvests.*',
    'lots.read',
    'lots.create',
    'lots.update',
    'product_batches.read',
    'product_batches.create',
    'product_batches.update',
    'traceability_codes.read',
    'traceability_codes.create',
    'traceability_codes.update'
  ],
  FARMER: [
    'products.read',
    'product_categories.read',
    'zones.read',
    'farming_logs.create',
    'farming_logs.read',
    'farming_logs.update',
    'files.read',
    'files.upload',
    'reports.overview',
    'notifications.read',
    'notifications.update',
    'crop_types.read',
    'trees.*',
    'tree_events.*',
    'seasons.read',
    'harvests.*',
    'lots.read',
    'product_batches.read',
    'traceability_codes.read'
  ],
  BUYER: ['public.read', 'orders.read'],
  ENTERPRISE: ['public.read', 'trees.read', 'lots.read', 'product_batches.read', 'traceability_codes.read'],
  AUTHORITY: ['public.read', 'trees.read', 'tree_events.read', 'harvests.read', 'lots.read', 'product_batches.read', 'traceability_codes.read', 'reports.overview']
};

async function main() {
  for (const slug of Object.values(RoleSlug)) {
    await prisma.role.upsert({
      where: { slug },
      create: {
        slug,
        name: slug.replace('_', ' '),
        permissions: permissions[slug] ?? [],
        isSystem: true
      },
      update: {
        permissions: permissions[slug] ?? []
      }
    });
  }

  const cropTypes = [
    ['XOI', 'Xoài'],
    ['SAU_RIENG', 'Sầu riêng'],
    ['DUA', 'Dừa'],
    ['CA_PHE', 'Cà phê'],
    ['BUOI', 'Bưởi'],
    ['NHAN', 'Nhãn'],
    ['VAI', 'Vải'],
    ['CAM', 'Cam']
  ] as const;
  for (const [code, name] of cropTypes) {
    await prisma.cropType.upsert({
      where: { code },
      create: { code, name, sortOrder: cropTypes.findIndex(([item]) => item === code) },
      update: { name, isActive: true }
    });
  }

  const plans = [
    {
      name: 'Free',
      slug: 'free',
      priceMonthly: 0,
      priceYearly: 0,
      maxCooperatives: 1,
      maxProducts: 10,
      maxMembers: 5,
      maxZones: 3,
      featuresJson: ['Đăng sản phẩm', 'QR truy xuất cơ bản']
    },
    {
      name: 'Basic',
      slug: 'basic',
      priceMonthly: 299000,
      priceYearly: 2990000,
      maxCooperatives: 1,
      maxProducts: 100,
      maxMembers: 30,
      maxZones: 20,
      featuresJson: ['QR Passport', 'Hồ sơ vùng trồng', 'Hỗ trợ cơ bản']
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 999000,
      priceYearly: 9990000,
      maxCooperatives: 1,
      maxProducts: null,
      maxMembers: null,
      maxZones: null,
      featuresJson: ['Báo cáo', 'QR Passport', 'Hỗ trợ ưu tiên']
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      priceMonthly: 0,
      priceYearly: 0,
      maxCooperatives: null,
      maxProducts: null,
      maxMembers: null,
      maxZones: null,
      featuresJson: ['Xuất khẩu', 'Tùy chỉnh', 'Hợp đồng riêng']
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan
    });
  }

  const newsCategories = [
    ['Tin HTX', 'tin-htx'],
    ['Tin thị trường', 'tin-thi-truong'],
    ['Kiến thức nông nghiệp', 'kien-thuc-nong-nghiep'],
    ['Chuyển đổi số', 'chuyen-doi-so'],
    ['Truy xuất nguồn gốc', 'truy-xuat-nguon-goc'],
    ['Câu chuyện sản phẩm', 'cau-chuyen-san-pham']
  ];

  for (const [name, slug] of newsCategories) {
    await prisma.newsCategory.upsert({
      where: { slug },
      create: { name, slug, isActive: true },
      update: { name, isActive: true }
    });
  }

  await prisma.setting.upsert({
    where: { key: 'system.profile' },
    create: {
      key: 'system.profile',
      value: {
        appName: 'Agri Passport',
        supportEmail: 'Agripassport@gmail.com',
        manualPaymentEnabled: true,
        r2UploadEnabled: true
      },
      description: 'Cấu hình hệ thống mặc định'
    },
    update: {}
  });

  const siteAddress = 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp';
  const siteMapEmbedUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=105.668%2C10.3958%2C105.768%2C10.4958&layer=mapnik&marker=10.4458%2C105.718';

  await prisma.setting.upsert({
    where: { key: 'public.siteProfile' },
    create: {
      key: 'public.siteProfile',
      value: {
        appName: 'AGRIPASSPORT',
        hotline: '0907001200',
        hotlineDisplay: '0907 001 200',
        supportEmail: 'Agripassport@gmail.com',
        address: siteAddress,
        zaloUrl: '',
        messengerUrl: '',
        mapEmbedUrl: siteMapEmbedUrl,
        faqs: defaultPublicFaqs
      },
      description: 'Thông tin công khai của Agripassport dùng cho liên hệ, chân trang và hỗ trợ'
    },
    update: {}
  });

  const existingSiteProfile = await prisma.setting.findUnique({ where: { key: 'public.siteProfile' } });
  if (existingSiteProfile?.value && typeof existingSiteProfile.value === 'object' && !Array.isArray(existingSiteProfile.value)) {
    const current = existingSiteProfile.value as Record<string, unknown>;
    const currentMapEmbedUrl = typeof current.mapEmbedUrl === 'string' ? current.mapEmbedUrl.trim() : '';
    const currentFaqs = Array.isArray(current.faqs)
      ? current.faqs
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const record = item as Record<string, unknown>;
            const question = typeof record.question === 'string' ? record.question.trim() : '';
            const answer = typeof record.answer === 'string' ? record.answer.trim() : '';
            if (!question || !answer) return null;
            return { question, answer };
          })
          .filter((item): item is { question: string; answer: string } => Boolean(item))
      : [];
    const isLegacyMapEmbedUrl =
      !currentMapEmbedUrl ||
      currentMapEmbedUrl.includes('google.com/maps') ||
      currentMapEmbedUrl.includes('maps.google.com/maps') ||
      currentMapEmbedUrl ===
        'https://www.google.com/maps?q=S%E1%BB%91%20130%2C%20T%E1%BB%95%208%2C%20%E1%BA%A4p%20M%E1%BB%B9%20X%C6%B0%C6%A1ng%2C%20X%C3%A3%20M%E1%BB%B9%20Th%E1%BB%8D%2C%20T%E1%BB%89nh%20%C4%90%E1%BB%93ng%20Th%C3%A1p%2C%20Vi%E1%BB%87t%20Nam&output=embed' ||
      currentMapEmbedUrl ===
        'https://maps.google.com/maps?hl=vi&q=S%E1%BB%91%20130%2C%20T%E1%BB%95%208%2C%20%E1%BA%A4p%20M%E1%BB%B9%20X%C6%B0%C6%A1ng%2C%20X%C3%A3%20M%E1%BB%B9%20Th%E1%BB%8D%2C%20T%E1%BB%89nh%20%C4%90%E1%BB%93ng%20Th%C3%A1p%2C%20Vi%E1%BB%87t%20Nam&z=16&output=embed' ||
      currentMapEmbedUrl.includes('S%E1%BB%91%20322') ||
      currentMapEmbedUrl.includes('M%E1%BB%B9%20Xu%C3%A2n') ||
      currentMapEmbedUrl.includes('So%20322') ||
      currentMapEmbedUrl.includes('My%20Xuan') ||
      currentMapEmbedUrl.includes('M%E1%BB%B9%20X%C6%B0%C6%A1ng') ||
      currentMapEmbedUrl.includes('My%20Xuong');
    const hasLookupSupportFaq = currentFaqs.some(
      (item) => normalizePlainText(item.question) === normalizePlainText(defaultPublicFaqs[3].question)
    );
    const hasInternalFaqCopy = currentFaqs.some((item) => /HTXONLINE|COD|giỏ hàng|thanh toán|đơn hàng/i.test(`${item.question} ${item.answer}`));
    const nextFaqs =
      currentFaqs.length === 0 || hasInternalFaqCopy ? [...defaultPublicFaqs] : hasLookupSupportFaq ? currentFaqs : [...currentFaqs, defaultPublicFaqs[3]];
    const nextValue: Prisma.InputJsonObject = {
      ...current,
      appName: 'AGRIPASSPORT',
      hotline:
        typeof current.hotline === 'string' && current.hotline.trim() && current.hotline !== '0900000000' ? current.hotline : '0907001200',
      hotlineDisplay:
        typeof current.hotlineDisplay === 'string' && current.hotlineDisplay.trim() && current.hotlineDisplay !== '0900 000 000'
          ? current.hotlineDisplay
          : '0907 001 200',
      supportEmail:
        typeof current.supportEmail === 'string' && current.supportEmail.trim() && current.supportEmail !== 'support@htxonline.vn'
          ? current.supportEmail
          : 'Agripassport@gmail.com',
      address: siteAddress,
      mapEmbedUrl: isLegacyMapEmbedUrl ? siteMapEmbedUrl : currentMapEmbedUrl,
      zaloUrl: typeof current.zaloUrl === 'string' ? (current.zaloUrl === 'https://zalo.me' ? '' : current.zaloUrl) : '',
      faqs: nextFaqs
    };
    if (
      current.hotline !== nextValue.hotline ||
      current.appName !== nextValue.appName ||
      current.hotlineDisplay !== nextValue.hotlineDisplay ||
      current.supportEmail !== nextValue.supportEmail ||
      current.address !== nextValue.address ||
      current.mapEmbedUrl !== nextValue.mapEmbedUrl ||
      current.zaloUrl !== nextValue.zaloUrl ||
      JSON.stringify(current.faqs ?? null) !== JSON.stringify(nextValue.faqs)
    ) {
      await prisma.setting.update({
        where: { key: 'public.siteProfile' },
        data: { value: nextValue }
      });
    }
  }

  const email = process.env.SEED_SUPER_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);
  const role = await prisma.role.findUniqueOrThrow({ where: { slug: 'SUPER_ADMIN' } });

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      fullName: 'Super Admin',
      passwordHash,
      status: 'ACTIVE'
    },
    update: {
      passwordHash,
      status: 'ACTIVE'
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: role.id
      }
    },
    create: {
      userId: admin.id,
      roleId: role.id
    },
    update: {}
  });

  const newsCount = await seedPassportNews(admin.id);
  console.log(`Seeded ${newsCount} bài tin tức Hộ chiếu nông nghiệp`);

  console.log(`Seed done. Super Admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function normalizePlainText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
