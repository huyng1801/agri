export type PreparedNewsHeading = {
  id: string;
  level: 'h2' | 'h3';
  text: string;
};

export type PreparedNewsSection = {
  heading: PreparedNewsHeading;
  children: PreparedNewsHeading[];
};

export function groupNewsHeadings(headings: PreparedNewsHeading[]): PreparedNewsSection[] {
  const sections: PreparedNewsSection[] = [];
  for (const heading of headings) {
    if (heading.level === 'h2' || sections.length === 0) {
      sections.push({ heading, children: [] });
      continue;
    }
    sections[sections.length - 1].children.push(heading);
  }
  return sections;
}

export function newsHeadingLabel(heading: PreparedNewsHeading) {
  return heading.text.replace(/^\s*\d+(?:\.\d+)*[.)]?\s+/, '');
}

export function withoutContactBlock(html: string) {
  return html.replace(/<section\b[^>]*data-agri-contact[^>]*>[\s\S]*?<\/section>/gi, '');
}

export function withoutGeneratedPrimaryLink(html: string) {
  return html.replace(/<p\b[^>]*>\s*<a\b([^>]*)>([\s\S]*?)<\/a>\s*<\/p>/gi, (paragraph, attributes: string, labelHtml: string) => {
    const rawHref = attributes.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || '';
    const href = rawHref.replace(/&amp;/gi, '&');
    const label = labelHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/&quot;|&#34;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim();
    const isProductsLink = /^\/san-pham(?:[/?#]|$)/i.test(href);
    const isGeneratedLabel = label === 'Khám phá thêm sản phẩm và hợp tác xã trên Agripassport'
      || /^Xem thêm sản phẩm liên quan\s*["“].+["”]$/i.test(label);

    return isProductsLink && isGeneratedLabel ? '' : paragraph;
  });
}

export function visibleArticleAuthor(author: string | null | undefined, siteName: string) {
  const name = author?.trim();
  if (!name || /^super\s*admin$/i.test(name)) return null;

  const normalizedName = normalizeBrandName(name);
  const normalizedSiteName = normalizeBrandName(siteName);
  const genericBrandNames = new Set(['agripassport', 'htxonline', 'hochieunongnghiep']);
  if (normalizedName === normalizedSiteName || genericBrandNames.has(normalizedName)) return null;

  return name;
}

export function prepareNewsBody(html: string) {
  const headings: PreparedNewsHeading[] = [];
  const usedIds = new Set<string>();
  const preparedHtml = html.replace(/<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (_match, level: string, attributes = '', innerHtml: string) => {
    const text = innerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const baseId = `muc-${slugify(text) || headings.length + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    headings.push({ id, level: level.toLowerCase() as 'h2' | 'h3', text });
    const withoutId = attributes.replace(/\s+id\s*=\s*("[^"]*"|'[^']*')/i, '');
    return `<${level}${withoutId} id="${id}">${innerHtml}</${level}>`;
  });
  return { html: preparedHtml, headings };
}

function normalizeBrandName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72);
}
