import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { PublicFarmersController } from './public-farmers.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [FilesModule],
  controllers: [UsersController, PublicFarmersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
