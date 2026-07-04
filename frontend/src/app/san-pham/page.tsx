import { API_URL, ApiEnvelope } from '@/lib/api';
import { EmptyPublicState, ProductCard, PublicProduct, PublicSearch, PublicShell, publicListItems } from '@/components/public-marketplace';

type ProductList = {
  data: PublicProduct[];
};

async function getProducts(search?: string) {
  const params = new URLSearchParams({ limit: '24' });
  if (search) params.set('search', search);
  try {
    const response = await fetch(`${API_URL}/products/public?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductList | PublicProduct[]>;
    return publicListItems(body.data);
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: { search?: string } }) {
  const products = await getProducts(searchParams.search);
  return (
    <PublicShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5">
          <h1 className="text-3xl font-bold">Sản phẩm</h1>
          <p className="mt-2 text-slate-600">Sản phẩm public từ các HTX trên HTXONLINE.</p>
        </div>
        <PublicSearch placeholder="Tìm sản phẩm" />
        {products.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPublicState title="Không tìm thấy sản phẩm" description="Thử tìm kiếm từ khóa khác hoặc quay lại sau khi HTX publish sản phẩm." />
          </div>
        )}
      </main>
    </PublicShell>
  );
}
