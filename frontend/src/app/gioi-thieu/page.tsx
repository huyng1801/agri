import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, ShoppingBag, Store } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Gioi thieu | HTXONLINE',
  description: 'Nen tang san nong san so va QR truy xuat nguon goc cho hop tac xa Viet Nam.',
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
          { title: 'Ket noi HTX voi nguoi mua', icon: Store, text: 'HTX co the publish san pham, ho so va ban hang COD ma khong can xay website rieng.' },
          { title: 'Minh bach bang QR Passport', icon: QrCode, text: 'Nguoi mua quet QR de xem nhat ky, vung trong va chung nhan public do HTX cong bo.' },
          { title: 'Van hanh ban hang COD', icon: ShoppingBag, text: 'Gio hang, checkout va tra cuu don hang duoc tich hop san tren cung mot nen tang.' }
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
          Tim hieu them ve dinh huong nen tang tai{' '}
          <Link href="/ve-chung-toi" className="font-semibold text-leaf">
            Ve chung toi
          </Link>{' '}
          hoac xem{' '}
          <Link href="/huong-dan-mua-hang" className="font-semibold text-leaf">
            huong dan mua hang
          </Link>
          .
        </p>
      </Panel>
    </PublicStaticPage>
  );
}
