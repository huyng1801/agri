import type { Metadata } from 'next';
import { PublicStaticPage } from '@/components/public-static-page';
import { PublicPolicyBody } from '@/components/public-policy-body';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng | HTXONLINE',
  description: 'Điều khoản sử dụng website HTXONLINE, đặt hàng COD và truy cập QR Passport.',
  alternates: { canonical: 'https://htxonline.vn/dieu-khoan-su-dung' }
};

const sections = [
  {
    title: 'Phạm vi áp dụng',
    paragraphs: [
      'Điều khoản này điều chỉnh việc sử dụng website HTXONLINE, bao gồm xem sản phẩm, đặt hàng COD, tra cứu đơn hàng và truy cập QR Passport public.',
      'Khi tiếp tục sử dụng nền tảng, bạn đồng ý tuân thủ các quy định dưới đây.'
    ]
  },
  {
    title: 'Quyền và trách nhiệm người mua',
    paragraphs: [
      'Người mua cung cấp thông tin liên hệ chính xác khi đặt hàng COD để HTX có thể xác nhận và giao hàng.',
      'Người mua không được lợi dụng nền tảng để phát tán thông tin sai lệch, spam hoặc gây ảnh hưởng đến hoạt động của HTX và người dùng khác.'
    ]
  },
  {
    title: 'Vai trò của HTXONLINE',
    paragraphs: [
      'HTXONLINE là nền tảng kết nối người mua với hợp tác xã. Trách nhiệm chất lượng sản phẩm, giao hàng và chăm sóc sau bán thuộc về HTX cung cấp sản phẩm, trừ khi có thỏa thuận khác.',
      'Đội vận hành có quyền tạm ẩn nội dung vi phạm, xử lý khiếu nại và cập nhật quy trình vận hành để bảo vệ người mua và HTX.'
    ]
  }
];

export default function TermsPage() {
  return (
    <PublicStaticPage title="Điều khoản sử dụng" description="Quy định sử dụng sàn HTXONLINE dành cho người mua và khách truy cập.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
