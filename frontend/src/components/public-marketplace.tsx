import Link from 'next/link';
import { ArrowRight, Boxes, Calendar, Phone, QrCode, Search, Store, type LucideIcon } from 'lucide-react';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_NEWS_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { publicCardClass } from './public-layout';
import { publicNewsCategoryLabel, type NewsArticle } from '@/lib/news';
import { Button, Panel, cn } from './ui';

export type PublicProduct = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  unit: string;
  cooperative?: {
    id: string;
    name: string;
    code: string;
    province?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  zone?: {
    id?: string;
    name: string;
    address?: string | null;
    areaM2?: string | number | null;
  } | null;
  passports?: Array<{
    passportCode: string;
    publicSlug?: string | null;
  }>;
  thumbnail?: {
    id: string;
    publicUrl?: string | null;
    objectKey?: string;
  } | null;
  farmingLogs?: Array<{
    id: string;
    logDate: string;
    activityType: string;
    description: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer?: string | null;
    expiresAt?: string | null;
    file?: {
      id: string;
      publicUrl?: string | null;
      objectKey?: string;
      mimeType?: string;
    } | null;
  }>;
};

export type PublicCooperative = {
  id: string;
  name: string;
  code: string;
  province?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  productCount: number;
};

const defaultCooperativeAvatar = DEFAULT_COOPERATIVE_IMAGE;

export function cooperativeAvatar(cooperative: Pick<PublicCooperative, 'avatarUrl'>) {
  return cooperative.avatarUrl || defaultCooperativeAvatar;
}

export function PublicSearch({
  placeholder = 'Tìm sản phẩm, HTX, vùng trồng',
  action = '/san-pham',
  className
}: {
  placeholder?: string;
  action?: string;
  className?: string;
}) {
  return (
    <form
      className={cn(
        'group relative flex items-center rounded-xl sm:rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-sm transition-all duration-200 hover:border-[var(--brand-primary)]/40 focus-within:border-[var(--brand-primary)] focus-within:shadow-md focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/15',
        className
      )}
      action={action}
      method="GET"
    >
      <div className="flex flex-1 items-center min-w-0 pl-2.5 sm:pl-3">
        <Search
          className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400 transition-colors group-focus-within:text-[var(--brand-primary)]"
          size={18}
          aria-hidden="true"
        />
        <input
          type="search"
          name="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 sm:h-11 w-full min-w-0 bg-transparent px-2.5 text-sm text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:outline-none focus:ring-0 sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-[var(--brand-primary)] px-4 sm:px-6 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:opacity-95 active:scale-[0.98] shrink-0"
      >
        <span>Tìm</span>
      </button>
    </form>
  );
}

