import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateFarmingLogDto, UpdateFarmingLogDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { FarmingLogsService } from './farming-logs.service';

@ApiTags('farming-logs')
@ApiBearerAuth()
@Controller('farming-logs')
export class FarmingLogsController {
  constructor(private readonly logs: FarmingLogsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.logs.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.logs.get(user, id);
  }

  @Post()
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFarmingLogDto) {
    return this.logs.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateFarmingLogDto) {
    return this.logs.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.logs.remove(user, id);
  }
}
