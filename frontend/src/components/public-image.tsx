'use client';

import { useEffect, useState } from 'react';
import { cn } from './ui';

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
  const resolved = src || fallback;
  const [currentSrc, setCurrentSrc] = useState(resolved);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setCurrentSrc(resolved);
  }, [resolved]);

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', wrapperClassName)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden="true" />}
      <img
        data-testid={testId}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(className, loaded ? 'opacity-100' : 'opacity-0', 'transition-opacity duration-300')}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc !== fallback) {
            setCurrentSrc(fallback);
            setLoaded(false);
            return;
          }
          setLoaded(true);
        }}
      />
    </div>
  );
}
