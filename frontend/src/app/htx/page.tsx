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
import { PublicPageHeader, PublicPageMain } from '@/components/public-layout';

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
      <PublicPageMain>
        <PublicPageHeader title="HTX trên HTXONLINE" description="Danh sách HTX đang có sản phẩm public trên sàn." />
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
      </PublicPageMain>
    </PublicShell>
  );
}
