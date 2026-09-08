import React from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCheck,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Store,
  User
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { DEFAULT_PRODUCT_IMAGE, PublicImage } from '@/components/public-image';
import { PublicLogo } from '@/components/public-logo';
import { formatDate } from '@/lib/format';
import { cn } from '@/components/ui';

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

async function getPassport(code: string) {
  try {
    const response = await fetch(`${API_URL}/public/passports/${encodeURIComponent(code)}`, {
      cache: 'no-store'
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<Passport>;
    return body.data;
  } catch {
    return null;
  }
}

type PublicPassportPageProps = {
  params: Promise<{ code: string }>;
};

function logImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return { url: item };
      if (item && typeof item === 'object' && typeof (item as { url?: unknown }).url === 'string') {
        return { url: String((item as { url: string }).url) };
      }
      return null;
    })
    .filter((item): item is { url: string } => Boolean(item?.url));
}

export default async function PublicPassportPage({ params }: PublicPassportPageProps) {
  const { code } = await params;
  const passport = await getPassport(code);

  if (!passport) {
    return (
      <main data-public-site="passport" className="grid min-h-screen place-items-center bg-[var(--surface-1)] px-4">
        <div className="max-w-md text-center rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4">
            <QrCode size={32} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Không tìm thấy Hộ Chiếu Nông Nghiệp</h1>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Mã định danh truy xuất không tồn tại hoặc chưa được mở phạm vi công khai trên hệ thống.
          </p>
          <Link
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#0d7a28] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0a6120]"
            href="/"
          >
            Về trang chủ hệ thống
          </Link>
        </div>
      </main>
    );
  }

  const certifications = passport.product.certifications;
  const publicLogs = passport.product.farmingLogs;

  return (
    <main data-public-site="passport" className="min-h-screen bg-[var(--surface-subtle)] pb-12">
      {/* Top Header */}
      <header className="border-b border-[var(--border)] bg-white sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <PublicLogo size={28} variant="agri-wordmark" className="h-7 w-auto" />
            </Link>
            <span className="hidden sm:inline-block h-4 w-px bg-[var(--border)]" />
            <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
              Hộ Chiếu Nông Nghiệp Điện Tử
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link
              href="/san-pham"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-[var(--text-secondary)] hover:text-[#0d7a28] hover:border-[#0d7a28] transition"
            >
              Danh mục sản phẩm
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-[#0d7a28] px-3 py-1.5 text-white hover:bg-[#0a6120] transition"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
        {/* =========================================================================
            PASSPORT CERTIFICATE BANNER (High Trust Header)
           ========================================================================= */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          {/* Top Verification Ribbon */}
          <div className="bg-[#0d7a28] px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>Hồ sơ truy xuất điện tử</span>
            </div>
            <span className="font-mono text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded">
              PASSPORT-ID: {passport.passportCode}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Info & QR (7 cols) */}
            <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1 rounded-md bg-[#0d7a28]/10 px-2.5 py-0.5 text-xs font-bold text-[#0d7a28]">
                  <CheckCircle2 size={13} />
                  <span>Thông tin từ hồ sơ công khai</span>
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {passport.product.name}
                </h1>

                <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Store size={15} className="text-[var(--text-tertiary)] shrink-0" />
                  <span className="font-semibold text-[var(--text-primary)]">{passport.cooperative.name}</span>
                </div>

                {passport.product.zone?.name && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <MapPin size={14} className="text-[var(--text-tertiary)] shrink-0" />
                    <span>{passport.product.zone.name}</span>
                  </div>
                )}
              </div>

              {/* QR and Trust stats */}
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-6 border-t border-[var(--border)]">
                {passport.qrDataUrl && (
                  <div className="shrink-0 rounded-xl border-2 border-[#0d7a28]/30 bg-white p-2 shadow-xs">
                    <img
                      src={passport.qrDataUrl}
                      width={100}
                      height={100}
                      alt={`Mã QR ${passport.passportCode}`}
                      className="h-24 w-24 object-contain"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                      Mã định danh
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--text-primary)] truncate block mt-0.5">
                      {passport.passportCode}
                    </span>
                  </div>

                  <div className="rounded-lg bg-[var(--surface-subtle)] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                      Lượt quét tra cứu
                    </span>
                    <span className="text-xs font-bold text-[#0d7a28] flex items-center gap-1 mt-0.5">
                      <Eye size={13} />
                      {passport.viewCount} lượt
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Product Image (5 cols) */}
            <div className="lg:col-span-5 relative bg-[var(--surface-subtle)] border-t lg:border-t-0 lg:border-l border-[var(--border)]">
              <PublicImage
                src={passport.product.thumbnail?.publicUrl}
                alt={passport.product.name}
                fallback={DEFAULT_PRODUCT_IMAGE}
                priority
                wrapperClassName="h-64 sm:h-80 lg:h-full w-full"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            DETAILED TRACEABILITY & VERIFICATION CONTENT
           ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Traceability Timeline & Description (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Farming Logs Timeline */}
            <section className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Calendar size={18} className="text-[#0d7a28]" />
                    <span>Nhật ký Canh tác & Dữ liệu Thực địa</span>
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Các mốc sự kiện được đồng bộ trực tiếp từ hệ thống quản trị sản xuất
                  </p>
                </div>
                <span className="rounded-full bg-[#0d7a28]/10 px-2.5 py-0.5 text-xs font-bold text-[#0d7a28]">
                  {publicLogs.length} sự kiện
                </span>
              </div>

              {publicLogs.length ? (
                <div className="space-y-4">
                  {publicLogs.map((log, index) => (
                    <div key={log.id} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d7a28] text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-md bg-[#0d7a28]/10 px-2.5 py-0.5 text-xs font-bold text-[#0d7a28]">
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

                        {(log.zone?.name || log.actor?.fullName) && (
                          <div className="mt-2 text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                            <User size={12} />
                            <span>{[log.zone?.name, log.actor?.fullName].filter(Boolean).join(' · ')}</span>
                          </div>
                        )}

                        {logImages(log.imagesJson).length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {logImages(log.imagesJson).slice(0, 6).map((image, i) => (
                              <PublicImage
                                key={`${log.id}-${i}`}
                                src={image.url}
                                alt={`Ảnh nhật ký ${index + 1}`}
                                fallback={DEFAULT_PRODUCT_IMAGE}
                                decorative
                                wrapperClassName="aspect-square w-full rounded-lg overflow-hidden border border-[var(--border)]"
                                className="h-full w-full object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)] italic">
                  Chưa có sự kiện nhật ký canh tác công khai nào được ghi nhận cho mã QR này.
                </p>
              )}
            </section>

            {/* Product Details Panel */}
            <section className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-sm">
              <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 mb-4">
                Thông tin sản phẩm & Vùng canh tác
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {passport.product.description || 'Hợp tác xã đang cập nhật mô tả chi tiết cho sản phẩm.'}
              </p>

              {passport.product.zone && (
                <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
                  <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#0d7a28]" />
                    <span>{passport.product.zone.name}</span>
                  </p>
                  {passport.product.zone.address && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{passport.product.zone.address}</p>
                  )}
                  {passport.product.zone.areaM2 && (
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                      Diện tích quy hoạch: {passport.product.zone.areaM2} m²
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Certifications & Cooperative Contacts (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Certifications Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-4">
                <Award size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Chứng nhận Chất lượng ({certifications.length})
                </h3>
              </div>

              {certifications.length ? (
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3">
                      <p className="text-xs font-bold text-[var(--text-primary)]">{cert.name}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Cơ quan cấp: {cert.issuer || 'Đang cập nhật'}
                      </p>
                      {cert.expiresAt && (
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                          Hạn dùng: {formatDate(cert.expiresAt)}
                        </p>
                      )}
                      {cert.file?.publicUrl && (
                        <a
                          href={cert.file.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#0d7a28] hover:underline"
                        >
                          <FileCheck size={12} />
                          <span>Xem chứng chỉ đính kèm</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-tertiary)] italic">
                  Chưa có chứng chỉ nào được tải lên cho mã QR này.
                </p>
              )}
            </div>

            {/* Cooperative Info Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-3">
                <Store size={18} className="text-[#131935]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Đơn vị Sản xuất (HTX)</h3>
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">{passport.cooperative.name}</p>
              {passport.cooperative.address && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">{passport.cooperative.address}</p>
              )}
              {passport.cooperative.phone && (
                <a
                  href={`tel:${passport.cooperative.phone}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#131935] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1f284f]"
                >
                  <Phone size={14} />
                  <span>Gọi HTX ({passport.cooperative.phone})</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
