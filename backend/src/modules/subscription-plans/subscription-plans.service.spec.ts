import { BadRequestException } from '@nestjs/common';
import { RoleSlug } from '@prisma/client';
import { SubscriptionPlansService } from './subscription-plans.service';

describe('SubscriptionPlansService', () => {
  const superAdmin = {
    id: 'sa-1',
    email: 'admin@agri.local',
    fullName: 'Super Admin',
    cooperativeId: null,
    roles: [RoleSlug.SUPER_ADMIN],
    permissions: ['subscription_plans.create']
  };

  it('creates a subscription plan', async () => {
    const create = jest.fn(({ data }) => ({ id: 'plan-1', ...data }));
    const service = new SubscriptionPlansService(
      { subscriptionPlan: { create, findUnique: jest.fn().mockResolvedValue(null) } } as never,
      { record: jest.fn() } as never
    );

    const result = await service.create(superAdmin, {
      name: 'Basic',
      slug: 'basic',
      priceMonthly: 100000,
      priceYearly: 1000000,
      isActive: true
    });

    expect(result.slug).toBe('basic');
    expect(create).toHaveBeenCalled();
  });

  it('rejects duplicate slug', async () => {
    const service = new SubscriptionPlansService(
      { subscriptionPlan: { findUnique: jest.fn().mockResolvedValue({ id: 'existing', slug: 'basic' }) } } as never,
      { record: jest.fn() } as never
    );

    await expect(
      service.create(superAdmin, {
        name: 'Basic',
        slug: 'basic',
        priceMonthly: 100000,
        priceYearly: 1000000,
        isActive: true
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
