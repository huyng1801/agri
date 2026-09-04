import Link from 'next/link';
import { ArrowRight, Calendar, Phone, QrCode, Search } from 'lucide-react';
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
      className="flex flex-col gap-2 rounded-[1.4rem] border border-[#d9e8d5] bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.09)] ring-4 ring-[#eef7eb] sm:flex-row sm:gap-2 sm:rounded-[1.7rem] sm:p-2"
      action={action}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#2f7d4f]" size={18} aria-hidden="true" />
        <input
          name="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-h-11 w-full rounded-[1rem] border border-[#e1ebe0] bg-[#f8fbf6] pl-10 pr-3 text-[0.95rem] text-[#173327] outline-none transition placeholder:text-[#7b8d82] focus:border-[#2f7d4f] focus:bg-white focus:ring-4 focus:ring-[#dff0e0] sm:min-h-12 sm:rounded-[1.1rem] sm:text-base"
        />
      </div>
      <Button className="min-h-11 w-full shrink-0 rounded-[1rem] px-6 sm:min-h-12 sm:w-auto sm:rounded-[1.1rem]">Tìm</Button>
    </form>
  );
}

export function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const hasQr = Boolean(product.passports?.length);

  return (
    <article className="group flex h-full flex-col rounded-[1.85rem] border border-[#d6e6d2] bg-[#fbfdf9] p-3 shadow-[0_14px_32px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(15,23,42,0.1)] sm:p-3.5">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#dce9d7] bg-[#eef7eb] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="absolute inset-x-3 top-3 z-[2] flex items-center justify-between gap-2">
          <span className="inline-flex min-h-7 items-center rounded-full bg-[#1f9b4b] px-2.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
            {product.category?.name ?? 'Nông sản'}
          </span>
          {hasQr ? (
            <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-white/92 px-2.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#28513a] shadow-sm backdrop-blur">
              <QrCode size={12} aria-hidden="true" />
              Có QR
            </span>
          ) : null}
        </div>

        <Link href={`/san-pham/${product.slug}`} className="block">
          <PublicImage
            src={product.thumbnail?.publicUrl}
            alt={product.name}
            fallback={DEFAULT_PRODUCT_IMAGE}
            testId="product-card-image"
            priority={priority}
            wrapperClassName="aspect-[4/3] w-full bg-[linear-gradient(145deg,#f8fcf4_0%,#e7f3e2_100%)]"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      </div>

      <div className="mt-3 flex flex-1 flex-col px-1 pb-0.5">
        <p className="text-[0.7rem] font-semibold text-[#5d7b67]">{product.cooperative?.province || product.zone?.name || 'Nông sản công khai'}</p>
        <Link href={`/san-pham/${product.slug}`} className="mt-1 block min-h-11 line-clamp-2 text-[1.08rem] font-extrabold leading-6 text-[#1b251f] transition hover:text-[#1c8542] sm:text-[1.2rem]">
          {product.name}
        </Link>
        {product.cooperative ? (
          <Link href={`/htx/${product.cooperative.code}`} className="mt-2 inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-[#466352] transition hover:text-[#1c8542]">
            <PublicImage src={product.cooperative.avatarUrl} alt={product.cooperative.name} fallback={defaultCooperativeAvatar} decorative wrapperClassName="h-6 w-6 shrink-0 rounded-full" className="h-full w-full rounded-full object-cover" />
            <span className="truncate">{product.cooperative.name}</span>
          </Link>
        ) : null}
        <div className="mt-3 flex items-end justify-between gap-3 border-t border-[#e8eee4] pt-3">
          <div>
            <p className="text-[1.22rem] font-extrabold leading-none text-[#17211b] sm:text-[1.4rem]">{formatPrice(product.price)}</p>
            <p className="mt-1 text-xs text-slate-500">/{product.unit}</p>
          </div>
          <Link
            href={`/san-pham/${product.slug}`}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#1f7048] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(31,112,72,0.16)] transition hover:-translate-y-0.5 hover:bg-[#185b3a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mint"
          >
            Xem thông tin
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
        'group flex h-full flex-col overflow-hidden rounded-[2rem] border-[#dfe7d8] bg-[linear-gradient(180deg,#fbfcf8_0%,#ffffff_100%)] p-3 transition duration-300 hover:-translate-y-1 hover:shadow-soft'
      )}
    >
      <div className="rounded-[1.7rem] border border-[#dbe7d7] bg-[linear-gradient(135deg,#11314a_0%,#175073_58%,#1f9b4b_100%)] p-4 text-white">
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
          <p className="shrink-0 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[0.78rem] font-semibold text-white/92 backdrop-blur">
            {cooperative.productCount} sản phẩm
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Link href={`/htx/${cooperative.code}`} className="block shrink-0 overflow-hidden rounded-[1.35rem] ring-1 ring-white/18">
            <PublicImage
              src={cooperative.avatarUrl}
              alt={cooperative.name}
              fallback={defaultCooperativeAvatar}
              priority={priority}
              wrapperClassName="h-[5.4rem] w-[5.4rem] bg-white/10"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </Link>
          <p className="text-sm leading-6 text-white/82">
            Hồ sơ công khai đã nối trực tiếp sang sản phẩm để người xem chạm ít hơn khi đi từ HTX tới đầu ra.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col rounded-[1.45rem] border border-[#e6ebdf] bg-white p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[1rem] bg-[#f7faf4] px-3 py-2.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#2b8a3e]">Mã HTX</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#1f2233]">{cooperative.code}</p>
          </div>
          <div className="rounded-[1rem] bg-[#fff9ef] px-3 py-2.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#2b8a3e]">Trạng thái</p>
            <p className="mt-1 text-sm font-semibold text-[#1f2233]">Đang công khai</p>
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
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e8e4d8] bg-white text-leaf transition hover:-translate-y-0.5 hover:border-leaf"
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
    <article className={cn(publicCardClass, 'group flex h-full flex-col border-[#dce8d8] bg-[#fbfdf9] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_46px_rgba(15,23,42,0.1)]')}>
      <Link href={`/tin-tuc/${article.slug}`} className="block overflow-hidden rounded-t-[1.9rem] p-2.5 pb-0 sm:p-3 sm:pb-0">
        <PublicImage
          src={article.coverImageUrl}
          alt={article.title}
          fallback={DEFAULT_NEWS_IMAGE}
          priority={priority}
          wrapperClassName="aspect-[16/10] w-full rounded-[1.35rem] border border-[#dce9d7] bg-[#eef7eb]"
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
