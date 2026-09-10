'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sprout
} from 'lucide-react';
import { PublicImage } from './public-image';
import { cn } from './ui';

export interface HeroSlide {
  id: string;
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  secondaryCta: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  image: string;
  imageAlt: string;
  badgeTitle: string;
  badgeSubtitle: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'Định danh & Truy xuất Nguồn gốc Số',
    eyebrowIcon: QrCode,
    title: 'Quét QR tra cứu nguồn gốc nông sản',
    titleHighlight: 'Minh bạch từng công đoạn',
    description:
      'Chỉ với một thao tác quét QR trên điện thoại, người tiêu dùng và đối tác thương mại dễ dàng đối chiếu vùng trồng, lịch sử chăm bón, thu hoạch và chứng nhận chất lượng.',
    primaryCta: {
      label: 'Tra cứu Nông sản có QR',
      href: '/san-pham?hasQr=true',
      icon: QrCode
    },
    secondaryCta: {
      label: 'Khám phá Nông sản',
      href: '/san-pham',
      icon: ArrowRight
    },
    image: '/news/field-qr.webp',
    imageAlt: 'Quét mã QR tra cứu hồ sơ nông sản trên thiết bị di động',
    badgeTitle: '100% Minh bạch',
    badgeSubtitle: 'Đối chiếu dữ liệu thực tế từ HTX'
  },
  {
    id: 'slide-2',
    eyebrow: 'Giải pháp Số hóa Hợp tác xã',
    eyebrowIcon: Sprout,
    title: 'Từ cánh đồng & Hợp tác xã đến',
    titleHighlight: 'Hộ Chiếu Nông Nghiệp Số',
    description:
      'Chuẩn hóa toàn diện dữ liệu vùng canh tác, sổ nhật ký nông hộ theo tiêu chuẩn VietGAP, GlobalGAP và OCOP thành hồ sơ điện tử có giá trị pháp lý và thương mại.',
    primaryCta: {
      label: 'Dành cho Hợp tác xã',
      href: '/lien-he',
      icon: Sprout
    },
    secondaryCta: {
      label: 'Tìm hiểu Quy trình',
      href: '/gioi-thieu',
      icon: ArrowRight
    },
    image: '/hero/htx-farmer-hero-v2.png',
    imageAlt: 'Nông dân thành viên hợp tác xã chuẩn bị nông sản đạt tiêu chuẩn minh bạch',
    badgeTitle: 'Đồng hành cùng HTX',
    badgeSubtitle: 'Tự động hóa số hóa hồ sơ canh tác'
  },
  {
    id: 'slide-3',
    eyebrow: 'Kết nối Thị trường & Xuất khẩu',
    eyebrowIcon: ShieldCheck,
    title: 'Nông sản đạt chuẩn chất lượng,',
    titleHighlight: 'Vững bước vào chuỗi cung ứng',
    description:
      'Chứng thư số Hộ Chiếu Nông Nghiệp giúp nâng tầm uy tín nông sản Việt, đáp ứng tiêu chuẩn khắt khe của hệ thống siêu thị, sàn phân phối lớn và đối tác xuất khẩu.',
    primaryCta: {
      label: 'Xem Nông sản đạt chuẩn',
      href: '/san-pham?hasQr=true',
      icon: ShieldCheck
    },
    secondaryCta: {
      label: 'Liên hệ Hợp tác',
      href: '/lien-he',
      icon: ArrowRight
    },
    image: '/news/produce-label.webp',
    imageAlt: 'Nông sản đóng gói đạt chuẩn xuất khẩu có tem Hộ Chiếu Nông Nghiệp',
    badgeTitle: 'Tiêu chuẩn xuất khẩu',
    badgeSubtitle: 'Bảo chứng nguồn gốc minh bạch'
  }
];

