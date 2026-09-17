import { Module } from '@nestjs/common';
import { PublicFarmersController } from './public-farmers.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, PublicFarmersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
