import Link from 'next/link';
import { ArrowRight, Boxes, Calendar, Phone, QrCode, Search, type LucideIcon } from 'lucide-react';
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
    <article className={cn(publicCardClass, 'group flex h-full flex-col p-2.5 transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-[var(--public-shadow-hover)] sm:p-3', compact && 'p-2 sm:p-3')}>
      <Link href={`/san-pham/${product.slug}`} className="block overflow-hidden rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--brand-primary-subtle)]">
        <PublicImage
          src={product.thumbnail?.publicUrl}
          alt={product.name}
          fallback={DEFAULT_PRODUCT_IMAGE}
          testId="product-card-image"
          priority={priority}
          wrapperClassName="aspect-[4/3] w-full bg-[linear-gradient(145deg,var(--surface-muted)_0%,var(--brand-primary-subtle)_100%)]"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className={cn('flex flex-1 flex-col', compact ? 'px-0.5 pb-0 pt-2' : 'px-0.5 pb-0.5 pt-3 sm:px-1')}>
        <div className="flex min-h-7 items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--brand-primary-strong)]">{product.category?.name ?? 'Nông sản'}</p>
          {hasQr ? (
            <span className="inline-flex min-h-7 shrink-0 items-center gap-1 rounded-[var(--public-radius-control)] border border-[var(--border-strong)] bg-[var(--brand-primary-subtle)] px-2 text-[0.66rem] font-bold text-[var(--brand-primary)]">
              <QrCode size={12} aria-hidden="true" /> Có QR
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs font-semibold text-[var(--text-tertiary)]">{product.cooperative?.province || product.zone?.name || 'Nông sản công khai'}</p>
        <Link href={`/san-pham/${product.slug}`} className={cn('mt-1 block line-clamp-2 min-h-11 font-extrabold leading-6 text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]', compact ? 'text-[0.98rem]' : 'text-[1.08rem]')}>
          {product.name}
        </Link>
        {product.cooperative ? (
          <Link href={`/htx/${product.cooperative.code}`} className="mt-1 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:text-[var(--brand-primary)] sm:mt-2 sm:min-h-11">
            <PublicImage src={product.cooperative.avatarUrl} alt={product.cooperative.name} fallback={defaultCooperativeAvatar} decorative wrapperClassName="h-6 w-6 shrink-0 rounded-full" className="h-full w-full rounded-full object-cover" />
            <span className="line-clamp-2 min-w-0">{product.cooperative.name}</span>
          </Link>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-[var(--border)] pt-3">
          <div>
            <p className={cn('font-extrabold leading-none text-[var(--text-primary)]', compact ? 'text-[1rem] sm:text-[1.35rem]' : 'text-[1.15rem] sm:text-[1.4rem]')}>{formatPrice(product.price)}</p>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">/{product.unit}</p>
          </div>
          <Link href={`/san-pham/${product.slug}`} aria-label={`Xem thông tin ${product.name}`} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-[var(--public-radius-control)] bg-[var(--brand-primary)] px-3 text-[0.78rem] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-primary-hover)] focus-visible:ring-4 focus-visible:ring-[var(--brand-primary-subtle)] sm:gap-1.5 sm:px-4 sm:text-sm">
            {compact ? <><span className="sm:hidden">Xem</span><span className="hidden sm:inline">Xem thông tin</span></> : 'Xem thông tin'}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
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
          <span className="text-[var(--text-tertiary)] block text-[0.7rem]">Mã định danh</span>
          <span className="font-bold text-[var(--text-primary)] truncate block mt-0.5">{cooperative.code}</span>
        </div>
        <div className="rounded-[var(--public-radius-control)] bg-[var(--surface-muted)] p-2">
          <span className="text-[var(--text-tertiary)] block text-[0.7rem]">Sản phẩm số hóa</span>
          <span className="font-bold text-[var(--brand-primary)] block mt-0.5">{cooperative.productCount} sản phẩm</span>
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
