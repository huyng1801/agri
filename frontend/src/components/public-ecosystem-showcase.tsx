import React from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, CheckCircle2, QrCode, Store, Boxes, type LucideIcon } from 'lucide-react';
import { cn } from './ui';
import { htxonlineUrl, marketplaceUrl, passportUrl, type PublicSiteKey } from '@/lib/domain';

export type EcosystemCard = {
  key: PublicSiteKey | 'cooperatives';
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
    name: 'HỢP TÁC XÃ ONLINE',
    label: 'Cho hợp tác xã',
    description: 'Hệ thống quản trị chuyển đổi số nội bộ, phục vụ quản lý thành viên, mức độ sử dụng dịch vụ, thu chi, xuất nhập và toàn bộ vận hành của hợp tác xã.',
    href: htxonlineUrl('/'),
    icon: Store,
    gradientClassName: 'ecosystem-cooperative-bg',
    signal: 'Quản trị nội bộ'
  },
  {
    key: 'agripassport',
    name: 'AGRIPASSPORT',
    label: 'Cho sản phẩm & bán hàng',
    description: 'Nền tảng trung tâm để chuẩn hóa tên HTX, sản phẩm nông nghiệp, mở kênh công khai, bán hàng và đồng bộ dữ liệu sang các lớp hiển thị khác.',
    href: marketplaceUrl('/'),
    icon: Boxes,
    gradientClassName: 'ecosystem-agripassport-bg',
    signal: 'Sản phẩm công khai'
  },
  {
    key: 'passport',
    name: 'Hộ chiếu nông nghiệp',
    label: 'Cho truy xuất QR',
    description: 'Tạo hồ sơ số và QR cho từng sản phẩm hoặc lô sản phẩm, giúp người mua truy xuất nguồn gốc, nhật ký canh tác và thông tin công khai rõ ràng.',
    href: passportUrl('/'),
    icon: QrCode,
    gradientClassName: 'ecosystem-passport-bg',
    signal: 'QR truy xuất'
  }
];

type PlatformItem = {
  num: string;
  key: PublicSiteKey;
  name: string;
  role: string;
  desc: string;
  href: string;
  isExternal: boolean;
  accentColor: string;
  headerBg: string;
  badgeClass: string;
  buttonClass: string;
  icon: LucideIcon;
  capabilities: string[];
};

