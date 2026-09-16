import { cn } from './ui';

export const PUBLIC_LOGO_SRC = '/logo.webp';
export const AGRIPASSPORT_MARK_SRC = '/agripassport-mark.webp';
export const AGRIPASSPORT_WORDMARK_SRC = '/agripassport-wordmark.webp';
export const PASSPORT_WORDMARK_SRC = '/passport-wordmark-standard-cropped.webp';
export const PASSPORT_MARK_SRC = '/passport-mark.webp';
export const HTXONLINE_WORDMARK_SRC = '/htxonline-wordmark.webp';
export const HTXONLINE_MARK_SRC = '/htxonline-mark.webp';
const PUBLIC_LOGO_WIDTH_RATIO = 603 / 669;
const AGRIPASSPORT_WORDMARK_WIDTH_RATIO = 2050 / 451;
const WORDMARK_WIDTH_RATIO = 1850 / 450;
const PASSPORT_WORDMARK_WIDTH = 1984;
const PASSPORT_WORDMARK_HEIGHT = 334;
const PASSPORT_STANDARD_WIDTH_RATIO = PASSPORT_WORDMARK_WIDTH / PASSPORT_WORDMARK_HEIGHT;

type PublicLogoProps = {
  size?: number;
  className?: string;
  variant?: 'default' | 'agri' | 'agri-wordmark' | 'passport' | 'passport-wordmark' | 'htx' | 'htx-wordmark';
};

export function PublicLogo({ size = 40, className, variant = 'default' }: PublicLogoProps) {
  if (variant === 'agri-wordmark') {
    const width = Math.round(size * AGRIPASSPORT_WORDMARK_WIDTH_RATIO);
    return (
      <img
        src={AGRIPASSPORT_WORDMARK_SRC}
        alt="AGRIPASSPORT"
        width={width}
        height={size}
        className={cn('shrink-0 object-contain', className)}
        style={{ width, height: size }}
      />
    );
  }

  if (variant === 'passport-wordmark' || variant === 'htx-wordmark') {
    const isPassportWordmark = variant === 'passport-wordmark';
    const width = Math.round(size * (isPassportWordmark ? PASSPORT_STANDARD_WIDTH_RATIO : WORDMARK_WIDTH_RATIO));
    return (
      <img
        src={isPassportWordmark ? PASSPORT_WORDMARK_SRC : HTXONLINE_WORDMARK_SRC}
        alt={variant === 'passport-wordmark' ? 'Hộ chiếu nông nghiệp' : 'HTXONLINE'}
        width={width}
        height={size}
        className={cn('shrink-0 object-contain', className)}
        style={{ width, height: size, objectFit: 'contain', objectPosition: 'center' }}
      />
    );
  }

  if (variant === 'agri') {
    return <img src={AGRIPASSPORT_MARK_SRC} alt="AGRIPASSPORT" width={size} height={size} className={cn('shrink-0 object-contain', className)} style={{ width: size, height: size }} />;
  }

  if (variant === 'htx') {
    return <img src={HTXONLINE_MARK_SRC} alt="HTXONLINE" width={size} height={size} className={cn('shrink-0 object-contain', className)} style={{ width: size, height: size }} />;
  }

  if (variant === 'passport') {
    return <img src={PASSPORT_MARK_SRC} alt="Hộ chiếu nông nghiệp" width={size} height={size} className={cn('shrink-0 object-contain', className)} style={{ width: size, height: size }} />;
  }

  const width = Math.round(size * PUBLIC_LOGO_WIDTH_RATIO);
  const height = size;

  return (
    <img
      src={PUBLIC_LOGO_SRC}
      alt="Biểu trưng nền tảng"
      width={width}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      style={{ width, height }}
    />
  );
}
