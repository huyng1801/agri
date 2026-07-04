import { PrismaClient, RoleSlug } from '@prisma/client';
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
    'reports.overview',
    'reports.revenue',
    'settings.*',
    'audit_logs.*',
    'backups.*',
    'notifications.*',
    'product_categories.*'
  ],
  ADMIN_HTX: [
    'cooperatives.read',
    'cooperatives.update',
    'users.read',
    'users.create',
    'subscription_plans.read',
    'subscriptions.read',
    'invoices.read',
    'products.*',
    'zones.*',
    'farming_logs.*',
    'passports.*',
    'reports.read',
    'files.*',
    'notifications.*'
  ],
  MEMBER_HTX: ['products.read', 'products.create', 'products.update', 'zones.read', 'farming_logs.*', 'passports.read', 'passports.create', 'files.*'],
  FARMER: ['products.read', 'zones.read', 'farming_logs.create', 'farming_logs.read', 'notifications.read'],
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

  await prisma.setting.upsert({
    where: { key: 'system.profile' },
    create: {
      key: 'system.profile',
      value: {
        appName: 'Agri Passport',
        supportEmail: 'support@example.com',
        manualPaymentEnabled: true,
        r2UploadEnabled: true
      },
      description: 'Cấu hình hệ thống mặc định'
    },
    update: {}
  });

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
