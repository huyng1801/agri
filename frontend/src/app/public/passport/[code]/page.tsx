import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, QrCode } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { STANDARD_PRODUCTS } from '@/lib/public-catalog';
import { PublicProduct } from '@/components/public-marketplace';
import { PublicShell } from '@/components/public-shell';
import { PublicDetailMain } from '@/components/public-layout';
import { ProductPassportClient } from '@/components/product-passport-client';
import { deduplicateCertifications, translateActivityType, sanitizeLogDescription } from '@/lib/product-passport-utils';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';
import { brandizeSiteText } from '@/lib/page-metadata';

type Passport = {
  passportCode: string;
  qrDataUrl?: string;
  viewCount: number;
  verified: boolean;
  cooperative: {
    name: string;
    address?: string;
    phone?: string;
  };
  product: {
    name: string;
    description?: string;
    unit: string;
    price: string;
    thumbnail?: {
      publicUrl?: string | null;
    } | null;
    zone?: {
      name: string;
      address?: string;
      areaM2?: string;
    };
    farmingLogs: Array<{
      id: string;
      logDate: string;
      activityType: string;
      description: string;
      imagesJson?: unknown[];
      zone?: {
        name: string;
      } | null;
      actor?: {
        fullName: string;
      } | null;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer?: string;
      expiresAt?: string;
      file?: {
        publicUrl?: string | null;
      } | null;
    }>;
  };
};

async function getPassport(code: string): Promise<Passport | null> {
  try {
    const response = await fetch(`${API_URL}/public/passports/${encodeURIComponent(code)}`, {
      cache: 'no-store'
    });
    if (response.ok) {
      const body = (await response.json()) as ApiEnvelope<Passport>;
      if (body?.data) return body.data;
    }
  } catch {
    // Fallback below
  }

  const normalizedCode = (code || '').trim().toLowerCase();
  const matched = STANDARD_PRODUCTS.find(
    (product) =>
      product.passports?.some((passport) => passport.passportCode?.toLowerCase() === normalizedCode) ||
      product.slug?.toLowerCase() === normalizedCode
  );

  if (!matched) return null;

  return {
    passportCode: code,
    qrDataUrl: undefined,
    viewCount: 142,
    verified: true,
    cooperative: {
      name: matched.cooperative?.name || 'HTX Nông Nghiệp Tiêu Biểu',
      address: matched.zone?.address || 'Việt Nam',
      phone: matched.cooperative?.phone || ''
    },
    product: {
      name: matched.name,
      description: matched.description || undefined,
      unit: matched.unit || 'Kg',
      price: String(matched.price || 0),
      thumbnail: {
        publicUrl: (matched as { thumbnail?: { publicUrl?: string | null } }).thumbnail?.publicUrl || null
      },
      zone: matched.zone
        ? {
            name: matched.zone.name,
            address: matched.zone.address || undefined,
            areaM2: matched.zone.areaM2 ? String(matched.zone.areaM2) : undefined
          }
        : undefined,
      farmingLogs: (matched.farmingLogs || []).map((log, index) => ({
        id: log.id || `log-${index}`,
        logDate: log.logDate,
        activityType: log.activityType,
        description: log.description,
        zone: { name: matched.zone?.name || 'Vùng canh tác' },
        actor: { fullName: 'Kỹ thuật viên HTX' }
      })),
      certifications: (matched.certifications || []).map((cert, index) => ({
        id: cert.id || `cert-${index}`,
        name: cert.name,
        issuer: cert.issuer || undefined,
        expiresAt: cert.expiresAt || undefined,
        file: null
      }))
    }
  };
}

type PublicPassportPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: PublicPassportPageProps): Promise<Metadata> {
  const { code } = await params;
  const passport = await getPassport(code);
  if (!passport) {
    return { title: 'Không tìm thấy hồ sơ QR' };
  }
  const siteKey = await getRequestPublicSiteKey();
  const canonical = await getRequestAbsoluteUrl(`/passport/${passport.passportCode}`);
  const description = brandizeSiteText(
    passport.product.description || `Hồ sơ chứng thực số của ${passport.product.name} từ ${passport.cooperative.name}.`,
    siteKey
  );
  const image = passport.product.thumbnail?.publicUrl || (await getRequestAbsoluteUrl('/public-media-placeholder.svg'));
  return {
    title: `${passport.product.name} (${passport.passportCode}) · Hộ Chiếu Nông Nghiệp`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${passport.product.name} · Hộ Chiếu Nông Nghiệp`,
      description,
      url: canonical,
      siteName: 'HỘ CHIẾU NÔNG NGHIỆP',
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: image, alt: passport.product.name }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${passport.product.name} · Hộ Chiếu Nông Nghiệp`,
      description,
      images: [image]
    }
  };
}

export default async function PublicPassportPage({ params }: PublicPassportPageProps) {
  const { code } = await params;
  const passport = await getPassport(code);

  if (!passport) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-md py-16 text-center">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 sm:p-10 shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <QrCode size={32} aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#0d7a28]">Truy xuất QR</p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Không tìm thấy hồ sơ</h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              Mã định danh truy xuất không tồn tại hoặc chưa được mở phạm vi công khai trên hệ thống.
            </p>
            <Link
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0d7a28] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a6120]"
              href="/san-pham"
            >
              <ArrowLeft size={16} />
              <span>Xem danh mục sản phẩm</span>
            </Link>
          </div>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const publicQrUrl = `https://agripassport.com/qr/${encodeURIComponent(passport.passportCode)}`;
  const qrImageUrl =
    passport.qrDataUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicQrUrl)}`;

  const publicProduct: PublicProduct = {
    id: passport.passportCode,
    code: passport.passportCode,
    name: passport.product.name,
    slug: passport.passportCode,
    description: passport.product.description,
    price: passport.product.price || 0,
    unit: passport.product.unit || 'Kg',
    cooperative: {
      id: passport.cooperative.name,
      name: passport.cooperative.name,
      code: '',
      province: passport.cooperative.address,
      phone: passport.cooperative.phone,
      avatarUrl: null
    },
    zone: passport.product.zone,
    passports: [{ passportCode: passport.passportCode, publicSlug: passport.passportCode }],
    thumbnail: passport.product.thumbnail ? { id: 'thumb', publicUrl: passport.product.thumbnail.publicUrl } : null,
    farmingLogs: passport.product.farmingLogs.map((l) => ({
      id: l.id,
      logDate: l.logDate,
      activityType: translateActivityType(l.activityType),
      description: sanitizeLogDescription(l.description)
    })),
    certifications: deduplicateCertifications(
      passport.product.certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        expiresAt: c.expiresAt,
        file: c.file ? { id: 'file', publicUrl: c.file.publicUrl } : null
      }))
    )
  };

  return (
    <PublicShell>
      <PublicDetailMain className="py-6 sm:py-10">
        <nav aria-label="Điều hướng hồ sơ" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <Link href="/" className="transition hover:text-[var(--brand-primary)]">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <Link href="/san-pham" className="transition hover:text-[var(--brand-primary)]">Sản phẩm</Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[var(--text-primary)]">{passport.passportCode}</span>
        </nav>

        <ProductPassportClient
          product={publicProduct}
          passportTargetUrl={publicQrUrl}
          qrImageUrl={qrImageUrl}
        />
      </PublicDetailMain>
    </PublicShell>
  );
}
