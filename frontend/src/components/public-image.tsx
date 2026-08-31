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

  useEffect(() => {
    if (loaded || currentSrc === fallback) return;

    // Third-party image hosts can leave an image request pending indefinitely.
    // Prefer a known, fast fallback so a public page never keeps a blank media area.
    const timeout = window.setTimeout(() => {
      const image = imgRef.current;
      if (!image || image.naturalWidth === 0) {
        setCurrentSrc(fallback);
        setLoaded(false);
      }
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [currentSrc, fallback, loaded]);

  return (
    <div className={cn('relative overflow-hidden bg-[var(--surface-0)]', wrapperClassName)}>
      {!loaded && (
        <div
          className="absolute inset-0 z-[1] animate-pulse bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.92),transparent_28%),linear-gradient(135deg,#e6f3e4_0%,#f8fbf5_50%,#dcefea_100%)]"
          aria-hidden="true"
        />
      )}
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
