import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { ProductCard, PublicShell, cooperativesFromProducts, cooperativeAvatar } from '@/components/public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain, PublicSection, PublicSectionHeader, publicCardClass } from '@/components/public-layout';
import { Button, Panel } from '@/components/ui';
import { fetchProductsForCooperative } from '@/lib/public-catalog';

type CooperativeDetailPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: CooperativeDetailPageProps): Promise<Metadata> {
  const { code } = await params;
  const products = await fetchProductsForCooperative(code);
  const cooperative = cooperativesFromProducts(products)[0];
  if (!cooperative) {
    return { title: 'Không tìm thấy HTX | HTXONLINE' };
  }
  return {
    title: `${cooperative.name} | HTXONLINE`,
    description: `Xem sản phẩm, vùng trồng và thông tin public của ${cooperative.name} trên HTXONLINE.`,
    alternates: { canonical: `https://htxonline.vn/htx/${cooperative.code}` }
  };
}

export default async function CooperativeDetailPage({ params }: CooperativeDetailPageProps) {
  const { code } = await params;
  const products = await fetchProductsForCooperative(code);
  const cooperative = cooperativesFromProducts(products)[0];
  const zones = zonesFromProducts(products);
  const avatarFallback = cooperative ? cooperativeAvatar(cooperative) : DEFAULT_COOPERATIVE_IMAGE;

  if (!cooperative) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl">
          <Panel className="text-center">
            <h1 className="text-2xl font-bold text-ink">Không tìm thấy HTX public</h1>
            <Link className="mt-4 inline-block font-semibold text-leaf" href="/htx">
              Quay lại danh sách HTX
            </Link>
          </Panel>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <main>
        <PublicSection band className="!py-6 sm:!py-8">
          <PublicBreadcrumb href="/htx" label="Quay lại danh sách HTX" />
          <article className={publicCardClass}>
            <div className="relative h-48 overflow-hidden sm:h-60">
              <PublicImage src={cooperative.avatarUrl} alt={cooperative.name} fallback={avatarFallback} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <PublicImage
                    src={cooperative.avatarUrl}
                    alt={cooperative.name}
                    fallback={avatarFallback}
                    className="h-14 w-14 shrink-0 rounded-md border-2 border-white object-cover shadow-sm sm:h-16 sm:w-16 -mt-8 sm:-mt-12"
                  />
                  <div className="pt-1">
                    <h1 className="text-3xl font-bold text-ink">{cooperative.name}</h1>
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
                Hồ sơ public của HTX trên HTXONLINE. Người mua có thể xem sản phẩm, vùng trồng công khai và quét QR Passport để kiểm tra nguồn gốc.
              </p>
            </div>
          </article>
        </PublicSection>

        <PublicSection className="!pt-0">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <h2 className="text-xl font-bold text-ink">Vùng trồng công khai</h2>
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
              <h2 className="text-xl font-bold text-ink">Cam kết minh bạch</h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                <p>Chỉ sản phẩm đã publish mới xuất hiện trên trang HTX.</p>
                <p>Vùng trồng bị tắt public sẽ không hiển thị ở đây và cũng không lộ trên trang sản phẩm hay QR Passport.</p>
                <p>Nhật ký, chứng nhận và thông tin nội bộ chưa công khai vẫn được giữ riêng trong dashboard HTX.</p>
              </div>
            </Panel>
          </div>
        </PublicSection>

        <PublicSection>
          <PublicSectionHeader title="Sản phẩm public của HTX" description="Danh sách sản phẩm đang được publish trên sàn." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </PublicSection>
      </main>
    </PublicShell>
  );
}

function zonesFromProducts(products: Parameters<typeof cooperativesFromProducts>[0]) {
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
