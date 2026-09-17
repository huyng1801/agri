import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  displayedNewsTopicCategoryId,
  fetchPublicNews,
  fetchPublicNewsCategories,
  fetchPublicNewsDetail,
  newsTopicCategoryOptions,
  publicNewsCategoryLabel,
  PUBLIC_NEWS_TOPICS,
  type NewsCategory
} from '@/lib/news';
import { PASSPORT_NEWS_PLAN } from '@/lib/passport-news-plan';

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

describe('short public news topics', () => {
  const expectedLabels = ['Truy xuất', 'Chuyển đổi số', 'Hợp tác xã', 'Thị trường', 'Kiến thức'];

  it('uses the same five concise topics across the public news sites', () => {
    expect(PUBLIC_NEWS_TOPICS.map((topic) => topic.label)).toEqual(expectedLabels);
    expect(new Set(PASSPORT_NEWS_PLAN.map((item) => item.category))).toEqual(new Set(expectedLabels));
  });

  it.each([
    ['truy-xuat', 'Truy xuất'],
    ['truy-xuat-nguon-goc', 'Truy xuất'],
    ['chuyen-doi-so', 'Chuyển đổi số'],
    ['hop-tac-xa', 'Hợp tác xã'],
    ['hop-tac', 'Hợp tác xã'],
    ['tin-htx', 'Hợp tác xã'],
    ['thi-truong', 'Thị trường'],
    ['tin-thi-truong', 'Thị trường'],
    ['cau-chuyen-san-pham', 'Kiến thức'],
    ['kien-thuc', 'Kiến thức'],
    ['kien-thuc-nong-nghiep', 'Kiến thức'],
    ['nong-nghiep', 'Kiến thức'],
    ['san-pham', 'Kiến thức']
  ])('normalizes legacy category %s to %s', (slug, label) => {
    expect(publicNewsCategoryLabel({ slug, name: `Tên dài ${slug}` })).toBe(label);
  });

  it('omits unknown legacy/test categories and deduplicates aliases into five options', () => {
    const categories: NewsCategory[] = [
      { id: 'trace-short', name: 'Truy xuất', slug: 'truy-xuat', sortOrder: 0, isActive: true },
      { id: 'trace-long', name: 'Truy xuất nguồn gốc', slug: 'truy-xuat-nguon-goc', sortOrder: 0, isActive: true },
      { id: 'digital', name: 'Chuyển đổi số', slug: 'chuyen-doi-so', sortOrder: 0, isActive: true },
      { id: 'cooperative-short', name: 'Hợp tác', slug: 'hop-tac', sortOrder: 0, isActive: true },
      { id: 'cooperative', name: 'Tin HTX', slug: 'tin-htx', sortOrder: 0, isActive: true },
      { id: 'market-short', name: 'Thị trường', slug: 'thi-truong', sortOrder: 0, isActive: true },
      { id: 'market', name: 'Tin thị trường', slug: 'tin-thi-truong', sortOrder: 0, isActive: true },
      { id: 'knowledge-short', name: 'Câu chuyện sản phẩm', slug: 'cau-chuyen-san-pham', sortOrder: 0, isActive: true },
      { id: 'knowledge', name: 'Kiến thức nông nghiệp', slug: 'kien-thuc-nong-nghiep', sortOrder: 0, isActive: true },
      { id: 'test-category', name: 'E2E News Category Edited MTN9PSZD', slug: 'e2e-news-category-edited', sortOrder: 0, isActive: true }
    ];
    const options = newsTopicCategoryOptions(categories);

    expect(options.map((option) => option.topic.label)).toEqual(expectedLabels);
    expect(options.map((option) => option.category.id)).toEqual(['trace-long', 'digital', 'cooperative', 'market', 'knowledge']);
    expect(displayedNewsTopicCategoryId('trace-short', categories, options)).toBe('trace-long');
    expect(displayedNewsTopicCategoryId('test-category', categories, options)).toBe('');
    expect(publicNewsCategoryLabel({ slug: 'e2e-news-category-edited', name: 'E2E News Category Edited MTN9PSZD' })).toBeNull();
  });
});
