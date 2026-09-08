import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileCheck,
  FileText,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Store,
  Tag
} from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { PublicProduct } from '@/components/public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from '@/components/public-image';
import { PublicDetailMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { formatDate } from '@/lib/format';
import { brandizeSiteText } from '@/lib/page-metadata';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';
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
  const canonical = await getRequestAbsoluteUrl(`/san-pham/${product.slug}`);
  const description = brandizeSiteText(
    product.description || `Xem ${product.name} từ ${product.cooperative?.name ?? 'HTX'} trên nền tảng công khai.`,
    siteKey
  );
  const image = product.thumbnail?.publicUrl || (await getRequestAbsoluteUrl('/public-media-placeholder.svg'));
  return {
    title: `${product.name} · Dữ liệu Nông sản & QR Passport`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} - AGRIPASSPORT`,
      description,
      url: canonical,
      siteName: 'AGRIPASSPORT',
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: image, alt: product.name }]
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [image]
    }
  };
}

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    Number(value ?? 0)
  );
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl py-16 text-center">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 sm:p-12 shadow-sm">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Không tìm thấy sản phẩm</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Sản phẩm bạn đang tìm kiếm có thể đã được gỡ xuống hoặc chưa mở phạm vi công khai.
            </p>
            <Link
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#106f8a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d596e]"
              href="/san-pham"
            >
              <ArrowLeft size={16} className="mr-2" />
              Quay lại danh mục sản phẩm
            </Link>
          </div>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const passport = product.passports?.[0];
  const certifications = product.certifications ?? [];
  const publicLogs = product.farmingLogs ?? [];
  const canonical = await getRequestAbsoluteUrl(`/san-pham/${product.slug}`);
  const placeholderUrl = await getRequestAbsoluteUrl('/public-media-placeholder.svg');

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: [product.thumbnail?.publicUrl || placeholderUrl],
    sku: product.code,
    brand: { '@type': 'Brand', name: 'Agripassport' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: Number(product.price ?? 0),
      availability: 'https://schema.org/InStock',
      url: canonical
    },
    manufacturer: product.cooperative?.name || undefined
  };

  const passportTargetUrl = passport ? passportUrl(`/passport/${passport.publicSlug || passport.passportCode}`) : null;

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }} />

      <PublicDetailMain className="py-6 sm:py-10">
        {/* Institutional Breadcrumbs */}
        <nav aria-label="Điều hướng liên kết" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href="/" className="transition hover:text-[var(--brand-primary)]">Trang chủ</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link href="/san-pham" className="transition hover:text-[var(--brand-primary)]">Danh mục Nông sản</Link>
          {product.category && (
            <>
              <ChevronRight size={13} aria-hidden="true" />
              <Link href={`/san-pham?category=${encodeURIComponent(product.category.slug)}`} className="transition hover:text-[var(--brand-primary)]">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={13} aria-hidden="true" />
          <span className="font-semibold text-[var(--text-primary)] truncate max-w-[240px]">{product.name}</span>
        </nav>

        {/* =========================================================================
            PRODUCT CORE SUMMARY: 2-COLUMN BALANCED INDUSTRIAL SPECIFICATION
           ========================================================================= */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column (5 cols): Media & Verification Badges */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
              <div className="relative aspect-[4/3] w-full bg-[var(--surface-subtle)]">
                <PublicImage
                  src={product.thumbnail?.publicUrl}
                  alt={product.name}
                  fallback={DEFAULT_PRODUCT_IMAGE}
                  priority
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
                {passport && (
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-[#0d7a28]/30 bg-white/95 px-2.5 py-1 text-xs font-bold text-[#0d7a28] shadow-sm backdrop-blur">
                    <ShieldCheck size={14} />
                    <span>ĐÃ CẤP QR PASSPORT</span>
                  </div>
                )}
              </div>

              {/* Quick Tech Specs Strip below image */}
              <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-t border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-xs">
                <div className="px-2">
                  <span className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Mã định danh</span>
                  <span className="font-mono font-bold text-[var(--text-primary)] truncate block mt-0.5">{product.code}</span>
                </div>
                <div className="px-2">
                  <span className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Đơn vị đóng gói</span>
                  <span className="font-bold text-[var(--text-primary)] block mt-0.5">{product.unit}</span>
                </div>
              </div>
            </div>

            {/* If has QR passport, showcase dedicated certificate box */}
            {passportTargetUrl && (
              <div className="mt-4 rounded-xl border border-[#0d7a28]/30 bg-[#0d7a28]/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0d7a28] text-white">
                    <QrCode size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0d7a28]">Hộ Chiếu Nông Nghiệp</p>
                    <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">Mã số: {passport?.passportCode}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      Sản phẩm đã hoàn tất chứng thư điện tử. Người tiêu dùng có thể quét QR để đối chiếu vùng trồng và nhật ký.
                    </p>
                    <a
                      href={passportTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0d7a28] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0a6120]"
                    >
                      <span>Mở Chứng thư QR</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Data Specifications, Price & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#106f8a]/10 px-2.5 py-0.5 text-xs font-bold text-[#106f8a]">
                  <Tag size={12} />
                  {product.category?.name ?? 'Nông sản'}
                </span>
                {product.zone?.name && (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <MapPin size={13} className="text-[var(--text-tertiary)]" />
                    <span>{product.zone.name}</span>
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {product.name}
              </h1>

              {/* Producer / Cooperative Profile Strip */}
              {product.cooperative && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <PublicImage
                      src={product.cooperative.avatarUrl}
                      alt={product.cooperative.name}
                      fallback={DEFAULT_COOPERATIVE_IMAGE}
                      wrapperClassName="h-11 w-11 shrink-0 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-subtle)]"
                      className="h-full w-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#131935]">Đơn vị sản xuất</span>
                        <span className="inline-flex items-center gap-0.5 rounded bg-[#106f8a]/10 px-1.5 py-0.2 text-[10px] font-bold text-[#106f8a]">
                          Đã xác thực
                        </span>
                      </div>
                      <Link
                        href={`/htx/${product.cooperative.code}`}
                        className="text-sm font-bold text-[var(--text-primary)] hover:text-[#106f8a] transition"
                      >
                        {product.cooperative.name}
                      </Link>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {product.cooperative.province || 'Việt Nam'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/htx/${product.cooperative.code}`}
                    className="inline-flex h-8 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-bold text-[var(--text-primary)] hover:border-[#106f8a] hover:text-[#106f8a] transition"
                  >
                    Xem hồ sơ HTX
                  </Link>
                </div>
              )}

              {/* Price Display Box */}
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Giá tham chiếu công khai</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">/{product.unit}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0d7a28] bg-[#0d7a28]/10 px-2.5 py-1 rounded-md">
                    Giá niêm yết từ HTX
                  </span>
                </div>
              </div>

              {/* Key Specs Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-[var(--border)] bg-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                    Chứng nhận
                  </span>
                  <span className="text-base font-bold text-[var(--text-primary)] block mt-0.5">
                    {certifications.length} bản ghi
                  </span>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                    Nhật ký canh tác
                  </span>
                  <span className="text-base font-bold text-[var(--text-primary)] block mt-0.5">
                    {publicLogs.length} sự kiện
                  </span>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                    Tình trạng
                  </span>
                  <span className="text-base font-bold text-[#0d7a28] block mt-0.5">
                    Công khai
                  </span>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--border)]">
              {product.cooperative?.phone && (
                <a
                  href={`tel:${product.cooperative.phone}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#106f8a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d596e]"
                >
                  <Phone size={16} />
                  <span>Liên hệ thu mua ({product.cooperative.phone})</span>
                </a>
              )}
              {passportTargetUrl && (
                <a
                  href={passportTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#0d7a28]/40 bg-[#0d7a28]/10 px-5 text-sm font-bold text-[#0d7a28] transition hover:bg-[#0d7a28] hover:text-white"
                >
                  <QrCode size={16} />
                  <span>Tra cứu QR Passport</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            DETAILED TABS / PANELS: DESCRIPTION, LOGS, CERTIFICATIONS
           ========================================================================= */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Main specifications: Description & Farming Logs (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description Panel */}
            <section className="rounded-xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4 mb-4">
                <FileText size={18} className="text-[#106f8a]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Mô tả sản phẩm & Quy trình sản xuất
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                {product.description || 'Hợp tác xã đang cập nhật thông tin giới thiệu chi tiết cho sản phẩm này.'}
              </p>

              {product.zone && (
                <div className="mt-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#106f8a] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Vùng canh tác: {product.zone.name}</p>
                      {product.zone.address && (
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{product.zone.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Farming Logs Timeline */}
            <section className="rounded-xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#0d7a28]" />
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)]">
                      Nhật ký Canh tác Minh bạch
                    </h2>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Dữ liệu ghi nhận từ hệ thống quản trị cơ sở HTX
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--text-secondary)]">
                  {publicLogs.length} ghi chép
                </span>
              </div>

              {publicLogs.length ? (
                <div className="space-y-4">
                  {publicLogs.map((log, index) => (
                    <div key={log.id} className="relative flex items-start gap-4 pb-4 last:pb-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d7a28]/10 text-xs font-bold text-[#0d7a28]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-md bg-[#0d7a28]/10 px-2 py-0.5 text-xs font-bold text-[#0d7a28]">
                            {log.activityType}
                          </span>
                          <span className="text-xs font-medium text-[var(--text-tertiary)] flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(log.logDate)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)] italic">
                  Chưa có nhật ký canh tác nào được đánh dấu công khai cho sản phẩm này.
                </p>
              )}
            </section>
          </div>

          {/* Aside: Certifications & Verification Trust (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Certifications Card */}
            <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-4">
                <Award size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Chứng nhận & Tiêu chuẩn ({certifications.length})
                </h3>
              </div>

              {certifications.length ? (
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{cert.name}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                        Cơ quan cấp: <span className="font-semibold text-[var(--text-primary)]">{cert.issuer || 'Đang cập nhật'}</span>
                      </p>
                      {cert.expiresAt && (
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                          Hiệu lực đến: {formatDate(cert.expiresAt)}
                        </p>
                      )}
                      {cert.file?.publicUrl && (
                        <a
                          href={cert.file.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#106f8a] hover:underline"
                        >
                          <FileCheck size={12} />
                          <span>Xem văn bản chứng nhận</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)] italic">
                  Chưa có tài liệu chứng nhận nào được đăng tải công khai.
                </p>
              )}
            </div>

            {/* Platform Trust Statement */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-[#106f8a]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Cam kết Dữ liệu Thật</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Mọi thông tin trên trang này đều được đồng bộ từ hồ sơ HTX, dữ liệu vùng trồng và mã chứng thư Hộ Chiếu Nông Nghiệp theo tiêu chuẩn định danh số.
              </p>
            </div>
          </aside>
        </div>
      </PublicDetailMain>
    </PublicShell>
  );
}
