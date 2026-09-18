import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, ChevronDown, Clock3, Eye, List } from 'lucide-react';
import { EmptyPublicState, NewsCard } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { articleDescription, articleImage, articleTitle, fetchPublicNews, fetchPublicNewsDetail, publicNewsCategoryLabel, type NewsArticle } from '@/lib/news';
import { formatDate } from '@/lib/format';
import { getPublicSiteProfile } from '@/lib/public-site';
import { brandizeSiteText } from '@/lib/page-metadata';
import { getRequestAbsoluteUrl } from '@/lib/request-site';
import { groupNewsHeadings, newsHeadingLabel, prepareNewsBody, visibleArticleAuthor, withoutContactBlock, withoutDuplicateCoverImage, withoutGeneratedPrimaryLink } from '@/lib/news-article-content';
import { Badge, Panel } from '@/components/ui';
import type { SiteNewsConfig } from './news-page';

type SiteNewsDetailPageProps = {
  params: Promise<{ slug: string }>;
  config: SiteNewsConfig;
};

export async function generateSiteNewsMetadata(slug: string, config: SiteNewsConfig): Promise<Metadata> {
  const article = await fetchPublicNewsDetail(slug, config.siteKey);
  if (!article) return { title: 'Không tìm thấy bài viết', robots: { index: false, follow: true } };

  const title = articleTitle(article);
  const description = articleDescription(article);
  const canonical = article.canonicalUrl || (await getRequestAbsoluteUrl(`/tin-tuc/${article.slug}`));
  const image = articleImage(article);
  const keywords = article.tagsJson?.length
    ? article.tagsJson
    : [article.focusKeyword, article.category?.name, config.siteName].filter((value): value is string => Boolean(value));

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: !article.robotsNoIndex, follow: !article.robotsNoFollow },
    openGraph: {
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      url: canonical,
      siteName: config.siteName,
      locale: 'vi_VN',
      type: 'article',
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: article.author?.fullName && !/^super\s*admin$/i.test(article.author.fullName) ? [article.author.fullName] : undefined,
      images: [{ url: article.ogImageUrl || image, alt: article.coverImageAlt || article.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.twitterTitle || article.ogTitle || title,
      description: article.twitterDescription || article.ogDescription || description,
      images: [article.twitterImageUrl || article.ogImageUrl || image]
    },
    category: publicNewsCategoryLabel(article.category) || undefined
  };
}

