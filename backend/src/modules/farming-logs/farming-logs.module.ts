import { Module } from '@nestjs/common';
import { FarmingLogsController } from './farming-logs.controller';
import { FarmingLogsService } from './farming-logs.service';

@Module({
  controllers: [FarmingLogsController],
  providers: [FarmingLogsService],
  exports: [FarmingLogsService]
})
export class FarmingLogsModule {}
