import { API_URL, ApiEnvelope } from './api';

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type NewsArticle = {
  id: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyHtml: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
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

export async function fetchPublicNews(path = '/news/public?limit=12') {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (!response.ok) return { data: [] } satisfies NewsList;
    const body = (await response.json()) as ApiEnvelope<NewsList | NewsArticle[]>;
    return normalizeNewsList(body.data);
  } catch {
    return { data: [] } satisfies NewsList;
  }
}

export async function fetchPublicNewsCategories() {
  try {
    const response = await fetch(`${API_URL}/news/public/categories`, { cache: 'no-store' });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<NewsCategory[]>;
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicNewsDetail(slug: string) {
  try {
    const response = await fetch(`${API_URL}/news/public/${encodeURIComponent(slug)}`, { cache: 'no-store' });
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
  return article.seoDescription || article.excerpt || 'Tin tức HTXONLINE';
}

export function articleImage(article: NewsArticle) {
  return article.ogImageUrl || article.coverImageUrl || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80';
}
