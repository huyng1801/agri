'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCheck,
  FileText,
  MapPin,
  Phone,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Store,
  Tag,
  X
} from 'lucide-react';
import { PublicProduct } from './public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { formatDate } from '@/lib/format';
import { MobileBottomSheet } from './mobile-bottom-sheet';
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
  const [allLogsSheetOpen, setAllLogsSheetOpen] = useState(false);
  const [certsSheetOpen, setCertsSheetOpen] = useState(false);
  const [certSearch, setCertSearch] = useState('');
  const [certPage, setCertPage] = useState(1);
  const [showStickyBottom, setShowStickyBottom] = useState(false);

  const heroCtaRef = useRef<HTMLDivElement>(null);
  const logsSheetTriggerRef = useRef<HTMLButtonElement>(null);
  const certsSheetTriggerRef = useRef<HTMLButtonElement>(null);

  const passport = product.passports?.[0];
  const allCertifications = useMemo(() => product.certifications ?? [], [product.certifications]);
  const uniqueCertifications = useMemo(() => deduplicateCertifications(allCertifications), [allCertifications]);
  const publicLogs = useMemo(() => product.farmingLogs ?? [], [product.farmingLogs]);

  // Display initial 6 certifications
  const initialCertifications = useMemo(() => uniqueCertifications.slice(0, 6), [uniqueCertifications]);

  // Filtered certifications in sheet
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

  // Preview 5 logs initial (Section 29)
  const previewLogs = useMemo(() => publicLogs.slice(0, 5), [publicLogs]);

  // Observer for sticky bottom action bar (Section 31)
  useEffect(() => {
    const heroCtaEl = heroCtaRef.current;
    if (!heroCtaEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When hero CTA is scrolled out of view, show sticky bottom action
        setShowStickyBottom(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(heroCtaEl);
    return () => observer.disconnect();
  }, []);

  // Scroll spy for sticky section navigation (Section 27)
  useEffect(() => {
    const sectionIds: Array<{ id: string; key: typeof activeTab }> = [
      { id: 'section-overview', key: 'overview' },
      { id: 'section-origin', key: 'origin' },
      { id: 'section-logs', key: 'logs' },
      { id: 'section-certs', key: 'certs' },
      { id: 'section-coop', key: 'coop' }
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(sectionIds[i].key);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, tab: 'overview' | 'origin' | 'logs' | 'certs' | 'coop') => {
    setActiveTab(tab);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Tra cứu nguồn gốc nông sản ${product.name} trên Hộ Chiếu Nông Nghiệp`,
          url: window.location.href
        });
      } catch {
        // User cancelled or share failed
      }
    } else if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết hồ sơ sản phẩm vào bộ nhớ tạm');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12 pb-24 lg:pb-8">
      {/* =========================================================================
          CONTEXTUAL MOBILE TOP BAR (Section 24)
         ========================================================================= */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 lg:hidden">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer.includes(window.location.host)) {
              window.history.back();
            } else {
              window.location.href = '/san-pham';
            }
          }}
          aria-label="Quay lại danh mục sản phẩm"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-xs active:scale-95 transition touch-action-manipulation"
        >
          <ChevronLeft size={16} />
          <span>Danh mục</span>
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Hộ Chiếu Nông Sản
        </span>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Chia sẻ hồ sơ sản phẩm"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs active:scale-95 transition touch-action-manipulation"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* =========================================================================
          HERO PASSPORT STAGE: MOBILE-FIRST COMPOSITION (Section 25)
         ========================================================================= */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="relative aspect-[4/3] w-full bg-slate-100">
              <PublicImage
                src={product.thumbnail?.publicUrl}
                alt={product.name}
                fallback={DEFAULT_PRODUCT_IMAGE}
                priority
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
              />
              {passport && (
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-[#0d7a28]/30 bg-white/95 px-2.5 py-1 text-xs font-bold text-[#0d7a28] shadow-xs backdrop-blur">
                  <ShieldCheck size={15} />
                  <span>ĐÃ CẤP QR PASSPORT</span>
                </div>
              )}
            </div>

            {/* Quick Tech Specs Strip below image */}
            <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/70 p-2.5 text-xs">
              <div className="px-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Mã định danh
                </span>
                <span className="mt-0.5 block truncate font-mono font-bold text-slate-800">
                  {product.code}
                </span>
              </div>
              <div className="px-2">
                <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Quy cách đóng gói
                </span>
                <span className="mt-0.5 block font-bold text-slate-800">
                  {product.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated Certificate Card if has QR */}
          {passport && (
            <div className="rounded-xl border border-[#0d7a28]/30 bg-[#0d7a28]/06 p-3.5 sm:p-4">
              <div className="flex items-start gap-3">
                {qrImageUrl ? (
                  <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-[#0d7a28]/20 bg-white p-1 shadow-xs">
                    <img src={qrImageUrl} alt={`Mã QR ${passport.passportCode}`} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d7a28] text-white shadow-xs">
                    <QrCode size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d7a28]">
                      Hộ Chiếu Nông Nghiệp
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#0d7a28]/15 px-2 py-0.2 text-[9px] font-bold text-[#0d7a28]">
                      <CheckCircle2 size={10} /> Đã chứng thực
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    Mã hồ sơ: {passport.passportCode}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                    Đối chiếu dữ liệu vùng trồng và nhật ký canh tác điện tử của HTX.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Spec & Commercial Details */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-5">
          <div className="space-y-3.5 sm:space-y-4">
            {/* Category & Region */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#0d7a28]/10 px-2.5 py-1 text-xs font-bold text-[#0d7a28]">
                <Tag size={12} />
                {product.category?.name ?? 'Nông sản'}
              </span>
              {product.zone?.name && (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <MapPin size={12} className="text-[#0d7a28]" />
                  <span>{product.zone.name}</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#131935] tracking-tight leading-tight [text-wrap:balance]">
              {product.name}
            </h1>

            {/* Producer / HTX profile box */}
            {product.cooperative && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <PublicImage
                    src={product.cooperative.avatarUrl}
                    alt={product.cooperative.name}
                    fallback={DEFAULT_COOPERATIVE_IMAGE}
                    wrapperClassName="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    className="h-full w-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d7a28]">Đơn vị sản xuất</span>
                      <span className="rounded bg-[#0d7a28]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#0d7a28]">
                        Đã xác thực
                      </span>
                    </div>
                    <Link
                      href={`/htx/${product.cooperative.code}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#0d7a28] transition truncate block mt-0.5"
                    >
                      {product.cooperative.name}
                    </Link>
                    <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} />
                      <span className="truncate">{product.cooperative.province || 'Việt Nam'}</span>
                    </p>
                  </div>
                </div>

                <Link
                  href={`/htx/${product.cooperative.code}`}
                  className="hidden sm:inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-800 hover:border-[#0d7a28] hover:text-[#0d7a28] transition"
                >
                  Xem HTX
                </Link>
              </div>
            )}

            {/* Price Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Giá niêm yết tham chiếu</span>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#131935]">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500">/{product.unit}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#0d7a28] bg-[#0d7a28]/10 px-2.5 py-1 rounded-md">
                  Giá từ HTX
                </span>
              </div>
            </div>

            {/* Short excerpt description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Primary Action Buttons (Observed by heroCtaRef for sticky bottom bar) */}
          <div ref={heroCtaRef} className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
            {passportTargetUrl && (
              <a
                href={passportTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0d7a28] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a6120] active:scale-[0.98] touch-action-manipulation"
              >
                <QrCode size={18} />
                <span>Tra cứu QR Passport</span>
              </a>
            )}
            {product.cooperative?.phone && (
              <a
                href={`tel:${product.cooperative.phone.replace(/\s+/g, '')}`}
                className="inline-flex min-h-12 sm:flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 text-sm font-bold text-slate-800 transition hover:border-[#0d7a28] shadow-xs active:scale-[0.98] touch-action-manipulation"
              >
                <Phone size={17} className="text-[#0d7a28]" />
                <span className="hidden sm:inline">Liên hệ ({formatPhoneDisplay(product.cooperative.phone)})</span>
                <span className="sm:hidden">Gọi HTX</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK FACTS: COMPACT 2x2 GRID ON MOBILE (Section 26)
         ========================================================================= */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Thông số nhanh">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Vùng canh tác</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block mt-0.5" title={product.zone?.name || 'Đã chuẩn hóa'}>
            {product.zone?.name || 'Đã chuẩn hóa'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Hồ sơ QR</span>
          <span className="text-xs sm:text-sm font-bold text-[#0d7a28] block mt-0.5">
            {passport ? 'Đã kích hoạt' : 'Đang xử lý'}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nhật ký canh tác</span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-0.5">
            {publicLogs.length} sự kiện
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Chứng nhận</span>
          <span className="text-xs sm:text-sm font-bold text-[#106f8a] block mt-0.5">
            {uniqueCertifications.length} tiêu chuẩn
          </span>
        </div>
      </section>

      {/* =========================================================================
          STICKY SUBNAV / TABS (Section 27: One row, short mobile labels)
         ========================================================================= */}
      <nav
        aria-label="Điều hướng nhanh hồ sơ"
        data-testid="passport-subnav"
        className="sticky top-[56px] sm:top-[64px] z-30 -mx-4 border-y border-slate-200 bg-white/95 px-4 py-2 backdrop-blur-md shadow-xs sm:mx-0 sm:rounded-xl sm:border"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { key: 'overview', label: 'Tổng quan', id: 'section-overview' },
            { key: 'origin', label: 'Nguồn gốc', id: 'section-origin' },
            { key: 'logs', label: `Nhật ký (${publicLogs.length})`, id: 'section-logs' },
            { key: 'certs', label: `Chứng nhận (${uniqueCertifications.length})`, id: 'section-certs' },
            { key: 'coop', label: 'Đơn vị HTX', id: 'section-coop' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => scrollToSection(tab.id, tab.key as any)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition shrink-0 active:scale-95 touch-action-manipulation',
                activeTab === tab.key
                  ? 'bg-[#0d7a28] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* =========================================================================
          DETAILED CONTENT SECTIONS (Section 28: Keep long document structure)
         ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Section 1: Overview & Description */}
          <section id="section-overview" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d7a28]/10 text-[#0d7a28]">
                <FileText size={18} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#131935]">
                Mô tả sản phẩm & Quy cách
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-line">
              {product.description || 'Hợp tác xã đang cập nhật thông tin giới thiệu chi tiết cho sản phẩm này.'}
            </p>
          </section>

          {/* Section 2: Origin & Zone */}
          <section id="section-origin" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d7a28]/10 text-[#0d7a28]">
                <MapPin size={18} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#131935]">
                Nguồn gốc & Vùng canh tác
              </h2>
            </div>

            {product.zone ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d7a28]">Khu vực sản xuất</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{product.zone.name}</h3>
                  </div>
                  {product.zone.areaM2 ? (
                    <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                      Diện tích: {Number(product.zone.areaM2).toLocaleString('vi-VN')} m²
                    </span>
                  ) : null}
                </div>
                {product.zone.address && (
                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin size={14} className="mt-0.5 text-[#0d7a28] shrink-0" />
                    <span>{product.zone.address}</span>
                  </p>
                )}
                <div className="pt-1 text-[11px] text-slate-400">
                  ✓ Dữ liệu tọa độ vùng trồng được định danh và đối chiếu trên hệ thống Hộ Chiếu Nông Nghiệp.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Thông tin vùng canh tác đang được hoàn thiện đồng bộ từ hồ sơ HTX.
              </p>
            )}
          </section>

          {/* Section 3: Farming Logs Timeline (Section 29: No numbers 1,2,3; preview 5 + sheet for all) */}
          <section id="section-logs" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d7a28]/10 text-[#0d7a28]">
                  <Calendar size={18} />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#131935]">
                    Nhật ký Canh tác & Quá trình Sản xuất
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Ghi nhận từ nhật ký điện tử cơ sở của HTX
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {publicLogs.length} bản ghi
              </span>
            </div>

            {publicLogs.length ? (
              <div className="space-y-4">
                <div className="relative border-l-2 border-[#0d7a28]/25 pl-4 sm:pl-6 ml-2 sm:ml-3 space-y-4">
                  {previewLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Subdued Timeline marker dot (no arbitrary numbers) */}
                      <span className="absolute -left-[23px] sm:-left-[31px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-[#0d7a28] ring-4 ring-white shadow-xs" />

                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-3.5 transition hover:bg-white shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#0d7a28]/10 px-2 py-0.5 text-xs font-bold text-[#0d7a28]">
                            <CheckCircle2 size={12} />
                            {translateActivityType(log.activityType)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(log.logDate)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {sanitizeLogDescription(log.description)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {publicLogs.length > 5 && (
                  <div className="pt-2 text-center">
                    <button
                      ref={logsSheetTriggerRef}
                      type="button"
                      onClick={() => setAllLogsSheetOpen(true)}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-800 hover:border-[#0d7a28] hover:text-[#0d7a28] transition shadow-xs active:scale-95 touch-action-manipulation"
                    >
                      <span>Xem toàn bộ {publicLogs.length} nhật ký canh tác</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Chưa có sự kiện nhật ký canh tác nào được đánh dấu công khai cho sản phẩm này.
              </p>
            )}
          </section>

          {/* Section 4: Certifications & Standards (Section 30) */}
          <section id="section-certs" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600">
                  <Award size={18} />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#131935]">
                    Chứng nhận & Tiêu chuẩn Chất lượng
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Đã chuẩn hóa và đối chiếu tài liệu thẩm định
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {uniqueCertifications.length} tiêu chuẩn
              </span>
            </div>

            {initialCertifications.length ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {initialCertifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:bg-white shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Award size={15} className="text-amber-500 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{cert.name}</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          Cơ quan cấp: <strong className="text-slate-700">{cert.issuer || 'Đang cập nhật'}</strong>
                        </p>
                        {cert.expiresAt && (
                          <p className="text-[10px] text-slate-400">
                            Hiệu lực: {formatDate(cert.expiresAt)}
                          </p>
                        )}
                      </div>

                      {cert.file?.publicUrl && (
                        <div className="pt-2 mt-2 border-t border-slate-100">
                          <a
                            href={cert.file.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 text-[11px] font-bold text-slate-700 hover:bg-[#0d7a28] hover:text-white transition"
                          >
                            <FileCheck size={12} />
                            <span>Xem tài liệu thẩm định</span>
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
                      ref={certsSheetTriggerRef}
                      type="button"
                      onClick={() => setCertsSheetOpen(true)}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-800 hover:border-[#0d7a28] hover:text-[#0d7a28] transition shadow-xs active:scale-95 touch-action-manipulation"
                    >
                      <span>Xem toàn bộ {uniqueCertifications.length} chứng nhận</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Sản phẩm đang trong quá trình cập nhật tài liệu chứng nhận từ cơ sở HTX.
              </p>
            )}
          </section>

          {/* Section 5: HTX Producer Info */}
          <section id="section-coop" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0d7a28]/10 text-[#0d7a28]">
                <Store size={18} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#131935]">
                Hồ sơ Hợp tác xã Sản xuất
              </h2>
            </div>

            {product.cooperative ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <PublicImage
                    src={product.cooperative.avatarUrl}
                    alt={product.cooperative.name}
                    fallback={DEFAULT_COOPERATIVE_IMAGE}
                    wrapperClassName="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"
                    className="h-full w-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {product.cooperative.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-[#0d7a28] shrink-0" />
                      <span>{product.cooperative.province || 'Việt Nam'}</span>
                    </p>
                    {product.cooperative.phone && (
                      <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                        <Phone size={12} className="text-[#0d7a28] shrink-0" />
                        <a href={`tel:${product.cooperative.phone}`} className="hover:underline text-slate-800 font-semibold">
                          {formatPhoneDisplay(product.cooperative.phone)}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/htx/${product.cooperative.code}`}
                    className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-800 shadow-xs hover:border-[#0d7a28] hover:text-[#0d7a28] transition active:scale-95 touch-action-manipulation"
                  >
                    <span>Xem đầy đủ hồ sơ & các sản phẩm khác của HTX</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Thông tin Hợp tác xã quản trị đang được hoàn tất.
              </p>
            )}
          </section>
        </div>

        {/* Right: Technical Verification Card (Desktop Sidebar) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Cơ chế Xác thực Nguồn gốc
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#0d7a28] mt-0.5 shrink-0" />
                <span>Mã QR độc bản gắn liền với từng lô sản phẩm</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#0d7a28] mt-0.5 shrink-0" />
                <span>Nhật ký canh tác ghi nhận trực tiếp từ nông hộ</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[#0d7a28] mt-0.5 shrink-0" />
                <span>Chứng thư điện tử có thể tra cứu và chia sẻ công khai</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* =========================================================================
          ALL LOGS BOTTOM SHEET (Section 29)
         ========================================================================= */}
      <MobileBottomSheet
        isOpen={allLogsSheetOpen}
        onClose={() => setAllLogsSheetOpen(false)}
        title={`Toàn bộ Nhật ký Canh tác (${publicLogs.length} sự kiện)`}
        description={`Sản phẩm ${product.name} - Đồng bộ từ cơ sở dữ liệu HTX`}
        triggerRef={logsSheetTriggerRef}
      >
        <div className="relative border-l-2 border-[#0d7a28]/25 pl-4 sm:pl-6 ml-2 space-y-4 py-2">
          {publicLogs.map((log) => (
            <div key={log.id} className="relative">
              <span className="absolute -left-[23px] sm:-left-[31px] top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-[#0d7a28] ring-4 ring-white shadow-xs" />
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#0d7a28]/10 px-2 py-0.5 text-xs font-bold text-[#0d7a28]">
                    <CheckCircle2 size={12} />
                    {translateActivityType(log.activityType)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {formatDate(log.logDate)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {sanitizeLogDescription(log.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileBottomSheet>

      {/* =========================================================================
          FULL CERTIFICATIONS BOTTOM SHEET (Section 30)
         ========================================================================= */}
      <MobileBottomSheet
        isOpen={certsSheetOpen}
        onClose={() => setCertsSheetOpen(false)}
        title={`Danh mục Chứng nhận & Tiêu chuẩn (${allCertifications.length} bản ghi)`}
        description={`Đã khử trùng lặp: ${uniqueCertifications.length} tiêu chuẩn hợp lệ`}
        triggerRef={certsSheetTriggerRef}
      >
        <div className="space-y-3.5">
          {/* Search inside sheet */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={certSearch}
              onChange={(e) => {
                setCertSearch(e.target.value);
                setCertPage(1);
              }}
              placeholder="Tìm theo tên chứng nhận, cơ quan cấp..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-base font-medium text-slate-900 outline-none focus:border-[#0d7a28] focus:bg-white placeholder:text-sm"
            />
          </div>

          {/* Cert list */}
          <div className="space-y-2.5">
            {paginatedCerts.length ? (
              paginatedCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <Award size={15} className="text-amber-500 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cert.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Cơ quan cấp: <strong className="text-slate-800">{cert.issuer || 'Đang cập nhật'}</strong>
                  </p>
                  {cert.expiresAt && (
                    <p className="text-[11px] text-slate-400">
                      Hiệu lực: {formatDate(cert.expiresAt)}
                    </p>
                  )}
                  {cert.file?.publicUrl && (
                    <div className="pt-2 mt-1 border-t border-slate-100">
                      <a
                        href={cert.file.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#0d7a28] px-3 text-xs font-bold text-white shadow-xs"
                      >
                        <FileCheck size={12} />
                        <span>Xem văn bản thẩm định</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Không tìm thấy chứng nhận phù hợp
              </div>
            )}
          </div>

          {/* Sheet Pagination */}
          {totalCertPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">
                Trang {certPage} / {totalCertPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={certPage <= 1}
                  onClick={() => setCertPage((p) => Math.max(1, p - 1))}
                  className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 disabled:opacity-30"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={certPage >= totalCertPages}
                  onClick={() => setCertPage((p) => Math.min(totalCertPages, p + 1))}
                  className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 disabled:opacity-30"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </MobileBottomSheet>

      {/* =========================================================================
          CONTEXTUAL STICKY BOTTOM ACTION BAR (Section 31)
          Appears when user scrolls past Hero CTA; replaces global bottom nav
         ========================================================================= */}
      {showStickyBottom && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden animate-in slide-in-from-bottom duration-200"
          style={{ paddingBottom: 'max(0.75rem, var(--safe-bottom, 0px))' }}
        >
          <div className="flex items-center gap-2 max-w-md mx-auto">
            {passportTargetUrl ? (
              <a
                href={passportTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0d7a28] px-4 text-xs font-bold text-white shadow-sm active:scale-98 touch-action-manipulation"
              >
                <QrCode size={16} />
                <span>Xem QR Passport</span>
              </a>
            ) : null}
            {product.cooperative?.phone && (
              <a
                href={`tel:${product.cooperative.phone.replace(/\s+/g, '')}`}
                className="flex h-12 px-4 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold shadow-xs active:scale-95 touch-action-manipulation"
                aria-label="Gọi điện cho HTX"
              >
                <Phone size={15} className="text-[#0d7a28]" />
                <span>Gọi HTX</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
