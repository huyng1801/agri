import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreatePassportDto, UpdatePassportDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { PassportsService } from './passports.service';

@ApiTags('passports')
@ApiBearerAuth()
@Controller()
export class PassportsController {
  constructor(private readonly passports: PassportsService) {}

  @Get('passports')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('passports.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.passports.list(user, query);
  }

  @Get('passports/:id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('passports.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.passports.get(user, id);
  }

  @Post('passports')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('passports.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePassportDto) {
    return this.passports.create(user, dto);
  }

  @Patch('passports/:id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('passports.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdatePassportDto) {
    return this.passports.update(user, id, dto);
  }

  @Delete('passports/:id')
  @Roles(RoleSlug.ADMIN_HTX)
  @Permissions('passports.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.passports.remove(user, id);
  }

  @Public()
  @Get('public/passports/:code')
  publicPassport(@Param('code') code: string) {
    return this.passports.publicPassport(code);
  }
}
