import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Eye, UserRound } from 'lucide-react';
import { EmptyPublicState, NewsCard } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import {
  articleDescription,
  articleImage,
  articleTitle,
  fetchPublicNews,
  fetchPublicNewsDetail,
  type NewsArticle
} from '@/lib/news';
import { formatDate } from '@/lib/format';
import { getPublicSiteProfile } from '@/lib/public-site';
import { brandizeSiteText } from '@/lib/page-metadata';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';
import { Badge, Panel } from '@/components/ui';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchPublicNewsDetail(slug);
  if (!article) {
    return {
      title: 'Không tìm thấy bài viết',
      robots: { index: false, follow: true }
    };
  }

  const title = articleTitle(article);
  const description = articleDescription(article);
  const siteKey = await getRequestPublicSiteKey();
  const canonical = article.canonicalUrl || (await getRequestAbsoluteUrl(`/tin-tuc/${article.slug}`));
  const image = articleImage(article);
  const keywords = article.tagsJson?.length
    ? article.tagsJson
    : [article.focusKeyword, article.category?.name, brandizeSiteText('tin tức nền tảng', siteKey)].filter((value): value is string => Boolean(value));

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: !article.robotsNoIndex,
      follow: !article.robotsNoFollow
    },
    openGraph: {
      title: brandizeSiteText(article.ogTitle || title, siteKey),
      description: brandizeSiteText(article.ogDescription || description, siteKey),
      url: canonical,
      siteName: brandizeSiteText('AGRIPASSPORT', siteKey),
      locale: 'vi_VN',
      type: 'article',
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      authors: article.author?.fullName ? [article.author.fullName] : undefined,
      images: [{ url: article.ogImageUrl || image, alt: article.coverImageAlt || article.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.twitterTitle || article.ogTitle || title,
      description: article.twitterDescription || article.ogDescription || description,
      images: [article.twitterImageUrl || article.ogImageUrl || image]
    },
    category: article.category?.name
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchPublicNewsDetail(slug);
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  if (!article) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl">
          <PublicBreadcrumb href="/tin-tuc" label="Quay lại tin tức" />
          <div className="space-y-4">
            <EmptyPublicState title="Không tìm thấy bài viết" description="Bài viết chưa được đăng công khai hoặc đã bị ẩn khỏi trang công khai." />
            <Panel className="text-center">
              <h2 className="text-lg font-bold text-ink">Tiếp tục khám phá nội dung công khai</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Bạn có thể quay về danh sách tin tức hoặc xem thêm sản phẩm đang hiển thị trên sàn.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href="/tin-tuc" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 text-sm font-semibold text-white">
                  Xem tin tức mới
                </Link>
                <Link href="/san-pham" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink">
                  Xem sản phẩm công khai
                </Link>
              </div>
            </Panel>
          </div>
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const related = await getRelatedArticles(article);
  const canonical = article.canonicalUrl || (await getRequestAbsoluteUrl(`/tin-tuc/${article.slug}`));
  const logoUrl = await getRequestAbsoluteUrl('/logo.png');
  const image = articleImage(article);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': article.schemaType || 'NewsArticle',
    headline: article.title,
    description: articleDescription(article),
    image: [image],
    keywords: article.tagsJson?.join(', ') || article.focusKeyword || undefined,
    articleSection: article.category?.name || undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: canonical,
    author: {
      '@type': 'Person',
      name: article.author?.fullName || siteProfile.appName
    },
    publisher: {
      '@type': 'Organization',
      name: siteProfile.appName,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl
      }
    }
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <PublicDetailMain className="max-w-5xl">
        <PublicBreadcrumb href="/tin-tuc" label="Quay lại tin tức" />

        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-5">
          <article className="order-2 overflow-hidden rounded-[1.7rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.96)] shadow-[var(--shadow-card)] backdrop-blur-sm lg:order-1">
            <div className="p-2.5 sm:p-3">
              <PublicImage
                src={article.coverImageUrl || image}
                alt={article.coverImageAlt || article.title}
                fallback={DEFAULT_NEWS_IMAGE}
                wrapperClassName="aspect-[16/10] w-full rounded-[1.45rem] sm:aspect-[16/9]"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="border-t border-[#eadfce] p-4 sm:p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Tóm tắt bài viết</p>
              <p className="mt-2 text-[0.96rem] leading-7 text-slate-700">{article.excerpt || article.seoDescription || 'Tin tức HTXONLINE'}</p>
            </div>
          </article>

          <article className="order-1 rounded-[1.9rem] bg-[linear-gradient(145deg,#0d1325_0%,#14253a_40%,#245f3e_100%)] p-5 text-white shadow-[0_24px_60px_rgba(13,19,37,0.22)] sm:p-6 lg:order-2">
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.82rem] text-white/68 sm:mb-4 sm:text-sm">
              {article.category?.name && <Badge className="bg-white/12 text-white">{article.category.name}</Badge>}
              <span className="inline-flex items-center gap-1">
                <Calendar size={15} aria-hidden="true" />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <UserRound size={15} aria-hidden="true" />
                {article.author?.fullName || siteProfile.appName}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={15} aria-hidden="true" />
                {article.viewCount}
              </span>
            </div>
            <h1 className="text-[1.72rem] font-extrabold leading-[1.03] tracking-[-0.03em] text-white sm:text-[2.55rem]">{article.title}</h1>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: 'Danh mục', value: article.category?.name ?? 'Tin nền tảng' },
                { label: 'Lượt xem', value: `${article.viewCount}` },
                { label: 'Miền hiển thị', value: siteProfile.appName }
              ].map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">{item.label}</p>
                  <p className="mt-1.5 text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
            {article.tagsJson?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {article.tagsJson.map((tag) => (
                  <Badge key={tag} className="bg-black/14 text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </article>
        </div>

        <article className="mt-6 overflow-hidden rounded-[1.7rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.96)] p-4 shadow-[var(--shadow-card)] backdrop-blur-sm md:p-8">
          <div className="news-body" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
        </article>

        {related.length > 0 && (
          <section className="mt-6 sm:mt-8">
            <h2 className="text-2xl font-bold text-ink">Bài viết liên quan</h2>
            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
              {related.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}

        <Panel className="mt-6 text-center sm:mt-8">
          <h2 className="text-xl font-bold text-ink">{brandizeSiteText('Kết nối cùng HTXONLINE', siteKey)}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{brandizeSiteText('Cập nhật thêm sản phẩm, HTX và truy xuất nguồn gốc trên sàn nông sản số.', siteKey)}</p>
          <Link href="/san-pham" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
            Xem sản phẩm công khai
          </Link>
        </Panel>
      </PublicDetailMain>
    </PublicShell>
  );
}

async function getRelatedArticles(article: NewsArticle) {
  const params = new URLSearchParams({ limit: '4' });
  if (article.category?.slug) params.set('category', article.category.slug);
  const related = await fetchPublicNews(`/news/public?${params.toString()}`);
  return related.data.filter((item) => item.id !== article.id).slice(0, 3);
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
