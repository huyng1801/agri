import { SubscriptionStatus, RoleSlug } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  const user = {
    id: 'super-admin',
    email: 'admin@agri.test',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['subscriptions.assign']
  };

  it('assigns a subscription and creates an invoice when requested', async () => {
    const subscriptionCreate = jest.fn(({ data }) => ({
      id: 'sub-1',
      ...data,
      plan: { id: data.planId, name: 'Basic' },
      cooperative: { id: data.cooperativeId }
    }));
    const invoiceCreate = jest.fn(({ data }) => ({ id: 'invoice-1', ...data }));
    const service = new SubscriptionsService(
      {
        cooperative: { findUnique: jest.fn().mockResolvedValue({ id: 'coop-1' }) },
        subscriptionPlan: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'plan-1',
            isActive: true,
            priceMonthly: 299000,
            priceYearly: 2990000
          })
        },
        cooperativeSubscription: {
          updateMany: jest.fn(),
          create: subscriptionCreate
        },
        subscriptionInvoice: {
          create: invoiceCreate
        }
      } as never,
      { record: jest.fn() } as never
    );

    await service.assign(user, 'coop-1', {
      planId: 'plan-1',
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2027-07-01'),
      createInvoice: true
    });

    expect(subscriptionCreate.mock.calls[0][0].data).toMatchObject({
      cooperativeId: 'coop-1',
      planId: 'plan-1',
      status: SubscriptionStatus.ACTIVE
    });
    expect(invoiceCreate.mock.calls[0][0].data).toMatchObject({
      cooperativeId: 'coop-1',
      subscriptionId: 'sub-1',
      amount: 2990000,
      status: 'UNPAID'
    });
  });
});
