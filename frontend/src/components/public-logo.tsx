import { cn } from './ui';

export const PUBLIC_LOGO_SRC = '/logo.jpg';

type PublicLogoProps = {
  size?: number;
  className?: string;
};

export function PublicLogo({ size = 40, className }: PublicLogoProps) {
  return (
    <img
      src={PUBLIC_LOGO_SRC}
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 rounded-full bg-white object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
