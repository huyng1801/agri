import Link from 'next/link';
import { ArrowRight, Calendar, ChevronDown, Clock3, FileText, Search, Sparkles } from 'lucide-react';
import { EmptyPublicState, NewsCard } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { PublicPagination } from '@/components/public-pagination';
import { cn } from '@/components/ui';
import { fetchPublicNews, fetchPublicNewsCategories, publicNewsCategoryLabel } from '@/lib/news';
import type { PublicSiteKey } from '@/lib/domain';
import { formatDate } from '@/lib/format';

export type SiteNewsConfig = {
  siteKey: Exclude<PublicSiteKey, 'local'>;
  siteName: string;
  eyebrow: string;
  title: string;
  description: string;
  cardDescription: string;
};

type SiteNewsPageProps = {
  searchParams?: Promise<{ search?: string; category?: string; page?: string }>;
  config: SiteNewsConfig;
};

const publicTopicDefinitions = [
  { label: 'Truy xuất', slug: 'truy-xuat', slugs: ['truy-xuat', 'truy-xuat-nguon-goc'] },
  { label: 'Chuyển đổi số', slug: 'chuyen-doi-so', slugs: ['chuyen-doi-so'] },
  { label: 'Hợp tác xã', slug: 'hop-tac', slugs: ['hop-tac', 'tin-htx'] },
  { label: 'Thị trường', slug: 'tin-thi-truong', slugs: ['tin-thi-truong', 'thi-truong'] },
  { label: 'Kiến thức', slug: 'cau-chuyen-san-pham', slugs: ['cau-chuyen-san-pham', 'kien-thuc-nong-nghiep'] }
] as const;

