import { Prisma, PrismaClient, RoleSlug } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
    'files.*'
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
    'news.*'
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
    'orders.*'
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
    'notifications.update'
  ],
  BUYER: ['public.read', 'orders.read']
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

  const siteAddress = 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp, Việt Nam';
  const siteMapEmbedUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=105.668%2C10.3958%2C105.768%2C10.4958&layer=mapnik&marker=10.4458%2C105.718';

  await prisma.setting.upsert({
    where: { key: 'public.siteProfile' },
    create: {
      key: 'public.siteProfile',
      value: {
        appName: 'HTXONLINE',
        hotline: '0907001200',
        hotlineDisplay: '0907 001 200',
        supportEmail: 'Agripassport@gmail.com',
        address: siteAddress,
        zaloUrl: '',
        messengerUrl: '',
        mapEmbedUrl: siteMapEmbedUrl,
        faqs: [
          {
            question: 'HTXONLINE hỗ trợ gì cho hợp tác xã?',
            answer: 'Quản lý sản phẩm, vùng trồng, QR truy xuất và bán hàng COD trên cùng một nền tảng.'
          },
          {
            question: 'Người mua có cần tài khoản để xem QR không?',
            answer: 'Không. QR Passport public được mở trực tiếp cho khách truy cập.'
          },
          {
            question: 'Ai xác nhận đơn hàng COD?',
            answer: 'HTX hoặc bộ phận vận hành sẽ gọi điện xác nhận trước khi giao hàng.'
          }
        ]
      },
      description: 'Thông tin public của HTXONLINE dùng cho contact/footer/floating actions'
    },
    update: {}
  });

  const existingSiteProfile = await prisma.setting.findUnique({ where: { key: 'public.siteProfile' } });
  if (existingSiteProfile?.value && typeof existingSiteProfile.value === 'object' && !Array.isArray(existingSiteProfile.value)) {
    const current = existingSiteProfile.value as Record<string, unknown>;
    const currentMapEmbedUrl = typeof current.mapEmbedUrl === 'string' ? current.mapEmbedUrl.trim() : '';
    const isLegacyMapEmbedUrl =
      !currentMapEmbedUrl ||
      currentMapEmbedUrl.includes('google.com/maps') ||
      currentMapEmbedUrl.includes('maps.google.com/maps') ||
      currentMapEmbedUrl ===
        'https://www.google.com/maps?q=S%E1%BB%91%20322%20%E1%BA%A4p%20M%E1%BB%B9%20Xu%C3%A2n%2C%20X%C3%A3%20M%E1%BB%B9%20Th%E1%BB%8D%2C%20T%E1%BB%89nh%20%C4%90%E1%BB%93ng%20Th%C3%A1p%2C%20Vi%E1%BB%87t%20Nam&output=embed' ||
      currentMapEmbedUrl ===
        'https://maps.google.com/maps?hl=vi&q=S%E1%BB%91%20322%20%E1%BA%A4p%20M%E1%BB%B9%20Xu%C3%A2n%2C%20X%C3%A3%20M%E1%BB%B9%20Th%E1%BB%8D%2C%20T%E1%BB%89nh%20%C4%90%E1%BB%93ng%20Th%C3%A1p%2C%20Vi%E1%BB%87t%20Nam&z=16&output=embed' ||
      currentMapEmbedUrl.includes('S%E1%BB%91%20322') ||
      currentMapEmbedUrl.includes('M%E1%BB%B9%20Xu%C3%A2n');
    const nextValue: Prisma.InputJsonObject = {
      ...current,
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
      zaloUrl: typeof current.zaloUrl === 'string' ? (current.zaloUrl === 'https://zalo.me' ? '' : current.zaloUrl) : ''
    };
    if (
      current.hotline !== nextValue.hotline ||
      current.hotlineDisplay !== nextValue.hotlineDisplay ||
      current.supportEmail !== nextValue.supportEmail ||
      current.address !== nextValue.address ||
      current.mapEmbedUrl !== nextValue.mapEmbedUrl ||
      current.zaloUrl !== nextValue.zaloUrl
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
