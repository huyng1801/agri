import type { Metadata } from 'next';
import { PublicStaticPage } from '@/components/public-static-page';
import { PublicPolicyBody } from '@/components/public-policy-body';

export const metadata: Metadata = {
  title: 'Chính sách vận chuyển | HTXONLINE',
  description: 'Chính sách giao hàng COD và phạm vi vận chuyển trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/chinh-sach-van-chuyen' }
};

const sections = [
  {
    title: 'Phạm vi giao hàng',
    paragraphs: [
      'HTXONLINE hỗ trợ đặt hàng COD trên phạm vi Việt Nam. Thời gian và chi phí giao hàng phụ thuộc vào HTX cung cấp sản phẩm và khu vực nhận hàng.',
      'Sau khi đặt hàng, HTX hoặc đội vận hành sẽ gọi điện xác nhận trước khi giao.'
    ]
  },
  {
    title: 'Thời gian xử lý',
    paragraphs: [
      'Đơn hàng mới thường được xác nhận trong ngày làm việc. Thời gian giao dự kiến sẽ được thông báo khi xác nhận, đặc biệt với nông sản tươi và đặc sản theo mùa.',
      'Bạn có thể tra cứu trạng thái đơn bằng mã đơn và số điện thoại tại trang Tra cứu đơn hàng.'
    ]
  },
  {
    title: 'Phí vận chuyển',
    paragraphs: [
      'Phí vận chuyển có thể được tính theo khu vực, khối lượng hoặc chính sách riêng của từng HTX.',
      'Nếu chưa có phí cố định trên website, nhân viên sẽ thông báo khi gọi xác nhận đơn COD.'
    ]
  }
];

export default function ShippingPolicyPage() {
  return (
    <PublicStaticPage title="Chính sách vận chuyển" description="Quy trình giao hàng COD và thời gian xử lý đơn trên HTXONLINE.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
