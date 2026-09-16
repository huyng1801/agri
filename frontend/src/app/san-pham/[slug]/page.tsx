import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { STANDARD_PRODUCTS } from '@/lib/public-catalog';
import { PublicProduct } from '@/components/public-marketplace';
import { PublicDetailMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { brandizeSiteText } from '@/lib/page-metadata';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';
import { passportUrl } from '@/lib/domain';
import { ProductPassportClient } from '@/components/product-passport-client';
import { deduplicateCertifications, translateActivityType, sanitizeLogDescription } from '@/lib/product-passport-utils';

async function getProduct(slug: string) {
  try {
    const response = await fetch(`${API_URL}/products/public/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!response.ok) {
      return process.env.NODE_ENV === 'production' ? null : STANDARD_PRODUCTS.find((product) => product.slug === slug) || null;
    }
    const body = (await response.json()) as ApiEnvelope<PublicProduct>;
    return body.data;
  } catch {
    return process.env.NODE_ENV === 'production' ? null : STANDARD_PRODUCTS.find((product) => product.slug === slug) || null;
  }
}

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';
  const product = await getProduct(slug);
  if (!product) return { title: 'Không tìm thấy sản phẩm' };
  const canonical = await getRequestAbsoluteUrl(`/san-pham/${product.slug}`);
  const description = brandizeSiteText(
    product.description || `Xem ${product.name} từ ${product.cooperative?.name ?? 'hợp tác xã'} trên nền tảng công khai.`,
    siteKey
  );
  const image = product.thumbnail?.publicUrl || (await getRequestAbsoluteUrl('/public-media-placeholder.svg'));
  return {
    title: `${product.name} · ${siteName}`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} · ${siteName}`,
      description,
      url: canonical,
      siteName,
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

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';
  const product = await getProduct(slug);

  if (!product) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl py-16 text-center">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 sm:p-12 shadow-sm">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Không tìm thấy hồ sơ nông sản</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Hồ sơ bạn đang tìm kiếm có thể đã được gỡ xuống hoặc chưa mở phạm vi công khai trên {siteName}.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)]"
              href="/san-pham"
            >
              <ArrowLeft size={16} className="mr-2" />
              Xem danh mục nông sản
            </Link>
          </div>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const passport = product.passports?.[0];
  const canonical = await getRequestAbsoluteUrl(`/san-pham/${product.slug}`);
  const placeholderUrl = await getRequestAbsoluteUrl('/public-media-placeholder.svg');

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: [product.thumbnail?.publicUrl || placeholderUrl],
    sku: product.code,
    brand: { '@type': 'Brand', name: siteName },
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

      <PublicDetailMain className="public-product-detail py-6 sm:py-10">
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

        {/* Commercial Digital Passport Experience */}
        <ProductPassportClient
          product={{
            ...product,
            certifications: deduplicateCertifications(product.certifications || []),
            farmingLogs: (product.farmingLogs || []).map((log) => ({
              ...log,
              activityType: translateActivityType(log.activityType),
              description: sanitizeLogDescription(log.description)
            }))
          }}
          passportTargetUrl={passportTargetUrl}
          siteKey={siteKey}
        />
      </PublicDetailMain>
    </PublicShell>
  );
}
