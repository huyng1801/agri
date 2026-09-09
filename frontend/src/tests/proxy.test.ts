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

  it('does not expose commerce routes through the public host proxy', () => {
    const checkoutResponse = proxy(makeRequest('https://htxonline.vn/gio-hang', 'htxonline.vn'));

    expect(checkoutResponse.headers.get('location')).toBeNull();
    expect(checkoutResponse.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps QR catalog pages on the passport host without redirecting commerce', () => {
    const catalogResponse = proxy(
      makeRequest('https://hochieunongnghiep.com/san-pham?hasQr=true', 'hochieunongnghiep.com')
    );
    const checkoutResponse = proxy(
      makeRequest('https://hochieunongnghiep.com/gio-hang', 'hochieunongnghiep.com')
    );

    expect(catalogResponse.headers.get('location')).toBeNull();
    expect(catalogResponse.headers.get('x-middleware-next')).toBe('1');
    expect(checkoutResponse.headers.get('location')).toBeNull();
    expect(checkoutResponse.headers.get('x-middleware-next')).toBe('1');
  });

  it('keeps the Agripassport public flow informational instead of exposing commerce pages', () => {
    const cartResponse = proxy(makeRequest('https://agripassport.com/gio-hang', 'agripassport.com'));
    const guideResponse = proxy(makeRequest('https://agripassport.com/huong-dan-mua-hang', 'agripassport.com'));

    expect(cartResponse.headers.get('location')).toBeNull();
    expect(cartResponse.headers.get('x-middleware-next')).toBe('1');
    expect(guideResponse.headers.get('location')).toBeNull();
    expect(guideResponse.headers.get('x-middleware-next')).toBe('1');
  });

  it('removes Facebook click tracking without dropping functional query params', () => {
    const response = proxy(
      makeRequest('https://agripassport.com/san-pham?hasQr=true&fbclid=facebook-click-id', 'agripassport.com')
    );

    expect(response.headers.get('location')).toBe('https://agripassport.com/san-pham?hasQr=true');
  });
});
