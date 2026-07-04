import { Body, Controller, Get, Param, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RestoreBackupDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { BackupsService } from './backups.service';

@ApiTags('backups')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN)
@Controller('backups')
export class BackupsController {
  constructor(private readonly backups: BackupsService) {}

  @Get()
  @Permissions('backups.read')
  list() {
    return this.backups.list();
  }

  @Post()
  @Permissions('backups.create')
  create(@CurrentUser() user: AuthUser) {
    return this.backups.create(user);
  }

  @Get(':fileName/download')
  @Permissions('backups.download')
  async download(@Param('fileName') fileName: string, @Res({ passthrough: true }) response: Response) {
    const file = await this.backups.download(fileName);
    response.set({
      'Content-Type': 'application/gzip',
      'Content-Length': file.sizeBytes.toString(),
      'Content-Disposition': `attachment; filename="${file.fileName}"`
    });
    return new StreamableFile(file.stream);
  }

  @Post(':fileName/restore')
  @Permissions('backups.restore')
  restore(@CurrentUser() user: AuthUser, @Param('fileName') fileName: string, @Body() dto: RestoreBackupDto) {
    return this.backups.restore(user, fileName, dto);
  }
}
