'use client';

import { useEffect, useState } from 'react';
import { readCart } from '@/lib/cart';

export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    };
    refresh();
    window.addEventListener('htxonline-cart-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('htxonline-cart-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return count;
}
