import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { EmptyPublicState, NewsCard, PublicShell } from '@/components/public-marketplace';
import { DEFAULT_NEWS_IMAGE, PublicImage } from '@/components/public-image';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
import { Button, cn } from '@/components/ui';
import { fetchPublicNews, fetchPublicNewsCategories } from '@/lib/news';

export const metadata: Metadata = {
  title: 'Tin tức | HTXONLINE',
  description: 'Tin HTX, thị trường, kiến thức nông nghiệp, chuyển đổi số và truy xuất nguồn gốc trên HTXONLINE.',
  alternates: {
    canonical: 'https://htxonline.vn/tin-tuc'
  },
  openGraph: {
    title: 'Tin tức HTXONLINE',
    description: 'Cập nhật kiến thức, thị trường và chuyển đổi số cho hợp tác xã nông nghiệp.',
    url: 'https://htxonline.vn/tin-tuc',
    siteName: 'HTXONLINE',
    locale: 'vi_VN',
    type: 'website'
  }
};

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

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          title="Tin tức"
          description="Tin HTX, thị trường, kiến thức nông nghiệp, chuyển đổi số và truy xuất nguồn gốc."
          action={
            <form action="/tin-tuc" className="flex min-w-0 flex-col gap-2 rounded-[1.6rem] border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:rounded-[1.2rem] lg:w-[420px]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                <input
                  name="search"
                  defaultValue={filters.search ?? ''}
                  placeholder="Tìm bài viết"
                  className="min-h-11 w-full rounded-xl border-0 bg-slate-50 pl-10 pr-3 text-base outline-none focus:ring-4 focus:ring-mint sm:rounded-[0.95rem]"
                />
              </div>
              {filters.category && <input type="hidden" name="category" value={filters.category} />}
              <Button className="w-full sm:w-auto">Tìm</Button>
            </form>
          }
        />

        {categories.length > 0 && (
          <section className="mb-6 rounded-[1.7rem] border border-white/80 bg-white/65 p-3 shadow-sm backdrop-blur sm:p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-leaf/80">
              <Sparkles size={16} aria-hidden="true" />
              Chủ đề nổi bật
            </div>
            <nav className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link
                href="/tin-tuc"
                className={cn(
                  'snap-start whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-sm',
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
                    'snap-start whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-sm',
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
          <article className={cn(publicCardClass, 'mb-6 overflow-hidden')}>
            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <Link href={`/tin-tuc/${featured.slug}`} className="block">
                <PublicImage
                  src={featured.coverImageUrl}
                  alt={featured.coverImageAlt || featured.title}
                  fallback={DEFAULT_NEWS_IMAGE}
                  priority
                  wrapperClassName="aspect-[16/9] w-full lg:min-h-[280px] lg:aspect-auto lg:h-full"
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex flex-col justify-center p-5">
                <p className="text-sm font-semibold uppercase text-leaf">{featured.category?.name ?? 'Tin HTXONLINE'}</p>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-3 text-3xl font-bold leading-tight text-ink">
                  {featured.title}
                </Link>
                <p className="mt-3 leading-7 text-slate-600">{featured.excerpt || featured.seoDescription || 'Tin tức HTXONLINE'}</p>
                <Link href={`/tin-tuc/${featured.slug}`} className="mt-5 font-semibold text-leaf">
                  Đọc bài viết
                </Link>
              </div>
            </div>
          </article>
        )}

        {articles.length ? (
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(filters.search ? articles : rest).map((article, index) => (
              <NewsCard key={article.id} article={article} priority={index < 3} />
            ))}
          </div>
        ) : (
          <EmptyPublicState title="Chưa có tin tức public" description="Tin tức do Super Admin đăng sẽ hiển thị tại đây." />
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
