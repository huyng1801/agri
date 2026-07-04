import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignSubscriptionDto, UpdateSubscriptionDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('cooperative-subscriptions')
@ApiBearerAuth()
@Controller('cooperatives/:id/subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  @Roles(RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN_HTX)
  @Permissions('subscriptions.read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.subscriptions.get(user, id);
  }

  @Post()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('subscriptions.assign')
  assign(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.subscriptions.assign(user, id, dto);
  }

  @Patch()
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('subscriptions.update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptions.update(user, id, dto);
  }

  @Post('renew')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('subscriptions.renew')
  renew(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.subscriptions.renew(user, id, dto);
  }

  @Post('cancel')
  @Roles(RoleSlug.SUPER_ADMIN)
  @Permissions('subscriptions.cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.subscriptions.cancel(user, id);
  }
}
