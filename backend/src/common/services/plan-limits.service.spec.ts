import { ForbiddenException } from '@nestjs/common';
import { PlanLimitsService } from './plan-limits.service';

describe('PlanLimitsService', () => {
  const original = process.env.PLAN_ENFORCEMENT;

  afterEach(() => {
    process.env.PLAN_ENFORCEMENT = original;
  });

  it('allows create when under product limit', async () => {
    process.env.PLAN_ENFORCEMENT = 'true';
    const service = new PlanLimitsService({
      cooperativeSubscription: {
        findFirst: jest.fn().mockResolvedValue({
          plan: { name: 'Basic', maxProducts: 10, maxMembers: null, maxZones: null }
        })
      },
      product: { count: jest.fn().mockResolvedValue(5) }
    } as never);

    await expect(service.assertCanCreate('coop-1', 'products')).resolves.toBeUndefined();
  });

  it('rejects create when product limit reached', async () => {
    process.env.PLAN_ENFORCEMENT = 'true';
    const service = new PlanLimitsService({
      cooperativeSubscription: {
        findFirst: jest.fn().mockResolvedValue({
          plan: { name: 'Basic', maxProducts: 10, maxMembers: null, maxZones: null }
        })
      },
      product: { count: jest.fn().mockResolvedValue(10) }
    } as never);

    await expect(service.assertCanCreate('coop-1', 'products')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('skips enforcement when disabled', async () => {
    process.env.PLAN_ENFORCEMENT = 'false';
    const service = new PlanLimitsService({} as never);
    await expect(service.assertCanCreate('coop-1', 'products')).resolves.toBeUndefined();
  });
});