export function PublicEcosystemShowcase({
  siteKey = 'agripassport',
  className,
  compact = false,
  showHeading = true
}: {
  siteKey?: PublicSiteKey;
  className?: string;
  compact?: boolean;
  showHeading?: boolean;
}) {
  const isAgri = siteKey === 'agripassport' || siteKey === 'local';

  const compactPlatforms = [
    {
      key: 'htxonline' as const,
      name: 'HTXONLINE',
      stage: 'Lớp vận hành',
      role: 'Quản trị hợp tác xã',
      description: 'Quản lý hoạt động của hợp tác xã và dữ liệu sản xuất trong phạm vi nội bộ.',
      href: htxonlineUrl('/'),
      external: true,
      color: 'var(--ecosystem-htxonline)',
      icon: Store,
      handoff: 'Dữ liệu phù hợp'
    },
    {
      key: 'agripassport' as const,
      name: 'AGRIPASSPORT',
      stage: 'Lớp hồ sơ sản phẩm',
      role: 'Thông tin đơn vị & nông sản',
      description: 'Tổ chức danh mục sản phẩm, hồ sơ hợp tác xã và kênh kết nối.',
      href: marketplaceUrl('/'),
      external: true,
      color: 'var(--ecosystem-agripassport)',
      icon: Boxes,
      handoff: 'Được đơn vị duyệt'
    },
    {
      key: 'passport' as const,
      name: 'Hộ chiếu nông nghiệp',
      stage: 'Lớp tra cứu QR',
      role: 'Hồ sơ công khai',
      description: 'Mở hồ sơ sản phẩm, lô hàng hoặc cây bằng mã QR; chỉ hiển thị dữ liệu được duyệt.',
      href: '/truy-xuat',
      external: false,
      color: 'var(--ecosystem-passport)',
      icon: QrCode,
      handoff: ''
    }
  ];

  if (compact) {
    return (
      <section className={cn('w-full', className)} aria-label="Các nền tảng trong hệ sinh thái">
        {showHeading && (
          <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--brand-primary)]">Luồng dữ liệu theo vai trò</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                Từ vận hành hợp tác xã đến hồ sơ QR
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                Ba nền tảng đảm nhiệm ba lớp công việc. Chỉ thông tin được đơn vị chọn và cho phép công khai mới xuất hiện trên Hộ chiếu.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-x-3 gap-y-2 lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)_5rem_minmax(0,1fr)] lg:items-stretch lg:gap-y-0">
          {compactPlatforms.map((platform, index) => {
            const isCurrent = platform.key === siteKey;
            const Icon = platform.icon;
            const content = (
              <div className="flex h-full flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: platform.color }}>
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.68rem] font-bold tracking-[0.08em] text-[var(--text-tertiary)]">{platform.stage}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-[var(--text-secondary)]">{platform.role}</span>
                  </span>
                </div>
                <span className="block text-base font-extrabold leading-6 text-[var(--text-primary)] [overflow-wrap:anywhere]">{platform.name}</span>
                <span className="block text-sm leading-6 text-[var(--text-secondary)]">{platform.description}</span>
                <span className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-1 text-sm font-bold" style={{ color: platform.color }}>
                  {isCurrent ? 'Tra cứu QR' : `Mở ${platform.name}`}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            );

            return (
              <React.Fragment key={platform.key}>
                <article className={cn(
                  'min-w-0 rounded-[1.25rem] border bg-[var(--surface-elevated)] p-4 transition-[border-color,box-shadow] sm:p-5',
                  isCurrent ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                )}>
                  {platform.external ? (
                    <a href={platform.href} target="_blank" rel="noopener noreferrer" className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]" aria-label={`${platform.name} — ${platform.role} (mở tab mới)`}>
                      {content}
                    </a>
                  ) : (
                    <Link href={platform.href} aria-current={isCurrent ? 'page' : undefined} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]" aria-label={`${platform.name} — ${platform.role}`}>
                      {content}
                    </Link>
                  )}
                </article>
                {index < compactPlatforms.length - 1 && (
                  <div className="flex min-h-8 items-center justify-center gap-2 text-center text-[11px] font-semibold leading-4 text-[var(--text-secondary)] lg:min-h-0 lg:flex-col lg:px-1">
                    <ArrowDown size={15} className="shrink-0 lg:hidden" aria-hidden="true" />
                    <span>{platform.handoff}</span>
                    <ArrowRight size={15} className="hidden shrink-0 lg:block" aria-hidden="true" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>
    );
  }

  const platforms: PlatformItem[] = [
    {
      num: '01',
      key: 'htxonline',
      name: isAgri ? 'HỢP TÁC XÃ ONLINE' : 'HTXONLINE',
      role: 'Quản trị nội bộ hợp tác xã',
      desc: 'Hệ sinh thái số hóa nghiệp vụ hợp tác xã, quản lý thành viên, xã viên, sổ sách kế toán, quỹ xã, theo dõi xuất nhập kho và lập kế hoạch sản xuất theo mùa vụ.',
      href: htxonlineUrl('/'),
      isExternal: true,
      accentColor: 'var(--ecosystem-htxonline)',
      headerBg: 'bg-[var(--ecosystem-htxonline)]',
      badgeClass: 'border-[var(--border)] bg-[var(--ecosystem-htxonline-subtle)] text-[var(--ecosystem-htxonline)]',
      buttonClass: 'bg-[var(--ecosystem-htxonline)] text-white hover:bg-[var(--ecosystem-htxonline-hover)] focus-visible:ring-[var(--ecosystem-htxonline)]',
      icon: Store,
      capabilities: [
        'Hồ sơ xã viên & dữ liệu đóng góp vốn',
        'Kế toán thu chi & quản trị xuất nhập tồn',
        'Lập lịch thời vụ và giám sát dịch vụ nội bộ'
      ]
    },
    {
      num: '02',
      key: 'agripassport',
      name: 'AGRIPASSPORT',
      role: 'Dữ liệu công khai & Thị trường',
      desc: 'Nền tảng chuẩn hóa dữ liệu nông sản, số hóa danh mục hàng hóa, tổ chức thông tin hợp tác xã và mở kênh kết nối minh bạch.',
      href: isAgri ? '/san-pham' : marketplaceUrl('/'),
      isExternal: !isAgri,
      accentColor: 'var(--ecosystem-agripassport)',
      headerBg: 'bg-[var(--ecosystem-agripassport)]',
      badgeClass: 'border-[var(--border)] bg-[var(--ecosystem-agripassport-subtle)] text-[var(--ecosystem-agripassport)]',
      buttonClass: 'bg-[var(--ecosystem-agripassport)] text-white hover:bg-[var(--ecosystem-agripassport-hover)] focus-visible:ring-[var(--ecosystem-agripassport)]',
      icon: Boxes,
      capabilities: [
        'Chuẩn hóa hồ sơ nông sản & giá tham chiếu',
        'Danh bạ hợp tác xã và đơn vị sản xuất',
        'Cổng tra cứu công khai & kết nối mua bán'
      ]
    },
    {
      num: '03',
      key: 'passport',
      name: 'Hộ chiếu nông nghiệp',
      role: 'Truy xuất nguồn gốc & Nhật ký số',
      desc: 'Tạo hồ sơ số và mã QR cho sản phẩm hoặc lô hàng; nội dung vùng trồng, nhật ký và giấy tờ chỉ hiển thị khi được đơn vị công khai.',
      href: passportUrl('/'),
      isExternal: true,
      accentColor: 'var(--ecosystem-passport)',
      headerBg: 'bg-[var(--ecosystem-passport)]',
      badgeClass: 'border-[var(--border)] bg-[var(--ecosystem-passport-subtle)] text-[var(--ecosystem-passport)]',
      buttonClass: 'bg-[var(--ecosystem-passport)] text-white hover:bg-[var(--ecosystem-passport-hover)] focus-visible:ring-[var(--ecosystem-passport)]',
      icon: QrCode,
      capabilities: [
        'Cấp mã QR Passport định danh từng lô hàng',
        'Ghi chép minh bạch nhật ký chăm sóc & bón phân',
        'Hiển thị thông tin chứng nhận khi hồ sơ có công khai'
      ]
    }
  ];

  return (
    <section className={cn('w-full', className)} aria-label="Hệ sinh thái số Nông nghiệp Việt Nam">
      {showHeading && (
        <div className="mb-8 sm:mb-12 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--brand-primary)]" />
            <span className="tracking-wide uppercase text-[11px] font-bold">Kiến trúc hệ thống</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
            Ba nền tảng, mỗi nơi một vai trò
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Mỗi nền tảng phục vụ một nhóm công việc riêng; thông tin được chia sẻ theo quyền và phạm vi hiển thị.
          </p>
        </div>
      )}

      <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3', compact && 'gap-4')}>
        {platforms.map((p) => {
          const isCurrent =
            (p.key === 'agripassport' && isAgri) ||
            (p.key === 'htxonline' && siteKey === 'htxonline') ||
            (p.key === 'passport' && siteKey === 'passport');

          const IconComponent = p.icon;

          return (
            <article
              key={p.num}
              className={cn(
                'relative flex flex-col justify-between rounded-xl border bg-white transition-[border-color,box-shadow] duration-200',
                isCurrent
                  ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20 shadow-md'
                  : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-md'
              )}
            >
              {/* Top Accent Strip */}
              <div
                className="h-1.5 w-full rounded-t-xl"
                style={{ backgroundColor: p.accentColor }}
                aria-hidden="true"
              />

              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                {/* Header row: Number + Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono text-xs font-bold tracking-wider text-[var(--text-muted)]">
                    PHÂN HỆ {p.num}
                  </span>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-primary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
                      Nền tảng bạn đang xem
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                        p.badgeClass
                      )}
                    >
                      {p.role.split(' ')[0]} {p.role.split(' ')[1]}
                    </span>
                  )}
                </div>

                {/* Platform Identity */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                    style={{ backgroundColor: p.accentColor }}
                  >
                    <IconComponent size={22} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                      {p.name}
                    </h3>
                  </div>
                </div>

                {/* Subtitle / Role */}
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {p.role}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-6">
                  {p.desc}
                </p>

                {/* Capabilities list */}
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Nhiệm vụ trọng tâm:
                  </p>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                    {p.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="shrink-0 mt-0.5"
                          style={{ color: p.accentColor }}
                          aria-hidden="true"
                        />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0">
                {p.isExternal ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      p.buttonClass
                    )}
                  >
                    <span>Truy cập {p.name}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    href={p.href}
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      p.buttonClass
                    )}
                  >
                    <span>{isCurrent && p.key === 'agripassport' ? 'Truy cập AGRIPASSPORT' : isCurrent ? 'Khám phá ngay' : `Xem ${p.name}`}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
