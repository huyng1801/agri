'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bold,
  Code2,
  Eye,
  FileText,
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
  Sparkles,
  Target,
  Upload
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from 'react';
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

type SeoCheck = {
  label: string;
  detail: string;
  ok: boolean;
  actionId?: 'seo-defaults' | 'focus-keyword' | 'content' | 'cover' | 'internal-link' | 'intro-keyword';
  actionLabel?: string;
};

type SeoScoreResult = {
  score: number;
  readability: number;
  notes: string[];
  strengths: string[];
  checks: SeoCheck[];
  stats: {
    words: number;
    headings: number;
    images: number;
    internalLinks: number;
    keywordMatches: number;
    keywordDensity: number;
    titleLength: number;
    descriptionLength: number;
  };
};

type InternalLinkSuggestion = {
  label: string;
  href: string;
  description: string;
};

type NextStepSuggestion = {
  id: 'title' | 'content' | 'cover' | 'excerpt' | 'seo' | 'links';
  title: string;
  detail: string;
  actionLabel: string;
};

type QuickWinSuggestion = {
  id: 'title' | 'excerpt' | 'keyword' | 'intro' | 'cover-alt' | 'tags' | 'heading' | 'link';
  title: string;
  detail: string;
  actionLabel: string;
};

type AutofillItem = {
  id: 'slug' | 'excerpt' | 'keyword' | 'seoTitle' | 'seoDescription' | 'canonical' | 'social' | 'coverAlt' | 'intro' | 'heading' | 'link' | 'tags';
  label: string;
};

type PreparedDiffItem = {
  id: 'slug' | 'excerpt' | 'keyword' | 'seoTitle' | 'seoDescription' | 'canonical' | 'coverAlt' | 'body' | 'tags';
  label: string;
  before: string;
  after: string;
};

