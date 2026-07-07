import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceOverdueJob } from './invoice-overdue.job';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [InvoiceOverdueJob]
})
export class JobsModule {}
