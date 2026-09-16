import { NextResponse } from 'next/server';

const coordinatePattern = /^\d+$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y: rawY } = await params;
  const y = rawY.replace(/\.png$/i, '');
  if (!coordinatePattern.test(z) || !coordinatePattern.test(x) || !coordinatePattern.test(y)) {
    return new NextResponse('Invalid map tile coordinates', { status: 400 });
  }

  const zoom = Number(z);
  const column = Number(x);
  const row = Number(y);
  const maxCoordinate = 2 ** zoom - 1;
  if (!Number.isInteger(zoom) || zoom < 0 || zoom > 19 || column > maxCoordinate || row > maxCoordinate) {
    return new NextResponse('Map tile coordinates out of range', { status: 400 });
  }

  try {
    const upstream = await fetch(`https://a.tile.openstreetmap.org/${zoom}/${column}/${row}.png`, {
      headers: { 'user-agent': 'AgriPassport map tile proxy/1.0' },
      next: { revalidate: 86400 }
    });
    if (!upstream.ok || !upstream.body) {
      return new NextResponse('Map tile unavailable', { status: upstream.status || 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        'cache-control': 'public, max-age=86400, stale-while-revalidate=604800',
        'content-type': upstream.headers.get('content-type') || 'image/png'
      }
    });
  } catch {
    return new NextResponse('Map tile unavailable', { status: 502 });
  }
}
