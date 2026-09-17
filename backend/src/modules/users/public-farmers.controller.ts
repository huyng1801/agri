import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from './users.service';

@ApiTags('public-farmers')
@Controller('public/farmers')
export class PublicFarmersController {
  constructor(private readonly users: UsersService) {}

  @Public()
  @Get(':id')
  get(@Param('id') id: string) {
    return this.users.publicFarmer(id);
  }
}
