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

  return (
    <div className={cn('overflow-hidden rounded-[1.7rem] border border-white/18 bg-[#d9eadf]', className)}>
      <div className={cn('relative isolate overflow-hidden', compact ? 'aspect-[1.1/1]' : 'aspect-[1.28/1] min-h-[280px]')}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.42),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(15,23,42,0.08))]" />
        <div className={cn('absolute inset-0 grid grid-cols-3 grid-rows-3', frameClassName)}>
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.18))]" />
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
