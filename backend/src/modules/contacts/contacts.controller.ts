import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateContactInquiryDto, UpdateContactInquiryDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { ContactsService } from './contacts.service';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Public()
  @Post('public')
  createPublic(@Body() dto: CreateContactInquiryDto) {
    return this.contacts.createPublic(dto);
  }

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('contacts.read')
  list(@Query() query: Record<string, unknown>) {
    return this.contacts.list(query);
  }

  @Patch(':id')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('contacts.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateContactInquiryDto) {
    return this.contacts.update(user, id, dto);
  }
}
