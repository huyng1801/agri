import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Zones retrieved',
    data: [
      {
        id: 'zone-01',
        name: 'Vùng chè cổ thụ Tây Côn Lĩnh',
        address: 'Xã Cao Bồ, Huyện Vị Xuyên, Tỉnh Hà Giang',
        areaM2: 120000,
        code: 'VN-HG-TC-01',
        cooperative: { name: 'HTX Chế biến Trà Shan Tuyết Hà Giang' }
      },
      {
        id: 'zone-02',
        name: 'Cánh đồng sinh thái Tháp Mười',
        address: 'Huyện Tháp Mười, Tỉnh Đồng Tháp',
        areaM2: 250000,
        code: 'VN-DT-TM-02',
        cooperative: { name: 'HTX Nông Nghiệp Lúa Vàng Đồng Tháp' }
      }
    ],
    meta: { total: 2, page: 1, limit: 20 }
  });
}
