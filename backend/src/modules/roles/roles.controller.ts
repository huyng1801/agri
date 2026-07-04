import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateRoleDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN)
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Permissions('roles.read')
  list() {
    return this.roles.list();
  }

  @Get('permissions')
  @Permissions('permissions.read')
  permissions() {
    return this.roles.permissions();
  }

  @Patch(':slug')
  @Permissions('roles.update')
  update(@CurrentUser() user: AuthUser, @Param('slug') slug: RoleSlug, @Body() dto: UpdateRoleDto) {
    return this.roles.update(user, slug, dto);
  }
}
