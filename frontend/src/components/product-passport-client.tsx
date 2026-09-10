'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCheck,
  FileText,
  MapPin,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Store,
  Tag,
  X
} from 'lucide-react';
import { PublicProduct } from './public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { formatDate } from '@/lib/format';
import { cn } from './ui';

import {
  FARMING_ACTIVITY_MAP,
  translateActivityType,
  sanitizeLogDescription,
  deduplicateCertifications
} from '@/lib/product-passport-utils';

export {
  FARMING_ACTIVITY_MAP,
  translateActivityType,
  sanitizeLogDescription,
  deduplicateCertifications
};

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

function formatPhoneDisplay(phone?: string | null) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function ProductPassportClient({
  product,
  passportTargetUrl,
  qrImageUrl
}: {
  product: PublicProduct;
  passportTargetUrl: string | null;
  qrImageUrl?: string;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'origin' | 'logs' | 'certs' | 'coop'>('overview');
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [certsModalOpen, setCertsModalOpen] = useState(false);
  const [certSearch, setCertSearch] = useState('');
  const [certPage, setCertPage] = useState(1);

  const passport = product.passports?.[0];
  const allCertifications = useMemo(() => product.certifications ?? [], [product.certifications]);
  const uniqueCertifications = useMemo(() => deduplicateCertifications(allCertifications), [allCertifications]);
  const publicLogs = useMemo(() => product.farmingLogs ?? [], [product.farmingLogs]);

  // Display initial 6 certifications
  const initialCertifications = useMemo(() => uniqueCertifications.slice(0, 6), [uniqueCertifications]);

  // Filtered certifications in modal
  const filteredModalCerts = useMemo(() => {
    if (!certSearch.trim()) return uniqueCertifications;
    const query = certSearch.toLowerCase().trim();
    return uniqueCertifications.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.issuer && c.issuer.toLowerCase().includes(query))
    );
  }, [uniqueCertifications, certSearch]);

  const certsPerPage = 8;
  const totalCertPages = Math.ceil(filteredModalCerts.length / certsPerPage) || 1;
  const paginatedCerts = useMemo(() => {
    const start = (certPage - 1) * certsPerPage;
    return filteredModalCerts.slice(start, start + certsPerPage);
  }, [filteredModalCerts, certPage]);

  const displayedLogs = showAllLogs ? publicLogs : publicLogs.slice(0, 5);

  const scrollToSection = (id: string, tab: 'overview' | 'origin' | 'logs' | 'certs' | 'coop') => {
    setActiveTab(tab);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* =========================================================================
          HERO PASSPORT STAGE: 2-COLUMN COMMERCIAL LAYOUT
         ========================================================================= */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xs">
            <div className="relative aspect-[4/3] w-full bg-[var(--surface-muted)]">
              <PublicImage
                src={product.thumbnail?.publicUrl}
                alt={product.name}
                fallback={DEFAULT_PRODUCT_IMAGE}
                priority
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
              />
              {passport && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-[#0d7a28]/30 bg-white/95 px-3 py-1 text-xs font-bold text-[#0d7a28] shadow-sm backdrop-blur">
                  <ShieldCheck size={15} />
                  <span>ĐÃ CẤP QR PASSPORT</span>
                </div>
              )}
            </div>

            {/* Quick Tech Specs Strip below image */}
            <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-t border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs">
              <div className="px-2">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Mã định danh
                </span>
                <span className="mt-0.5 block truncate font-mono font-bold text-[var(--text-primary)]">
                  {product.code}
                </span>
              </div>
              <div className="px-2">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Quy cách đóng gói
                </span>
                <span className="mt-0.5 block font-bold text-[var(--text-primary)]">
                  {product.unit}
                </span>
              </div>
            </div>
          </div>

          {/* If has QR passport, showcase dedicated certificate box */}
          {passport && (
            <div className="rounded-xl border border-[#0d7a28]/30 bg-[#0d7a28]/5 p-4 sm:p-5">
              <div className="flex items-start gap-3.5">
                {qrImageUrl ? (
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#0d7a28]/20 bg-white p-1 shadow-xs">
                    <img src={qrImageUrl} alt={`Mã QR ${passport.passportCode}`} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d7a28] text-white shadow-xs">
                    <QrCode size={22} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d7a28]">
                      Hộ Chiếu Nông Nghiệp
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#0d7a28]/15 px-2 py-0.5 text-[10px] font-bold text-[#0d7a28]">
                      <CheckCircle2 size={11} /> Đã chứng thực
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-sm font-extrabold text-[var(--text-primary)]">
                    Mã hồ sơ: {passport.passportCode}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                    Sản phẩm đã cấp mã định danh số minh bạch nguồn gốc. Đối chiếu dữ liệu thực tế tại vùng canh tác và quy trình kiểm định chất lượng.
                  </p>
                  {passportTargetUrl && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={passportTargetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0d7a28] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#0b6321]"
                      >
                        <QrCode size={14} />
                        <span>Xem chứng thư QR Passport</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Passport Spec & Commercial Overview */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Category & Region */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-primary-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--brand-primary)]">
                <Tag size={12} />
                {product.category?.name ?? 'Nông sản'}
              </span>
              {product.zone?.name && (
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  <MapPin size={12} className="text-[var(--brand-primary)]" />
                  <span>{product.zone.name}</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="type-h1 text-2xl sm:text-3xl lg:text-4xl text-[var(--text-primary)]">
              {product.name}
            </h1>

            {/* Producer / HTX profile box */}
            {product.cooperative && (
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <PublicImage
                    src={product.cooperative.avatarUrl}
                    alt={product.cooperative.name}
                    fallback={DEFAULT_COOPERATIVE_IMAGE}
                    wrapperClassName="h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)]"
                    className="h-full w-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">Đơn vị sản xuất</span>
                      <span className="rounded bg-[#0d7a28]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#0d7a28]">
                        Đã xác thực
                      </span>
                    </div>
                    <Link
                      href={`/htx/${product.cooperative.code}`}
                      className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition truncate block mt-0.5"
                    >
                      {product.cooperative.name}
                    </Link>
                    <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      <span className="truncate">{product.cooperative.province || 'Việt Nam'}</span>
                    </p>
                  </div>
                </div>

                <Link
                  href={`/htx/${product.cooperative.code}`}
                  className="hidden sm:inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--border-strong)] px-3 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition"
                >
                  Xem hồ sơ HTX
                </Link>
              </div>
            )}

            {/* Price Box */}
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-xs">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Giá tham chiếu công khai</span>
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

            {/* Short excerpt description */}
            {product.description && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-3">
            {passportTargetUrl && (
              <a
                href={passportTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0d7a28] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b6321] active:scale-[0.98]"
              >
                <QrCode size={18} />
                <span>Tra cứu QR Passport</span>
              </a>
            )}
            {product.cooperative?.phone && (
              <a
                href={`tel:${product.cooperative.phone.replace(/\s+/g, '')}`}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] shadow-xs"
              >
                <Phone size={17} className="text-[var(--brand-primary)]" />
                <span>Liên hệ ({formatPhoneDisplay(product.cooperative.phone)})</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK FACTS STRIP: 4-6 COMPACT DATA CARDS
         ========================================================================= */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Thông số nhanh">
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">Đơn vị sản xuất</span>
          <span className="text-sm font-bold text-[var(--text-primary)] truncate block mt-1" title={product.cooperative?.name || 'HTX'}>
            {product.cooperative?.name ? product.cooperative.name.replace(/^HTX\s+/i, '') : 'HTX'}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">Vùng canh tác</span>
          <span className="text-sm font-bold text-[var(--text-primary)] truncate block mt-1" title={product.zone?.name || 'Vùng sản xuất'}>
            {product.zone?.name || 'Đã chuẩn hóa'}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">Hồ sơ QR</span>
          <span className="text-sm font-bold text-[#0d7a28] block mt-1">
            {passport ? 'Đã kích hoạt' : 'Đang xử lý'}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">Nhật ký canh tác</span>
          <span className="text-sm font-bold text-[var(--text-primary)] block mt-1">
            {publicLogs.length} sự kiện
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">Chứng nhận</span>
          <span className="text-sm font-bold text-[var(--brand-primary)] block mt-1">
            {allCertifications.length} bản ghi
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">Trạng thái</span>
          <span className="text-sm font-bold text-[#0d7a28] block mt-1">
            Công khai
          </span>
        </div>
      </section>

      {/* =========================================================================
          STICKY SUBNAV / TABS
         ========================================================================= */}
      <nav className="sticky top-[64px] sm:top-[74px] z-30 -mx-4 border-y border-[var(--border)] bg-white/95 px-4 py-2 backdrop-blur-md shadow-xs sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { key: 'overview', label: 'Tổng quan & Mô tả', id: 'section-overview' },
            { key: 'origin', label: 'Vùng trồng & Nguồn gốc', id: 'section-origin' },
            { key: 'logs', label: `Nhật ký canh tác (${publicLogs.length})`, id: 'section-logs' },
            { key: 'certs', label: `Chứng nhận (${uniqueCertifications.length})`, id: 'section-certs' },
            { key: 'coop', label: 'Đơn vị HTX', id: 'section-coop' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => scrollToSection(tab.id, tab.key as any)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition shrink-0',
                activeTab === tab.key
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* =========================================================================
          DETAILED CONTENT SECTIONS
         ========================================================================= */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Overview & Description */}
          <section id="section-overview" className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-4 mb-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                <FileText size={18} />
              </span>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Mô tả sản phẩm & Quy cách
              </h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
              {product.description || 'Hợp tác xã đang cập nhật thông tin giới thiệu chi tiết cho sản phẩm này.'}
            </p>
          </section>

          {/* Section 2: Origin & Zone */}
          <section id="section-origin" className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-4 mb-5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                <MapPin size={18} />
              </span>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Nguồn gốc & Vùng canh tác
              </h2>
            </div>

            {product.zone ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">Khu vực sản xuất</span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{product.zone.name}</h3>
                  </div>
                  {product.zone.areaM2 ? (
                    <span className="rounded-md bg-white border border-[var(--border)] px-2.5 py-1 text-xs font-bold text-[var(--text-primary)]">
                      Diện tích: {Number(product.zone.areaM2).toLocaleString('vi-VN')} m²
                    </span>
                  ) : null}
                </div>
                {product.zone.address && (
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 text-[var(--brand-primary)] shrink-0" />
                    <span>{product.zone.address}</span>
                  </p>
                )}
                <div className="pt-2 text-xs text-[var(--text-tertiary)]">
                  ✓ Dữ liệu tọa độ vùng trồng được định danh và đối chiếu trên hệ thống Agripassport.
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                Thông tin vùng canh tác đang được hoàn thiện đồng bộ từ hồ sơ HTX.
              </p>
            )}
          </section>

          {/* Section 3: Farming Logs (Timeline with Vietnamese Enums) */}
          <section id="section-logs" className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d7a28]/15 text-[#0d7a28]">
                  <Calendar size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Nhật ký Canh tác & Quá trình Sản xuất
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Ghi nhận từ nhật ký điện tử cơ sở của HTX
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                {publicLogs.length} bản ghi
              </span>
            </div>

            {publicLogs.length ? (
              <div className="space-y-6">
                <div className="relative border-l-2 border-[#0d7a28]/25 pl-6 ml-3 space-y-6">
                  {displayedLogs.map((log, index) => (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full bg-[#0d7a28] text-[10px] font-bold text-white shadow-xs">
                        {index + 1}
                      </span>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition hover:border-[#0d7a28]/40 hover:bg-white shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0d7a28]/10 px-2.5 py-0.5 text-xs font-bold text-[#0d7a28]">
                            <CheckCircle2 size={13} />
                            {translateActivityType(log.activityType)}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-tertiary)] flex items-center gap-1">
                            <Calendar size={13} />
                            {formatDate(log.logDate)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {sanitizeLogDescription(log.description)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {publicLogs.length > 5 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllLogs(!showAllLogs)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-white px-5 text-xs font-bold text-[var(--text-primary)] hover:border-[#0d7a28] hover:text-[#0d7a28] transition shadow-xs"
                    >
                      <span>{showAllLogs ? 'Thu gọn nhật ký' : `Xem toàn bộ ${publicLogs.length} nhật ký`}</span>
                      <ChevronDown size={15} className={cn('transition-transform', showAllLogs && 'rotate-180')} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                Chưa có sự kiện nhật ký canh tác nào được đánh dấu công khai cho sản phẩm này.
              </p>
            )}
          </section>

          {/* Section 4: Certifications & Standards (Handles 333 records without DOM freezing) */}
          <section id="section-certs" className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600">
                  <Award size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Chứng nhận & Tiêu chuẩn Chất lượng
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Đã chuẩn hóa và đối chiếu tài liệu thẩm định
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
                  {allCertifications.length} bản ghi
                  {uniqueCertifications.length !== allCertifications.length && (
                    <span className="text-[var(--brand-primary)] ml-1 font-semibold">
                      ({uniqueCertifications.length} tiêu chuẩn)
                    </span>
                  )}
                </span>
                {uniqueCertifications.length > 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCertPage(1);
                      setCertSearch('');
                      setCertsModalOpen(true);
                    }}
                    className="inline-flex h-8 items-center rounded-lg bg-[var(--brand-primary)] px-3 text-xs font-bold text-white shadow-xs transition hover:bg-[var(--brand-primary-hover)]"
                  >
                    Xem tất cả ({allCertifications.length})
                  </button>
                )}
              </div>
            </div>

            {uniqueCertifications.length ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {initialCertifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition hover:border-[var(--brand-primary)]/40 hover:bg-white shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug">
                            {cert.name}
                          </h3>
                          <Award size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">
                          Cơ quan cấp: <strong className="text-[var(--text-primary)]">{cert.issuer || 'Đang cập nhật'}</strong>
                        </p>
                        {cert.expiresAt && (
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                            Hiệu lực đến: {formatDate(cert.expiresAt)}
                          </p>
                        )}
                      </div>

                      {cert.file?.publicUrl && (
                        <div className="mt-3 pt-2.5 border-t border-[var(--border)]">
                          <a
                            href={cert.file.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-primary)] hover:underline"
                          >
                            <FileCheck size={13} />
                            <span>Xem tài liệu chứng nhận</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {uniqueCertifications.length > 6 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCertPage(1);
                        setCertSearch('');
                        setCertsModalOpen(true);
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white px-5 text-xs font-bold text-[var(--brand-primary)] hover:border-[var(--brand-primary)] shadow-xs transition"
                    >
                      <Award size={15} />
                      <span>Xem đầy đủ danh sách {allCertifications.length} chứng nhận & văn bản</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                Chưa có tài liệu chứng nhận nào được đăng tải công khai cho sản phẩm này.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar Column (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Section 5: Cooperative Info Card */}
          {product.cooperative && (
            <div id="section-coop" className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-4">
                <Store size={18} className="text-[var(--brand-primary)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Đơn vị sản xuất & Chủ quản
                </h3>
              </div>

              <div className="text-center pb-4 border-b border-[var(--border)]">
                <PublicImage
                  src={product.cooperative.avatarUrl}
                  alt={product.cooperative.name}
                  fallback={DEFAULT_COOPERATIVE_IMAGE}
                  wrapperClassName="h-16 w-16 mx-auto rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] mb-3"
                  className="h-full w-full object-cover"
                />
                <h4 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                  {product.cooperative.name}
                </h4>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {product.cooperative.province || 'Việt Nam'}
                </p>
              </div>

              <div className="py-4 space-y-3 text-xs">
                {product.cooperative.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-tertiary)]">Hotline:</span>
                    <a
                      href={`tel:${product.cooperative.phone.replace(/\s+/g, '')}`}
                      className="font-bold text-[var(--brand-primary)] hover:underline"
                    >
                      {formatPhoneDisplay(product.cooperative.phone)}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-tertiary)]">Trạng thái hồ sơ:</span>
                  <span className="font-bold text-[#0d7a28]">Đã xác thực</span>
                </div>
              </div>

              <Link
                href={`/htx/${product.cooperative.code}`}
                className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition shadow-xs"
              >
                <span>Xem hồ sơ năng lực HTX</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          )}

          {/* Trust Commitment Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-[#0d7a28]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Cam kết Dữ liệu Thật</h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Dữ liệu trên trang được đồng bộ trực tiếp từ hồ sơ cơ sở của Hợp tác xã, mã định danh cây/lô canh tác và chứng thư Hộ Chiếu Nông Nghiệp theo chuẩn truy xuất số.
            </p>
          </div>
        </aside>
      </div>

      {/* =========================================================================
          FULL CERTIFICATIONS MODAL (Handles massive 333 certificates smoothly)
         ========================================================================= */}
      {certsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Tất cả chứng nhận"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setCertsModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col max-h-[90vh] w-full max-w-3xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Danh mục Chứng nhận & Tiêu chuẩn ({allCertifications.length} bản ghi)
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Đã loại trùng lặp: hiển thị {filteredModalCerts.length} tiêu chuẩn phù hợp
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCertsModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search Filter */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-muted)]">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={certSearch}
                  onChange={(e) => {
                    setCertSearch(e.target.value);
                    setCertPage(1);
                  }}
                  placeholder="Tìm kiếm chứng nhận, cơ quan cấp..."
                  className="h-10 w-full rounded-xl border border-[var(--border-strong)] bg-white pl-10 pr-4 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Body: Scrollable Cert Cards */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {paginatedCerts.length ? (
                paginatedCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition hover:bg-white"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-amber-500 shrink-0" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{cert.name}</h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Cơ quan cấp: <strong className="text-[var(--text-primary)]">{cert.issuer || 'Đang cập nhật'}</strong>
                      </p>
                      {cert.expiresAt && (
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          Hiệu lực đến: {formatDate(cert.expiresAt)}
                        </p>
                      )}
                    </div>

                    {cert.file?.publicUrl ? (
                      <a
                        href={cert.file.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-3.5 text-xs font-bold text-white transition hover:bg-[var(--brand-primary-hover)] shadow-xs"
                      >
                        <FileCheck size={13} />
                        <span>Xem văn bản</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-[var(--text-tertiary)] italic">Đang cập nhật file</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
                  Không tìm thấy chứng nhận nào phù hợp với từ khóa &ldquo;{certSearch}&rdquo;
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination */}
            <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-3 bg-[var(--surface-muted)]">
              <span className="text-xs text-[var(--text-tertiary)]">
                Trang {certPage} / {totalCertPages} ({filteredModalCerts.length} bản ghi)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={certPage <= 1}
                  onClick={() => setCertPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-8 items-center rounded-lg border border-[var(--border-strong)] bg-white px-3 text-xs font-bold text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={certPage >= totalCertPages}
                  onClick={() => setCertPage((p) => Math.min(totalCertPages, p + 1))}
                  className="inline-flex h-8 items-center rounded-lg border border-[var(--border-strong)] bg-white px-3 text-xs font-bold text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE STICKY ACTION BAR
         ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-white/95 p-3 pb-[calc(0.75rem+var(--safe-bottom))] shadow-lg backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          {passportTargetUrl && (
            <a
              href={passportTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0d7a28] px-4 text-xs font-bold text-white shadow-xs"
            >
              <QrCode size={16} />
              <span>Tra cứu QR Passport</span>
            </a>
          )}
          {product.cooperative?.phone && (
            <a
              href={`tel:${product.cooperative.phone.replace(/\s+/g, '')}`}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-white px-4 text-xs font-bold text-[var(--text-primary)] shadow-xs"
            >
              <Phone size={15} className="text-[var(--brand-primary)]" />
              <span>Gọi HTX</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
