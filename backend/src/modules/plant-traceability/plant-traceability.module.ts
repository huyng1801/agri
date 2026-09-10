import { Module } from '@nestjs/common';
import { PlantTraceabilityController } from './plant-traceability.controller';
import { PlantTraceabilityService } from './plant-traceability.service';

@Module({
  controllers: [PlantTraceabilityController],
  providers: [PlantTraceabilityService],
  exports: [PlantTraceabilityService]
})
export class PlantTraceabilityModule {}
