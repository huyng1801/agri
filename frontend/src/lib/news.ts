import { API_URL, ApiEnvelope } from './api';
import type { PublicSiteKey } from './domain';

export type NewsSiteKey = 'AGRIPASSPORT' | 'PASSPORT' | 'HTXONLINE';

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export const PUBLIC_NEWS_TOPICS = [
  { label: 'Truy xuất', slug: 'truy-xuat', categorySlugs: ['truy-xuat-nguon-goc', 'truy-xuat'] },
  { label: 'Chuyển đổi số', slug: 'chuyen-doi-so', categorySlugs: ['chuyen-doi-so'] },
  { label: 'Hợp tác xã', slug: 'hop-tac-xa', categorySlugs: ['hop-tac-xa', 'tin-htx', 'hop-tac'] },
  { label: 'Thị trường', slug: 'thi-truong', categorySlugs: ['tin-thi-truong', 'thi-truong'] },
  {
    label: 'Kiến thức',
    slug: 'kien-thuc',
    categorySlugs: ['kien-thuc', 'kien-thuc-nong-nghiep', 'cau-chuyen-san-pham', 'san-pham', 'nong-nghiep']
  }
] as const;

export type PublicNewsTopic = (typeof PUBLIC_NEWS_TOPICS)[number];

export type NewsTopicCategoryOption = {
  topic: PublicNewsTopic;
  category: NewsCategory;
};

const topicByCategorySlug = new Map<string, PublicNewsTopic>(
  PUBLIC_NEWS_TOPICS.flatMap((topic) => topic.categorySlugs.map((slug) => [slug, topic] as const))
);

export type NewsArticle = {
  id: string;
  siteKey?: NewsSiteKey;
  categoryId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyHtml: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  publicVerified: boolean;
  isFeatured: boolean;
  showOnHome: boolean;
  focusKeyword?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  robotsNoIndex: boolean;
  robotsNoFollow: boolean;
  schemaType: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageUrl?: string | null;
  tagsJson?: string[];
  seoScore: number;
  readabilityScore: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: NewsCategory | null;
  author?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
};

export type NewsList = {
  data: NewsArticle[];
  meta?: Record<string, unknown>;
};

export async function fetchPublicNews(path = '/news/public?limit=12', siteKey: PublicSiteKey = 'agripassport') {
  try {
    const response = await fetch(`${API_URL}${withNewsSite(path, siteKey)}`, { cache: 'no-store' });
    if (!response.ok) return { data: [] } satisfies NewsList;
    const body = (await response.json()) as ApiEnvelope<NewsList | NewsArticle[]>;
    return normalizeNewsList(body.data);
  } catch {
    return { data: [] } satisfies NewsList;
  }
}

export async function fetchPublicNewsCategories(siteKey: PublicSiteKey = 'agripassport') {
  try {
    const response = await fetch(`${API_URL}/news/public/categories${withNewsSite('', siteKey)}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<NewsCategory[]>;
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}

export function publicNewsCategoryLabel(category?: Pick<NewsCategory, 'slug' | 'name'> | null) {
  if (!category) return null;
  return topicByCategorySlug.get(category.slug)?.label ?? null;
}

export function publicNewsTopicForCategorySlug(slug?: string | null) {
  return slug ? topicByCategorySlug.get(slug) ?? null : null;
}

export function newsTopicCategoryOptions(categories: readonly NewsCategory[]): NewsTopicCategoryOption[] {
  return PUBLIC_NEWS_TOPICS.flatMap((topic) => {
    const category = topic.categorySlugs
      .map((slug) => categories.find((item) => item.slug === slug && item.isActive))
      .find((item): item is NewsCategory => Boolean(item));
    return category ? [{ topic, category }] : [];
  });
}

export function displayedNewsTopicCategoryId(
  categoryId: string,
  categories: readonly NewsCategory[],
  topicOptions: readonly NewsTopicCategoryOption[]
) {
  if (!categoryId) return '';
  const category = categories.find((item) => item.id === categoryId);
  const topic = publicNewsTopicForCategorySlug(category?.slug);
  return topicOptions.find((option) => option.topic.slug === topic?.slug)?.category.id ?? '';
}

export async function fetchPublicNewsDetail(slug: string, siteKey: PublicSiteKey = 'agripassport') {
  try {
    const response = await fetch(`${API_URL}/news/public/${encodeURIComponent(slug)}${withNewsSite('', siteKey)}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<NewsArticle>;
    return body.data;
  } catch {
    return null;
  }
}

export function normalizeNewsList(payload: NewsList | NewsArticle[] | undefined | null): NewsList {
  if (Array.isArray(payload)) return { data: payload };
  if (payload && Array.isArray(payload.data)) return payload;
  return { data: [] };
}

export function articleTitle(article: NewsArticle) {
  return article.seoTitle || article.title;
}

export function articleDescription(article: NewsArticle) {
  return article.seoDescription || article.excerpt || 'Tin tức và cập nhật nông nghiệp';
}

function withNewsSite(path: string, siteKey: PublicSiteKey) {
  const normalizedSite = siteKey === 'passport' ? 'PASSPORT' : siteKey === 'htxonline' ? 'HTXONLINE' : 'AGRIPASSPORT';
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}siteKey=${normalizedSite}`;
}

export function articleImage(article: NewsArticle) {
  return article.ogImageUrl || article.coverImageUrl || '/public-media-placeholder.svg';
}
