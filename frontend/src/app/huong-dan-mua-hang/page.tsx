import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicStaticPage } from '@/components/public-static-page';
import { PublicGuideSteps } from '@/components/public-policy-body';
import { Panel } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Hướng dẫn mua hàng | HTXONLINE',
  description: 'Hướng dẫn tìm sản phẩm, thêm giỏ hàng, đặt hàng COD và tra cứu đơn hàng trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/huong-dan-mua-hang' }
};

const steps = [
  {
    title: 'Tìm sản phẩm hoặc HTX',
    description: 'Dùng thanh tìm kiếm trên trang chủ, vào mục Sản phẩm hoặc HTX để lọc theo tỉnh thành, giá và sản phẩm có QR Passport.'
  },
  {
    title: 'Xem chi tiết và QR Passport',
    description: 'Mở trang sản phẩm để xem mô tả, vùng trồng, chứng nhận public và quét QR Passport khi cần kiểm tra nguồn gốc.'
  },
  {
    title: 'Thêm vào giỏ hàng',
    description: 'Chọn số lượng phù hợp và thêm sản phẩm vào giỏ. Bạn có thể đặt nhiều sản phẩm từ nhiều HTX trong cùng một lần checkout.'
  },
  {
    title: 'Đặt hàng COD',
    description: 'Điền họ tên, số điện thoại và địa chỉ giao hàng tại trang Thanh toán. HTX hoặc đội vận hành sẽ gọi xác nhận trước khi giao.'
  },
  {
    title: 'Tra cứu đơn hàng',
    description: 'Sau khi đặt hàng, dùng mã đơn và số điện thoại tại trang Tra cứu đơn hàng để theo dõi trạng thái xử lý.'
  }
];

export default function BuyingGuidePage() {
  return (
    <PublicStaticPage title="Hướng dẫn mua hàng" description="Tìm sản phẩm, thêm vào giỏ hàng, đặt hàng COD và tra cứu trạng thái đơn hàng trên HTXONLINE.">
      <div className="space-y-4">
        <PublicGuideSteps steps={steps} />
        <Panel className="text-sm leading-7 text-slate-700">
          <p>
            Cần hỗ trợ thêm? Xem{' '}
            <Link href="/chinh-sach-van-chuyen" className="font-semibold text-leaf">
              chính sách vận chuyển
            </Link>{' '}
            hoặc{' '}
            <Link href="/lien-he" className="font-semibold text-leaf">
              liên hệ đội vận hành
            </Link>
            .
          </p>
        </Panel>
      </div>
    </PublicStaticPage>
  );
}
