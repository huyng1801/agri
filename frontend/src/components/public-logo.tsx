import { cn } from './ui';

export const PUBLIC_LOGO_SRC = '/logo.png';
const PUBLIC_LOGO_WIDTH_RATIO = 603 / 669;

type PublicLogoProps = {
  size?: number;
  className?: string;
  variant?: 'default' | 'agri';
};

export function PublicLogo({ size = 40, className, variant = 'default' }: PublicLogoProps) {
  if (variant === 'agri') {
    return <img src={PUBLIC_LOGO_SRC} alt="AGRIPASSPORT" width={size} height={size} className={cn('shrink-0 object-contain', className)} style={{ width: size, height: size }} />;
  }

  const width = Math.round(size * PUBLIC_LOGO_WIDTH_RATIO);
  const height = size;

  return (
    <img
      src={PUBLIC_LOGO_SRC}
      alt="HTXONLINE"
      width={width}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      style={{ width, height }}
    />
  );
}
