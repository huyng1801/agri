import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpsertSettingDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('settings.read')
  list() {
    return this.settings.list();
  }

  @Public()
  @Get('public/site-profile')
  publicSiteProfile() {
    return this.settings.publicSiteProfile();
  }

  @Post('test-r2')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('settings.update')
  testR2() {
    return this.settings.testR2();
  }

  @Post()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('settings.update')
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertSettingDto) {
    return this.settings.upsert(user, dto);
  }
}
