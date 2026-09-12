import { resolveNewsSeedSlug } from './news-seed-slug';

describe('resolveNewsSeedSlug', () => {
  const agripassportArticle = {
    slug: 'truy-xuat-nguon-goc-la-gi',
    title: 'Truy xuất nguồn gốc là gì?'
  };

  it('does not take a slug owned by another public site', () => {
    expect(resolveNewsSeedSlug({
      ...agripassportArticle,
      requestedSlug: agripassportArticle.slug,
      siteKey: 'PASSPORT',
      existingBySlug: { ...agripassportArticle, siteKey: 'AGRIPASSPORT' }
    })).toBe('truy-xuat-nguon-goc-la-gi-ho-chieu');
  });

  it('keeps the existing Passport slug on repeated seeds', () => {
    expect(resolveNewsSeedSlug({
      ...agripassportArticle,
      requestedSlug: agripassportArticle.slug,
      siteKey: 'PASSPORT',
      existingBySlug: { ...agripassportArticle, slug: 'truy-xuat-nguon-goc-la-gi-ho-chieu', siteKey: 'PASSPORT' },
      existingBySiteTitle: { slug: 'truy-xuat-nguon-goc-la-gi-ho-chieu' }
    })).toBe('truy-xuat-nguon-goc-la-gi-ho-chieu');
  });

  it('skips an occupied scoped slug without touching the foreign row', () => {
    expect(resolveNewsSeedSlug({
      ...agripassportArticle,
      requestedSlug: agripassportArticle.slug,
      siteKey: 'PASSPORT',
      existingBySlug: { ...agripassportArticle, siteKey: 'AGRIPASSPORT' },
      occupiedSlugs: new Set(['truy-xuat-nguon-goc-la-gi-ho-chieu'])
    })).toBe('truy-xuat-nguon-goc-la-gi-ho-chieu-2');
  });

  it('uses the requested slug when it is not occupied', () => {
    expect(resolveNewsSeedSlug({
      ...agripassportArticle,
      requestedSlug: agripassportArticle.slug,
      siteKey: 'PASSPORT'
    })).toBe(agripassportArticle.slug);
  });
});
