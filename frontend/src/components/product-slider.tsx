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
    <div className="relative mt-4 sm:mt-5" data-testid="product-slider">
      <div className="relative">
        <div
          ref={trackRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <div key={product.id} data-slider-card className="w-[min(86vw,340px)] shrink-0 snap-start sm:w-[310px] lg:w-[320px]">
              <ProductCard product={product} priority={index < 4} />
            </div>
          ))}
        </div>

        {products.length > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 top-[40%] z-[2] flex -translate-y-1/2 justify-between px-1 sm:-left-5 sm:-right-5 sm:px-0">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className={cn(
                'pointer-events-auto hidden h-12 w-12 place-items-center rounded-[1rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233] sm:grid'
              )}
              aria-label="Xem sản phẩm trước"
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className={cn(
                'pointer-events-auto hidden h-12 w-12 place-items-center rounded-[1rem] bg-[rgba(228,228,228,0.84)] text-slate-500 shadow-sm backdrop-blur transition hover:bg-[rgba(214,214,214,0.94)] hover:text-[#1f2233] sm:grid'
              )}
              aria-label="Xem sản phẩm tiếp theo"
            >
              <ChevronRight size={28} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
