import Link from 'next/link';
import { QrCode, ShoppingBag, Store } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';

export default function AboutPage() {
  return (
    <PublicStaticPage title="Giới thiệu HTXONLINE" description="Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Kết nối HTX với người mua', icon: Store, text: 'HTX có thể publish sản phẩm, hồ sơ và bán hàng COD mà không cần xây website riêng.' },
          { title: 'Minh bạch bằng QR Passport', icon: QrCode, text: 'Người mua quét QR để xem nhật ký, vùng trồng và chứng nhận public do HTX công bố.' },
          { title: 'Vận hành bán hàng COD', icon: ShoppingBag, text: 'Giỏ hàng, checkout và tra cứu đơn hàng được tích hợp sẵn trên cùng một nền tảng.' }
        ].map((item) => (
          <Panel key={item.title} className="h-full">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-mint text-leaf">
              <item.icon size={24} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-4 text-sm leading-7 text-slate-700">
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
