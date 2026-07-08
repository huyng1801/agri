import Link from 'next/link';
import { ArrowRight, Calendar, Phone, Search, ShoppingCart } from 'lucide-react';
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
    <div id="top" className="min-h-screen bg-[#f8faf7] pb-20 text-ink lg:pb-0">
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
    <form className="flex gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm" action={action}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input name="search" placeholder={placeholder} className="min-h-11 w-full rounded-md border-0 bg-slate-50 pl-10 pr-3 text-base outline-none focus:ring-4 focus:ring-mint" />
      </div>
      <Button>Tìm</Button>
    </form>
  );
}

export function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <article className={cn(publicCardClass, 'flex h-full flex-col')}>
      <Link href={`/san-pham/${product.slug}`} className="block overflow-hidden">
        <PublicImage
          src={product.thumbnail?.publicUrl}
          alt={product.name}
          fallback={DEFAULT_PRODUCT_IMAGE}
          testId="product-card-image"
          className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-leaf">{product.category?.name ?? 'Nông sản'}</p>
          <Link href={`/san-pham/${product.slug}`} className="mt-1 block text-lg font-bold text-ink">
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-slate-600">{product.cooperative?.name ?? 'HTX đang cập nhật'}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-leaf">{formatPrice(product.price)}</p>
            <p className="text-xs text-slate-500">/{product.unit}</p>
          </div>
          <Link href={`/san-pham/${product.slug}`}>
            <Button variant="ghost">Xem</Button>
          </Link>
        </div>
        <AddToCartButton product={product} className="mt-auto w-full" />
      </div>
    </article>
  );
}

export function productImage(product: PublicProduct) {
  return product.thumbnail?.publicUrl || DEFAULT_PRODUCT_IMAGE;
}

export function CooperativeCard({ cooperative }: { cooperative: PublicCooperative }) {
  return (
    <article className={cn(publicCardClass, 'flex h-full flex-col overflow-hidden')}>
      <div className="relative aspect-[16/7] overflow-hidden">
        <PublicImage
          src={cooperative.avatarUrl}
          alt={cooperative.name}
          fallback={defaultCooperativeAvatar}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <PublicImage
            src={cooperative.avatarUrl}
            alt={cooperative.name}
            fallback={defaultCooperativeAvatar}
            className="h-14 w-14 shrink-0 rounded-md border-2 border-white object-cover shadow-sm -mt-10"
          />
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="truncate text-lg font-bold text-ink">{cooperative.name}</h3>
            <p className="text-sm text-slate-600">{cooperative.province || 'Đang cập nhật địa phương'}</p>
            <p className="mt-2 text-sm font-semibold text-leaf">{cooperative.productCount} sản phẩm public</p>
          </div>
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <Link href={`/htx/${cooperative.code}`} className="flex-1">
            <Button className="w-full" variant="ghost">
              Xem HTX
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </Link>
          {cooperative.phone && (
            <a href={`tel:${cooperative.phone}`} className="grid h-11 w-11 place-items-center rounded-md border border-slate-200 bg-white text-leaf" aria-label="Gọi HTX">
              <Phone size={18} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className={cn(publicCardClass, 'flex h-full flex-col')}>
      <Link href={`/tin-tuc/${article.slug}`} className="block overflow-hidden">
        <PublicImage
          src={article.coverImageUrl}
          alt={article.title}
          fallback={DEFAULT_NEWS_IMAGE}
          className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-leaf">
          {article.category?.name && <span>{article.category.name}</span>}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Calendar size={13} aria-hidden="true" />
              {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
        <Link href={`/tin-tuc/${article.slug}`} className="block text-lg font-bold leading-6 text-ink">
          {article.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt || article.seoDescription || 'Tin tức HTXONLINE'}</p>
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
