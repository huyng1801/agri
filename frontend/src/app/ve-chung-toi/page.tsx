import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, QrCode, ShoppingBag, Store, Users } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Về chúng tôi',
  description: 'HTXONLINE mang đến sàn nông sản số, QR truy xuất và giải pháp vận hành cho hợp tác xã Việt Nam.',
  alternates: { canonical: 'https://htxonline.vn/ve-chung-toi' }
};

const offerings = [
  {
    title: 'Sàn thương mại cho HTX',
    description: 'Hiển thị sản phẩm public, hồ sơ HTX và kênh tiếp cận người mua trên toàn quốc.',
    icon: Store
  },
  {
    title: 'QR Passport truy xuất',
    description: 'Mỗi sản phẩm có mã QR để khách xem nhật ký, vùng trồng và chứng nhận đã công khai.',
    icon: QrCode
  },
  {
    title: 'Đặt hàng COD',
    description: 'Người mua gửi đơn nhanh, HTX chủ động liên hệ xác nhận và xử lý giao hàng thu tiền.',
    icon: ShoppingBag
  },
  {
    title: 'Dashboard vận hành HTX',
    description: 'HTX tự quản lý sản phẩm, nông dân, vùng trồng, nhật ký và đơn hàng trên htx.htxonline.vn.',
    icon: Users
  }
];

const capabilities = [
  'Quản lý danh mục sản phẩm và publish lên sàn public',
  'Ghi nhật ký canh tác, chứng nhận và tạo QR Passport',
  'Theo dõi đơn hàng COD và trạng thái xử lý theo từng HTX',
  'Báo cáo tổng quan sản xuất, truy xuất và chất lượng',
  'Phân quyền Admin HTX, nông dân và Super Admin nền tảng',
  'Hỗ trợ đa HTX — người mua có thể đặt nhiều HTX trong một lần checkout'
];

export default function AboutUsPage() {
  return (
    <PublicStaticPage
      title="Về chúng tôi"
      description="HTXONLINE mang đến nền tảng số giúp hợp tác xã kết nối thị trường, minh bạch nguồn gốc và vận hành bán hàng hiệu quả."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-ink">Chúng tôi mang đến điều gì?</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            HTXONLINE không chỉ là website giới thiệu — đây là hệ sinh thái giúp HTX xây dựng niềm tin với người mua thông qua dữ liệu minh bạch và quy trình bán hàng có kiểm soát.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {offerings.map((item) => (
              <Panel key={item.title} className="h-full">
                <item.icon className="text-leaf" size={28} aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </Panel>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ink">Chúng tôi làm được những gì?</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Từ sàn public đến dashboard HTX và quản trị nền tảng, HTXONLINE hỗ trợ toàn bộ vòng đời: sản xuất → truy xuất → bán hàng → báo cáo.
          </p>
          <Panel className="mt-5">
            <ul className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                  <BadgeCheck className="mt-0.5 shrink-0 text-leaf" size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        <Panel className="bg-mint">
          <h2 className="text-xl font-bold text-ink">Bắt đầu cùng HTXONLINE</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            HTX muốn tham gia sàn hoặc cần tư vấn triển khai truy xuất — liên hệ đội vận hành để được hỗ trợ onboarding.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/lien-he" className="inline-flex min-h-11 items-center rounded-md bg-leaf px-4 text-sm font-semibold text-white">
              Liên hệ tư vấn
            </Link>
            <Link href="/san-pham" className="inline-flex min-h-11 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-ink">
              Xem sản phẩm trên sàn
            </Link>
          </div>
        </Panel>
      </div>
    </PublicStaticPage>
  );
}
