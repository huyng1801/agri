'use client';

import { cn } from './ui';
import { useCartCount } from '@/hooks/use-cart-count';

export function CartCountBadge({ className }: { className?: string }) {
  const count = useCartCount();
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[10px] font-bold leading-none text-white',
        className
      )}
      aria-label={`${count} sản phẩm trong giỏ`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
