import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Farmers retrieved',
    data: [
      {
        id: 'farmer-01',
        fullName: 'Nguyễn Văn Thành',
        phone: '0912 111 222',
        address: 'Xã Cao Bồ, Huyện Vị Xuyên, Tỉnh Hà Giang',
        cooperative: { name: 'HTX Chế biến Trà Shan Tuyết Hà Giang' },
        createdAt: '2026-01-10T08:00:00.000Z'
      },
      {
        id: 'farmer-02',
        fullName: 'Trần Thị Mai',
        phone: '0908 333 444',
        address: 'Huyện Tháp Mười, Tỉnh Đồng Tháp',
        cooperative: { name: 'HTX Nông Nghiệp Lúa Vàng Đồng Tháp' },
        createdAt: '2026-02-15T08:00:00.000Z'
      }
    ],
    meta: { total: 2, page: 1, limit: 20 }
  });
}
