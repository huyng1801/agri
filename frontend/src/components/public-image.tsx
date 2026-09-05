'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from './ui';

export const DEFAULT_PRODUCT_IMAGE =
  '/hero/htx-farmer-hero-v2.png';

export const DEFAULT_COOPERATIVE_IMAGE =
  '/hero/htx-farmer-hero-v2.png';

export const DEFAULT_NEWS_IMAGE =
  '/hero/htx-farmer-hero-v2.png';

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
  // Keep the content-specific image when available; the timeout and error
  // handler below still protect the layout when a remote asset is unavailable.
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
    // Cached images may finish between hydration and the first effect, so
    // also check on the next frame instead of leaving the loading veil up.
    const checkLoaded = () => {
      const img = imgRef.current;
      if (img?.complete) setLoaded(img.naturalWidth > 0);
    };
    const frame = window.requestAnimationFrame(checkLoaded);
    return () => window.cancelAnimationFrame(frame);
  }, [currentSrc]);

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
          className="absolute inset-0 z-[1] animate-pulse bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.7),transparent_28%),linear-gradient(135deg,rgba(230,243,228,0.58)_0%,rgba(248,251,245,0.36)_50%,rgba(220,239,234,0.56)_100%)]"
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
        className={cn('relative z-[2] block max-w-full', className)}
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
