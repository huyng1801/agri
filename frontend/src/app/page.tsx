import Link from 'next/link';
import { ArrowRight, BadgeCheck, Leaf, QrCode, ShoppingBag, Store, type LucideIcon } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import {
  CooperativeCard,
  EmptyPublicState,
  ProductCard,
  PublicProduct,
  PublicSearch,
  PublicShell,
  cooperativesFromProducts
} from '@/components/public-marketplace';
import { Button, Panel } from '@/components/ui';

type ProductList = {
  data: PublicProduct[];
};

async function getPublicProducts() {
  try {
    const response = await fetch(`${API_URL}/products/public?limit=8`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<ProductList>;
    return body.data.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getPublicProducts();
  const cooperatives = cooperativesFromProducts(products).slice(0, 6);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['Sản phẩm public', products.length, ShoppingBag],
    ['HTX đang hiển thị', cooperatives.length, Store],
    ['QR Passport', 'Truy xuất nhanh', QrCode]
  ];

  return (
    <PublicShell>
      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-20" />
          <div className="relative mx-auto grid min-h-[76vh] max-w-6xl content-center gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-sm font-semibold text-leaf">
                <Leaf size={16} aria-hidden="true" />
                Sàn nông sản số
              </div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">HTXONLINE — Sàn nông sản số cho hợp tác xã Việt Nam.</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Kết nối người mua với sản phẩm HTX có thông tin minh bạch, QR truy xuất nguồn gốc và đặt hàng COD.
              </p>
              <PublicSearch />
              <div className="flex flex-wrap gap-3">
                <Link href="/san-pham">
                  <Button>
                    Xem sản phẩm
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/htx">
                  <Button variant="ghost">Khám phá HTX</Button>
                </Link>
                <Link href="/lien-he">
                  <Button variant="ghost">Liên hệ tư vấn</Button>
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {stats.map(([title, value, Icon]) => (
                <Panel key={String(title)} className="flex items-center gap-4 bg-white/95">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-leaf text-white">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold">{String(title)}</span>
                    <span className="block text-sm text-slate-600">{String(value)}</span>
                  </span>
                </Panel>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
              <p className="mt-1 text-sm text-slate-600">Nông sản public từ các HTX trên hệ thống.</p>
            </div>
            <Link className="hidden font-semibold text-leaf sm:inline-flex" href="/san-pham">
              Xem tất cả
            </Link>
          </div>
          {products.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có sản phẩm public" description="Khi HTX publish sản phẩm, sản phẩm sẽ xuất hiện tại đây." />
            </div>
          )}
        </section>

        <section className="bg-white py-10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">HTX nổi bật</h2>
                <p className="mt-1 text-sm text-slate-600">Hồ sơ HTX đang có sản phẩm public.</p>
              </div>
              <Link className="hidden font-semibold text-leaf sm:inline-flex" href="/htx">
                Xem HTX
              </Link>
            </div>
            {cooperatives.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cooperatives.map((cooperative) => (
                  <CooperativeCard key={cooperative.id} cooperative={cooperative} />
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyPublicState title="Chưa có HTX public" description="HTX sẽ xuất hiện khi có sản phẩm được publish." />
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
          {[
            ['Minh bạch nguồn gốc', 'QR Passport giúp người mua kiểm tra nhật ký, vùng trồng và chứng nhận public.', QrCode],
            ['Đặt hàng COD', 'Người mua gửi đơn nhanh, HTX liên hệ xác nhận và xử lý đơn.', ShoppingBag],
            ['HTX tự vận hành', 'Sản phẩm, vùng trồng, nhật ký và đơn hàng do từng HTX tự quản lý.', BadgeCheck]
          ].map(([title, text, Icon]) => (
            <Panel key={String(title)}>
              <Icon className="text-leaf" size={28} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{String(text)}</p>
            </Panel>
          ))}
        </section>
      </main>
    </PublicShell>
  );
}
