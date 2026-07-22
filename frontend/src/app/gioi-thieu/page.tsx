import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, ShoppingBag, Store } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Giới thiệu | HTXONLINE',
  description: 'Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.',
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
          { title: 'Kết nối HTX với người mua', icon: Store, text: 'HTX có thể publish sản phẩm, hồ sơ và bán hàng COD mà không cần xây website riêng.' },
          { title: 'Minh bạch bằng QR Passport', icon: QrCode, text: 'Người mua quét QR để xem nhật ký, vùng trồng và chứng nhận public do HTX công bố.' },
          { title: 'Vận hành bán hàng COD', icon: ShoppingBag, text: 'Giỏ hàng, checkout và tra cứu đơn hàng được tích hợp sẵn trên cùng một nền tảng.' }
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
          Tìm hiểu thêm về định hướng nền tảng tại{' '}
          <Link href="/ve-chung-toi" className="font-semibold text-leaf">
            Về chúng tôi
          </Link>{' '}
          hoặc xem{' '}
          <Link href="/huong-dan-mua-hang" className="font-semibold text-leaf">
            hướng dẫn mua hàng
          </Link>
          .
        </p>
      </Panel>
    </PublicStaticPage>
  );
}
