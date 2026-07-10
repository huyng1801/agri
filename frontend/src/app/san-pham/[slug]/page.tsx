import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Phone, QrCode } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { PublicProduct, PublicShell, cooperativeAvatar, productImage } from '@/components/public-marketplace';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain } from '@/components/public-layout';
import { formatDate } from '@/lib/format';
import { Button, Panel } from '@/components/ui';

async function getProduct(slug: string) {
  try {
    const response = await fetch(`${API_URL}/products/public/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<PublicProduct>;
    return body.data;
  } catch {
    return null;
  }
}

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Không tìm thấy sản phẩm | HTXONLINE' };
  return {
    title: `${product.name} | HTXONLINE`,
    description: product.description || `Mua ${product.name} từ ${product.cooperative?.name ?? 'HTX'} trên HTXONLINE.`,
    alternates: { canonical: `https://htxonline.vn/san-pham/${product.slug}` }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl">
          <Panel className="text-center">
            <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
            <Link className="mt-4 inline-block font-semibold text-leaf" href="/san-pham">
              Quay lại danh sách sản phẩm
            </Link>
          </Panel>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const passport = product.passports?.[0];
  const coopAvatar = product.cooperative ? cooperativeAvatar(product.cooperative) : null;
  const certifications = product.certifications ?? [];
  const publicLogs = product.farmingLogs ?? [];

  return (
    <PublicShell>
      <PublicDetailMain>
        <PublicBreadcrumb href="/san-pham" label="Quay lại danh sách sản phẩm" />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-card)]">
            <PublicImage
              src={product.thumbnail?.publicUrl}
              alt={product.name}
              fallback={productImage(product)}
              priority
              wrapperClassName="aspect-[16/11] w-full sm:aspect-[4/3]"
              className="h-full w-full object-cover"
            />
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase text-leaf">{product.category?.name ?? 'Nông sản'}</p>
              <h1 className="mt-2 text-[2.05rem] font-bold leading-[1.02] tracking-tight sm:text-4xl">{product.name}</h1>
              <Link href={`/htx/${product.cooperative?.code ?? ''}`} className="mt-3 inline-flex items-center gap-3 text-sm font-semibold text-slate-600">
                {coopAvatar && (
                  <PublicImage
                    src={product.cooperative?.avatarUrl}
                    alt={product.cooperative?.name ?? 'HTX'}
                    fallback={coopAvatar}
                    decorative
                    wrapperClassName="h-10 w-10 shrink-0 rounded-md"
                    className="h-full w-full object-cover"
                  />
                )}
                {product.cooperative?.name ?? 'HTX đang cập nhật'}
              </Link>
            </div>

            <Panel>
              <p className="text-sm text-slate-500">Giá bán</p>
              <p className="mt-1 text-3xl font-bold text-leaf">{formatPrice(product.price)}</p>
              <p className="text-sm text-slate-500">/{product.unit}</p>
            </Panel>

            <div className="grid gap-2 sm:grid-cols-2">
              <AddToCartButton product={product} />
              {product.cooperative?.phone && (
                <a
                  href={`tel:${product.cooperative.phone}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
                >
                  <Phone size={18} aria-hidden="true" />
                  Gọi HTX
                </a>
              )}
            </div>

            {passport && (
              <Link href={`/passport/${passport.passportCode}`}>
                <Button variant="ghost" className="w-full">
                  <QrCode size={18} aria-hidden="true" />
                  Xem QR Passport
                </Button>
              </Link>
            )}
          </section>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(22rem,0.82fr)]">
          <div className="grid gap-4">
            <Panel className="max-w-4xl">
              <h2 className="text-xl font-bold">Mô tả sản phẩm</h2>
              <p className="mt-3 leading-7 text-slate-700">{product.description || 'HTX đang cập nhật mô tả sản phẩm.'}</p>
              {product.zone && (
                <div className="mt-4 rounded-xl bg-mint/75 p-4 text-sm">
                  <p className="flex items-center gap-2 font-bold text-ink">
                    <MapPin size={16} aria-hidden="true" />
                    {product.zone.name}
                  </p>
                  <p className="mt-1 text-slate-700">{product.zone.address}</p>
                </div>
              )}
            </Panel>

            <Panel>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold">Nhật ký public</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Theo dõi các bước canh tác công khai được HTX đăng tải cho sản phẩm này.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-slate-500">Bản ghi công khai</p>
                  <p className="mt-1 text-2xl font-bold text-ink">{publicLogs.length}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                {publicLogs.length ? (
                  publicLogs.map((log, index) => (
                    <div key={log.id} className="grid grid-cols-[2.75rem_1fr] gap-3">
                      <div className="flex flex-col items-center">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf text-sm font-bold text-white shadow-sm">{index + 1}</span>
                        <span className="mt-2 h-full min-h-8 w-px bg-slate-200" aria-hidden="true" />
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-full bg-mint px-2.5 py-1 font-semibold text-leaf">{log.activityType}</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Calendar size={14} aria-hidden="true" />
                            {formatDate(log.logDate)}
                          </span>
                        </div>
                        <p className="mt-3 text-[0.98rem] leading-7 text-slate-700">{log.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Chưa có nhật ký public.</p>
                )}
              </div>
            </Panel>
          </div>

          <aside className="grid gap-4 self-start xl:sticky xl:top-6">
            <Panel>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf/80">Trust Snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Đơn vị bán</p>
                  <p className="mt-2 text-base font-bold text-ink">{product.unit}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Chứng nhận public</p>
                  <p className="mt-2 text-base font-bold text-ink">{certifications.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">QR Passport</p>
                  <p className="mt-2 text-base font-bold text-ink">{passport ? 'Sẵn sàng xem' : 'Đang cập nhật'}</p>
                </div>
              </div>
            </Panel>

            <Panel>
              <h2 className="text-xl font-bold">Chứng nhận</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tổng hợp các chứng nhận public đi kèm sản phẩm để người mua kiểm tra nhanh.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-500">Tổng chứng nhận</p>
                  <p className="mt-1 text-lg font-bold text-ink">{certifications.length}</p>
                </div>
                <p className="max-w-[12rem] text-right text-xs leading-5 text-slate-500">Danh sách đầy đủ vẫn hiển thị ngay bên dưới để người mua kiểm tra trực tiếp.</p>
              </div>
              <div className="mt-4 grid gap-3 xl:max-h-[42rem] xl:overflow-auto xl:pr-1">
                {certifications.length ? (
                  certifications.map((cert) => (
                    <div key={cert.id} className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-sm">
                      <strong className="text-ink">{cert.name}</strong>
                      <span className="mt-1 block leading-6 text-slate-600">
                        {cert.issuer || 'Đơn vị cấp'} · {formatDate(cert.expiresAt)}
                      </span>
                      {cert.file?.publicUrl && (
                        <a href={cert.file.publicUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-semibold text-leaf">
                          Xem tài liệu chứng nhận
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Chưa có chứng nhận public.</p>
                )}
              </div>
            </Panel>

            <Panel>
              <h2 className="text-xl font-bold">HTX sản xuất</h2>
              <p className="mt-2 font-semibold text-ink">{product.cooperative?.name ?? 'HTX đang cập nhật'}</p>
              {product.cooperative?.phone && <p className="mt-1 text-slate-600">{product.cooperative.phone}</p>}
              {product.zone?.address && <p className="mt-1 text-sm leading-6 text-slate-600">{product.zone.address}</p>}
              {passport && (
                <Link
                  href={`/passport/${passport.passportCode}`}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
                >
                  Xem QR Passport
                </Link>
              )}
            </Panel>
          </aside>
        </div>
      </PublicDetailMain>
    </PublicShell>
  );
}

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0));
}
