import { beforeEach, describe, expect, it, vi } from 'vitest';
import { agripassportNewsConfig } from '@/sites/agripassport/news';
import { htxonlineNewsConfig } from '@/sites/htxonline/news';
import { passportNewsConfig } from '@/sites/passport/news';
import { SiteNewsPage } from '@/sites/news/news-page';
import { generateSiteNewsMetadata } from '@/sites/news/news-detail-page';
import { brandizeSiteText } from '@/lib/page-metadata';
import { publicDisplayCopy } from '@/lib/public-copy';

const newsConfigs = [agripassportNewsConfig, passportNewsConfig, htxonlineNewsConfig] as const;

describe('separate public site entrypoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { data: [] } })
      })
    );
  });

  it('pins each news entrypoint to one unique site scope', () => {
    expect(newsConfigs.map((config) => config.siteKey)).toEqual(['agripassport', 'passport', 'htxonline']);
    expect(new Set(newsConfigs.map((config) => config.siteKey)).size).toBe(newsConfigs.length);
  });

  it.each(newsConfigs)('queries only the %s news scope', async (config) => {
    await SiteNewsPage({ config });

    const calls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    const expectedSiteKey = config.siteKey === 'passport' ? 'PASSPORT' : config.siteKey === 'htxonline' ? 'HTXONLINE' : 'AGRIPASSPORT';

    expect(calls).toHaveLength(1);
    expect(calls.every((url) => url.includes(`siteKey=${expectedSiteKey}`))).toBe(true);
    expect(calls.some((url) => url.includes('siteKey=PASSPORT') && expectedSiteKey !== 'PASSPORT')).toBe(false);
    expect(calls.some((url) => url.includes('siteKey=HTXONLINE') && expectedSiteKey !== 'HTXONLINE')).toBe(false);
    expect(calls.some((url) => url.includes('siteKey=AGRIPASSPORT') && expectedSiteKey !== 'AGRIPASSPORT')).toBe(false);
  });

  it.each(newsConfigs)('keeps article metadata lookup in the %s scope', async (config) => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: null })
    } as Response);

    await generateSiteNewsMetadata('bai-viet-demo', config);

    const url = String(vi.mocked(fetch).mock.calls[0][0]);
    const expectedSiteKey = config.siteKey === 'passport' ? 'PASSPORT' : config.siteKey === 'htxonline' ? 'HTXONLINE' : 'AGRIPASSPORT';
    expect(url).toContain(`/news/public/bai-viet-demo?siteKey=${expectedSiteKey}`);
  });

  it('keeps Passport copy readable without changing contact email addresses', () => {
    const text = brandizeSiteText('HỘ CHIẾU NÔNG NGHIỆP · Email Agripassport@gmail.com · HTX', 'passport');

    expect(text).toContain('Hộ chiếu nông nghiệp');
    expect(text).toContain('Agripassport@gmail.com');
    expect(text).toContain('hợp tác xã');
    expect(text).not.toContain('HỘ CHIẾU NÔNG NGHIỆP@gmail.com');
  });

  it('expands cooperative abbreviations only for Passport presentation', () => {
    expect(publicDisplayCopy('HTX Xoài Mỹ Xương', 'passport')).toBe('Hợp tác xã Xoài Mỹ Xương');
    expect(publicDisplayCopy('HTX Xoài Mỹ Xương', 'agripassport')).toBe('HTX Xoài Mỹ Xương');
  });
});
