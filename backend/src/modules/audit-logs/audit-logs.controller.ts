import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.service.list(query);
  }
}
