import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '@/proxy';

function makeRequest(url: string, host: string) {
  return new NextRequest(url, {
    headers: {
      host,
      'x-forwarded-host': host
    }
  });
}

describe('public host proxy rules', () => {
  it('keeps HTXONLINE catalog pages on the same host', () => {
    const productsResponse = proxy(makeRequest('https://htxonline.vn/san-pham', 'htxonline.vn'));
    const cooperativesResponse = proxy(makeRequest('https://htxonline.vn/htx', 'htxonline.vn'));

    expect(productsResponse.headers.get('location')).toBeNull();
    expect(productsResponse.headers.get('x-middleware-next')).toBe('1');
    expect(cooperativesResponse.headers.get('location')).toBeNull();
    expect(cooperativesResponse.headers.get('x-middleware-next')).toBe('1');
  });

  it('still redirects HTXONLINE checkout routes to the marketplace host', () => {
    const checkoutResponse = proxy(makeRequest('https://htxonline.vn/gio-hang', 'htxonline.vn'));

    expect(checkoutResponse.status).toBe(308);
    expect(checkoutResponse.headers.get('location')).toBe('https://agripassport.com/gio-hang');
  });

  it('keeps QR catalog pages on the passport host and redirects commerce only', () => {
    const catalogResponse = proxy(
      makeRequest('https://hochieunongnghiep.com/san-pham?hasQr=true', 'hochieunongnghiep.com')
    );
    const checkoutResponse = proxy(
      makeRequest('https://hochieunongnghiep.com/gio-hang', 'hochieunongnghiep.com')
    );

    expect(catalogResponse.headers.get('location')).toBeNull();
    expect(catalogResponse.headers.get('x-middleware-next')).toBe('1');
    expect(checkoutResponse.status).toBe(308);
    expect(checkoutResponse.headers.get('location')).toBe('https://agripassport.com/gio-hang');
  });
});
