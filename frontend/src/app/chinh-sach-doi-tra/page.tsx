import type { Metadata } from 'next';
import { PublicStaticPage } from '@/components/public-static-page';
import { PublicPolicyBody } from '@/components/public-policy-body';

export const metadata: Metadata = {
  title: 'Chính sách đổi trả | HTXONLINE',
  description: 'Điều kiện đổi trả và hỗ trợ đơn hàng nông sản trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/chinh-sach-doi-tra' }
};

const sections = [
  {
    title: 'Điều kiện đổi trả',
    paragraphs: [
      'Sản phẩm nông sản tươi sống có thể được xem xét đổi trả hoặc hỗ trợ khi hàng giao không đúng mô tả, hư hỏng do vận chuyển hoặc sai số lượng so với đơn đặt.',
      'Người mua nên phản ánh trong vòng 24 giờ kể từ khi nhận hàng và cung cấp hình ảnh, mã đơn hàng để HTX xử lý.'
    ]
  },
  {
    title: 'Trường hợp không áp dụng',
    paragraphs: [
      'Các sản phẩm đã qua chế biến, sử dụng hoặc bảo quản không đúng hướng dẫn có thể không được hỗ trợ đổi trả.',
      'Mỗi HTX có thể có quy định chi tiết hơn tùy đặc thù sản phẩm; thông tin sẽ được xác nhận khi HTX liên hệ sau đặt hàng.'
    ]
  }
];

export default function ReturnPolicyPage() {
  return (
    <PublicStaticPage title="Chính sách đổi trả" description="Nguyên tắc hỗ trợ đổi trả và khiếu nại sản phẩm trên HTXONLINE.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