function buildNewsPageUrl(filters: { search?: string; category?: string; page?: string }, page: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/tin-tuc?${query}` : '/tin-tuc';
}

export async function SiteNewsPage({ searchParams, config }: SiteNewsPageProps) {
  const filters = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(filters.page) || 1);
  const pageSize = 12;
  const params = new URLSearchParams({ limit: String(pageSize), page: String(currentPage) });
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);

  const [news, categories] = await Promise.all([
    fetchPublicNews(`/news/public?${params.toString()}`, config.siteKey),
    fetchPublicNewsCategories(config.siteKey)
  ]);
  const publicTopics = publicTopicDefinitions.flatMap((topic) => {
    const category = categories.find((item) => (topic.slugs as readonly string[]).includes(item.slug));
    return [{ ...(category ?? { id: topic.slug, slug: topic.slug, sortOrder: 0, isActive: true }), name: topic.label }];
  });
  const articles = news.data;
  const totalPages = Number(news.meta?.totalPages ?? (articles.length === pageSize ? currentPage + 1 : currentPage));
  const isFirstPage = currentPage === 1 && !filters.search && !filters.category;
  const featured = isFirstPage ? articles[0] : null;
  const rest = featured ? articles.slice(1) : articles;
  const sideArticles = isFirstPage ? rest.slice(0, 3) : [];
  const gridArticles = isFirstPage ? rest.slice(3) : articles;

  return (
    <PublicShell>
      <PublicPageMain className="public-news-page">
        <PublicPageHeader
          eyebrow={config.eyebrow}
          eyebrowClassName={config.siteKey === 'passport' ? 'normal-case tracking-normal' : undefined}
          title={config.title}
          description={config.description}
          action={
            <form action="/tin-tuc" method="GET" className="group flex w-full items-center rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-sm transition hover:border-[var(--brand-primary)]/40 focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/15 sm:w-[380px] lg:w-[420px]">
              <div className="flex min-w-0 flex-1 items-center pl-2.5">
                <Search className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-[var(--brand-primary)]" aria-hidden="true" />
                <input type="search" name="search" defaultValue={filters.search ?? ''} placeholder="Tìm kiếm bài viết…" aria-label="Tìm kiếm bài viết" autoComplete="off" spellCheck={false} className="min-h-11 w-full min-w-0 bg-transparent px-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-slate-400 focus:outline-none focus:ring-0" />
              </div>
              {filters.category && <input type="hidden" name="category" value={filters.category} />}
              <button type="submit" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)] sm:text-sm">Tìm</button>
            </form>
          }
        />

        {publicTopics.length > 0 && (
          <section className="mb-5 rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-3 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:mb-6 sm:rounded-[1.7rem] sm:p-4">
            <details open className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 text-[0.78rem] font-semibold tracking-[0.14em] text-leaf/80 outline-none transition hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/30 sm:text-sm [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2"><Sparkles size={16} aria-hidden="true" />Chủ đề nổi bật</span>
                <ChevronDown size={18} aria-hidden="true" className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max items-center gap-2">
                  <Link href="/tin-tuc" className={cn('inline-flex min-h-11 items-center whitespace-nowrap rounded-lg border px-3 text-xs font-bold shadow-xs sm:px-3.5', !filters.category ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]')}>Tất cả</Link>
                  {publicTopics.map((category) => <Link key={category.id} href={`/tin-tuc?category=${category.slug}`} className={cn('inline-flex min-h-11 items-center whitespace-nowrap rounded-lg border px-3 text-xs font-bold shadow-xs sm:px-3.5', filters.category === category.slug ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]')}>{category.name}</Link>)}
                </div>
              </div>
            </details>
          </section>
        )}

        {featured && !filters.search && (
          <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:gap-6" aria-label="Bài viết nổi bật">
            <article className={cn(publicCardClass, 'group overflow-hidden rounded-[1.75rem] bg-[var(--surface-elevated)]')}>
              <Link href={`/tin-tuc/${featured.slug}`} className="block overflow-hidden p-2.5 sm:p-3"><PublicImage src={featured.coverImageUrl} alt={featured.coverImageAlt || featured.title} fallback={DEFAULT_NEWS_IMAGE} priority wrapperClassName="aspect-[16/9] w-full rounded-[1.45rem] border border-[var(--border)] bg-[var(--brand-primary-subtle)]" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></Link>
              <div className="p-4 pt-1 sm:p-6 sm:pt-2">
                <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem] font-semibold tracking-[0.13em] text-slate-500', config.siteKey !== 'passport' && 'uppercase')}><span className="text-[var(--brand-primary-strong)]">{publicNewsCategoryLabel(featured.category) ?? 'Tin nền tảng'}</span>{featured.publishedAt && <span className="inline-flex items-center gap-1 tracking-normal"><Calendar size={13} />{formatDate(featured.publishedAt)}</span>}</div>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-2 block max-w-3xl text-[1.35rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-[var(--text-primary)] hover:text-[var(--brand-primary)] sm:text-[2.35rem]">{featured.title}</Link>
                <p className="mt-3 max-w-2xl line-clamp-2 text-[0.875rem] leading-[1.65] text-[var(--text-secondary)] sm:text-base sm:leading-7">{featured.excerpt || featured.seoDescription || config.cardDescription}</p>
                  <Link href={`/tin-tuc/${featured.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-bold text-[var(--brand-primary)] transition hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)]">Đọc bài viết <ArrowRight size={16} /></Link>
              </div>
            </article>
            {sideArticles.length > 0 && <aside className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between border-b border-[var(--border)] pb-3"><div><p className={cn('text-[0.7rem] font-semibold tracking-[0.18em] text-[var(--brand-primary)]', config.siteKey !== 'passport' && 'uppercase')}>Đọc tiếp</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">Mới nhất</h2></div><Clock3 size={18} className="text-[var(--brand-primary)]" aria-hidden="true" /></div><div className="divide-y divide-[var(--border)]">{sideArticles.map((article) => <Link key={article.id} href={`/tin-tuc/${article.slug}`} className="group block py-4 first:pt-3 last:pb-1"><p className={cn('text-[0.68rem] font-semibold tracking-[0.13em] text-[var(--brand-primary-strong)]', config.siteKey !== 'passport' && 'uppercase')}>{publicNewsCategoryLabel(article.category) ?? 'Tin mới'}</p><h3 className="mt-1.5 line-clamp-3 text-[1.02rem] font-extrabold leading-[1.3] text-ink transition group-hover:text-leaf">{article.title}</h3><p className="mt-2 text-xs font-medium text-slate-500">{article.publishedAt ? formatDate(article.publishedAt) : 'Mới cập nhật'}</p></Link>)}</div></aside>}
          </section>
        )}

        {articles.length ? <section><div className="mb-4 flex items-end justify-between gap-3 sm:mb-5"><div><p className={cn('text-[0.72rem] font-semibold tracking-[0.2em] text-[var(--brand-primary-strong)]', config.siteKey !== 'passport' && 'uppercase')}>Khám phá & cập nhật</p><h2 className="type-h2 mt-1 text-[1.5rem] sm:text-[2rem]">Bài viết mới nhất</h2></div><p className="hidden text-sm text-slate-500 sm:block">{config.cardDescription}</p></div><div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">{(filters.search ? articles : gridArticles).map((article, index) => <NewsCard key={article.id} article={article} priority={index < 3} />)}</div><PublicPagination currentPage={currentPage} totalPages={totalPages} hrefForPage={(page) => buildNewsPageUrl(filters, page)} ariaLabel={`Phân trang tin tức ${config.siteName}`} accentClassName="bg-[var(--brand-primary)]" /></section> : <EmptyPublicState icon={FileText} title={`Chưa có tin tức ${config.siteName}`} description="Tin tức mới sẽ hiển thị tại đây khi được đăng tải." />}
      </PublicPageMain>
    </PublicShell>
  );
}
