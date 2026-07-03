import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ConfirmUploadDto, PresignUploadDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { FilesService } from './files.service';

@ApiTags('files')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX, RoleSlug.FARMER)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.files.list(user, query);
  }

  @Post('presign-upload')
  presign(@CurrentUser() user: AuthUser, @Body() dto: PresignUploadDto) {
    return this.files.presign(user, dto);
  }

  @Post('confirm-upload')
  confirm(@CurrentUser() user: AuthUser, @Body() dto: ConfirmUploadDto) {
    return this.files.confirm(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.files.get(user, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.files.remove(user, id);
  }
}
