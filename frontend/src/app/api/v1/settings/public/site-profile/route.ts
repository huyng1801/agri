import { NextRequest, NextResponse } from 'next/server';
import { defaultPublicSiteProfileForSite } from '@/lib/public-site';
import { publicSiteKeyFromHost } from '@/lib/domain';

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const siteKey = publicSiteKeyFromHost(host);
  const profile = defaultPublicSiteProfileForSite(siteKey);

  return NextResponse.json({
    success: true,
    message: 'Site profile retrieved',
    data: profile
  });
}
