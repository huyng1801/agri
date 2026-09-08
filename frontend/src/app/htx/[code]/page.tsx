import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Layers
} from 'lucide-react';
import { ProductCard, cooperativesFromProducts } from '@/components/public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, PublicImage } from '@/components/public-image';
import { PublicDetailMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
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
    title: `${cooperative.name} · Hồ sơ Năng lực & Sản phẩm HTX`,
    description: brandizeSiteText(
      `Xem dữ liệu sản phẩm, vùng trồng và thông tin công khai của ${cooperative.name} trên nền tảng AGRIPASSPORT.`,
      siteKey
    ),
    alternates: { canonical: await getRequestAbsoluteUrl(`/htx/${cooperative.code}`) }
  };
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
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(numeric)} m²`;
}

export default async function CooperativeDetailPage({ params }: CooperativeDetailPageProps) {
  const { code } = await params;
  const products = await fetchProductsForCooperative(code);
  const cooperative = cooperativesFromProducts(products)[0];
  const zones = zonesFromProducts(products);

  if (!cooperative) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl py-16 text-center">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 sm:p-12 shadow-sm">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Không tìm thấy hợp tác xã</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Hồ sơ hợp tác xã bạn đang tìm kiếm có thể chưa được kích hoạt công khai hoặc mã định danh không đúng.
            </p>
            <Link
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#131935] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f284f]"
              href="/htx"
            >
              <ArrowLeft size={16} className="mr-2" />
              Quay lại danh bạ HTX
            </Link>
          </div>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const canonical = await getRequestAbsoluteUrl(`/htx/${cooperative.code}`);
  const cooperativeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: cooperative.name,
    url: canonical,
    telephone: cooperative.phone || undefined,
    areaServed: cooperative.province || 'Việt Nam',
    brand: { '@type': 'Brand', name: 'Agripassport' }
  };

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cooperativeJsonLd).replace(/</g, '\\u003c') }}
      />
      <PublicDetailMain className="py-6 sm:py-10">
        <nav aria-label="Điều hướng liên kết" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href="/" className="inline-flex min-h-[36px] items-center py-1 transition hover:text-[var(--brand-primary)]">Trang chủ</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link href="/htx" className="inline-flex min-h-[36px] items-center py-1 transition hover:text-[var(--brand-primary)]">Danh bạ Hợp tác xã</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span className="font-semibold text-[var(--text-primary)] truncate max-w-[260px]">{cooperative.name}</span>
        </nav>

        {/* =========================================================================
            COOPERATIVE PROFILE HEADER (Industrial Entity Spec)
           ========================================================================= */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity & Status */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <PublicImage
                  src={cooperative.avatarUrl}
                  alt={cooperative.name}
                  fallback={DEFAULT_COOPERATIVE_IMAGE}
                  priority
                  wrapperClassName="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] overflow-hidden shadow-sm"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#131935]/10 px-2.5 py-0.5 text-xs font-bold text-[#131935]">
                    <ShieldCheck size={13} />
                    HTX công khai
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">
                    Mã HTX: {cooperative.code}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {cooperative.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-[var(--text-tertiary)]" />
                    <span>{cooperative.province || 'Việt Nam'}</span>
                  </span>
                  <span>•</span>
                  <span>Thông tin đơn vị được công khai theo hồ sơ</span>
                </div>
              </div>
            </div>

            {/* Actions & Contact */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
              {cooperative.phone ? (
                <a
                  href={`tel:${cooperative.phone}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#131935] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f284f]"
                >
                  <Phone size={16} />
                  <span>Gọi trực tiếp ({cooperative.phone})</span>
                </a>
              ) : (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2.5 text-xs text-[var(--text-tertiary)]">
                  Số điện thoại đang cập nhật
                </div>
              )}
            </div>
          </div>

          {/* 4-Box Metric Summary Strip */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 pt-6 border-t border-[var(--border)]">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Sản phẩm công khai
              </span>
              <span className="text-2xl font-extrabold text-[var(--text-primary)] block mt-1">
                {cooperative.productCount}
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Vùng trồng quy hoạch
              </span>
              <span className="text-2xl font-extrabold text-[var(--text-primary)] block mt-1">
                {zones.length}
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Khu vực hoạt động
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)] block mt-2 truncate">
                {cooperative.province || 'Chưa cập nhật'}
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Trạng thái dữ liệu
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0d7a28] mt-2">
                <ShieldCheck size={14} /> Đã chuẩn hóa
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION: PRODUCTION ZONES (Vùng Trồng & Canh Tác)
           ========================================================================= */}
        <section className="mt-10">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4 mb-6">
            <Layers size={18} className="text-[#106f8a]" />
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Vùng trồng công khai
              </h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Quy hoạch vùng canh tác ({zones.length} khu vực)
              </p>
            </div>
          </div>

          {zones.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <div
                  key={zone.key}
                  className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm text-[var(--text-primary)]">{zone.name}</p>
                    <span className="rounded bg-[#106f8a]/10 px-2 py-0.5 text-[11px] font-bold text-[#106f8a] shrink-0">
                      {zone.productCount} sản phẩm
                    </span>
                  </div>
                  {zone.address && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                      <MapPin size={13} className="shrink-0 mt-0.5 text-[var(--text-tertiary)]" />
                      <span>{zone.address}</span>
                    </p>
                  )}
                  {zone.areaM2 && (
                    <p className="mt-3 text-xs font-medium text-[var(--text-tertiary)] border-t border-[var(--border-subtle)] pt-2">
                      Quy mô: <strong className="text-[var(--text-primary)]">{formatArea(zone.areaM2)}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-secondary)]">
              Hợp tác xã chưa công khai vùng trồng cụ thể trên hồ sơ điện tử.
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION: PRODUCTS OF THIS COOPERATIVE
           ========================================================================= */}
        <section className="mt-12">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-[#131935]" />
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Sản phẩm công khai của HTX
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {products.length} sản phẩm đang được giới thiệu
                </p>
              </div>
            </div>
          </div>

          {products.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text-secondary)]">
              Hiện tại chưa có sản phẩm nào được đăng tải công khai từ đơn vị này.
            </div>
          )}
        </section>
      </PublicDetailMain>
    </PublicShell>
  );
}
