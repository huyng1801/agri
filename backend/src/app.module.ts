import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CooperativesModule } from './modules/cooperatives/cooperatives.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ProductsModule } from './modules/products/products.module';
import { ZonesModule } from './modules/zones/zones.module';
import { FarmingLogsModule } from './modules/farming-logs/farming-logs.module';
import { PassportsModule } from './modules/passports/passports.module';
import { FilesModule } from './modules/files/files.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BackupsModule } from './modules/backups/backups.module';
import { RolesModule } from './modules/roles/roles.module';
import { NewsModule } from './modules/news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_LIMIT_TTL || 60) * 1000,
        limit: Number(process.env.RATE_LIMIT_MAX || 120)
      }
    ]),
    JwtModule.register({ global: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CooperativesModule,
    SubscriptionPlansModule,
    SubscriptionsModule,
    InvoicesModule,
    ProductsModule,
    ZonesModule,
    FarmingLogsModule,
    PassportsModule,
    FilesModule,
    ReportsModule,
    NotificationsModule,
    SettingsModule,
    AuditLogsModule,
    OrdersModule,
    BackupsModule,
    NewsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    }
  ]
})
export class AppModule {}
