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
      <div className="relative overflow-hidden rounded-[2.2rem] border border-[#e2eadc] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf7_100%)] p-3 shadow-[0_22px_48px_rgba(15,23,42,0.08)] sm:p-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(circle at 18% 20%, rgba(31,155,75,0.08), transparent 18%), radial-gradient(circle at 84% 24%, rgba(13,111,128,0.08), transparent 18%), radial-gradient(circle at 50% 100%, rgba(15,23,42,0.03), transparent 26%)'
          }}
        />

        <div className="relative rounded-[1.8rem] border border-white/80 bg-white/88 px-3 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-8 sm:py-10">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-6">
            <button
              type="button"
              aria-label="Lợi ích trước"
              className="grid h-14 w-14 place-items-center rounded-[1.15rem] border border-[#dfe7dd] bg-[#f4f5f2] text-slate-500 shadow-sm transition hover:border-[#c8d9ca] hover:text-[#1f9b4b]"
              onClick={() => setIndex((value) => value - 1)}
            >
              <ArrowLeft size={28} aria-hidden="true" />
            </button>

            <div className="min-w-0 text-center">
              <span className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[#dbe7da] bg-[#f5fbf3] text-[#2b8a3e] shadow-[0_18px_34px_rgba(15,23,42,0.05)] sm:h-36 sm:w-36">
                <Icon size={56} strokeWidth={1.6} aria-hidden="true" className="sm:hidden" />
                <Icon size={74} strokeWidth={1.6} aria-hidden="true" className="hidden sm:block" />
              </span>
              <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f2233]">{active.title}</p>
              <p className="mt-2 text-[1.9rem] font-extrabold leading-tight tracking-[-0.04em] text-[#24283a] sm:text-[3.2rem]">{active.value}</p>
              <p className="mx-auto mt-4 max-w-2xl text-[0.96rem] leading-7 text-slate-600 sm:text-base sm:leading-8">{active.description}</p>
              {active.note ? <p className="mt-4 text-sm font-semibold text-[#1f9b4b] sm:text-[0.98rem]">{active.note}</p> : null}
            </div>

            <button
              type="button"
              aria-label="Lợi ích tiếp theo"
              className="grid h-14 w-14 place-items-center rounded-[1.15rem] border border-[#dfe7dd] bg-[#f4f5f2] text-slate-500 shadow-sm transition hover:border-[#c8d9ca] hover:text-[#1f9b4b]"
              onClick={() => setIndex((value) => value + 1)}
            >
              <ArrowRight size={28} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
