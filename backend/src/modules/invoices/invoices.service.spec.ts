import { BadRequestException } from '@nestjs/common';
import { InvoiceStatus, RoleSlug } from '@prisma/client';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  const user = {
    id: 'super-admin',
    email: 'admin@agri.test',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['invoices.*']
  };

  const invoice = {
    id: 'invoice-1',
    cooperativeId: 'coop-1',
    subscriptionId: 'sub-1',
    invoiceCode: 'INV-2026-TEST',
    amount: 100000,
    currency: 'VND',
    status: InvoiceStatus.PAID,
    dueDate: new Date('2026-07-10'),
    paidAt: new Date('2026-07-04'),
    paymentMethod: 'manual',
    note: 'Test',
    cooperative: { id: 'coop-1', name: 'HTX Test', code: 'HTXTEST' },
    subscription: { id: 'sub-1', plan: { name: 'Basic' } }
  };

  const audit = { record: jest.fn() };
  const payments = { createForInvoice: jest.fn(), createForOrder: jest.fn() };

  it('rejects creating an invoice for a subscription from another cooperative', async () => {
    const service = new InvoicesService(
      {
        cooperative: { findUnique: jest.fn().mockResolvedValue({ id: 'coop-1' }) },
        cooperativeSubscription: { findUnique: jest.fn().mockResolvedValue({ id: 'sub-1', cooperativeId: 'coop-2' }) }
      } as never,
      audit as never,
      payments as never
    );

    await expect(
      service.create(user, {
        cooperativeId: 'coop-1',
        subscriptionId: 'sub-1',
        amount: 100000,
        dueDate: new Date('2026-07-10')
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks a paid invoice back to unpaid and clears payment metadata', async () => {
    const update = jest.fn(({ data }) => ({ ...invoice, ...data }));
    const service = new InvoicesService(
      {
        subscriptionInvoice: {
          findUnique: jest.fn().mockResolvedValue(invoice),
          update
        }
      } as never,
      audit as never,
      payments as never
    );

    await service.markUnpaid(user, 'invoice-1');

    expect(update.mock.calls[0][0].data).toMatchObject({
      status: InvoiceStatus.UNPAID,
      paidAt: null,
      paymentMethod: null
    });
  });

  it('creates a payment record when marking invoice paid', async () => {
    const unpaid = { ...invoice, status: InvoiceStatus.UNPAID, paidAt: null, paymentMethod: null };
    const update = jest.fn(({ data }) => ({ ...unpaid, ...data }));
    const service = new InvoicesService(
      {
        subscriptionInvoice: {
          findUnique: jest.fn().mockResolvedValue(unpaid),
          update
        }
      } as never,
      audit as never,
      payments as never
    );

    await service.markPaid(user, 'invoice-1', { paymentMethod: 'bank_transfer' });

    expect(payments.createForInvoice).toHaveBeenCalledWith('invoice-1', unpaid.amount, 'bank_transfer');
  });

  it('rejects cancelling an already paid invoice', async () => {
    const service = new InvoicesService(
      {
        subscriptionInvoice: {
          findUnique: jest.fn().mockResolvedValue(invoice)
        }
      } as never,
      audit as never,
      payments as never
    );

    await expect(service.cancel(user, 'invoice-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('exports a basic PDF buffer for an invoice', async () => {
    const service = new InvoicesService(
      {
        subscriptionInvoice: {
          findUnique: jest.fn().mockResolvedValue(invoice)
        }
      } as never,
      audit as never,
      payments as never
    );

    const file = await service.pdf(user, 'invoice-1');

    expect(file.fileName).toBe('INV-2026-TEST.pdf');
    expect(file.buffer.toString('ascii', 0, 8)).toBe('%PDF-1.4');
  });
});
