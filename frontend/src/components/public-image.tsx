'use client';

import { useEffect, useRef, useState } from 'react';
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
  priority?: boolean;
  decorative?: boolean;
};

export function PublicImage({
  src,
  alt,
  fallback = DEFAULT_PRODUCT_IMAGE,
  className,
  wrapperClassName,
  testId,
  priority = false,
  decorative = false
}: PublicImageProps) {
  const resolved = src || fallback;
  const [currentSrc, setCurrentSrc] = useState(resolved);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentSrc(resolved);
    setLoaded(false);
  }, [resolved]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    if (img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setLoaded(false);
      return;
    }
    setLoaded(true);
  }, [currentSrc, fallback]);

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', wrapperClassName)}>
      {!loaded && <div className="absolute inset-0 z-[1] animate-pulse bg-slate-200" aria-hidden="true" />}
      <img
        ref={imgRef}
        data-testid={testId}
        src={currentSrc}
        alt={decorative ? '' : alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        aria-hidden={decorative ? true : undefined}
        className={cn('block max-w-full', className)}
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
