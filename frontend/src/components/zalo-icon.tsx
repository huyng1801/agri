import { cn } from './ui';

export const ZALO_ICON_SRC = '/icons/zalo.svg';

type ZaloIconProps = {
  size?: number;
  className?: string;
};

export function ZaloIcon({ size = 24, className }: ZaloIconProps) {
  return (
    <img
      src={ZALO_ICON_SRC}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={cn('shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}
