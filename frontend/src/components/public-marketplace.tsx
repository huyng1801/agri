import Link from 'next/link';
import { ArrowRight, Calendar, Phone, QrCode, Search } from 'lucide-react';
import { AddToCartButton } from './add-to-cart-button';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_NEWS_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { publicCardClass } from './public-layout';
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

export function PublicSearch({
  placeholder = 'Tìm sản phẩm, HTX, vùng trồng',
  action = '/san-pham'
}: {
  placeholder?: string;
  action?: string;
}) {
  return (
    <form
      className="flex flex-col gap-2 rounded-[1.4rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.96)] p-1.5 shadow-[var(--shadow-card)] sm:flex-row sm:gap-2 sm:rounded-[1.7rem] sm:p-2"
      action={action}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input
          name="search"
          placeholder={placeholder}
          className="min-h-11 w-full rounded-[1rem] border-0 bg-[var(--surface-0)] pl-10 pr-3 text-[0.95rem] outline-none focus:ring-4 focus:ring-mint sm:min-h-12 sm:rounded-[1.1rem] sm:text-base"
        />
      </div>
      <Button className="min-h-11 w-full rounded-[1rem] sm:min-h-12 sm:w-auto sm:px-5 sm:rounded-[1.1rem]">Tìm</Button>
    </form>
  );
}

export function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const hasQr = Boolean(product.passports?.length);

  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-[#dce9d7] bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_52px_rgba(15,23,42,0.08)] sm:p-4">
      <div className="rounded-[1.7rem] border border-[#2b8a3e]/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcf6_100%)] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#1f9b4b] px-3 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white">
            {product.category?.name ?? 'Nông sản'}
          </span>
          {hasQr ? (
            <span className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[#dbe9d9] bg-white px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#1f2233]">
              <QrCode size={12} aria-hidden="true" />
              Có QR
            </span>
          ) : null}
        </div>

        <Link href={`/san-pham/${product.slug}`} className="mt-3 block overflow-hidden rounded-[1.45rem] bg-white ring-1 ring-[#edf3e8]">
          <PublicImage
            src={product.thumbnail?.publicUrl}
            alt={product.name}
            fallback={DEFAULT_PRODUCT_IMAGE}
            testId="product-card-image"
            priority={priority}
            wrapperClassName="aspect-[1.02/1] w-full bg-[linear-gradient(180deg,#ffffff_0%,#fbfdf9_100%)]"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="mt-4 text-center">
          <Link href={`/san-pham/${product.slug}`} className="block min-h-11 line-clamp-2 text-[1.25rem] font-extrabold leading-[1.15] text-[#1b251f] transition hover:text-leaf sm:text-[1.35rem]">
            {product.name}
          </Link>
          <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {product.cooperative?.province || product.zone?.name || 'Nông sản công khai'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <div className="rounded-[1.25rem] border border-[#e5ebdf] bg-[#f8fbf7] px-4 py-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[1.42rem] font-extrabold leading-none text-[#17211b] sm:text-[1.6rem]">{formatPrice(product.price)}</p>
              <p className="mt-1 text-sm text-slate-500">/{product.unit}</p>
            </div>
            {product.cooperative ? (
              <Link
                href={`/htx/${product.cooperative.code}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbe6d7] bg-white px-3 py-2 text-xs font-semibold text-[#1f2233] transition hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
              >
                <PublicImage
                  src={product.cooperative.avatarUrl}
                  alt={product.cooperative.name}
                  fallback={defaultCooperativeAvatar}
                  decorative
                  wrapperClassName="h-7 w-7 shrink-0 rounded-full"
                  className="h-full w-full rounded-full object-cover"
                />
                <span className="max-w-[9rem] truncate">{product.cooperative.name}</span>
              </Link>
            ) : null}
          </div>
        </div>

        <AddToCartButton product={product} className="mt-auto min-h-[3.35rem] w-full rounded-full pt-3 text-base font-bold" />
      </div>
    </article>
  );
}

export function productImage(product: PublicProduct) {
  return product.thumbnail?.publicUrl || DEFAULT_PRODUCT_IMAGE;
}

export function CooperativeCard({ cooperative, priority = false }: { cooperative: PublicCooperative; priority?: boolean }) {
  return (
    <article className={cn(publicCardClass, 'group flex h-full flex-col overflow-hidden bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft')}>
      <Link href={`/htx/${cooperative.code}`} className="block overflow-hidden">
        <PublicImage
          src={cooperative.avatarUrl}
          alt={cooperative.name}
          fallback={defaultCooperativeAvatar}
          priority={priority}
          wrapperClassName="aspect-[5/3] w-full"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{cooperative.province || 'Việt Nam'}</p>
        <Link href={`/htx/${cooperative.code}`} className="mt-2 block min-h-11 text-[1.1rem] font-extrabold leading-[1.22] text-[#1f2233] transition hover:text-leaf sm:text-[1.2rem]">
          {cooperative.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="rounded-full border border-[#d8e7d8] bg-[#f6fbf4] px-3 py-1.5 text-[0.82rem] font-semibold leading-tight text-ink sm:text-[0.92rem]">
            {cooperative.productCount} sản phẩm công khai
          </p>
          <div className="flex shrink-0 gap-2">
            <Link href={`/htx/${cooperative.code}`} className="inline-flex min-h-11 items-center">
              <Button variant="ghost" className="min-h-11 rounded-full px-3 py-2 text-[11px]">
                Xem HTX
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </Link>
            {cooperative.phone && (
              <a
                href={`tel:${cooperative.phone}`}
                className="hidden h-10 w-10 place-items-center rounded-full border border-[#e8e4d8] bg-white text-leaf transition hover:-translate-y-0.5 hover:border-leaf sm:grid"
                aria-label="Gọi HTX"
              >
                <Phone size={17} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function NewsCard({ article, priority = false }: { article: NewsArticle; priority?: boolean }) {
  return (
    <article className={cn(publicCardClass, 'group flex h-full flex-col bg-white transition-shadow hover:shadow-md')}>
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
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500">
          {article.category?.name && <span className="text-[#2b8a3e]">{article.category.name}</span>}
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
          {article.excerpt || article.seoDescription || 'Tin tức HTXONLINE'}
        </p>
      </div>
    </article>
  );
}

export function EmptyPublicState({ title, description }: { title: string; description: string }) {
  return (
    <Panel className="text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-0)] text-ink text-xl font-bold" aria-hidden="true">
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
