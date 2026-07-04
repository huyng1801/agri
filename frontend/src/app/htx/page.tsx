import { API_URL, ApiEnvelope } from '@/lib/api';
import {
  CooperativeCard,
  EmptyPublicState,
  PublicProduct,
  PublicSearch,
  PublicShell,
  cooperativesFromProducts,
  publicListItems
} from '@/components/public-marketplace';

type ProductList = {
  data: PublicProduct[];
};

async function getCooperatives(search?: string) {
  const params = new URLSearchParams({ limit: '100' });
  if (search) params.set('search', search);
  try {
    const response = await fetch(`${API_URL}/products/public?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductList | PublicProduct[]>;
    return cooperativesFromProducts(publicListItems(body.data));
  } catch {
    return [];
  }
}

export default async function CooperativesPublicPage({ searchParams }: { searchParams: { search?: string } }) {
  const cooperatives = await getCooperatives(searchParams.search);
  return (
    <PublicShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5">
          <h1 className="text-3xl font-bold">HTX trên HTXONLINE</h1>
          <p className="mt-2 text-slate-600">Danh sách HTX đang có sản phẩm public trên sàn.</p>
        </div>
        <PublicSearch placeholder="Tìm HTX hoặc sản phẩm của HTX" />
        {cooperatives.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cooperatives.map((cooperative) => (
              <CooperativeCard key={cooperative.id} cooperative={cooperative} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPublicState title="Chưa có HTX public" description="HTX sẽ xuất hiện khi có sản phẩm được publish lên sàn." />
          </div>
        )}
      </main>
    </PublicShell>
  );
}
