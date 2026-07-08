import { cn } from './ui';

export const PUBLIC_LOGO_SRC = '/logo.png';

type PublicLogoProps = {
  size?: number;
  className?: string;
};

export function PublicLogo({ size = 40, className }: PublicLogoProps) {
  return (
    <img
      src={PUBLIC_LOGO_SRC}
      alt="HTXONLINE"
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}
