import Link from 'next/link';
import { ArrowRight, Calendar, Phone, QrCode, Search } from 'lucide-react';
import { AddToCartButton } from './add-to-cart-button';
import { PublicBottomNav } from './public-bottom-nav';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_NEWS_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { publicCardClass } from './public-layout';
import { FloatingContactClient } from './public-site-support';
import type { NewsArticle } from '@/lib/news';
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

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className="min-h-screen bg-transparent text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-leaf focus:shadow-md"
      >
        Bỏ qua đến nội dung chính
      </a>
      <PublicHeader />
      {children}
      <FloatingContactClient />
      <PublicBottomNav />
      <PublicFooter />
    </div>
  );
}

export function PublicSearch({
  placeholder = 'Tìm sản phẩm, HTX, vùng trồng',
  action = '/san-pham'
}: {
  placeholder?: string;
  action?: string;
}) {
  return (
    <form
      className="flex flex-col gap-2 rounded-[1.35rem] border border-slate-200/80 bg-white/94 p-1.25 shadow-[var(--shadow-card)] sm:flex-row sm:gap-2 sm:rounded-[1.7rem] sm:p-2"
      action={action}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input
          name="search"
          placeholder={placeholder}
          className="min-h-10.5 w-full rounded-[0.95rem] border-0 bg-slate-50 pl-10 pr-3 text-[0.98rem] outline-none focus:ring-4 focus:ring-mint sm:min-h-12 sm:rounded-xl sm:text-base"
        />
      </div>
      <Button className="min-h-10.5 w-full rounded-[0.95rem] sm:min-h-12 sm:w-auto sm:px-5 sm:rounded-xl">Tìm</Button>
    </form>
  );
}

export function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const hasQr = Boolean(product.passports?.length);

  return (
    <article className={cn(publicCardClass, 'group flex h-full flex-col transition duration-300 hover:-translate-y-1 hover:shadow-soft')}>
      <Link href={`/san-pham/${product.slug}`} className="relative block overflow-hidden">
        <PublicImage
          src={product.thumbnail?.publicUrl}
          alt={product.name}
          fallback={DEFAULT_PRODUCT_IMAGE}
          testId="product-card-image"
          priority={priority}
          wrapperClassName="aspect-[4/3] w-full"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {hasQr && (
          <span className="absolute left-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-leaf shadow-sm">
            <QrCode size={12} aria-hidden="true" />
            QR Passport
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-leaf">{product.category?.name ?? 'Nông sản'}</p>
        <Link href={`/san-pham/${product.slug}`} className="mt-1 line-clamp-2 text-[0.98rem] font-bold leading-[1.3] text-ink hover:text-leaf sm:text-base">
          {product.name}
        </Link>

        <div className="mt-2 border-t border-slate-100 pt-2 sm:mt-2.5 sm:pt-2.5">
          <p className="text-[1.7rem] font-bold leading-none text-leaf sm:text-xl">{formatPrice(product.price)}</p>
          <p className="text-xs text-slate-500">/{product.unit}</p>
        </div>

        {product.cooperative && (
          <Link
            href={`/htx/${product.cooperative.code}`}
            className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 p-2 transition hover:bg-mint/50 sm:mt-2.5 sm:p-2.5"
          >
            <PublicImage
              src={product.cooperative.avatarUrl}
              alt={product.cooperative.name}
              fallback={defaultCooperativeAvatar}
              decorative
              wrapperClassName="h-9 w-9 shrink-0 rounded-lg"
              className="h-full w-full object-cover"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-ink">{product.cooperative.name}</span>
              <span className="block truncate text-[11px] text-slate-500">{product.cooperative.province || 'HTX địa phương'}</span>
            </span>
          </Link>
        )}

        <AddToCartButton product={product} className="mt-auto min-h-10.5 w-full pt-2 sm:pt-2.5" />
      </div>
    </article>
  );
}

export function productImage(product: PublicProduct) {
  return product.thumbnail?.publicUrl || DEFAULT_PRODUCT_IMAGE;
}

export function CooperativeCard({ cooperative, priority = false }: { cooperative: PublicCooperative; priority?: boolean }) {
  return (
    <article className={cn(publicCardClass, 'group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft')}>
      <Link href={`/htx/${cooperative.code}`} className="relative block overflow-hidden">
        <PublicImage
          src={cooperative.avatarUrl}
          alt={cooperative.name}
          fallback={defaultCooperativeAvatar}
          priority={priority}
          wrapperClassName="aspect-[5/3] w-full"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">{cooperative.province || 'Việt Nam'}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug">{cooperative.name}</h3>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
        <p className="text-[0.95rem] font-semibold text-leaf">{cooperative.productCount} sản phẩm public</p>
        <div className="flex shrink-0 gap-2">
          <Link href={`/htx/${cooperative.code}`}>
            <Button variant="ghost" className="min-h-9.5 px-3 py-2 text-[11px]">
              Xem HTX
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </Link>
          {cooperative.phone && (
            <a
              href={`tel:${cooperative.phone}`}
              className="hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-leaf transition hover:-translate-y-0.5 hover:border-leaf sm:grid"
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
    <article className={cn(publicCardClass, 'group flex h-full flex-col transition-shadow hover:shadow-md')}>
      <Link href={`/tin-tuc/${article.slug}`} className="block overflow-hidden">
        <PublicImage
          src={article.coverImageUrl}
          alt={article.title}
          fallback={DEFAULT_NEWS_IMAGE}
          priority={priority}
          wrapperClassName="aspect-[16/10] w-full"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-leaf">
          {article.category?.name && <span>{article.category.name}</span>}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Calendar size={13} aria-hidden="true" />
              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <Link href={`/tin-tuc/${article.slug}`} className="mt-1.5 line-clamp-2 text-[1.02rem] font-bold leading-[1.35] text-ink hover:text-leaf sm:mt-2 sm:text-lg sm:leading-6">
          {article.title}
        </Link>
        <p className="mt-auto line-clamp-3 pt-2 text-sm leading-[1.62] text-slate-600 sm:pt-3 sm:leading-[1.7]">
          {article.excerpt || article.seoDescription || 'Tin tức HTXONLINE'}
        </p>
      </div>
    </article>
  );
}

export function EmptyPublicState({ title, description }: { title: string; description: string }) {
  return (
    <Panel className="text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint text-leaf text-xl font-bold" aria-hidden="true">
        HTX
      </span>
      <h2 className="mt-3 text-xl font-bold text-ink">{title}</h2>
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
