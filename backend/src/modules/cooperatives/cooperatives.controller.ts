import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignAdminDto, CreateCooperativeDto, UpdateCooperativeDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { CooperativesService } from './cooperatives.service';

@ApiTags('cooperatives')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
@Controller('cooperatives')
export class CooperativesController {
  constructor(private readonly cooperatives: CooperativesService) {}

  @Get()
  @Permissions('cooperatives.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.cooperatives.list(user, query);
  }

  @Get(':id')
  @Permissions('cooperatives.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cooperatives.get(user, id);
  }

  @Get(':id/stats')
  @Permissions('cooperatives.read')
  stats(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cooperatives.stats(user, id);
  }

  @Post()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('cooperatives.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCooperativeDto) {
    return this.cooperatives.create(user, dto);
  }

  @Patch(':id')
  @Permissions('cooperatives.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCooperativeDto) {
    return this.cooperatives.update(user, id, dto);
  }

  @Post(':id/assign-admin')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('cooperatives.assign_admin')
  assignAdmin(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignAdminDto) {
    return this.cooperatives.assignAdmin(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('cooperatives.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cooperatives.remove(user, id);
  }
}
