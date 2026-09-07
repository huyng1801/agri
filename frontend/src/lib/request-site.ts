import { headers } from 'next/headers';
import { type PublicSiteKey, normalizeHostname, publicOriginFromHost, publicSiteKeyFromHost } from './domain';

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export async function getRequestHostname() {
  try {
    const headerStore = await headers();
    return normalizeHostname(headerStore.get('x-forwarded-host') || headerStore.get('host') || '');
  } catch {
    // Server components can also be called directly by unit tests without a request store.
    return '';
  }
}

export async function getRequestPublicSiteKey(): Promise<PublicSiteKey> {
  return publicSiteKeyFromHost(await getRequestHostname());
}

export async function getRequestPublicOrigin() {
  return publicOriginFromHost(await getRequestHostname());
}

export async function getRequestAbsoluteUrl(path = '/') {
  return `${await getRequestPublicOrigin()}${normalizePath(path)}`;
}
