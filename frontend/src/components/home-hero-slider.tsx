'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  QrCode,
  ShieldCheck,
  Sprout,
  Store
} from 'lucide-react';
import { PublicImage } from './public-image';
import { cn } from './ui';

export type HeroSlide = {
  id: string;
  eyebrow: string;
  eyebrowIcon: React.ElementType;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
    icon?: React.ElementType;
  };
  secondaryCta: {
    label: string;
    href: string;
    icon?: React.ElementType;
  };
  image: string;
  imageAlt: string;
  badgeTitle: string;
  badgeSubtitle: string;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-qr-trace',
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
    id: 'slide-coop-digital',
    eyebrow: 'Giải pháp Số hóa Hợp tác xã',
    eyebrowIcon: Sprout,
    title: 'Từ cánh đồng & Hợp tác xã đến',
    titleHighlight: 'Hộ Chiếu Nông Nghiệp Số',
    description:
      'Chuẩn hóa toàn diện dữ liệu vùng canh tác, sổ nhật ký nông hộ theo tiêu chuẩn VietGAP, GlobalGAP và OCOP thành hồ sơ điện tử có giá trị pháp lý và thương mại.',
    primaryCta: {
      label: 'Dành cho Hợp tác xã',
      href: '/lien-he',
      icon: Store
    },
    secondaryCta: {
      label: 'Tìm hiểu Quy trình',
      href: '/ve-chung-toi',
      icon: ArrowRight
    },
    image: '/hero/htx-farmer-hero-v2.png',
    imageAlt: 'Hợp tác xã nông nghiệp ứng dụng quy trình số hóa canh tác',
    badgeTitle: 'Chuẩn hóa quy trình',
    badgeSubtitle: 'Hồ sơ số đồng bộ từ vùng trồng'
  },
  {
    id: 'slide-export-market',
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
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
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
      className="relative overflow-hidden bg-[radial-gradient(ellipse_60%_50%_at_80%_35%,rgba(13,122,40,0.06),transparent_70%),linear-gradient(180deg,#f5faf4_0%,#ffffff_100%)] border-b border-[var(--border)]"
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
      <div className="mx-auto w-full max-w-[var(--container-max,1280px)] px-4 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:pt-10 lg:pb-12 xl:pt-12 xl:pb-12">
        {/* Main Content Grid Area */}
        <div className="relative min-h-[430px] sm:min-h-[410px] lg:min-h-[420px]">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            const EyebrowIcon = slide.eyebrowIcon;
            const PrimaryIcon = slide.primaryCta.icon;

            return (
              <div
                key={slide.id}
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
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12 lg:items-center">
                  {/* Left Column: Content (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-5 lg:space-y-5">
                    {/* Eyebrow Label */}
                    <div>
                      <div className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#0d7a28]/20 bg-[#0d7a28]/06 px-3.5 text-xs font-semibold text-[#0d7a28]">
                        <EyebrowIcon size={14} className="shrink-0 text-[#0d7a28]" />
                        <span>{slide.eyebrow}</span>
                      </div>
                    </div>

                    {/* Headline Hierarchy: Dominant Main H1 + Lighter Accent */}
                    <h1 className="text-[#131935] font-extrabold tracking-tight [text-wrap:balance]">
                      <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] 2xl:text-[50px] font-extrabold leading-[1.14]">
                        {slide.title}
                      </span>
                      <span className="block mt-1 sm:mt-1.5 text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[36px] 2xl:text-[40px] font-bold leading-[1.2] bg-gradient-to-r from-[#0d7a28] via-[#0d7a28] to-[#106f8a] bg-clip-text text-transparent">
                        {slide.titleHighlight}
                      </span>
                    </h1>

                    {/* Description: High-density, 2-3 lines desktop */}
                    <p className="text-[15px] sm:text-[16px] lg:text-[17px] xl:text-[18px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px] xl:max-w-[620px]">
                      {slide.description}
                    </p>

                    {/* CTA Hierarchy: Solid Dominant Primary + Refined Secondary Text Action */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-2">
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

                    {/* Unified Trust Microcopy */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs sm:text-[13px] font-medium text-slate-600">
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

                  {/* Right Column: Hero Media (5 cols) */}
                  <div className="lg:col-span-5">
                    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                      {/* Subtle Ambient Glow behind Image */}
                      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#0d7a28]/10 via-[#106f8a]/08 to-transparent blur-2xl -z-10 pointer-events-none" />

                      {/* Image Card Frame: 6px padding, 22px outer radius, diffuse shadow */}
                      <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-[6px] shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[var(--surface-muted)]">
                          <PublicImage
                            src={slide.image}
                            alt={slide.imageAlt}
                            fallback="/news/field-qr.webp"
                            priority={index === 0}
                            wrapperClassName="h-full w-full"
                            className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                          />

                          {/* Floating Trust Badge on Image */}
                          <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-[#073b2a]/85 p-3 text-white backdrop-blur-md shadow-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#b8edc0]">
                                  {slide.badgeTitle}
                                </p>
                                <p className="text-xs font-bold text-white mt-0.5">
                                  {slide.badgeSubtitle}
                                </p>
                              </div>
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-[#b8edc0]">
                                <ShieldCheck size={18} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified Slider Controls Cluster: Positioned under image, aligned right */}
        <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Empty spacer for left column on desktop */}
          <div className="hidden lg:block lg:col-span-7" />

          {/* Unified Controls Cluster on right column */}
          <div className="lg:col-span-5 flex items-center justify-end gap-3.5 w-full">
            {/* Progress Bars (Accessible buttons without visible numbers) */}
            <div
              className="flex items-center gap-1.5"
              role="tablist"
              aria-label="Chọn slide giới thiệu"
            >
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={slide.id}
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
                          key={currentIndex}
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
    </section>
  );
}