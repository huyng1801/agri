'use client';

import { useState } from 'react';
export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80';

export const DEFAULT_COOPERATIVE_IMAGE =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80';

export const DEFAULT_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80';

type PublicImageProps = {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
  wrapperClassName?: string;
  testId?: string;
};

export function PublicImage({
  src,
  alt,
  fallback = DEFAULT_PRODUCT_IMAGE,
  className,
  wrapperClassName,
  testId
}: PublicImageProps) {
  const initial = src || fallback;
  const [currentSrc, setCurrentSrc] = useState(initial);

  return (
    <div className={wrapperClassName}>
      <img
        data-testid={testId}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        className={className}
        onError={() => {
          if (currentSrc !== fallback) setCurrentSrc(fallback);
        }}
      />
    </div>
  );
}
