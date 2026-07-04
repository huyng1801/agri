import Link from 'next/link';
import { Calendar, MapPin, Phone, QrCode, ShoppingCart, Store } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { PublicProduct, PublicShell } from '@/components/public-marketplace';
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

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) {
    return (
      <PublicShell>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Panel className="text-center">
            <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
            <Link className="mt-4 inline-block font-semibold text-leaf" href="/san-pham">
              Quay lại danh sách sản phẩm
            </Link>
          </Panel>
        </main>
      </PublicShell>
    );
  }

  const passport = product.passports?.[0];
  return (
    <PublicShell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[4/3] bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
          </section>
          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase text-leaf">{product.category?.name ?? 'Nông sản'}</p>
              <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
              <Link href={`/htx/${product.cooperative?.code ?? ''}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Store size={16} aria-hidden="true" />
                {product.cooperative?.name ?? 'HTX đang cập nhật'}
              </Link>
            </div>
            <Panel>
              <p className="text-sm text-slate-500">Giá bán</p>
              <p className="mt-1 text-3xl font-bold text-leaf">{formatPrice(product.price)}</p>
              <p className="text-sm text-slate-500">/{product.unit}</p>
            </Panel>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button>
                <ShoppingCart size={18} aria-hidden="true" />
                Thêm vào giỏ
              </Button>
              {product.cooperative?.phone && (
                <a href={`tel:${product.cooperative.phone}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink">
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Panel>
            <h2 className="text-xl font-bold">Mô tả sản phẩm</h2>
            <p className="mt-3 leading-7 text-slate-700">{product.description || 'HTX đang cập nhật mô tả sản phẩm.'}</p>
            {product.zone && (
              <div className="mt-4 rounded-md bg-mint p-3 text-sm">
                <p className="flex items-center gap-2 font-bold">
                  <MapPin size={16} aria-hidden="true" />
                  {product.zone.name}
                </p>
                <p className="mt-1 text-slate-700">{product.zone.address}</p>
              </div>
            )}
          </Panel>

          <Panel>
            <h2 className="text-xl font-bold">Chứng nhận</h2>
            <div className="mt-3 space-y-2">
              {product.certifications?.length ? (
                product.certifications.map((cert) => (
                  <div key={cert.id} className="rounded-md bg-slate-50 p-3 text-sm">
                    <strong>{cert.name}</strong>
                    <span className="block text-slate-600">{cert.issuer || 'Đơn vị cấp'} · {formatDate(cert.expiresAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Chưa có chứng nhận public.</p>
              )}
            </div>
          </Panel>
        </div>

        <Panel className="mt-4">
          <h2 className="text-xl font-bold">Nhật ký public</h2>
          <div className="mt-4 space-y-3">
            {product.farmingLogs?.length ? (
              product.farmingLogs.map((log) => (
                <div key={log.id} className="rounded-md bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-mint px-2 py-1 font-semibold text-leaf">{log.activityType}</span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Calendar size={14} aria-hidden="true" />
                      {formatDate(log.logDate)}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700">{log.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Chưa có nhật ký public.</p>
            )}
          </div>
        </Panel>
      </main>
    </PublicShell>
  );
}

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0));
}
