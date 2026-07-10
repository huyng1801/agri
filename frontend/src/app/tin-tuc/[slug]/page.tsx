import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Eye, UserRound } from 'lucide-react';
import { EmptyPublicState, NewsCard, PublicShell } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicBreadcrumb, PublicDetailMain } from '@/components/public-layout';
import {
  articleDescription,
  articleImage,
  articleTitle,
  fetchPublicNews,
  fetchPublicNewsDetail,
  type NewsArticle
} from '@/lib/news';
import { formatDate } from '@/lib/format';
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
      title: 'Không tìm thấy bài viết | HTXONLINE',
      robots: { index: false, follow: true }
    };
  }

  const title = articleTitle(article);
  const description = articleDescription(article);
  const canonical = article.canonicalUrl || `https://htxonline.vn/tin-tuc/${article.slug}`;
  const image = articleImage(article);

  return {
    title: `${title} | HTXONLINE`,
    description,
    alternates: { canonical },
    robots: {
      index: !article.robotsNoIndex,
      follow: !article.robotsNoFollow
    },
    openGraph: {
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      url: canonical,
      siteName: 'HTXONLINE',
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
    }
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchPublicNewsDetail(slug);
  if (!article) {
    return (
      <PublicShell>
        <PublicDetailMain className="max-w-3xl">
          <EmptyPublicState title="Không tìm thấy bài viết" description="Bài viết chưa được publish hoặc đã được ẩn khỏi trang public." />
        </PublicDetailMain>
      </PublicShell>
    );
  }

  const related = await getRelatedArticles(article);
  const canonical = article.canonicalUrl || `https://htxonline.vn/tin-tuc/${article.slug}`;
  const image = articleImage(article);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': article.schemaType || 'NewsArticle',
    headline: article.title,
    description: articleDescription(article),
    image: [image],
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: canonical,
    author: {
      '@type': 'Person',
      name: article.author?.fullName || 'HTXONLINE'
    },
    publisher: {
      '@type': 'Organization',
      name: 'HTXONLINE',
      logo: {
        '@type': 'ImageObject',
        url: 'https://htxonline.vn/logo.png'
      }
    }
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <PublicDetailMain className="max-w-5xl">
        <PublicBreadcrumb href="/tin-tuc" label="Quay lại tin tức" />

        <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <PublicImage
            src={article.coverImageUrl || image}
            alt={article.coverImageAlt || article.title}
            fallback={DEFAULT_NEWS_IMAGE}
            className="aspect-[16/8] w-full object-cover"
          />
          <div className="p-4 md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
              {article.category?.name && <Badge className="bg-mint text-leaf">{article.category.name}</Badge>}
              <span className="inline-flex items-center gap-1">
                <Calendar size={15} aria-hidden="true" />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <UserRound size={15} aria-hidden="true" />
                {article.author?.fullName || 'HTXONLINE'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={15} aria-hidden="true" />
                {article.viewCount}
              </span>
            </div>
            <h1 className="text-[1.9rem] font-bold leading-[1.03] tracking-tight text-ink sm:text-[2.55rem] md:text-5xl">{article.title}</h1>
            {(article.excerpt || article.seoDescription) && (
              <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{article.excerpt || article.seoDescription}</p>
            )}
            <div className="news-body mt-6 sm:mt-8" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
            {article.tagsJson?.length ? (
              <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
                {article.tagsJson.map((tag) => (
                  <Badge key={tag} className="bg-slate-100 text-slate-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
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
          <h2 className="text-xl font-bold text-ink">Kết nối cùng HTXONLINE</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Cập nhật thêm sản phẩm, HTX và truy xuất nguồn gốc trên sàn nông sản số.</p>
          <Link href="/san-pham" className="mt-4 inline-block font-semibold text-leaf">
            Xem sản phẩm public
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
