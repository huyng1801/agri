import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, ShoppingBag, Store } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Gi?i thi?u | HTXONLINE',
  description: 'N?n t?ng s?n n?ng s?n s? v? QR truy xu?t ngu?n g?c cho h?p t?c x? Vi?t Nam.',
  alternates: { canonical: 'https://htxonline.vn/gioi-thieu' }
};

export default async function AboutPage() {
  const siteProfile = await getPublicSiteProfile();

  return (
    <PublicStaticPage
      title={siteProfile.pageContent.introTitle}
      description={siteProfile.pageContent.introDescription}
      heroImageUrl={siteProfile.pageContent.introImageUrl}
      heroImageAlt={siteProfile.pageContent.introImageAlt}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'K?t n?i HTX v?i ng??i mua', icon: Store, text: 'HTX c? th? publish s?n ph?m, h? s? v? b?n h?ng COD m? kh?ng c?n x?y website ri?ng.' },
          { title: 'Minh b?ch b?ng QR Passport', icon: QrCode, text: 'Ng??i mua qu?t QR ?? xem nh?t k?, v?ng tr?ng v? ch?ng nh?n public do HTX c?ng b?.' },
          { title: 'V?n h?nh b?n h?ng COD', icon: ShoppingBag, text: 'Gi? h?ng, checkout v? tra c?u ??n h?ng ???c t?ch h?p s?n tr?n c?ng m?t n?n t?ng.' }
        ].map((item) => (
          <Panel key={item.title} className="h-full p-3.5 sm:p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-leaf sm:h-12 sm:w-12">
              <item.icon size={21} aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-[1.02rem] font-bold leading-tight text-ink sm:mt-4 sm:text-lg">{item.title}</h2>
            <p className="mt-1.5 text-[0.84rem] leading-[1.62] text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{item.text}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-4 p-3.5 text-[0.9rem] leading-[1.7] text-slate-700 sm:p-5 sm:text-sm sm:leading-7">
        <p>
          T?m hi?u th?m v? ??nh h??ng n?n t?ng t?i{' '}
          <Link href="/ve-chung-toi" className="font-semibold text-leaf">
            V? ch?ng t?i
          </Link>{' '}
          ho?c xem{' '}
          <Link href="/huong-dan-mua-hang" className="font-semibold text-leaf">
            h??ng d?n mua h?ng
          </Link>
          .
        </p>
      </Panel>
    </PublicStaticPage>
  );
}
