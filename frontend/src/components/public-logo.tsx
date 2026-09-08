import { cn } from './ui';

export const PUBLIC_LOGO_SRC = '/logo.png';
export const AGRIPASSPORT_MARK_SRC = '/agripassport-mark.png';
export const AGRIPASSPORT_WORDMARK_SRC = '/agripassport-wordmark.png';
export const PASSPORT_WORDMARK_SRC = '/passport-wordmark.png';
export const HTXONLINE_WORDMARK_SRC = '/htxonline-wordmark.png';
const PUBLIC_LOGO_WIDTH_RATIO = 603 / 669;
const AGRIPASSPORT_WORDMARK_WIDTH_RATIO = 1850 / 450;
const WORDMARK_WIDTH_RATIO = 1850 / 450;

type PublicLogoProps = {
  size?: number;
  className?: string;
  variant?: 'default' | 'agri' | 'agri-wordmark' | 'passport-wordmark' | 'htx-wordmark';
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
    const width = Math.round(size * WORDMARK_WIDTH_RATIO);
    return (
      <img
        src={variant === 'passport-wordmark' ? PASSPORT_WORDMARK_SRC : HTXONLINE_WORDMARK_SRC}
        alt={variant === 'passport-wordmark' ? 'Hộ chiếu nông nghiệp' : 'HTXONLINE'}
        width={width}
        height={size}
        className={cn('shrink-0 object-contain', className)}
        style={{ width, height: size }}
      />
    );
  }

  if (variant === 'agri') {
    return <img src={AGRIPASSPORT_MARK_SRC} alt="AGRIPASSPORT" width={size} height={size} className={cn('shrink-0 object-contain', className)} style={{ width: size, height: size }} />;
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
