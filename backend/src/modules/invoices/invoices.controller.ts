import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateInvoiceDto, MarkPaidDto, UpdateInvoiceDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('invoices.read')
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.invoices.list(user, query);
  }

  @Get(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('invoices.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoices.get(user, id);
  }

  @Roles(RoleSlug.SUPER_ADMIN)
  @Post()
  @Permissions('invoices.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInvoiceDto) {
    return this.invoices.create(user, dto);
  }

  @Roles(RoleSlug.SUPER_ADMIN)
  @Patch(':id')
  @Permissions('invoices.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoices.update(user, id, dto);
  }

  @Roles(RoleSlug.SUPER_ADMIN)
  @Post(':id/mark-paid')
  @Permissions('invoices.mark_paid')
  markPaid(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: MarkPaidDto) {
    return this.invoices.markPaid(user, id, dto);
  }
}
