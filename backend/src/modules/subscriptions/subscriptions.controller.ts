import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleSlug } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignSubscriptionDto } from '../../common/dto';
import { AuthUser } from '../../common/types';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('cooperative-subscriptions')
@ApiBearerAuth()
@Roles(RoleSlug.SUPER_ADMIN)
@Controller('cooperatives/:id/subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  get(@Param('id') id: string) {
    return this.subscriptions.get(id);
  }

  @Post()
  assign(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.subscriptions.assign(user, id, dto);
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.subscriptions.update(user, id, dto);
  }

  @Post('renew')
  renew(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.subscriptions.renew(user, id, dto);
  }

  @Post('cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.subscriptions.cancel(user, id);
  }
}
