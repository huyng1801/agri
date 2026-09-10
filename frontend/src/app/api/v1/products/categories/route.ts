import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Categories retrieved',
    data: [
      { id: 'cat-01', name: 'Trà & Dược liệu', slug: 'tra-duoc-lieu' },
      { id: 'cat-02', name: 'Lúa gạo & Nông sản khô', slug: 'lua-gao-nong-san-kho' },
      { id: 'cat-03', name: 'Trái cây đặc sản', slug: 'trai-cay-dac-san' },
      { id: 'cat-04', name: 'Rau củ hữu cơ', slug: 'rau-cu-huu-co' }
    ]
  });
}
