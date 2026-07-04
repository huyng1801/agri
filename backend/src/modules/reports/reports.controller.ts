import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
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

  @Get('revenue')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('reports.revenue')
  revenue(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.revenue(user, query);
  }

  @Post('snapshots/:type')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('reports.snapshots')
  snapshot(@CurrentUser() user: AuthUser, @Param('type') type: string, @Query() query: Record<string, unknown>) {
    return this.reports.exportSnapshot(user, type, query);
  }
}
