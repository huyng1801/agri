import Link from 'next/link';
import { MapPin, Phone, Store } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { ProductCard, PublicProduct, PublicShell, cooperativesFromProducts } from '@/components/public-marketplace';
import { Button, Panel } from '@/components/ui';

type ProductList = {
  data: PublicProduct[];
};

async function getProductsForCooperative(code: string) {
  try {
    const response = await fetch(`${API_URL}/products/public?limit=100`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductList>;
    return (body.data.data ?? []).filter((product) => product.cooperative?.code === code);
  } catch {
    return [];
  }
}

export default async function CooperativeDetailPage({ params }: { params: { code: string } }) {
  const products = await getProductsForCooperative(params.code);
  const cooperative = cooperativesFromProducts(products)[0];
  if (!cooperative) {
    return (
      <PublicShell>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Panel className="text-center">
            <h1 className="text-2xl font-bold">Không tìm thấy HTX public</h1>
            <Link className="mt-4 inline-block font-semibold text-leaf" href="/htx">
              Quay lại danh sách HTX
            </Link>
          </Panel>
        </main>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <main>
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="h-48 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-mint text-leaf">
                      <Store size={30} aria-hidden="true" />
                    </span>
                    <div>
                      <h1 className="text-3xl font-bold">{cooperative.name}</h1>
                      <p className="mt-2 flex items-center gap-2 text-slate-600">
                        <MapPin size={16} aria-hidden="true" />
                        {cooperative.province || 'Đang cập nhật địa phương'}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-leaf">{cooperative.productCount} sản phẩm public</p>
                    </div>
                  </div>
                  {cooperative.phone && (
                    <a href={`tel:${cooperative.phone}`}>
                      <Button>
                        <Phone size={18} aria-hidden="true" />
                        Gọi HTX
                      </Button>
                    </a>
                  )}
                </div>
                <p className="mt-5 max-w-3xl leading-7 text-slate-700">
                  Hồ sơ public của HTX trên HTXONLINE. Các thông tin nội bộ, nhật ký chưa publish và dữ liệu nhạy cảm không hiển thị tại trang này.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-2xl font-bold">Sản phẩm public của HTX</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
