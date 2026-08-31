'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Boxes, QrCode, ShoppingBag, Store, Users, type LucideIcon } from 'lucide-react';
import { cn } from './ui';

const iconMap = {
  users: Users,
  boxes: Boxes,
  shoppingBag: ShoppingBag,
  store: Store,
  qrCode: QrCode,
  badgeCheck: BadgeCheck
} satisfies Record<string, LucideIcon>;

export type PublicMetricCarouselItem = {
  title: string;
  value: string;
  description: string;
  icon: keyof typeof iconMap;
};

export function PublicMetricCarousel({
  items,
  className,
  variant = 'default'
}: {
  items: PublicMetricCarouselItem[];
  className?: string;
  variant?: 'default' | 'demeter';
}) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const activeIndex = ((index % items.length) + items.length) % items.length;
  const active = items[activeIndex];
  const Icon = iconMap[active.icon];
  const demeterVariant = variant === 'demeter';

  return (
    <div
      className={cn(
        'relative rounded-[2rem] border border-[#e6ece1] bg-white px-12 py-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)]',
        demeterVariant &&
          'mx-auto max-w-[23rem] rounded-[2rem] border border-[#e6ece1] bg-white px-12 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:max-w-none sm:px-12 sm:py-8',
        className
      )}
    >
      <button
        type="button"
        aria-label="Mục trước"
        className={cn(
          'absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[0.95rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233]',
          demeterVariant && 'left-3 top-[42%] h-11 w-11 rounded-[1rem] bg-[rgba(225,225,225,0.92)] text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:left-3 sm:top-1/2 sm:h-10 sm:w-10'
        )}
        onClick={() => setIndex((value) => value - 1)}
      >
        <ArrowLeft size={22} aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Mục tiếp theo"
        className={cn(
          'absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[0.95rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233]',
          demeterVariant && 'right-3 top-[42%] h-11 w-11 rounded-[1rem] bg-[rgba(225,225,225,0.92)] text-slate-500 shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:right-3 sm:top-1/2 sm:h-10 sm:w-10'
        )}
        onClick={() => setIndex((value) => value + 1)}
      >
        <ArrowRight size={22} aria-hidden="true" />
      </button>

      <div className={cn('text-center', demeterVariant && 'pt-2 sm:pt-0')}>
        <span
          className={cn(
            'mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_14px_30px_rgba(15,23,42,0.05)]',
            demeterVariant &&
              'h-[7rem] w-[7rem] rounded-full border border-[#dbe7da] bg-[#f7fbf4] text-[#4a8e5f] shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:h-24 sm:w-24 sm:bg-[#f5fbf3] sm:text-[#2b8a3e]'
          )}
        >
          <Icon
            size={demeterVariant ? 74 : 38}
            strokeWidth={demeterVariant ? 1.45 : 1.7}
            aria-hidden="true"
            className={cn(demeterVariant && 'sm:h-[42px] sm:w-[42px]')}
          />
        </span>
        <p
          className={cn(
            'mt-4 text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#1f2233]',
            demeterVariant && 'mt-4 text-[0.7rem] tracking-[0.18em] text-[#334155]'
          )}
        >
          {active.title}
        </p>
        <p
          className={cn(
            'mt-3 text-[1.9rem] font-extrabold leading-tight tracking-[-0.04em] text-[#1f9b4b]',
            demeterVariant && 'mx-auto max-w-[18rem] text-[1.72rem] leading-[1.08] text-[#1f9b4b] sm:text-[2rem]'
          )}
        >
          {active.value}
        </p>
        <p
          className={cn(
            'mx-auto mt-3 max-w-[17rem] text-sm leading-6 text-slate-600',
            demeterVariant && 'max-w-[17rem] text-[0.92rem] leading-6 text-[#475569] sm:max-w-[18rem] sm:text-sm sm:leading-6'
          )}
        >
          {active.description}
        </p>

        <div className={cn('mt-5 flex items-center justify-center gap-2', demeterVariant && 'mt-5')}>
          {items.map((item, itemIndex) => (
            <button
              key={`${item.title}-${item.value}`}
              type="button"
              aria-label={`Chọn mục ${itemIndex + 1}`}
              aria-pressed={itemIndex === activeIndex}
              className={cn(
                'h-2.5 rounded-full transition',
                itemIndex === activeIndex ? 'w-8 bg-[#1f9b4b]' : 'w-2.5 bg-[#d8e2d7] hover:bg-[#b8cdb9]'
              )}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
