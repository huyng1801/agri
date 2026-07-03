import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.overview(user, query);
  }

  @Get('revenue')
  revenue(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.reports.revenue(user, query);
  }

  @Post('snapshots/:type')
  snapshot(@CurrentUser() user: AuthUser, @Param('type') type: string, @Query() query: Record<string, unknown>) {
    return this.reports.exportSnapshot(user, type, query);
  }
}
