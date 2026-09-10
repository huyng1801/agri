import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Subscription plans retrieved',
    data: [
      {
        id: 'plan-basic',
        name: 'Gói Cơ bản HTX',
        code: 'BASIC',
        priceMonthly: 0,
        priceYearly: 0,
        isActive: true,
        features: ['Quản lý 20 xã viên', '10 sản phẩm công khai', 'Mã QR cơ bản']
      },
      {
        id: 'plan-pro',
        name: 'Gói Nâng cao',
        code: 'PRO',
        priceMonthly: 500000,
        priceYearly: 5000000,
        isActive: true,
        features: ['Không giới hạn xã viên', 'Hộ chiếu nông nghiệp QR', 'Báo cáo quản trị']
      }
    ],
    meta: { total: 2, page: 1, limit: 100 }
  });
}
