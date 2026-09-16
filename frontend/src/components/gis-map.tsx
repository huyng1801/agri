'use client';

import { ExternalLink, MapPinned } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { cn } from '@/components/ui';

export type GisMapMarker = {
  id: string;
  label: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status?: string | null;
  href?: string;
};

type GisMapProps = {
  markers: GisMapMarker[];
  className?: string;
  center?: { latitude: number; longitude: number };
  zoom?: number;
  mapTitle?: string;
  privacyLabel?: string;
  emptyLabel?: string;
  ariaLabel?: string;
  externalZoom?: number;
  singleMarkerZoom?: number;
};

const DEFAULT_CENTER = { latitude: 16.2, longitude: 107.9 };
const MAP_TILE_URL = '/map-tiles/{z}/{x}/{y}.png';

async function canLoadMapTiles() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 2500);

  try {
    await fetch('/map-tiles/0/0/0.png', { cache: 'no-store', signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function markerColor(status?: string | null) {
  if (status === 'NEEDS_ATTENTION') return '#d97706';
  if (status === 'ALERT') return '#dc2626';
  if (status === 'HARVESTED') return '#0284c7';
  return '#059669';
}

function validCoordinate(value: number | string | null | undefined, min: number, max: number) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function externalMapUrl(latitude: number, longitude: number, zoom: number) {
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latitude)}&mlon=${encodeURIComponent(longitude)}#map=${zoom}/${latitude}/${longitude}`;
}

export function GisMap({
  markers,
  className,
  center = DEFAULT_CENTER,
  zoom = 5,
  mapTitle = 'Bản đồ GIS',
  privacyLabel,
  emptyLabel = 'Chưa có tọa độ hợp lệ để hiển thị trên bản đồ.',
  ariaLabel = 'Bản đồ GIS',
  externalZoom = 11,
  singleMarkerZoom = 16
}: GisMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;

    setIsReady(false);
    setHasError(false);

    import('leaflet')
      .then(async (leaflet) => {
        if (disposed || !containerRef.current) return;

        const tilesAvailable = await canLoadMapTiles();
        if (disposed || !containerRef.current) return;

        const validMarkers = markers.flatMap((marker) => {
          const latitude = validCoordinate(marker.latitude, -90, 90);
          const longitude = validCoordinate(marker.longitude, -180, 180);
          return latitude === null || longitude === null ? [] : [{ ...marker, latitude, longitude }];
        });

        map = leaflet
          .map(containerRef.current, { scrollWheelZoom: false, preferCanvas: true })
          .setView([center.latitude, center.longitude], zoom);
        if (tilesAvailable) {
          leaflet
            .tileLayer(MAP_TILE_URL, {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            })
            .addTo(map);
        } else {
          setHasError(true);
        }

        const bounds = leaflet.latLngBounds([]);
        for (const markerData of validMarkers) {
          const marker = leaflet
            .circleMarker([markerData.latitude, markerData.longitude], {
              radius: 9,
              color: '#ffffff',
              weight: 3,
              fillColor: markerColor(markerData.status),
              fillOpacity: 0.95
            })
            .addTo(map);

          marker.bindTooltip(markerData.label, { direction: 'top', offset: [0, -8] });
          if (markerData.href) {
            marker.on('click', () => window.location.assign(markerData.href as string));
          }
          bounds.extend([markerData.latitude, markerData.longitude]);
        }

        if (validMarkers.length > 1 && bounds.isValid()) {
          map.fitBounds(bounds.pad(0.25));
        } else if (validMarkers.length === 1) {
          map.setView([validMarkers[0].latitude, validMarkers[0].longitude], singleMarkerZoom);
        }

        mapRef.current = map;
        window.setTimeout(() => {
          if (!disposed) map?.invalidateSize();
        }, 0);
        if (!disposed) setIsReady(true);
      })
      .catch(() => {
        if (!disposed) {
          setHasError(true);
          setIsReady(true);
        }
      });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [center.latitude, center.longitude, markers, singleMarkerZoom, zoom]);

  const firstMarker = markers.find(
    (marker) => validCoordinate(marker.latitude, -90, 90) !== null && validCoordinate(marker.longitude, -180, 180) !== null
  );
  const validMarkerCount = markers.filter(
    (marker) => validCoordinate(marker.latitude, -90, 90) !== null && validCoordinate(marker.longitude, -180, 180) !== null
  ).length;
  const firstLatitude = firstMarker ? Number(firstMarker.latitude) : null;
  const firstLongitude = firstMarker ? Number(firstMarker.longitude) : null;

  return (
    <div className={cn('relative isolate h-[360px] min-h-[300px] w-full overflow-hidden rounded-[var(--public-radius-card)] bg-[#d1fae5]', className)} data-testid="gis-map" data-marker-count={validMarkerCount}>
      <div ref={containerRef} className="absolute inset-0" aria-label={ariaLabel} role="application" />

      <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
        <div className="max-w-[min(100%,28rem)] rounded-[var(--public-radius-control)] border border-white/75 bg-white/92 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:px-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.14em] text-[var(--brand-primary)]">
            <MapPinned size={15} aria-hidden="true" />
            {mapTitle}
          </div>
          {privacyLabel ? <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{privacyLabel}</p> : null}
        </div>
        {firstLatitude !== null && firstLongitude !== null ? (
          <a
            href={externalMapUrl(firstLatitude, firstLongitude, externalZoom)}
            target="_blank"
            rel="noreferrer"
            aria-label="Mở bản đồ GIS trên OpenStreetMap"
            className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/75 bg-white/92 text-[var(--brand-primary)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        ) : null}
      </div>

      {!isReady ? <div className="absolute inset-0 z-[450] grid place-items-center bg-[#ecfdf5]/80 text-sm font-semibold text-[var(--brand-primary)]">Đang tải bản đồ GIS...</div> : null}
      {hasError ? <div className="absolute inset-x-3 bottom-3 z-[500] rounded-xl border border-rose-200 bg-white/95 px-4 py-3 text-sm text-rose-700 shadow-sm sm:inset-x-4 sm:bottom-4">Không thể tải nền bản đồ. Vui lòng thử lại khi có kết nối mạng.</div> : null}
      {isReady && !hasError && firstMarker === undefined ? <div className="absolute inset-x-3 bottom-3 z-[500] rounded-xl border border-white/75 bg-white/95 px-4 py-3 text-sm text-[var(--text-secondary)] shadow-sm sm:inset-x-4 sm:bottom-4">{emptyLabel}</div> : null}
    </div>
  );
}