type ResolvedMetaPreview = {
  keyword: string;
  tags: string[];
  title: string;
  description: string;
  canonical: string;
  robots: string;
  schemaType: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

type ContentOutlinePreview = {
  headings: Array<{ level: 'H2' | 'H3'; text: string }>;
  paragraphCount: number;
  imageCount: number;
  imagesMissingAlt: number;
  internalLinks: number;
  estimatedMinutes: number;
};

type SeoSignalAction = QuickWinSuggestion['id'] | 'seo-defaults';

type SeoSignal = {
  id:
    | 'keyword-title'
    | 'keyword-slug'
    | 'keyword-intro'
    | 'meta-description'
    | 'cover-alt'
    | 'heading-structure'
    | 'internal-link'
    | 'social-preview'
    | 'readability';
  label: string;
  detail: string;
  ok: boolean;
  priority: 'must' | 'should';
  actionId?: SeoSignalAction;
  actionLabel?: string;
};

type CorePublishItem = {
  id: 'title' | 'content' | 'cover';
  label: string;
  ok: boolean;
  hint: string;
};

type EditorMode = 'visual' | 'html';
type AuthorMode = 'simple' | 'advanced';

type LocalDraftPayload = {
  savedAt: string;
  form: NewsForm;
  editingId: string | null;
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

const articleTemplates = [
  {
    id: 'market-update',
    label: 'Tin thị trường',
    description: 'Dùng cho bài cập nhật giá, nhu cầu mua bán và xu hướng tiêu thụ.',
    categoryHint: 'Danh mục gợi ý: Tin thị trường',
    title: 'Cập nhật thị trường nông sản tuần này',
    excerpt: 'Tóm tắt ngắn 2-3 ý chính để người đọc hiểu ngay điều gì đang thay đổi trên thị trường.',
    schemaType: 'NewsArticle',
    bodyHtml: `<h2>Tổng quan nhanh</h2>
<p>Trong tuần này, thị trường ghi nhận các thay đổi đáng chú ý về giá bán, nhu cầu tiêu thụ và nguồn cung ở một số nhóm nông sản chủ lực.</p>
<ul>
  <li>Mặt hàng tăng giá:</li>
  <li>Mặt hàng giữ giá:</li>
  <li>Mặt hàng cần theo dõi thêm:</li>
</ul>
<h2>Tín hiệu từ HTX và vùng sản xuất</h2>
<p>Chèn nhận định ngắn từ HTX, ví dụ: đơn hàng tăng, sản lượng ổn định hoặc cần điều chỉnh kế hoạch thu hoạch.</p>
<blockquote>Gợi ý: thêm 1 câu trích dẫn ngắn từ đại diện HTX để bài viết gần gũi hơn.</blockquote>
<h2>Khuyến nghị cho người mua</h2>
<p>Nêu rõ người mua nên đặt sớm, ưu tiên sản phẩm nào, hoặc cách theo dõi QR Passport để kiểm tra nguồn gốc.</p>`
  },
  {
    id: 'cooperative-story',
    label: 'Giới thiệu HTX',
    description: 'Dùng cho bài kể câu chuyện HTX, vùng trồng, con người và sản phẩm nổi bật.',
    categoryHint: 'Danh mục gợi ý: Câu chuyện HTX',
    title: 'Câu chuyện từ một hợp tác xã đang chuyển đổi số cùng HTXONLINE',
    excerpt: 'Giới thiệu ngắn về HTX, sản phẩm chủ lực và điều gì khiến đơn vị này khác biệt trên thị trường.',
    schemaType: 'Article',
    bodyHtml: `<h2>HTX là ai?</h2>
<p>Giới thiệu tên HTX, địa phương, sản phẩm chính và mục tiêu phát triển trong giai đoạn hiện tại.</p>
<h2>Điểm mạnh nổi bật</h2>
<ul>
  <li>Sản phẩm chủ lực:</li>
  <li>Vùng trồng / vùng nuôi:</li>
  <li>Quy trình truy xuất:</li>
  <li>Cam kết chất lượng:</li>
</ul>
<h2>Vì sao HTX tham gia HTXONLINE?</h2>
<p>Chia sẻ ngắn về nhu cầu minh bạch thông tin, mở rộng thị trường hoặc quản lý đơn hàng hiệu quả hơn.</p>
<h2>Sản phẩm nên xem ngay</h2>
<p>Chèn liên kết hoặc mô tả 1-3 sản phẩm public mà bạn muốn đẩy traffic.</p>`
  },
  {
    id: 'buyer-guide',
    label: 'Hướng dẫn mua hàng',
    description: 'Dùng cho bài hướng dẫn thao tác, cách đặt hàng, cách quét QR và xem thông tin công khai.',
    categoryHint: 'Danh mục gợi ý: Hướng dẫn mua hàng',
    title: 'Cách chọn sản phẩm và đặt hàng nhanh trên HTXONLINE',
    excerpt: 'Bài hướng dẫn ngắn giúp người mua tìm sản phẩm, kiểm tra QR Passport và gửi đơn hàng thuận tiện.',
    schemaType: 'BlogPosting',
    bodyHtml: `<h2>Bước 1: Tìm đúng sản phẩm</h2>
<p>Hướng dẫn người mua dùng ô tìm kiếm, lọc theo HTX hoặc địa phương để chọn đúng mặt hàng.</p>
<h2>Bước 2: Kiểm tra thông tin công khai</h2>
<ul>
  <li>Xem mô tả sản phẩm</li>
  <li>Xem HTX cung cấp</li>
  <li>Quét hoặc mở QR Passport nếu có</li>
</ul>
<h2>Bước 3: Gửi đơn hàng</h2>
<p>Mô tả ngắn cách thêm vào giỏ, điền thông tin liên hệ và chờ HTX xác nhận đơn COD.</p>
<h2>Lưu ý sau khi đặt hàng</h2>
<p>Nhắc người mua giữ điện thoại mở, kiểm tra cuộc gọi xác nhận và tra cứu đơn nếu cần.</p>`
  }
] as const;

const defaultInternalLinkSuggestions: InternalLinkSuggestion[] = [
  { label: 'Trang sản phẩm', href: '/san-pham', description: 'Kéo traffic về danh sách sản phẩm public.' },
  { label: 'Danh sách HTX', href: '/htx', description: 'Dẫn người đọc sang trang hợp tác xã công khai.' },
  { label: 'Liên hệ tư vấn', href: '/lien-he', description: 'Gắn CTA khi bài cần chốt lead nhanh.' },
  { label: 'Giới thiệu nền tảng', href: '/gioi-thieu', description: 'Phù hợp bài giải thích mô hình HTXONLINE.' },
  { label: 'Tin tức HTXONLINE', href: '/tin-tuc', description: 'Dùng để liên kết lại hub nội dung chính.' }
];

function buildPreparedNewsForm(form: NewsForm): NewsForm {
  const preparedBodyHtml = buildPreparedBodyHtml(form);
  const bodyText = stripHtml(preparedBodyHtml);
  const canonicalSlug = form.slug || slugifyLocal(form.title);
  const fallbackExcerpt = form.excerpt || trimText(bodyText, 180);
  const fallbackDescription = trimText(fallbackExcerpt || bodyText, 155);
  const seoTitle = trimText(form.seoTitle || form.title, 65);
  const socialTitle = trimText(form.ogTitle || form.twitterTitle || seoTitle || form.title, 70);
  const suggestedTags = suggestTags(form);
  const currentTags = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const mergedTags = Array.from(new Set([...currentTags, ...suggestedTags])).slice(0, 8);

  return {
    ...form,
    bodyHtml: preparedBodyHtml,
    slug: form.slug || canonicalSlug,
    excerpt: form.excerpt || fallbackExcerpt,
    focusKeyword: form.focusKeyword || form.title.trim(),
    seoTitle: form.seoTitle || seoTitle,
    seoDescription: form.seoDescription || fallbackDescription,
    canonicalUrl: form.canonicalUrl || (canonicalSlug ? `https://htxonline.vn/tin-tuc/${canonicalSlug}` : ''),
    ogTitle: form.ogTitle || socialTitle,
    ogDescription: form.ogDescription || form.seoDescription || fallbackDescription,
    ogImageUrl: form.ogImageUrl || form.coverImageUrl,
    twitterTitle: form.twitterTitle || socialTitle,
    twitterDescription: form.twitterDescription || form.seoDescription || fallbackDescription,
    twitterImageUrl: form.twitterImageUrl || form.coverImageUrl,
    coverImageAlt: form.coverImageAlt || form.focusKeyword || form.title,
    tags: mergedTags.join(', '),
    status: form.status === 'ARCHIVED' ? 'DRAFT' : form.status
  };
}

export default function NewsDashboardPage() {
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const visualEditorRef = useRef<HTMLDivElement | null>(null);
  const skipAutosaveRef = useRef(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [authorMode, setAuthorMode] = useState<AuthorMode>('simple');
  const [categoryDraft, setCategoryDraft] = useState({ name: '', slug: '' });
  const [bodyImage, setBodyImage] = useState({ url: '', alt: '', caption: '' });
  const [uploading, setUploading] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState('');
  const [localDraft, setLocalDraft] = useState<LocalDraftPayload | null>(null);
  const [draggingEditor, setDraggingEditor] = useState(false);

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
  const permalink = form.canonicalUrl || `https://htxonline.vn/tin-tuc/${form.slug || 'slug'}`;
  const excerptLength = form.excerpt.trim().length;
  const readingMinutes = Math.max(1, Math.ceil(seo.stats.words / 220));
  const publishReadiness = useMemo(() => buildPublishReadiness(form, seo), [form, seo]);
  const localDraftStorageKey = useMemo(() => `htxonline-news-draft:${editingId || 'new'}`, [editingId]);
  const internalLinkSuggestions = useMemo(() => buildInternalLinkSuggestions(form), [form]);
  const focusKeywordSuggestions = useMemo(() => suggestFocusKeywords(form), [form]);
  const nextStepSuggestions = useMemo(() => buildNextStepSuggestions(form, seo), [form, seo]);
  const quickWins = useMemo(() => buildQuickWins(form, seo, focusKeywordSuggestions), [form, seo, focusKeywordSuggestions]);
  const autofillPlan = useMemo(() => buildAutofillPlan(form, seo), [form, seo]);
  const preparedPreview = useMemo(() => buildPreparedNewsForm(form), [form]);
  const preparedDiffs = useMemo(() => buildPreparedDiffs(form, preparedPreview), [form, preparedPreview]);
  const resolvedMetaPreview = useMemo(() => buildResolvedMetaPreview(preparedPreview), [preparedPreview]);
  const contentOutlinePreview = useMemo(() => buildContentOutlinePreview(preparedPreview), [preparedPreview]);
  const seoSignals = useMemo(() => buildSeoSignals(form, seo), [form, seo]);
  const needsImportedOptimization = useMemo(() => detectImportedFormatting(form.bodyHtml), [form.bodyHtml]);
  const corePublishItems = useMemo(() => buildCorePublishItems(form), [form]);
  const corePublishReady = corePublishItems.filter((item) => item.ok).length;
  const canQuickPublish = corePublishItems.every((item) => item.ok);
  const titleLength = form.title.trim().length;
  const slugLength = form.slug.trim().length;
  const seoTitleLength = (form.seoTitle || form.title).trim().length;
  const seoDescriptionLength = form.seoDescription.trim().length;
  const isAdvancedMode = authorMode === 'advanced';
  const isSimpleMode = authorMode === 'simple';
  const seoAdvancedOpen = Boolean(
    form.focusKeyword.trim() ||
      form.seoTitle.trim() ||
      form.seoDescription.trim() ||
      form.canonicalUrl.trim() ||
      form.robotsNoIndex ||
      form.robotsNoFollow
  );
  const socialAdvancedOpen = Boolean(
    form.ogTitle.trim() ||
      form.ogDescription.trim() ||
      form.ogImageUrl.trim() ||
      form.twitterTitle.trim() ||
      form.twitterDescription.trim() ||
      form.twitterImageUrl.trim()
  );
  const publishChecklistIssues = publishReadiness.items.filter((item) => !item.ok).length;
  const quickWinCount = quickWins.length;
  const nextStepCount = nextStepSuggestions.length;
  const seoMustFixCount = seoSignals.filter((item) => !item.ok && item.priority === 'must').length;
  const seoShouldFixCount = seoSignals.filter((item) => !item.ok && item.priority === 'should').length;
  const detailHelpersOpen = isAdvancedMode;
  const publishChecklistOpen = isAdvancedMode;
  const seoReviewOpen = isAdvancedMode;
  const outlineReviewOpen = isAdvancedMode;
  const articleLibraryOpen = isAdvancedMode || Boolean(search.trim()) || Boolean(editingId);
  const bodyUploadActive = uploading === 'body';
  const coverUploadActive = uploading === 'cover';
  const preparePreviewOpen = isAdvancedMode;
  const simpleSeoBoardOpen = isAdvancedMode || seoMustFixCount > 0;
  const templateLibraryOpen = isAdvancedMode;
  const editorTipsOpen = isAdvancedMode || needsImportedOptimization || bodyUploadActive || draggingEditor;

  useEffect(() => {
    const editor = visualEditorRef.current;
    if (!editor || editorMode !== 'visual') return;
    if (editor.innerHTML !== form.bodyHtml) {
      editor.innerHTML = form.bodyHtml || '<p></p>';
    }
  }, [editorMode, form.bodyHtml, editingId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(localDraftStorageKey);
      if (!raw) {
        setLocalDraft(null);
        return;
      }
      const parsed = JSON.parse(raw) as LocalDraftPayload;
      if (!parsed?.form || !parsed.savedAt) {
        setLocalDraft(null);
        return;
      }
      setLocalDraft(parsed);
    } catch {
      setLocalDraft(null);
    }
  }, [localDraftStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    if (!hasMeaningfulDraft(form)) {
      window.localStorage.removeItem(localDraftStorageKey);
      setDraftSavedAt('');
      return;
    }
    const timeoutId = window.setTimeout(() => {
      const payload: LocalDraftPayload = {
        savedAt: new Date().toISOString(),
        form,
        editingId
      };
      window.localStorage.setItem(localDraftStorageKey, JSON.stringify(payload));
      setDraftSavedAt(payload.savedAt);
      setLocalDraft(payload);
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [editingId, form, localDraftStorageKey]);

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
      clearLocalDraft();
      queryClient.invalidateQueries({ queryKey: ['news'] });
    }
  });

  const quickPublishArticle = useMutation({
    mutationFn: () => {
      const prepared = buildPreparedNewsForm({ ...form, status: 'PUBLISHED' });
      const payload = formPayload(prepared);
      return editingId
        ? apiFetch<NewsArticle>(`/news/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<NewsArticle>('/news', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setForm(fromArticle(result.data));
      clearLocalDraft();
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

  function updateVisualEditorHtml(nextHtml: string) {
    update('bodyHtml', nextHtml || '<p></p>');
  }

  function syncVisualEditor() {
    const editor = visualEditorRef.current;
    if (!editor) return;
    updateVisualEditorHtml(editor.innerHTML);
  }

  function focusVisualEditor() {
    visualEditorRef.current?.focus();
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

  function restoreLocalDraft() {
    if (!localDraft) return;
    skipAutosaveRef.current = true;
    setEditingId(localDraft.editingId);
    setForm(localDraft.form);
    setDraftSavedAt(localDraft.savedAt);
    setPreview(false);
    window.requestAnimationFrame(() => {
      if (editorMode === 'visual') focusVisualEditor();
      else bodyRef.current?.focus();
    });
  }

  function clearLocalDraft() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(localDraftStorageKey);
    }
    setLocalDraft(null);
    setDraftSavedAt('');
  }

  function insertHtml(snippet: string) {
    if (editorMode === 'visual') {
      insertVisualSnippet(snippet);
      return;
    }
    insertHtmlAtSelection(snippet);
  }

  function insertHtmlAtSelection(snippet: string, selection?: { start: number; end: number }) {
    const field = bodyRef.current;
    const start = selection?.start ?? field?.selectionStart ?? form.bodyHtml.length;
    const end = selection?.end ?? field?.selectionEnd ?? form.bodyHtml.length;
    const next = `${form.bodyHtml.slice(0, start)}${snippet}${form.bodyHtml.slice(end)}`;
    update('bodyHtml', next);
    window.requestAnimationFrame(() => {
      if (!field) return;
      field.focus();
      const cursor = start + snippet.length;
      field.setSelectionRange(cursor, cursor);
    });
  }

  function insertHtmlIntoVisualEditor(html: string) {
    focusVisualEditor();
    document.execCommand('insertHTML', false, html);
    syncVisualEditor();
  }

  function insertVisualSnippet(snippet: string) {
    if (snippet.startsWith('<h2')) {
      focusVisualEditor();
      document.execCommand('formatBlock', false, 'h2');
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<h3')) {
      focusVisualEditor();
      document.execCommand('formatBlock', false, 'h3');
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<strong')) {
      focusVisualEditor();
      document.execCommand('bold');
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<em')) {
      focusVisualEditor();
      document.execCommand('italic');
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<a ')) {
      const url = window.prompt('Nhập liên kết cần chèn', 'https://htxonline.vn');
      if (!url) return;
      focusVisualEditor();
      document.execCommand('createLink', false, url);
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<ul')) {
      focusVisualEditor();
      document.execCommand('insertUnorderedList');
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<ol')) {
      focusVisualEditor();
      document.execCommand('insertOrderedList');
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<blockquote')) {
      focusVisualEditor();
      document.execCommand('formatBlock', false, 'blockquote');
      syncVisualEditor();
      return;
    }
    insertHtmlIntoVisualEditor(snippet);
  }

  async function uploadFile(file: File, target: 'cover' | 'body'): Promise<string | null> {
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
      return url;
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Upload thất bại');
      return null;
    } finally {
      setUploading('');
    }
  }

  function insertBodyImage() {
    if (!bodyImage.url) return;
    const alt = escapeHtml(bodyImage.alt || 'Ảnh minh họa');
    const caption = bodyImage.caption ? `<figcaption>${escapeHtml(bodyImage.caption)}</figcaption>` : '';
    const imageHtml = `<figure><img src="${bodyImage.url}" alt="${alt}" loading="lazy" />${caption}</figure>`;
    if (editorMode === 'visual') insertHtmlIntoVisualEditor(imageHtml);
    else insertHtml(imageHtml);
    setBodyImage({ url: '', alt: '', caption: '' });
  }

  async function handleBodyPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();
    const selection = {
      start: event.currentTarget.selectionStart,
      end: event.currentTarget.selectionEnd
    };
    const url = await uploadFile(file, 'body');
    if (!url) return;
    const alt = escapeHtml(form.coverImageAlt || form.focusKeyword || form.title || file.name.replace(/\.[^.]+$/, ''));
    insertHtmlAtSelection(`<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`, selection);
  }

  async function handleVisualPaste(event: ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      const url = await uploadFile(file, 'body');
      if (!url) return;
      const alt = escapeHtml(form.coverImageAlt || form.focusKeyword || form.title || file.name.replace(/\.[^.]+$/, ''));
      insertHtmlIntoVisualEditor(`<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`);
      return;
    }

    const html = event.clipboardData?.getData('text/html') || '';
    const text = event.clipboardData?.getData('text/plain') || '';
    if (!html && !text.trim()) return;

    event.preventDefault();
    const cleaned = html ? sanitizeImportedHtml(html) : plainTextToEditorHtml(text);
    if (!cleaned.trim()) return;
    insertHtmlIntoVisualEditor(cleaned);
  }

  async function handleDroppedFiles(fileList: FileList | null) {
    const file = Array.from(fileList ?? []).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    const url = await uploadFile(file, 'body');
    if (!url) return;
    const alt = escapeHtml(form.coverImageAlt || form.focusKeyword || form.title || file.name.replace(/\.[^.]+$/, ''));
    const imageHtml = `<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`;
    if (editorMode === 'visual') insertHtmlIntoVisualEditor(imageHtml);
    else insertHtml(imageHtml);
  }

  async function handleCoverFiles(fileList: FileList | null) {
    const file = Array.from(fileList ?? []).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    await handleCoverFile(file);
  }

  async function handleCoverFile(file: File) {
    await uploadFile(file, 'cover');
    setForm((current) => ({
      ...current,
      coverImageAlt: current.coverImageAlt || current.focusKeyword || current.title || file.name.replace(/\.[^.]+$/, '')
    }));
  }

  function fillSuggestedTags() {
    const suggested = suggestTags(form);
    if (!suggested.length) {
      window.alert('Chưa đủ dữ liệu để gợi ý tag. Hãy nhập tiêu đề hoặc từ khóa trước.');
      return;
    }
    setForm((current) => {
      const currentTags = current.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const merged = Array.from(new Set([...currentTags, ...suggested]));
      return {
        ...current,
        tags: merged.join(', ')
      };
    });
  }

  function applyQuickSeoFixes() {
    const bodyText = stripHtml(form.bodyHtml);
    const canonicalSlug = form.slug || slugifyLocal(form.title);
    const fallbackExcerpt = form.excerpt || trimText(bodyText, 180);
    const fallbackDescription = trimText(fallbackExcerpt || bodyText, 155);
    const title = trimText(form.seoTitle || form.title, 65);
    const suggestedTags = suggestTags(form);

    setForm((current) => {
      const currentTags = current.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const mergedTags = Array.from(new Set([...currentTags, ...suggestedTags])).slice(0, 8);

      return {
        ...current,
        slug: current.slug || canonicalSlug,
        excerpt: current.excerpt || fallbackExcerpt,
        focusKeyword: current.focusKeyword || current.title.trim(),
        seoTitle: current.seoTitle || title,
        seoDescription: current.seoDescription || fallbackDescription,
        canonicalUrl: current.canonicalUrl || (canonicalSlug ? `https://htxonline.vn/tin-tuc/${canonicalSlug}` : ''),
        ogTitle: current.ogTitle || title,
        ogDescription: current.ogDescription || current.seoDescription || fallbackDescription,
        ogImageUrl: current.ogImageUrl || current.coverImageUrl,
        twitterTitle: current.twitterTitle || title,
        twitterDescription: current.twitterDescription || current.seoDescription || fallbackDescription,
        twitterImageUrl: current.twitterImageUrl || current.coverImageUrl,
        coverImageAlt: current.coverImageAlt || current.title || current.focusKeyword,
        tags: mergedTags.join(', ')
      };
    });
  }

  function applyTemplate(templateId: string) {
    const template = articleTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setEditingId(null);
    setPreview(false);
    setForm((current) => ({
      ...current,
      title: current.title || template.title,
      slug: current.slug || slugifyLocal(template.title),
      excerpt: current.excerpt || template.excerpt,
      bodyHtml: template.bodyHtml,
      schemaType: template.schemaType,
      status: 'DRAFT'
    }));
    window.requestAnimationFrame(() => {
      if (editorMode === 'visual') focusVisualEditor();
      else bodyRef.current?.focus();
    });
  }

  function fillSeoDefaults() {
    const bodyText = stripHtml(form.bodyHtml);
    const canonicalSlug = form.slug || slugifyLocal(form.title);
    const fallbackDescription = trimText(form.excerpt || bodyText, 155);
    const seoTitle = trimText(form.seoTitle || form.title, 65);
    const socialTitle = trimText(form.ogTitle || form.twitterTitle || seoTitle || form.title, 70);

    setForm((current) => ({
      ...current,
      slug: current.slug || canonicalSlug,
      focusKeyword: current.focusKeyword || current.title.trim(),
      seoTitle,
      seoDescription: current.seoDescription || fallbackDescription,
      canonicalUrl: current.canonicalUrl || (canonicalSlug ? `https://htxonline.vn/tin-tuc/${canonicalSlug}` : ''),
      ogTitle: current.ogTitle || socialTitle,
      ogDescription: current.ogDescription || current.seoDescription || fallbackDescription,
      ogImageUrl: current.ogImageUrl || current.coverImageUrl,
      twitterTitle: current.twitterTitle || socialTitle,
      twitterDescription: current.twitterDescription || current.seoDescription || fallbackDescription,
      twitterImageUrl: current.twitterImageUrl || current.coverImageUrl,
      coverImageAlt: current.coverImageAlt || current.title
    }));
  }

  function syncSocialFromSeo() {
    setForm((current) => ({
      ...current,
      ogTitle: current.seoTitle || current.title,
      ogDescription: current.seoDescription || current.excerpt,
      ogImageUrl: current.ogImageUrl || current.coverImageUrl,
      twitterTitle: current.seoTitle || current.title,
      twitterDescription: current.seoDescription || current.excerpt,
      twitterImageUrl: current.twitterImageUrl || current.coverImageUrl
    }));
  }

  function optimizeImportedArticle() {
    const cleanedBody = sanitizeImportedHtml(form.bodyHtml || '');
    const nextForm = buildPreparedNewsForm({
      ...form,
      bodyHtml: cleanedBody || form.bodyHtml || '<p></p>'
    });
    setForm(nextForm);
    window.requestAnimationFrame(() => {
      if (editorMode === 'visual' && visualEditorRef.current) {
        visualEditorRef.current.innerHTML = nextForm.bodyHtml || '<p></p>';
      }
    });
  }

  function preparePostForPublish() {
    setForm((current) => buildPreparedNewsForm(current));
  }

  function applyFocusKeywordSuggestion(keyword: string) {
    if (!keyword.trim()) return;
    setForm((current) => ({
      ...current,
      focusKeyword: keyword,
      coverImageAlt: current.coverImageAlt || keyword
    }));
  }

  function ensureKeywordInIntro() {
    const keyword = form.focusKeyword.trim() || form.title.trim();
    if (!keyword) return;
    const bodyText = stripHtml(form.bodyHtml).toLowerCase();
    if (bodyText.slice(0, 180).includes(keyword.toLowerCase())) return;

    const introParagraph = `<p><strong>${escapeHtml(keyword)}</strong> la noi dung trong tam cua bai viet nay. Duoi day la nhung thong tin quan trong de nguoi doc va Google hieu nhanh chu de ban dang dang.</p>`;
    if (editorMode === 'visual') {
      update('bodyHtml', `${introParagraph}${form.bodyHtml}`);
      window.requestAnimationFrame(() => {
        if (visualEditorRef.current) visualEditorRef.current.innerHTML = `${introParagraph}${form.bodyHtml}`;
      });
      return;
    }
    update('bodyHtml', `${introParagraph}${form.bodyHtml}`);
  }

  function ensureHeadingStructure() {
    const currentBody = form.bodyHtml || '<p></p>';
    if (/<h[23][^>]*>/i.test(currentBody)) return;
    const headingBlock = '<h2>Thong tin chinh</h2><p>Bo sung y chinh quan trong tai day.</p><h2>Noi dung can biet</h2><p>Mo rong them chi tiet, loi ich hoac huong dan cu the.</p>';
    update('bodyHtml', `${headingBlock}${currentBody}`);
    window.requestAnimationFrame(() => {
      if (editorMode === 'visual' && visualEditorRef.current) {
        visualEditorRef.current.innerHTML = `${headingBlock}${currentBody}`;
      }
    });
  }

  function fillExcerptFromBody() {
    const fallbackExcerpt = trimText(stripHtml(form.bodyHtml), 180);
    if (!fallbackExcerpt) return;
    update('excerpt', fallbackExcerpt);
  }

  function cleanPastedContent() {
    const cleaned = sanitizeImportedHtml(form.bodyHtml);
    if (!cleaned.trim()) return;
    update('bodyHtml', cleaned);
    window.requestAnimationFrame(() => {
      if (editorMode === 'visual' && visualEditorRef.current) {
        visualEditorRef.current.innerHTML = cleaned;
      }
    });
  }

  async function copyPermalink() {
    try {
      await navigator.clipboard.writeText(permalink);
      window.alert('Đã copy permalink bài viết.');
    } catch {
      window.alert('Không thể copy permalink trên trình duyệt này.');
    }
  }

  function insertInternalLink(suggestion: InternalLinkSuggestion) {
    const snippet = `<p><a href="${suggestion.href}">${escapeHtml(suggestion.label)}</a></p>`;
    if (editorMode === 'visual') insertHtmlIntoVisualEditor(snippet);
    else insertHtml(snippet);
  }

  function runNextStepSuggestion(stepId: NextStepSuggestion['id']) {
    if (stepId === 'title') {
      document.querySelector<HTMLInputElement>('[data-testid="news-title-input"]')?.focus();
      return;
    }
    if (stepId === 'content') {
      if (editorMode === 'visual') focusVisualEditor();
      else bodyRef.current?.focus();
      return;
    }
    if (stepId === 'cover') {
      document.querySelector<HTMLInputElement>('[data-testid="news-cover-image-input"]')?.focus();
      return;
    }
    if (stepId === 'excerpt') {
      fillExcerptFromBody();
      return;
    }
    if (stepId === 'seo') {
      applyQuickSeoFixes();
      return;
    }
    if (stepId === 'links') {
      insertInternalLink(internalLinkSuggestions[0] ?? defaultInternalLinkSuggestions[0]);
    }
  }

  function runQuickWin(winId: QuickWinSuggestion['id']) {
    if (winId === 'title') {
      document.querySelector<HTMLInputElement>('[data-testid="news-title-input"]')?.focus();
      return;
    }
    if (winId === 'excerpt') {
      fillExcerptFromBody();
      return;
    }
    if (winId === 'keyword') {
      if (focusKeywordSuggestions[0]) {
        applyFocusKeywordSuggestion(focusKeywordSuggestions[0]);
        return;
      }
      document.querySelector<HTMLInputElement>('[data-testid="news-focus-keyword-input"]')?.focus();
      return;
    }
    if (winId === 'intro') {
      ensureKeywordInIntro();
      return;
    }
    if (winId === 'cover-alt') {
      update('coverImageAlt', form.coverImageAlt || form.focusKeyword || form.title);
      return;
    }
    if (winId === 'tags') {
      fillSuggestedTags();
      return;
    }
    if (winId === 'heading') {
      ensureHeadingStructure();
      return;
    }
    if (winId === 'link') {
      insertInternalLink(internalLinkSuggestions[0] ?? defaultInternalLinkSuggestions[0]);
    }
  }

  function runSeoCheckAction(actionId?: SeoCheck['actionId']) {
    if (!actionId) return;
    if (actionId === 'seo-defaults') {
      applyQuickSeoFixes();
      return;
    }
    if (actionId === 'focus-keyword') {
      document.querySelector<HTMLInputElement>('[data-testid="news-focus-keyword-input"]')?.focus();
      return;
    }
    if (actionId === 'content') {
      if (editorMode === 'visual') focusVisualEditor();
      else bodyRef.current?.focus();
      return;
    }
    if (actionId === 'intro-keyword') {
      ensureKeywordInIntro();
      return;
    }
    if (actionId === 'cover') {
      document.querySelector<HTMLInputElement>('[data-testid="news-cover-image-input"]')?.focus();
      return;
    }
    if (actionId === 'internal-link') {
      insertInternalLink(internalLinkSuggestions[0] ?? defaultInternalLinkSuggestions[0]);
    }
  }

  function runSeoSignalAction(actionId?: SeoSignalAction) {
    if (!actionId) return;
    if (actionId === 'seo-defaults') {
      applyQuickSeoFixes();
      return;
    }
    runQuickWin(actionId);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Tin tức</h1>
          <p className="text-sm text-slate-600">Đăng bài public cho htxonline.vn/tin-tuc theo kiểu nhanh, rõ và dễ dùng.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setAuthorMode('simple')}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-semibold transition',
                !isAdvancedMode ? 'bg-leaf text-white shadow-sm' : 'text-slate-600 hover:text-ink'
              )}
            >
              Che do don gian
            </button>
            <button
              type="button"
              onClick={() => setAuthorMode('advanced')}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-semibold transition',
                isAdvancedMode ? 'bg-ink text-white shadow-sm' : 'text-slate-600 hover:text-ink'
              )}
            >
              Nang cao
            </button>
          </div>
          <Button type="button" variant="ghost" onClick={() => articles.refetch()} aria-label="Tải lại">
            <RefreshCcw size={18} aria-hidden="true" />
          </Button>
          <Button type="button" onClick={reset}>
            <Plus size={18} aria-hidden="true" />
            Tạo bài
          </Button>
        </div>
      </div>

      {(localDraft || draftSavedAt) && (
        <Panel className="border-amber-200 bg-amber-50/90">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">Nháp cục bộ trong trình duyệt</p>
              <p className="text-sm leading-6 text-slate-700">
                {localDraft
                  ? `Có bản nháp đã lưu lúc ${formatDateTime(localDraft.savedAt)}. Bạn có thể phục hồi nếu vừa reload hoặc thoát khỏi trang.`
                  : `Đang tự lưu nháp cục bộ. Lần lưu gần nhất: ${formatDateTime(draftSavedAt)}.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {localDraft && (
                <Button type="button" variant="ghost" onClick={restoreLocalDraft}>
                  Phục hồi nháp
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={clearLocalDraft}>
                Xóa nháp cục bộ
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveArticle.mutate(undefined);
          }}
        >
          <Panel className="space-y-4">
            <div className="rounded-2xl border border-leaf/20 bg-[linear-gradient(135deg,#f7fbf8_0%,#eef8f1_100%)] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf/80">Dang bai cuc nhanh</p>
                  <h2 className="mt-1 text-lg font-bold text-ink">Chi can tieu de, noi dung, anh bia va bam chuan bi publish</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Day la luong dang bai don gian nhat cho nguoi moi. He thong se tu dien slug, mo ta, SEO title, social image, canonical va tag neu ban chua nhap.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={preparePostForPublish}>
                    <Sparkles size={18} aria-hidden="true" />
                    Chuan bi publish
                  </Button>
                  <Button type="button" onClick={() => quickPublishArticle.mutate()} disabled={quickPublishArticle.isPending}>
                    <Save size={18} aria-hidden="true" />
                    {quickPublishArticle.isPending ? 'Đang đăng 1 chạm' : 'Đăng 1 chạm'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={optimizeImportedArticle}>
                    <Sparkles size={18} aria-hidden="true" />
                    Toi uu bai vua dan
                  </Button>
                  <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                    <Target size={18} aria-hidden="true" />
                    Va SEO nhanh
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                {[
                  ['1', 'Nhap tieu de', 'He thong tu goi y slug va keyword.'],
                  ['2', 'Dan noi dung', 'Co the paste text va anh truc tiep vao editor.'],
                  ['3', 'Them cover', 'Dan, tha hoac upload anh bia nhanh.'],
                  ['4', 'Kiem tra roi publish', 'Checklist ben phai se bao muc nao con thieu.']
                ].map(([step, title, text]) => (
                  <div key={step} className="rounded-xl border border-white/80 bg-white/88 p-3 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-leaf/75">Buoc {step}</p>
                    <p className="mt-1 text-sm font-bold text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/80 bg-white/92 p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Muc toi thieu de bam Dang 1 cham</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Nguoi moi chi can du 3 muc ben duoi. Slug, meta, social, tag va khung bai co the de editor tu xu ly.</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold',
                      canQuickPublish ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    )}
                  >
                    {corePublishReady}/3 san sang
                  </span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {corePublishItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => runNextStepSuggestion(item.id === 'content' ? 'content' : item.id === 'cover' ? 'cover' : 'title')}
                      className={cn(
                        'rounded-xl border p-3 text-left transition',
                        item.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950 hover:border-leaf'
                      )}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.14em]">{item.ok ? 'Da xong' : 'Can bo sung'}</p>
                      <p className="mt-1 text-sm font-bold">{item.label}</p>
                      <p className="mt-1 text-sm leading-5 opacity-90">{item.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>Tiêu đề</span>
                <Input
                  data-testid="news-title-input"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="Ví dụ: Xoài Mỹ Xương vào vụ mới, sản lượng ổn định"
                  required
                />
                <span className={cn('text-xs font-semibold', lengthHintClass(titleLength, 35, 70))}>
                  {titleLength ? `${titleLength} ký tự. Nên gọn trong khoảng 35-70 ký tự.` : 'Viết rõ ý chính ngay trên tiêu đề để hệ thống gợi ý slug và SEO tốt hơn.'}
                </span>
              </label>
              <label className="space-y-1 text-sm font-semibold">
                <span>Slug</span>
                <Input
                  data-testid="news-slug-input"
                  value={form.slug}
                  onChange={(event) => update('slug', slugifyLocal(event.target.value))}
                  placeholder="xoai-my-xuong-vao-vu-moi"
                />
                <span className={cn('text-xs font-semibold', lengthHintClass(slugLength, 12, 80))}>
                  {slugLength ? 'Slug nên ngắn, không dấu và dễ đọc trên link chia sẻ.' : 'Có thể để trống, hệ thống sẽ tự tạo slug từ tiêu đề.'}
                </span>
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
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Đã đăng</option>
                  <option value="SCHEDULED">Hẹn giờ</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </Select>
              </label>
              <label className="space-y-1 text-sm font-semibold md:col-span-2">
                <span>Mô tả ngắn</span>
                <Textarea
                  data-testid="news-excerpt-input"
                  value={form.excerpt}
                  onChange={(event) => update('excerpt', event.target.value)}
                  placeholder="Tóm tắt 2-3 ý chính để người đọc hiểu nhanh bài viết nói về gì."
                />
                <span className={cn('text-xs font-semibold', lengthHintClass(excerptLength, 80, 180))}>
                  {excerptLength ? `${excerptLength} ký tự. Mô tả ngắn đẹp thường nằm trong khoảng 80-180 ký tự.` : 'Đoạn này sẽ hiện ở danh sách tin tức và hỗ trợ lấy meta description khi cần.'}
                </span>
              </label>
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Permalink bài viết</p>
                <p className="mt-1 break-all text-sm font-semibold text-emerald-700">{permalink}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                    <Sparkles size={18} aria-hidden="true" />
                    Sửa nhanh SEO
                  </Button>
                  <Button type="button" variant="ghost" onClick={fillSeoDefaults}>
                    <Sparkles size={18} aria-hidden="true" />
                    Tự điền SEO
                  </Button>
                  <Button type="button" variant="ghost" onClick={fillExcerptFromBody}>
                    <FileText size={18} aria-hidden="true" />
                    Tạo mô tả ngắn
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => void copyPermalink()}>
                    <LinkIcon size={18} aria-hidden="true" />
                    Copy link
                  </Button>
                </div>
                {autofillPlan.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-dashed border-emerald-200 bg-white/90 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Dang 1 cham se tu bo sung</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {autofillPlan.map((item) => (
                        <span key={item.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {preparedDiffs.length > 0 && (
                  <details className="mt-3 rounded-2xl border border-slate-200 bg-white" open={preparePreviewOpen}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Xem truoc sau khi chuan bi publish</p>
                        <p className="mt-1 text-sm text-slate-600">{preparedDiffs.length} muc se duoc tu bo sung neu ban bam chuan bi publish.</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{preparedDiffs.length} muc</span>
                    </summary>
                    <div className="space-y-2 border-t border-slate-100 px-3 py-3">
                      {preparedDiffs.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                          <p className="text-sm font-semibold text-ink">{item.label}</p>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Hien tai</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">{item.before}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Sau khi tu bo sung</p>
                              <p className="mt-1 text-sm leading-6 text-emerald-800">{item.after}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
                {!isAdvancedMode && (
                  <details className="mt-3 rounded-2xl border border-slate-200 bg-white" open={simpleSeoBoardOpen}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bang den SEO dang WordPress</p>
                        <p className="mt-1 text-sm font-bold text-ink">Xanh la on, vang la con viec nen xu ly truoc khi dang.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {seoSignals.filter((item) => item.ok).length}/{seoSignals.length} tin hieu xanh
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                          {seoSignals.filter((item) => !item.ok && item.priority === 'must').length} muc gap
                        </span>
                      </div>
                    </summary>
                    <div className="grid gap-2 border-t border-slate-100 px-3 py-3">
                      {seoSignals.map((signal) => (
                        <div
                          key={signal.id}
                          className={cn(
                            'rounded-xl border p-3',
                            signal.ok
                              ? 'border-emerald-200 bg-emerald-50/80'
                              : signal.priority === 'must'
                                ? 'border-amber-200 bg-amber-50/90'
                                : 'border-slate-200 bg-slate-50'
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]',
                                    signal.ok
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : signal.priority === 'must'
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-slate-200 text-slate-700'
                                  )}
                                >
                                  {signal.ok ? 'Xanh' : signal.priority === 'must' ? 'Can lam ngay' : 'Nen bo sung'}
                                </span>
                                <span className="text-sm font-bold text-ink">{signal.label}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{signal.detail}</p>
                            </div>
                            {!signal.ok && signal.actionId && signal.actionLabel && (
                              <Button type="button" variant="ghost" onClick={() => runSeoSignalAction(signal.actionId)}>
                                {signal.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border border-white bg-white p-3">
                  <p className="text-slate-500">Độ dài tiêu đề</p>
                  <p className="mt-1 text-lg font-bold text-ink">{(form.title || form.seoTitle).trim().length}</p>
                </div>
              <div className="rounded-xl border border-white bg-white p-3">
                <p className="text-slate-500">Mô tả ngắn</p>
                <p className="mt-1 text-lg font-bold text-ink">{excerptLength}</p>
              </div>
                <div className="rounded-xl border border-white bg-white p-3">
                <p className="text-slate-500">Thời gian đọc</p>
                <p className="mt-1 text-lg font-bold text-ink">{readingMinutes} phút</p>
              </div>
              <div className="rounded-xl border border-white bg-white p-3">
                <p className="text-slate-500">Sẵn sàng publish</p>
                <p className="mt-1 text-lg font-bold text-ink">{publishReadiness.completed}/{publishReadiness.total}</p>
              </div>
            </div>
          </div>
          {draftSavedAt && (
            <p className="text-xs font-semibold text-slate-500">Tự lưu nháp cục bộ lần cuối: {formatDateTime(draftSavedAt)}</p>
          )}
        </Panel>

          <Panel className="space-y-4">
            <details className="group rounded-2xl border border-dashed border-leaf/30 bg-mint/40" open={templateLibraryOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-leaf shadow-sm">
                    <FileText size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">Mẫu bài nhanh và hướng dẫn 3 bước</p>
                    <p className="text-sm leading-6 text-slate-600">Mở khi bạn muốn lấy khung bài có sẵn hoặc xem lại workflow nhanh.</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">{articleTemplates.length} mẫu</span>
              </summary>
              <div className="space-y-4 border-t border-white/70 px-3 py-3">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Mẫu bài nhanh để đăng mà không cần viết từ đầu</p>
                    <p className="text-sm leading-6 text-slate-600">
                      Chọn một mẫu bên dưới, sửa tiêu đề, mô tả, nội dung và thêm ảnh là có thể publish.
                    </p>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {articleTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className="rounded-xl border border-white/80 bg-white/90 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-leaf/40 hover:bg-white"
                        onClick={() => applyTemplate(template.id)}
                      >
                        <p className="text-sm font-bold text-ink">{template.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{template.description}</p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-leaf/80">{template.categoryHint}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bước 1</p>
                    <p className="mt-1 text-sm font-bold text-ink">Nhập tiêu đề và mô tả</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Hệ thống tự gợi ý slug, title SEO và mô tả nếu bạn chưa nhập.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bước 2</p>
                    <p className="mt-1 text-sm font-bold text-ink">Soạn trực quan như WordPress</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Chế độ trực quan là mặc định. Có thể dán ảnh trực tiếp, bôi đậm, tạo heading và chèn link ngay trên editor.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bước 3</p>
                    <p className="mt-1 text-sm font-bold text-ink">Xem điểm SEO rồi publish</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Checklist bên phải sẽ chấm title, keyword, heading, ảnh, liên kết và độ dễ đọc.</p>
                  </div>
                </div>
              </div>
            </details>

            <div className="flex flex-wrap items-center gap-2">
              {editorSnippets.map(([Icon, snippet]) => (
                <button
                  key={snippet}
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-mint"
                  onClick={() => insertHtml(snippet)}
                  title="Chèn định dạng"
                >
                  <Icon size={18} aria-hidden="true" />
                </button>
              ))}
              <Button type="button" variant={editorMode === 'visual' ? 'primary' : 'ghost'} onClick={() => setEditorMode('visual')}>
                <FileText size={18} aria-hidden="true" />
                Soạn trực quan
              </Button>
              <Button type="button" variant={editorMode === 'html' ? 'primary' : 'ghost'} onClick={() => setEditorMode('html')}>
                <Code2 size={18} aria-hidden="true" />
                HTML
              </Button>
              <Button type="button" variant="ghost" onClick={fillSeoDefaults}>
                <Sparkles size={18} aria-hidden="true" />
                Tự điền SEO
              </Button>
              <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                <Target size={18} aria-hidden="true" />
                Vá lỗi SEO nhanh
              </Button>
              <Button type="button" variant="ghost" onClick={optimizeImportedArticle}>
                <Sparkles size={18} aria-hidden="true" />
                Toi uu bai vua dan
              </Button>
              <Button type="button" variant="ghost" onClick={syncSocialFromSeo}>
                <Target size={18} aria-hidden="true" />
                Đồng bộ social
              </Button>
              <Button type="button" variant="ghost" onClick={cleanPastedContent}>
                <RefreshCcw size={18} aria-hidden="true" />
                Làm sạch nội dung dán
              </Button>
              <Button type="button" variant="ghost" onClick={() => setPreview((value) => !value)}>
                <Eye size={18} aria-hidden="true" />
                Preview
              </Button>
            </div>

            {editorMode === 'visual' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1 text-leaf">Chế độ dễ dùng</span>
                  <span>Dán ảnh từ clipboard: `Ctrl+V`</span>
                  <span>Dán nội dung từ Word/Docs: hệ thống tự làm sạch</span>
                  <span>Bấm toolbar để tạo H2, H3, danh sách, link</span>
                  <span>Chỉ dùng HTML khi cần tinh chỉnh sâu</span>
                </div>
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                  Đăng nhanh: chỉ cần tiêu đề, nội dung, ảnh và bấm &quot;Đăng 1 chạm&quot;. Các mục SEO, social và lịch đăng chỉ cần mở khi thật sự cần và có thể bổ sung sau.
                </p>
                <div className="rounded-xl border border-dashed border-leaf/30 bg-white/90 px-3 py-3 text-sm text-slate-700">
                  <p className="font-bold text-ink">Neu ban vua paste bai tu Word hoac Google Docs</p>
                  <p className="mt-1 leading-6">Bam &quot;Toi uu bai vua dan&quot; de he thong lam sach HTML, bo sung mo bai co tu khoa, heading co ban, internal link, meta va social preview trong mot lan.</p>
                </div>
                {needsImportedOptimization && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">Editor phat hien bai vua dan con nhieu dinh dang tu Word/Docs</p>
                        <p className="mt-1 leading-6">Nen bam &quot;Toi uu bai vua dan&quot; ngay luc nay de don HTML rac, giam the thua va dua bai ve bo cuc de doc hon tren mobile.</p>
                      </div>
                      <Button type="button" variant="ghost" onClick={optimizeImportedArticle}>
                        <Sparkles size={18} aria-hidden="true" />
                        Toi uu ngay
                      </Button>
                    </div>
                  </div>
                )}
                {bodyUploadActive && (
                  <div className="rounded-xl border border-sky-200 bg-sky/50 px-3 py-3 text-sm text-sky-950">
                    <p className="font-bold text-ink">Dang upload anh vao noi dung bai viet</p>
                    <p className="mt-1 leading-6">Ban co the tiep tuc go noi dung. Anh se duoc chen vao editor ngay sau khi upload xong.</p>
                  </div>
                )}
                <div
                  ref={visualEditorRef}
                  data-testid="news-content-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDraggingEditor(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDraggingEditor(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                    setDraggingEditor(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDraggingEditor(false);
                    void handleDroppedFiles(event.dataTransfer.files);
                  }}
                  onInput={syncVisualEditor}
                  onBlur={syncVisualEditor}
                  onPaste={(event) => void handleVisualPaste(event)}
                  className={cn(
                    'min-h-[320px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 outline-none focus:border-leaf focus:ring-4 focus:ring-mint [&_blockquote]:border-l-4 [&_blockquote]:border-leaf/40 [&_blockquote]:pl-4 [&_figure]:my-4 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_img]:rounded-xl [&_img]:shadow-sm [&_li]:ml-5 [&_p]:my-3 [&_ul]:list-disc [&_ol]:list-decimal',
                    draggingEditor && 'border-leaf bg-mint/40 ring-4 ring-mint'
                  )}
                />
                {draggingEditor && (
                  <div className="pointer-events-none rounded-xl border border-dashed border-leaf/40 bg-mint/60 px-4 py-3 text-sm font-semibold text-leaf">
                    Thả ảnh vào đây để tự upload và chèn vào bài.
                  </div>
                )}
              </div>
            ) : (
              <label className="block space-y-1 text-sm font-semibold">
                <span>Nội dung HTML</span>
                <Textarea
                  ref={bodyRef}
                  data-testid="news-content-editor"
                  value={form.bodyHtml}
                  onChange={(event) => update('bodyHtml', event.target.value)}
                  onPaste={(event) => void handleBodyPaste(event)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDraggingEditor(true);
                  }}
                  onDragLeave={() => setDraggingEditor(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDraggingEditor(false);
                    void handleDroppedFiles(event.dataTransfer.files);
                  }}
                  className="min-h-[320px] font-mono text-sm"
                  required
                />
                {draggingEditor && <span className="text-xs font-semibold text-leaf">Thả ảnh vào đây để tự upload và chèn HTML.</span>}
              </label>
            )}

            <details className="rounded-md border border-slate-200 bg-slate-50" open={editorTipsOpen}>
              <summary className="cursor-pointer list-none px-3 py-3 text-sm font-semibold text-ink">Mẹo đăng bài nhanh</summary>
              <div className="space-y-2 border-t border-slate-200 px-3 py-3 text-sm leading-6 text-slate-600">
                <p>Dùng `Tiêu đề H2/H3` để chia mục, `Chèn ảnh` cho ảnh nằm giữa bài, và `Preview` để xem trước trước khi publish.</p>
                <p>Nếu chỉ muốn đăng bài đơn giản: giữ `Soạn trực quan`, bấm vào nội dung rồi gõ như soạn Word bình thường.</p>
                <p>Nếu copy ảnh từ Zalo, Facebook, Word hoặc Excel: click vào editor rồi bấm `Ctrl+V`, ảnh sẽ tự upload vào bài.</p>
                <p>Nếu copy cả đoạn từ Word hoặc Google Docs: cứ dán thẳng vào editor, rồi bấm `Làm sạch nội dung dán` nếu muốn hệ thống rút gọn thẻ rác thêm một lượt.</p>
                <p>Nếu chưa rành SEO: bấm `Sửa nhanh SEO`, hệ thống sẽ tự vá slug, mô tả ngắn, thẻ meta, social và alt text cơ bản.</p>
              </div>
            </details>

            {preview && (
              <div className="prose max-w-none rounded-md border border-slate-200 bg-slate-50 p-4" dangerouslySetInnerHTML={{ __html: form.bodyHtml }} />
            )}
          </Panel>

          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">Ảnh đại diện</p>
                <p className="text-sm text-slate-600">Dùng ảnh ngang sáng, rõ và có alt text để cải thiện SEO.</p>
              </div>
            </div>
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
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void uploadFile(event.target.files[0], 'cover')} />
              </label>
            </div>
            <div
              tabIndex={0}
              onPaste={(event) => {
                const file = Array.from(event.clipboardData?.items ?? [])
                  .find((item) => item.type.startsWith('image/'))
                  ?.getAsFile();
                if (!file) return;
                event.preventDefault();
                void handleCoverFile(file);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void handleCoverFiles(event.dataTransfer.files);
              }}
              className="rounded-xl border border-dashed border-leaf/30 bg-mint/40 px-4 py-3 text-sm text-slate-700 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            >
              <p className="font-semibold text-ink">Dán hoặc thả ảnh bìa trực tiếp</p>
              <p className="mt-1">Click vào khung này rồi bấm `Ctrl+V`, hoặc kéo ảnh vào đây để tự upload ảnh cover.</p>
            </div>
            {coverUploadActive && (
              <div className="rounded-xl border border-sky-200 bg-sky/50 px-3 py-3 text-sm text-sky-950">
                <p className="font-bold text-ink">Dang upload anh bia</p>
                <p className="mt-1 leading-6">Anh bia se tu dong cap nhat vao cover, Open Graph va Twitter image neu cac truong nay dang de trong.</p>
              </div>
            )}
            {form.coverImageUrl && (
              <img
                data-testid="news-cover-image-preview"
                src={form.coverImageUrl}
                alt={form.coverImageAlt || ''}
                className="aspect-[16/7] w-full rounded-md object-cover"
              />
            )}
          </Panel>

          {isAdvancedMode && (
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
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void uploadFile(event.target.files[0], 'body')} />
              </label>
            </div>
          </Panel>
          )}

          {isAdvancedMode ? (
            <>
          <Panel className="p-0">
            <details className="group" open={seoAdvancedOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-ink">SEO cơ bản</p>
                  <p className="text-sm text-slate-600">Giống WordPress: có điểm, checklist và meta đầy đủ, nhưng có thể bỏ qua nếu đăng bài nhanh.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-bold', seoScoreClass(seo.score))}>SEO {seo.score}/100</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mở</span>
                </div>
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Thiết lập title, keyword, canonical và robots cho bài viết khi cần tối ưu sâu hơn.</p>
                  <Button type="button" variant="ghost" onClick={fillSeoDefaults}>
                    <Sparkles size={18} aria-hidden="true" />
                    Gợi ý nhanh
                  </Button>
                </div>
                <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Nếu đăng nhanh, bạn có thể bỏ qua mục này. Hệ thống vẫn sẽ ưu tiên lấy social preview từ SEO và ảnh bìa khi có thể.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Focus keyword</span>
                    <Input
                      data-testid="news-focus-keyword-input"
                      value={form.focusKeyword}
                      onChange={(event) => update('focusKeyword', event.target.value)}
                      placeholder="Ví dụ: xoài Mỹ Xương"
                    />
                    <span className="text-xs font-semibold text-slate-500">
                      {form.focusKeyword.trim() ? 'Chọn 1 cụm từ khóa chính để hệ thống chấm title, mô tả, mật độ và phần mở bài.' : 'Nên chọn 1 cụm từ khóa chính, không cần nhồi nhiều từ khóa.'}
                    </span>
                    {focusKeywordSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {focusKeywordSuggestions.map((keyword) => (
                          <button
                            key={keyword}
                            type="button"
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs font-semibold transition',
                              form.focusKeyword.trim().toLowerCase() === keyword.toLowerCase()
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-leaf hover:text-leaf'
                            )}
                            onClick={() => applyFocusKeywordSuggestion(keyword)}
                          >
                            Dùng: {keyword}
                          </button>
                        ))}
                      </div>
                    )}
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>SEO title</span>
                    <Input
                      data-testid="news-seo-title-input"
                      value={form.seoTitle}
                      onChange={(event) => update('seoTitle', event.target.value)}
                      placeholder="Tiêu đề hiển thị trên Google"
                    />
                    <span className={cn('text-xs font-semibold', lengthHintClass(seoTitleLength, 35, 65))}>
                      {seoTitleLength ? `${seoTitleLength}/65 ký tự` : 'Nên dài khoảng 35-65 ký tự'}
                    </span>
                  </label>
                  <label className="space-y-1 text-sm font-semibold md:col-span-2">
                    <span>Meta description</span>
                    <Textarea
                      data-testid="news-seo-description-input"
                      value={form.seoDescription}
                      onChange={(event) => update('seoDescription', event.target.value)}
                      placeholder="Mô tả ngắn hiển thị trên Google, nên chứa từ khóa chính và lợi ích nổi bật."
                    />
                    <span className={cn('text-xs font-semibold', lengthHintClass(seoDescriptionLength, 120, 160))}>
                      {seoDescriptionLength ? `${seoDescriptionLength}/160 ký tự` : 'Nên dài khoảng 120-160 ký tự'}
                    </span>
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Canonical URL</span>
                    <Input
                      data-testid="news-canonical-url-input"
                      value={form.canonicalUrl}
                      onChange={(event) => update('canonicalUrl', event.target.value)}
                      placeholder="https://htxonline.vn/tin-tuc/ten-bai-viet"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Loại schema</span>
                    <Select data-testid="news-schema-type-select" value={form.schemaType} onChange={(event) => update('schemaType', event.target.value)}>
                      <option value="Article">Article</option>
                      <option value="NewsArticle">NewsArticle</option>
                      <option value="BlogPosting">BlogPosting</option>
                    </Select>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input data-testid="news-noindex-switch" type="checkbox" checked={form.robotsNoIndex} onChange={(event) => update('robotsNoIndex', event.target.checked)} />
                    Không index
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input data-testid="news-nofollow-switch" type="checkbox" checked={form.robotsNoFollow} onChange={(event) => update('robotsNoFollow', event.target.checked)} />
                    Không theo link
                  </label>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-ink">Thẻ SEO sẽ xuất ra sau khi publish</p>
                      <p className="text-sm text-slate-600">Dù bạn bỏ trống một số ô, hệ thống vẫn tự lấp phần còn thiếu theo nội dung đã chuẩn bị.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                      {resolvedMetaPreview.robots} • {resolvedMetaPreview.schemaType}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Google / canonical</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{resolvedMetaPreview.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{resolvedMetaPreview.description}</p>
                      <p className="mt-2 text-xs leading-5 text-emerald-700">{resolvedMetaPreview.canonical}</p>
                    </div>
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Open Graph / Twitter</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{resolvedMetaPreview.ogTitle}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{resolvedMetaPreview.ogDescription}</p>
                      <p className="mt-2 break-all text-xs leading-5 text-slate-500">{resolvedMetaPreview.ogImage}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="font-semibold text-ink">Từ khóa chính</p>
                      <p className="mt-1 text-slate-600">{resolvedMetaPreview.keyword || 'Chưa có, hệ thống sẽ ưu tiên lấy theo tiêu đề.'}</p>
                    </div>
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="font-semibold text-ink">Tags xuất ra</p>
                      <p className="mt-1 text-slate-600">
                        {resolvedMetaPreview.tags.length > 0 ? resolvedMetaPreview.tags.join(', ') : 'Chưa có tag, có thể bấm gợi ý tags hoặc dùng Đăng 1 chạm.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </Panel>

          <Panel className="p-0">
            <details className="group" open={socialAdvancedOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-ink">Mạng xã hội</p>
                  <p className="text-sm text-slate-600">Nếu bỏ trống, hệ thống ưu tiên lấy preview từ SEO title, mô tả và ảnh bìa.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{socialAdvancedOpen ? 'Đã tùy biến' : 'Tự động theo SEO'}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mở</span>
                </div>
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Preview chia sẻ Facebook và Twitter sẽ lấy từ các trường này khi bạn cần tùy biến.</p>
                  <Button type="button" variant="ghost" onClick={syncSocialFromSeo}>
                    <Target size={18} aria-hidden="true" />
                    Lấy từ SEO
                  </Button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Tiêu đề OG</span>
                    <Input data-testid="news-og-title-input" value={form.ogTitle} onChange={(event) => update('ogTitle', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Ảnh OG</span>
                    <Input data-testid="news-og-image-input" value={form.ogImageUrl} onChange={(event) => update('ogImageUrl', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm font-semibold md:col-span-2">
                    <span>OG description</span>
                    <Textarea data-testid="news-og-description-input" value={form.ogDescription} onChange={(event) => update('ogDescription', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Tiêu đề Twitter</span>
                    <Input data-testid="news-twitter-title-input" value={form.twitterTitle} onChange={(event) => update('twitterTitle', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Ảnh Twitter</span>
                    <Input data-testid="news-twitter-image-input" value={form.twitterImageUrl} onChange={(event) => update('twitterImageUrl', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm font-semibold md:col-span-2">
                    <span>Twitter description</span>
                    <Textarea data-testid="news-twitter-description-input" value={form.twitterDescription} onChange={(event) => update('twitterDescription', event.target.value)} />
                  </label>
                </div>
              </div>
            </details>
          </Panel>

          <Panel className="p-0">
            <details className="group" open={Boolean(form.tags || form.publishedAt || form.scheduledAt || form.isFeatured || form.showOnHome)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-ink">Lich dang, tags va tuy chon hien thi</p>
                  <p className="text-sm text-slate-600">Chi mo muc nay khi can len lich, them tag hoac day bai ra trang chu.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mo</span>
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-4">
                <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                <span>Tags</span>
                <Input value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="tag 1, tag 2" />
              </label>
              <div className="flex items-end">
                <Button type="button" variant="ghost" onClick={fillSuggestedTags}>
                  <Sparkles size={18} aria-hidden="true" />
                  Gợi ý tags
                </Button>
              </div>
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
              </div>
            </details>
          </Panel>
            </>
          ) : (
            <Panel className="border-slate-200 bg-slate-50/90">
              <div className="space-y-3">
                <p className="text-sm font-bold text-ink">Che do don gian dang bat</p>
                <p className="text-sm leading-6 text-slate-600">
                  Cac muc schema, canonical, robots, Open Graph, Twitter, lich dang va tuy chon hien thi dang duoc an bot de de thao tac hon.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                    <Sparkles size={18} aria-hidden="true" />
                    Tu dien SEO co ban
                  </Button>
                  <Button type="button" onClick={() => setAuthorMode('advanced')}>
                    <Target size={18} aria-hidden="true" />
                    Mo che do nang cao
                  </Button>
                </div>
              </div>
            </Panel>
          )}

          {(saveArticle.isError || archiveArticle.isError || quickPublishArticle.isError) && (
            <Panel data-testid="toast-error" className="text-sm font-semibold text-rose-700">
              {errorMessage(saveArticle.error ?? quickPublishArticle.error ?? archiveArticle.error)}
            </Panel>
          )}

          <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-soft lg:bottom-4">
            <Button type="button" onClick={() => quickPublishArticle.mutate()} disabled={quickPublishArticle.isPending || !canQuickPublish}>
              <Sparkles size={18} aria-hidden="true" />
              {quickPublishArticle.isPending ? 'Dang dang 1 cham' : 'Dang 1 cham (khuyen dung)'}
            </Button>
            <Button data-testid="news-save-draft-button" type="button" variant="ghost" onClick={() => saveArticle.mutate('DRAFT')} disabled={saveArticle.isPending}>
              <Save size={18} aria-hidden="true" />
              Lưu nháp
            </Button>
            <Button data-testid="news-publish-button" type="button" variant="ghost" onClick={() => saveArticle.mutate('PUBLISHED')} disabled={saveArticle.isPending}>
              <Save size={18} aria-hidden="true" />
              Đăng ngay
            </Button>
            <Button type="button" variant="ghost" onClick={() => quickPublishArticle.mutate()} disabled={quickPublishArticle.isPending}>
              <Sparkles size={18} aria-hidden="true" />
              Đăng 1 chạm
            </Button>
            <Button type="submit" disabled={saveArticle.isPending}>
              {saveArticle.isPending ? 'Đang lưu' : 'Lưu'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Panel className="space-y-3">
            <div className="rounded-2xl border border-sky-200 bg-sky/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Viec nen lam tiep</p>
              <p className="mt-1 text-lg font-bold text-ink">Editor se goi y buoc ke tiep de bai nhanh dep va de publish hon.</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {quickWinCount > 0
                  ? `Dang co ${quickWinCount} sua nhanh nen xu ly truoc.`
                  : 'Khung co ban da on, ban co the bam tu dong hoan thien de ra bai nhanh hon.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={preparePostForPublish}>
                  <Sparkles size={18} aria-hidden="true" />
                  Tu hoan thien co ban
                </Button>
                <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                  <Target size={18} aria-hidden="true" />
                  Va SEO nhanh
                </Button>
              </div>
            </div>
            <details className="group rounded-2xl border border-slate-200 bg-white/95" open={detailHelpersOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Tro ly thao tac nhanh</p>
                  <p className="text-sm text-slate-600">
                    {quickWinCount > 0
                      ? `${quickWinCount} sua nhanh va ${nextStepCount} buoc tiep theo.`
                      : `${nextStepCount} buoc tiep theo de hoan thien bai viet.`}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {quickWinCount > 0 ? `${quickWinCount} viec gap` : 'Xem goi y'}
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-3">
            {quickWins.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">Sua nhanh trong 1 phut</p>
                <p className="mt-1 text-lg font-bold text-ink">Chi can xu ly 2-4 viec nho ben duoi la bai se dep va chuan hon rat nhieu.</p>
                <div className="mt-3 space-y-2">
                  {quickWins.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/90 bg-white/90 p-3">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                      <Button type="button" variant="ghost" className="mt-2" onClick={() => runQuickWin(item.id)}>
                        {item.actionLabel}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {false && (
            <div className="rounded-2xl border border-sky-200 bg-sky/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Việc nên làm tiếp</p>
              <p className="mt-1 text-lg font-bold text-ink">Editor sẽ gợi ý đúng thao tác tiếp theo để bài nhanh đủ chuẩn.</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">Nếu muốn đi nhanh nhất, bấm nút bên dưới để hệ thống tự điền những phần cơ bản còn thiếu trước.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={preparePostForPublish}>
                  <Sparkles size={18} aria-hidden="true" />
                  Tự hoàn thiện cơ bản
                </Button>
                <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                  <Target size={18} aria-hidden="true" />
                  Vá SEO nhanh
                </Button>
              </div>
            </div>
            )}
            <div className="space-y-2">
              {nextStepSuggestions.map((step) => (
                <div key={step.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
                  <Button type="button" variant="ghost" className="mt-2" onClick={() => runNextStepSuggestion(step.id)}>
                    {step.actionLabel}
                  </Button>
                </div>
              ))}
            </div>
              </div>
            </details>
          </Panel>

          <Panel className="space-y-3">
            <div className={cn('rounded-2xl border px-4 py-3', publishReadinessClass(publishReadiness.ratio))}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Trạng thái xuất bản</p>
              <p className="mt-1 text-lg font-bold text-ink">{publishReadiness.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{publishReadiness.detail}</p>
            </div>
            <details className="group rounded-2xl border border-slate-200 bg-white/95" open={publishChecklistOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Checklist xuat ban</p>
                  <p className="text-sm text-slate-600">
                    {publishChecklistIssues > 0
                      ? `Con ${publishChecklistIssues} muc can bo sung truoc khi dang.`
                      : 'Da du cac muc cot loi de co the publish.'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    publishChecklistIssues > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {publishChecklistIssues > 0 ? `${publishChecklistIssues} muc thieu` : 'Da san sang'}
                </span>
              </summary>
              <div className="border-t border-slate-100 px-4 py-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {publishReadiness.items.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'rounded-xl border px-3 py-2',
                    item.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'
                  )}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5">{item.ok ? 'Đã sẵn sàng' : 'Cần bổ sung'}</p>
                </div>
              ))}
            </div>
              </div>
            </details>
          </Panel>

          <Panel>
            <div className="grid grid-cols-2 gap-3">
              <div data-testid="news-seo-score" className={cn('rounded-md p-3 text-center', seoScoreClass(seo.score))}>
                <p className="text-sm text-slate-600">Điểm SEO</p>
                <p className="text-2xl font-bold text-leaf">{seo.score}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{seoScoreLabel(seo.score)}</p>
              </div>
              <div data-testid="news-readability-score" className={cn('rounded-md p-3 text-center', readabilityClass(seo.readability))}>
                <p className="text-sm text-slate-600">Độ dễ đọc</p>
                <p className="text-2xl font-bold text-ink">{seo.readability}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{readabilityLabel(seo.readability)}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                <span>Mức sẵn sàng SEO</span>
                <span>{seo.score}/100</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={cn('h-full rounded-full transition-all', seoScoreBarClass(seo.score))}
                  style={{ width: `${Math.max(seo.score, 6)}%` }}
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {seo.score >= 80
                  ? 'Bài đã khá ổn để xuất bản và chia sẻ. Chỉ cần rà lại nội dung thực tế trước khi đăng.'
                  : seo.score >= 60
                    ? 'Bài đã có nền tốt, nhưng nên xử lý thêm vài mục cảnh báo màu vàng để tăng khả năng hiển thị.'
                    : 'Bài còn thiếu vài thành phần quan trọng. Hãy dùng checklist bên dưới hoặc nút vá nhanh để hoàn thiện nhanh hơn.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!form.focusKeyword.trim() && focusKeywordSuggestions[0] && (
                  <Button type="button" variant="ghost" onClick={() => applyFocusKeywordSuggestion(focusKeywordSuggestions[0]!)}>
                    <Target size={18} aria-hidden="true" />
                    Chọn từ khóa gợi ý
                  </Button>
                )}
                {form.focusKeyword.trim() && !stripHtml(form.bodyHtml).slice(0, 180).toLowerCase().includes(form.focusKeyword.trim().toLowerCase()) && (
                  <Button type="button" variant="ghost" onClick={ensureKeywordInIntro}>
                    <FileText size={18} aria-hidden="true" />
                    Chèn mở bài có từ khóa
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                  <Sparkles size={18} aria-hidden="true" />
                  Hoàn thiện SEO cơ bản
                </Button>
              </div>
            </div>

            <details className="mt-4 rounded-2xl border border-slate-200 bg-white/95" open={seoReviewOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Xem checklist va preview SEO</p>
                  <p className="text-sm text-slate-600">
                    {seoMustFixCount > 0
                      ? `${seoMustFixCount} muc can xu ly truoc va ${seoShouldFixCount} muc nen toi uu them.`
                      : seoShouldFixCount > 0
                        ? `${seoShouldFixCount} muc nen toi uu them de dep hon.`
                        : 'Diem so va preview dang o trang thai on de xuat ban.'}
                  </p>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs font-bold', seoScoreClass(seo.score))}>
                  SEO {seo.score}/100
                </span>
              </summary>
              <div className="space-y-4 border-t border-slate-100 px-4 py-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Số từ</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.words}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Khớp từ khóa</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.keywordMatches}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Mật độ từ khóa</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.keywordDensity}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Số heading</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.headings}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Ảnh / link nội bộ</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.images} / {seo.stats.internalLinks}</p>
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

            <div data-testid="news-preview-twitter" className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Preview X / Twitter</div>
              <div className="aspect-[16/8] bg-slate-100 bg-cover bg-center" style={{ backgroundImage: form.twitterImageUrl || form.coverImageUrl ? `url('${form.twitterImageUrl || form.coverImageUrl}')` : undefined }} />
              <div className="p-3">
                <p className="font-bold text-ink">{form.twitterTitle || form.title || 'Tiêu đề Twitter'}</p>
                <p className="mt-1 text-sm text-slate-600">{form.twitterDescription || form.excerpt || 'Mô tả Twitter'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Khung bài sau khi chuẩn bị publish</p>
                  <p className="text-sm text-slate-600">Editor soi trước bố cục, ảnh và điều hướng nội bộ để bạn biết bài sẽ lên trang public ra sao.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {contentOutlinePreview.estimatedMinutes} phút đọc
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Đoạn văn</p>
                  <p className="mt-1 text-lg font-bold text-ink">{contentOutlinePreview.paragraphCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Heading H2/H3</p>
                  <p className="mt-1 text-lg font-bold text-ink">{contentOutlinePreview.headings.length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Ảnh trong bài</p>
                  <p className="mt-1 text-lg font-bold text-ink">{contentOutlinePreview.imageCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-500">Link nội bộ</p>
                  <p className="mt-1 text-lg font-bold text-ink">{contentOutlinePreview.internalLinks}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-ink">Outline heading</p>
                <div className="mt-2 space-y-2">
                  {contentOutlinePreview.headings.length > 0 ? (
                    contentOutlinePreview.headings.slice(0, 6).map((heading, index) => (
                      <p key={`${heading.level}-${heading.text}-${index}`} className="text-slate-600">
                        <span className="mr-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700">{heading.level}</span>
                        {heading.text}
                      </p>
                    ))
                  ) : (
                    <p className="text-slate-600">Chưa có H2/H3. Bạn có thể bấm “Chèn heading mẫu” hoặc dùng “Đăng 1 chạm” để hệ thống dựng khung cơ bản.</p>
                  )}
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {contentOutlinePreview.imagesMissingAlt > 0
                  ? `Còn ${contentOutlinePreview.imagesMissingAlt} ảnh trong body chưa có alt text rõ ràng. Đây là điểm nên vá thêm để hỗ trợ SEO hình ảnh.`
                  : 'Ảnh trong body đang có alt text cơ bản hoặc chưa có ảnh nào trong bài.'}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-ink">Checklist xuất bản</p>
                <div className="mt-2 space-y-2">
                  {seo.checks.map((check) => (
                    <div key={check.label} className={cn('rounded-xl border px-3 py-2 text-sm', check.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900')}>
                      <p className="font-semibold">{check.label}</p>
                      <p className="mt-1 leading-5">{check.detail}</p>
                      {!check.ok && check.actionId && check.actionLabel && (
                        <Button type="button" variant="ghost" className="mt-2" onClick={() => runSeoCheckAction(check.actionId)}>
                          {check.actionLabel}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {seo.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-ink">Điểm tốt</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {seo.strengths.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {seo.notes.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-ink">Nên cải thiện</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {seo.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
              </div>
            </details>
          </Panel>
          {isAdvancedMode && (
          <Panel className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Gợi ý internal link</h2>
                <p className="text-sm text-slate-600">Một cú bấm để chèn link nội bộ, tăng điều hướng và hỗ trợ SEO on-page.</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => insertInternalLink(internalLinkSuggestions[0] ?? defaultInternalLinkSuggestions[0])}>
                <LinkIcon size={18} aria-hidden="true" />
                Chèn nhanh
              </Button>
            </div>
            <div className="space-y-2">
              {internalLinkSuggestions.map((suggestion) => (
                <div key={`${suggestion.href}-${suggestion.label}`} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{suggestion.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{suggestion.description}</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700">{suggestion.href}</p>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => insertInternalLink(suggestion)}>
                      Chèn link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          )}

          {isAdvancedMode && (
          <Panel className="space-y-3">
            <h2 className="text-lg font-bold">Danh mục</h2>
            <Input value={categoryDraft.name} onChange={(event) => setCategoryDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || slugifyLocal(event.target.value) }))} placeholder="Tên danh mục" />
            <Input value={categoryDraft.slug} onChange={(event) => setCategoryDraft((current) => ({ ...current, slug: slugifyLocal(event.target.value) }))} placeholder="Đường dẫn danh mục" />
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
          )}

          <Panel className="space-y-3">
            <details className="group rounded-2xl border border-slate-200 bg-white/95" open={articleLibraryOpen}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Kho bài viết</p>
                  <p className="text-sm text-slate-600">
                    {articleItems.length > 0
                      ? `${articleItems.length} bài để xem lại, sửa hoặc ẩn.`
                      : 'Nơi xem lại các bài đã tạo sau khi hoàn tất bài mới.'}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {articleItems.length} bài
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-3">
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
                        <Badge className={statusClass(article.status)}>{statusLabel(article.status)}</Badge>
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                        <span>Điểm SEO {article.seoScore}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button type="button" variant="ghost" onClick={() => edit(article)}>Sửa</Button>
                        <Button type="button" variant="danger" onClick={() => archiveArticle.mutate(article.id)}>Ẩn</Button>
                      </div>
                    </div>
                  ))}
                  {!articles.isLoading && articleItems.length === 0 && <p className="text-sm text-slate-600">Chưa có bài viết.</p>}
                </div>
              </div>
            </details>
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

function clientSeoScore(form: NewsForm): SeoScoreResult {
  const bodyText = stripHtml(form.bodyHtml);
  const normalizedBody = bodyText.toLowerCase();
  const keyword = form.focusKeyword.trim().toLowerCase();
  const introText = bodyText.slice(0, 180).toLowerCase();
  const words = bodyText.split(/\s+/).filter(Boolean).length;
  const sentenceCount = Math.max(bodyText.split(/[.!?]+/).filter(Boolean).length, 1);
  const avgSentenceWords = words / sentenceCount;
  const headings = countMatches(form.bodyHtml, /<h[23][^>]*>/gi);
  const images = countMatches(form.bodyHtml, /<img\b/gi);
  const internalLinks = countMatches(form.bodyHtml, /<a[^>]+href="(?:\/|https:\/\/htxonline\.vn)/gi);
  const keywordMatches = keyword ? countOccurrences(normalizedBody, keyword) : 0;
  const keywordDensity = words ? Number(((keywordMatches / words) * 100).toFixed(1)) : 0;
  const titleLength = (form.seoTitle || form.title).trim().length;
  const descriptionLength = form.seoDescription.trim().length;

  const checks: SeoCheck[] = [
    {
      label: 'Title SEO',
      ok: titleLength >= 35 && titleLength <= 65,
      detail: titleLength ? `Hiện tại ${titleLength} ký tự. Nên trong khoảng 35-65 ký tự.` : 'Chưa có title SEO.',
      actionId: 'seo-defaults',
      actionLabel: 'Điền SEO nhanh'
    },
    {
      label: 'Meta description',
      ok: descriptionLength >= 120 && descriptionLength <= 160,
      detail: descriptionLength ? `Hiện tại ${descriptionLength} ký tự. Nên trong khoảng 120-160 ký tự.` : 'Chưa có meta description.',
      actionId: 'seo-defaults',
      actionLabel: 'Tạo mô tả SEO'
    },
    {
      label: 'Focus keyword',
      ok: Boolean(keyword),
      detail: keyword ? `Đang theo dõi từ khóa: "${form.focusKeyword.trim()}".` : 'Nên nhập 1 từ khóa chính cho bài viết.',
      actionId: 'focus-keyword',
      actionLabel: 'Nhập từ khóa'
    },
    {
      label: 'Keyword trong title / slug / mô tả',
      ok: Boolean(keyword) && `${form.title} ${form.seoTitle}`.toLowerCase().includes(keyword) && form.slug.includes(slugifyLocal(keyword)) && form.seoDescription.toLowerCase().includes(keyword),
      detail: 'Từ khóa chính nên xuất hiện trong title, slug và meta description.',
      actionId: 'seo-defaults',
      actionLabel: 'Vá SEO nhanh'
    },
    {
      label: 'Keyword trong mở bài',
      ok: Boolean(keyword) && introText.includes(keyword),
      detail: 'Từ khóa nên xuất hiện sớm trong đoạn đầu để Google và người đọc hiểu chủ đề nhanh hơn.',
      actionId: 'intro-keyword',
      actionLabel: 'Chèn mở bài chuẩn SEO'
    },
    {
      label: 'Mật độ từ khóa',
      ok: !keyword || (keywordDensity >= 0.5 && keywordDensity <= 2.5),
      detail: keyword ? `Mật độ hiện tại khoảng ${keywordDensity}%. Nên giữ tự nhiên, thường trong khoảng 0.5% - 2.5%.` : 'Chưa có từ khóa chính để theo dõi mật độ.',
      actionId: 'content',
      actionLabel: 'Chỉnh nội dung'
    },
    {
      label: 'Độ dài nội dung',
      ok: words >= 300,
      detail: `Bài hiện có ${words} từ. Bài public nên có ít nhất 300 từ để đủ chiều sâu SEO.`,
      actionId: 'content',
      actionLabel: 'Viết thêm nội dung'
    },
    {
      label: 'Cấu trúc heading',
      ok: headings >= 2,
      detail: `Hiện có ${headings} heading H2/H3. Nên có ít nhất 2 heading để dễ quét nội dung.`,
      actionId: 'content',
      actionLabel: 'Thêm heading'
    },
    {
      label: 'Hình ảnh và alt text',
      ok: Boolean(form.coverImageUrl) && Boolean(form.coverImageAlt),
      detail: form.coverImageUrl ? 'Đã có ảnh đại diện. Hãy chắc alt text mô tả đúng nội dung ảnh.' : 'Nên thêm ảnh đại diện và alt text.',
      actionId: 'cover',
      actionLabel: 'Thêm ảnh bìa'
    },
    {
      label: 'Liên kết nội bộ',
      ok: internalLinks >= 1,
      detail: `Hiện có ${internalLinks} liên kết nội bộ. Nên có ít nhất 1 link về sản phẩm, HTX hoặc trang liên quan.`,
      actionId: 'internal-link',
      actionLabel: 'Chèn link nội bộ'
    },
    {
      label: 'Canonical và social',
      ok: Boolean(form.canonicalUrl) && Boolean(form.ogTitle || form.twitterTitle) && Boolean(form.ogDescription || form.twitterDescription),
      detail: 'Canonical, OG và Twitter giúp bài hiển thị đúng khi index và chia sẻ mạng xã hội.',
      actionId: 'seo-defaults',
      actionLabel: 'Điền social/SEO'
    }
  ];

  let score = 0;
  if (checks[0]?.ok) score += 15;
  if (checks[1]?.ok) score += 15;
  if (checks[2]?.ok) score += 10;
  if (checks[3]?.ok) score += 15;
  if (checks[4]?.ok) score += 10;
  if (checks[5]?.ok) score += 5;
  if (checks[6]?.ok) score += 10;
  if (checks[7]?.ok) score += 5;
  if (checks[8]?.ok) score += 5;
  if (checks[9]?.ok) score += 5;
  if (checks[10]?.ok) score += 10;

  const notes = checks.filter((check) => !check.ok).map((check) => check.detail);
  const strengths = checks.filter((check) => check.ok).map((check) => `${check.label}: ${check.detail}`);
  const readability = words
    ? avgSentenceWords <= 18
      ? 92
      : avgSentenceWords <= 25
        ? 80
        : avgSentenceWords <= 32
          ? 65
          : avgSentenceWords <= 40
            ? 48
            : 32
    : 0;

  return {
    score: Math.min(score, 100),
    readability,
    notes,
    strengths,
    checks,
    stats: {
      words,
      headings,
      images,
      internalLinks,
      keywordMatches,
      keywordDensity,
      titleLength,
      descriptionLength
    }
  };
}

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'bg-mint text-leaf';
  if (status === 'DRAFT') return 'bg-sky text-slate-700';
  if (status === 'SCHEDULED') return 'bg-amber-100 text-amber-900';
  return 'bg-stone-100 text-stone-700';
}

function lengthHintClass(value: number, min: number, max: number) {
  if (!value) return 'text-slate-500';
  if (value >= min && value <= max) return 'text-emerald-700';
  return 'text-amber-700';
}

function statusLabel(status: string) {
  if (status === 'PUBLISHED') return 'Đã đăng';
  if (status === 'DRAFT') return 'Nháp';
  if (status === 'SCHEDULED') return 'Hẹn giờ';
  if (status === 'ARCHIVED') return 'Lưu trữ';
  return status;
}

function seoScoreClass(score: number) {
  if (score >= 80) return 'bg-emerald-100';
  if (score >= 60) return 'bg-amber-100';
  return 'bg-rose-100';
}

function seoScoreBarClass(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

function seoScoreLabel(score: number) {
  if (score >= 80) return 'Tốt, có thể tự tin publish';
  if (score >= 60) return 'Khá ổn, nên rà thêm vài mục';
  return 'Cần bổ sung trước khi đăng';
}

function readabilityClass(score: number) {
  if (score >= 80) return 'bg-sky';
  if (score >= 60) return 'bg-amber-100';
  return 'bg-slate-100';
}

function readabilityLabel(score: number) {
  if (score >= 80) return 'Dễ đọc, câu khá gọn';
  if (score >= 60) return 'Tạm ổn, có thể rút câu thêm';
  return 'Khá dày, nên viết ngắn hơn';
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

function buildPreparedBodyHtml(form: NewsForm) {
  let bodyHtml = form.bodyHtml || '<p></p>';
  const keyword = (form.focusKeyword || form.title).trim();
  const stripped = stripHtml(bodyHtml);

  if (keyword && !stripped.slice(0, 180).toLowerCase().includes(keyword.toLowerCase())) {
    const introParagraph = `<p><strong>${escapeHtml(keyword)}</strong> la noi dung trong tam cua bai viet nay. Duoi day la nhung thong tin quan trong de nguoi doc va Google hieu nhanh chu de ban dang dang.</p>`;
    bodyHtml = `${introParagraph}${bodyHtml}`;
  }

  if (stripped.split(/\s+/).filter(Boolean).length >= 120 && !/<h[23][^>]*>/i.test(bodyHtml)) {
    const headingBlock = '<h2>Thong tin chinh</h2><p>Bo sung y chinh quan trong tai day.</p><h2>Noi dung can biet</h2><p>Mo rong them chi tiet, loi ich hoac huong dan cu the.</p>';
    bodyHtml = `${headingBlock}${bodyHtml}`;
  }

  if (!/<a[^>]+href="(?:\/|https:\/\/htxonline\.vn)/i.test(bodyHtml)) {
    const internalLink = suggestPrimaryInternalLink(form);
    bodyHtml = `${bodyHtml}<p><a href="${internalLink.href}">${escapeHtml(internalLink.label)}</a></p>`;
  }

  return bodyHtml;
}

function trimText(value: string, max: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + '…';
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function countOccurrences(text: string, keyword: string) {
  if (!keyword) return 0;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.match(new RegExp(escaped, 'gi'))?.length ?? 0;
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

function hasMeaningfulDraft(form: NewsForm) {
  return Boolean(
    form.title.trim() ||
    form.slug.trim() ||
    form.excerpt.trim() ||
    stripHtml(form.bodyHtml) ||
    form.coverImageUrl.trim() ||
    form.focusKeyword.trim()
  );
}

function formatDateTime(value?: string) {
  if (!value) return 'chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'chưa có';
  return date.toLocaleString('vi-VN');
}

function buildPublishReadiness(form: NewsForm, seo: SeoScoreResult) {
  const items = [
    { label: 'Tiêu đề', ok: Boolean(form.title.trim()) },
    { label: 'Mô tả ngắn', ok: form.excerpt.trim().length >= 80 },
    { label: 'Ảnh đại diện', ok: Boolean(form.coverImageUrl.trim()) },
    { label: 'Từ khóa', ok: Boolean(form.focusKeyword.trim()) },
    { label: 'Nội dung', ok: seo.stats.words >= 180 },
    { label: 'Slug', ok: Boolean(form.slug.trim()) }
  ];
  const completed = items.filter((item) => item.ok).length;
  const total = items.length;
  const ratio = completed / total;
  if (ratio === 1) {
    return {
      items,
      completed,
      total,
      ratio,
      label: 'Có thể publish ngay',
      detail: 'Bài viết đã đủ các thành phần cốt lõi để lên trang public và tiếp tục tối ưu SEO chi tiết.'
    };
  }
  if (ratio >= 0.67) {
    return {
      items,
      completed,
      total,
      ratio,
      label: 'Gần sẵn sàng',
      detail: 'Khung bài đã khá đầy đủ. Chỉ cần bổ sung vài trường còn thiếu trước khi publish.'
    };
  }
  return {
    items,
    completed,
    total,
    ratio,
    label: 'Cần bổ sung thêm',
    detail: 'Nên hoàn thiện tiêu đề, mô tả, ảnh và nội dung trước khi đưa bài viết lên public.'
  };
}

function buildNextStepSuggestions(form: NewsForm, seo: SeoScoreResult): NextStepSuggestion[] {
  const suggestions: NextStepSuggestion[] = [];
  if (!form.title.trim()) {
    suggestions.push({
      id: 'title',
      title: 'Thêm tiêu đề rõ ràng',
      detail: 'Tiêu đề là nền cho slug, keyword và toàn bộ preview SEO/social. Hãy viết ngắn gọn, đúng ý chính của bài.',
      actionLabel: 'Nhập tiêu đề'
    });
  }
  if (seo.stats.words < 180) {
    suggestions.push({
      id: 'content',
      title: 'Bổ sung nội dung chính',
      detail: 'Bài đang còn ngắn. Hãy thêm các đoạn mô tả, lợi ích, quy trình hoặc thông tin truy xuất để bài dễ lên chuẩn hơn.',
      actionLabel: 'Soạn nội dung'
    });
  }
  if (!form.coverImageUrl.trim()) {
    suggestions.push({
      id: 'cover',
      title: 'Thêm ảnh bìa cho bài',
      detail: 'Ảnh bìa giúp bài đẹp hơn trên trang tin tức và là nguồn mặc định cho social preview nếu bạn chưa tùy biến.',
      actionLabel: 'Thêm ảnh bìa'
    });
  }
  if (form.excerpt.trim().length < 80) {
    suggestions.push({
      id: 'excerpt',
      title: 'Tạo mô tả ngắn dễ đọc',
      detail: 'Mô tả ngắn đang còn thiếu hoặc quá ngắn. Hệ thống có thể tự rút gọn từ nội dung để bạn chỉnh lại nhanh.',
      actionLabel: 'Tạo mô tả'
    });
  }
  if (!form.focusKeyword.trim() || !form.seoTitle.trim() || !form.seoDescription.trim()) {
    suggestions.push({
      id: 'seo',
      title: 'Điền nhanh SEO cơ bản',
      detail: 'Bài chưa đủ keyword, SEO title hoặc meta description. Một cú bấm có thể tự vá những phần cơ bản còn thiếu.',
      actionLabel: 'Vá SEO nhanh'
    });
  }
  if (seo.stats.internalLinks === 0) {
    suggestions.push({
      id: 'links',
      title: 'Chèn ít nhất một internal link',
      detail: 'Link nội bộ giúp người đọc đi tiếp sang sản phẩm, HTX hoặc trang liên hệ, đồng thời cải thiện SEO on-page.',
      actionLabel: 'Chèn link nội bộ'
    });
  }
  return suggestions.slice(0, 4);
}

function buildQuickWins(form: NewsForm, seo: SeoScoreResult, focusKeywordSuggestions: string[]): QuickWinSuggestion[] {
  const wins: QuickWinSuggestion[] = [];
  const keyword = form.focusKeyword.trim();
  const introHasKeyword = keyword && stripHtml(form.bodyHtml).slice(0, 180).toLowerCase().includes(keyword.toLowerCase());

  if (!form.title.trim()) {
    wins.push({
      id: 'title',
      title: 'Viết tiêu đề rõ ràng',
      detail: 'Tiêu đề là điểm xuất phát cho slug, từ khóa, SEO title và preview chia sẻ.',
      actionLabel: 'Nhập tiêu đề'
    });
  }

  if (form.excerpt.trim().length < 80 && stripHtml(form.bodyHtml)) {
    wins.push({
      id: 'excerpt',
      title: 'Tạo mô tả ngắn từ nội dung',
      detail: 'Mô tả ngắn giúp danh sách tin tức và meta description rõ ràng hơn ngay lập tức.',
      actionLabel: 'Tạo mô tả'
    });
  }

  if (!keyword) {
    wins.push({
      id: 'keyword',
      title: 'Chọn 1 từ khóa chính',
      detail: focusKeywordSuggestions[0]
        ? `Hệ thống đã gợi ý sẵn "${focusKeywordSuggestions[0]}" để bạn dùng nhanh.`
        : 'Chỉ cần 1 cụm từ khóa chính là đủ để editor chấm bài chính xác hơn.',
      actionLabel: focusKeywordSuggestions[0] ? 'Dùng từ khóa gợi ý' : 'Nhập từ khóa'
    });
  }

  if (keyword && !introHasKeyword) {
    wins.push({
      id: 'intro',
      title: 'Đưa từ khóa vào mở bài',
      detail: 'Chỉ cần thêm 1 đoạn mở đầu có từ khóa là điểm SEO thường tăng ngay và người đọc hiểu chủ đề nhanh hơn.',
      actionLabel: 'Chèn mở bài'
    });
  }

  if (form.coverImageUrl.trim() && !form.coverImageAlt.trim()) {
    wins.push({
      id: 'cover-alt',
      title: 'Điền alt text cho ảnh bìa',
      detail: 'Alt text giúp ảnh rõ nghĩa hơn cho SEO và chia sẻ. Có thể lấy theo tiêu đề hoặc từ khóa chính.',
      actionLabel: 'Điền alt ngay'
    });
  }

  if (seo.stats.words >= 120 && !form.tags.trim()) {
    wins.push({
      id: 'tags',
      title: 'Tạo tag gợi ý cho bài',
      detail: 'Tag giúp nhóm bài cùng chủ đề và hỗ trợ điều hướng tốt hơn trong kho nội dung.',
      actionLabel: 'Gợi ý tags'
    });
  }

  if (seo.stats.words >= 120 && seo.stats.headings === 0) {
    wins.push({
      id: 'heading',
      title: 'Thêm khung H2 để bài dễ đọc',
      detail: 'Bài đã đủ nội dung cơ bản nhưng chưa chia mục. Chèn sẵn 2 heading sẽ giúp bài nhìn gọn và tăng điểm cấu trúc.',
      actionLabel: 'Chèn heading mẫu'
    });
  }

  if (seo.stats.words >= 120 && seo.stats.internalLinks === 0) {
    wins.push({
      id: 'link',
      title: 'Chèn 1 internal link liên quan',
      detail: 'Một link sang sản phẩm, HTX hoặc liên hệ sẽ giúp người đọc đi tiếp và cải thiện SEO on-page.',
      actionLabel: 'Chèn link ngay'
    });
  }

  return wins.slice(0, 4);
}

function buildAutofillPlan(form: NewsForm, seo: SeoScoreResult): AutofillItem[] {
  const items: AutofillItem[] = [];
  const bodyText = stripHtml(form.bodyHtml);
  const keyword = (form.focusKeyword || form.title).trim();
  const introHasKeyword = keyword && bodyText.slice(0, 180).toLowerCase().includes(keyword.toLowerCase());

  if (!form.slug.trim() && form.title.trim()) items.push({ id: 'slug', label: 'Slug tu tieu de' });
  if (!form.excerpt.trim() && bodyText) items.push({ id: 'excerpt', label: 'Mo ta ngan tu noi dung' });
  if (!form.focusKeyword.trim() && form.title.trim()) items.push({ id: 'keyword', label: 'Tu khoa chinh' });
  if (!form.seoTitle.trim() && form.title.trim()) items.push({ id: 'seoTitle', label: 'SEO title' });
  if (!form.seoDescription.trim() && (form.excerpt.trim() || bodyText)) items.push({ id: 'seoDescription', label: 'Meta description' });
  if (!form.canonicalUrl.trim() && (form.slug.trim() || form.title.trim())) items.push({ id: 'canonical', label: 'Canonical URL' });
  if ((!form.ogTitle.trim() && !form.twitterTitle.trim()) || (!form.ogDescription.trim() && !form.twitterDescription.trim()) || (!form.ogImageUrl.trim() && !form.twitterImageUrl.trim())) {
    items.push({ id: 'social', label: 'Preview social' });
  }
  if (!form.coverImageAlt.trim() && (form.coverImageUrl.trim() || form.title.trim())) items.push({ id: 'coverAlt', label: 'Alt anh bia' });
  if (keyword && !introHasKeyword) items.push({ id: 'intro', label: 'Mo bai co tu khoa' });
  if (seo.stats.words >= 120 && seo.stats.headings === 0) items.push({ id: 'heading', label: 'Khung H2/H3 co ban' });
  if (seo.stats.internalLinks === 0) items.push({ id: 'link', label: '1 internal link phu hop' });
  if (!form.tags.trim() && seo.stats.words >= 120) items.push({ id: 'tags', label: 'Tags goi y' });

  return items.slice(0, 8);
}

function buildPreparedDiffs(form: NewsForm, prepared: NewsForm): PreparedDiffItem[] {
  const diffs: PreparedDiffItem[] = [];

  const addDiff = (id: PreparedDiffItem['id'], label: string, before: string, after: string) => {
    const cleanBefore = before.trim() || 'Chưa có';
    const cleanAfter = after.trim() || 'Chưa có';
    if (cleanBefore === cleanAfter) return;
    diffs.push({ id, label, before: cleanBefore, after: cleanAfter });
  };

  addDiff('slug', 'Slug', form.slug, prepared.slug);
  addDiff('excerpt', 'Mô tả ngắn', form.excerpt, prepared.excerpt);
  addDiff('keyword', 'Từ khóa chính', form.focusKeyword, prepared.focusKeyword);
  addDiff('seoTitle', 'SEO title', form.seoTitle, prepared.seoTitle);
  addDiff('seoDescription', 'Meta description', form.seoDescription, prepared.seoDescription);
  addDiff('canonical', 'Canonical URL', form.canonicalUrl, prepared.canonicalUrl);
  addDiff('coverAlt', 'Alt ảnh bìa', form.coverImageAlt, prepared.coverImageAlt);
  addDiff('tags', 'Tags', form.tags, prepared.tags);

  const beforeBodySignals = [
    /<h[23][^>]*>/i.test(form.bodyHtml) ? 'Đã có heading' : 'Chưa có heading',
    /<a[^>]+href="(?:\/|https:\/\/htxonline\.vn)/i.test(form.bodyHtml) ? 'Đã có internal link' : 'Chưa có internal link',
    stripHtml(form.bodyHtml).slice(0, 180)
  ].join(' · ');
  const afterBodySignals = [
    /<h[23][^>]*>/i.test(prepared.bodyHtml) ? 'Đã có heading' : 'Chưa có heading',
    /<a[^>]+href="(?:\/|https:\/\/htxonline\.vn)/i.test(prepared.bodyHtml) ? 'Đã có internal link' : 'Chưa có internal link',
    stripHtml(prepared.bodyHtml).slice(0, 180)
  ].join(' · ');
  addDiff('body', 'Khung nội dung', beforeBodySignals, afterBodySignals);

  return diffs.slice(0, 6);
}

function buildResolvedMetaPreview(form: NewsForm): ResolvedMetaPreview {
  const canonical = form.canonicalUrl.trim() || `https://htxonline.vn/tin-tuc/${form.slug || 'slug'}`;
  const title = (form.seoTitle || form.title || 'Tiêu đề SEO').trim();
  const description = (form.seoDescription || form.excerpt || stripHtml(form.bodyHtml).slice(0, 160) || 'Mô tả SEO').trim();
  const ogTitle = (form.ogTitle || title).trim();
  const ogDescription = (form.ogDescription || description).trim();
  const ogImage = (form.ogImageUrl || form.coverImageUrl || 'Ảnh bìa public').trim();
  const twitterTitle = (form.twitterTitle || ogTitle).trim();
  const twitterDescription = (form.twitterDescription || ogDescription).trim();
  const twitterImage = (form.twitterImageUrl || ogImage).trim();

  return {
    keyword: (form.focusKeyword || form.title).trim(),
    tags: form.tags
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    title,
    description,
    canonical,
    robots: [form.robotsNoIndex ? 'noindex' : 'index', form.robotsNoFollow ? 'nofollow' : 'follow'].join(', '),
    schemaType: form.schemaType || 'NewsArticle',
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage
  };
}

function buildSeoSignals(form: NewsForm, seo: SeoScoreResult): SeoSignal[] {
  const keyword = (form.focusKeyword || form.title).trim().toLowerCase();
  const title = (form.title || form.seoTitle).trim().toLowerCase();
  const slug = form.slug.trim().toLowerCase();
  const intro = stripHtml(form.bodyHtml).slice(0, 180).toLowerCase();
  const socialReady = Boolean((form.ogTitle || form.twitterTitle).trim()) && Boolean((form.ogDescription || form.twitterDescription).trim());

  return [
    {
      id: 'keyword-title',
      label: 'Từ khóa có trong tiêu đề',
      ok: !keyword || title.includes(keyword),
      priority: 'must',
      detail: keyword
        ? title.includes(keyword)
          ? 'Tiêu đề đã nhắc đúng từ khóa chính, đây là tín hiệu mạnh cho SEO và người đọc.'
          : 'Từ khóa chính chưa xuất hiện rõ trong tiêu đề. Nên đưa cụm từ khóa vào tiêu đề chính.'
        : 'Chưa chọn từ khóa chính. Bạn nên nhập hoặc dùng từ khóa gợi ý để hệ thống chấm chuẩn hơn.',
      actionId: keyword ? undefined : 'keyword',
      actionLabel: keyword ? undefined : 'Chon tu khoa'
    },
    {
      id: 'keyword-slug',
      label: 'Từ khóa có trong slug',
      ok: !keyword || slug.includes(slugifyLocal(keyword)),
      priority: 'should',
      detail: keyword
        ? slug.includes(slugifyLocal(keyword))
          ? 'Slug đã chứa từ khóa chính và đang khá dễ đọc khi chia sẻ.'
          : 'Slug chưa phản ánh rõ từ khóa chính. Nên để slug ngắn và bám sát chủ đề bài.'
        : 'Slug sẽ tốt hơn khi có từ khóa chính.',
      actionId: 'seo-defaults',
      actionLabel: 'Sua slug nhanh'
    },
    {
      id: 'keyword-intro',
      label: 'Từ khóa có trong mở bài',
      ok: !keyword || intro.includes(keyword),
      priority: 'must',
      detail: keyword
        ? intro.includes(keyword)
          ? 'Mở bài đã nhắc từ khóa nên Google và người đọc hiểu chủ đề nhanh hơn.'
          : 'Đoạn mở đầu chưa có từ khóa chính. Chỉ cần thêm một câu mở bài là điểm SEO thường tăng ngay.'
        : 'Khi có từ khóa, bạn nên cho nó vào 1-2 câu đầu bài.',
      actionId: keyword ? 'intro' : 'keyword',
      actionLabel: keyword ? 'Chen mo bai' : 'Them tu khoa'
    },
    {
      id: 'meta-description',
      label: 'Meta description đủ rõ',
      ok: seo.stats.descriptionLength >= 80 && seo.stats.descriptionLength <= 160,
      priority: 'must',
      detail:
        seo.stats.descriptionLength >= 80 && seo.stats.descriptionLength <= 160
          ? 'Meta description đang nằm trong vùng đẹp để hiển thị trên kết quả tìm kiếm.'
          : `Meta description hiện có ${seo.stats.descriptionLength} ký tự. Nên giữ khoảng 80-160 ký tự để dễ hiển thị đủ ý.`,
      actionId: 'excerpt',
      actionLabel: 'Tao mo ta nhanh'
    },
    {
      id: 'cover-alt',
      label: 'Ảnh bìa và alt text',
      ok: Boolean(form.coverImageUrl.trim()) && Boolean(form.coverImageAlt.trim()),
      priority: 'must',
      detail: form.coverImageUrl.trim()
        ? form.coverImageAlt.trim()
          ? 'Ảnh bìa đã có alt text, tốt cho chia sẻ và SEO hình ảnh.'
          : 'Ảnh bìa đã có nhưng alt text còn trống. Bạn nên điền alt theo tiêu đề hoặc từ khóa.'
        : 'Bài viết chưa có ảnh bìa. Nên thêm ảnh bìa để preview chia sẻ và danh sách tin tức đẹp hơn.',
      actionId: form.coverImageUrl.trim() ? 'cover-alt' : undefined,
      actionLabel: form.coverImageUrl.trim() ? 'Dien alt anh' : undefined
    },
    {
      id: 'heading-structure',
      label: 'Cấu trúc heading dễ quét',
      ok: seo.stats.headings >= 2,
      priority: 'must',
      detail:
        seo.stats.headings >= 2
          ? `Bài đã có ${seo.stats.headings} heading H2/H3 nên khá dễ đọc và dễ quét nội dung.`
          : `Hiện mới có ${seo.stats.headings} heading H2/H3. Nên có ít nhất 2 heading để chia ý rõ ràng.`,
      actionId: 'heading',
      actionLabel: 'Chen heading'
    },
    {
      id: 'internal-link',
      label: 'Có ít nhất 1 internal link',
      ok: seo.stats.internalLinks >= 1,
      priority: 'should',
      detail:
        seo.stats.internalLinks >= 1
          ? 'Bài đã có internal link dẫn sang trang liên quan trong hệ thống.'
          : 'Bài chưa có internal link. Nên chèn ít nhất 1 link về sản phẩm, HTX hoặc trang liên hệ.',
      actionId: 'link',
      actionLabel: 'Chen link'
    },
    {
      id: 'social-preview',
      label: 'Preview mạng xã hội đã sẵn',
      ok: socialReady,
      priority: 'should',
      detail: socialReady
        ? 'OG/Twitter title và description đã sẵn sàng để chia sẻ lên mạng xã hội.'
        : 'Thiếu dữ liệu social preview. Có thể bấm vá nhanh để editor tự điền từ tiêu đề, mô tả và ảnh bìa.',
      actionId: 'seo-defaults',
      actionLabel: 'Tu dien social'
    },
    {
      id: 'readability',
      label: 'Độ dễ đọc ổn',
      ok: seo.readability >= 60,
      priority: 'should',
      detail:
        seo.readability >= 80
          ? 'Câu chữ đang khá gọn, dễ đọc trên mobile.'
          : seo.readability >= 60
            ? 'Độ dễ đọc đang ổn, có thể rút thêm vài câu dài nếu muốn tăng điểm.'
            : 'Bài đang hơi dày hoặc câu dài. Nên tách đoạn ngắn hơn để người đọc trên mobile đỡ mệt.',
      actionId: 'heading',
      actionLabel: 'To chuc lai bai'
    }
  ];
}

function buildContentOutlinePreview(form: NewsForm): ContentOutlinePreview {
  const headings = Array.from(form.bodyHtml.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gis))
    .map((match) => ({
      level: match[1] === '2' ? 'H2' : 'H3',
      text: stripHtml(match[2] || '').replace(/\s+/g, ' ').trim()
    }))
    .filter((item) => item.text) as Array<{ level: 'H2' | 'H3'; text: string }>;

  const paragraphCount = Math.max(
    Array.from(form.bodyHtml.matchAll(/<p\b[^>]*>(.*?)<\/p>/gis))
      .map((match) => stripHtml(match[1] || '').trim())
      .filter(Boolean).length,
    stripHtml(form.bodyHtml) ? 1 : 0
  );
  const imageTags = Array.from(form.bodyHtml.matchAll(/<img\b[^>]*>/gi)).map((match) => match[0]);
  const imagesMissingAlt = imageTags.filter((tag) => {
    const altMatch = tag.match(/\balt="([^"]*)"/i);
    return !altMatch || !altMatch[1]?.trim();
  }).length;
  const words = stripHtml(form.bodyHtml).split(/\s+/).filter(Boolean).length;

  return {
    headings: headings.slice(0, 8),
    paragraphCount,
    imageCount: imageTags.length,
    imagesMissingAlt,
    internalLinks: countMatches(form.bodyHtml, /<a[^>]+href="(?:\/|https:\/\/htxonline\.vn)/gi),
    estimatedMinutes: Math.max(1, Math.ceil(words / 180))
  };
}

function buildCorePublishItems(form: NewsForm): CorePublishItem[] {
  return [
    {
      id: 'title',
      label: 'Tieu de ro rang',
      ok: form.title.trim().length >= 12,
      hint: form.title.trim() ? 'Da co tieu de, co the bam de xem lai neu can.' : 'Nhap tieu de de he thong tao slug, keyword va preview SEO.'
    },
    {
      id: 'content',
      label: 'Noi dung bai viet',
      ok: stripHtml(form.bodyHtml).trim().length >= 80,
      hint: stripHtml(form.bodyHtml).trim() ? 'Da co noi dung, co the bo sung them H2 hoac anh neu muon.' : 'Dan noi dung hoac go truc tiep vao editor nhu soan Word.'
    },
    {
      id: 'cover',
      label: 'Anh bia',
      ok: Boolean(form.coverImageUrl.trim()),
      hint: form.coverImageUrl.trim() ? 'Da co anh bia, social preview se dep hon.' : 'Dan, tha hoac upload 1 anh ngang lam cover de bai de tin hon.'
    }
  ];
}

function detectImportedFormatting(value: string) {
  if (!value.trim()) return false;
  return /class="?Mso|mso-|font-family:|<span\b|<div\b|style=|<o:p>|<meta\b|<link\b|<xml\b/i.test(value);
}

function sanitizeImportedHtml(input: string) {
  if (!input.trim()) return '';

  let html = input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\s(?:class|style|lang|width|height|align|valign|data-[\w-]+|xmlns(:\w+)?)="[^"]*"/gi, '')
    .replace(/\s(?:class|style|lang|width|height|align|valign|data-[\w-]+|xmlns(:\w+)?)='[^']*'/gi, '')
    .replace(/<o:p>\s*<\/o:p>/gi, '')
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '')
    .replace(/<\/?(span|font|meta|link|xml|st1:[^>]+|w:[^>]+|v:[^>]+)[^>]*>/gi, '')
    .replace(/<div\b[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>\s*(<(h[1-6]|ul|ol|li|blockquote|figure)\b)/gi, '$1')
    .replace(/(<\/(h[1-6]|ul|ol|li|blockquote|figure)>)\s*<\/p>/gi, '$1');

  html = html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
    const srcMatch = attrs.match(/\bsrc=(?:"([^"]+)"|'([^']+)')/i);
    if (!srcMatch) return '';
    const src = srcMatch[1] || srcMatch[2] || '';
    const altMatch = attrs.match(/\balt=(?:"([^"]*)"|'([^']*)')/i);
    const alt = escapeHtml((altMatch?.[1] || altMatch?.[2] || 'Ảnh minh họa').trim() || 'Ảnh minh họa');
    return `<img src="${src}" alt="${alt}" loading="lazy" />`;
  });

  html = html
    .replace(/<(h1)\b[^>]*>/gi, '<h2>')
    .replace(/<\/h1>/gi, '</h2>')
    .replace(/<(h[2-6])\b[^>]*>/gi, (_, tag: string) => `<${tag.toLowerCase()}>`)
    .replace(/<\/(h[2-6])>/gi, (_, tag: string) => `</${tag.toLowerCase()}>`)
    .replace(/<a\b([^>]*)>/gi, (full, attrs: string) => {
      const hrefMatch = attrs.match(/\bhref=(?:"([^"]+)"|'([^']+)')/i);
      if (!hrefMatch) return '<a>';
      const href = escapeHtml((hrefMatch[1] || hrefMatch[2] || '').trim());
      return `<a href="${href}">`;
    })
    .replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/gi, '<figure>$1</figure>')
    .replace(/(<figure>\s*<img\b[^>]*>\s*)(?!<figcaption>)(<\/figure>)/gi, '$1$2')
    .replace(/\n+/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return plainTextToEditorHtml(stripHtml(html));
  }

  return html;
}

