import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { SubscriptionPlansService } from './subscription-plans.service';

@ApiTags('subscription-plans')
@ApiBearerAuth()
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly plans: SubscriptionPlansService) {}

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('subscription_plans.read')
  list(@Query() query: Record<string, unknown>) {
    return this.plans.list(query);
  }

  @Get(':id')
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('subscription_plans.read')
  get(@Param('id') id: string) {
    return this.plans.get(id);
  }

  @Roles(RoleSlug.SUPER_ADMIN)
  @Post()
  @Permissions('subscription_plans.create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSubscriptionPlanDto) {
    return this.plans.create(user, dto);
  }

  @Roles(RoleSlug.SUPER_ADMIN)
  @Patch(':id')
  @Permissions('subscription_plans.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.plans.update(user, id, dto);
  }

  @Roles(RoleSlug.SUPER_ADMIN)
  @Delete(':id')
  @Permissions('subscription_plans.delete')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.plans.remove(user, id);
  }
}
