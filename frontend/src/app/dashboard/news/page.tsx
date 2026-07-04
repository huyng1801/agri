'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  Quote,
  RefreshCcw,
  Save,
  Search,
  Upload
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { NewsArticle, NewsCategory, NewsList } from '@/lib/news';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type NewsForm = {
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  coverImageAlt: string;
  status: NewsArticle['status'];
  isFeatured: boolean;
  showOnHome: boolean;
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  robotsNoIndex: boolean;
  robotsNoFollow: boolean;
  schemaType: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
  tags: string;
  publishedAt: string;
  scheduledAt: string;
};

const emptyForm: NewsForm = {
  categoryId: '',
  title: '',
  slug: '',
  excerpt: '',
  bodyHtml: '<p></p>',
  coverImageUrl: '',
  coverImageAlt: '',
  status: 'DRAFT',
  isFeatured: false,
  showOnHome: false,
  focusKeyword: '',
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  robotsNoIndex: false,
  robotsNoFollow: false,
  schemaType: 'NewsArticle',
  ogTitle: '',
  ogDescription: '',
  ogImageUrl: '',
  twitterTitle: '',
  twitterDescription: '',
  twitterImageUrl: '',
  tags: '',
  publishedAt: '',
  scheduledAt: ''
};

const editorSnippets: Array<[LucideIcon, string]> = [
  [Heading2, '<h2>Tiêu đề H2</h2>'],
  [Heading3, '<h3>Tiêu đề H3</h3>'],
  [Bold, '<strong>chữ đậm</strong>'],
  [Italic, '<em>chữ nghiêng</em>'],
  [LinkIcon, '<a href="https://htxonline.vn">liên kết</a>'],
  [List, '<ul><li>Mục</li></ul>'],
  [ListOrdered, '<ol><li>Mục</li></ol>'],
  [Quote, '<blockquote>Trích dẫn</blockquote>']
];

type UploadPlan = {
  bucket: string;
  objectKey: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  publicUrl?: string;
};

type FileAsset = {
  id: string;
  publicUrl?: string | null;
  objectKey: string;
};

