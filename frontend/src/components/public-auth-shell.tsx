'use client';

import Link from 'next/link';
import { ArrowUpRight, QrCode, ShieldCheck, Sprout } from 'lucide-react';
import { PublicLogo } from './public-logo';
import type { PublicSiteKey } from '@/lib/domain';

export function PublicAuthShell({ children, siteKey = 'agripassport' }: { children: React.ReactNode; siteKey?: PublicSiteKey }) {

  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const appName = isInternal ? 'HTXONLINE' : siteKey === 'passport' ? 'HỘ CHIẾU NÔNG NGHIỆP' : 'AGRIPASSPORT';
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';
  const intro = isPassport
    ? 'Truy cập hồ sơ số, QR truy xuất và dữ liệu nông sản đã được công khai.'
    : isInternal
      ? 'Một không gian vận hành rõ ràng cho hợp tác xã và đội ngũ quản trị.'
      : 'Kết nối dữ liệu sản phẩm, hợp tác xã và thị trường trên một nền tảng.';

  return (
    <div data-public-site={siteKey} data-auth-shell="true" className="public-auth-shell min-h-screen bg-[linear-gradient(180deg,var(--brand-primary-subtle)_0%,#f8faf9_48%,#ffffff_100%)]">
      <header className="public-auth-header flex justify-center px-4 pb-2 pt-8 sm:pt-10">
        <Link href="/" className="inline-flex min-h-12 items-center gap-2.5 rounded-xl px-2 text-lg font-bold text-[var(--text-primary)]" aria-label={`${appName} - Trang chủ`}>
          <PublicLogo size={isInternal ? 38 : 42} variant={logoVariant} className="h-10 w-auto max-w-[18rem]" />
        </Link>
      </header>
      <main className="public-auth-main mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-14 lg:px-8 lg:py-16">
        <section className="public-auth-pitch hidden lg:block" aria-labelledby="auth-pitch-title">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-white/80 px-3.5 text-sm font-semibold text-[var(--brand-primary)] shadow-sm">
            <Sprout size={16} aria-hidden="true" />
            {isPassport ? 'Hồ sơ số đáng tin cậy' : isInternal ? 'Vận hành hợp tác xã' : 'Dữ liệu nông nghiệp minh bạch'}
          </span>
          <h2 id="auth-pitch-title" className="mt-6 max-w-xl text-4xl font-extrabold leading-[1.03] tracking-[-0.055em] text-[var(--text-primary)] xl:text-5xl">
            {isPassport ? 'Mở đúng hồ sơ, hiểu đúng nguồn gốc.' : isInternal ? 'Đưa vận hành hằng ngày về đúng một nơi.' : 'Biến dữ liệu sản phẩm thành niềm tin thị trường.'}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-[var(--text-secondary)]">{intro}</p>
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm">
              <QrCode size={20} className="text-[var(--brand-primary)]" aria-hidden="true" />
              <p className="mt-3 font-bold text-[var(--text-primary)]">Tra cứu rõ ràng</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Thông tin được mở theo đúng phạm vi công khai.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm">
              <ShieldCheck size={20} className="text-[var(--brand-primary)]" aria-hidden="true" />
              <p className="mt-3 font-bold text-[var(--text-primary)]">Dữ liệu có căn cứ</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Hồ sơ được chuẩn hóa trước khi hiển thị.</p>
            </div>
          </div>
          <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-[var(--brand-primary)] transition hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)]">
            Xem thông tin nền tảng <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <div className="public-auth-form">{children}</div>
      </main>
      <footer className="public-auth-footer px-4 pb-8 text-center text-xs text-[var(--text-tertiary)] sm:pb-10">{appName} · Không gian truy cập an toàn cho dữ liệu nông nghiệp</footer>
    </div>
  );
}
