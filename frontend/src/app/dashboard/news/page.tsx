'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, FileText, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { NewsArticle, NewsList, NewsSiteKey } from '@/lib/news';
import { Badge, Button, Input, LinkButton, Panel, Select, cn } from '@/components/ui';

type StatusFilter = '' | NewsArticle['status'];

const siteOptions: Array<{ value: NewsSiteKey; label: string }> = [
  { value: 'AGRIPASSPORT', label: 'AGRIPASSPORT' },
  { value: 'PASSPORT', label: 'HỘ CHIẾU NÔNG NGHIỆP' },
  { value: 'HTXONLINE', label: 'HTXONLINE' }
];

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PUBLISHED', label: 'Đã đăng' },
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'SCHEDULED', label: 'Hẹn giờ' },
  { value: 'ARCHIVED', label: 'Lưu trữ' }
];

export default function NewsListPage() {
  const queryClient = useQueryClient();
  const [siteFilter, setSiteFilter] = useState<NewsSiteKey>('AGRIPASSPORT');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const articles = useQuery({
    queryKey: ['news-list', siteFilter, statusFilter, search, page],
    queryFn: () => apiFetch<NewsList>(`/news?siteKey=${siteFilter}&limit=20&page=${page}${statusFilter ? `&status=${statusFilter}` : ''}${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ''}`)
  });

  const articleItems = articles.data?.data.data ?? [];
  const total = toNumber(articles.data?.data.meta?.total, articleItems.length);
  const limit = Math.max(1, toNumber(articles.data?.data.meta?.limit, 20));
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const archiveArticle = useMutation({
    mutationFn: ({ id, siteKey }: { id: string; siteKey: NewsSiteKey }) =>
      apiFetch<NewsArticle>(`/news/${id}?siteKey=${siteKey}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news-list'] })
  });

  function changeSite(value: NewsSiteKey) {
    setSiteFilter(value);
    setPage(1);
  }

  function changeStatus(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function removeArticle(article: NewsArticle) {
    if (article.status === 'ARCHIVED' || archiveArticle.isPending) return;
    const confirmed = window.confirm(`Xóa bài “${article.title}”? Bài sẽ được chuyển vào Lưu trữ và không còn hiển thị công khai.`);
    if (confirmed) archiveArticle.mutate({ id: article.id, siteKey: article.siteKey ?? siteFilter });
  }

  return (
    <div data-news-list className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-leaf/80">Quản lý nội dung</p>
          <h1 data-testid="page-title" className="mt-1 text-3xl font-bold tracking-tight text-ink">Tin tức</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Xem toàn bộ bài viết theo từng website, mở bài để chỉnh sửa hoặc xoá bài khỏi danh sách công khai.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => void articles.refetch()} disabled={articles.isFetching} aria-label="Tải lại danh sách bài viết">
            <RefreshCcw size={18} aria-hidden="true" className={cn(articles.isFetching && 'animate-spin')} />
            Tải lại
          </Button>
          <LinkButton data-testid="news-list-create-button" href={`/dashboard/news/new?siteKey=${siteFilter}`}>
            <Plus size={18} aria-hidden="true" />
            Thêm bài viết
          </LinkButton>
        </div>
      </header>

      <Panel className="border-slate-200 bg-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 space-y-1.5 text-sm font-semibold">
            <span>Website</span>
            <Select data-testid="news-list-site-filter" className="h-11" value={siteFilter} onChange={(event) => changeSite(event.target.value as NewsSiteKey)}>
              {siteOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </label>
          <label className="min-w-0 flex-1 space-y-1.5 text-sm font-semibold">
            <span>Trạng thái</span>
            <Select data-testid="news-list-status-filter" className="h-11" value={statusFilter} onChange={(event) => changeStatus(event.target.value as StatusFilter)}>
              {statusOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
            </Select>
          </label>
          <label className="min-w-0 flex-[1.5] space-y-1.5 text-sm font-semibold">
            <span>Tìm bài viết</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <Input data-testid="news-list-search-input" className="h-11 pl-10" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Tìm theo tiêu đề, mô tả hoặc đường dẫn" />
            </div>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <span data-testid="news-list-summary">{total} bài · {siteLabel(siteFilter)}{statusFilter ? ` · ${statusLabel(statusFilter)}` : ''}</span>
          <span>{articles.isFetching ? 'Đang cập nhật…' : `Trang ${Math.min(page, totalPages)}/${totalPages}`}</span>
        </div>
      </Panel>

      {articles.isError && (
        <Panel data-testid="news-list-error" className="border-rose-200 bg-rose-50 text-sm text-rose-950" role="alert">
          <p className="font-bold">Không tải được danh sách bài viết</p>
          <p className="mt-1">{errorMessage(articles.error)}. Hãy thử tải lại.</p>
          <Button type="button" variant="danger" className="mt-3" onClick={() => void articles.refetch()}>Thử lại</Button>
        </Panel>
      )}

      <section aria-labelledby="news-list-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="news-list-heading" className="text-lg font-bold text-ink">Danh sách bài viết</h2>
            <p className="mt-0.5 text-sm text-slate-600">Bài mới tạo sẽ xuất hiện ở đầu danh sách.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{articleItems.length} bài trên trang</span>
        </div>

        {articles.isLoading ? (
          <Panel className="text-sm text-slate-600">Đang tải danh sách bài viết…</Panel>
        ) : articleItems.length === 0 ? (
          <Panel data-testid="news-list-empty" className="border-dashed border-slate-300 bg-slate-50/70 text-center">
            <FileText className="mx-auto text-slate-400" size={30} aria-hidden="true" />
            <h3 className="mt-3 text-base font-bold text-ink">Chưa có bài viết phù hợp</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">Hãy đổi bộ lọc hoặc bắt đầu bằng một bài viết mới.</p>
            <LinkButton href={`/dashboard/news/new?siteKey=${siteFilter}`} className="mt-4"><Plus size={18} aria-hidden="true" />Thêm bài viết</LinkButton>
          </Panel>
        ) : (
          <div className="space-y-3">
            {articleItems.map((article) => (
              <article key={article.id} data-testid={`news-list-row-${article.id}`} className="rounded-[var(--public-radius-card)] border border-slate-200 bg-white p-4 shadow-[var(--public-shadow-card)] transition hover:border-emerald-200 hover:shadow-md sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {article.coverImageUrl ? (
                    <img src={article.coverImageUrl} alt={article.coverImageAlt || ''} className="h-20 w-full rounded-xl object-cover sm:h-16 sm:w-28" />
                  ) : (
                    <div className="grid h-20 w-full shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400 sm:h-16 sm:w-28" aria-label="Chưa có ảnh bìa"><FileText size={24} aria-hidden="true" /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={statusClass(article.status)}>{statusLabel(article.status)}</Badge>
                      <span className="text-xs font-semibold text-slate-500">{siteLabel(article.siteKey ?? siteFilter)}</span>
                      <span className="text-xs text-slate-500">{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink sm:text-lg">{article.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt || article.slug}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>SEO {article.seoScore}/100</span>
                      <span>{article.viewCount} lượt xem</span>
                      <span className="truncate">/{article.slug}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    <LinkButton variant="outline" href={`/dashboard/news/${article.id}?siteKey=${article.siteKey ?? siteFilter}`} aria-label={`Sửa bài ${article.title}`}>
                      Sửa
                    </LinkButton>
                    {article.status === 'PUBLISHED' && (
                      <a className="touch-target inline-flex items-center justify-center gap-2 rounded-[var(--public-radius-control)] border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]" href={publicArticleUrl(article)} target="_blank" rel="noreferrer">
                        <Eye size={17} aria-hidden="true" />
                        Xem
                      </a>
                    )}
                    <Button data-testid={`news-list-delete-${article.id}`} type="button" variant="danger" disabled={article.status === 'ARCHIVED' || archiveArticle.isPending} onClick={() => removeArticle(article)}>
                      <Trash2 size={17} aria-hidden="true" />
                      {article.status === 'ARCHIVED' ? 'Đã lưu trữ' : 'Xóa'}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3" aria-label="Phân trang bài viết">
          <Button type="button" variant="outline" disabled={page <= 1 || articles.isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trang trước</Button>
          <span className="text-sm font-semibold text-slate-600">Trang {page} / {totalPages}</span>
          <Button type="button" variant="outline" disabled={page >= totalPages || articles.isFetching} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Trang sau</Button>
        </nav>
      )}

      {archiveArticle.isError && (
        <Panel data-testid="news-list-delete-error" className="border-rose-200 bg-rose-50 text-sm text-rose-950" role="alert">
          {errorMessage(archiveArticle.error)}
        </Panel>
      )}
    </div>
  );
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function siteLabel(siteKey: NewsSiteKey) {
  return siteOptions.find((option) => option.value === siteKey)?.label ?? siteKey;
}

function statusLabel(status: string) {
  if (status === 'PUBLISHED') return 'Đã đăng';
  if (status === 'DRAFT') return 'Nháp';
  if (status === 'SCHEDULED') return 'Hẹn giờ';
  if (status === 'ARCHIVED') return 'Lưu trữ';
  return status;
}

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'bg-mint text-leaf';
  if (status === 'DRAFT') return 'bg-sky text-slate-700';
  if (status === 'SCHEDULED') return 'bg-amber-100 text-amber-900';
  return 'bg-stone-100 text-stone-700';
}

function publicArticleUrl(article: NewsArticle) {
  const origin = article.siteKey === 'PASSPORT'
    ? 'https://hochieunongnghiep.com'
    : article.siteKey === 'HTXONLINE'
      ? 'https://htxonline.vn'
      : 'https://agripassport.com';
  return `${origin}/tin-tuc/${article.slug}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
