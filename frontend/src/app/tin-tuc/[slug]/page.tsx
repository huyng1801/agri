import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock3, Eye, UserRound } from 'lucide-react';
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
      <PublicDetailMain className="max-w-6xl">
        <PublicBreadcrumb href="/tin-tuc" label="Quay lại tin tức" />

        <article className="overflow-hidden rounded-[2rem] border border-[#e1eadc] bg-[#fbfdf9] shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
          <header className="mx-auto max-w-4xl px-4 pb-5 pt-2 text-center sm:px-8 sm:pb-7">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {article.category?.name && <Badge className="bg-[#e4f4e7] text-leaf">{article.category.name}</Badge>}
              <span className="inline-flex items-center gap-1 tracking-normal"><Calendar size={14} />{formatDate(article.publishedAt || article.createdAt)}</span>
              <span className="inline-flex items-center gap-1 tracking-normal"><Clock3 size={14} />{readingTime(article.bodyHtml)} phút đọc</span>
              <span className="inline-flex items-center gap-1 tracking-normal"><Eye size={14} />{article.viewCount} lượt xem</span>
            </div>
            <h1 className="mt-4 text-[1.9rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-ink sm:text-[3.25rem]">{article.title}</h1>
            <p className="mx-auto mt-4 max-w-3xl text-[1rem] leading-7 text-slate-600 sm:text-[1.12rem] sm:leading-8">{article.excerpt || article.seoDescription || 'Tin tức HTXONLINE'}</p>
            <p className="mt-3 text-sm font-medium text-slate-500">{article.author?.fullName || siteProfile.appName}</p>
          </header>
          <div className="px-2.5 sm:px-4">
            <PublicImage
              src={article.coverImageUrl || image}
              alt={article.coverImageAlt || article.title}
              fallback={DEFAULT_NEWS_IMAGE}
              wrapperClassName="aspect-[16/9] w-full rounded-[1.45rem] border border-[#dce9d7] bg-[#eef7eb] sm:aspect-[2.1/1]"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mx-auto max-w-3xl px-4 py-7 sm:px-8 sm:py-10">
            <div className="news-body" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
            {article.tagsJson?.length ? <div className="mt-8 flex flex-wrap gap-2 border-t border-[#e1eadc] pt-5">{article.tagsJson.map((tag) => <Badge key={tag} className="bg-[#eef7eb] text-leaf">#{tag}</Badge>)}</div> : null}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-6 sm:mt-8">
            <div className="flex items-end justify-between gap-3"><div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-leaf">Đọc tiếp</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-ink">Bài viết liên quan</h2></div><Link href="/tin-tuc" className="hidden items-center gap-1 text-sm font-bold text-leaf sm:inline-flex">Tất cả tin tức <ArrowRight size={15} /></Link></div>
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

function readingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
