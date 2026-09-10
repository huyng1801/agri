import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Overview report retrieved',
    data: {
      metrics: [
        { key: 'products', label: 'Sản phẩm số hóa', value: 4 },
        { key: 'cooperatives', label: 'Hợp tác xã', value: 4 },
        { key: 'farmers', label: 'Xã viên & Nông hộ', value: 28 },
        { key: 'passports', label: 'Hồ sơ QR công khai', value: 142 },
        { key: 'logs', label: 'Nhật ký canh tác', value: 12 },
        { key: 'certifications', label: 'Chứng nhận chất lượng', value: 8 }
      ],
      range: { from: null, to: null }
    }
  });
}
