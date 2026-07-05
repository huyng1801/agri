import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCertificationDto, UpdateCertificationDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { CertificationsService } from './certifications.service';

@ApiTags('certifications')
@ApiBearerAuth()
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certifications: CertificationsService) {}

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('certifications.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.certifications.list(user, query);
  }

  @Get(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('certifications.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.certifications.get(user, id);
  }

  @Post()
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('certifications.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCertificationDto) {
    return this.certifications.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Permissions('certifications.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCertificationDto) {
    return this.certifications.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleSlug.ADMIN_HTX)
  @Permissions('certifications.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.certifications.remove(user, id);
  }
}
