import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { ProductCard, cooperativesFromProducts, cooperativeAvatar } from '@/components/public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain, PublicSectionHeader, publicCardClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, Panel } from '@/components/ui';
import { brandizeSiteText } from '@/lib/page-metadata';
import { fetchProductsForCooperative } from '@/lib/public-catalog';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

type CooperativeDetailPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: CooperativeDetailPageProps): Promise<Metadata> {
  const { code } = await params;
  const products = await fetchProductsForCooperative(code);
  const cooperative = cooperativesFromProducts(products)[0];
  if (!cooperative) {
    return { title: 'Không tìm thấy HTX' };
  }
  const siteKey = await getRequestPublicSiteKey();
  return {
    title: cooperative.name,
    description: brandizeSiteText(`Xem dữ liệu sản phẩm và thông tin công khai của ${cooperative.name} trên nền tảng.`, siteKey),
    alternates: { canonical: await getRequestAbsoluteUrl(`/htx/${cooperative.code}`) }
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
            <h1 className="text-2xl font-bold text-ink">Không tìm thấy HTX công khai</h1>
            <Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5" href="/htx">
              Quay lại danh sách HTX
            </Link>
          </Panel>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PublicDetailMain>
        <PublicBreadcrumb href="/htx" label="Quay lại danh sách HTX" />

        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-5">
          <article className={publicCardClass}>
            <div className="relative h-52 overflow-hidden sm:h-72">
              <PublicImage
                src={cooperative.avatarUrl}
                alt={cooperative.name}
                fallback={avatarFallback}
                priority
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/70">Hồ sơ HTX</p>
                <h1 className="mt-2 max-w-[14ch] text-[1.85rem] font-extrabold leading-[1.02] tracking-[-0.03em] sm:max-w-[16ch] sm:text-[2.8rem]">
                  {cooperative.name}
                </h1>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[var(--surface-0)] px-3.5 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Địa phương</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-ink">
                    <MapPin size={15} aria-hidden="true" className="text-leaf" />
                    {cooperative.province || 'Đang cập nhật địa phương'}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[var(--surface-0)] px-3.5 py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Sản phẩm công khai</p>
                  <p className="mt-1 text-sm font-bold text-ink">{cooperative.productCount} sản phẩm</p>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-[0.96rem] leading-7 text-slate-700">
                Hồ sơ công khai này gom các sản phẩm, vùng trồng và tín hiệu minh bạch quan trọng để người mua đi từ HTX sang từng sản phẩm theo một hành trình rõ ràng hơn.
              </p>
            </div>
          </article>

          <article className="rounded-[1.9rem] bg-[linear-gradient(145deg,#0d1325_0%,#14253a_40%,#245f3e_100%)] p-5 text-white shadow-[0_24px_60px_rgba(13,19,37,0.22)] sm:p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/66">Trust Snapshot</p>
            <h2 className="mt-3 text-[1.55rem] font-extrabold leading-[1.04] sm:text-[2rem]">Công khai đủ để tin, gọn đủ để xem nhanh trên mobile.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3.5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">HTX</p>
                <p className="mt-1.5 text-sm font-bold text-white">{cooperative.name}</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3.5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">Vùng trồng</p>
                <p className="mt-1.5 text-sm font-bold text-white">{zones.length || 'Đang cập nhật'} khu vực</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3.5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">Sản phẩm</p>
                <p className="mt-1.5 text-sm font-bold text-white">{cooperative.productCount} công khai</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2.5">
              {[
                'Chỉ sản phẩm đã mở công khai mới xuất hiện trên hồ sơ HTX.',
                'Vùng trồng bị tắt công khai sẽ không lộ trên trang sản phẩm hoặc QR.',
                'Nhật ký và chứng nhận nội bộ chưa công khai vẫn được giữ riêng trong dashboard.'
              ].map((item) => (
                <div key={item} className="rounded-[1.15rem] border border-white/10 bg-black/14 px-3.5 py-3 text-sm leading-6 text-white/82">
                  {item}
                </div>
              ))}
            </div>
            {cooperative.phone && (
              <a href={`tel:${cooperative.phone}`} className="mt-5 inline-flex min-h-12 w-full">
                <Button className="w-full justify-center rounded-[1.15rem]">
                  <Phone size={18} aria-hidden="true" />
                  Gọi HTX
                </Button>
              </a>
            )}
          </article>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="text-xl font-bold text-ink">Vùng trồng công khai</h2>
            {zones.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {zones.map((zone) => (
                  <div key={zone.key} className="rounded-[1.3rem] border border-[#eadfce] bg-[var(--surface-0)] p-4">
                    <p className="font-bold text-ink">{zone.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{zone.address || 'Đang cập nhật địa chỉ vùng trồng'}</p>
                    <p className="mt-2 text-sm font-semibold text-leaf">{zone.productCount} sản phẩm công khai</p>
                    {zone.areaM2 && <p className="mt-1 text-xs text-slate-500">Diện tích {formatArea(zone.areaM2)}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">HTX chưa công khai vùng trồng nào trên sàn.</p>
            )}
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold text-ink">Điểm minh bạch nổi bật</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Sản phẩm công khai', value: `${cooperative.productCount}`, note: 'Đã sẵn sàng để người mua xem' },
                { title: 'Vùng trồng', value: `${zones.length}`, note: 'Khu vực được phép hiển thị công khai' },
                { title: 'Điện thoại liên hệ', value: cooperative.phone ? 'Sẵn sàng' : 'Đang cập nhật', note: 'Kênh liên hệ trực tiếp với HTX' },
                { title: 'Luồng đi tiếp', value: 'Sản phẩm', note: 'Từ hồ sơ HTX sang từng mặt hàng chỉ bằng một chạm' }
              ].map((item) => (
                <div key={item.title} className="rounded-[1.3rem] bg-[var(--surface-0)] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.title}</p>
                  <p className="mt-2 text-lg font-bold text-ink">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <section className="mt-6">
          <PublicSectionHeader title="Sản phẩm công khai của HTX" description="Danh sách sản phẩm đang được đăng công khai trên sàn." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </PublicDetailMain>
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