function plainTextToEditorHtml(text: string) {
  return text
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br />')}</p>`)
    .join('');
}

function publishReadinessClass(ratio: number) {
  if (ratio === 1) return 'border-emerald-200 bg-emerald-50';
  if (ratio >= 0.67) return 'border-amber-200 bg-amber-50';
  return 'border-rose-200 bg-rose-50';
}

function suggestTags(form: NewsForm) {
  const bodyText = stripHtml(form.bodyHtml);
  const suggestions = [
    form.focusKeyword,
    ...form.title.split(/[,:;|/-]+/),
    ...bodyText.split(/[.!?]+/).slice(0, 2)
  ]
    .map((value) => (typeof value === 'string' ? value : ''))
    .map((value) => value.trim())
    .map((value) => normalizeTag(value))
    .filter(Boolean);

  return Array.from(new Set(suggestions)).slice(0, 6);
}

function suggestFocusKeywords(form: NewsForm) {
  const titleParts = form.title
    .split(/[:;|,()/-]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const suggested = [
    form.focusKeyword,
    titleParts[0],
    titleParts[1],
    ...suggestTags(form).slice(0, 4)
  ]
    .map((value) => (typeof value === 'string' ? value : ''))
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value.length >= 4)
    .map((value) => value.replace(/\s+/g, ' '))
    .filter((value) => !/^(tin tuc|cap nhat|huong dan|htxonline)$/i.test(slugifyLocal(value)));

  return Array.from(new Set(suggested)).slice(0, 4);
}

