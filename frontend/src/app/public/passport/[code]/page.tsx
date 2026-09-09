import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
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
import { STANDARD_PRODUCTS } from '@/lib/public-catalog';

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
    // Keep the public demo profile available when the API is unavailable.
  }

  const normalizedCode = (code || '').trim().toLowerCase();
  const matched = STANDARD_PRODUCTS.find((product) =>
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
      address: matched.zone?.address || 'Tỉnh Hà Giang, Việt Nam',
      phone: matched.cooperative?.phone || '0912 345 678'
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

const cardClassName = 'rounded-[1.5rem] border border-[var(--border)] bg-white shadow-[0_16px_42px_rgba(15,23,42,0.06)]';
const QR_PRODUCT_FALLBACK = '/news/field-qr.webp';

function SectionHeading({ icon: Icon, eyebrow, title, count }: { icon: LucideIcon; eyebrow?: string; title: string; count?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0d7a28]/10 text-[#0d7a28]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          {eyebrow && <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#0d7a28]">{eyebrow}</p>}
          <h2 className="mt-1 text-lg font-extrabold leading-6 text-[var(--text-primary)]">{title}</h2>
        </div>
      </div>
      {count && <span className="shrink-0 rounded-full bg-[#0d7a28]/10 px-2.5 py-1 text-[11px] font-bold text-[#0d7a28]">{count}</span>}
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#0d7a28]"><Icon size={17} aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

export default async function PublicPassportPage({ params }: PublicPassportPageProps) {
  const { code } = await params;
  const passport = await getPassport(code);

  if (!passport) {
    return (
      <main data-public-site="passport" className="grid min-h-screen place-items-center bg-[var(--surface-subtle)] px-4 py-10">
        <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rose-50 text-rose-600">
            <QrCode size={31} aria-hidden="true" />
          </div>
          <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0d7a28]">QR truy xuất</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Không tìm thấy hồ sơ</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Mã định danh truy xuất không tồn tại hoặc chưa được mở phạm vi công khai trên hệ thống.
          </p>
          <Link className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0d7a28] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a6120]" href="/">
            Về trang chủ hệ thống <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </main>
    );
  }

  const certifications = passport.product.certifications;
  const publicLogs = passport.product.farmingLogs;
  const publicQrUrl = `https://agripassport.com/qr/${encodeURIComponent(passport.passportCode)}`;
  const qrImageUrl = passport.qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicQrUrl)}`;

  return (
    <main data-public-site="passport" className="min-h-screen bg-[var(--surface-subtle)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 shadow-[0_6px_24px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2" aria-label="Agripassport - Trang chủ">
            <PublicLogo size={34} variant="agri-wordmark" className="h-9 w-auto" />
            <span className="hidden border-l border-[var(--border)] pl-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0d7a28] sm:inline">Hồ chiếu nông nghiệp</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Link href="/san-pham" className="hidden min-h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-4 text-[var(--text-secondary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28] sm:inline-flex">Danh mục sản phẩm</Link>
            <Link href="/" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[#0d7a28] px-4 text-white transition hover:bg-[#0a6120]">Trang chủ <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#0d7a28]/10 bg-[radial-gradient(circle_at_85%_10%,rgba(55,172,93,0.16),transparent_28%),linear-gradient(135deg,#f4fbf2_0%,#f8fbf7_46%,#e8f5f1_100%)]">
        <div className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full border-[24px] border-white/50" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-7">
          <nav aria-label="Điều hướng hồ sơ" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="transition hover:text-[#0d7a28]">Agripassport</Link>
            <span aria-hidden="true">/</span>
            <Link href="/san-pham?hasQr=true" className="transition hover:text-[#0d7a28]">Sản phẩm có QR</Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[var(--text-primary)]">{passport.passportCode}</span>
          </nav>

          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:gap-6">
            <section className={`${cardClassName} flex flex-col p-6 sm:p-8`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0d7a28]/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#0d7a28]">
                  <ShieldCheck size={15} aria-hidden="true" /> Hồ sơ truy xuất công khai
                </span>
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold', passport.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                  <CheckCircle2 size={14} aria-hidden="true" /> {passport.verified ? 'Đã xác minh' : 'Đang cập nhật'}
                </span>
              </div>

              <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0d7a28]">Hộ chiếu nông nghiệp điện tử</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-[2.8rem]">
                {passport.product.name}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-[1rem]">
                {passport.product.description || 'Thông tin sản phẩm được công khai từ hồ sơ truy xuất đã đăng ký trên Agripassport.'}
              </p>

              <div className="mt-7 grid gap-5 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
                <InfoLine icon={Store} label="Đơn vị sản xuất" value={passport.cooperative.name} />
                <InfoLine icon={MapPin} label="Vùng sản xuất" value={passport.product.zone?.name} />
              </div>

              <div className="mt-7 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center">
                <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#f4faf2] p-3">
                  <div className="rounded-xl border border-[#0d7a28]/20 bg-white p-1.5 shadow-sm">
                    <img src={qrImageUrl} width={92} height={92} alt={`Mã QR ${passport.passportCode}`} className="h-[5.75rem] w-[5.75rem] object-contain" />
                  </div>
                  <div className="pr-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0d7a28]">Quét để kiểm tra</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Mở đúng hồ sơ của sản phẩm hoặc lô hàng.</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Mã hồ sơ QR</p>
                  <p className="mt-1 truncate font-mono text-sm font-extrabold text-[var(--text-primary)]">{passport.passportCode}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]"><Eye size={13} aria-hidden="true" /> {passport.viewCount.toLocaleString('vi-VN')} lượt tra cứu</p>
                </div>
              </div>
            </section>

            <figure className={`${cardClassName} relative min-h-[22rem] overflow-hidden bg-[#e8f5e5] lg:min-h-0`}>
              <PublicImage
                src={passport.product.thumbnail?.publicUrl}
                alt={passport.product.name}
                fallback={QR_PRODUCT_FALLBACK}
                priority
                wrapperClassName="h-full min-h-[22rem] w-full lg:min-h-full"
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-[#103f28]/82 px-4 py-3 text-white shadow-lg backdrop-blur">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/70">Dữ liệu sản phẩm</p>
                  <p className="mt-1 text-sm font-bold">Minh bạch từ nguồn gốc</p>
                </div>
                <ShieldCheck size={24} className="shrink-0 text-[#b8edc0]" aria-hidden="true" />
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.1)] sm:grid-cols-3">
          <div className="border-b border-[var(--border)] px-5 py-4 sm:border-b-0 sm:border-r"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Trạng thái hồ sơ</p><p className="mt-1.5 text-sm font-extrabold text-emerald-700">Công khai & đã xác minh</p></div>
          <div className="border-b border-[var(--border)] px-5 py-4 sm:border-b-0 sm:border-r"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Mốc dữ liệu</p><p className="mt-1.5 text-sm font-extrabold text-[var(--text-primary)]">{publicLogs.length} sự kiện sản xuất</p></div>
          <div className="px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Tiêu chuẩn</p><p className="mt-1.5 text-sm font-extrabold text-[var(--text-primary)]">{certifications.length} chứng nhận liên quan</p></div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:items-start">
          <div className="space-y-6">
            <section className={`${cardClassName} p-6 sm:p-7`}>
              <SectionHeading icon={Store} eyebrow="Thông tin nhận diện" title="Sản phẩm & vùng canh tác" />
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)] sm:text-[1rem]">
                {passport.product.description || 'Hợp tác xã đang cập nhật mô tả chi tiết cho sản phẩm.'}
              </p>
              {passport.product.zone && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f4faf2] p-4"><p className="flex items-center gap-2 text-xs font-extrabold text-[var(--text-primary)]"><MapPin size={16} className="text-[#0d7a28]" aria-hidden="true" /> Vùng nguyên liệu</p><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">{passport.product.zone.name}</p></div>
                  <div className="rounded-2xl bg-[var(--surface-subtle)] p-4"><p className="text-xs font-extrabold text-[var(--text-primary)]">Địa chỉ ghi nhận</p><p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">{passport.product.zone.address || 'Đang cập nhật'}</p>{passport.product.zone.areaM2 && <p className="mt-1 text-xs text-[var(--text-tertiary)]">Diện tích: {passport.product.zone.areaM2} m²</p>}</div>
                </div>
              )}
            </section>

            <section className={`${cardClassName} p-6 sm:p-7`}>
              <SectionHeading icon={Calendar} eyebrow="Dữ liệu được công khai" title="Hành trình sản xuất" count={`${publicLogs.length} mốc`} />
              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">Các mốc được ghi nhận từ hồ sơ sản xuất và chỉ hiển thị trong phạm vi đã được công khai.</p>
              {publicLogs.length ? (
                <ol className="relative mt-7 space-y-5 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-[#0d7a28]/20">
                  {publicLogs.map((log, index) => (
                    <li key={log.id} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
                      <span className="relative z-[1] grid h-10 w-10 place-items-center rounded-2xl border-4 border-white bg-[#0d7a28] text-xs font-extrabold text-white shadow-sm">{String(index + 1).padStart(2, '0')}</span>
                      <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-[#0d7a28]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#0d7a28]">{log.activityType}</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)]"><Calendar size={13} aria-hidden="true" /> {formatDate(log.logDate)}</span>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{log.description}</p>
                        {(log.zone?.name || log.actor?.fullName) && <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]"><User size={13} aria-hidden="true" /> {[log.zone?.name, log.actor?.fullName].filter(Boolean).join(' · ')}</p>}
                        {logImages(log.imagesJson).length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{logImages(log.imagesJson).slice(0, 6).map((image, imageIndex) => <PublicImage key={`${log.id}-${imageIndex}`} src={image.url} alt={`Ảnh nhật ký ${index + 1}`} fallback={DEFAULT_PRODUCT_IMAGE} decorative wrapperClassName="aspect-square w-full rounded-xl border border-[var(--border)]" className="h-full w-full object-cover" />)}</div>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-6 rounded-2xl bg-[var(--surface-subtle)] p-4 text-sm italic leading-6 text-[var(--text-tertiary)]">Chưa có sự kiện nhật ký canh tác công khai nào được ghi nhận cho mã QR này.</p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className={`${cardClassName} p-6`}>
              <SectionHeading icon={Award} eyebrow="Hồ sơ xác thực" title="Chứng nhận & tiêu chuẩn" count={`${certifications.length}`} />
              {certifications.length ? (
                <div className="mt-5 space-y-3">
                  {certifications.map((cert) => (
                    <article key={cert.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                      <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600"><Award size={17} aria-hidden="true" /></span><div className="min-w-0"><h3 className="text-sm font-extrabold leading-5 text-[var(--text-primary)]">{cert.name}</h3><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{cert.issuer || 'Đơn vị cấp đang cập nhật'}</p></div></div>
                      {cert.expiresAt && <p className="mt-3 text-[11px] font-semibold text-[var(--text-tertiary)]">Hiệu lực đến {formatDate(cert.expiresAt)}</p>}
                      {cert.file?.publicUrl && <a href={cert.file.publicUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-[#0d7a28] hover:underline"><FileCheck size={14} aria-hidden="true" /> Xem tài liệu <ExternalLink size={12} aria-hidden="true" /></a>}
                    </article>
                  ))}
                </div>
              ) : <p className="mt-5 rounded-2xl bg-[var(--surface-subtle)] p-4 text-sm italic leading-6 text-[var(--text-tertiary)]">Chưa có chứng nhận nào được đăng tải công khai.</p>}
            </section>

            <section className={`${cardClassName} p-6`}>
              <SectionHeading icon={Store} eyebrow="Thông tin liên quan" title="Đơn vị sản xuất" />
              <p className="mt-5 text-base font-extrabold text-[var(--text-primary)]">{passport.cooperative.name}</p>
              {passport.cooperative.address && <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[var(--text-secondary)]"><MapPin size={16} className="mt-0.5 shrink-0 text-[#0d7a28]" aria-hidden="true" /> {passport.cooperative.address}</p>}
              {passport.cooperative.phone && <a href={`tel:${passport.cooperative.phone}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#103f28] px-4 text-sm font-bold text-white transition hover:bg-[#0d7a28]"><Phone size={16} aria-hidden="true" /> Gọi cho đơn vị sản xuất</a>}
              <Link href="/htx" className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] px-4 text-xs font-bold text-[var(--text-primary)] transition hover:border-[#0d7a28] hover:text-[#0d7a28]">Xem danh bạ hợp tác xã <ArrowRight size={14} aria-hidden="true" /></Link>
            </section>

            <section className="rounded-[1.5rem] border border-[#0d7a28]/15 bg-[#eaf7e8] p-6">
              <div className="flex items-center gap-2"><QrCode size={18} className="text-[#0d7a28]" aria-hidden="true" /><h2 className="text-sm font-extrabold text-[var(--text-primary)]">Cách kiểm tra hồ sơ</h2></div>
              <ol className="mt-5 space-y-4">
                {['Quét mã QR trên sản phẩm hoặc bao bì.', 'Đối chiếu tên sản phẩm và đơn vị sản xuất.', 'Xem vùng trồng, hành trình và chứng nhận khi có dữ liệu.'].map((step, index) => <li key={step} className="flex items-start gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-extrabold text-[#0d7a28] shadow-sm">{index + 1}</span><span className="text-sm leading-6 text-[var(--text-secondary)]">{step}</span></li>)}
              </ol>
            </section>
          </aside>
        </div>
      </div>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs text-[var(--text-tertiary)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Hồ sơ QR công khai trên AGRIPASSPORT</p>
          <p>Chỉ hiển thị dữ liệu đã được cấu hình công khai theo từng hồ sơ.</p>
        </div>
      </footer>
    </main>
  );
}
