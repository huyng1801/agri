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

type EditorMode = 'visual' | 'html';

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
  const bodyText = stripHtml(form.bodyHtml);
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
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();
    const url = await uploadFile(file, 'body');
    if (!url) return;
    const alt = escapeHtml(form.coverImageAlt || form.focusKeyword || form.title || file.name.replace(/\.[^.]+$/, ''));
    insertHtmlIntoVisualEditor(`<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`);
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

  function preparePostForPublish() {
    setForm((current) => buildPreparedNewsForm(current));
  }

  function fillExcerptFromBody() {
    const fallbackExcerpt = trimText(stripHtml(form.bodyHtml), 180);
    if (!fallbackExcerpt) return;
    update('excerpt', fallbackExcerpt);
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="page-title" className="text-2xl font-bold text-ink">Tin tức</h1>
          <p className="text-sm text-slate-600">Đăng bài public cho htxonline.vn/tin-tuc theo kiểu nhanh, rõ và dễ dùng.</p>
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
                    {quickPublishArticle.isPending ? 'Dang publish' : 'Publish 1 cham'}
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
            </div>

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
            <div className="rounded-2xl border border-dashed border-leaf/30 bg-mint/40 p-3">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-leaf shadow-sm">
                  <FileText size={18} aria-hidden="true" />
                </span>
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
              <Button type="button" variant="ghost" onClick={syncSocialFromSeo}>
                <Target size={18} aria-hidden="true" />
                Đồng bộ social
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
                  <span>Bấm toolbar để tạo H2, H3, danh sách, link</span>
                  <span>Chỉ dùng HTML khi cần tinh chỉnh sâu</span>
                </div>
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                  Dang nhanh: chi can tieu de, noi dung, anh va bam &quot;Publish 1 cham&quot;. Cac muc SEO, social va lich dang chi can mo khi that su can va co the bo sung sau.
                </p>
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

            <div className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-ink">Mẹo đăng bài nhanh</p>
              <p>Dùng `Tiêu đề H2/H3` để chia mục, `Chèn ảnh` cho ảnh nằm giữa bài, và `Preview` để xem trước trước khi publish.</p>
              <p>Nếu chỉ muốn đăng bài đơn giản: giữ `Soạn trực quan`, bấm vào nội dung rồi gõ như soạn Word bình thường.</p>
              <p>Nếu copy ảnh từ Zalo, Facebook, Word hoặc Excel: click vào editor rồi bấm `Ctrl+V`, ảnh sẽ tự upload vào bài.</p>
              <p>Nếu chưa rành SEO: bấm `Sửa nhanh SEO`, hệ thống sẽ tự vá slug, mô tả ngắn, thẻ meta, social và alt text cơ bản.</p>
            </div>

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
            {form.coverImageUrl && (
              <img
                data-testid="news-cover-image-preview"
                src={form.coverImageUrl}
                alt={form.coverImageAlt || ''}
                className="aspect-[16/7] w-full rounded-md object-cover"
              />
            )}
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
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void uploadFile(event.target.files[0], 'body')} />
              </label>
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">SEO cơ bản</p>
                <p className="text-sm text-slate-600">Thiết lập title, keyword, canonical và robots giống WordPress nhưng thao tác ngắn hơn.</p>
              </div>
              <Button type="button" variant="ghost" onClick={fillSeoDefaults}>
                <Sparkles size={18} aria-hidden="true" />
                Gợi ý nhanh
              </Button>
            </div>
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">Mạng xã hội</p>
                <p className="text-sm text-slate-600">Preview chia sẻ Facebook/Twitter sẽ lấy từ các trường này.</p>
              </div>
              <Button type="button" variant="ghost" onClick={syncSocialFromSeo}>
                <Target size={18} aria-hidden="true" />
                Lấy từ SEO
              </Button>
            </div>
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

          {(saveArticle.isError || archiveArticle.isError || quickPublishArticle.isError) && (
            <Panel data-testid="toast-error" className="text-sm font-semibold text-rose-700">
              {errorMessage(saveArticle.error ?? quickPublishArticle.error ?? archiveArticle.error)}
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
            <Button type="button" variant="ghost" onClick={() => quickPublishArticle.mutate()} disabled={quickPublishArticle.isPending}>
              <Sparkles size={18} aria-hidden="true" />
              Publish 1 cham
            </Button>
            <Button type="submit" disabled={saveArticle.isPending}>
              {saveArticle.isPending ? 'Đang lưu' : 'Lưu'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <Panel className="space-y-3">
            <div className={cn('rounded-2xl border px-4 py-3', publishReadinessClass(publishReadiness.ratio))}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Trạng thái xuất bản</p>
              <p className="mt-1 text-lg font-bold text-ink">{publishReadiness.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{publishReadiness.detail}</p>
            </div>
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
          </Panel>

          <Panel>
            <div className="grid grid-cols-2 gap-3">
              <div data-testid="news-seo-score" className={cn('rounded-md p-3 text-center', seoScoreClass(seo.score))}>
                <p className="text-sm text-slate-600">SEO score</p>
                <p className="text-2xl font-bold text-leaf">{seo.score}</p>
              </div>
              <div data-testid="news-readability-score" className={cn('rounded-md p-3 text-center', readabilityClass(seo.readability))}>
                <p className="text-sm text-slate-600">Readability</p>
                <p className="text-2xl font-bold text-ink">{seo.readability}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Số từ</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.words}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Keyword match</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.keywordMatches}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Keyword density</p>
                <p className="mt-1 text-lg font-bold text-ink">{seo.stats.keywordDensity}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-500">Heading</p>
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

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-ink">Checklist xuất bản</p>
                <div className="mt-2 space-y-2">
                  {seo.checks.map((check) => (
                    <div key={check.label} className={cn('rounded-xl border px-3 py-2 text-sm', check.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900')}>
                      <p className="font-semibold">{check.label}</p>
                      <p className="mt-1 leading-5">{check.detail}</p>
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
          </Panel>

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
      detail: titleLength ? `Hiện tại ${titleLength} ký tự. Nên trong khoảng 35-65 ký tự.` : 'Chưa có title SEO.'
    },
    {
      label: 'Meta description',
      ok: descriptionLength >= 120 && descriptionLength <= 160,
      detail: descriptionLength ? `Hiện tại ${descriptionLength} ký tự. Nên trong khoảng 120-160 ký tự.` : 'Chưa có meta description.'
    },
    {
      label: 'Focus keyword',
      ok: Boolean(keyword),
      detail: keyword ? `Đang theo dõi từ khóa: "${form.focusKeyword.trim()}".` : 'Nên nhập 1 từ khóa chính cho bài viết.'
    },
    {
      label: 'Keyword trong title / slug / mô tả',
      ok: Boolean(keyword) && `${form.title} ${form.seoTitle}`.toLowerCase().includes(keyword) && form.slug.includes(slugifyLocal(keyword)) && form.seoDescription.toLowerCase().includes(keyword),
      detail: 'Từ khóa chính nên xuất hiện trong title, slug và meta description.'
    },
    {
      label: 'Keyword trong mở bài',
      ok: Boolean(keyword) && introText.includes(keyword),
      detail: 'Từ khóa nên xuất hiện sớm trong đoạn đầu để Google và người đọc hiểu chủ đề nhanh hơn.'
    },
    {
      label: 'Mật độ từ khóa',
      ok: !keyword || (keywordDensity >= 0.5 && keywordDensity <= 2.5),
      detail: keyword ? `Mật độ hiện tại khoảng ${keywordDensity}%. Nên giữ tự nhiên, thường trong khoảng 0.5% - 2.5%.` : 'Chưa có từ khóa chính để theo dõi mật độ.'
    },
    {
      label: 'Độ dài nội dung',
      ok: words >= 300,
      detail: `Bài hiện có ${words} từ. Bài public nên có ít nhất 300 từ để đủ chiều sâu SEO.`
    },
    {
      label: 'Cấu trúc heading',
      ok: headings >= 2,
      detail: `Hiện có ${headings} heading H2/H3. Nên có ít nhất 2 heading để dễ quét nội dung.`
    },
    {
      label: 'Hình ảnh và alt text',
      ok: Boolean(form.coverImageUrl) && Boolean(form.coverImageAlt),
      detail: form.coverImageUrl ? 'Đã có ảnh đại diện. Hãy chắc alt text mô tả đúng nội dung ảnh.' : 'Nên thêm ảnh đại diện và alt text.'
    },
    {
      label: 'Liên kết nội bộ',
      ok: internalLinks >= 1,
      detail: `Hiện có ${internalLinks} liên kết nội bộ. Nên có ít nhất 1 link về sản phẩm, HTX hoặc trang liên quan.`
    },
    {
      label: 'Canonical và social',
      ok: Boolean(form.canonicalUrl) && Boolean(form.ogTitle || form.twitterTitle) && Boolean(form.ogDescription || form.twitterDescription),
      detail: 'Canonical, OG và Twitter giúp bài hiển thị đúng khi index và chia sẻ mạng xã hội.'
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
  return 'bg-stone-100 text-stone-700';
}

function seoScoreClass(score: number) {
  if (score >= 80) return 'bg-emerald-100';
  if (score >= 60) return 'bg-amber-100';
  return 'bg-rose-100';
}

function readabilityClass(score: number) {
  if (score >= 80) return 'bg-sky';
  if (score >= 60) return 'bg-amber-100';
  return 'bg-slate-100';
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
    .map((value) => value.trim())
    .map((value) => normalizeTag(value))
    .filter(Boolean);

  return Array.from(new Set(suggestions)).slice(0, 6);
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
