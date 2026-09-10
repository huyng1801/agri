import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Users retrieved',
    data: [
      {
        id: 'usr-01',
        fullName: 'Nguyễn Văn Quản Trị',
        email: 'admin@htxdongthap.vn',
        phone: '0907 001 200',
        role: 'ADMIN_HTX',
        roles: ['ADMIN_HTX'],
        status: 'ACTIVE'
      },
      {
        id: 'usr-02',
        fullName: 'Nguyễn Văn Thành',
        email: 'thanh@hagiang.vn',
        phone: '0912 111 222',
        role: 'FARMER',
        roles: ['FARMER'],
        status: 'ACTIVE'
      }
    ],
    meta: { total: 2, page: 1, limit: 100 }
  });
}
