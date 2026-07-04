'use client';

import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import type { PublicProduct } from './public-marketplace';
import { addProductToCart } from '@/lib/cart';
import { Button } from './ui';

export function AddToCartButton({
  product,
  className,
  label = 'Thêm vào giỏ'
}: {
  product: PublicProduct;
  className?: string;
  label?: string;
}) {
  const [added, setAdded] = useState(false);

  function add() {
    addProductToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Button data-testid="add-to-cart-button" type="button" className={className} onClick={add}>
      <ShoppingCart size={18} aria-hidden="true" />
      {added ? 'Đã thêm' : label}
    </Button>
  );
}
