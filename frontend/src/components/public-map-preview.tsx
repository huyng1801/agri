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

const ZOOM = 15;

export function PublicMapPreview({ address, location, mapSearchUrl, className, frameClassName, compact = false }: PublicMapPreviewProps) {
  const tiles = buildTileGrid(location.latitude, location.longitude, ZOOM);
  const locationLabel = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;

  return (
    <div className={cn('overflow-hidden rounded-[1.7rem] border border-white/18 bg-[#d9eadf]', className)}>
      <div className={cn('relative isolate overflow-hidden', compact ? 'aspect-[1.1/1]' : 'aspect-[1.28/1] min-h-[280px]')}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_42%),linear-gradient(140deg,rgba(235,247,239,0.96)_0%,rgba(199,228,208,0.92)_52%,rgba(143,186,155,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] bg-[length:32px_32px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(255,255,255,0.48),transparent_18%),radial-gradient(circle_at_82%_72%,rgba(255,255,255,0.36),transparent_20%)]" />
        <div className={cn('absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-0', frameClassName)}>
          {tiles.map((tile) => (
            <img
              key={`${tile.x}-${tile.y}`}
              src={`https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png`}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.16))]" />
        <div className="absolute left-[12%] top-[24%] hidden rounded-full border border-white/55 bg-white/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-leaf/80 shadow-sm sm:inline-flex">
          Dong Thap
        </div>
        <div className="absolute right-[10%] top-[22%] hidden rounded-full border border-white/50 bg-white/65 px-3 py-1 text-[0.65rem] font-semibold text-ink/75 shadow-sm sm:inline-flex">
          Chi duong nhanh
        </div>
        <div className="absolute bottom-[26%] left-[12%] hidden rounded-2xl border border-white/45 bg-white/62 px-3 py-2 text-left shadow-sm backdrop-blur sm:block">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-leaf/70">Toa do tham chieu</p>
          <p className="mt-1 text-xs font-semibold text-ink/80">{locationLabel}</p>
        </div>
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#dc2626] shadow-[0_0_0_6px_rgba(220,38,38,0.18)]" />
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dc2626]/18 blur-[2px]" />
        <div className="absolute inset-x-0 top-0 p-3 sm:p-4">
          <div className="inline-flex max-w-full rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-left shadow-sm backdrop-blur">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-leaf/75">Van phong ho tro</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-ink">{address}</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[4.15rem] px-3 sm:px-4">
          <div className="rounded-2xl border border-white/45 bg-white/70 px-3 py-2 text-xs leading-5 text-ink/80 shadow-sm backdrop-blur">
            Ban do duoc hien thi theo diem dia chi ho tro de nguoi mua nhan biet vi tri ngay trong footer, khong phu thuoc iframe ben ngoai.
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white/92 px-4 text-sm font-semibold text-leaf shadow-sm transition hover:-translate-y-0.5"
          >
            Mo tren Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function buildTileGrid(latitude: number, longitude: number, zoom: number) {
  const worldSize = 2 ** zoom;
  const latRad = (latitude * Math.PI) / 180;
  const x = ((longitude + 180) / 360) * worldSize;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * worldSize;
  const centerX = wrapTile(Math.floor(x), worldSize);
  const centerY = wrapTile(Math.floor(y), worldSize);
  const tiles = [];

  for (let row = -1; row <= 1; row += 1) {
    for (let column = -1; column <= 1; column += 1) {
      tiles.push({
        x: wrapTile(centerX + column, worldSize),
        y: wrapTile(centerY + row, worldSize)
      });
    }
  }

  return tiles;
}

function wrapTile(value: number, worldSize: number) {
  return ((value % worldSize) + worldSize) % worldSize;
}
