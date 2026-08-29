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

export type PublicOutcomeSlide = {
  title: string;
  value: string;
  description: string;
  icon: keyof typeof iconMap;
  note?: string;
};

export function PublicOutcomeShowcase({
  items,
  className
}: {
  items: PublicOutcomeSlide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  const activeIndex = ((index % items.length) + items.length) % items.length;
  const active = items[activeIndex];
  const Icon = iconMap[active.icon];

  return (
    <div className={cn('mt-8', className)}>
      <div className="relative mx-auto max-w-[72rem] px-12 sm:px-16 lg:px-24">
        <button
          type="button"
          aria-label="Lợi ích trước"
          className="absolute left-0 top-[8.8rem] grid h-12 w-12 place-items-center rounded-[1rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233] sm:top-[10.8rem] sm:h-14 sm:w-14"
          onClick={() => setIndex((value) => value - 1)}
        >
          <ArrowLeft size={28} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Lợi ích tiếp theo"
          className="absolute right-0 top-[8.8rem] grid h-12 w-12 place-items-center rounded-[1rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233] sm:top-[10.8rem] sm:h-14 sm:w-14"
          onClick={() => setIndex((value) => value + 1)}
        >
          <ArrowRight size={28} aria-hidden="true" />
        </button>

        <div className="relative text-center">
          <div
            aria-hidden="true"
            className="absolute inset-x-[12%] top-10 h-32 rounded-full bg-[radial-gradient(circle,rgba(31,155,75,0.1),transparent_72%)] blur-3xl sm:inset-x-[18%] sm:top-16 sm:h-44"
          />

          <div className="relative mx-auto flex h-[10.5rem] max-w-3xl items-center justify-center text-[#4d9259] sm:h-[13.5rem]">
            <Icon size={118} strokeWidth={1.35} aria-hidden="true" className="sm:hidden" />
            <Icon size={184} strokeWidth={1.3} aria-hidden="true" className="hidden sm:block" />
          </div>

          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#1f2233]">{active.title}</p>
          <p className="mt-3 text-[2rem] font-extrabold leading-[1.06] tracking-[-0.05em] text-[#1f9b4b] sm:text-[3.05rem]">{active.value}</p>
          <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem] sm:leading-8">{active.description}</p>
          {active.note ? <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-[#2b8a3e] sm:text-base">{active.note}</p> : null}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {items.map((item, itemIndex) => (
              <button
                key={`${item.title}-${item.value}`}
                type="button"
                aria-label={`Chọn lợi ích ${itemIndex + 1}`}
                aria-pressed={itemIndex === activeIndex}
                className={cn(
                  'h-2.5 rounded-full transition',
                  itemIndex === activeIndex ? 'w-10 bg-[#1f9b4b]' : 'w-2.5 bg-[#d8e2d7] hover:bg-[#b8cdb9]'
                )}
                onClick={() => setIndex(itemIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
