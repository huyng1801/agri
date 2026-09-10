'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  ExternalLink
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
    image: '/hero/htx-farmer-hero-v1.png',
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
      icon: ExternalLink
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

  return (
    <section
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(13,122,40,0.08),transparent_50%),linear-gradient(180deg,#f3f9f2_0%,#ffffff_100%)] border-b border-[var(--border)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Khám phá Hộ Chiếu Nông Nghiệp"
    >
      <div className="mx-auto w-full max-w-[var(--container-max,1280px)] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-18">
        <div className="relative min-h-[480px] sm:min-h-[440px] lg:min-h-[460px]">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            const EyebrowIcon = slide.eyebrowIcon;
            const PrimaryIcon = slide.primaryCta.icon;
            const SecondaryIcon = slide.secondaryCta.icon;

            return (
              <div
                key={slide.id}
                className={cn(
                  'transition-all duration-700 ease-out',
                  isActive
                    ? 'opacity-100 translate-x-0 relative z-10'
                    : 'opacity-0 absolute inset-0 pointer-events-none -translate-x-4'
                )}
                aria-hidden={!isActive}
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
                  {/* Left content: 7 cols */}
                  <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                    {/* Eyebrow badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#0d7a28]/25 bg-[#0d7a28]/10 px-3.5 py-1.5 text-xs font-bold text-[#0d7a28]">
                      <EyebrowIcon size={14} className="shrink-0" />
                      <span>{slide.eyebrow}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="type-hero-h1 text-[var(--text-primary)]">
                      {slide.title}{' '}
                      <span className="block mt-1 bg-gradient-to-r from-[#0d7a28] to-[#106f8a] bg-clip-text text-transparent">
                        {slide.titleHighlight}
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="type-body-large max-w-2xl text-[var(--text-secondary)] leading-relaxed">
                      {slide.description}
                    </p>

                    {/* Dual CTAs */}
                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <Link
                        href={slide.primaryCta.href}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0d7a28] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#0a6120] hover:shadow-lg active:scale-[0.99]"
                      >
                        {PrimaryIcon && <PrimaryIcon size={18} />}
                        <span>{slide.primaryCta.label}</span>
                      </Link>

                      <Link
                        href={slide.secondaryCta.href}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-[var(--text-primary)] shadow-xs transition hover:border-[#0d7a28] hover:text-[#0d7a28] active:scale-[0.99]"
                      >
                        <span>{slide.secondaryCta.label}</span>
                        {SecondaryIcon && <SecondaryIcon size={16} />}
                      </Link>
                    </div>

                    {/* Quick Micro-Proofs */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs font-medium text-[var(--text-tertiary)]">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0d7a28]" />
                        Không cần cài đặt ứng dụng
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0d7a28]" />
                        Tra cứu miễn phí trên điện thoại
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#106f8a]" />
                        Bảo mật dữ liệu HTX
                      </span>
                    </div>
                  </div>

                  {/* Right media banner: 5 cols */}
                  <div className="lg:col-span-5">
                    <div className="relative mx-auto max-w-md lg:max-w-none">
                      {/* Decorative backdrop */}
                      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#0d7a28]/20 to-[#106f8a]/20 blur-xl -z-10" />

                      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--surface-muted)]">
                          <PublicImage
                            src={slide.image}
                            alt={slide.imageAlt}
                            fallback="/news/field-qr.webp"
                            priority={index === 0}
                            wrapperClassName="h-full w-full"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                          />

                          {/* Floating Trust Badge on image */}
                          <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/30 bg-[#073b2a]/85 p-3 text-white backdrop-blur-md">
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

        {/* Slider Controls: Arrows & Indicators */}
        <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
          {/* Indicator Dots with Slide titles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  'group flex items-center gap-2 rounded-full py-1.5 px-2.5 transition-all text-xs font-semibold',
                  index === currentIndex
                    ? 'bg-[#0d7a28] text-white shadow-xs'
                    : 'bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                )}
                aria-label={`Chuyển tới slide ${index + 1}: ${slide.badgeTitle}`}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    index === currentIndex ? 'w-5 bg-white' : 'bg-[var(--text-tertiary)] group-hover:bg-[#0d7a28]'
                  )}
                />
                <span className="hidden sm:inline text-[11px]">
                  0{index + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-white text-[var(--text-secondary)] shadow-xs transition hover:border-[#0d7a28] hover:text-[#0d7a28] active:scale-95"
              aria-label="Slide trước đó"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-white text-[var(--text-secondary)] shadow-xs transition hover:border-[#0d7a28] hover:text-[#0d7a28] active:scale-95"
              aria-label="Slide tiếp theo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}