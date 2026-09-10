import { TreesDashboard } from '@/components/plant-traceability-dashboard';

export default async function TreeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TreesDashboard detailId={id} />;
}
