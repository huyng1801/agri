import { describe, expect, it } from 'vitest';
import { groupNewsHeadings, newsHeadingLabel, prepareNewsBody, visibleArticleAuthor, withoutGeneratedPrimaryLink } from '@/lib/news-article-content';

describe('public news article content', () => {
  it('removes the generated product CTA while preserving reader-authored links', () => {
    const html = [
      '<p>Nội dung bài viết.</p>',
      '<p><a href="/san-pham">Khám phá thêm sản phẩm và hợp tác xã trên Agripassport</a></p>',
      '<p><a href="/san-pham/dua-vang">Xem sản phẩm dứa vàng</a></p>'
    ].join('');

    expect(withoutGeneratedPrimaryLink(html)).toBe([
      '<p>Nội dung bài viết.</p>',
      '<p><a href="/san-pham/dua-vang">Xem sản phẩm dứa vàng</a></p>'
    ].join(''));
  });

  it('removes the keyword-based generated CTA even when its query and text are HTML-escaped', () => {
    const html = '<p><a href="/san-pham?search=xoai&amp;loai=my">Xem thêm sản phẩm liên quan &quot;xoài Mỹ&quot;</a></p>';

    expect(withoutGeneratedPrimaryLink(html)).toBe('');
  });

  it('does not show an admin or site brand as a person author', () => {
    expect(visibleArticleAuthor(undefined, 'Hộ chiếu nông nghiệp')).toBeNull();
    expect(visibleArticleAuthor('Super Admin', 'Hộ chiếu nông nghiệp')).toBeNull();
    expect(visibleArticleAuthor('HỘ CHIẾU NÔNG NGHIỆP', 'Hộ chiếu nông nghiệp')).toBeNull();
    expect(visibleArticleAuthor('Nguyễn Thị Lan', 'Hộ chiếu nông nghiệp')).toBe('Nguyễn Thị Lan');
  });

  it('assigns stable unique anchors for nested and repeated headings', () => {
    const prepared = prepareNewsBody('<h2 id="old">1. Truy xuất nguồn gốc</h2><h3>Cách thực hiện</h3><h2>1. Truy xuất nguồn gốc</h2>');

    expect(prepared.headings).toEqual([
      { id: 'muc-1-truy-xuat-nguon-goc', level: 'h2', text: '1. Truy xuất nguồn gốc' },
      { id: 'muc-cach-thuc-hien', level: 'h3', text: 'Cách thực hiện' },
      { id: 'muc-1-truy-xuat-nguon-goc-2', level: 'h2', text: '1. Truy xuất nguồn gốc' }
    ]);
    expect(prepared.html).toContain('id="muc-1-truy-xuat-nguon-goc"');
    expect(prepared.html).not.toContain('id="old"');
  });

  it('groups H3 entries under their H2 and leaves numbering to the ordered outline', () => {
    const { headings } = prepareNewsBody('<h2>1. Truy xuất nguồn gốc là gì?</h2><h3>1.1. Dữ liệu vùng trồng</h3><h3>1.2. Nhật ký canh tác</h3><h2>2. Lợi ích cho hợp tác xã</h2>');
    const sections = groupNewsHeadings(headings);

    expect(sections).toHaveLength(2);
    expect(sections[0].children.map(newsHeadingLabel)).toEqual(['Dữ liệu vùng trồng', 'Nhật ký canh tác']);
    expect(newsHeadingLabel(sections[0].heading)).toBe('Truy xuất nguồn gốc là gì?');
    expect(sections[1].children).toEqual([]);
  });
});
