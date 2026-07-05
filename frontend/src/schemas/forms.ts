import { z } from 'zod';

const phone = z.string().regex(/^(0|\+84)[0-9]{8,10}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal(''));
const email = z.string().email('Email không hợp lệ');
const optionalEmail = z.string().email('Email không hợp lệ').optional().or(z.literal(''));
const money = z.coerce.number().min(0, 'Giá trị không được âm');

export const loginSchema = z.object({
  email,
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự')
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(1, 'Tên người dùng bắt buộc'),
  phone
});

export const cooperativeSchema = z.object({
  name: z.string().min(1, 'Tên HTX bắt buộc'),
  code: z.string().min(1, 'Mã HTX bắt buộc'),
  taxCode: z.string().optional(),
  phone,
  email: optionalEmail,
  address: z.string().min(1, 'Địa chỉ bắt buộc'),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  representative: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).default('ACTIVE')
});

export const userSchema = z.object({
  fullName: z.string().min(1, 'Tên người dùng bắt buộc'),
  email,
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  phone,
  role: z.enum(['SUPER_ADMIN', 'ADMIN_HTX', 'MEMBER_HTX', 'FARMER', 'BUYER']).default('MEMBER_HTX'),
  cooperativeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).default('ACTIVE')
});

export const planSchema = z.object({
  name: z.string().min(1, 'Tên gói bắt buộc'),
  slug: z.string().min(1, 'Slug bắt buộc'),
  priceMonthly: money,
  priceYearly: money,
  maxCooperatives: z.coerce.number().min(0).optional().or(z.literal('')),
  maxProducts: z.coerce.number().min(0).optional().or(z.literal('')),
  maxMembers: z.coerce.number().min(0).optional().or(z.literal('')),
  maxZones: z.coerce.number().min(0).optional().or(z.literal('')),
  isActive: z.coerce.boolean().default(true)
});

export const invoiceSchema = z.object({
  cooperativeId: z.string().min(1, 'Chọn HTX'),
  subscriptionId: z.string().optional(),
  amount: money,
  currency: z.string().default('VND'),
  status: z.enum(['DRAFT', 'UNPAID', 'PAID', 'OVERDUE', 'CANCELLED']).default('UNPAID'),
  dueDate: z.string().min(1, 'Chọn hạn thanh toán'),
  paymentMethod: z.string().optional(),
  note: z.string().optional()
});

export const productSchema = z.object({
  cooperativeId: z.string().optional(),
  categoryId: z.string().optional(),
  code: z.string().min(1, 'Mã sản phẩm bắt buộc'),
  name: z.string().min(1, 'Tên sản phẩm bắt buộc'),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: money,
  unit: z.string().min(1, 'Đơn vị bắt buộc'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED']).default('DRAFT'),
  thumbnailFileId: z.string().optional(),
  zoneId: z.string().optional(),
  farmerId: z.string().optional(),
  packagingInfo: z.string().optional(),
  specification: z.string().optional()
});

export const zoneSchema = z.object({
  cooperativeId: z.string().optional(),
  name: z.string().min(1, 'Tên vùng bắt buộc'),
  code: z.string().min(1, 'Mã vùng bắt buộc'),
  address: z.string().optional(),
  areaM2: z.coerce.number().positive('Diện tích phải lớn hơn 0').optional().or(z.literal('')),
  latitude: z.coerce.number().optional().or(z.literal('')),
  longitude: z.coerce.number().optional().or(z.literal('')),
  isPublic: z.coerce.boolean().default(true),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE')
});

export const farmingLogSchema = z.object({
  cooperativeId: z.string().optional(),
  productId: z.string().min(1, 'Chọn sản phẩm'),
  zoneId: z.string().optional(),
  logDate: z.string().min(1, 'Chọn ngày nhật ký'),
  activityType: z.enum(['SEEDING', 'WATERING', 'FERTILIZING', 'PEST_CONTROL', 'HARVESTING', 'PACKAGING', 'TRANSPORT', 'OTHER']),
  description: z.string().min(1, 'Nội dung bắt buộc'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED')
});

export const passportSchema = z.object({
  cooperativeId: z.string().optional(),
  productId: z.string().min(1, 'Chọn sản phẩm'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'EXPIRED']).default('PUBLISHED'),
  expiredAt: z.string().optional()
});

export const orderSchema = z.object({
  cooperativeId: z.string().optional(),
  buyerId: z.string().optional(),
  orderCode: z.string().optional(),
  status: z.enum(['DRAFT', 'NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED']).default('NEW'),
  totalAmount: money,
  note: z.string().optional()
});

export const resourceSchemas = {
  cooperatives: cooperativeSchema,
  users: userSchema,
  'subscription-plans': planSchema,
  invoices: invoiceSchema,
  products: productSchema,
  zones: zoneSchema,
  'farming-logs': farmingLogSchema,
  passports: passportSchema,
  orders: orderSchema
};
