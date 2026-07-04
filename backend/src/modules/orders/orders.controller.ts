import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateOrderDto, UpdateOrderDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  list(@CurrentUser() user: AuthUser, @Query() query: Record<string, unknown>) {
    return this.orders.list(user, query);
  }

  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user, dto);
  }

  @Roles(RoleSlug.ADMIN_HTX, RoleSlug.MEMBER_HTX)
  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orders.update(user, id, dto);
  }
}
