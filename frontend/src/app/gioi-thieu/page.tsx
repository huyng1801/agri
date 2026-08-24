import Link from 'next/link';
import { QrCode, ShoppingBag, Store } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Giới thiệu',
    description: 'Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.',
    path: '/gioi-thieu'
  });
}

export default async function AboutPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const highlightItems =
    siteKey === 'htxonline'
      ? [
          { title: 'Quản trị xã viên tập trung', icon: Store, text: 'Tập trung hồ sơ thành viên, trạng thái tham gia và dữ liệu hoạt động nội bộ của hợp tác xã trên một nơi dễ theo dõi.' },
          { title: 'Theo dõi dịch vụ, thu chi, xuất nhập', icon: ShoppingBag, text: 'Ghi nhận mức độ sử dụng dịch vụ, các khoản thu chi và biến động nhập xuất để hỗ trợ đối soát tốt hơn.' },
          { title: 'Đồng bộ dữ liệu sản phẩm', icon: QrCode, text: 'Danh mục sản phẩm thực tế của HTX có thể được chuẩn hóa để đưa sang Agripassport và tạo hộ chiếu số khi cần.' }
        ]
      : [
          { title: 'Kết nối HTX với người mua', icon: Store, text: 'HTX có thể đăng công khai sản phẩm, hồ sơ và bán hàng COD mà không cần xây website riêng.' },
          { title: 'Minh bạch bằng QR Passport', icon: QrCode, text: 'Người mua quét QR để xem nhật ký, vùng trồng và chứng nhận công khai do HTX công bố.' },
          { title: 'Vận hành bán hàng COD', icon: ShoppingBag, text: 'Giỏ hàng, checkout và tra cứu đơn hàng được tích hợp sẵn trên cùng một nền tảng.' }
        ];

  return (
    <PublicStaticPage
      title={siteProfile.pageContent.introTitle}
      description={siteProfile.pageContent.introDescription}
      heroImageUrl={siteProfile.pageContent.introImageUrl}
      heroImageAlt={siteProfile.pageContent.introImageAlt}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {highlightItems.map((item) => (
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
          <Link href="/ve-chung-toi" className="inline-flex min-h-10 items-center rounded-full bg-mint/80 px-3 align-middle font-semibold text-leaf">
            Về chúng tôi
          </Link>{' '}
          hoặc xem{' '}
          <Link href="/huong-dan-mua-hang" className="inline-flex min-h-10 items-center rounded-full bg-mint/80 px-3 align-middle font-semibold text-leaf">
            hướng dẫn mua hàng
          </Link>
          .
        </p>
      </Panel>
    </PublicStaticPage>
  );
}
