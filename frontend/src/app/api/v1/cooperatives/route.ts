import { NextResponse } from 'next/server';
import { STANDARD_PRODUCTS } from '@/lib/public-catalog';
import { cooperativesFromProducts } from '@/components/public-marketplace';

export async function GET() {
  const cooperatives = cooperativesFromProducts(STANDARD_PRODUCTS);
  return NextResponse.json({
    success: true,
    message: 'Cooperatives retrieved',
    data: cooperatives,
    meta: { total: cooperatives.length, page: 1, limit: 20 }
  });
}
