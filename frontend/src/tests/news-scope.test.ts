import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicNews, fetchPublicNewsCategories, fetchPublicNewsDetail } from '@/lib/news';

describe('public news site scope', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'ok', data: { data: [] } })
      })
    );
  });

  it('adds the requested site to list and category queries', async () => {
    await fetchPublicNews('/news/public?limit=12', 'passport');
    await fetchPublicNewsCategories('htxonline');

    const calls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(calls[0]).toContain('siteKey=PASSPORT');
    expect(calls[1]).toContain('siteKey=HTXONLINE');
  });

  it('keeps article detail scoped to the current site', async () => {
    await fetchPublicNewsDetail('bai-viet-demo', 'agripassport');

    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('siteKey=AGRIPASSPORT');
  });
});