export function ProductCard({ product, priority = false, compact = false }: { product: PublicProduct; priority?: boolean; compact?: boolean }) {
  const hasQr = Boolean(product.passports?.length);

  return (
    <article className={cn(
      publicCardClass,
      'group relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-[var(--border)] bg-white p-2 sm:p-3 transition-all duration-150 active:scale-[0.99] active:bg-slate-50/50 hover:border-[var(--brand-primary)] hover:shadow-md touch-action-manipulation'
    )}>
      {/* Clickable Card Overlay Link */}
      <Link
        href={`/san-pham/${product.slug}`}
        aria-label={`Xem chi tiết ${product.name}`}
        className="absolute inset-0 z-10 rounded-xl sm:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
      />

      {/* Product Image: 1:1 square on mobile, 4:3 on desktop */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--brand-primary-subtle)]">
        <PublicImage
          src={product.thumbnail?.publicUrl}
          alt={product.name}
          fallback={DEFAULT_PRODUCT_IMAGE}
          testId="product-card-image"
          priority={priority}
          wrapperClassName="h-full w-full bg-[linear-gradient(145deg,var(--surface-muted)_0%,var(--brand-primary-subtle)_100%)]"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {hasQr && (
          <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 rounded-md border border-[#0d7a28]/20 bg-white/95 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#0d7a28] shadow-xs backdrop-blur">
            <QrCode size={11} aria-hidden="true" />
            <span>Có QR</span>
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-1 flex-col pt-2 sm:pt-2.5">
        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500">
          <span className="truncate uppercase tracking-wider text-[#0d7a28] font-bold">
            {product.category?.name ?? 'Nông sản'}
          </span>
          <span className="truncate text-slate-400">
            {product.cooperative?.province || product.zone?.name || ''}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-[#131935] group-hover:text-[#0d7a28] transition leading-snug">
          {product.name}
        </h3>

        {product.cooperative && (
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate flex items-center gap-1">
            <Store size={12} className="shrink-0 text-slate-400" />
            <span className="truncate">{product.cooperative.name}</span>
          </p>
        )}

        {/* Price Row (Without redundant button on mobile) */}
        <div className="mt-auto pt-2 sm:pt-2.5 flex items-end justify-between gap-1.5 border-t border-slate-100">
          <div>
            <p className="text-xs sm:text-base font-extrabold text-[#131935] leading-none">
              {formatPrice(product.price)}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              /{product.unit}
            </p>
          </div>

          {/* Desktop-only action button */}
          <span className="hidden sm:inline-flex h-8 items-center gap-1 rounded-lg bg-[#0d7a28] px-3 text-xs font-bold text-white shadow-xs transition group-hover:bg-[#0a6120]">
            <span>Chi tiết</span>
            <ArrowRight size={13} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function productImage(product: PublicProduct) {
  return product.thumbnail?.publicUrl || DEFAULT_PRODUCT_IMAGE;
}

export function CooperativeCard({ cooperative, priority = false }: { cooperative: PublicCooperative; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col rounded-[var(--public-radius-card)] border border-[var(--border)] bg-white p-4 shadow-[var(--public-shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[var(--public-shadow-hover)]">
      <div className="flex items-start gap-3.5">
        <Link href={`/htx/${cooperative.code}`} className="relative shrink-0 overflow-hidden rounded-[var(--public-radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]">
          <PublicImage
            src={cooperative.avatarUrl}
            alt={cooperative.name}
            fallback={defaultCooperativeAvatar}
            priority={priority}
            wrapperClassName="h-14 w-14 sm:h-16 sm:w-16"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <span className="font-semibold uppercase tracking-wider text-[var(--brand-primary)]">HTX công khai</span>
            <span>•</span>
            <span className="truncate">{cooperative.province || 'Việt Nam'}</span>
          </div>
          <Link
            href={`/htx/${cooperative.code}`}
            className="mt-1 inline-flex min-h-[36px] items-center line-clamp-2 text-base font-bold leading-snug text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]"
          >
            {cooperative.name}
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3 text-xs">
        <div className="rounded-[var(--public-radius-control)] bg-[var(--surface-muted)] p-2">
          <span className="text-[var(--text-tertiary)] block text-[0.7rem]">Địa bàn hoạt động</span>
          <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{cooperative.province || 'Việt Nam'}</span>
        </div>
        <div className="rounded-[var(--public-radius-control)] bg-[var(--surface-muted)] p-2">
          <span className="text-[var(--text-tertiary)] block text-[0.7rem]">Nông sản công khai</span>
          <span className="font-bold text-[#0d7a28] block mt-0.5">{cooperative.productCount} sản phẩm</span>
        </div>
      </div>

      <div className="mt-4 pt-1 flex items-center justify-between gap-3">
        <Link
          href={`/htx/${cooperative.code}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[var(--public-radius-control)] border border-[var(--border-strong)] bg-white px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-slate-50"
        >
          <span>HỒ SƠ HỢP TÁC XÃ</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
        {cooperative.phone && (
          <a
            href={`tel:${cooperative.phone}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--public-radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-subtle)] hover:border-[var(--brand-primary)]"
            aria-label={`Gọi cho ${cooperative.name}`}
            title="Gọi HTX"
          >
            <Phone size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

export function NewsCard({
  article,
  priority = false,
  fallback = DEFAULT_NEWS_IMAGE,
  imageWrapperClassName = 'aspect-[16/10] w-full bg-[var(--surface-muted)]',
}: {
  article: NewsArticle;
  priority?: boolean;
  fallback?: string;
  imageWrapperClassName?: string;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--public-radius-card)] border border-[var(--border)] bg-white shadow-[var(--public-shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[var(--public-shadow-hover)]">
      <Link href={`/tin-tuc/${article.slug}`} className="block overflow-hidden border-b border-[var(--border)]">
        <PublicImage
          src={article.coverImageUrl}
          alt={article.title}
          fallback={fallback}
          priority={priority}
          wrapperClassName={imageWrapperClassName}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)]">
          {publicNewsCategoryLabel(article.category) && (
            <span className="rounded bg-[var(--brand-primary-subtle)] px-2 py-0.5 font-bold text-[var(--brand-primary)] text-[0.7rem]">
              {publicNewsCategoryLabel(article.category)}
            </span>
          )}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} aria-hidden="true" />
              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <Link href={`/tin-tuc/${article.slug}`} className="mt-2.5 block line-clamp-2 text-base font-bold leading-snug text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]">
          {article.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {article.excerpt || article.seoDescription || 'Tin tức Agripassport'}
        </p>
      </div>
    </article>
  );
}

export function EmptyPublicState({
  title,
  description,
  headingLevel = 'h2',
  icon: Icon = Boxes
}: {
  title: string;
  description: string;
  headingLevel?: 'h1' | 'h2';
  icon?: LucideIcon;
}) {
  const heading =
    headingLevel === 'h1' ? (
      <h1 className="mt-3 text-base sm:text-lg font-bold text-[var(--text-primary)]">{title}</h1>
    ) : (
      <h2 className="mt-3 text-base sm:text-lg font-bold text-[var(--text-primary)]">{title}</h2>
    );
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-8 sm:p-10 text-center shadow-xs">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[#106f8a]" aria-hidden="true">
        <Icon size={22} />
      </span>
      {heading}
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] max-w-md mx-auto">{description}</p>
    </div>
  );
}

export function cooperativesFromProducts(products: PublicProduct[]) {
  const byId = new Map<string, PublicCooperative>();
  for (const product of products) {
    if (!product.cooperative?.id) continue;
    const existing = byId.get(product.cooperative.id);
    byId.set(product.cooperative.id, {
      id: product.cooperative.id,
      name: product.cooperative.name,
      code: product.cooperative.code,
      province: product.cooperative.province,
      phone: product.cooperative.phone,
      avatarUrl: product.cooperative.avatarUrl,
      productCount: (existing?.productCount ?? 0) + 1
    });
  }
  return Array.from(byId.values()).sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name, 'vi'));
}

export function publicListItems<T>(payload: T[] | { data?: T[] } | undefined | null) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0));
}
