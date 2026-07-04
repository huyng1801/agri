import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Permissions('users.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.users.list(user, query);
  }

  @Get('roles')
  @Permissions('users.read')
  roles(@CurrentUser() user: AuthUser) {
    return this.users.roles(user);
  }

  @Get(':id')
  @Permissions('users.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.get(user, id);
  }

  @Post()
  @Permissions('users.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.users.create(user, dto);
  }

  @Patch(':id')
  @Permissions('users.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(user, id, dto);
  }

  @Delete(':id')
  @Permissions('users.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.remove(user, id);
  }
}
