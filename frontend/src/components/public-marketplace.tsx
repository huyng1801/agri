import Link from 'next/link';
import { ArrowRight, Calendar, Leaf, Phone, Search, ShoppingCart, Store } from 'lucide-react';
import { AddToCartButton } from './add-to-cart-button';
import { PublicBottomNav } from './public-bottom-nav';
import { publicCardClass } from './public-layout';
import { FloatingContactClient, FooterContactInfo } from './public-site-support';
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
  productCount: number;
};

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className="min-h-screen bg-[#f8faf7] pb-20 text-ink lg:pb-0">
      <PublicHeader appName="HTXONLINE" />
      {children}
      <FloatingContactClient />
      <PublicBottomNav />
      <footer className="border-t border-slate-200 bg-white px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-lg font-bold text-ink">
              <Leaf className="text-leaf" size={24} aria-hidden="true" />
              HTXONLINE
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">Sàn nông sản số cho hợp tác xã Việt Nam, kết nối sản phẩm minh bạch với người mua.</p>
          </div>
          <div className="grid gap-2 text-sm font-medium text-slate-700">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Khám phá</p>
            <Link href="/gioi-thieu">Giới thiệu</Link>
            <Link href="/san-pham">Sản phẩm</Link>
            <Link href="/htx">HTX</Link>
            <Link href="/tin-tuc">Tin tức</Link>
          </div>
          <div className="grid gap-2 text-sm font-medium text-slate-700">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hỗ trợ</p>
            <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
            <Link href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
            <Link href="/huong-dan-mua-hang">Hướng dẫn mua hàng</Link>
            <Link href="/lien-he">Liên hệ</Link>
          </div>
          <FooterContactInfo />
        </div>
      </footer>
    </div>
  );
}

export function PublicHeader({ appName }: { appName: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-leaf text-white">
            <Leaf size={22} aria-hidden="true" />
          </span>
          {appName}
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 md:flex">
          <Link href="/san-pham" className="hover:text-leaf">Sản phẩm</Link>
          <Link href="/htx" className="hover:text-leaf">HTX</Link>
          <Link href="/gioi-thieu" className="hover:text-leaf">Giới thiệu</Link>
          <Link href="/tin-tuc" className="hover:text-leaf">Tin tức</Link>
          <Link href="/lien-he" className="hover:text-leaf">Liên hệ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/gio-hang" aria-label="Giỏ hàng" className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white">
            <ShoppingCart size={19} aria-hidden="true" />
          </Link>
          <Link href="/login">
            <Button className="hidden sm:inline-flex">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicSearch({ placeholder = 'Tìm sản phẩm, HTX, vùng trồng' }: { placeholder?: string }) {
  return (
    <form className="flex gap-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm" action="/san-pham">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
        <input name="search" placeholder={placeholder} className="min-h-11 w-full rounded-md border-0 bg-slate-50 pl-10 pr-3 text-base outline-none focus:ring-4 focus:ring-mint" />
      </div>
      <Button>Tìm</Button>
    </form>
  );
}

export function ProductCard({ product }: { product: PublicProduct }) {
  const imageUrl = productImage(product);
  return (
    <article className={cn(publicCardClass, 'flex h-full flex-col')}>
      <Link href={`/san-pham/${product.slug}`} className="block">
        <div data-testid="product-card-image" className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }} />
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
  return product.thumbnail?.publicUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80';
}

export function CooperativeCard({ cooperative }: { cooperative: PublicCooperative }) {
  return (
    <article className={cn(publicCardClass, 'flex h-full flex-col p-4')}>
      <div className="flex items-start gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-mint text-leaf">
          <Store size={26} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
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
    </article>
  );
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className={cn(publicCardClass, 'flex h-full flex-col')}>
      <Link href={`/tin-tuc/${article.slug}`} className="block">
        <div
          className="aspect-[16/10] bg-cover bg-center"
          style={{ backgroundImage: `url('${article.coverImageUrl || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80'}')` }}
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
      <Leaf className="mx-auto text-leaf" size={36} aria-hidden="true" />
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
      productCount: (existing?.productCount ?? 0) + 1
    });
  }
  return Array.from(byId.values());
}

export function publicListItems<T>(payload: T[] | { data?: T[] } | undefined | null) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value ?? 0));
}
