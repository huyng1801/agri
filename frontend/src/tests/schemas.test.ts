import { describe, expect, it } from 'vitest';
import { cooperativeSchema, loginSchema, productSchema } from '@/schemas/forms';

describe('frontend validation schemas', () => {
  it('rejects invalid login email', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: '12345678' }).success).toBe(false);
  });

  it('accepts cooperative form data', () => {
    const result = cooperativeSchema.safeParse({
      name: 'HTX Xanh',
      code: 'HTX-XANH',
      phone: '0912345678',
      email: 'htx@example.com',
      address: 'Can Tho',
      status: 'ACTIVE'
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative product price', () => {
    expect(productSchema.safeParse({ code: 'SP001', name: 'Gạo', price: -1, unit: 'kg' }).success).toBe(false);
  });
});
