import type { Metadata } from 'next';
import { PublicTreePassportPage } from '@/components/public-plant-traceability';

export async function generateMetadata({ params }: { params: Promise<{ treeCode: string }> }): Promise<Metadata> {
  const { treeCode } = await params;
  return { title: `Hộ chiếu cây ${treeCode}`, description: 'Hồ sơ định danh và timeline sản xuất của cá thể cây.' };
}

export default async function PublicTreePage({ params }: { params: Promise<{ treeCode: string }> }) {
  const { treeCode } = await params;
  return <PublicTreePassportPage treeCode={treeCode} />;
}