export function HomeHeroSlider({
  slides = DEFAULT_SLIDES,
  autoplayInterval = 7000
}: {
  slides?: HeroSlide[];
  autoplayInterval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoplayInterval]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-[radial-gradient(ellipse_60%_50%_at_80%_35%,rgba(13,122,40,0.06),transparent_70%),linear-gradient(180deg,#f5faf4_0%,#ffffff_100%)] border-b border-slate-200/80 touch-action-manipulation"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Khám phá Hộ Chiếu Nông Nghiệp"
    >
      <div className="mx-auto w-full max-w-[var(--container-max,1280px)] px-4 sm:px-6 lg:px-8 pt-5 pb-6 sm:pt-7 sm:pb-8 lg:pt-8 lg:pb-9">
        {/* =========================================================================
            DESKTOP LAYOUT (lg:block) — Pixel-perfect from Round 3
           ========================================================================= */}
        <div className="hidden lg:block">
          <div className="relative min-h-[410px]">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              const EyebrowIcon = slide.eyebrowIcon;
              const PrimaryIcon = slide.primaryCta.icon;

              return (
                <div
                  key={`desk-${slide.id}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} trên ${slides.length}: ${slide.title}`}
                  className={cn(
                    'transition-[opacity,transform,visibility] duration-500 ease-out',
                    isActive
                      ? 'opacity-100 translate-x-0 relative z-10 visible'
                      : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-3 invisible'
                  )}
                  aria-hidden={!isActive}
                >
                  <div className="grid grid-cols-12 gap-10 xl:gap-12 items-center">
                    {/* Left Column: Content (7 cols) */}
                    <div className="col-span-7 flex flex-col justify-center space-y-4">
                      {/* Eyebrow Label */}
                      <div>
                        <div className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/06 px-3.5 text-xs font-semibold text-[#0d7a28]">
                          <EyebrowIcon size={14} className="shrink-0 text-[#0d7a28]" />
                          <span>{slide.eyebrow}</span>
                        </div>
                      </div>

                      {/* Headline Hierarchy: Dominant Main H1 + Lighter Accent */}
                      <h1 className="text-[#131935] font-extrabold tracking-tight [text-wrap:balance]">
                        <span className="block text-3xl lg:text-[40px] xl:text-[46px] 2xl:text-[50px] font-extrabold leading-[1.14]">
                          {slide.title}
                        </span>
                        <span className="block mt-1 sm:mt-1.5 text-2xl lg:text-[32px] xl:text-[36px] 2xl:text-[40px] font-bold leading-[1.2] bg-gradient-to-r from-[#0d7a28] via-[#0d7a28] to-[#106f8a] bg-clip-text text-transparent">
                          {slide.titleHighlight}
                        </span>
                      </h1>

                      {/* Description: High-density, 2-3 lines desktop */}
                      <p className="text-[16px] lg:text-[17px] xl:text-[18px] text-slate-600 leading-[1.65] max-w-[620px]">
                        {slide.description}
                      </p>

                      {/* CTA Hierarchy: Solid Primary + Refined Secondary */}
                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <Link
                          href={slide.primaryCta.href}
                          className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[#0d7a28] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a6120] hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28] focus-visible:ring-offset-2"
                        >
                          {PrimaryIcon && <PrimaryIcon size={17} />}
                          <span>{slide.primaryCta.label}</span>
                        </Link>

                        <Link
                          href={slide.secondaryCta.href}
                          className="group inline-flex h-[52px] items-center justify-center gap-2 px-3 text-sm font-semibold text-[#131935] transition hover:text-[#0d7a28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
                        >
                          <span>{slide.secondaryCta.label}</span>
                          <ArrowRight size={16} className="text-[#0d7a28] transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column: Hero Media (5 cols) */}
                    <div className="col-span-5">
                      <div className="relative mx-auto w-full">
                        {/* Subtle Ambient Glow behind Image */}
                        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#0d7a28]/10 via-[#106f8a]/08 to-transparent blur-2xl -z-10 pointer-events-none" />

                        {/* Image Card Frame: 6px padding, 22px outer radius, diffuse shadow */}
                        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-[6px] shadow-[0_16px_40px_-16px_rgba(16,24,40,0.12)]">
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-slate-100">
                            <PublicImage
                              src={slide.image}
                              alt={slide.imageAlt}
                              fallback="/news/field-qr.webp"
                              priority={index === 0}
                              wrapperClassName="h-full w-full"
                              className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Controls Cluster: Positioned under image, aligned right */}
          <div className="mt-3.5 grid grid-cols-12 gap-10 xl:gap-12">
            <div className="col-span-7" />

            <div className="col-span-5 flex items-center justify-end gap-3.5 w-full">
              {/* Progress Bars (No visible numbers) */}
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Chọn slide giới thiệu"
              >
                {slides.map((slide, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={`desk-ctrl-${slide.id}`}
                      role="tab"
                      onClick={() => goToSlide(index)}
                      aria-selected={isActive}
                      aria-label={`Chuyển đến slide ${index + 1}`}
                      className={cn(
                        'group relative h-[18px] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28] rounded-full',
                        isActive ? 'w-[44px]' : 'w-[26px]'
                      )}
                    >
                      <span
                        className={cn(
                          'h-[3px] w-full rounded-full transition-all overflow-hidden block',
                          isActive ? 'bg-[#0d7a28]/20' : 'bg-slate-300 group-hover:bg-slate-400'
                        )}
                      >
                        {isActive && (
                          <span
                            key={`prog-${currentIndex}`}
                            className="block h-full w-full bg-[#0d7a28] rounded-full origin-left motion-reduce:transform-none motion-reduce:!animation-none"
                            style={{
                              animationName: 'heroProgress',
                              animationDuration: `${autoplayInterval}ms`,
                              animationTimingFunction: 'linear',
                              animationFillMode: 'forwards',
                              animationPlayState: isPaused ? 'paused' : 'running'
                            }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Compact Arrow Buttons (42x42px, 12px radius) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevSlide}
                  className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition hover:border-[#0d7a28]/40 hover:text-[#0d7a28] hover:bg-[#0d7a28]/04 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
                  aria-label="Slide trước đó"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextSlide}
                  className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition hover:border-[#0d7a28]/40 hover:text-[#0d7a28] hover:bg-[#0d7a28]/04 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
                  aria-label="Slide tiếp theo"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MOBILE LAYOUT (< lg): Media First -> Progress -> Content -> CTA
           ========================================================================= */}
        <div className="lg:hidden">
          {/* 1. Media Stage */}
          <div className="relative">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={`mob-media-${slide.id}`}
                  className={cn(
                    'transition-[opacity,transform,visibility] duration-500 ease-out',
                    isActive
                      ? 'opacity-100 relative z-10 visible'
                      : 'opacity-0 absolute inset-0 pointer-events-none invisible'
                  )}
                  aria-hidden={!isActive}
                >
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                    <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 max-h-[250px]">
                      <PublicImage
                        src={slide.image}
                        alt={slide.imageAlt}
                        fallback="/news/field-qr.webp"
                        priority={index === 0}
                        wrapperClassName="h-full w-full"
                        className="h-full w-full object-cover object-[center_20%]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Carousel Progress Bars (rendered ONCE on mobile) */}
          <div
            className="flex items-center justify-center gap-1.5 py-3.5"
            aria-label="Chọn slide giới thiệu"
          >
            {slides.map((_, dotIndex) => {
              const isDotActive = dotIndex === currentIndex;
              return (
                <button
                  key={`mob-dot-${dotIndex}`}
                  type="button"
                  onClick={() => goToSlide(dotIndex)}
                  aria-label={`Chuyển đến slide ${dotIndex + 1}`}
                  className={cn(
                    'group relative h-[18px] flex items-center justify-center transition-all cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]',
                    isDotActive ? 'w-[42px]' : 'w-[24px]'
                  )}
                >
                  <span
                    className={cn(
                      'h-[3px] w-full rounded-full transition-all overflow-hidden block',
                      isDotActive ? 'bg-[#0d7a28]/20' : 'bg-slate-300'
                    )}
                  >
                    {isDotActive && (
                      <span
                        key={`mob-prog-${currentIndex}`}
                        className="block h-full w-full bg-[#0d7a28] rounded-full origin-left motion-reduce:transform-none motion-reduce:!animation-none"
                        style={{
                          animationName: 'heroProgress',
                          animationDuration: `${autoplayInterval}ms`,
                          animationTimingFunction: 'linear',
                          animationFillMode: 'forwards',
                          animationPlayState: isPaused ? 'paused' : 'running'
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Text & Actions Stage */}
          <div className="relative">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;
              const EyebrowIcon = slide.eyebrowIcon;
              const PrimaryIcon = slide.primaryCta.icon;

              return (
                <div
                  key={`mob-content-${slide.id}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} trên ${slides.length}: ${slide.title}`}
                  className={cn(
                    'transition-[opacity,transform,visibility] duration-500 ease-out',
                    isActive
                      ? 'opacity-100 relative z-10 visible'
                      : 'opacity-0 absolute inset-0 pointer-events-none invisible'
                  )}
                  aria-hidden={!isActive}
                >
                  {/* Eyebrow Badge */}
                  <div className="pt-0.5">
                    <div className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/06 px-3 text-[12px] font-semibold text-[#0d7a28]">
                      <EyebrowIcon size={13} className="shrink-0 text-[#0d7a28]" />
                      <span>{slide.eyebrow}</span>
                    </div>
                  </div>

                  {/* Headline Hierarchy (Balanced, no orphans) */}
                  <h1 className="mt-2.5 text-[#131935] font-extrabold tracking-tight [text-wrap:balance]">
                    <span className="block text-[27px] sm:text-[32px] font-extrabold leading-[1.12]">
                      {slide.title}
                    </span>
                    <span className="block mt-1 text-[23px] sm:text-[27px] font-bold leading-[1.18] bg-gradient-to-r from-[#0d7a28] via-[#0d7a28] to-[#106f8a] bg-clip-text text-transparent">
                      {slide.titleHighlight}
                    </span>
                  </h1>

                  {/* Short Description (max 3 lines) */}
                  <p className="mt-2 text-[14.5px] sm:text-[15.5px] text-slate-600 leading-[1.58] line-clamp-3">
                    {slide.description}
                  </p>

                  {/* Primary CTA (dominant, full-width) & Secondary action */}
                  <div className="mt-4 space-y-2.5">
                    <Link
                      href={slide.primaryCta.href}
                      className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#0d7a28] px-5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-[#0a6120]"
                    >
                      {PrimaryIcon && <PrimaryIcon size={17} />}
                      <span>{slide.primaryCta.label}</span>
                    </Link>

                    <Link
                      href={slide.secondaryCta.href}
                      className="flex h-[42px] w-full items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 transition active:text-[#0d7a28]"
                    >
                      <span>{slide.secondaryCta.label}</span>
                      <ArrowRight size={15} className="text-[#0d7a28]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            UNIFIED TRUST MICROCOPY — Rendered once outside the carousel (Section 11)
           ========================================================================= */}
        <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-[#0d7a28] shrink-0" strokeWidth={2.5} />
            Không cần cài đặt ứng dụng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-[#0d7a28] shrink-0" strokeWidth={2.5} />
            Tra cứu miễn phí trên điện thoại
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-[#0d7a28] shrink-0" strokeWidth={2.5} />
            Dữ liệu xác thực từ HTX
          </span>
        </div>
      </div>
    </section>
  );
}