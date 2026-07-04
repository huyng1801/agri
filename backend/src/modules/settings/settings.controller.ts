import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpsertSettingDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @Permissions('settings.read')
  list() {
    return this.settings.list();
  }

  @Post()
  @Permissions('settings.update')
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertSettingDto) {
    return this.settings.upsert(user, dto);
  }
}
