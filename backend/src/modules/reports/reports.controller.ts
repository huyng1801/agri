import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('overview')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  @Permissions('reports.overview')
  overview(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.overview(user, query);
  }

  @Get('production')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('reports.overview')
  production(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.production(user, query);
  }

  @Get('traceability')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('reports.overview')
  traceability(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.traceability(user, query);
  }

  @Get('quality')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('reports.overview')
  quality(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.quality(user, query);
  }

  @Get('revenue')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('reports.revenue')
  revenue(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.revenue(user, query);
  }

  @Get('snapshots')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('reports.snapshots')
  snapshots(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.listSnapshots(user, query);
  }

  @Get('snapshots/:id/download')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('reports.snapshots')
  downloadSnapshot(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reports.downloadSnapshot(user, id);
  }

  @Get('export/:type')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('reports.overview')
  export(@CurrentUser() user: AuthUser, @Param('type') type: string, @Query() query: Record<string, unknown>) {
    return this.reports.exportFile(user, type, query);
  }

  @Post('snapshots/:type')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('reports.snapshots')
  snapshot(@CurrentUser() user: AuthUser, @Param('type') type: string, @Query() query: Record<string, unknown>) {
    return this.reports.exportSnapshot(user, type, query);
  }
}
