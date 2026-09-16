'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Code2,
  ChevronUp,
  ChevronDown,
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
  Sparkles,
  Target,
  Upload
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { marketplaceUrl, publicOriginForSite } from '@/lib/domain';
import type { NewsArticle, NewsCategory, NewsSiteKey } from '@/lib/news';
import { PASSPORT_NEWS_PLAN } from '@/lib/passport-news-plan';
import { Badge, Button, Input, Panel, Select, Textarea, cn } from '@/components/ui';

type NewsForm = {
  siteKey: NewsSiteKey;
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  coverImageAlt: string;
  status: NewsArticle['status'];
  publicVerified: boolean;
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
type EditorAssistKind = 'pasted-image' | 'pasted-content' | 'optimized-content' | 'prepared-publish';
type SuggestedCover = { url: string; alt: string; sourceLabel: string };
type UploadTarget = 'cover' | 'body';
type UploadRetry = { file: File; target: UploadTarget };

type LocalDraftPayload = {
  savedAt: string;
  form: NewsForm;
  editingId: string | null;
};

const emptyForm: NewsForm = {
  siteKey: 'AGRIPASSPORT',
  categoryId: '',
  title: '',
  slug: '',
  excerpt: '',
  bodyHtml: '<p></p>',
  coverImageUrl: '',
  coverImageAlt: '',
  status: 'DRAFT',
  publicVerified: false,
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

const editorSnippets: Array<[LucideIcon, string, string]> = [
  [Heading2, '<h2>Tiêu đề H2</h2>', 'Chèn tiêu đề H2'],
  [Heading3, '<h3>Tiêu đề H3</h3>', 'Chèn tiêu đề H3'],
  [Italic, '<em>chữ nghiêng</em>', 'Chữ nghiêng'],
  [LinkIcon, '<a href="https://agripassport.com">liên kết</a>', 'Chèn liên kết'],
  [List, '<ul><li>Mục</li></ul>', 'Danh sách không thứ tự'],
  [ListOrdered, '<ol><li>Mục</li></ol>', 'Danh sách có thứ tự'],
  [Quote, '<blockquote>Trích dẫn</blockquote>', 'Chèn trích dẫn']
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
    title: 'Câu chuyện từ một hợp tác xã đang chuẩn hóa dữ liệu cùng Agripassport',
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
<h2>Vì sao HTX đưa dữ liệu lên Agripassport?</h2>
<p>Chia sẻ ngắn về nhu cầu minh bạch thông tin, mở rộng thị trường hoặc quản lý đơn hàng hiệu quả hơn.</p>
<h2>Sản phẩm nên xem ngay</h2>
<p>Chèn liên kết hoặc mô tả 1-3 sản phẩm công khai mà bạn muốn đẩy traffic.</p>`
  },
  {
    id: 'buyer-guide',
    label: 'Hướng dẫn mua hàng',
    description: 'Dùng cho bài hướng dẫn thao tác, cách đặt hàng, cách quét QR và xem thông tin công khai.',
    categoryHint: 'Danh mục gợi ý: Hướng dẫn mua hàng',
    title: 'Cách chọn sản phẩm và đặt hàng nhanh trên Agripassport',
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
  { label: 'Trang sản phẩm', href: '/san-pham', description: 'Kéo traffic về danh sách sản phẩm công khai.' },
  { label: 'Danh sách HTX', href: '/htx', description: 'Dẫn người đọc sang trang hợp tác xã công khai.' },
  { label: 'Liên hệ tư vấn', href: '/lien-he', description: 'Gắn CTA khi bài cần chốt lead nhanh.' },
  { label: 'Giới thiệu nền tảng', href: '/gioi-thieu', description: 'Phù hợp bài giải thích mô hình Agripassport.' },
  { label: 'Tin tức Agripassport', href: '/tin-tuc', description: 'Dùng để liên kết lại hub nội dung chính.' }
];

function buildPublicNewsUrl(slug: string, siteKey: NewsSiteKey = 'AGRIPASSPORT') {
  const site = siteKey === 'PASSPORT' ? 'passport' : siteKey === 'HTXONLINE' ? 'htxonline' : 'agripassport';
  return `${publicOriginForSite(site)}/tin-tuc/${slug}`;
}

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
    canonicalUrl: form.canonicalUrl || (canonicalSlug ? buildPublicNewsUrl(canonicalSlug, form.siteKey) : ''),
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

type NewsEditorProps = {
  routeArticleId?: string | null;
  routeSiteKey?: NewsSiteKey;
};

export default function NewsEditorPage({ routeArticleId = null, routeSiteKey = 'AGRIPASSPORT' }: NewsEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const visualEditorRef = useRef<HTMLDivElement | null>(null);
  const coverDropzoneRef = useRef<HTMLDivElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const simplePreviewSectionRef = useRef<HTMLDivElement | null>(null);
  const skipAutosaveRef = useRef(false);
  const [siteFilter, setSiteFilter] = useState<NewsSiteKey>(routeSiteKey);
  const [form, setForm] = useState<NewsForm>({ ...emptyForm, siteKey: routeSiteKey });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [authorMode, setAuthorMode] = useState<AuthorMode>('simple');
  const [categoryDraft, setCategoryDraft] = useState({ name: '', slug: '' });
  const [bodyImage, setBodyImage] = useState({ url: '', alt: '', caption: '' });
  const [uploading, setUploading] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadRetry, setUploadRetry] = useState<UploadRetry | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState('');
  const [localDraft, setLocalDraft] = useState<LocalDraftPayload | null>(null);
  const [draggingEditor, setDraggingEditor] = useState(false);
  const [editorAssist, setEditorAssist] = useState<{ kind: EditorAssistKind; title: string; detail: string } | null>(null);
  const [suggestedCover, setSuggestedCover] = useState<SuggestedCover | null>(null);
  const [simpleEditorToolsExpanded, setSimpleEditorToolsExpanded] = useState(true);
  const [simpleMetaExpanded, setSimpleMetaExpanded] = useState(false);
  const [coverPanelExpanded, setCoverPanelExpanded] = useState(false);
  const [seoAdvancedExpanded, setSeoAdvancedExpanded] = useState(false);
  const routeArticleOpenedRef = useRef<string | null>(null);

  const categories = useQuery({
    queryKey: ['news-categories', siteFilter],
    queryFn: () => apiFetch<NewsCategory[]>(`/news/categories?siteKey=${siteFilter}`)
  });
  const routeArticle = useQuery({
    queryKey: ['news-article', routeArticleId, routeSiteKey],
    enabled: Boolean(routeArticleId),
    queryFn: () => apiFetch<NewsArticle>(`/news/${routeArticleId}?siteKey=${routeSiteKey}`)
  });

  useEffect(() => {
    const article = routeArticle.data?.data;
    if (!routeArticleId || !article || routeArticleOpenedRef.current === routeArticleId) return;
    routeArticleOpenedRef.current = routeArticleId;
    edit(article);
  }, [routeArticle.data, routeArticleId]);

  const seo = useMemo(() => clientSeoScore(form), [form]);
  const categoryItems = categories.data?.data ?? [];
  const permalink = form.canonicalUrl || buildPublicNewsUrl(form.slug || 'slug', form.siteKey);
  const excerptLength = form.excerpt.trim().length;
  const readingMinutes = Math.max(1, Math.ceil(seo.stats.words / 220));
  const publishReadiness = useMemo(() => buildPublishReadiness(form, seo), [form, seo]);
  const localDraftStorageKey = useMemo(() => buildLocalDraftStorageKey(siteFilter, editingId), [editingId, siteFilter]);
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
  const seoGreenCount = seoSignals.filter((item) => item.ok).length;
  const simpleSeoIssues = seoSignals.filter((item) => !item.ok).slice(0, 4);
  const corePublishReady = corePublishItems.filter((item) => item.ok).length;
  const missingCoreItems = corePublishItems.filter((item) => !item.ok);
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
      form.robotsNoFollow ||
      seoAdvancedExpanded
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
  const isBodyEmpty = stripHtml(form.bodyHtml).trim().length === 0;
  const publishBlockers = corePublishItems.filter((item) => {
    if (item.id === 'title') return !form.title.trim();
    if (item.id === 'content') return isBodyEmpty;
    return false;
  });
  const canPublish = publishBlockers.length === 0;
  const outlineReviewOpen = false;
  const bodyUploadActive = uploading === 'body';
  const coverUploadActive = uploading === 'cover';
  const editorTipsOpen = bodyUploadActive || draggingEditor;
  const editorToolsOpen = isAdvancedMode || isSimpleMode || needsImportedOptimization || editorMode === 'html';
  const coverPanelOpen = coverUploadActive || coverPanelExpanded;

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
      const status = statusOverride ?? form.status;
      const payload = formPayload({
        ...form,
        status,
        ...(status === 'PUBLISHED' ? { publicVerified: true } : {})
      });
      return editingId
        ? apiFetch<NewsArticle>(`/news/${editingId}?siteKey=${form.siteKey}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<NewsArticle>('/news', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setSiteFilter(result.data.siteKey ?? siteFilter);
      setForm(fromArticle(result.data));
      clearLocalDraft();
      queryClient.invalidateQueries({ queryKey: ['news-list'] });
    }
  });

  const quickPublishArticle = useMutation({
    mutationFn: () => {
      const prepared = buildPreparedNewsForm({ ...form, status: 'PUBLISHED', publicVerified: true });
      const payload = formPayload(prepared);
      return editingId
        ? apiFetch<NewsArticle>(`/news/${editingId}?siteKey=${prepared.siteKey}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : apiFetch<NewsArticle>('/news', { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: (result) => {
      setEditingId(result.data.id);
      setSiteFilter(result.data.siteKey ?? siteFilter);
      setForm(fromArticle(result.data));
      clearLocalDraft();
      queryClient.invalidateQueries({ queryKey: ['news-list'] });
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    function handleSaveShortcut(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      if (!saveArticle.isPending) saveArticle.mutate('DRAFT');
    }
    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, [saveArticle]);

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

  function changeSite(value: NewsSiteKey) {
    if (editingId || value === form.siteKey) return;
    applySiteChange(value);
  }

  function applySiteChange(value: NewsSiteKey) {
    if (typeof window !== 'undefined' && !editingId && hasMeaningfulDraft(form)) {
      const payload: LocalDraftPayload = {
        savedAt: new Date().toISOString(),
        form,
        editingId: null
      };
      window.localStorage.setItem(buildLocalDraftStorageKey(form.siteKey, null), JSON.stringify(payload));
    }
    setSiteFilter(value);
    setForm({ ...emptyForm, siteKey: value });
    setSuggestedCover(null);
    setCoverPanelExpanded(false);
    setSimpleMetaExpanded(false);
    setPreview(false);
    setBodyImage({ url: '', alt: '', caption: '' });
    setEditorAssist(null);
    setUploadError('');
    setUploadRetry(null);
    setDraftSavedAt('');
    setLocalDraft(null);
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

  function scrollToSection(target: HTMLElement | null) {
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function focusAndReveal(target: HTMLElement | null) {
    if (!target) return;
    scrollToSection(target);
    window.requestAnimationFrame(() => target.focus());
  }

  function jumpToEditor() {
    if (editorMode === 'visual') {
      focusAndReveal(visualEditorRef.current);
      return;
    }
    focusAndReveal(bodyRef.current);
  }

  function jumpToCover() {
    setCoverPanelExpanded(true);
    window.requestAnimationFrame(() => focusAndReveal(coverDropzoneRef.current));
  }

  function jumpToSimpleSeo() {
    setAuthorMode('advanced');
    setSeoAdvancedExpanded(true);
    window.requestAnimationFrame(() => {
      focusAndReveal(document.querySelector<HTMLInputElement>('[data-testid="news-focus-keyword-input"]'));
    });
  }

  function jumpToSimplePreview() {
    scrollToSection(simplePreviewSectionRef.current);
  }

  function edit(article: NewsArticle) {
    setEditingId(article.id);
    setSiteFilter(article.siteKey ?? 'AGRIPASSPORT');
    setForm(fromArticle(article));
    setSuggestedCover(null);
    setCoverPanelExpanded(false);
    setSimpleMetaExpanded(false);
    setPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null);
    setForm({ ...emptyForm, siteKey: siteFilter });
    setSuggestedCover(null);
    setCoverPanelExpanded(false);
    setSimpleMetaExpanded(false);
    setPreview(false);
    if (routeArticleId) router.replace('/dashboard/news/new');
  }

  function restoreLocalDraft() {
    if (!localDraft) return;
    if (!editingId && localDraft.form.siteKey !== siteFilter) {
      setLocalDraft(null);
      return;
    }
    skipAutosaveRef.current = true;
    setEditingId(localDraft.editingId);
    setForm(localDraft.form);
    setSuggestedCover(null);
    setDraftSavedAt(localDraft.savedAt);
    setLocalDraft(null);
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

  function captureVisualSelection() {
    const editor = visualEditorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount || !selection.anchorNode || !editor.contains(selection.anchorNode)) return null;
    return selection.getRangeAt(0).cloneRange();
  }

  function insertHtmlIntoVisualEditor(html: string, savedRange?: Range | null) {
    const editor = visualEditorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      if (savedRange && editor.contains(savedRange.commonAncestorContainer)) selection.addRange(savedRange);
      else {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.addRange(range);
      }
    }
    document.execCommand('insertHTML', false, html);
    syncVisualEditor();
  }

  function prepareVisualSelection() {
    const editor = visualEditorRef.current;
    if (!editor) return null;
    const selection = window.getSelection();
    if (!selection) return null;

    if (!selection.rangeCount || !selection.anchorNode || !editor.contains(selection.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return { editor, selection, range: selection.getRangeAt(0) };
  }

  function moveVisualCursorTo(node: Node, atStart = true) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(atStart);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertVisualBlock(tagName: 'h2' | 'h3' | 'blockquote') {
    focusVisualEditor();
    const prepared = prepareVisualSelection();
    if (!prepared) return;

    document.execCommand('formatBlock', false, tagName);
    const activeNode = prepared.selection.anchorNode;
    const activeElement = activeNode instanceof Element ? activeNode : activeNode?.parentElement;
    const block = activeElement?.closest(tagName);
    if (block && prepared.editor.contains(block)) {
      let nextBlock = block.nextElementSibling;
      if (!nextBlock || nextBlock.tagName.toLowerCase() === tagName) {
        nextBlock = document.createElement('p');
        nextBlock.innerHTML = '<br />';
        block.after(nextBlock);
      }
      moveVisualCursorTo(nextBlock, true);
    }
    syncVisualEditor();
  }

  function insertVisualInline(text: string) {
    focusVisualEditor();
    const prepared = prepareVisualSelection();
    if (!prepared) return;

    if (prepared.range.collapsed) {
      const safeText = escapeHtml(text);
      document.execCommand('insertHTML', false, `<em>${safeText}</em>&nbsp;`);
    } else {
      document.execCommand('italic');
    }
    syncVisualEditor();
  }

  function insertVisualList(command: 'insertUnorderedList' | 'insertOrderedList', text: string) {
    focusVisualEditor();
    const prepared = prepareVisualSelection();
    if (!prepared) return;

    if (prepared.range.collapsed) {
      const listTag = command === 'insertOrderedList' ? 'ol' : 'ul';
      document.execCommand('insertHTML', false, `<${listTag}><li>${escapeHtml(text)}</li></${listTag}><p><br /></p>`);
    } else {
      document.execCommand(command);
    }
    syncVisualEditor();
  }

  function insertVisualSnippet(snippet: string) {
    if (snippet.startsWith('<h2')) {
      insertVisualBlock('h2');
      return;
    }
    if (snippet.startsWith('<h3')) {
      insertVisualBlock('h3');
      return;
    }
    if (snippet.startsWith('<em')) {
      insertVisualInline('chữ nghiêng');
      return;
    }
    if (snippet.startsWith('<a ')) {
      const url = window.prompt('Nhập liên kết cần chèn', marketplaceUrl('/'));
      if (!url) return;
      focusVisualEditor();
      document.execCommand('createLink', false, url);
      syncVisualEditor();
      return;
    }
    if (snippet.startsWith('<ul')) {
      insertVisualList('insertUnorderedList', 'Mục mới');
      return;
    }
    if (snippet.startsWith('<ol')) {
      insertVisualList('insertOrderedList', 'Mục mới');
      return;
    }
    if (snippet.startsWith('<blockquote')) {
      insertVisualBlock('blockquote');
      return;
    }
    insertHtmlIntoVisualEditor(snippet);
  }

  async function uploadFile(file: File, target: UploadTarget): Promise<string | null> {
    setUploading(target);
    setUploadError('');
    setUploadRetry(null);
    try {
      const fileName = file.name || `clipboard-${Date.now()}.png`;
      // Upload through our API instead of PUT-ing from the browser to the R2
      // S3 endpoint. Some browser networks reach a different Cloudflare edge
      // and get a 403 without CORS headers, which surfaces as "Failed to fetch"
      // even though the same presigned URL works from the server.
      const multipart = new FormData();
      multipart.append('file', file, fileName);
      const uploaded = await apiFetch<FileAsset>('/files/upload', {
        method: 'POST',
        body: multipart
      });
      const url = uploaded.data.publicUrl;
      if (!url) throw new Error('Ảnh đã upload nhưng chưa nhận được đường dẫn công khai.');
      if (target === 'cover') {
        update('coverImageUrl', url);
        if (!form.ogImageUrl) update('ogImageUrl', url);
        if (!form.twitterImageUrl) update('twitterImageUrl', url);
        setSuggestedCover(null);
      } else {
        setBodyImage((current) => ({ ...current, url }));
      }
      return url;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Không thể tải ảnh lên. Vui lòng thử lại.');
      setUploadRetry({ file, target });
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

  function rememberSuggestedCover(url: string, fallbackAlt: string, sourceLabel: string) {
    if (form.coverImageUrl.trim()) return;
    setSuggestedCover({ url, alt: fallbackAlt, sourceLabel });
  }

  function applySuggestedCover() {
    if (!suggestedCover) return;
    setForm((current) => ({
      ...current,
      coverImageUrl: current.coverImageUrl || suggestedCover.url,
      coverImageAlt: current.coverImageAlt || suggestedCover.alt || current.focusKeyword || current.title,
      ogImageUrl: current.ogImageUrl || suggestedCover.url,
      twitterImageUrl: current.twitterImageUrl || suggestedCover.url
    }));
    setSuggestedCover(null);
    setEditorAssist({
      kind: 'pasted-image',
      title: 'Ảnh vừa được đưa lên cover',
      detail: 'Ảnh body đã được dùng làm ảnh bìa và nguồn preview chia sẻ mặc định nếu các ô SEO đang để trống.'
    });
  }

  function insertUploadedBodyImage(url: string, fileName: string, sourceLabel: string) {
    const fallbackAlt = form.coverImageAlt || form.focusKeyword || form.title || fileName.replace(/\.[^.]+$/, '');
    const alt = escapeHtml(fallbackAlt || 'Ảnh minh họa');
    const imageHtml = `<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`;
    rememberSuggestedCover(url, fallbackAlt, sourceLabel);
    if (editorMode === 'visual') insertHtmlIntoVisualEditor(imageHtml);
    else insertHtml(imageHtml);
    setEditorAssist({
      kind: 'pasted-image',
      title: 'Ảnh vừa được chèn vào thân bài',
      detail: 'Ảnh đã được upload và chèn vào nội dung. Bạn có thể tiếp tục viết hoặc dùng ảnh này làm cover nếu bài chưa có ảnh bìa.'
    });
  }

  async function handleBodyFile(file: File) {
    const url = await uploadFile(file, 'body');
    if (!url) return;
    insertUploadedBodyImage(url, file.name, 'Ảnh vừa tải từ máy');
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
    rememberSuggestedCover(url, form.coverImageAlt || form.focusKeyword || form.title || file.name.replace(/\.[^.]+$/, ''), 'Ảnh vừa paste vào bài');
    insertHtmlAtSelection(`<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`, selection);
    setEditorAssist({
      kind: 'pasted-image',
      title: 'Ảnh vừa được chèn vào bài',
      detail: 'Bạn có thể gõ tiếp nội dung, dùng ngay ảnh này làm cover nếu bài chưa có ảnh bìa, rồi bấm Chuẩn bị đăng hoặc Đăng 1 chạm.'
    });
  }

  async function handleVisualPaste(event: ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      const savedRange = captureVisualSelection();
      const url = await uploadFile(file, 'body');
      if (!url) return;
      const fallbackAlt = form.coverImageAlt || form.focusKeyword || form.title || file.name.replace(/\.[^.]+$/, '');
      const alt = escapeHtml(fallbackAlt || 'Ảnh minh họa');
      const imageHtml = `<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`;
      rememberSuggestedCover(url, fallbackAlt, 'Ảnh vừa paste vào editor');
      insertHtmlIntoVisualEditor(imageHtml, savedRange);
      setEditorAssist({
        kind: 'pasted-image',
        title: 'Ảnh vừa được chèn vào bài',
        detail: 'Ảnh đã được upload và giữ đúng vị trí con trỏ. Bạn có thể dùng ảnh này làm cover nếu bài chưa có ảnh bìa.'
      });
      return;
    }

    const html = event.clipboardData?.getData('text/html') || '';
    const text = event.clipboardData?.getData('text/plain') || '';
    if (!html && !text.trim()) return;

    event.preventDefault();
    const cleaned = html ? sanitizeImportedHtml(html) : plainTextToEditorHtml(text);
    if (!cleaned.trim()) return;
    insertHtmlIntoVisualEditor(cleaned);
    setEditorAssist({
      kind: 'pasted-content',
      title: html ? 'Nội dung đã được dán và làm sạch cơ bản' : 'Nội dung đã được chèn vào editor',
      detail: html
        ? 'Nếu đây là bài từ Word hoặc Google Docs, bạn nên bấm Tối ưu bài vừa dán để hệ thống dọn bố cục, thêm mở bài và sửa SEO nhanh.'
        : 'Bạn có thể xem lại bố cục, thêm ảnh và bấm Chuẩn bị đăng khi đã đủ nội dung.'
    });
  }

  async function handleDroppedFiles(fileList: FileList | null) {
    const file = Array.from(fileList ?? []).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    const url = await uploadFile(file, 'body');
    if (!url) return;
    insertUploadedBodyImage(url, file.name, 'Ảnh vừa thả vào bài');
  }

  async function handleCoverFiles(fileList: FileList | null) {
    const file = Array.from(fileList ?? []).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    await handleCoverFile(file);
  }

  async function handleCoverFile(file: File) {
    const url = await uploadFile(file, 'cover');
    if (!url) return;
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
        canonicalUrl: current.canonicalUrl || (canonicalSlug ? buildPublicNewsUrl(canonicalSlug, current.siteKey) : ''),
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
      focusKeyword: current.focusKeyword || template.title,
      seoTitle: current.seoTitle || trimText(template.title, 65),
      seoDescription: current.seoDescription || trimText(template.excerpt, 155),
      status: 'DRAFT'
    }));
    window.requestAnimationFrame(() => {
      if (editorMode === 'visual') focusVisualEditor();
      else bodyRef.current?.focus();
    });
  }

  function applyPassportPlan(slug: string) {
    const topic = PASSPORT_NEWS_PLAN.find((item) => item.slug === slug);
    if (!topic) return;
    const category = categoryItems.find((item) => item.slug === topic.categorySlug);
    setEditingId(null);
    setPreview(false);
    setForm((current) => ({
      ...current,
      siteKey: 'PASSPORT',
      categoryId: category?.id ?? current.categoryId,
      title: topic.title,
      slug: topic.slug,
      focusKeyword: topic.title.replace(/[?!:]/g, '').trim(),
      seoTitle: topic.title,
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
      canonicalUrl: current.canonicalUrl || (canonicalSlug ? buildPublicNewsUrl(canonicalSlug, current.siteKey) : ''),
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
    setEditorAssist({
      kind: 'optimized-content',
      title: 'Bài vừa dán đã được tối ưu',
      detail: 'Hệ thống đã dọn HTML, bổ sung bố cục cơ bản và điền các trường SEO/social còn thiếu nếu có thể.'
    });
  }

  function preparePostForPublish() {
    setForm((current) => buildPreparedNewsForm(current));
    setEditorAssist({
      kind: 'prepared-publish',
      title: 'Bản nháp đã được chuẩn bị để đăng',
      detail: 'Đường dẫn, mô tả, social, alt text và một phần bố cục đã được tự bổ sung. Hãy xem lại nhanh rồi bấm Đăng 1 chạm.'
    });
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

    const introParagraph = `<p>${escapeHtml(keyword)} là nội dung trọng tâm của bài viết này. Dưới đây là những thông tin quan trọng để người đọc và Google hiểu nhanh chủ đề bạn đang đăng.</p>`;
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
    const headingBlock = '<h2>Thông tin chính</h2><p>Bổ sung ý chính quan trọng tại đây.</p><h2>Nội dung cần biết</h2><p>Mở rộng thêm chi tiết, lợi ích hoặc hướng dẫn cụ thể.</p>';
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
    setEditorAssist({
      kind: 'optimized-content',
      title: 'Nội dung đã được làm sạch',
      detail: 'Thẻ rác từ Word/Docs đã được rút gọn. Nếu bài cần đăng nhanh, bạn có thể bấm SEO nhanh hoặc Chuẩn bị đăng tiếp.'
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
      focusAndReveal(document.querySelector<HTMLInputElement>('[data-testid="news-title-input"]'));
      return;
    }
    if (stepId === 'content') {
      jumpToEditor();
      return;
    }
    if (stepId === 'cover') {
      jumpToCover();
      return;
    }
    if (stepId === 'excerpt') {
      setSimpleMetaExpanded(true);
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
      focusAndReveal(document.querySelector<HTMLInputElement>('[data-testid="news-title-input"]'));
      return;
    }
    if (winId === 'excerpt') {
      setSimpleMetaExpanded(true);
      fillExcerptFromBody();
      return;
    }
    if (winId === 'keyword') {
      if (focusKeywordSuggestions[0]) {
        applyFocusKeywordSuggestion(focusKeywordSuggestions[0]);
        return;
      }
      setAuthorMode('advanced');
      setSeoAdvancedExpanded(true);
      window.requestAnimationFrame(() => {
        focusAndReveal(document.querySelector<HTMLInputElement>('[data-testid="news-focus-keyword-input"]'));
      });
      return;
    }
    if (winId === 'intro') {
      ensureKeywordInIntro();
      return;
    }
    if (winId === 'cover-alt') {
      setCoverPanelExpanded(true);
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
      setAuthorMode('advanced');
      setSeoAdvancedExpanded(true);
      window.requestAnimationFrame(() => {
        focusAndReveal(document.querySelector<HTMLInputElement>('[data-testid="news-focus-keyword-input"]'));
      });
      return;
    }
    if (actionId === 'content') {
      jumpToEditor();
      return;
    }
    if (actionId === 'intro-keyword') {
      ensureKeywordInIntro();
      return;
    }
    if (actionId === 'cover') {
      jumpToCover();
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
    <div data-news-editor className={cn('news-editor-page space-y-5', isSimpleMode && 'news-editor-page-simple')}>
      <header className="news-editor-commandbar">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Trình soạn tin</span>
            <span aria-hidden="true">/</span>
            <span className="text-leaf">{editingId ? 'Đang chỉnh sửa' : 'Bài viết mới'}</span>
          </div>
          <h1 data-testid="page-title" className="mt-1 text-2xl font-bold tracking-tight text-ink">Tin tức</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Nhập tiêu đề, dán nội dung rồi đăng. Các thiết lập nâng cao chỉ mở khi bạn cần.
          </p>
          <p data-testid="news-quick-guide" className="mt-2 text-xs font-semibold leading-5 text-leaf/90">
            Luồng nhanh: tiêu đề + nội dung → xem trước → đăng. Ảnh bìa và SEO có thể bổ sung sau.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/news')}>
            <ArrowLeft size={18} aria-hidden="true" />
            Danh sách bài viết
          </Button>
          <label className="news-editor-site-picker">
            <span>Đăng lên</span>
            <Select data-testid="news-site-filter" className="h-10 min-w-44" value={siteFilter} disabled={Boolean(editingId)} onChange={(event) => changeSite(event.target.value as NewsSiteKey)}>
              <option value="AGRIPASSPORT">AGRIPASSPORT</option>
              <option value="PASSPORT">HỘ CHIẾU NÔNG NGHIỆP</option>
              <option value="HTXONLINE">HTXONLINE</option>
            </Select>
          </label>
          <div className="news-editor-mode-switch" aria-label="Mức độ hiển thị của trình soạn tin">
            <button
              type="button"
              aria-pressed={!isAdvancedMode}
              onClick={() => {
                setAuthorMode('simple');
                setEditorMode('visual');
              }}
              className={cn(!isAdvancedMode && 'is-active')}
            >
              Cơ bản
            </button>
            <button
              type="button"
              aria-label="Nâng cao"
              aria-pressed={isAdvancedMode}
              onClick={() => setAuthorMode('advanced')}
              className={cn(isAdvancedMode && 'is-active is-advanced')}
            >
              Nâng cao
            </button>
          </div>
          {editingId && (
            <Button type="button" onClick={reset}>
              <Plus size={18} aria-hidden="true" />
              Tạo bài mới
            </Button>
          )}
        </div>
      </header>

      {routeArticleId && routeArticle.isLoading && (
        <Panel className="border-sky-200 bg-sky-50 text-sm text-sky-950" aria-live="polite">
          Đang tải bài viết để chỉnh sửa…
        </Panel>
      )}
      {routeArticleId && routeArticle.isError && (
        <Panel className="border-rose-200 bg-rose-50 text-sm text-rose-950" role="alert">
          <p className="font-bold">Không tải được bài viết</p>
          <p className="mt-1">{errorMessage(routeArticle.error)}. Bạn có thể quay lại danh sách để chọn bài khác.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="danger" onClick={() => void routeArticle.refetch()}>Thử lại</Button>
            <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/news')}>Về danh sách</Button>
          </div>
        </Panel>
      )}

      <div className="news-editor-progress" aria-live="polite">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">{canPublish ? 'Sẵn sàng đăng' : `Còn thiếu ${publishBlockers.length} mục bắt buộc`}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-600">
            {canPublish ? 'Ảnh bìa và SEO là khuyến nghị; bạn có thể bổ sung sau.' : `Bổ sung: ${publishBlockers.map((item) => item.label.toLowerCase()).join(', ')}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {corePublishItems.map((item) => (
            <span key={`progress-${item.id}`} className={cn('news-editor-progress-chip', item.ok && 'is-ready')}>
              {item.ok ? '✓' : '•'} {item.id === 'cover' ? 'Ảnh bìa · nên có' : item.label}
            </span>
          ))}
          <span className="news-editor-autosave">
            {draftSavedAt ? `Tự lưu ${formatDateTime(draftSavedAt)}` : 'Ctrl/Cmd+S để lưu nháp'}
          </span>
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

      {siteFilter === 'PASSPORT' && !editingId && (
        <Panel data-testid="news-passport-topic-library" className="border-leaf/20 bg-[linear-gradient(135deg,#f7fbf8_0%,#eef8f1_100%)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf/80">Đề cương Hộ chiếu Nông nghiệp</p>
              <h2 className="mt-1 text-base font-bold text-ink">Chọn chủ đề từ file “Tin tức - Agripassport”</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Chọn một đề tài để tự điền tiêu đề, đường dẫn và từ khóa. Sau đó dán nội dung từ Word, thêm ảnh bìa rồi đăng bài.</p>
            </div>
            <Select
              data-testid="news-passport-topic-select"
              className="min-h-11 min-w-0 sm:w-[27rem]"
              value=""
              onChange={(event) => applyPassportPlan(event.target.value)}
            >
              <option value="">Chọn chủ đề cần đăng…</option>
              {Array.from(new Set(PASSPORT_NEWS_PLAN.map((item) => item.category))).map((category) => (
                <optgroup key={category} label={category}>
                  {PASSPORT_NEWS_PLAN.filter((item) => item.category === category).map((item) => (
                    <option key={item.slug} value={item.slug}>{item.title}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>
        </Panel>
      )}

      {isSimpleMode && (
        <Panel data-testid="news-simple-seo-summary" className="news-simple-seo-summary border-slate-200 bg-white px-3.5 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className={cn('flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl', seoScoreClass(seo.score))} aria-live="polite">
                <span className="text-base font-bold leading-none">{seo.score}</span>
                <span className="mt-0.5 text-[10px] font-semibold">SEO</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{seoScoreLabel(seo.score)}</p>
                <p className="mt-0.5 truncate text-xs text-slate-600">
                  {simpleSeoIssues.length > 0 ? `${simpleSeoIssues.length} gợi ý cần xem · không chặn đăng.` : 'Các tín hiệu chính đang ổn.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">Dễ đọc {seo.readability}/100</span>
              <span className="rounded-full bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">{seoGreenCount}/{seoSignals.length} đạt</span>
              <Button type="button" variant="ghost" onClick={jumpToSimpleSeo} className="min-h-9 px-3 text-sm">
                <Target size={16} aria-hidden="true" />
                Xem SEO
              </Button>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100" aria-label={`Mức SEO ${seo.score} trên 100`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={seo.score}>
            <div className={cn('h-full rounded-full transition-[width]', seoScoreBarClass(seo.score))} style={{ width: `${Math.max(seo.score, 4)}%` }} />
          </div>
        </Panel>
      )}

      <div className={cn('news-editor-layout grid items-start gap-5', isAdvancedMode ? 'xl:grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-1')}>
        <form
          className={cn('space-y-4', !isAdvancedMode && hasMeaningfulDraft(form) && 'pb-36 sm:pb-40 xl:pb-0')}
          onSubmit={(event) => {
            event.preventDefault();
            saveArticle.mutate(undefined);
          }}
        >
          <Panel className="space-y-4">
            <div className={cn('news-editor-overview rounded-2xl border border-leaf/20 bg-[linear-gradient(135deg,#f7fbf8_0%,#eef8f1_100%)] p-3.5', isSimpleMode && 'hidden')}>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf/80">Đăng bài cực nhanh</p>
                  <h2 className="mt-1 text-base font-bold text-ink sm:text-lg">
                    {isAdvancedMode ? 'Chỉ cần tiêu đề, nội dung, ảnh bìa và bấm chuẩn bị đăng' : 'Chỉ cần tiêu đề, nội dung và ảnh bìa'}
                  </h2>
                  <p className="mt-1.5 text-sm leading-5 text-slate-600">
                    {isAdvancedMode
                      ? 'Đây là luồng đăng bài đơn giản nhất cho người mới. Hệ thống sẽ tự điền đường dẫn, mô tả, tiêu đề SEO, ảnh chia sẻ, URL chuẩn và tag nếu bạn chưa nhập.'
                      : 'Đăng nhanh trước, còn đường dẫn, meta, social và tag để editor tự điền hoặc bổ sung sau.'}
                  </p>
                </div>
                {isAdvancedMode ? (<div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={preparePostForPublish}>
                    <Sparkles size={18} aria-hidden="true" />
                    Chuẩn bị đăng
                  </Button>
                  <Button type="button" onClick={() => quickPublishArticle.mutate()} disabled={quickPublishArticle.isPending}>
                    <Save size={18} aria-hidden="true" />
                    {quickPublishArticle.isPending ? 'Đang đăng 1 chạm' : 'Đăng 1 chạm'}
                  </Button>
                </div>) : null}
              </div>
              {isAdvancedMode ? (
                <details className="mt-4 rounded-2xl border border-white/80 bg-white/92 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                    <div>
                      <p className="text-sm font-bold text-ink">Hướng dẫn 4 bước đăng nhanh</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">Mở khi cần xem lại luồng đăng bài cho người mới.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">4 bước</span>
                  </summary>
                  <div className="grid gap-2 border-t border-slate-100 px-3 py-3 md:grid-cols-4">
                    {[
                      ['1', 'Nhập tiêu đề', 'Hệ thống tự gợi ý đường dẫn và từ khóa chính.'],
                      ['2', 'Dán nội dung', 'Có thể paste text và ảnh trực tiếp vào editor.'],
                      ['3', 'Thêm cover', 'Dán, thả hoặc upload ảnh bìa nhanh.'],
                      ['4', 'Kiểm tra rồi đăng', 'Checklist bên phải sẽ báo mục nào còn thiếu.']
                    ].map(([step, title, text]) => (
                      <div key={step} className="rounded-xl border border-white/80 bg-white/88 p-3 shadow-sm">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-leaf/75">Bước {step}</p>
                        <p className="mt-1 text-sm font-bold text-ink">{title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
                      </div>
                    ))}
                  </div>
                </details>
                ) : null}
            </div>

            {!isAdvancedMode && (
              <div className="news-editor-section-heading">
                <span className="news-editor-step">1</span>
                <div>
                  <p className="text-sm font-bold text-ink">Thông tin bài viết</p>
                  <p className="text-xs leading-5 text-slate-500">Nhập tiêu đề. Website đang chọn ở đầu trang.</p>
                </div>
              </div>
            )}
            <div className={cn('grid gap-3', isAdvancedMode ? 'md:grid-cols-2' : 'grid-cols-1')}>
              <label className="space-y-1 text-sm font-semibold">
                <span>Tiêu đề</span>
                <Input
                  data-testid="news-title-input"
                  name="title"
                  autoComplete="off"
                  className="text-[15px] font-medium placeholder:text-[13px] placeholder:font-medium placeholder:text-slate-300 sm:text-base sm:font-normal sm:placeholder:text-base"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="Ví dụ: Xoài Mỹ Xương vào vụ mới, sản lượng ổn định"
                  required
                />
                <span className={cn('text-[11px] font-semibold leading-4', lengthHintClass(titleLength, 35, 70))}>
                  {titleLength ? `${titleLength} ký tự. Nên gọn trong khoảng 35-70 ký tự.` : 'Viết rõ ý chính để hệ thống gợi ý đường dẫn và SEO tốt hơn.'}
                </span>
              </label>
              {isAdvancedMode && (
                <label className="space-y-1 text-sm font-semibold">
                  <span>Website xuất bản</span>
                  <Select data-testid="news-site-select" value={form.siteKey} disabled={Boolean(editingId)} onChange={(event) => changeSite(event.target.value as NewsSiteKey)}>
                    <option value="AGRIPASSPORT">AGRIPASSPORT</option>
                    <option value="PASSPORT">HỘ CHIẾU NÔNG NGHIỆP</option>
                    <option value="HTXONLINE">HTXONLINE</option>
                  </Select>
                  <span className="text-xs font-normal text-slate-500">
                    Website của bài đã lưu bị khóa để không thể chuyển nhầm cổng.
                  </span>
                </label>
              )}
              {isAdvancedMode && <>
              <label className="space-y-1 text-sm font-semibold">
                <span>Đường dẫn</span>
                <Input
                  data-testid="news-slug-input"
                  value={form.slug}
                  onChange={(event) => update('slug', slugifyLocal(event.target.value))}
                  placeholder="xoai-my-xuong-vao-vu-moi"
                />
                <span className={cn('text-xs font-semibold', lengthHintClass(slugLength, 12, 80))}>
                  {slugLength ? 'Đường dẫn nên ngắn, không dấu và dễ đọc trên link chia sẻ.' : 'Có thể để trống, hệ thống sẽ tự tạo đường dẫn từ tiêu đề.'}
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
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={form.publicVerified}
                  onChange={(event) => update('publicVerified', event.target.checked)}
                />
                Đã xác minh để hiển thị public
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
              </>}
            </div>
            {isAdvancedMode && (
              <details className="rounded-2xl border border-slate-200 bg-slate-50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">SEO nhanh và permalink</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{permalink}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">Mở khi cần</span>
                </summary>
                <div className="grid gap-3 border-t border-slate-200 p-3 lg:grid-cols-[1.2fr_0.8fr]">
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
                {isAdvancedMode && autofillPlan.length > 0 && (
                  <details className="mt-3 rounded-2xl border border-dashed border-emerald-200 bg-white/90">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Đăng 1 chạm sẽ tự bổ sung</p>
                        <p className="mt-1 text-sm text-slate-600">{autofillPlan.length} mục sẽ được thêm nếu bạn để trống.</p>
                      </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{autofillPlan.length} mục</span>
                    </summary>
                    <div className="flex flex-wrap gap-2 border-t border-emerald-100 px-3 py-3">
                      {autofillPlan.map((item) => (
                        <span key={item.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </details>
                )}
                {isAdvancedMode && preparedDiffs.length > 0 && (
                  <details className="mt-3 rounded-2xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Xem trước sau khi chuẩn bị đăng</p>
                        <p className="mt-1 text-sm text-slate-600">{preparedDiffs.length} mục sẽ được tự bổ sung nếu bạn bấm chuẩn bị đăng.</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{preparedDiffs.length} mục</span>
                    </summary>
                    <div className="space-y-2 border-t border-slate-100 px-3 py-3">
                      {preparedDiffs.map((item) => (
                        <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                          <p className="text-sm font-semibold text-ink">{item.label}</p>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Hiện tại</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">{item.before}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Sau khi tự bổ sung</p>
                              <p className="mt-1 text-sm leading-6 text-emerald-800">{item.after}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
                {isAdvancedMode && (
                  <details className="mt-3 rounded-2xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bảng đèn SEO dạng WordPress</p>
                        <p className="mt-1 text-sm font-bold text-ink">Xanh là ổn, vàng là việc nên ưu tiên; không chặn đăng.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          {seoSignals.filter((item) => item.ok).length}/{seoSignals.length} tín hiệu xanh
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                          {seoSignals.filter((item) => !item.ok && item.priority === 'must').length} mục gấp
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
                                  {signal.ok ? 'Xanh' : signal.priority === 'must' ? 'Cần làm ngay' : 'Nên bổ sung'}
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
                <p className="text-slate-500">Sẵn sàng đăng</p>
                <p className="mt-1 text-lg font-bold text-ink">{publishReadiness.completed}/{publishReadiness.total}</p>
              </div>
            </div>
          </div>
              </details>
            )}
        </Panel>

          <Panel className="space-y-4">
            {uploadError && (
              <div data-testid="news-upload-error" role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">Không tải được ảnh</p>
                  <p className="mt-1 leading-5">{uploadError}. Bài viết vẫn được giữ nguyên, bạn có thể thử lại mà không mất nội dung.</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {uploadRetry && (
                    <Button type="button" variant="ghost" onClick={() => void uploadFile(uploadRetry.file, uploadRetry.target)} className="min-h-9 px-3 text-sm">
                      <RefreshCcw size={16} aria-hidden="true" />
                      Thử lại
                    </Button>
                  )}
                  <Button type="button" variant="ghost" onClick={() => { setUploadError(''); setUploadRetry(null); }} className="min-h-9 px-3 text-sm">
                    Đóng
                  </Button>
                </div>
              </div>
            )}
            <div className="news-editor-section-heading">
              <span className="news-editor-step">2</span>
              <div>
                <p className="text-sm font-bold text-ink">Nội dung bài viết</p>
                <p className="text-xs leading-5 text-slate-500">Gõ như Word, paste nội dung hoặc kéo ảnh vào khung soạn thảo.</p>
              </div>
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{readingMinutes} phút đọc</span>
            </div>
            <details className={cn('group rounded-2xl border border-dashed border-leaf/30 bg-mint/40', !isAdvancedMode && 'hidden')}>
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
                      Chọn một mẫu bên dưới, sửa tiêu đề, mô tả, nội dung và thêm ảnh là có thể đăng.
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
                    <p className="mt-1 text-sm leading-6 text-slate-600">Hệ thống tự gợi ý đường dẫn, tiêu đề SEO và mô tả nếu bạn chưa nhập.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bước 2</p>
                    <p className="mt-1 text-sm font-bold text-ink">Soạn trực quan như WordPress</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Chế độ trực quan là mặc định. Có thể dán ảnh trực tiếp, tạo heading, danh sách và chèn link ngay trên editor.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Bước 3</p>
                    <p className="mt-1 text-sm font-bold text-ink">Xem điểm SEO rồi đăng</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Checklist bên phải sẽ chấm title, keyword, heading, ảnh, liên kết và độ dễ đọc.</p>
                  </div>
                </div>
              </div>
            </details>

            {!isAdvancedMode && editorToolsOpen && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    data-testid="news-body-upload-direct"
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint"
                  >
                    <Upload size={18} aria-hidden="true" />
                    {bodyUploadActive ? 'Đang tải ảnh...' : 'Tải ảnh thân bài'}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={bodyUploadActive}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = '';
                        if (file) void handleBodyFile(file);
                      }}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSimpleEditorToolsExpanded((value) => !value)}
                    aria-expanded={simpleEditorToolsExpanded}
                    title="Mở xem trước, SEO nhanh và công cụ định dạng"
                  >
                    {simpleEditorToolsExpanded ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
                    Công cụ
                  </Button>
                </div>
                {simpleEditorToolsExpanded && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="mr-1 text-xs font-semibold text-slate-500">Định dạng và công cụ thêm</span>
                  <Button type="button" variant="ghost" onClick={applyQuickSeoFixes} className="min-h-10 px-3">
                    <Target size={18} aria-hidden="true" />
                    Vá SEO nhanh
                  </Button>
                  {editorSnippets.map(([Icon, snippet, label]) => (
                    <button
                      key={`simple-${snippet}`}
                      type="button"
                      className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-mint"
                      onClick={() => insertHtml(snippet)}
                      aria-label={label}
                      title={label}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </button>
                  ))}
                  {needsImportedOptimization && (
                    <Button type="button" variant="ghost" onClick={optimizeImportedArticle}>
                      <Sparkles size={18} aria-hidden="true" />
                      Tối ưu bài vừa dán
                    </Button>
                  )}
                </div>
                )}
              </div>
            )}

            {isAdvancedMode && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {editorSnippets.map(([Icon, snippet, label]) => (
                    <button
                      key={snippet}
                      type="button"
                      className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-mint"
                      onClick={() => insertHtml(snippet)}
                      aria-label={label}
                      title={label}
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
                  <Button type="button" variant="ghost" onClick={() => setPreview((value) => !value)}>
                    <Eye size={18} aria-hidden="true" />
                    {preview ? 'Ẩn xem trước' : 'Xem trước'}
                  </Button>
                </div>
                <details className="rounded-xl border border-slate-200 bg-slate-50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-ink">Công cụ hỗ trợ</p>
                      <p className="mt-0.5 text-xs text-slate-500">Tự điền SEO, dọn nội dung paste và đồng bộ chia sẻ.</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">Mở khi cần</span>
                  </summary>
                  <div className="flex flex-wrap gap-2 border-t border-slate-200 px-3 py-3">
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
                      Tối ưu bài vừa dán
                    </Button>
                    <Button type="button" variant="ghost" onClick={syncSocialFromSeo}>
                      <Target size={18} aria-hidden="true" />
                      Đồng bộ social
                    </Button>
                    <Button type="button" variant="ghost" onClick={cleanPastedContent}>
                      <RefreshCcw size={18} aria-hidden="true" />
                      Làm sạch nội dung dán
                    </Button>
                  </div>
                </details>
              </div>
            )}

            {editorMode === 'visual' ? (
              <div className="space-y-2">
                {!isAdvancedMode && (needsImportedOptimization || bodyUploadActive) && <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1 text-leaf">Chế độ dễ dùng</span>
                  <span>Dán ảnh từ clipboard: `Ctrl+V`</span>
                  <span>Dán nội dung từ Word/Docs: hệ thống tự làm sạch</span>
                  <span>Bấm toolbar để tạo H2, H3, danh sách, link</span>
                  <span>Chỉ dùng HTML khi cần tinh chỉnh sâu</span>
                </div>}
                {needsImportedOptimization && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">Editor phát hiện bài vừa dán còn nhiều định dạng từ Word/Docs</p>
                        <p className="mt-1 leading-6">Nên bấm &quot;Tối ưu bài vừa dán&quot; ngay lúc này để dọn HTML rác, giảm thẻ thừa và đưa bài về bố cục dễ đọc hơn trên mobile.</p>
                      </div>
                      <Button type="button" variant="ghost" onClick={optimizeImportedArticle}>
                        <Sparkles size={18} aria-hidden="true" />
                        Tối ưu ngay
                      </Button>
                    </div>
                  </div>
                )}
                {bodyUploadActive && (
                  <div className="rounded-xl border border-sky-200 bg-sky/50 px-3 py-2.5 text-sm text-sky-950">
                    <p className="font-bold text-ink">Đang upload ảnh vào nội dung bài viết</p>
                    <p className="mt-1 leading-5">Bạn có thể viết tiếp. Ảnh sẽ tự chèn vào bài ngay sau khi upload xong.</p>
                  </div>
                )}
                {editorAssist && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-950">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">{editorAssist.title}</p>
                        <p className="mt-1 leading-5">{editorAssist.detail}</p>
                      </div>
                      <Button type="button" variant="ghost" onClick={() => setEditorAssist(null)} className="min-h-8 px-2.5 text-sm">
                        Ẩn gợi ý này
                      </Button>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(editorAssist.kind === 'pasted-content' || editorAssist.kind === 'optimized-content') && (
                        <Button type="button" variant="ghost" onClick={applyQuickSeoFixes} className="min-h-8 px-2.5 text-sm">
                          <Sparkles size={18} aria-hidden="true" />
                          SEO nhanh
                        </Button>
                      )}
                      {(editorAssist.kind === 'pasted-image' || editorAssist.kind === 'optimized-content') && (
                        <Button type="button" variant="ghost" onClick={preparePostForPublish} className="min-h-8 px-2.5 text-sm">
                          <Sparkles size={18} aria-hidden="true" />
                          Chuẩn bị đăng
                        </Button>
                      )}
                      {editorAssist.kind === 'pasted-image' && suggestedCover && !form.coverImageUrl.trim() && (
                        <Button type="button" variant="ghost" onClick={applySuggestedCover} className="min-h-8 px-2.5 text-sm">
                          <Image size={18} aria-hidden="true" />
                          Dùng ảnh này làm cover
                        </Button>
                      )}
                      {editorAssist.kind === 'prepared-publish' && (
                        <Button type="button" onClick={() => quickPublishArticle.mutate()} disabled={quickPublishArticle.isPending || !canQuickPublish} className="min-h-8 px-2.5 text-sm">
                          <Sparkles size={18} aria-hidden="true" />
                          {quickPublishArticle.isPending ? 'Đang đăng 1 chạm' : 'Đăng 1 chạm'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <div className="relative">
                  {!isAdvancedMode && isBodyEmpty && (
                    <div className="pointer-events-none absolute inset-x-4 top-3 z-10 rounded-[1.1rem] border border-dashed border-leaf/25 bg-mint/20 px-3 py-1.5 text-sm text-slate-600">
                      <p className="font-semibold text-ink">Viết hoặc paste vào đây như soạn Word</p>
                      <p className="mt-0.5 text-[11px] leading-4">Ctrl+V ảnh hoặc văn bản. Ảnh vừa paste có thể dùng làm cover.</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] font-semibold text-leaf">
                        <span className="rounded-full bg-white px-2 py-1 shadow-sm">Nhập nội dung</span>
                        <span className="rounded-full bg-white px-2 py-1 shadow-sm">Ctrl+V ảnh</span>
                        <span className="rounded-full bg-white px-2 py-1 shadow-sm">Ảnh thành cover</span>
                      </div>
                    </div>
                  )}
              <div
                    ref={visualEditorRef}
                    data-testid="news-content-editor"
                    contentEditable
                    role="textbox"
                    aria-label="Nội dung bài viết"
                    aria-multiline="true"
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
                      'rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 outline-none focus:border-leaf focus:ring-4 focus:ring-mint [&_blockquote]:border-l-4 [&_blockquote]:border-leaf/40 [&_blockquote]:pl-4 [&_blockquote]:block [&_figure]:my-4 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:block [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:block [&_h3]:text-xl [&_h3]:font-bold [&_img]:rounded-xl [&_img]:shadow-sm [&_li]:ml-5 [&_p]:my-3 [&_ul]:list-disc [&_ol]:list-decimal',
                      isAdvancedMode ? 'min-h-[320px]' : isBodyEmpty ? 'min-h-[136px] pt-[4.9rem]' : 'min-h-[136px]',
                      draggingEditor && 'border-leaf bg-mint/40 ring-4 ring-mint'
                    )}
                  />
                </div>
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
                  name="bodyHtml"
                  autoComplete="off"
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
                  className={cn('font-mono text-sm', isAdvancedMode ? 'min-h-[320px]' : 'min-h-[200px]')}
                  required
                />
                {draggingEditor && <span className="text-xs font-semibold text-leaf">Thả ảnh vào đây để tự upload và chèn HTML.</span>}
              </label>
            )}

            {editorTipsOpen && <details className="rounded-md border border-slate-200 bg-slate-50" open={editorTipsOpen}>
              <summary className="cursor-pointer list-none px-3 py-3 text-sm font-semibold text-ink">Mẹo đăng bài nhanh</summary>
              <div className="space-y-2 border-t border-slate-200 px-3 py-3 text-sm leading-6 text-slate-600">
                <p>Dùng `Tiêu đề H2/H3` để chia mục, `Chèn ảnh` cho ảnh nằm giữa bài, và `Xem trước` để xem thử trước khi đăng.</p>
                <p>Nếu chỉ muốn đăng bài đơn giản: giữ `Soạn trực quan`, bấm vào nội dung rồi gõ như soạn Word bình thường.</p>
                <p>Nếu copy ảnh từ Zalo, Facebook, Word hoặc Excel: click vào editor rồi bấm `Ctrl+V`, ảnh sẽ tự upload vào bài.</p>
                <p>Nếu copy cả đoạn từ Word hoặc Google Docs: cứ dán thẳng vào editor, rồi bấm `Làm sạch nội dung dán` nếu muốn hệ thống rút gọn thẻ rác thêm một lượt.</p>
                <p>Nếu chưa rành SEO: bấm `Sửa nhanh SEO`, hệ thống sẽ tự vá đường dẫn, mô tả ngắn, thẻ meta, social và alt text cơ bản.</p>
              </div>
            </details>}

            {preview && (
              <div className="prose max-w-none rounded-md border border-slate-200 bg-slate-50 p-4" dangerouslySetInnerHTML={{ __html: form.bodyHtml }} />
            )}
          </Panel>

          <Panel className="p-0">
            <details className="group" open={coverPanelOpen} onToggle={(event) => setCoverPanelExpanded(event.currentTarget.open)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="text-sm font-bold text-ink">Ảnh bìa</p>
                  <p className="text-sm text-slate-600">
                    {form.coverImageUrl
                      ? 'Đã có ảnh bìa. Mở ra để đổi nhanh nếu cần.'
                      : 'Paste, thả hoặc upload ảnh bìa.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold',
                      form.coverImageUrl ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
                    )}
                  >
                    {form.coverImageUrl ? 'Đã có ảnh' : 'Ảnh khuyến nghị'}
                  </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">{coverPanelOpen ? 'Đóng' : 'Mở'}</span>
                </div>
              </summary>
                <div className="space-y-2.5 border-t border-slate-100 px-4 pb-4 pt-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">Cover tốt giúp bài đẹp hơn trên trang chủ, mạng xã hội và Google.</p>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        {form.coverImageAlt.trim() ? 'Đã có alt' : 'Nên thêm alt'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-600">
                      Mẹo nhanh: chỉ cần paste ảnh vào khung bên dưới, hệ thống sẽ tự cập nhật cover và ưu tiên dùng cho Open Graph hoặc Twitter image khi các ô này còn trống.
                    </p>
                  </div>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Mô tả ảnh bìa (alt)</span>
                    <Input data-testid="news-cover-image-alt-input" value={form.coverImageAlt} onChange={(event) => update('coverImageAlt', event.target.value)} className="h-11" />
                  </label>
                  <details className="rounded-xl border border-slate-200 bg-white" open={isAdvancedMode}>
                    <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold text-ink">
                      {isAdvancedMode ? 'URL cover và tùy chọn nâng cao' : 'Nhập URL cover khi cần'}
                    </summary>
                    <div className="space-y-2.5 border-t border-slate-100 px-3 py-3">
                      <label className="space-y-1 text-sm font-semibold">
                        <span>Cover image URL</span>
                        <Input data-testid="news-cover-image-input" value={form.coverImageUrl} onChange={(event) => update('coverImageUrl', event.target.value)} className="h-11" />
                      </label>
                      <p className="text-xs leading-5 text-slate-500">Nếu không có sẵn link ảnh, bạn chỉ cần paste, thả hoặc bấm nút chọn ảnh ở khung phía dưới.</p>
                    </div>
                  </details>
                <div
                  ref={coverDropzoneRef}
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
                  className="rounded-xl border border-dashed border-leaf/30 bg-mint/40 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                >
                  <p className="font-semibold text-ink">Dán, thả hoặc paste ảnh bìa</p>
                  <p className="mt-1 text-[11px] leading-5">Click vào đây rồi bấm `Ctrl+V`, hoặc kéo ảnh vào để tự upload cover.</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Button type="button" variant="ghost" onClick={() => coverFileInputRef.current?.click()} className="min-h-8 px-2.5 text-sm">
                      {coverUploadActive ? 'Đang upload ảnh...' : 'Chọn ảnh từ máy'}
                    </Button>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        if (!event.target.files?.[0]) return;
                        void uploadFile(event.target.files[0], 'cover');
                        event.currentTarget.value = '';
                      }}
                    />
                  </div>
                </div>
                {coverUploadActive && (
                  <div className="rounded-xl border border-sky-200 bg-sky/50 px-3 py-2.5 text-sm text-sky-950">
                    <p className="font-bold text-ink">Đang upload ảnh bìa</p>
                    <p className="mt-1 leading-5">Ảnh bìa sẽ tự động cập nhật vào cover và preview chia sẻ nếu các trường này đang trống.</p>
                  </div>
                )}
                {suggestedCover && !form.coverImageUrl.trim() && (
                  <div className="rounded-xl border border-sky-200 bg-sky/50 px-3 py-2.5 text-sm text-sky-950">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">Có ảnh body sẵn sàng làm cover</p>
                        <p className="mt-1 leading-5">
                          Hệ thống đang gợi ý dùng {suggestedCover.sourceLabel} làm ảnh bìa để bài đẹp hơn khi chia sẻ.
                        </p>
                      </div>
                      <Button type="button" variant="ghost" onClick={applySuggestedCover} className="min-h-8 px-2.5 text-sm">
                        Dùng làm cover
                      </Button>
                    </div>
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
              </div>
            </details>
          </Panel>

          {!isAdvancedMode && (
            <Panel className="p-0">
              <details className="group" open={simpleMetaExpanded} onToggle={(event) => setSimpleMetaExpanded(event.currentTarget.open)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-bold text-ink">Đường dẫn, mô tả ngắn và danh mục</p>
                    <p className="text-sm text-slate-600">Chỉ sửa khi cần. Để trống vẫn đăng nhanh được.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{simpleMetaExpanded ? 'Đang mở' : 'Có thể bỏ qua'}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">{simpleMetaExpanded ? 'Đóng' : 'Mở'}</span>
                  </div>
                </summary>
                <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-4">
                  <div className="grid gap-2.5">
                    <label className="space-y-1 text-sm font-semibold">
                      <span>Đường dẫn</span>
                      <Input
                        className="h-11"
                        data-testid="news-slug-input"
                        value={form.slug}
                        onChange={(event) => update('slug', slugifyLocal(event.target.value))}
                        placeholder="xoai-my-xuong-vao-vu-moi"
                      />
                      <span className={cn('text-xs font-semibold', lengthHintClass(slugLength, 12, 80))}>
                        {slugLength ? 'Đường dẫn nên ngắn, không dấu và dễ đọc trên link chia sẻ.' : 'Có thể để trống, hệ thống sẽ tự tạo đường dẫn từ tiêu đề.'}
                      </span>
                    </label>
                    <label className="space-y-1 text-sm font-semibold">
                      <span>Danh mục</span>
                      <Select className="h-11" data-testid="news-category-select" value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}>
                        <option value="">Không chọn</option>
                        {categoryItems.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </Select>
                    </label>
                    <label className="space-y-1 text-sm font-semibold">
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
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Đăng 1 chạm sẽ tự bổ sung</p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {autofillPlan.length > 0
                            ? `${autofillPlan.length} mục sẽ được editor tự điền nếu bạn để trống.`
                            : 'Đường dẫn, mô tả ngắn và meta cơ bản đã khá đầy đủ.'}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        {publishReadiness.completed}/{publishReadiness.total} sẵn sàng
                      </span>
                    </div>
                    <p className="mt-2.5 break-all text-sm font-semibold text-emerald-700">{permalink}</p>
                    {autofillPlan.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {autofillPlan.map((item) => (
                          <span key={`simple-autofill-${item.id}`} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {item.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-sm">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <p className="text-slate-500">Tiêu đề</p>
                        <p className="mt-1 text-lg font-bold text-ink">{(form.title || form.seoTitle).trim().length}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <p className="text-slate-500">Mô tả</p>
                        <p className="mt-1 text-lg font-bold text-ink">{excerptLength}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <p className="text-slate-500">Doc</p>
                        <p className="mt-1 text-lg font-bold text-ink">{readingMinutes}p</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <Button className="min-h-8 px-2.5 text-sm" type="button" variant="ghost" onClick={() => void copyPermalink()}>
                        <LinkIcon size={18} aria-hidden="true" />
                        Copy link
                      </Button>
                      <Button className="min-h-8 px-2.5 text-sm" type="button" variant="ghost" onClick={fillExcerptFromBody}>
                        <FileText size={18} aria-hidden="true" />
                        Tạo mô tả ngắn
                      </Button>
                      <Button className="min-h-8 px-2.5 text-sm" type="button" variant="ghost" onClick={fillSuggestedTags}>
                        <Sparkles size={18} aria-hidden="true" />
                        Gợi ý tags
                      </Button>
                    </div>
                    <p className="mt-2.5 text-[11px] font-semibold text-slate-500">
                      Trạng thái đăng sẽ do các nút bên dưới quyết định, vì vậy simple mode không cần chọn tay ở đây nữa.
                    </p>
                  </div>
                </div>
              </details>
            </Panel>
          )}

          {isAdvancedMode && (
          <Panel className="p-0">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Chèn ảnh trong bài</p>
                  <p className="text-sm text-slate-600">Dùng khi muốn chèn ảnh bằng URL hoặc upload riêng.</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Tùy chọn</span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-3">
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
                    {uploading === 'body' ? 'Đang tải ảnh lên' : 'Tải ảnh nội dung'}
                    <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void uploadFile(event.target.files[0], 'body')} />
                  </label>
                </div>
              </div>
            </details>
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
                    <span>Từ khóa chính</span>
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
                    <span>Tiêu đề SEO</span>
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
                    <span>Mô tả meta</span>
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
                    <span>URL chuẩn</span>
                    <Input
                      data-testid="news-canonical-url-input"
                      value={form.canonicalUrl}
                      onChange={(event) => update('canonicalUrl', event.target.value)}
                      placeholder="https://agripassport.com/tin-tuc/ten-bai-viet"
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
                      <p className="text-sm font-bold text-ink">Thẻ SEO sẽ xuất ra sau khi đăng</p>
                      <p className="text-sm text-slate-600">Dù bạn bỏ trống một số ô, hệ thống vẫn tự lấp phần còn thiếu theo nội dung đã chuẩn bị.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                      {resolvedMetaPreview.robots} • {resolvedMetaPreview.schemaType}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Google / URL chuẩn</p>
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
                  <p className="text-sm text-slate-600">Nếu bỏ trống, hệ thống ưu tiên lấy phần xem trước từ tiêu đề SEO, mô tả và ảnh bìa.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{socialAdvancedOpen ? 'Đã tùy biến' : 'Tự động theo SEO'}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mở</span>
                </div>
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">Phần xem trước khi chia sẻ lên Facebook và Twitter sẽ lấy từ các trường này khi bạn cần tùy biến.</p>
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
                    <span>Mô tả OG</span>
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
                    <span>Mô tả Twitter</span>
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
                  <p className="text-sm font-bold text-ink">Lịch đăng, tags và tùy chọn hiển thị</p>
                  <p className="text-sm text-slate-600">Chỉ mở mục này khi cần lên lịch, thêm tag hoặc đẩy bài ra trang chủ.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mở</span>
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
                <span>Ngày đăng</span>
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
          ) : preview ? (
            <Panel className="border-slate-200 bg-slate-50/90">
              <div ref={simplePreviewSectionRef} className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Xem trước</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Kiểm tra nhanh cách bài sẽ xuất hiện trên Google và mạng xã hội.</p>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => setPreview(false)} className="min-h-9 px-3 text-sm">
                    Ẩn xem trước
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-500">Google</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          {(resolvedMetaPreview.title || '').trim().length || 0} ký tự title
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink">{resolvedMetaPreview.title}</p>
                      <p className="mt-1 text-xs leading-5 text-emerald-700">{resolvedMetaPreview.canonical}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{resolvedMetaPreview.description}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-500">Mạng xã hội</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          {resolvedMetaPreview.ogImage && resolvedMetaPreview.ogImage !== 'Ảnh bìa công khai' ? 'Có ảnh' : 'Chưa có ảnh'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-ink">{resolvedMetaPreview.ogTitle}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{resolvedMetaPreview.ogDescription}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {resolvedMetaPreview.ogImage || 'Hệ thống sẽ ưu tiên lấy ảnh bìa khi bạn để trống.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          ) : null}

          {(saveArticle.isError || quickPublishArticle.isError) && (
            <Panel data-testid="toast-error" className="text-sm font-semibold text-rose-700">
              {errorMessage(saveArticle.error ?? quickPublishArticle.error)}
            </Panel>
          )}

          <div className={cn(
            'news-editor-publish-bar z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between',
            hasMeaningfulDraft(form) ? 'sticky bottom-20 lg:bottom-4' : 'relative'
          )}>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Xuất bản</p>
              <p className="mt-0.5 truncate text-sm font-bold text-ink">
                {canPublish ? 'Bài đã sẵn sàng để đăng công khai' : `Còn thiếu ${publishBlockers.map((item) => item.label.toLowerCase()).join(', ')}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setPreview((value) => !value)}>
                <Eye size={18} aria-hidden="true" />
                {preview ? 'Ẩn xem trước' : 'Xem trước'}
              </Button>
              <Button data-testid="news-save-draft-button" type="button" variant="ghost" onClick={() => saveArticle.mutate('DRAFT')} disabled={saveArticle.isPending || quickPublishArticle.isPending}>
                <Save size={18} aria-hidden="true" />
                {saveArticle.isPending ? 'Đang lưu' : 'Lưu nháp'}
              </Button>
              <Button
                data-testid="news-publish-button"
                type="button"
                onClick={() => quickPublishArticle.mutate()}
                disabled={quickPublishArticle.isPending || !canPublish}
                title={!canPublish ? `Còn thiếu ${publishBlockers.map((item) => item.label.toLowerCase()).join(', ')}` : undefined}
              >
                <Sparkles size={18} aria-hidden="true" />
                {quickPublishArticle.isPending ? 'Đang đăng…' : 'Đăng bài'}
              </Button>
            </div>
          </div>
        </form>

        <aside className={cn('news-editor-sidebar space-y-4', !isAdvancedMode && 'hidden')}>
          <Panel className="space-y-3">
            {isAdvancedMode ? (
              <div className="rounded-2xl border border-sky-200 bg-sky/40 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Việc nên làm tiếp</p>
                <p className="mt-1 text-lg font-bold text-ink">Editor sẽ gợi ý bước kế tiếp để bài nhanh đẹp và dễ đăng hơn.</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {quickWinCount > 0
                    ? `Đang có ${quickWinCount} sửa nhanh nên xử lý trước.`
                    : 'Khung cơ bản đã ổn, bạn có thể bấm tự động hoàn thiện để ra bài nhanh hơn.'}
                </p>
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
            ) : (
              <div className="rounded-2xl border border-sky-200 bg-sky/30 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Việc nên làm tiếp</p>
                    <p className="mt-1 text-sm font-bold text-ink">
                      {quickWinCount > 0 ? `${quickWinCount} việc nên xử lý trước khi đăng.` : 'Có thể bấm tự hoàn thiện để đi nhanh hơn.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                    {quickWinCount > 0 ? `${quickWinCount} việc gấp` : 'Đã có khung'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" onClick={preparePostForPublish}>
                    <Sparkles size={18} aria-hidden="true" />
                    Tự hoàn thiện
                  </Button>
                  <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                    <Target size={18} aria-hidden="true" />
                    Vá SEO
                  </Button>
                </div>
              </div>
            )}
            <details className="group rounded-2xl border border-slate-200 bg-white/95">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Trợ lý thao tác nhanh</p>
                  <p className="text-sm text-slate-600">
                    {quickWinCount > 0
                      ? `${quickWinCount} sửa nhanh và ${nextStepCount} bước tiếp theo.`
                      : `${nextStepCount} bước tiếp theo để hoàn thiện bài viết.`}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {quickWinCount > 0 ? `${quickWinCount} việc gấp` : 'Xem gợi ý'}
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-3">
            {quickWins.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">Sửa nhanh trong 1 phút</p>
                <p className={cn('mt-1 font-bold text-ink', isAdvancedMode ? 'text-lg' : 'text-sm')}>
                  {isAdvancedMode ? 'Chỉ cần xử lý 2-4 việc nhỏ bên dưới là bài sẽ đẹp và chuẩn hơn rất nhiều.' : 'Xử lý 2-4 việc nhỏ để bài đẹp và chuẩn hơn.'}
                </p>
                <div className="mt-3 space-y-2">
                  {quickWins.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/90 bg-white/90 p-3">
                      {isAdvancedMode ? (
                        <>
                          <p className="font-semibold text-ink">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                          <Button type="button" variant="ghost" className="mt-2" onClick={() => runQuickWin(item.id)}>
                            {item.actionLabel}
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink">{item.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{item.actionLabel}</p>
                          </div>
                          <Button type="button" variant="ghost" onClick={() => runQuickWin(item.id)}>
                            Làm ngay
                          </Button>
                        </div>
                      )}
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
                  {isAdvancedMode ? (
                    <>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
                      <Button type="button" variant="ghost" className="mt-2" onClick={() => runNextStepSuggestion(step.id)}>
                        {step.actionLabel}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{step.actionLabel}</p>
                      </div>
                      <Button type="button" variant="ghost" onClick={() => runNextStepSuggestion(step.id)}>
                        Mở
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
              </div>
            </details>
          </Panel>

          <Panel className="space-y-3">
            {isAdvancedMode ? (
              <div className={cn('rounded-2xl border px-4 py-3', publishReadinessClass(publishReadiness.ratio))}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Trạng thái xuất bản</p>
                <p className="mt-1 text-lg font-bold text-ink">{publishReadiness.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{publishReadiness.detail}</p>
              </div>
            ) : (
              <div className={cn('rounded-2xl border px-4 py-3', publishReadinessClass(publishReadiness.ratio))}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Trạng thái xuất bản</p>
                    <p className="mt-1 text-sm font-bold text-ink">{publishReadiness.label}</p>
                  </div>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">
                    {publishReadiness.completed}/{publishReadiness.total}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {publishChecklistIssues > 0
                    ? `Còn ${publishChecklistIssues} gợi ý nên bổ sung để bài đẹp hơn.`
                    : 'Đã đủ các mục khuyến nghị để tiếp tục xuất bản.'}
                </p>
              </div>
            )}
            <details className="group rounded-2xl border border-slate-200 bg-white/95">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Checklist xuất bản</p>
                  <p className="text-sm text-slate-600">
                    {publishChecklistIssues > 0
                      ? `Còn ${publishChecklistIssues} gợi ý nên bổ sung thêm.`
                      : 'Đã đủ các mục khuyến nghị để có thể đăng.'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    publishChecklistIssues > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {publishChecklistIssues > 0 ? `${publishChecklistIssues} mục thiếu` : 'Đã sẵn sàng'}
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

            {isAdvancedMode ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  <span>Mức sẵn sàng SEO</span>
                  <span>{seo.score}/100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={cn('h-full rounded-full transition-[width]', seoScoreBarClass(seo.score))}
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
            ) : (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  <span>Mức sẵn sàng SEO</span>
                  <span>{seo.score}/100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={cn('h-full rounded-full transition-[width]', seoScoreBarClass(seo.score))}
                    style={{ width: `${Math.max(seo.score, 6)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {seoMustFixCount > 0
                    ? `Bài còn ${seoMustFixCount} mục SEO quan trọng nên vá thêm.`
                    : seoShouldFixCount > 0
                      ? `Còn ${seoShouldFixCount} mục nên tối ưu thêm để bài đẹp hơn.`
                      : 'Điểm SEO đang ổn để tiếp tục hoàn thiện và xuất bản.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={applyQuickSeoFixes}>
                    <Sparkles size={18} aria-hidden="true" />
                    Hoàn thiện SEO cơ bản
                  </Button>
                </div>
              </div>
            )}

            <details className="mt-4 rounded-2xl border border-slate-200 bg-white/95">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Xem checklist và preview SEO</p>
                  <p className="text-sm text-slate-600">
                    {seoMustFixCount > 0
                      ? `${seoMustFixCount} mục nên ưu tiên và ${seoShouldFixCount} mục nên tối ưu thêm.`
                      : seoShouldFixCount > 0
                        ? `${seoShouldFixCount} mục nên tối ưu thêm để đẹp hơn.`
                        : 'Điểm số và preview đang ở trạng thái ổn để xuất bản.'}
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
              <p className="truncate text-sm text-emerald-700">{form.canonicalUrl || buildPublicNewsUrl(form.slug || 'slug', form.siteKey)}</p>
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
              <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Xem trước X / Twitter</div>
              <div className="aspect-[16/8] bg-slate-100 bg-cover bg-center" style={{ backgroundImage: form.twitterImageUrl || form.coverImageUrl ? `url('${form.twitterImageUrl || form.coverImageUrl}')` : undefined }} />
              <div className="p-3">
                <p className="font-bold text-ink">{form.twitterTitle || form.title || 'Tiêu đề Twitter'}</p>
                <p className="mt-1 text-sm text-slate-600">{form.twitterDescription || form.excerpt || 'Mô tả Twitter'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Khung bài sau khi chuẩn bị đăng</p>
                  <p className="text-sm text-slate-600">Editor soi trước bố cục, ảnh và điều hướng nội bộ để bạn biết bài sẽ lên trang công khai ra sao.</p>
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
          <Panel className="p-0">
            <details className="group rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Gợi ý internal link</p>
                  <p className="text-sm text-slate-600">Mở khi cần chèn link nội bộ vào bài.</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{internalLinkSuggestions.length} gợi ý</span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-3">
                <div className="flex justify-end">
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
              </div>
            </details>
          </Panel>
          )}

          {isAdvancedMode && (
          <Panel className="p-0">
            <details className="group rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-ink">Danh mục</p>
                  <p className="text-sm text-slate-600">Tạo danh mục mới khi danh sách hiện tại chưa đủ.</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{categoryItems.length} danh mục</span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 px-4 py-3">
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
              </div>
            </details>
          </Panel>
          )}

        </aside>
      </div>
    </div>
  );
}

function formPayload(form: NewsForm) {
  return {
    ...form,
    publicVerified: form.publicVerified,
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
    siteKey: article.siteKey ?? 'AGRIPASSPORT',
    categoryId: article.categoryId ?? '',
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? '',
    bodyHtml: article.bodyHtml,
    coverImageUrl: article.coverImageUrl ?? '',
    coverImageAlt: article.coverImageAlt ?? '',
    status: article.status,
    publicVerified: article.publicVerified ?? false,
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
      label: 'Tiêu đề SEO',
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
      label: 'Từ khóa chính',
      ok: Boolean(keyword),
      detail: keyword ? `Đang theo dõi từ khóa: "${form.focusKeyword.trim()}".` : 'Nên nhập 1 từ khóa chính cho bài viết.',
      actionId: 'focus-keyword',
      actionLabel: 'Nhập từ khóa'
    },
    {
      label: 'Từ khóa trong tiêu đề / đường dẫn / mô tả',
      ok: Boolean(keyword) && `${form.title} ${form.seoTitle}`.toLowerCase().includes(keyword) && form.slug.includes(slugifyLocal(keyword)) && form.seoDescription.toLowerCase().includes(keyword),
      detail: 'Từ khóa chính nên xuất hiện trong tiêu đề, đường dẫn và meta description.',
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
      detail: `Bài hiện có ${words} từ. Bài công khai nên có ít nhất 300 từ để đủ chiều sâu SEO.`,
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

function lengthHintClass(value: number, min: number, max: number) {
  if (!value) return 'text-slate-500';
  if (value >= min && value <= max) return 'text-emerald-700';
  return 'text-amber-700';
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
  if (score >= 80) return 'Tốt, có thể tự tin đăng';
  if (score >= 60) return 'Khá ổn, nên rà thêm vài mục';
  return 'Nên bổ sung thêm';
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
    const introParagraph = `<p>${escapeHtml(keyword)} là nội dung trọng tâm của bài viết này. Dưới đây là những thông tin quan trọng để người đọc và Google hiểu nhanh chủ đề bạn đang đăng.</p>`;
    bodyHtml = `${introParagraph}${bodyHtml}`;
  }

  if (stripped.split(/\s+/).filter(Boolean).length >= 120 && !/<h[23][^>]*>/i.test(bodyHtml)) {
    const headingBlock = '<h2>Thông tin chính</h2><p>Bổ sung ý chính quan trọng tại đây.</p><h2>Nội dung cần biết</h2><p>Mở rộng thêm chi tiết, lợi ích hoặc hướng dẫn cụ thể.</p>';
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

function buildLocalDraftStorageKey(siteKey: NewsSiteKey, editingId: string | null) {
  return `htxonline-news-draft:${editingId || `new:${siteKey}`}`;
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
    { label: 'Tiêu đề', ok: Boolean(form.title.trim()), required: true },
    { label: 'Mô tả ngắn', ok: form.excerpt.trim().length >= 80, required: false },
    { label: 'Ảnh bìa', ok: Boolean(form.coverImageUrl.trim()), required: false },
    { label: 'Từ khóa', ok: Boolean(form.focusKeyword.trim()), required: false },
    { label: 'Nội dung', ok: seo.stats.words > 0, required: true },
    { label: 'Đường dẫn', ok: Boolean(form.slug.trim()), required: false }
  ];
  const completed = items.filter((item) => item.ok).length;
  const total = items.length;
  const ratio = completed / total;
  const coreReady = items.filter((item) => item.required).every((item) => item.ok);
  if (!coreReady) {
    return {
      items,
      completed,
      total,
      ratio,
      label: 'Thiếu phần cốt lõi',
      detail: 'Cần có tiêu đề và nội dung để lưu hoặc đăng bài. Các mục còn lại là khuyến nghị.'
    };
  }
  if (ratio === 1) {
    return {
      items,
      completed,
      total,
      ratio,
       label: 'Có thể đăng ngay',
       detail: 'Bài viết đã đủ nội dung để lên trang công khai. Bạn có thể tiếp tục tối ưu SEO chi tiết nếu muốn.'
    };
  }
  if (ratio >= 0.67) {
    return {
      items,
      completed,
      total,
      ratio,
       label: 'Có thể đăng ngay',
       detail: 'Bài viết đã có tiêu đề và nội dung. Các trường còn thiếu chỉ là khuyến nghị để bài đẹp hơn.'
    };
  }
  return {
    items,
    completed,
    total,
    ratio,
     label: 'Có thể đăng ngay',
     detail: 'Bài viết đã có tiêu đề và nội dung. Bạn có thể bổ sung ảnh, mô tả và SEO sau khi lưu nháp.'
  };
}

function buildNextStepSuggestions(form: NewsForm, seo: SeoScoreResult): NextStepSuggestion[] {
  const suggestions: NextStepSuggestion[] = [];
  if (!form.title.trim()) {
    suggestions.push({
      id: 'title',
      title: 'Thêm tiêu đề rõ ràng',
      detail: 'Tiêu đề là nền cho đường dẫn, từ khóa và toàn bộ phần xem trước SEO/social. Hãy viết ngắn gọn, đúng ý chính của bài.',
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
      detail: 'Bài chưa đủ từ khóa chính, tiêu đề SEO hoặc meta description. Một cú bấm có thể tự vá những phần cơ bản còn thiếu.',
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
      detail: 'Tiêu đề là điểm xuất phát cho đường dẫn, từ khóa, tiêu đề SEO và phần xem trước khi chia sẻ.',
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

  if (!form.slug.trim() && form.title.trim()) items.push({ id: 'slug', label: 'Đường dẫn từ tiêu đề' });
  if (!form.excerpt.trim() && bodyText) items.push({ id: 'excerpt', label: 'Mô tả ngắn từ nội dung' });
  if (!form.focusKeyword.trim() && form.title.trim()) items.push({ id: 'keyword', label: 'Từ khóa chính' });
  if (!form.seoTitle.trim() && form.title.trim()) items.push({ id: 'seoTitle', label: 'Tiêu đề SEO' });
  if (!form.seoDescription.trim() && (form.excerpt.trim() || bodyText)) items.push({ id: 'seoDescription', label: 'Meta description' });
  if (!form.canonicalUrl.trim() && (form.slug.trim() || form.title.trim())) items.push({ id: 'canonical', label: 'URL chuẩn' });
  if ((!form.ogTitle.trim() && !form.twitterTitle.trim()) || (!form.ogDescription.trim() && !form.twitterDescription.trim()) || (!form.ogImageUrl.trim() && !form.twitterImageUrl.trim())) {
    items.push({ id: 'social', label: 'Xem trước mạng xã hội' });
  }
  if (!form.coverImageAlt.trim() && (form.coverImageUrl.trim() || form.title.trim())) items.push({ id: 'coverAlt', label: 'Alt ảnh bìa' });
  if (keyword && !introHasKeyword) items.push({ id: 'intro', label: 'Mở bài có từ khóa' });
  if (seo.stats.words >= 120 && seo.stats.headings === 0) items.push({ id: 'heading', label: 'Khung H2/H3 cơ bản' });
  if (seo.stats.internalLinks === 0) items.push({ id: 'link', label: '1 internal link phù hợp' });
  if (!form.tags.trim() && seo.stats.words >= 120) items.push({ id: 'tags', label: 'Tags gợi ý' });

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

  addDiff('slug', 'Đường dẫn', form.slug, prepared.slug);
  addDiff('excerpt', 'Mô tả ngắn', form.excerpt, prepared.excerpt);
  addDiff('keyword', 'Từ khóa chính', form.focusKeyword, prepared.focusKeyword);
  addDiff('seoTitle', 'Tiêu đề SEO', form.seoTitle, prepared.seoTitle);
  addDiff('seoDescription', 'Meta description', form.seoDescription, prepared.seoDescription);
  addDiff('canonical', 'URL chuẩn', form.canonicalUrl, prepared.canonicalUrl);
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
  const canonical = form.canonicalUrl.trim() || buildPublicNewsUrl(form.slug || 'slug', form.siteKey);
  const title = (form.seoTitle || form.title || 'Tiêu đề SEO').trim();
  const description = (form.seoDescription || form.excerpt || stripHtml(form.bodyHtml).slice(0, 160) || 'Mô tả SEO').trim();
  const ogTitle = (form.ogTitle || title).trim();
  const ogDescription = (form.ogDescription || description).trim();
  const ogImage = (form.ogImageUrl || form.coverImageUrl || 'Ảnh bìa công khai').trim();
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
      actionLabel: keyword ? undefined : 'Chọn từ khóa'
    },
    {
      id: 'keyword-slug',
      label: 'Từ khóa có trong đường dẫn',
      ok: !keyword || slug.includes(slugifyLocal(keyword)),
      priority: 'should',
      detail: keyword
        ? slug.includes(slugifyLocal(keyword))
          ? 'Đường dẫn đã chứa từ khóa chính và đang khá dễ đọc khi chia sẻ.'
          : 'Đường dẫn chưa phản ánh rõ từ khóa chính. Nên để đường dẫn ngắn và bám sát chủ đề bài.'
        : 'Đường dẫn sẽ tốt hơn khi có từ khóa chính.',
      actionId: 'seo-defaults',
      actionLabel: 'Sửa đường dẫn nhanh'
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
      actionLabel: keyword ? 'Chèn mở bài' : 'Thêm từ khóa'
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
      actionLabel: 'Tạo mô tả nhanh'
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
      actionLabel: form.coverImageUrl.trim() ? 'Điền alt ảnh' : undefined
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
      actionLabel: 'Chèn link'
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
      actionLabel: 'Tự điền social'
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
      actionLabel: 'Tổ chức lại bài'
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
        label: 'Tiêu đề',
        ok: Boolean(form.title.trim()),
        hint: form.title.trim() ? 'Đã có tiêu đề, có thể bấm để xem lại nếu cần.' : 'Nhập tiêu đề để hệ thống tạo đường dẫn, từ khóa và phần xem trước SEO.'
      },
      {
        id: 'content',
        label: 'Nội dung',
        ok: Boolean(stripHtml(form.bodyHtml).trim()),
        hint: stripHtml(form.bodyHtml).trim() ? 'Đã có nội dung, có thể bổ sung thêm H2 hoặc ảnh nếu muốn.' : 'Dán nội dung hoặc gõ trực tiếp vào editor như soạn Word.'
      },
    {
      id: 'cover',
      label: 'Ảnh bìa',
      ok: Boolean(form.coverImageUrl.trim()),
      hint: form.coverImageUrl.trim() ? 'Đã có ảnh bìa, social preview sẽ đẹp hơn.' : 'Dán, thả hoặc upload 1 ảnh ngang làm cover để bài dễ tin hơn.'
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
      label: `Xem thêm sản phẩm liên quan "${form.focusKeyword.trim()}"`,
      href: `/san-pham?search=${encodeURIComponent(form.focusKeyword.trim())}`
    };
  }
  return {
    label: 'Khám phá thêm sản phẩm và hợp tác xã trên Agripassport',
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
