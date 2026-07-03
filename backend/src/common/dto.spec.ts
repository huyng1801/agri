import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCooperativeDto, CreateProductDto, LoginDto } from './dto';

describe('DTO validation matrix', () => {
  it('rejects invalid login email and short password', async () => {
    const dto = plainToInstance(LoginDto, { email: 'bad', password: 'short' });
    const errors = await validate(dto);
    expect(errors.map((item) => item.property)).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('accepts a valid cooperative payload', async () => {
    const dto = plainToInstance(CreateCooperativeDto, {
      name: 'HTX Xanh',
      code: 'HTX-XANH',
      phone: '0912345678',
      email: 'htx@example.com',
      address: 'Can Tho'
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects negative product price', async () => {
    const dto = plainToInstance(CreateProductDto, {
      code: 'SP001',
      name: 'Gạo thơm',
      price: -1,
      unit: 'kg'
    });
    const errors = await validate(dto);
    expect(errors.some((item) => item.property === 'price')).toBe(true);
  });
});
