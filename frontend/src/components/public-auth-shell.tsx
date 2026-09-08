'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PublicLogo } from './public-logo';
import { publicSiteKeyFromHost, type PublicSiteKey } from '@/lib/domain';

export function PublicAuthShell({ children }: { children: React.ReactNode }) {
  const [siteKey, setSiteKey] = useState<PublicSiteKey>('agripassport');

  useEffect(() => {
    setSiteKey(publicSiteKeyFromHost(window.location.hostname));
  }, []);

  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const appName = isInternal ? 'HTXONLINE' : siteKey === 'passport' ? 'HỘ CHIẾU NÔNG NGHIỆP' : 'AGRIPASSPORT';
  const logoVariant = isInternal ? 'htx-wordmark' : isPassport ? 'passport-wordmark' : 'agri-wordmark';

  return (
    <div data-public-site={siteKey} className="min-h-screen bg-[linear-gradient(180deg,var(--brand-primary-subtle)_0%,#ffffff_42%,#ffffff_100%)]">
      <header className="flex justify-center px-4 pt-8 pb-2">
        <Link href="/" className="inline-flex min-h-12 items-center gap-2.5 rounded-xl px-2 text-lg font-bold text-[var(--text-primary)]" aria-label={`${appName} - Trang chủ`}>
          <PublicLogo size={isInternal ? 38 : 42} variant={logoVariant} className="h-10 w-auto max-w-[18rem]" />
        </Link>
      </header>
      <main className="grid place-items-center px-4 py-6">{children}</main>
    </div>
  );
}
