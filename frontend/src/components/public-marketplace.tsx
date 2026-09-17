import Link from 'next/link';
import { Apple, Boxes, Calendar, Coffee, Fish, Flower2, Leaf, MapPinned, Phone, QrCode, Search, Sprout, Store, Wheat, type LucideIcon } from 'lucide-react';
import { DEFAULT_COOPERATIVE_IMAGE, DEFAULT_NEWS_IMAGE, DEFAULT_PRODUCT_IMAGE, PublicImage } from './public-image';
import { publicNewsCategoryLabel, type NewsArticle } from '@/lib/news';
import { publicDisplayCopy } from '@/lib/public-copy';
import type { PublicSiteKey } from '@/lib/domain';
import { formatDate } from '@/lib/format';
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

/**
 * The public API can return shared editorial covers when a record has no
 * content-specific media. Those covers are useful for news, but repeating
 * them across a product grid makes distinct products look identical.
 */
function isGenericPublicImage(src?: string | null) {
  return !src || /public-media-placeholder\.svg$/i.test(src) || /\/news\/(?:market-data|cooperative-data|field-qr|produce-label)\.webp(?:[?#].*)?$/i.test(src);
}

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
        'group relative flex items-center rounded-xl sm:rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-[var(--brand-primary)]/40 focus-within:border-[var(--brand-primary)] focus-within:shadow-md focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/15',
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
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-full min-w-0 bg-transparent px-2.5 text-sm text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:outline-none focus:ring-0 sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-[var(--brand-primary)] px-4 sm:px-6 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:opacity-95 active:scale-[0.98] shrink-0"
      >
        <span>Tìm</span>
      </button>
    </form>
  );
}

