import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Roles retrieved',
    data: [
      { id: 'SUPER_ADMIN', name: 'Quản trị viên Hệ thống' },
      { id: 'ADMIN_HTX', name: 'Quản trị viên Hợp tác xã' },
      { id: 'FARMER', name: 'Nông hộ / Xã viên' }
    ]
  });
}
