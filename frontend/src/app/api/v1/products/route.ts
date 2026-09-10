import { NextResponse } from 'next/server';
import { STANDARD_PRODUCTS } from '@/lib/public-catalog';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Products retrieved',
    data: STANDARD_PRODUCTS,
    meta: {
      total: STANDARD_PRODUCTS.length,
      page: 1,
      limit: 20
    }
  });
}
