import { cn } from './ui';

export const PUBLIC_LOGO_SRC = '/logo.png';

type PublicLogoProps = {
  size?: number;
  className?: string;
  variant?: 'default' | 'agri';
};

export function PublicLogo({ size = 40, className, variant = 'default' }: PublicLogoProps) {
  if (variant === 'agri') {
    return (
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-label="AGRIPASSPORT"
        width={size}
        height={size}
        className={cn('shrink-0', className)}
        style={{ width: size, height: size }}
      >
        <circle cx="24" cy="24" r="22" fill="#0f7d63" />
        <path d="M24 38.3c-8.2-5.1-12.3-11.2-12.3-18.2 0-4.6 2.1-8.1 5.7-10.4 2.3 4 5 7 8.1 9.1 2.1-3 4.9-5.9 8.5-8.5 2.1 2.4 3.1 5.6 2.8 9.5-.6 7.9-5 14.1-12.8 18.5Z" fill="#d9f4b1" />
        <path d="M16.3 27.5c5.8-1.5 10.4-4.7 13.9-9.7M19.1 33.6c4.4-3.7 7.6-8.4 9.5-14.1" fill="none" stroke="#fffdf5" strokeLinecap="round" strokeWidth="2.1" />
        <circle cx="15.2" cy="15.2" r="2.3" fill="#f9c85b" />
      </svg>
    );
  }

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
