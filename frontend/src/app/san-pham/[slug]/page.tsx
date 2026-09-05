import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Phone, QrCode } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { PublicProduct } from '@/components/public-marketplace';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain, publicCardClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { formatDate } from '@/lib/format';
import { brandizeSiteText } from '@/lib/page-metadata';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';
import { Panel } from '@/components/ui';
import { passportUrl } from '@/lib/domain';

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
  if (!product) return { title: 'Không tìm thấy sản phẩm' };
  const siteKey = await getRequestPublicSiteKey();
  return {
    title: product.name,
    description: brandizeSiteText(product.description || `Xem ${product.name} từ ${product.cooperative?.name ?? 'HTX'} trên nền tảng công khai.`, siteKey),
    alternates: { canonical: await getRequestAbsoluteUrl(`/san-pham/${product.slug}`) }
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
            <Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5" href="/san-pham">
              Quay lại danh sách sản phẩm
            </Link>
          </Panel>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const passport = product.passports?.[0];
  const hasCooperative = Boolean(product.cooperative);
  const certifications = product.certifications ?? [];
  const publicLogs = product.farmingLogs ?? [];

  return (
    <PublicShell>
      <PublicDetailMain>
        <PublicBreadcrumb href="/san-pham" label="Quay lại danh sách sản phẩm" />

        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-5">
          <section className={`${publicCardClass} order-2 lg:order-1`}>
            <div className="p-2.5 sm:p-3">
              <PublicImage
                src={product.thumbnail?.publicUrl}
                alt={product.name}
                fallback={DEFAULT_PRODUCT_IMAGE}
                priority
                wrapperClassName="aspect-[16/10] w-full rounded-[1.45rem] sm:aspect-[4/3]"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid gap-3 border-t border-[#eadfce] p-4 sm:grid-cols-2 sm:p-5">
              <div className="rounded-[1.2rem] bg-[var(--surface-0)] px-3.5 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Danh mục</p>
                <p className="mt-1 text-sm font-bold text-ink">{product.category?.name ?? 'Nông sản'}</p>
              </div>
              <div className="rounded-[1.2rem] bg-[var(--surface-0)] px-3.5 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Đơn vị bán</p>
                <p className="mt-1 text-sm font-bold text-ink">{product.unit}</p>
              </div>
            </div>
          </section>

          <section className="order-1 rounded-[1.9rem] bg-[linear-gradient(145deg,#0d1325_0%,#14253a_40%,#245f3e_100%)] p-5 text-white shadow-[0_24px_60px_rgba(13,19,37,0.22)] sm:p-6 lg:order-2">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/66">{product.category?.name ?? 'Nông sản'}</p>
              <h1 className="mt-2 text-[1.72rem] font-extrabold leading-[1.03] tracking-[-0.03em] text-white sm:text-[2.65rem]">{product.name}</h1>
              <Link
                href={`/htx/${product.cooperative?.code ?? ''}`}
                className="mt-3 inline-flex min-h-11 items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/10 px-2.5 pr-3 text-sm font-semibold text-white/86 transition hover:bg-white/14"
              >
                {hasCooperative && (
                  <PublicImage
                    src={product.cooperative?.avatarUrl}
                    alt={product.cooperative?.name ?? 'HTX'}
                    fallback={DEFAULT_COOPERATIVE_IMAGE}
                    decorative
                    wrapperClassName="h-10 w-10 shrink-0 rounded-[0.95rem]"
                    className="h-full w-full object-cover"
                  />
                )}
                {product.cooperative?.name ?? 'HTX đang cập nhật'}
              </Link>
            </div>

            <div className="mt-5 rounded-[1.45rem] border border-white/10 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
              <p className="text-sm text-white/62">Giá bán</p>
              <p className="mt-1 text-[2rem] font-extrabold leading-none text-white sm:text-[2.35rem]">{formatPrice(product.price)}</p>
              <p className="mt-1 text-sm text-white/68">/{product.unit}</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <AddToCartButton product={product} className="min-h-12 justify-center rounded-[1.15rem]" />
              {product.cooperative?.phone && (
                <a
                  href={`tel:${product.cooperative.phone}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.15rem] border border-white/14 bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/16"
                >
                  <Phone size={18} aria-hidden="true" />
                  Gọi HTX
                </a>
              )}
            </div>

            {passport && (
              <a
                href={passportUrl(`/passport/${passport.passportCode}`)}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.15rem] border border-white/14 bg-black/14 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/12"
              >
                <QrCode size={18} aria-hidden="true" />
                Xem QR Passport
              </a>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: 'QR Passport', value: passport ? 'Sẵn sàng xem' : 'Đang cập nhật' },
                { label: 'Chứng nhận', value: `${certifications.length} công khai` },
                { label: 'Nhật ký', value: `${publicLogs.length} bản ghi` }
              ].map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">{item.label}</p>
                  <p className="mt-1.5 text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(22rem,0.82fr)]">
          <div className="grid gap-4">
            <Panel className="max-w-4xl">
              <h2 className="text-xl font-bold">Mô tả sản phẩm</h2>
              <p className="mt-3 leading-7 text-slate-700">{product.description || 'HTX đang cập nhật mô tả sản phẩm.'}</p>
              {product.zone && (
                <div className="mt-4 rounded-[1.3rem] bg-[var(--surface-0)] p-4 text-sm">
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
                  <h2 className="text-xl font-bold">Nhật ký công khai</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Theo dõi các bước canh tác công khai được HTX đăng tải cho sản phẩm này.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[#eadfce] bg-[var(--surface-0)] px-4 py-3 text-sm">
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
                      <div className="rounded-[1.25rem] border border-[#eadfce] bg-[var(--surface-0)] p-4">
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
                  <p className="text-sm text-slate-600">Chưa có nhật ký công khai.</p>
                )}
              </div>
            </Panel>
          </div>

          <aside className="grid gap-4 self-start xl:sticky xl:top-6">
            <Panel>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf/80">Trust Snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-[1.25rem] bg-[var(--surface-0)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Đơn vị bán</p>
                  <p className="mt-2 text-base font-bold text-ink">{product.unit}</p>
                </div>
                <div className="rounded-[1.25rem] bg-[var(--surface-0)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Chứng nhận công khai</p>
                  <p className="mt-2 text-base font-bold text-ink">{certifications.length}</p>
                </div>
                <div className="rounded-[1.25rem] bg-[var(--surface-0)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">QR Passport</p>
                  <p className="mt-2 text-base font-bold text-ink">{passport ? 'Sẵn sàng xem' : 'Đang cập nhật'}</p>
                </div>
              </div>
            </Panel>

            <Panel>
              <h2 className="text-xl font-bold">Chứng nhận</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tổng hợp các chứng nhận công khai đi kèm sản phẩm để người mua kiểm tra nhanh.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-[1.25rem] border border-[#eadfce] bg-[var(--surface-0)] px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-500">Tổng chứng nhận</p>
                  <p className="mt-1 text-lg font-bold text-ink">{certifications.length}</p>
                </div>
                <p className="max-w-[12rem] text-right text-xs leading-5 text-slate-500">Danh sách đầy đủ vẫn hiển thị ngay bên dưới để người mua kiểm tra trực tiếp.</p>
              </div>
              <div className="mt-4 grid max-h-[28rem] gap-3 overflow-auto overscroll-contain pr-1 sm:max-h-[34rem] xl:max-h-[42rem]">
                {certifications.length ? (
                  certifications.map((cert) => (
                    <div key={cert.id} className="rounded-[1.25rem] border border-[#eadfce] bg-[var(--surface-0)] p-4 text-sm">
                      <strong className="text-ink">{cert.name}</strong>
                      <span className="mt-1 block leading-6 text-slate-600">
                        {cert.issuer || 'Đơn vị cấp'} · {formatDate(cert.expiresAt)}
                      </span>
                      {cert.file?.publicUrl && (
                        <a href={cert.file.publicUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-3.5 text-sm font-semibold text-leaf shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-mint">
                          Xem tài liệu chứng nhận
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Chưa có chứng nhận công khai.</p>
                )}
              </div>
            </Panel>

            <Panel>
              <h2 className="text-xl font-bold">HTX sản xuất</h2>
              <p className="mt-2 font-semibold text-ink">{product.cooperative?.name ?? 'HTX đang cập nhật'}</p>
              {product.cooperative?.phone && <p className="mt-1 text-slate-600">{product.cooperative.phone}</p>}
              {product.zone?.address && <p className="mt-1 text-sm leading-6 text-slate-600">{product.zone.address}</p>}
              {passport && (
                <a
                  href={passportUrl(`/passport/${passport.passportCode}`)}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
                >
                  Xem QR Passport
                </a>
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
