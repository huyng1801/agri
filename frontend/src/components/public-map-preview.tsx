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

function StaticMapSurface({ address, location }: { address: string; location: PublicMapLocation }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#edf7f1_0%,#d6ebdf_48%,#9dc5ae_100%)]">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.34)_1px,transparent_1px)] [background-size:32px_32px]" />
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-75">
        <path d="M4 73C17 60 27 57 39 61C51 65 57 76 69 73C80 70 84 58 97 53" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M10 27C25 30 33 38 40 46C49 55 59 57 70 53C80 49 86 35 94 24" fill="none" stroke="rgba(35,111,74,0.24)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M16 60C29 49 41 45 55 48C65 51 72 57 83 54" fill="none" stroke="rgba(35,111,74,0.24)" strokeWidth="1.4" strokeDasharray="4 4" strokeLinecap="round" />
      </svg>
      <div className="absolute left-[11%] top-[21%] hidden max-w-[min(74%,22rem)] rounded-[var(--public-radius-control)] border border-white/75 bg-white/90 px-3 py-2 text-left shadow-sm backdrop-blur-sm sm:block">
        <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Văn phòng hỗ trợ</p>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--text-primary)]">{address}</p>
      </div>
      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#dc2626] shadow-[0_0_0_7px_rgba(220,38,38,0.16)]" aria-hidden="true" />
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
        <div className="rounded-full border border-white/75 bg-white/88 px-3 py-1.5 text-[0.68rem] font-semibold text-[var(--brand-primary)] shadow-sm backdrop-blur-sm">
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </div>
      </div>
    </div>
  );
}

export function PublicMapPreview({ address, location, mapSearchUrl, mapEmbedUrl, className, frameClassName, aspectClassName, compact = false }: PublicMapPreviewProps) {
  const mapExternalUrl = mapEmbedUrl || mapSearchUrl;

  if (compact) {
    return (
      <div className={cn('relative isolate min-h-[12rem] overflow-hidden rounded-[var(--public-radius-card)] bg-[var(--brand-primary-subtle)]', className)}>
        <StaticMapSurface address={address} location={location} />
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-3 rounded-[var(--public-radius-control)] border border-white/70 bg-white/92 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:inset-x-4 sm:bottom-4">
          <div className="min-w-0">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">Điểm hỗ trợ</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{address}</p>
          </div>
          <MapLink href={mapExternalUrl} compact />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-[var(--public-radius-surface)] border border-[var(--border-strong)] bg-[var(--brand-primary-subtle)]', className)}>
      <div className={cn('relative isolate aspect-[16/10] min-h-[240px] w-full overflow-hidden sm:min-h-[300px] lg:min-h-[360px]', aspectClassName)}>
        <div className={cn('absolute inset-0 overflow-hidden', frameClassName)}>
          <StaticMapSurface address={address} location={location} />
        </div>

        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
          <div className="min-w-0 max-w-[min(100%,34rem)] rounded-[var(--public-radius-control)] border border-white/70 bg-white/92 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm sm:px-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Văn phòng hỗ trợ</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[var(--text-primary)]">{address}</p>
          </div>
          <MapLink href={mapExternalUrl} />
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
