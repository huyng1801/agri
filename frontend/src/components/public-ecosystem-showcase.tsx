import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, QrCode, Store, Boxes, type LucideIcon, ExternalLink } from 'lucide-react';
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
    name: 'HỘ CHIẾU NÔNG NGHIỆP',
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

  const platforms: PlatformItem[] = [
    {
      num: '01',
      key: 'htxonline',
      name: isAgri ? 'HỢP TÁC XÃ ONLINE' : 'HTXONLINE',
      role: 'Quản trị nội bộ hợp tác xã',
      desc: 'Hệ sinh thái số hóa nghiệp vụ hợp tác xã, quản lý thành viên, xã viên, sổ sách kế toán, quỹ xã, theo dõi xuất nhập kho và lập kế hoạch sản xuất theo mùa vụ.',
      href: htxonlineUrl('/'),
      isExternal: true,
      accentColor: '#131935',
      headerBg: 'bg-[#131935]',
      badgeClass: 'bg-[#131935]/10 text-[#131935] border-[#131935]/20',
      buttonClass: 'bg-[#131935] hover:bg-[#1f284f] text-white focus-visible:ring-[#131935]',
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
      accentColor: '#106f8a',
      headerBg: 'bg-[#106f8a]',
      badgeClass: 'bg-[#106f8a]/10 text-[#106f8a] border-[#106f8a]/20',
      buttonClass: 'bg-[#106f8a] hover:bg-[#0d596e] text-white focus-visible:ring-[#106f8a]',
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
      name: 'HỘ CHIẾU NÔNG NGHIỆP',
      role: 'Truy xuất nguồn gốc & Nhật ký số',
      desc: 'Cấp phát chứng thư điện tử và mã QR truy xuất cho từng sản phẩm hoặc lô nông sản, liên kết trực tiếp với vùng canh tác, quy trình phân bón và chứng nhận an toàn.',
      href: passportUrl('/'),
      isExternal: true,
      accentColor: '#0d7a28',
      headerBg: 'bg-[#0d7a28]',
      badgeClass: 'bg-[#0d7a28]/10 text-[#0d7a28] border-[#0d7a28]/20',
      buttonClass: 'bg-[#0d7a28] hover:bg-[#0a6120] text-white focus-visible:ring-[#0d7a28]',
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
            <span className="h-2 w-2 rounded-full bg-[#106f8a] animate-pulse" />
            <span className="tracking-wide uppercase text-[11px] font-bold">Kiến trúc hệ thống</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:whitespace-nowrap sm:text-3xl lg:text-4xl">
            Ba nền tảng chuyên biệt một chuỗi giá trị khép kín
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Mỗi hệ thống đảm nhiệm một khâu then chốt trong chu trình số hóa nông nghiệp, đảm bảo tính phân quyền, minh bạch và tính toàn vẹn dữ liệu từ cánh đồng đến tay đối tác.
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
                'relative flex flex-col justify-between rounded-xl border bg-white transition-all duration-200',
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#106f8a]/10 px-2.5 py-0.5 text-xs font-semibold text-[#106f8a] border border-[#106f8a]/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#106f8a]" />
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
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                      {p.name}
                    </h3>
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                    </p>
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
                    <ExternalLink size={15} aria-hidden="true" />
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
