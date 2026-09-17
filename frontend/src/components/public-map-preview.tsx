import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/components/ui';
import { type PublicMapLocation } from '@/lib/public-site';

type PublicMapPreviewProps = {
  address: string;
  location: PublicMapLocation;
  mapSearchUrl: string;
  mapEmbedUrl?: string;
  className?: string;
  frameClassName?: string;
  aspectClassName?: string;
  compact?: boolean;
};

function MapLink({ href, compact = false }: { href: string; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--public-radius-control)] border border-white/70 bg-white/92 px-4 text-sm font-semibold text-[var(--brand-primary)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white',
        compact && 'h-11 w-11 shrink-0 rounded-full p-0'
      )}
      aria-label="Mở bản đồ"
    >
      {compact ? <Navigation size={18} aria-hidden="true" /> : 'Mở bản đồ'}
    </a>
  );
}

function safeMapEmbedUrl(value: string | undefined, location: PublicMapLocation) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const isOpenStreetMap = url.hostname === 'www.openstreetmap.org' && url.pathname === '/export/embed.html';
    if (isOpenStreetMap) {
      const embed = new URL('https://maps.google.com/maps');
      embed.searchParams.set('q', `${location.latitude},${location.longitude}`);
      embed.searchParams.set('z', '14');
      embed.searchParams.set('output', 'embed');
      return embed.toString();
    }

    const isGoogleHost = url.hostname === 'www.google.com' || url.hostname === 'maps.google.com';
    const isGoogleEmbed = url.pathname === '/maps/embed' || (url.pathname === '/maps' && url.searchParams.get('output') === 'embed');
    return isGoogleHost && isGoogleEmbed ? url.toString() : null;
  } catch {
    return null;
  }
}

export function PublicMapPreview({ address, location, mapSearchUrl, mapEmbedUrl, className, frameClassName, aspectClassName, compact = false }: PublicMapPreviewProps) {
  const embedUrl = safeMapEmbedUrl(mapEmbedUrl, location);

  if (compact) {
    return (
      <div className={cn('overflow-hidden rounded-[var(--public-radius-card)] bg-white', className)}>
        <div className="relative aspect-[16/10] min-h-[13rem] overflow-hidden bg-[var(--surface-muted)] sm:min-h-[16rem]">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Bản đồ vị trí: ${address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 grid place-content-center gap-2 p-6 text-center text-[var(--text-secondary)]">
              <MapPin size={25} className="mx-auto text-[var(--brand-primary)]" aria-hidden="true" />
              <p className="text-sm font-semibold">Bản đồ chưa được cấu hình</p>
              <p className="text-xs leading-5">Bạn vẫn có thể mở địa chỉ trên bản đồ bên ngoài.</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-3 sm:p-4">
          <div className="min-w-0">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">Điểm hỗ trợ</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{address}</p>
          </div>
          <MapLink href={mapSearchUrl} compact />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-[var(--public-radius-surface)] border border-[var(--border-strong)] bg-[var(--brand-primary-subtle)]', className)}>
      <div className={cn('relative isolate aspect-[16/10] min-h-[240px] w-full overflow-hidden sm:min-h-[300px] lg:min-h-[360px]', aspectClassName)}>
        <div className={cn('absolute inset-0 overflow-hidden', frameClassName)}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Bản đồ vị trí: ${address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 grid place-content-center gap-2 bg-[var(--surface-muted)] p-6 text-center text-[var(--text-secondary)]">
              <MapPin size={25} className="mx-auto text-[var(--brand-primary)]" aria-hidden="true" />
              <p className="text-sm font-semibold">Bản đồ chưa được cấu hình</p>
            </div>
          )}
        </div>

        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
          <div className="min-w-0 max-w-[min(100%,34rem)] rounded-[var(--public-radius-control)] border border-white/70 bg-white/92 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm sm:px-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Văn phòng hỗ trợ</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{address}</p>
          </div>
          <MapLink href={mapSearchUrl} />
        </div>
        <div className="absolute inset-x-3 bottom-3 z-10 sm:inset-x-4 sm:bottom-4">
          <div className="flex items-center gap-3 rounded-[var(--public-radius-control)] border border-white/70 bg-white/92 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:px-4">
            <MapPin size={17} className="shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-xs leading-5 text-[var(--text-secondary)] sm:text-sm">
              Vị trí hỗ trợ theo địa chỉ đăng ký. Tọa độ tham chiếu: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
