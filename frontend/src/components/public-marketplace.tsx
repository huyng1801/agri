import Link from 'next/link';
import { ArrowRight, Calendar, Phone, QrCode, Search } from 'lucide-react';
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
      className={cn('flex flex-col gap-2 rounded-[var(--public-radius-surface)] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-1.5 shadow-[var(--public-shadow-card)] ring-4 ring-[var(--brand-primary-subtle)] sm:flex-row sm:gap-2 sm:p-2', className)}
      action={action}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)]" size={18} aria-hidden="true" />
        <input
          name="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-h-11 w-full rounded-[var(--public-radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-3 text-[0.95rem] text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:bg-[var(--surface-elevated)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)] sm:min-h-12 sm:text-base"
        />
      </div>
      <Button className="min-h-11 w-full shrink-0 rounded-[var(--public-radius-control)] px-6 sm:min-h-12 sm:w-auto">Tìm</Button>
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
    <article
      className={cn(
        publicCardClass,
        'group flex h-full flex-col overflow-hidden border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-[var(--public-shadow-hover)] sm:p-3'
      )}
    >
      <div className="brand-gradient-bg rounded-[var(--public-radius-card)] border border-white/15 p-3.5 text-white sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/72">{cooperative.province || 'Việt Nam'}</p>
            <Link
              href={`/htx/${cooperative.code}`}
              className="mt-2 block min-h-11 text-[1.12rem] font-extrabold leading-[1.18] text-white transition hover:text-white/90 sm:text-[1.25rem]"
            >
              {cooperative.name}
            </Link>
          </div>
            <p className="shrink-0 rounded-[var(--public-radius-control)] border border-white/18 bg-white/10 px-3 py-1.5 text-[0.78rem] font-semibold text-white/92 backdrop-blur">
            {cooperative.productCount} sản phẩm
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Link href={`/htx/${cooperative.code}`} className="block shrink-0 overflow-hidden rounded-[var(--public-radius-card)] ring-1 ring-white/18">
            <PublicImage
              src={cooperative.avatarUrl}
              alt={cooperative.name}
              fallback={defaultCooperativeAvatar}
              priority={priority}
              wrapperClassName="h-20 w-20 bg-white/10 sm:h-[5.4rem] sm:w-[5.4rem]"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </Link>
          <p className="text-sm leading-6 text-white/82">
            Xem nhanh thông tin HTX và các sản phẩm đang được giới thiệu trên hồ sơ công khai.
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-1 flex-col rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 sm:mt-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0 rounded-[var(--public-radius-control)] bg-[var(--surface-muted)] px-3 py-2.5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-[var(--brand-primary-strong)] sm:text-[0.7rem] sm:tracking-[0.16em]">Mã HTX</p>
            <p className="mt-1 truncate text-xs font-semibold text-[var(--text-primary)] sm:text-sm">{cooperative.code}</p>
          </div>
          <div className="rounded-[var(--public-radius-control)] bg-[var(--surface)] px-3 py-2.5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-[var(--brand-primary-strong)] sm:text-[0.7rem] sm:tracking-[0.16em]">Trạng thái</p>
            <p className="mt-1 truncate text-xs font-semibold text-[var(--text-primary)] sm:text-sm">Đang công khai</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Link href={`/htx/${cooperative.code}`} className="inline-flex min-h-11 items-center">
            <Button className="min-h-11 rounded-full px-4 text-sm font-semibold">
              Mở hồ sơ HTX
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </Link>
          {cooperative.phone && (
            <a
              href={`tel:${cooperative.phone}`}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)]"
              aria-label="Gọi HTX"
            >
              <Phone size={17} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function NewsCard({ article, priority = false }: { article: NewsArticle; priority?: boolean }) {
  return (
    <article className={cn(publicCardClass, 'group flex h-full flex-col bg-[var(--surface-elevated)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--public-shadow-hover)]')}>
      <Link href={`/tin-tuc/${article.slug}`} className="block overflow-hidden rounded-t-[1.9rem] p-2.5 pb-0 sm:p-3 sm:pb-0">
        <PublicImage
          src={article.coverImageUrl}
          alt={article.title}
          fallback={DEFAULT_NEWS_IMAGE}
          priority={priority}
          wrapperClassName="aspect-[16/10] w-full rounded-[1.35rem] border border-[var(--border)] bg-[var(--brand-primary-subtle)]"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          {publicNewsCategoryLabel(article.category) && <span className="text-[var(--brand-primary-strong)]">{publicNewsCategoryLabel(article.category)}</span>}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Calendar size={13} aria-hidden="true" />
              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <Link href={`/tin-tuc/${article.slug}`} className="mt-1.5 block min-h-11 py-1 line-clamp-2 text-[1.02rem] font-extrabold leading-[1.3] text-ink hover:text-leaf sm:mt-2 sm:text-lg sm:leading-6">
          {article.title}
        </Link>
        <p className="mt-auto line-clamp-3 pt-2 text-sm leading-[1.62] text-slate-600 sm:pt-3 sm:leading-[1.7]">
          {article.excerpt || article.seoDescription || 'Tin tức Agripassport'}
        </p>
      </div>
    </article>
  );
}

export function EmptyPublicState({ title, description, headingLevel = 'h2' }: { title: string; description: string; headingLevel?: 'h1' | 'h2' }) {
  const heading = headingLevel === 'h1' ? <h1 className="mt-3 text-xl font-bold text-ink">{title}</h1> : <h2 className="mt-3 text-xl font-bold text-ink">{title}</h2>;
  return (
    <Panel className="text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-0)] text-ink text-xl font-bold" aria-hidden="true">
        HTX
      </span>
      {heading}
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Panel>
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
