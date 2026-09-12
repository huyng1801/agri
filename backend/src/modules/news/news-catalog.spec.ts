import { PASSPORT_EDITORIAL_NEWS_ARTICLES } from '../../../prisma/editorial-news-passport';
import { PASSPORT_NEWS_CATALOG, PASSPORT_NEWS_SLUG_SET } from '../../../prisma/passport-news-catalog';
import { preparePassportNewsBody } from '../../../prisma/passport-news-content';
import { PASSPORT_PRODUCTION_ARTICLES, passportNewsCoverUrl } from '../../../prisma/passport-news-production';

describe('Passport editorial catalog', () => {
  it('keeps the 15 articles from the supplied taxonomy', () => {
    expect(PASSPORT_NEWS_CATALOG.map((article) => article.slug)).toEqual([
      'truy-xuat-nguon-goc-la-gi-vi-sao-nong-san-can-minh-bach-thong-tin',
      'ma-qr-truy-xuat-nguon-goc-hoat-dong-nhu-the-nao',
      '5-thong-tin-nguoi-tieu-dung-nen-kiem-tra-khi-mua-nong-san-co-ma-qr',
      'so-hoa-vung-trong-du-lieu-khu-vuc-san-xuat',
      'nhat-ky-san-xuat-dien-tu',
      'quan-ly-mua-vu-bang-du-lieu',
      'vi-sao-hop-tac-xa-can-so-hoa-du-lieu-san-pham',
      'chuyen-doi-so-giup-hop-tac-xa-quan-ly-san-xuat-hieu-qua-nhu-the-nao',
      'tu-san-xuat-den-thi-truong-hanh-trinh-so-hoa-cua-mot-hop-tac-xa',
      'nong-san-viet-can-gi-de-mo-rong-thi-truong-trong-nuoc-quoc-te',
      'ocop-va-truy-xuat-nguon-goc-vi-sao-can-di-cung-nhau',
      'tu-vung-san-xuat-den-nguoi-mua-vi-sao-du-lieu-ngay-cang-quan-trong',
      'nong-san-so-la-gi-khi-san-pham-duoc-minh-bach-bang-du-lieu',
      'ho-so-so-nong-san-gom-nhung-thong-tin-gi',
      'tu-vung-trong-den-san-pham-du-lieu-tao-nen-gia-tri'
    ]);
    expect(PASSPORT_NEWS_CATALOG).toHaveLength(15);
    expect(PASSPORT_NEWS_SLUG_SET.size).toBe(15);
    expect(PASSPORT_PRODUCTION_ARTICLES).toHaveLength(15);
    expect(new Set(PASSPORT_PRODUCTION_ARTICLES.map((article) => article.slug)).size).toBe(15);
    expect(Object.fromEntries(
      [...new Set(PASSPORT_NEWS_CATALOG.map((article) => article.category))]
        .map((category) => [category, PASSPORT_NEWS_CATALOG.filter((article) => article.category === category).length])
    )).toEqual({
      'truy-xuat-nguon-goc': 3,
      'chuyen-doi-so': 3,
      'tin-htx': 3,
      'tin-thi-truong': 3,
      'kien-thuc-nong-nghiep': 3
    });
  });

  it('contains complete source-backed fields for every published article', () => {
    for (const article of PASSPORT_PRODUCTION_ARTICLES) {
      expect(PASSPORT_NEWS_SLUG_SET.has(article.slug)).toBe(true);
      expect(article.title.trim()).not.toBe('');
      expect(article.excerpt.trim()).not.toBe('');
      expect(article.focusKeyword.trim()).not.toBe('');
      expect(article.seoDescription.trim()).not.toBe('');
      expect(article.bodyHtml).toContain('<p>');
      expect(article.bodyHtml).toContain('</p>');
      expect(article.coverKey.trim()).not.toBe('');
      expect(passportNewsCoverUrl(article.coverKey)).toMatch(/^\/news\/.+\.webp$/);
      const publicBody = preparePassportNewsBody(article.bodyHtml);
      expect(publicBody).not.toMatch(/agripassport\.com|\bagripassport\b|\bhtxonline\b/i);
    }
  });

  it('rewrites public cross-site references without changing the article structure', () => {
    const body = preparePassportNewsBody('<p>Agripassport and HTXONLINE: https://agripassport.com/</p>');
    expect(body).toBe('<p>Hộ chiếu nông nghiệp and lớp quản trị nội bộ: https://hochieunongnghiep.com</p>');
  });

  it('keeps the four Passport articles added from the missing source documents', () => {
    expect(PASSPORT_EDITORIAL_NEWS_ARTICLES).toHaveLength(4);
    for (const article of PASSPORT_EDITORIAL_NEWS_ARTICLES) {
      expect(PASSPORT_NEWS_SLUG_SET.has(article.slug)).toBe(true);
      expect(PASSPORT_PRODUCTION_ARTICLES.some((item) => item.slug === article.slug)).toBe(true);
    }
  });
});
