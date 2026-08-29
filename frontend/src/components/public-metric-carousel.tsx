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

export function PublicMetricCarousel({ items, className }: { items: PublicMetricCarouselItem[]; className?: string }) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const activeIndex = ((index % items.length) + items.length) % items.length;
  const active = items[activeIndex];
  const Icon = iconMap[active.icon];

  return (
    <div className={cn('relative rounded-[2rem] border border-[#e6ece1] bg-white px-12 py-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)]', className)}>
      <button
        type="button"
        aria-label="Mục trước"
        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[0.95rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233]"
        onClick={() => setIndex((value) => value - 1)}
      >
        <ArrowLeft size={22} aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Mục tiếp theo"
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[0.95rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233]"
        onClick={() => setIndex((value) => value + 1)}
      >
        <ArrowRight size={22} aria-hidden="true" />
      </button>

      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
          <Icon size={38} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#1f2233]">{active.title}</p>
        <p className="mt-3 text-[1.9rem] font-extrabold leading-tight tracking-[-0.04em] text-[#1f9b4b]">{active.value}</p>
        <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-6 text-slate-600">{active.description}</p>

        <div className="mt-5 flex items-center justify-center gap-2">
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