export default function NewsDashboardPage() {
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', slug: '' });
  const [bodyImage, setBodyImage] = useState({ url: '', alt: '', caption: '' });
  const [uploading, setUploading] = useState('');

  const articles = useQuery({
    queryKey: ['news', search],
    queryFn: () => apiFetch<NewsList>(`/news?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`)
  });
  const categories = useQuery({
    queryKey: ['news-categories'],
    queryFn: () => apiFetch<NewsCategory[]>('/news/categories')
  });

  const seo = useMemo(() => clientSeoScore(form), [form]);
  const articleItems = articles.data?.data.data ?? [];
  const categoryItems = categories.data?.data ?? [];

  const saveArticle = useMutation({
    mutationFn: (statusOverride?: NewsForm['status']) => {
      const payload = formPayload({ ...form, status: statusOverride ?? form.status });
      return editingId
        ? apiFetch<NewsArticle>(`/news/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<NewsArticle>('/news', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromArticle(result.data));
      queryClient.invalidateQueries({ queryKey: ['news'] });
    }
  });

  const archiveArticle = useMutation({
    mutationFn: (id: string) => apiFetch<NewsArticle>(`/news/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] })
  });

  const createCategory = useMutation({
    mutationFn: () =>
      apiFetch<NewsCategory>('/news/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryDraft.name,
          slug: categoryDraft.slug || slugifyLocal(categoryDraft.name)
        })
      }),
    onSuccess: () => {
      setCategoryDraft({ name: '', slug: '' });
      queryClient.invalidateQueries({ queryKey: ['news-categories'] });
    }
  });

  function update<K extends keyof NewsForm>(key: K, value: NewsForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'title' && !current.slug ? { slug: slugifyLocal(String(value)) } : {})
    }));
  }

  function edit(article: NewsArticle) {
    setEditingId(article.id);
    setForm(fromArticle(article));
    setPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(false);
  }

  function insertHtml(snippet: string) {
    const field = bodyRef.current;
    if (!field) {
      update('bodyHtml', `${form.bodyHtml}\n${snippet}`);
      return;
    }
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const next = `${form.bodyHtml.slice(0, start)}${snippet}${form.bodyHtml.slice(end)}`;
    update('bodyHtml', next);
    window.requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }

  async function uploadFile(file: File, target: 'cover' | 'body') {
    setUploading(target);
    try {
      const plan = await apiFetch<UploadPlan>('/files/presign-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          visibility: 'PUBLIC'
        })
      });
      const uploadResponse = await fetch(plan.data.uploadUrl, {
        method: plan.data.method || 'PUT',
        headers: plan.data.headers,
        body: file
      });
      if (!uploadResponse.ok) throw new Error('Không upload được ảnh lên R2');
      const publicUrl = plan.data.publicUrl || `${API_URL.replace(/\/api\/v1$/, '')}/files/${plan.data.objectKey}`;
      const confirmed = await apiFetch<FileAsset>('/files/confirm-upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          objectKey: plan.data.objectKey,
          publicUrl,
          visibility: 'PUBLIC'
        })
      });
      const url = confirmed.data.publicUrl || publicUrl;
      if (target === 'cover') {
        update('coverImageUrl', url);
        if (!form.ogImageUrl) update('ogImageUrl', url);
        if (!form.twitterImageUrl) update('twitterImageUrl', url);
      } else {
        setBodyImage((current) => ({ ...current, url }));
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Upload thất bại');
    } finally {
      setUploading('');
    }
  }

  function insertBodyImage() {
    if (!bodyImage.url) return;
    const alt = escapeHtml(bodyImage.alt || 'Ảnh minh họa');
    const caption = bodyImage.caption ? `<figcaption>${escapeHtml(bodyImage.caption)}</figcaption>` : '';
    insertHtml(`<figure><img src="${bodyImage.url}" alt="${alt}" loading="lazy" />${caption}</figure>`);
    setBodyImage({ url: '', alt: '', caption: '' });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Tin tức</h1>
          <p className="text-sm text-slate-600">Bài viết public cho htxonline.vn/tin-tuc</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => articles.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button type="button" onClick={reset}>
            <Plus size={18} aria-hidden="true" />
            Tạo bài
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveArticle.mutate(undefined); }}>
          <Panel className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>Tiêu đề</span>
                <Input data-testid="news-title-input" value={form.title} onChange={(event) => update('title', event.target.value)} required />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Slug</span>
                <Input data-testid="news-slug-input" value={form.slug} onChange={(event) => update('slug', slugifyLocal(event.target.value))} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Danh mục</span>
                <Select data-testid="news-category-select" value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}>
                  <option value="">Không chọn</option>
                  {categoryItems.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Select>
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Trạng thái</span>
                <Select data-testid="news-status-select" value={form.status} onChange={(event) => update('status', event.target.value as NewsForm['status'])}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </label>
              <label className="space-y-1 text-sm font-semibold md:col-span-2">
                <span>Mô tả ngắn</span>
                <Textarea data-testid="news-excerpt-input" value={form.excerpt} onChange={(event) => update('excerpt', event.target.value)} />
              </label>
            </div>
          </Panel>

          <Panel className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {editorSnippets.map(([Icon, snippet]) => (
                <button
                  key={String(snippet)}
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-mint"
                  onClick={() => insertHtml(String(snippet))}
                  title="Chèn định dạng"
                >
                  <Icon size={18} aria-hidden="true" />
                </button>
              ))}
              <Button type="button" variant="ghost" onClick={() => setPreview((value) => !value)}>
                <Eye size={18} aria-hidden="true" />
                Preview
              </Button>
            </div>
            <label className="block space-y-1 text-sm font-semibold">
              <span>Nội dung HTML</span>
              <Textarea
                ref={bodyRef}
                data-testid="news-content-editor"
                value={form.bodyHtml}
                onChange={(event) => update('bodyHtml', event.target.value)}
                className="min-h-[320px] font-mono text-sm"
                required
              />
            </label>
            {preview && (
              <div className="prose max-w-none rounded-md border border-slate-200 bg-slate-50 p-4" dangerouslySetInnerHTML={{ __html: form.bodyHtml }} />
            )}
          </Panel>

          <Panel className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>Cover image URL</span>
                <Input data-testid="news-cover-image-input" value={form.coverImageUrl} onChange={(event) => update('coverImageUrl', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Alt cover</span>
                <Input data-testid="news-cover-image-alt-input" value={form.coverImageAlt} onChange={(event) => update('coverImageAlt', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold md:col-span-2">
                <span>Upload cover</span>
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'cover')} />
              </label>
            </div>
            {form.coverImageUrl && <img data-testid="news-cover-image-preview" src={form.coverImageUrl} alt={form.coverImageAlt || ''} className="aspect-[16/7] w-full rounded-md object-cover" />}
          </Panel>

          <Panel className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1 text-sm font-semibold">
                <span>Ảnh body URL</span>
                <Input data-testid="news-content-image-input" value={bodyImage.url} onChange={(event) => setBodyImage((current) => ({ ...current, url: event.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Alt text</span>
                <Input value={bodyImage.alt} onChange={(event) => setBodyImage((current) => ({ ...current, alt: event.target.value }))} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Caption</span>
                <Input value={bodyImage.caption} onChange={(event) => setBodyImage((current) => ({ ...current, caption: event.target.value }))} />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button data-testid="news-content-image-button" type="button" variant="ghost" onClick={insertBodyImage}>
                <Image size={18} aria-hidden="true" />
                Chèn ảnh
              </Button>
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-mint">
                <Upload size={18} aria-hidden="true" />
                {uploading === 'body' ? 'Đang upload' : 'Upload ảnh body'}
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'body')} />
              </label>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>Focus keyword</span>
                <Input data-testid="news-focus-keyword-input" value={form.focusKeyword} onChange={(event) => update('focusKeyword', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>SEO title</span>
                <Input data-testid="news-seo-title-input" value={form.seoTitle} onChange={(event) => update('seoTitle', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold md:col-span-2">
                <span>Meta description</span>
                <Textarea data-testid="news-seo-description-input" value={form.seoDescription} onChange={(event) => update('seoDescription', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Canonical URL</span>
                <Input data-testid="news-canonical-url-input" value={form.canonicalUrl} onChange={(event) => update('canonicalUrl', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Schema type</span>
                <Select data-testid="news-schema-type-select" value={form.schemaType} onChange={(event) => update('schemaType', event.target.value)}>
                  <option value="Article">Article</option>
                  <option value="NewsArticle">NewsArticle</option>
                  <option value="BlogPosting">BlogPosting</option>
                </Select>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input data-testid="news-noindex-switch" type="checkbox" checked={form.robotsNoIndex} onChange={(event) => update('robotsNoIndex', event.target.checked)} />
                Noindex
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input data-testid="news-nofollow-switch" type="checkbox" checked={form.robotsNoFollow} onChange={(event) => update('robotsNoFollow', event.target.checked)} />
                Nofollow
              </label>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>OG title</span>
                <Input data-testid="news-og-title-input" value={form.ogTitle} onChange={(event) => update('ogTitle', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>OG image</span>
                <Input data-testid="news-og-image-input" value={form.ogImageUrl} onChange={(event) => update('ogImageUrl', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold md:col-span-2">
                <span>OG description</span>
                <Textarea data-testid="news-og-description-input" value={form.ogDescription} onChange={(event) => update('ogDescription', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Twitter title</span>
                <Input data-testid="news-twitter-title-input" value={form.twitterTitle} onChange={(event) => update('twitterTitle', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Twitter image</span>
                <Input data-testid="news-twitter-image-input" value={form.twitterImageUrl} onChange={(event) => update('twitterImageUrl', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold md:col-span-2">
                <span>Twitter description</span>
                <Textarea data-testid="news-twitter-description-input" value={form.twitterDescription} onChange={(event) => update('twitterDescription', event.target.value)} />
              </label>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>Tags</span>
                <Input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="tag 1, tag 2" />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Ngày publish</span>
                <Input type="datetime-local" value={form.publishedAt} onChange={(event) => update('publishedAt', event.target.value)} />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Ngày schedule</span>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(event) => update('scheduledAt', event.target.value)} />
              </label>
              <div className="grid gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={form.isFeatured} onChange={(event) => update('isFeatured', event.target.checked)} />
                  Bài nổi bật
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={form.showOnHome} onChange={(event) => update('showOnHome', event.target.checked)} />
                  Hiển thị trang chủ
                </label>
              </div>
            </div>
          </Panel>

          {(saveArticle.isError || archiveArticle.isError) && (
            <Panel data-testid="toast-error" className="text-sm font-semibold text-rose-700">
              {errorMessage(saveArticle.error ?? archiveArticle.error)}
            </Panel>
          )}
          <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
            <Button data-testid="news-save-draft-button" type="button" variant="ghost" onClick={() => saveArticle.mutate('DRAFT')} disabled={saveArticle.isPending}>
              <Save size={18} aria-hidden="true" />
              Lưu nháp
            </Button>
            <Button data-testid="news-publish-button" type="button" onClick={() => saveArticle.mutate('PUBLISHED')} disabled={saveArticle.isPending}>
              <Save size={18} aria-hidden="true" />
              Publish
            </Button>
            <Button type="submit" disabled={saveArticle.isPending}>
              {saveArticle.isPending ? 'Đang lưu' : 'Lưu'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Panel>
            <div className="grid grid-cols-2 gap-3">
              <div data-testid="news-seo-score" className="rounded-md bg-mint p-3 text-center">
                <p className="text-sm text-slate-600">SEO score</p>
                <p className="text-2xl font-bold text-leaf">{seo.score}</p>
              </div>
              <div data-testid="news-readability-score" className="rounded-md bg-sky p-3 text-center">
                <p className="text-sm text-slate-600">Readability</p>
                <p className="text-2xl font-bold text-ink">{seo.readability}</p>
              </div>
            </div>
            <div data-testid="news-preview-google" className="mt-4 rounded-md border border-slate-200 p-3">
              <p className="truncate text-lg text-blue-700">{form.seoTitle || form.title || 'Tiêu đề SEO'}</p>
              <p className="truncate text-sm text-emerald-700">{form.canonicalUrl || `https://htxonline.vn/tin-tuc/${form.slug || 'slug'}`}</p>
              <p className="mt-1 text-sm text-slate-600">{form.seoDescription || form.excerpt || 'Meta description'}</p>
            </div>
            <div data-testid="news-preview-facebook" className="mt-3 overflow-hidden rounded-md border border-slate-200">
              <div className="aspect-[16/8] bg-slate-100 bg-cover bg-center" style={{ backgroundImage: form.ogImageUrl || form.coverImageUrl ? `url('${form.ogImageUrl || form.coverImageUrl}')` : undefined }} />
              <div className="p-3">
                <p className="font-bold">{form.ogTitle || form.title || 'Tiêu đề chia sẻ'}</p>
                <p className="mt-1 text-sm text-slate-600">{form.ogDescription || form.excerpt || 'Mô tả chia sẻ'}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {seo.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Panel>

          <Panel className="space-y-3">
            <h2 className="text-lg font-bold">Danh mục</h2>
            <Input value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || slugifyLocal(event.target.value) }))} placeholder="Tên danh mục" />
            <Input value={categoryDraft.slug} onChange={(event) => setCategoryDraft((current) => ({ ...current, slug: slugifyLocal(event.target.value) }))} placeholder="slug" />
            <Button type="button" onClick={() => createCategory.mutate()} disabled={!categoryDraft.name || createCategory.isPending}>
              <Plus size={18} aria-hidden="true" />
              Thêm danh mục
            </Button>
            <div className="flex flex-wrap gap-2">
              {categoryItems.map((category) => (
                <Badge key={category.id} className="bg-slate-100 text-slate-700">{category.name}</Badge>
              ))}
            </div>
          </Panel>

          <Panel className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài viết" />
            </div>
            {articles.isLoading && <p className="text-sm text-slate-600">Đang tải...</p>}
            <div className="space-y-2">
              {articleItems.map((article) => (
                <div key={article.id} className={cn('rounded-md border border-slate-200 p-3', editingId === article.id && 'border-leaf bg-mint')}>
                  <button type="button" className="block w-full text-left font-bold text-ink" onClick={() => edit(article)}>
                    {article.title}
                  </button>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Badge className={statusClass(article.status)}>{article.status}</Badge>
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    <span>SEO {article.seoScore}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => edit(article)}>Sửa</Button>
                    <Button type="button" variant="danger" onClick={() => archiveArticle.mutate(article.id)}>Ẩn</Button>
                  </div>
                </div>
              ))}
              {!articles.isLoading && articleItems.length === 0 && <p className="text-sm text-slate-600">Chưa có bài viết.</p>}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function formPayload(form: NewsForm) {
  return {
    ...form,
    categoryId: form.categoryId || undefined,
    coverImageUrl: form.coverImageUrl || undefined,
    coverImageAlt: form.coverImageAlt || undefined,
    excerpt: form.excerpt || undefined,
    focusKeyword: form.focusKeyword || undefined,
    seoTitle: form.seoTitle || undefined,
    seoDescription: form.seoDescription || undefined,
    canonicalUrl: form.canonicalUrl || undefined,
    ogTitle: form.ogTitle || undefined,
    ogDescription: form.ogDescription || undefined,
    ogImageUrl: form.ogImageUrl || undefined,
    twitterTitle: form.twitterTitle || undefined,
    twitterDescription: form.twitterDescription || undefined,
    twitterImageUrl: form.twitterImageUrl || undefined,
    tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined
  };
}

function fromArticle(article: NewsArticle): NewsForm {
  return {
    categoryId: article.categoryId ?? '',
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? '',
    bodyHtml: article.bodyHtml,
    coverImageUrl: article.coverImageUrl ?? '',
    coverImageAlt: article.coverImageAlt ?? '',
    status: article.status,
    isFeatured: article.isFeatured,
    showOnHome: article.showOnHome,
    focusKeyword: article.focusKeyword ?? '',
    seoTitle: article.seoTitle ?? '',
    seoDescription: article.seoDescription ?? '',
    canonicalUrl: article.canonicalUrl ?? '',
    robotsNoIndex: article.robotsNoIndex,
    robotsNoFollow: article.robotsNoFollow,
    schemaType: article.schemaType || 'NewsArticle',
    ogTitle: article.ogTitle ?? '',
    ogDescription: article.ogDescription ?? '',
    ogImageUrl: article.ogImageUrl ?? '',
    twitterTitle: article.twitterTitle ?? '',
    twitterDescription: article.twitterDescription ?? '',
    twitterImageUrl: article.twitterImageUrl ?? '',
    tags: article.tagsJson?.join(', ') ?? '',
    publishedAt: dateInputValue(article.publishedAt),
    scheduledAt: dateInputValue(article.scheduledAt)
  };
}

function clientSeoScore(form: NewsForm) {
  const notes: string[] = [];
  let score = 0;
  if (form.seoTitle.length >= 30 && form.seoTitle.length <= 70) score += 20;
  else notes.push('SEO title nên dài 30-70 ký tự.');
  if (form.seoDescription.length >= 120 && form.seoDescription.length <= 170) score += 20;
  else notes.push('Meta description nên dài 120-170 ký tự.');
  const keyword = form.focusKeyword.trim().toLowerCase();
  if (keyword) {
    if (`${form.title} ${form.seoTitle}`.toLowerCase().includes(keyword)) score += 15;
    else notes.push('Keyword nên xuất hiện trong title.');
    if (form.slug.includes(slugifyLocal(keyword))) score += 15;
    else notes.push('Keyword nên xuất hiện trong slug.');
    if (form.seoDescription.toLowerCase().includes(keyword)) score += 15;
    else notes.push('Keyword nên xuất hiện trong meta description.');
    if (stripHtml(form.bodyHtml).toLowerCase().includes(keyword)) score += 10;
  } else {
    notes.push('Nên nhập focus keyword.');
  }
  if (form.coverImageAlt) score += 5;
  else notes.push('Ảnh đại diện nên có alt text.');
  const words = stripHtml(form.bodyHtml).split(/\s+/).filter(Boolean).length;
  const sentences = Math.max(stripHtml(form.bodyHtml).split(/[.!?]+/).filter(Boolean).length, 1);
  const avg = words / sentences;
  const readability = words ? (avg <= 18 ? 90 : avg <= 28 ? 75 : avg <= 40 ? 55 : 35) : 0;
  return { score: Math.min(score, 100), readability, notes };
}

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'bg-mint text-leaf';
  if (status === 'DRAFT') return 'bg-sky text-slate-700';
  return 'bg-stone-100 text-stone-700';
}

function slugifyLocal(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

function dateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
