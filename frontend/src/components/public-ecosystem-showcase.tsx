import { ArrowRight, Boxes, QrCode, Store, type LucideIcon } from 'lucide-react';
import { cn } from './ui';
import { htxonlineUrl, marketplaceUrl, passportUrl, type PublicSiteKey } from '@/lib/domain';

type EcosystemCard = {
  key: Exclude<PublicSiteKey, 'local'>;
  name: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradientClassName: string;
  signal: string;
};

export const ecosystemCards: EcosystemCard[] = [
  {
    key: 'htxonline',
    name: 'HTXONLINE',
    label: 'Cho hợp tác xã',
    description: 'Hệ thống quản trị chuyển đổi số nội bộ, phục vụ quản lý thành viên, mức độ sử dụng dịch vụ, thu chi, xuất nhập và toàn bộ vận hành của hợp tác xã.',
    href: htxonlineUrl('/'),
    icon: Store,
    gradientClassName: 'bg-[linear-gradient(135deg,#090d1d_0%,#131935_46%,#1b2450_100%)]',
    signal: 'Quản trị nội bộ'
  },
  {
    key: 'agripassport',
    name: 'AGRIPASSPORT',
    label: 'Cho sản phẩm & bán hàng',
    description: 'Nền tảng trung tâm để chuẩn hóa tên HTX, sản phẩm nông nghiệp, mở kênh công khai, bán hàng và đồng bộ dữ liệu sang các lớp hiển thị khác.',
    href: marketplaceUrl('/'),
    icon: Boxes,
    gradientClassName: 'bg-[linear-gradient(135deg,#0a5668_0%,#106f8a_48%,#1d96b7_100%)]',
    signal: 'Sản phẩm công khai'
  },
  {
    key: 'passport',
    name: 'HỘ CHIẾU NÔNG NGHIỆP',
    label: 'Cho truy xuất QR',
    description: 'Tạo hồ sơ số và QR cho từng sản phẩm hoặc lô sản phẩm, giúp người mua truy xuất nguồn gốc, nhật ký canh tác và thông tin công khai rõ ràng.',
    href: passportUrl('/'),
    icon: QrCode,
    gradientClassName: 'bg-[linear-gradient(135deg,#0d5c24_0%,#0d7a28_48%,#10a536_100%)]',
    signal: 'QR truy xuất'
  }
];

const demeterCardStyles = {
  htxonline: {
    surface:
      'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92)_0%,rgba(238,248,241,0.96)_44%,rgba(208,230,214,0.98)_100%)]',
    badge: 'bg-[#8ed2df] text-white',
    icon: 'text-[#23344d]',
    ring: 'border-[#dce9df]'
  },
  agripassport: {
    surface:
      'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92)_0%,rgba(232,247,250,0.96)_44%,rgba(198,229,238,0.98)_100%)]',
    badge: 'bg-[#78c8d8] text-white',
    icon: 'text-[#0d6f80]',
    ring: 'border-[#d5eaf0]'
  },
  passport: {
    surface:
      'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92)_0%,rgba(236,248,236,0.96)_44%,rgba(207,234,209,0.98)_100%)]',
    badge: 'bg-[#78c86a] text-white',
    icon: 'text-[#23703a]',
    ring: 'border-[#d9ead9]'
  }
} as const;

