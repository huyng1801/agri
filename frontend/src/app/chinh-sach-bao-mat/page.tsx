import { PublicStaticPage } from '@/components/public-static-page';
import { PublicPolicyBody } from '@/components/public-policy-body';

const sections = [
  {
    title: 'Dữ liệu thu thập',
    paragraphs: [
      'HTXONLINE có thể thu thập họ tên, số điện thoại, email, địa chỉ giao hàng và nội dung liên hệ khi bạn đặt hàng COD hoặc gửi form hỗ trợ.',
      'Hệ thống cũng ghi nhận dữ liệu kỹ thuật cơ bản như thời gian truy cập, trình duyệt và trang đã xem để vận hành an toàn.'
    ]
  },
  {
    title: 'Mục đích sử dụng',
    paragraphs: [
      'Dữ liệu được dùng để xử lý đơn hàng, liên hệ xác nhận, hỗ trợ khách hàng, cải thiện trải nghiệm sử dụng và bảo vệ hệ thống khỏi hành vi lạm dụng.',
      'HTXONLINE không bán dữ liệu cá nhân cho bên thứ ba.'
    ]
  },
  {
    title: 'Bảo mật',
    paragraphs: [
      'Chúng tôi áp dụng các biện pháp kỹ thuật và quy trình vận hành phù hợp để bảo vệ dữ liệu người dùng.',
      'Nếu bạn muốn cập nhật hoặc yêu cầu hỗ trợ liên quan dữ liệu cá nhân, vui lòng liên hệ qua trang Liên hệ.'
    ]
  }
];

export default function PrivacyPolicyPage() {
  return (
    <PublicStaticPage title="Chính sách bảo mật" description="Cách HTXONLINE thu thập, sử dụng và bảo vệ thông tin người dùng.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
