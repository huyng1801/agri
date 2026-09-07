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
      aria-label="Mở vị trí trên Google Maps"
    >
      {compact ? <Navigation size={18} aria-hidden="true" /> : 'Mở trên Google Maps'}
    </a>
  );
}

export function PublicMapPreview({ address, location, mapSearchUrl, mapEmbedUrl, className, frameClassName, aspectClassName, compact = false }: PublicMapPreviewProps) {
  const regionLabel = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(-1)[0] || 'Việt Nam';
  const mapTitle = `Bản đồ văn phòng hỗ trợ tại ${regionLabel}`;
  const hasEmbed = Boolean(mapEmbedUrl);

  if (compact) {
    return (
      <div className={cn('relative isolate min-h-[12rem] overflow-hidden rounded-[var(--public-radius-card)] bg-[var(--brand-primary-subtle)]', className)}>
        {hasEmbed ? (
          <iframe
            title={mapTitle}
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,var(--brand-primary-subtle),var(--surface-muted))] p-5 text-center">
            <div>
              <MapPin className="mx-auto text-[var(--brand-primary)]" size={24} aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Chưa tải được bản đồ nhúng</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Bạn vẫn có thể mở vị trí trên Google Maps.</p>
            </div>
          </div>
        )}
        {hasEmbed ? <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_35%,rgba(15,23,42,0.24)_100%)]" /> : null}
        {hasEmbed ? <span className="pointer-events-none absolute left-1/2 top-[42%] h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-[#dc2626] shadow-[0_0_0_6px_rgba(220,38,38,0.16)]" aria-hidden="true" /> : null}
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-3 rounded-[var(--public-radius-control)] border border-white/70 bg-white/92 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:inset-x-4 sm:bottom-4">
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
          {hasEmbed ? (
            <iframe
              title={mapTitle}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 z-0 h-full w-full border-0"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,var(--brand-primary-subtle),var(--surface-muted))] p-6 text-center">
              <div>
                <MapPin className="mx-auto text-[var(--brand-primary)]" size={32} aria-hidden="true" />
                <p className="mt-3 font-semibold text-[var(--text-primary)]">Bản đồ đang được cập nhật</p>
                <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">Địa chỉ hỗ trợ vẫn có thể được mở trực tiếp trên Google Maps.</p>
              </div>
            </div>
          )}
          {hasEmbed ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_30%,rgba(15,23,42,0.2)_100%)]" /> : null}
        </div>

        {hasEmbed ? <span className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#dc2626] shadow-[0_0_0_6px_rgba(220,38,38,0.18)]" aria-hidden="true" /> : null}
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