function suggestPrimaryInternalLink(form: NewsForm) {
  if (form.focusKeyword.trim()) {
    return {
      label: `Xem them san pham lien quan "${form.focusKeyword.trim()}"`,
      href: `/san-pham?search=${encodeURIComponent(form.focusKeyword.trim())}`
    };
  }
  return {
    label: 'Kham pha them san pham va hop tac xa tren HTXONLINE',
    href: '/san-pham'
  };
}

function buildInternalLinkSuggestions(form: NewsForm) {
  const dynamicSuggestions: InternalLinkSuggestion[] = [];

  if (form.focusKeyword.trim()) {
    dynamicSuggestions.push({
      label: `Sản phẩm liên quan "${form.focusKeyword.trim()}"`,
      href: `/san-pham?search=${encodeURIComponent(form.focusKeyword.trim())}`,
      description: 'Tăng khả năng điều hướng từ bài viết sang khu vực sản phẩm đúng chủ đề.'
    });
  }

  if (form.categoryId) {
    dynamicSuggestions.push({
      label: 'Xem thêm tin cùng chuyên mục',
      href: '/tin-tuc',
      description: 'Đưa người đọc quay lại hub nội dung để đọc thêm các bài liên quan.'
    });
  }

  return [...dynamicSuggestions, ...defaultInternalLinkSuggestions].slice(0, 6);
}

function normalizeTag(value: string) {
  const clean = value
    .replace(/\s+/g, ' ')
    .replace(/^[^A-Za-z0-9À-ỹ]+|[^A-Za-z0-9À-ỹ]+$/g, '')
    .trim();
  if (!clean) return '';
  if (clean.length < 3 || clean.length > 40) return '';
  if (/^(va|voi|cho|cua|cac|nhung|tren|duoc|mot|nhieu)$/i.test(slugifyLocal(clean))) return '';
  return clean;
}
