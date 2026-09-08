import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock3, FileText, Search, Sparkles } from 'lucide-react';
import { EmptyPublicState, NewsCard } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { TopicScroll } from '@/components/topic-scroll';
import { Button, cn } from '@/components/ui';
import { fetchPublicNews, fetchPublicNewsCategories, publicNewsCategoryLabel } from '@/lib/news';
import { buildPublicMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Tin tức',
    description: 'Tin về hợp tác xã, dữ liệu sản phẩm, truy xuất, thị trường và chuyển đổi số nông nghiệp.',
    path: '/tin-tuc',
    keywords: ['tin tức hợp tác xã', 'tin nông sản', 'chuyển đổi số hợp tác xã', 'QR truy xuất', 'dữ liệu sản phẩm'],
    openGraphTitle: 'Tin tức và cập nhật nền tảng',
    openGraphDescription: 'Cập nhật kiến thức, thị trường, truy xuất và chuyển đổi số cho hợp tác xã nông nghiệp.'
  });
}

type NewsPageProps = {
  searchParams?: Promise<{ search?: string; category?: string }>;
};

const publicTopicDefinitions = [
  { label: 'Nông nghiệp', slugs: ['nong-nghiep'] },
  { label: 'Truy xuất', slugs: ['truy-xuat'] },
  { label: 'Hợp tác', slugs: ['hop-tac'] },
  { label: 'Sản phẩm', slugs: ['san-pham'] },
  { label: 'Thị trường', slugs: ['tin-thi-truong', 'thi-truong'] },
  { label: 'Kiến thức', slugs: ['cau-chuyen-san-pham'] }
] as const;

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const filters = (await searchParams) ?? {};
  const params = new URLSearchParams({ limit: '24' });
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);

  const [news, categories] = await Promise.all([fetchPublicNews(`/news/public?${params.toString()}`), fetchPublicNewsCategories()]);
  const publicTopics = publicTopicDefinitions.flatMap((topic) => {
    const category = categories.find((item) => (topic.slugs as readonly string[]).includes(item.slug));
    return category ? [{ ...category, name: topic.label, id: topic.label }] : [];
  });
  const articles = news.data;
  const featured = articles[0];
  const rest = featured ? articles.slice(1) : articles;
  const sideArticles = rest.slice(0, 3);
  const gridArticles = rest.slice(3);

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          eyebrow="Agripassport cập nhật"
          title="Tin tức"
          description="Tin HTX, thị trường, kiến thức nông nghiệp, chuyển đổi số và truy xuất nguồn gốc."
          action={
            <form action="/tin-tuc" method="GET" className="group flex items-center rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-sm transition hover:border-[#106f8a]/40 focus-within:border-[#106f8a] focus-within:ring-2 focus-within:ring-[#106f8a]/15 w-full sm:w-[380px] lg:w-[420px]">
              <div className="flex flex-1 items-center min-w-0 pl-2.5">
                <Search className="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-[#106f8a] transition-colors" aria-hidden="true" />
                <input
                  type="search"
                  name="search"
                  defaultValue={filters.search ?? ''}
                  placeholder="Tìm bài viết..."
                  aria-label="Tìm bài viết"
                  className="h-10 w-full min-w-0 bg-transparent px-2.5 text-sm text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:outline-none focus:ring-0"
                />
              </div>
              {filters.category && <input type="hidden" name="category" value={filters.category} />}
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#106f8a] px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#0d596e] active:scale-[0.98] shrink-0"
              >
                <span>Tìm</span>
              </button>
            </form>
          }
        />

        {publicTopics.length > 0 && (
          <section className="mb-5 overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-3 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:mb-6 sm:rounded-[1.7rem] sm:p-4">
            <div className="mb-2.5 flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-leaf/80 sm:mb-3 sm:text-sm">
              <Sparkles size={16} aria-hidden="true" />
              Chủ đề nổi bật
            </div>
            <TopicScroll className="-mx-3 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 sm:-mx-1 sm:gap-2.5 sm:px-1" aria-label="Lọc theo chủ đề">
              <Link
                href="/tin-tuc"
                className={cn(
                  'snap-start inline-flex min-h-10 items-center whitespace-nowrap rounded-lg border px-3 text-xs font-bold shadow-xs sm:px-3.5',
                  !filters.category ? 'border-[#106f8a] bg-[#106f8a] text-white' : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#106f8a] hover:text-[#106f8a]'
                )}
              >
                Tất cả
              </Link>
              {publicTopics.map((category) => (
                <Link
                  key={category.id}
                  href={`/tin-tuc?category=${category.slug}`}
                  className={cn(
                    'snap-start inline-flex min-h-10 items-center whitespace-nowrap rounded-lg border px-3 text-xs font-bold shadow-xs sm:px-3.5',
                    filters.category === category.slug ? 'border-[#106f8a] bg-[#106f8a] text-white' : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#106f8a] hover:text-[#106f8a]'
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </TopicScroll>
          </section>
        )}

        {featured && !filters.search && (
          <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:gap-6" aria-label="Bài viết nổi bật">
            <article className={cn(publicCardClass, 'group overflow-hidden rounded-[1.75rem] bg-[var(--surface-elevated)]')}>
              <Link href={`/tin-tuc/${featured.slug}`} className="block overflow-hidden p-2.5 sm:p-3">
                <PublicImage
                  src={featured.coverImageUrl}
                  alt={featured.coverImageAlt || featured.title}
                  fallback={DEFAULT_NEWS_IMAGE}
                  priority
                  wrapperClassName="aspect-[16/9] w-full rounded-[1.45rem] border border-[var(--border)] bg-[var(--brand-primary-subtle)]"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                />
              </Link>
              <div className="p-4 pt-1 sm:p-6 sm:pt-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  <span className="text-[var(--brand-primary-strong)]">{publicNewsCategoryLabel(featured.category) ?? 'Tin nền tảng'}</span>
                  {featured.publishedAt && <span className="inline-flex items-center gap-1 tracking-normal"><Calendar size={13} />{new Date(featured.publishedAt).toLocaleDateString('vi-VN')}</span>}
                </div>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-2 block max-w-3xl text-[1.55rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--text-primary)] hover:text-[#106f8a] sm:text-[2.35rem]">
                  {featured.title}
                </Link>
                <p className="mt-3 max-w-2xl line-clamp-2 text-[0.96rem] leading-7 text-[var(--text-secondary)] sm:text-base">{featured.excerpt || featured.seoDescription || 'Tin tức nền tảng'}</p>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#106f8a] transition hover:gap-3">
                  Đọc bài viết <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            {sideArticles.length > 0 && <aside className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#106f8a]">Đọc tiếp</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">Mới nhất</h2></div>
                <Clock3 size={18} className="text-[#106f8a]" aria-hidden="true" />
              </div>
              <div className="divide-y divide-[var(--border)]">
                {sideArticles.map((article) => <Link key={article.id} href={`/tin-tuc/${article.slug}`} className="group block py-4 first:pt-3 last:pb-1">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[var(--brand-primary-strong)]">{publicNewsCategoryLabel(article.category) ?? 'Tin mới'}</p>
                  <h3 className="mt-1.5 line-clamp-3 text-[1.02rem] font-extrabold leading-[1.3] text-ink transition group-hover:text-leaf">{article.title}</h3>
                  <p className="mt-2 text-xs font-medium text-slate-500">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</p>
                </Link>)}
              </div>
            </aside>}
          </section>
        )}

        {articles.length ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary-strong)]">Khám phá & cập nhật</p>
                <h2 className="type-h2 mt-1 text-[1.5rem] sm:text-[2rem]">Bài viết mới nhất</h2>
              </div>
              <p className="hidden text-sm text-slate-500 sm:block">Kiến thức, thị trường và dữ liệu nông nghiệp.</p>
            </div>
          <div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
            {(filters.search ? articles : gridArticles).map((article, index) => (
              <NewsCard key={article.id} article={article} priority={index < 3} />
            ))}
          </div>
          </section>
        ) : (
          <EmptyPublicState icon={FileText} title="Chưa có tin tức công khai" description="Tin tức mới sẽ hiển thị tại đây khi được đăng tải." />
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