export function PublicEcosystemShowcase({
  siteKey,
  className,
  compact = false,
  showHeading = true
}: {
  siteKey: PublicSiteKey;
  className?: string;
  compact?: boolean;
  showHeading?: boolean;
}) {
  const demeterLike = siteKey === 'htxonline';
  return (
    <section className={className}>
      {showHeading ? (
        <div className={cn('mb-4 sm:mb-5', compact && 'mb-3')}>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e] sm:text-sm">Hệ sinh thái Agri</p>
          <h2 className={cn('mt-2 text-[1.82rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#24283a] sm:text-[2.7rem]', compact && 'text-[1.35rem] sm:text-[1.8rem]')}>
            Ba nền tảng đi cùng một luồng dữ liệu, nhưng mỗi nền tảng giữ một vai trò rất rõ.
          </h2>
          <p className={cn('mt-2 max-w-3xl text-[0.95rem] leading-7 text-slate-600 sm:text-base', compact && 'max-w-2xl text-sm leading-6')}>
            Phần này được dựng theo nhịp card trắng, khối visual lớn và headline ngắn hơn để người xem chạm vào là hiểu vai trò từng nền tảng.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          'grid gap-4',
          demeterLike &&
            '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3'
        )}
      >
        {ecosystemCards.map((card, index) => {
          const Icon = card.icon;
          const isCurrent = siteKey === card.key;
          if (demeterLike) {
            const demeterStyle = demeterCardStyles[card.key];
            return (
              <a
                key={card.key}
                href={card.href}
                className={cn(
                  'group w-[min(82vw,21rem)] shrink-0 snap-start overflow-hidden rounded-[1.9rem] border border-[#e4eadf] bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)] md:w-auto',
                  compact && 'rounded-[1.6rem]',
                  isCurrent && 'ring-2 ring-[#9fe2b1]/70'
                )}
              >
                <div
                  className={cn(
                    'relative overflow-hidden rounded-[1.6rem] border border-[#e1e8de] aspect-[1/1.02] p-4',
                    demeterStyle.surface,
                    compact && 'aspect-[1/0.95]'
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_36%)]" aria-hidden="true" />
                  <div className="absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" aria-hidden="true" />
                  <div className="absolute inset-x-0 top-7 flex justify-center">
                    <div
                      className={cn(
                        'grid h-[7.5rem] w-[7.5rem] place-items-center rounded-full border-[5px] bg-white shadow-[0_18px_34px_rgba(15,23,42,0.08)]',
                        demeterStyle.ring
                      )}
                    >
                      <Icon size={compact ? 44 : 52} strokeWidth={1.7} aria-hidden="true" className={demeterStyle.icon} />
                    </div>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
                    <span className={cn('inline-flex min-h-8 items-center rounded-full px-3 text-[0.74rem] font-semibold', demeterStyle.badge)}>
                      {card.signal}
                    </span>
                    {isCurrent ? (
                      <span className="inline-flex min-h-8 items-center rounded-full border border-white/80 bg-white/86 px-3 text-[0.72rem] font-semibold text-[#1f2233] shadow-sm">
                        Đang xem
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="px-1 pb-1 pt-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                  <h3
                    className={cn(
                      'mt-2 text-[1.06rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1f9b4b] sm:text-[1.28rem]',
                      compact && 'text-[1rem] sm:text-[1.18rem]'
                    )}
                  >
                    {card.name}
                  </h3>
                  <p className={cn('mt-2 text-[0.96rem] leading-7 text-[#1f2233]', compact && 'text-sm leading-6')}>
                    {card.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f2233]">
                    Mở nền tảng
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            );
          }

          return (
            <a
              key={card.key}
              href={card.href}
              className={cn(
                'group relative overflow-hidden rounded-[2rem] shadow-[0_28px_60px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1',
                compact && 'rounded-[1.6rem] shadow-[0_18px_38px_rgba(15,23,42,0.1)]'
              )}
            >
              <div className={cn('relative overflow-hidden px-5 py-5 text-white sm:px-7 sm:py-6', card.gradientClassName, compact && 'px-4 py-4')}>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-80"
                  style={{
                    background:
                      'radial-gradient(circle at left top, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12), transparent 24%)'
                  }}
                />

                <div
                  className={cn(
                    'relative grid gap-5 md:grid-cols-[8.5rem_1fr] md:items-center lg:grid-cols-[10rem_1fr]',
                    demeterLike && 'md:grid-cols-[6.8rem_1fr] lg:grid-cols-[8rem_1fr]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-[6.8rem] w-[6.8rem] shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] md:h-[7.4rem] md:w-[7.4rem]',
                      compact && 'h-[5rem] w-[5rem]',
                      demeterLike && 'rounded-[1.7rem] border-white/12 bg-transparent shadow-none md:h-[6rem] md:w-[6rem] lg:h-[6.6rem] lg:w-[6.6rem]'
                    )}
                  >
                    <Icon size={compact ? 34 : demeterLike ? 48 : 54} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.72)]">
                      <span>{card.label}</span>
                      {!demeterLike ? (
                        <>
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/65" aria-hidden="true" />
                          <span>0{index + 1}</span>
                          {isCurrent ? (
                            <>
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/65" aria-hidden="true" />
                              <span>Đang mở</span>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </div>

                    <h3
                      className={cn(
                        'mt-3 text-[1.55rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[2.2rem]',
                        compact && 'text-[1.15rem] sm:text-[1.45rem]',
                        demeterLike && 'text-[1.45rem] sm:text-[1.9rem]'
                      )}
                    >
                      {card.name}
                    </h3>
                    <p
                      className={cn(
                        'mt-2 max-w-3xl text-[0.96rem] leading-[1.78] text-[rgba(255,255,255,0.88)] sm:text-[1.06rem]',
                        compact && 'text-sm leading-6',
                        demeterLike && 'max-w-2xl text-[0.98rem] leading-[1.72] sm:text-[1rem]'
                      )}
                    >
                      {card.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex min-h-10 items-center rounded-full border border-white/14 bg-black/16 px-4 text-sm font-semibold text-white/90">
                        {card.signal}
                      </span>
                      {!demeterLike ? (
                        <span className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white">
                          Mở nền tảng
                          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
