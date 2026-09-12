export type SeedNewsSiteKey = 'AGRIPASSPORT' | 'PASSPORT' | 'HTXONLINE';

export type SeedNewsSlugRecord = {
  slug: string;
  siteKey: SeedNewsSiteKey;
  title: string;
};

type ResolveNewsSeedSlugInput = {
  requestedSlug: string;
  title: string;
  siteKey: SeedNewsSiteKey;
  existingBySlug?: SeedNewsSlugRecord | null;
  existingBySiteTitle?: Pick<SeedNewsSlugRecord, 'slug'> | null;
  occupiedSlugs?: ReadonlySet<string>;
};

/** Keep globally unique slugs while preserving records owned by another public site. */
export function resolveNewsSeedSlug({
  requestedSlug,
  title,
  siteKey,
  existingBySlug,
  existingBySiteTitle,
  occupiedSlugs = new Set<string>()
}: ResolveNewsSeedSlugInput) {
  if (existingBySiteTitle?.slug) return existingBySiteTitle.slug;
  if (existingBySlug?.siteKey === siteKey && existingBySlug.title === title) return existingBySlug.slug;
  if (!existingBySlug) return requestedSlug;

  const scopeSuffix = siteKey === 'PASSPORT' ? 'ho-chieu' : siteKey.toLowerCase();
  const scopedBase = `${requestedSlug}-${scopeSuffix}`;
  let candidate = scopedBase;
  let index = 2;
  while (occupiedSlugs.has(candidate)) {
    candidate = `${scopedBase}-${index}`;
    index += 1;
  }
  return candidate;
}
