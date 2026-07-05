import Link from 'next/link';
import { MapPin, Phone, Store } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { ProductCard, PublicProduct, PublicShell, cooperativesFromProducts, publicListItems } from '@/components/public-marketplace';
import { Button, Panel } from '@/components/ui';

type ProductList = {
  data: PublicProduct[];
};

async function getProductsForCooperative(code: string) {
  try {
    const response = await fetch(`${API_URL}/products/public?limit=100`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductList | PublicProduct[]>;
    return publicListItems(body.data).filter((product) => product.cooperative?.code === code);
  } catch {
    return [];
  }
}

export default async function CooperativeDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const products = await getProductsForCooperative(code);
  const cooperative = cooperativesFromProducts(products)[0];
  const zones = zonesFromProducts(products);
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

        <section className="mx-auto max-w-6xl px-4 pb-2">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Panel>
              <h2 className="text-xl font-bold">Vùng trồng công khai</h2>
              {zones.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {zones.map((zone) => (
                    <div key={zone.key} className="rounded-md bg-slate-50 p-4">
                      <p className="font-bold text-ink">{zone.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{zone.address || 'Đang cập nhật địa chỉ vùng trồng'}</p>
                      <p className="mt-2 text-sm font-semibold text-leaf">{zone.productCount} sản phẩm public</p>
                      {zone.areaM2 && <p className="mt-1 text-xs text-slate-500">Diện tích {formatArea(zone.areaM2)}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">HTX chưa công khai vùng trồng nào trên sàn.</p>
              )}
            </Panel>

            <Panel>
              <h2 className="text-xl font-bold">Minh bạch dữ liệu public</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p>Chỉ sản phẩm đã publish mới xuất hiện trên trang HTX.</p>
                <p>Vùng trồng bị tắt public sẽ không hiển thị ở đây và cũng không lộ trên trang sản phẩm hay QR Passport.</p>
                <p>Nhật ký, chứng nhận và thông tin nội bộ chưa công khai vẫn tiếp tục được giữ riêng trong dashboard HTX.</p>
              </div>
            </Panel>
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

function zonesFromProducts(products: PublicProduct[]) {
  const byZone = new Map<
    string,
    {
      key: string;
      name: string;
      address?: string | null;
      areaM2?: string | number | null;
      productCount: number;
    }
  >();

  for (const product of products) {
    if (!product.zone?.name) continue;
    const key = product.zone.id || `${product.zone.name}:${product.zone.address || ''}`;
    const existing = byZone.get(key);
    byZone.set(key, {
      key,
      name: product.zone.name,
      address: product.zone.address,
      areaM2: product.zone.areaM2,
      productCount: (existing?.productCount ?? 0) + 1
    });
  }

  return Array.from(byZone.values()).sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name, 'vi'));
}

function formatArea(value: string | number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(numeric)} m²`;
}
