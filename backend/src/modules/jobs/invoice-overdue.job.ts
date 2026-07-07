import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceOverdueJob {
  private readonly logger = new Logger(InvoiceOverdueJob.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async markOverdueInvoices() {
    const now = new Date();
    const invoices = await this.prisma.subscriptionInvoice.updateMany({
      where: {
        status: 'UNPAID',
        dueDate: { lt: now }
      },
      data: { status: 'OVERDUE' }
    });
    const subscriptions = await this.prisma.cooperativeSubscription.updateMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        endDate: { lt: now }
      },
      data: { status: 'EXPIRED' }
    });
    if (invoices.count || subscriptions.count) {
      this.logger.log(`Marked ${invoices.count} invoices OVERDUE and ${subscriptions.count} subscriptions EXPIRED`);
    }
  }
}
