import { describe, expect, it } from 'vitest';
import { authPortalFromHost, dashboardUrlForRoles, publicSiteKeyFromHost } from '@/lib/domain';

describe('host-bound auth portals', () => {
  it.each([
    ['admin.htxonline.vn', 'ADMIN'],
    ['htx.htxonline.vn', 'HTX'],
    ['htxonline.vn', 'HTX'],
    ['agripassport.com', 'AGRIPASSPORT'],
    ['hochieunongnghiep.com', 'PASSPORT']
  ])('maps %s to the %s portal', (host, portal) => {
    expect(authPortalFromHost(host)).toBe(portal);
  });

  it('keeps admin and HTX dashboard destinations separate', () => {
    expect(dashboardUrlForRoles(['SUPER_ADMIN'], 'https://admin.htxonline.vn', 'ADMIN')).toContain('admin.htxonline.vn');
    expect(dashboardUrlForRoles(['ADMIN_HTX'], 'https://htx.htxonline.vn', 'HTX')).toContain('htx.htxonline.vn');
    expect(dashboardUrlForRoles(['BUYER'], 'https://hochieunongnghiep.com', 'PASSPORT')).toContain('hochieunongnghiep.com');
  });

  it('treats internal HTX subdomains as the HTXONLINE public brand', () => {
    expect(publicSiteKeyFromHost('admin.htxonline.vn')).toBe('htxonline');
    expect(publicSiteKeyFromHost('htx.htxonline.vn')).toBe('htxonline');
  });
});
