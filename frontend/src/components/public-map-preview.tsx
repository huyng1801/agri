import { MapPinned, Navigation } from 'lucide-react';
import { cn } from '@/components/ui';
import { type PublicMapLocation } from '@/lib/public-site';

type PublicMapPreviewProps = {
  address: string;
  location: PublicMapLocation;
  mapSearchUrl: string;
  className?: string;
  frameClassName?: string;
  compact?: boolean;
};

export function PublicMapPreview({ address, location, mapSearchUrl, className, frameClassName, compact = false }: PublicMapPreviewProps) {
  const locationLabel = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  const regionLabel = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(-1)[0] || 'Việt Nam';

  return (
    <div className={cn('overflow-hidden rounded-[1.7rem] border border-white/18 bg-[#d9eadf]', className)}>
      <div className={cn('relative isolate w-full overflow-hidden', compact ? 'aspect-[1.1/1]' : 'aspect-[1.28/1] min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]')}>
        <div className={cn('absolute inset-0 overflow-hidden', frameClassName)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_42%),linear-gradient(140deg,rgba(235,247,239,0.96)_0%,rgba(199,228,208,0.92)_52%,rgba(143,186,155,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] bg-[length:32px_32px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(255,255,255,0.48),transparent_18%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.36),transparent_20%)]" />
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full opacity-75"
          >
            <path d="M7 73C18 60 28 57 38 60C49 64 56 76 68 73C79 70 83 58 93 54" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M12 28C26 31 32 39 39 46C48 54 58 57 69 53C79 49 84 35 92 26" fill="none" stroke="rgba(37,99,70,0.22)" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M16 18C22 27 25 38 27 53C28 66 34 77 45 84" fill="none" stroke="rgba(255,255,255,0.44)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M61 12C58 24 58 34 63 45C68 55 77 62 85 66" fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M17 59C28 48 41 44 54 47C63 49 71 56 81 54" fill="none" stroke="rgba(21,128,61,0.24)" strokeWidth="1.2" strokeDasharray="4 4" strokeLinecap="round" />
          </svg>
          <div className="absolute left-[11%] top-[22%] h-16 w-16 rounded-full bg-white/16 blur-2xl" />
          <div className="absolute right-[15%] top-[16%] h-14 w-14 rounded-full bg-leaf/10 blur-2xl" />
          <div className="absolute bottom-[20%] left-[18%] h-20 w-20 rounded-full bg-white/14 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.16))]" />
        <div className="absolute left-[12%] top-[24%] hidden rounded-full border border-white/55 bg-white/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-leaf/80 shadow-sm sm:inline-flex">
          {regionLabel}
        </div>
        <div className="absolute right-[10%] top-[22%] hidden rounded-full border border-white/50 bg-white/65 px-3 py-1 text-[0.65rem] font-semibold text-ink/75 shadow-sm sm:inline-flex">
          Chỉ đường nhanh
        </div>
        <div className="absolute bottom-[26%] left-[12%] hidden rounded-2xl border border-white/45 bg-white/62 px-3 py-2 text-left shadow-sm backdrop-blur sm:block">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-leaf/70">Tọa độ tham chiếu</p>
          <p className="mt-1 text-xs font-semibold text-ink/80">{locationLabel}</p>
        </div>
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#dc2626] shadow-[0_0_0_6px_rgba(220,38,38,0.18)]" />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dc2626]/18 blur-[2px]" />
        <div className="absolute left-[18%] bottom-[12%] inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/76 px-3 py-1.5 text-[0.68rem] font-semibold text-leaf shadow-sm backdrop-blur">
          <MapPinned size={13} aria-hidden="true" />
          Điểm hỗ trợ
        </div>
        <div className="absolute right-[12%] bottom-[12%] hidden items-center gap-2 rounded-full border border-white/55 bg-white/76 px-3 py-1.5 text-[0.68rem] font-semibold text-ink/80 shadow-sm backdrop-blur sm:inline-flex">
          <Navigation size={13} aria-hidden="true" />
          Tuyến tra cứu
        </div>
        <div className="absolute inset-x-0 top-0 p-3 sm:p-4">
          <div className="inline-flex max-w-full rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-left shadow-sm backdrop-blur">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-leaf/75">Văn phòng hỗ trợ</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-ink">{address}</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[4.15rem] px-3 sm:px-4">
          <div className="rounded-2xl border border-white/45 bg-white/70 px-3 py-2 text-xs leading-5 text-ink/80 shadow-sm backdrop-blur">
            Bản đồ được hiển thị theo điểm địa chỉ hỗ trợ để người mua nhận biết vị trí nhanh, kể cả khi khung nhúng tải chậm.
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white/92 px-4 text-sm font-semibold text-leaf shadow-sm transition hover:-translate-y-0.5"
          >
            Mở trên Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
