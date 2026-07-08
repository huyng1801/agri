'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, type PublicProduct } from './public-marketplace';
import { cn } from './ui';

export function ProductSlider({ products }: { products: PublicProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-slider-card]');
    const step = card ? card.offsetWidth + 16 : 320;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  return (
    <div className="relative mt-5" data-testid="product-slider">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-[#f8faf7] to-transparent sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-[#f8faf7] to-transparent sm:block" />
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div key={product.id} data-slider-card className="w-[min(88vw,300px)] shrink-0 snap-start sm:w-[280px] lg:w-[300px]">
            <ProductCard product={product} priority={index < 4} />
          </div>
        ))}
      </div>
      {products.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className={cn('grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm transition hover:border-leaf hover:text-leaf')}
            aria-label="Xem sản phẩm trước"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className={cn('grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-ink shadow-sm transition hover:border-leaf hover:text-leaf')}
            aria-label="Xem sản phẩm tiếp theo"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
