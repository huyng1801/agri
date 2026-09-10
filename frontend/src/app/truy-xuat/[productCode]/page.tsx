import type { Metadata } from 'next';
import { PublicProductTracePage } from '@/components/public-plant-traceability';

export async function generateMetadata({ params }: { params: Promise<{ productCode: string }> }): Promise<Metadata> {
  const { productCode } = await params;
  return { title: `Truy xuất ${productCode}`, description: 'Hộ chiếu nông sản: từ sản phẩm về lô và các cá thể cây tạo ra sản lượng.' };
}

export default async function PublicProductPage({ params }: { params: Promise<{ productCode: string }> }) {
  const { productCode } = await params;
  return <PublicProductTracePage productCode={productCode} />;
}