export function ProductCard({ product, priority = false, compact = false, siteKey }: { product: PublicProduct; priority?: boolean; compact?: boolean; siteKey?: PublicSiteKey }) {
  const hasQr = Boolean(product.passports?.length);
  const cooperativeName = product.cooperative ? publicDisplayCopy(product.cooperative.name, siteKey) : '';
  const useSemanticVisual = isGenericPublicImage(product.thumbnail?.publicUrl);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white p-2 sm:p-3 transition-[border-color,background-color] duration-200 active:bg-slate-50/50 hover:border-[var(--brand-primary)] touch-action-manipulation">
      {/* Clickable Card Overlay Link */}
      <Link
        href={`/san-pham/${product.slug}`}
        aria-label={`Xem chi tiết ${product.name}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
      />

      {/* Product Image: 1:1 square on mobile, 4:3 on desktop */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--brand-primary-subtle)]">
        {useSemanticVisual ? (
          <ProductSemanticVisual product={product} />
        ) : (
          <PublicImage
            src={product.thumbnail?.publicUrl}
            alt={product.name}
            fallback={DEFAULT_PRODUCT_IMAGE}
            testId="product-card-image"
            priority={priority}
            wrapperClassName="h-full w-full bg-[linear-gradient(145deg,var(--surface-muted)_0%,var(--brand-primary-subtle)_100%)]"
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
          />
        )}

        {hasQr && (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md border border-[var(--brand-primary)]/20 bg-white/95 px-1.5 py-1 text-[10px] font-bold text-[var(--brand-primary)] shadow-xs backdrop-blur sm:text-xs">
            <QrCode size={11} aria-hidden="true" />
            <span>Có QR</span>
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-1 flex-col pt-2 sm:pt-2.5">
        <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-500 sm:text-xs">
          <span className={cn('truncate font-bold text-[var(--brand-primary)]', siteKey !== 'passport' && 'uppercase')}>
            {product.category?.name ?? 'Nông sản'}
          </span>
          <span className="truncate text-slate-400">
            {product.cooperative?.province || product.zone?.name || ''}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[var(--text-primary)] transition group-hover:text-[var(--brand-primary)] sm:text-base">
          {product.name}
        </h3>

        {product.cooperative && (
          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-xs">
            <span className="truncate">{cooperativeName}</span>
          </p>
        )}

        {/* Price Row (Without redundant button on mobile) */}
        <div className="mt-auto pt-2 sm:pt-2.5 flex items-end justify-between gap-1.5 border-t border-slate-100">
          <div>
            <p className="text-sm font-extrabold leading-none text-[var(--text-primary)] sm:text-base">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
              /{product.unit}
            </p>
          </div>

          {/* Desktop-only action button */}
          <span className="hidden min-h-8 items-center text-xs font-bold text-[#0d7a28] transition group-hover:underline sm:inline-flex">
            <span>Xem hồ sơ</span>
          </span>
        </div>
      </div>
    </article>
  );
}

const semanticVisuals = {
  grain: { icon: Wheat, background: 'bg-[linear-gradient(145deg,#f8f1d9_0%,#d6e9b8_100%)]', ink: 'text-[#4f6f2b]', chip: 'bg-white/70' },
  tea: { icon: Leaf, background: 'bg-[linear-gradient(145deg,#e3f3e4_0%,#a7d5a6_100%)]', ink: 'text-[#206b39]', chip: 'bg-white/70' },
  coffee: { icon: Coffee, background: 'bg-[linear-gradient(145deg,#f4e6d4_0%,#c79368_100%)]', ink: 'text-[#70401f]', chip: 'bg-white/70' },
  fruit: { icon: Apple, background: 'bg-[linear-gradient(145deg,#fff1db_0%,#f6b878_100%)]', ink: 'text-[#a34c18]', chip: 'bg-white/70' },
  seafood: { icon: Fish, background: 'bg-[linear-gradient(145deg,#def3f1_0%,#83c8c3_100%)]', ink: 'text-[#176b72]', chip: 'bg-white/70' },
  honey: { icon: Flower2, background: 'bg-[linear-gradient(145deg,#fff5cf_0%,#f2cf67_100%)]', ink: 'text-[#8b5d0a]', chip: 'bg-white/70' },
  other: { icon: Sprout, background: 'bg-[linear-gradient(145deg,#e8edf6_0%,#b8c9e2_100%)]', ink: 'text-[#385278]', chip: 'bg-white/70' }
} as const;

function ProductSemanticVisual({ product }: { product: PublicProduct }) {
  const visual = semanticVisualFor(product);
  const Icon = visual.icon;
  const category = product.category?.name || 'Nông sản';

  return (
    <div data-testid="product-card-image" role="img" aria-label={product.name} className={`relative h-full w-full overflow-hidden ${visual.background}`}>
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[18px] border-white/25" aria-hidden="true" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/20" aria-hidden="true" />
      <div className={`relative flex h-full flex-col justify-between p-3.5 sm:p-4 ${visual.ink}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${visual.chip}`}>
            <Icon size={13} aria-hidden="true" />
            Hồ sơ nông sản
          </span>
          <QrCode size={18} aria-hidden="true" className="opacity-70" />
        </div>
        <div className="max-w-[85%]">
          <p className="text-[10px] font-bold tracking-[0.12em] opacity-75">{category}</p>
          <p className="mt-1 text-sm font-extrabold leading-5 sm:text-base">Dữ liệu đã công khai</p>
        </div>
      </div>
    </div>
  );
}

function semanticVisualFor(product: PublicProduct) {
  const text = `${product.name} ${product.category?.name || ''}`.toLowerCase();
  if (/cà phê|coffee/.test(text)) return semanticVisuals.coffee;
  if (/trà|dược liệu|atiso/.test(text)) return semanticVisuals.tea;
  if (/lúa|gạo|ngũ cốc/.test(text)) return semanticVisuals.grain;
  if (/thủy sản|cá |tôm|cua|mực/.test(text)) return semanticVisuals.seafood;
  if (/mật ong|mật hoa|ong/.test(text)) return semanticVisuals.honey;
  if (/trái cây|xoài|cam|hồng|sầu riêng|dừa|chuối|bưởi|nhãn|vải/.test(text)) return semanticVisuals.fruit;
  return semanticVisuals.other;
}

export function productImage(product: PublicProduct) {
  return product.thumbnail?.publicUrl || DEFAULT_PRODUCT_IMAGE;
}

export function CooperativeCard({ cooperative, priority = false, siteKey, variant = 'card' }: { cooperative: PublicCooperative; priority?: boolean; siteKey?: PublicSiteKey; variant?: 'card' | 'directory' }) {
  const cooperativeName = publicDisplayCopy(cooperative.name, siteKey);
  const useSemanticVisual = isGenericPublicImage(cooperative.avatarUrl);

  if (variant === 'directory') {
    return (
      <article className="group border-t border-[var(--border)] py-5 md:min-h-[190px]">
        <div className="flex items-start gap-4">
          <Link href={`/htx/${cooperative.code}`} className="relative shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
            {useSemanticVisual ? (
              <CooperativeSemanticVisual cooperative={cooperative} />
            ) : (
              <PublicImage
                src={cooperative.avatarUrl}
                alt={cooperativeName}
                fallback={defaultCooperativeAvatar}
                priority={priority}
                wrapperClassName="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
              />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-tertiary)]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" aria-hidden="true" />
                {publicDisplayCopy('Hợp tác xã công khai', siteKey)}
              </span>
              <span aria-hidden="true">•</span>
              <span>{cooperative.province || 'Việt Nam'}</span>
            </div>
            <Link
              href={`/htx/${cooperative.code}`}
              className="mt-2 block min-h-11 text-base font-bold leading-snug text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]"
            >
              {cooperativeName}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[var(--border)] pt-3 text-xs">
          <div>
            <span className="block text-[0.7rem] text-[var(--text-tertiary)]">Địa bàn hoạt động</span>
            <span className="mt-1 block font-bold text-[var(--text-primary)]">{cooperative.province || 'Việt Nam'}</span>
          </div>
          <div>
            <span className="block text-[0.7rem] text-[var(--text-tertiary)]">Nông sản công khai</span>
            <span className="mt-1 block font-bold text-[#0d7a28]">{cooperative.productCount} sản phẩm</span>
          </div>
          <div className="col-span-2 flex items-center justify-end gap-4 border-t border-[var(--border)] pt-2">
            <Link
              href={`/htx/${cooperative.code}`}
              className="inline-flex min-h-11 items-center text-xs font-bold text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]"
            >
              {publicDisplayCopy('Hồ sơ hợp tác xã', siteKey)}
            </Link>
            {cooperative.phone && (
              <a
                href={`tel:${cooperative.phone}`}
                className="grid min-h-11 min-w-11 place-items-center border-l border-[var(--border)] pl-4 text-[var(--brand-primary)] transition hover:text-[var(--brand-primary-hover)]"
                aria-label={`Gọi cho ${cooperativeName}`}
                title={publicDisplayCopy('Gọi HTX', siteKey)}
              >
                <Phone size={15} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[var(--public-shadow-hover)]">
      <div className="flex items-start gap-3.5">
        <Link href={`/htx/${cooperative.code}`} className="relative shrink-0 overflow-hidden rounded-[var(--public-radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]">
          {useSemanticVisual ? (
            <CooperativeSemanticVisual cooperative={cooperative} compact />
          ) : (
            <PublicImage
              src={cooperative.avatarUrl}
              alt={cooperativeName}
              fallback={defaultCooperativeAvatar}
              priority={priority}
              wrapperClassName="h-14 w-14 sm:h-16 sm:w-16"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <span className={cn('font-semibold tracking-wider text-[var(--brand-primary)]', siteKey !== 'passport' && 'uppercase')}>{publicDisplayCopy('HTX công khai', siteKey)}</span>
            <span>•</span>
            <span className="truncate">{cooperative.province || 'Việt Nam'}</span>
          </div>
          <Link
            href={`/htx/${cooperative.code}`}
            className="mt-1 inline-flex min-h-11 items-center line-clamp-2 text-base font-bold leading-snug text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]"
          >
            {cooperativeName}
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 border-y border-[var(--border)] py-3 text-xs">
        <div className="pr-3">
          <span className="block text-[0.7rem] text-[var(--text-tertiary)]">Địa bàn hoạt động</span>
          <span className="mt-1 block truncate font-bold text-[var(--text-primary)]">{cooperative.province || 'Việt Nam'}</span>
        </div>
        <div className="border-l border-[var(--border)] pl-3">
          <span className="block text-xs text-[var(--text-tertiary)]">Nông sản công khai</span>
          <span className="mt-1 block font-bold text-[var(--brand-primary)]">{cooperative.productCount} sản phẩm</span>
        </div>
      </div>

      <div className="mt-4 pt-1 flex items-center justify-between gap-3">
        <Link
          href={`/htx/${cooperative.code}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--public-radius-control)] border border-[var(--border-strong)] bg-white px-3 text-xs font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-slate-50"
        >
          <span>{publicDisplayCopy('Hồ sơ hợp tác xã', siteKey)}</span>
        </Link>
        {cooperative.phone && (
          <a
            href={`tel:${cooperative.phone}`}
            className="grid h-11 w-11 min-h-11 min-w-11 shrink-0 place-items-center rounded-[var(--public-radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-subtle)] hover:border-[var(--brand-primary)]"
            aria-label={`Gọi cho ${cooperativeName}`}
            title={publicDisplayCopy('Gọi HTX', siteKey)}
          >
            <Phone size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

const cooperativeVisuals = {
  north: { background: 'bg-[linear-gradient(145deg,#e7f2e4_0%,#a8c995_100%)]', ink: 'text-[#35652e]' },
  highland: { background: 'bg-[linear-gradient(145deg,#f4e7d7_0%,#c9a879_100%)]', ink: 'text-[#704621]' },
  south: { background: 'bg-[linear-gradient(145deg,#e1f2ee_0%,#91cdb8_100%)]', ink: 'text-[#17624a]' },
  coast: { background: 'bg-[linear-gradient(145deg,#e0f1f5_0%,#91c9d5_100%)]', ink: 'text-[#1c6675]' }
} as const;

function CooperativeSemanticVisual({ cooperative, compact = false }: { cooperative: PublicCooperative; compact?: boolean }) {
  const visual = cooperativeVisualFor(cooperative.province);
  const Icon = /cà mau|sóc trăng|tiền giang|vĩnh long|đồng tháp/i.test(cooperative.province || '') ? MapPinned : Store;

  return (
    <div role="img" aria-label={cooperative.name} className={`grid ${compact ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]'} place-items-center ${visual.background} ${visual.ink}`}>
      <span className={`grid ${compact ? 'h-8 w-8' : 'h-9 w-9'} place-items-center rounded-full bg-white/65`}>
        <Icon size={compact ? 17 : 19} aria-hidden="true" />
      </span>
    </div>
  );
}

function cooperativeVisualFor(province?: string | null) {
  const location = (province || '').toLowerCase();
  if (/đắk lắk|gia lai|tây nguyên|lâm đồng/.test(location)) return cooperativeVisuals.highland;
  if (/cà mau|thủy sản|biển/.test(location)) return cooperativeVisuals.coast;
  if (/đồng tháp|sóc trăng|tiền giang|vĩnh long|cần thơ|an giang/.test(location)) return cooperativeVisuals.south;
  return cooperativeVisuals.north;
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
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-[border-color] duration-200 hover:border-[var(--brand-primary)]">
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
              <span className="font-bold text-[var(--brand-primary)] text-[0.7rem]">
              {publicNewsCategoryLabel(article.category)}
            </span>
          )}
          {article.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} aria-hidden="true" />
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>
        <Link href={`/tin-tuc/${article.slug}`} className="mt-2.5 block line-clamp-2 text-base font-bold leading-snug text-[var(--text-primary)] transition hover:text-[var(--brand-primary)]">
          {article.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {article.excerpt || article.seoDescription || publicNewsFallback(article.siteKey)}
        </p>
      </div>
    </article>
  );
}

function publicNewsFallback(siteKey?: NewsArticle['siteKey']) {
  if (siteKey === 'PASSPORT') return 'Tin tức Hộ chiếu nông nghiệp';
  if (siteKey === 'HTXONLINE') return 'Tin tức HTXONLINE';
  return 'Tin tức Agripassport';
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
    <div data-public-empty-state="true" className="public-empty-state rounded-xl border border-[var(--border)] bg-white p-8 sm:p-10 text-center shadow-xs">
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
