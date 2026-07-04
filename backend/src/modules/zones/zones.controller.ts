import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateZoneDto, UpdateZoneDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { ZonesService } from './zones.service';

@ApiTags('zones')
@ApiBearerAuth()
@Controller('zones')
export class ZonesController {
  constructor(private readonly zones: ZonesService) {}

  @Get()
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  @Permissions('zones.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.zones.list(user, query);
  }

  @Get(':id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
  @Permissions('zones.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.zones.get(user, id);
  }

  @Post()
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('zones.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateZoneDto) {
    return this.zones.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('zones.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateZoneDto) {
    return this.zones.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.ADMIN_HTX)
  @Permissions('zones.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.zones.remove(user, id);
  }
}
