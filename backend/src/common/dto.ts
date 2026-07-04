import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateIf
} from 'class-validator';
import {
  CooperativeStatus,
  FarmingActivityType,
  FarmingLogStatus,
  FileVisibility,
  InvoiceStatus,
  MemberStatus,
  OrderStatus,
  PassportStatus,
  ProductStatus,
  RoleSlug,
  SubscriptionStatus,
  UserStatus,
  ZoneStatus
} from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @IsOptional()
  @IsEnum(RoleSlug)
  role?: RoleSlug;

  @IsOptional()
  @IsUUID()
  cooperativeId?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class CreateUserDto extends RegisterDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsOptional()
  @IsArray()
  roles?: RoleSlug[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class CreateCooperativeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  representative?: string;

  @IsOptional()
  @IsEnum(CooperativeStatus)
  status?: CooperativeStatus;
}

export class UpdateCooperativeDto extends CreateCooperativeDto {
  @IsOptional()
  override name!: string;

  @IsOptional()
  override code!: string;

  @IsOptional()
  override address!: string;
}

export class AssignAdminDto {
  @IsUUID()
  userId!: string;
}

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMonthly!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceYearly!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCooperatives?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxProducts?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMembers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxZones?: number;

  @IsOptional()
  @IsArray()
  featuresJson?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSubscriptionPlanDto extends CreateSubscriptionPlanDto {
  @IsOptional()
  override name!: string;

  @IsOptional()
  override slug!: string;

  @IsOptional()
  override priceMonthly!: number;

  @IsOptional()
  override priceYearly!: number;
}

export class AssignSubscriptionDto {
  @IsUUID()
  planId!: string;

  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateInvoiceDto {
  @IsUUID()
  cooperativeId!: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsOptional()
  @IsString()
  invoiceCode?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class MarkPaidDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class RestoreBackupDto {
  @IsString()
  @IsNotEmpty()
  confirmation!: string;
}

export class CreateCategoryDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateProductDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsUUID()
  thumbnailFileId?: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @IsOptional()
  @IsUUID()
  farmerId?: string;

  @IsOptional()
  @IsString()
  packagingInfo?: string;

  @IsOptional()
  @IsString()
  specification?: string;
}

export class UpdateProductDto extends CreateProductDto {
  @IsOptional()
  override code!: string;

  @IsOptional()
  override name!: string;

  @IsOptional()
  override price!: number;

  @IsOptional()
  override unit!: string;
}

export class CreateZoneDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  areaM2?: number;

  @IsOptional()
  @IsObject()
  geojson?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(ZoneStatus)
  status?: ZoneStatus;
}

export class UpdateZoneDto extends CreateZoneDto {
  @IsOptional()
  override name!: string;

  @IsOptional()
  override code!: string;
}

export class CreateFarmingLogDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @Type(() => Date)
  @IsDate()
  logDate!: Date;

  @IsEnum(FarmingActivityType)
  activityType!: FarmingActivityType;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsArray()
  inputMaterialsJson?: unknown[];

  @IsOptional()
  @IsArray()
  imagesJson?: unknown[];

  @IsOptional()
  @IsEnum(FarmingLogStatus)
  status?: FarmingLogStatus;
}

export class UpdateFarmingLogDto extends CreateFarmingLogDto {
  @IsOptional()
  override productId!: string;

  @IsOptional()
  override logDate!: Date;

  @IsOptional()
  override activityType!: FarmingActivityType;

  @IsOptional()
  override description!: string;
}

export class CreatePassportDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsEnum(PassportStatus)
  status?: PassportStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiredAt?: Date;
}

export class UpdatePassportDto {
  @IsOptional()
  @IsEnum(PassportStatus)
  status?: PassportStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiredAt?: Date;
}

export class PresignUploadDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsOptional()
  @IsEnum(FileVisibility)
  visibility?: FileVisibility;
}

export class ConfirmUploadDto extends PresignUploadDto {
  @IsString()
  @IsNotEmpty()
  objectKey!: string;

  @IsOptional()
  @IsString()
  checksum?: string;

  @IsOptional()
  @IsString()
  publicUrl?: string;
}

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class UpsertSettingDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsObject()
  value!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  cooperativeId?: string;

  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
