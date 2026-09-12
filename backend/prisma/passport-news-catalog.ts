// Editorial taxonomy from “Mục tin tức phân loại - hochieunongnghiep.docx”.
// Keep this allow-list explicit so articles cannot silently cross public sites.
export const PASSPORT_NEWS_CATALOG = [
  { slug: 'truy-xuat-nguon-goc-la-gi-vi-sao-nong-san-can-minh-bach-thong-tin', category: 'truy-xuat-nguon-goc' },
  { slug: 'ma-qr-truy-xuat-nguon-goc-hoat-dong-nhu-the-nao', category: 'truy-xuat-nguon-goc' },
  { slug: '5-thong-tin-nguoi-tieu-dung-nen-kiem-tra-khi-mua-nong-san-co-ma-qr', category: 'truy-xuat-nguon-goc' },
  { slug: 'so-hoa-vung-trong-du-lieu-khu-vuc-san-xuat', category: 'chuyen-doi-so' },
  { slug: 'nhat-ky-san-xuat-dien-tu', category: 'chuyen-doi-so' },
  { slug: 'quan-ly-mua-vu-bang-du-lieu', category: 'chuyen-doi-so' },
  { slug: 'vi-sao-hop-tac-xa-can-so-hoa-du-lieu-san-pham', category: 'tin-htx' },
  { slug: 'chuyen-doi-so-giup-hop-tac-xa-quan-ly-san-xuat-hieu-qua-nhu-the-nao', category: 'tin-htx' },
  { slug: 'tu-san-xuat-den-thi-truong-hanh-trinh-so-hoa-cua-mot-hop-tac-xa', category: 'tin-htx' },
  { slug: 'nong-san-viet-can-gi-de-mo-rong-thi-truong-trong-nuoc-quoc-te', category: 'tin-thi-truong' },
  { slug: 'ocop-va-truy-xuat-nguon-goc-vi-sao-can-di-cung-nhau', category: 'tin-thi-truong' },
  { slug: 'tu-vung-san-xuat-den-nguoi-mua-vi-sao-du-lieu-ngay-cang-quan-trong', category: 'tin-thi-truong' },
  { slug: 'nong-san-so-la-gi-khi-san-pham-duoc-minh-bach-bang-du-lieu', category: 'kien-thuc-nong-nghiep' },
  { slug: 'ho-so-so-nong-san-gom-nhung-thong-tin-gi', category: 'kien-thuc-nong-nghiep' },
  { slug: 'tu-vung-trong-den-san-pham-du-lieu-tao-nen-gia-tri', category: 'kien-thuc-nong-nghiep' }
] as const;

export const PASSPORT_NEWS_SLUG_SET = new Set<string>(PASSPORT_NEWS_CATALOG.map((article) => article.slug));
export const PASSPORT_NEWS_CATEGORY_BY_SLUG = new Map<string, string>(PASSPORT_NEWS_CATALOG.map((article) => [article.slug, article.category]));
