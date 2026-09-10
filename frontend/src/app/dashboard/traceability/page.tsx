import { TraceabilityDashboard, TreeCodesDashboard } from '@/components/plant-traceability-dashboard';

export default function TraceabilityPage() {
  return <div className="space-y-5"><TraceabilityDashboard /><TreeCodesDashboard /></div>;
}
