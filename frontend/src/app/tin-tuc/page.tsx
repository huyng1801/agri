import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock3, Search, Sparkles } from 'lucide-react';
import { EmptyPublicState, NewsCard } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import { fetchPublicNews, fetchPublicNewsCategories } from '@/lib/news';
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

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const filters = (await searchParams) ?? {};
  const params = new URLSearchParams({ limit: '24' });
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);

  const [news, categories] = await Promise.all([fetchPublicNews(`/news/public?${params.toString()}`), fetchPublicNewsCategories()]);
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
            <form action="/tin-tuc" className="flex min-w-0 flex-col gap-2 rounded-[1.15rem] border border-[#e8e4d8] bg-white p-1.5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:flex-row sm:rounded-[1.3rem] sm:p-2 lg:w-[420px]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                <input
                  name="search"
                  defaultValue={filters.search ?? ''}
                  placeholder="Tìm bài viết"
                  className="min-h-11 w-full rounded-[0.95rem] border-0 bg-[#f7faf4] pl-10 pr-3 text-[0.95rem] outline-none focus:ring-4 focus:ring-mint sm:rounded-[1.05rem] sm:text-base"
                />
              </div>
              {filters.category && <input type="hidden" name="category" value={filters.category} />}
              <Button className="min-h-11 w-full sm:w-auto">Tìm</Button>
            </form>
          }
        />

        {categories.length > 0 && (
          <section className="mb-5 overflow-hidden rounded-[1.4rem] border border-[#e8e4d8] bg-white p-3 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:mb-6 sm:rounded-[1.7rem] sm:p-4">
            <div className="mb-2.5 flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-leaf/80 sm:mb-3 sm:text-sm">
              <Sparkles size={16} aria-hidden="true" />
              Chủ đề nổi bật
            </div>
            <nav className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-1 sm:gap-2.5 sm:px-1">
              <Link
                href="/tin-tuc"
                className={cn(
                  'snap-start whitespace-nowrap rounded-[1rem] border px-3 py-2 text-[0.9rem] font-semibold shadow-sm sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm',
                  !filters.category ? 'border-leaf bg-mint text-leaf' : 'border-slate-200 bg-white text-slate-700'
                )}
              >
                Tất cả
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/tin-tuc?category=${category.slug}`}
                  className={cn(
                    'snap-start whitespace-nowrap rounded-[1rem] border px-3 py-2 text-[0.9rem] font-semibold shadow-sm sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm',
                    filters.category === category.slug ? 'border-leaf bg-mint text-leaf' : 'border-slate-200 bg-white text-slate-700'
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </section>
        )}

        {featured && !filters.search && (
          <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:gap-6" aria-label="Bài viết nổi bật">
            <article className={cn(publicCardClass, 'group overflow-hidden rounded-[2rem] border-[#dfe9dc] bg-[#fbfdf9]')}>
              <Link href={`/tin-tuc/${featured.slug}`} className="block overflow-hidden p-2.5 sm:p-3">
                <PublicImage
                  src={featured.coverImageUrl}
                  alt={featured.coverImageAlt || featured.title}
                  fallback={DEFAULT_NEWS_IMAGE}
                  priority
                  wrapperClassName="aspect-[16/9] w-full rounded-[1.45rem] border border-[#dce9d7] bg-[#eef7eb]"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                />
              </Link>
              <div className="p-4 pt-1 sm:p-6 sm:pt-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  <span className="text-[#2b8a3e]">{featured.category?.name ?? 'Tin nền tảng'}</span>
                  {featured.publishedAt && <span className="inline-flex items-center gap-1 tracking-normal"><Calendar size={13} />{new Date(featured.publishedAt).toLocaleDateString('vi-VN')}</span>}
                </div>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-2 block max-w-3xl text-[1.55rem] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink hover:text-leaf sm:text-[2.35rem]">
                  {featured.title}
                </Link>
                <p className="mt-3 max-w-2xl line-clamp-2 text-[0.96rem] leading-7 text-slate-600 sm:text-base">{featured.excerpt || featured.seoDescription || 'Tin tức nền tảng'}</p>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-leaf transition hover:gap-3">
                  Đọc bài viết <ArrowRight size={16} />
                </Link>
              </div>
            </article>

            {sideArticles.length > 0 && <aside className="rounded-[2rem] border border-[#e8e4d8] bg-[#f7faf4] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-5">
              <div className="flex items-center justify-between border-b border-[#dce8d8] pb-3">
                <div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-leaf">Đọc tiếp</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-ink">Mới nhất</h2></div>
                <Clock3 size={18} className="text-leaf" aria-hidden="true" />
              </div>
              <div className="divide-y divide-[#dce8d8]">
                {sideArticles.map((article) => <Link key={article.id} href={`/tin-tuc/${article.slug}`} className="group block py-4 first:pt-3 last:pb-1">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#2b8a3e]">{article.category?.name ?? 'Tin mới'}</p>
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
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">Khám phá & cập nhật</p>
                <h2 className="mt-1 text-[1.5rem] font-extrabold tracking-[-0.03em] text-[#1f2233] sm:text-[2rem]">Bài viết mới nhất</h2>
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
          <EmptyPublicState title="Chưa có tin tức công khai" description="Tin tức do Super Admin đăng sẽ hiển thị tại đây." />
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