export async function SiteNewsDetailPage({ params, config }: SiteNewsDetailPageProps) {
  const { slug } = await params;
  const article = await fetchPublicNewsDetail(slug, config.siteKey);
  const siteProfile = await getPublicSiteProfile(config.siteKey);

  if (!article) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl">
          <PublicBreadcrumb href="/tin-tuc" label="Quay lại tin tức" />
          <div className="public-empty-detail space-y-4">
            <EmptyPublicState headingLevel="h1" title="Không tìm thấy bài viết" description="Bài viết chưa được đăng công khai hoặc đã bị ẩn khỏi trang công khai." />
            <Panel className="text-center">
              <h2 className="text-lg font-bold text-ink">Tiếp tục khám phá nội dung công khai</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Bạn có thể quay về danh sách tin tức hoặc xem thêm sản phẩm đang hiển thị trên nền tảng công khai.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href="/tin-tuc" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white">Xem tin tức mới</Link>
                <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink">Xem sản phẩm công khai</Link>
              </div>
            </Panel>
          </div>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const related = await getRelatedArticles(article, config);
  const canonical = article.canonicalUrl || (await getRequestAbsoluteUrl(`/tin-tuc/${article.slug}`));
  const logoUrl = await getRequestAbsoluteUrl('/logo.png');
  const image = articleImage(article);
  const articleCoverUrl = article.coverImageUrl || image;
  const preparedBody = prepareNewsBody(withoutDuplicateCoverImage(withoutGeneratedPrimaryLink(withoutContactBlock(article.bodyHtml)), articleCoverUrl));
  const tocSections = groupNewsHeadings(preparedBody.headings);
  const authorName = visibleArticleAuthor(article.author?.fullName, siteProfile.appName);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': article.schemaType || 'NewsArticle',
    headline: article.title,
    description: articleDescription(article),
    image: [image],
    keywords: article.tagsJson?.join(', ') || article.focusKeyword || undefined,
    articleSection: publicNewsCategoryLabel(article.category) || undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: canonical,
    author: authorName
      ? { '@type': 'Person', name: authorName }
      : { '@type': 'Organization', name: siteProfile.appName },
    publisher: { '@type': 'Organization', name: siteProfile.appName, logo: { '@type': 'ImageObject', url: logoUrl } }
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <PublicDetailMain className="max-w-6xl">
        <PublicBreadcrumb href="/tin-tuc" label="Quay lại tin tức" />
        <article className="public-news-detail overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
          <header className="mx-auto max-w-4xl px-4 pb-5 pt-2 text-center sm:px-8 sm:pb-7">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {publicNewsCategoryLabel(article.category) && <Badge className="bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">{publicNewsCategoryLabel(article.category)}</Badge>}
              <span className="inline-flex items-center gap-1 tracking-normal"><Calendar size={14} />{formatDate(article.publishedAt || article.createdAt)}</span>
              <span className="inline-flex items-center gap-1 tracking-normal"><Clock3 size={14} />{readingTime(article.bodyHtml)} phút đọc</span>
              <span className="inline-flex items-center gap-1 tracking-normal"><Eye size={14} />{article.viewCount} lượt xem</span>
            </div>
            <h1 className="mt-4 text-balance text-[1.9rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-ink sm:text-[3.25rem]">{article.title}</h1>
            <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-slate-600 sm:text-[1.12rem] sm:leading-8">{article.excerpt || article.seoDescription || brandizeSiteText(config.cardDescription, config.siteKey)}</p>
            {authorName && <p className="mt-3 text-sm font-medium text-slate-500">{authorName}</p>}
          </header>
          <div className="px-2.5 sm:px-4"><PublicImage src={article.coverImageUrl || image} alt={article.coverImageAlt || article.title} fallback={DEFAULT_NEWS_IMAGE} wrapperClassName="aspect-[16/9] w-full rounded-[1.45rem] border border-[var(--border)] bg-[var(--brand-primary-subtle)] sm:aspect-[2.1/1]" className="h-full w-full object-cover" /></div>
          <div className="mx-auto max-w-3xl px-4 py-7 sm:px-8 sm:py-10">
            {preparedBody.headings.length > 1 && (
              <details data-testid="news-toc" className="news-toc group mb-7 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 outline-none transition hover:bg-[var(--brand-primary-subtle)]/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-primary)]/30 sm:px-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"><List size={17} aria-hidden="true" /></span>
                    <span className="truncate text-sm font-semibold text-[var(--text-primary)]">Nội dung bài viết</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
                    {preparedBody.headings.length} mục
                    <ChevronDown size={16} aria-hidden="true" className="text-[var(--brand-primary)] transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <nav id="news-toc-links" className="border-t border-[var(--border)] bg-slate-50 px-3 py-2 sm:px-4" aria-label="Mục lục bài viết">
                  <ol className="m-0 grid max-h-72 list-decimal gap-1 overflow-y-auto py-1 pl-7 pr-1 marker:text-slate-500">
                    {tocSections.map(({ heading, children }) => (
                      <li key={heading.id} className="pl-0.5 text-sm leading-6 text-[var(--text-secondary)]">
                        <a href={`#${heading.id}`} className="inline-flex min-h-11 items-center rounded-md px-1.5 py-2 font-normal transition hover:bg-white hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/30">
                          {newsHeadingLabel(heading)}
                        </a>
                        {children.length > 0 && (
                          <ul className="m-0 list-none space-y-0 pl-6">
                            {children.map((child) => (
                              <li key={child.id} className="text-sm leading-6 text-[var(--text-secondary)]">
                                <a href={`#${child.id}`} className="inline-flex min-h-10 items-center rounded-md px-1.5 py-1.5 font-normal transition hover:bg-white hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/30">
                                  {newsHeadingLabel(child)}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
            )}
            <div className="news-body" dangerouslySetInnerHTML={{ __html: preparedBody.html }} />
          </div>
        </article>
        {related.length > 0 && <section className="mt-6 sm:mt-8"><div className="flex items-end justify-between gap-3"><div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-leaf">Đọc tiếp</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-ink">Bài viết liên quan</h2></div><Link href="/tin-tuc" className="hidden min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold text-leaf transition hover:bg-[var(--brand-primary-subtle)] sm:inline-flex">Tất cả tin tức <ArrowRight size={15} aria-hidden="true" /></Link></div><div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">{related.map((item) => <NewsCard key={item.id} article={item} />)}</div></section>}
        <Panel className="mt-6 text-center sm:mt-8"><h2 className="text-xl font-bold text-ink">{brandizeSiteText(`Kết nối cùng ${config.siteName}`, config.siteKey)}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{brandizeSiteText(config.description, config.siteKey)}</p><Link href="/san-pham" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">Xem sản phẩm công khai</Link></Panel>
      </PublicDetailMain>
    </PublicShell>
  );
}

async function getRelatedArticles(article: NewsArticle, config: SiteNewsConfig) {
  const params = new URLSearchParams({ limit: '4' });
  if (article.category?.slug) params.set('category', article.category.slug);
  const related = await fetchPublicNews(`/news/public?${params.toString()}`, config.siteKey);
  return related.data.filter((item) => item.id !== article.id).slice(0, 3);
}

function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
function readingTime(html: string) { const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length; return Math.max(1, Math.ceil(words / 220)); }
