import type { Metadata } from 'next';
import { PublicPolicyBody } from '@/components/public-policy-body';
import { PublicStaticPage } from '@/components/public-static-page';
import { buildPolicyContactSection } from '@/lib/policy-contact';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Chính sách vận hành | HTXONLINE',
  description: 'Nguyên tắc vận hành nền tảng HTXONLINE dành cho hợp tác xã, người mua và đối tác liên quan.',
  alternates: { canonical: 'https://htxonline.vn/chinh-sach-van-hanh' }
};

export default async function OperationsPolicyPage() {
  const siteProfile = await getPublicSiteProfile();
  const sections = [
    {
      title: '1. Mục đích',
      paragraphs: ['Chính sách này quy định nguyên tắc vận hành nền tảng HTXONLINE nhằm đảm bảo môi trường giao dịch minh bạch, an toàn và hiệu quả giữa hợp tác xã và người mua.']
    },
    {
      title: '2. Đối tượng áp dụng',
      bullets: ['Hợp tác xã.', 'Doanh nghiệp.', 'Người mua.', 'Đối tác vận chuyển.', 'Người truy cập website.']
    },
    {
      title: '3. Nguyên tắc hoạt động',
      paragraphs: ['HTXONLINE hoạt động theo các nguyên tắc sau để giữ trải nghiệm mua bán rõ ràng và đáng tin cậy cho cả hai phía.'],
      bullets: ['Minh bạch thông tin.', 'Truy xuất nguồn gốc thông qua QR Passport.', 'Công khai thông tin sản phẩm.', 'Tuân thủ quy định pháp luật.', 'Bảo vệ quyền lợi của người mua và HTX.']
    },
    {
      title: '4. Trách nhiệm của HTX',
      bullets: [
        'Cung cấp thông tin chính xác.',
        'Đăng tải hình ảnh đúng thực tế.',
        'Công khai giá bán.',
        'Cập nhật tồn kho khi cần.',
        'Chịu trách nhiệm về chất lượng sản phẩm.',
        'Chịu trách nhiệm về nguồn gốc hàng hóa.',
        'Phối hợp xử lý khiếu nại.'
      ]
    },
    {
      title: '5. Trách nhiệm của người mua',
      bullets: [
        'Cung cấp đúng thông tin nhận hàng.',
        'Kiểm tra hàng khi nhận.',
        'Thanh toán đúng quy định.',
        'Không lợi dụng chính sách đổi trả.',
        'Không sử dụng nền tảng cho mục đích vi phạm pháp luật.'
      ]
    },
    {
      title: '6. Trách nhiệm của HTXONLINE',
      bullets: [
        'Vận hành ổn định nền tảng.',
        'Duy trì hệ thống QR Passport.',
        'Bảo mật dữ liệu người dùng.',
        'Hỗ trợ kỹ thuật.',
        'Tiếp nhận phản ánh.',
        'Kiểm tra và xử lý các tài khoản vi phạm.'
      ]
    },
    {
      title: '7. Quản lý nội dung',
      paragraphs: ['Các HTX không được đăng tải những nội dung sau lên nền tảng:'],
      bullets: [
        'Thông tin sai sự thật.',
        'Hàng hóa bị cấm kinh doanh.',
        'Hàng giả, hàng nhái.',
        'Nội dung vi phạm quyền sở hữu trí tuệ.',
        'Nội dung trái pháp luật.',
        'HTXONLINE có quyền từ chối hiển thị, chỉnh sửa, tạm khóa, xóa sản phẩm hoặc khóa tài khoản nếu phát hiện vi phạm.'
      ]
    },
    {
      title: '8. Đặt hàng và giao nhận',
      paragraphs: [
        'Đơn hàng được xác nhận theo quy trình của HTX.',
        'Thời gian giao hàng phụ thuộc vào HTX và đơn vị vận chuyển.',
        'HTXONLINE hỗ trợ quản lý quy trình đặt hàng nhưng không trực tiếp thực hiện việc vận chuyển, trừ khi có thỏa thuận khác.'
      ]
    },
    {
      title: '9. Giải quyết khiếu nại',
      paragraphs: ['Khi phát sinh tranh chấp, các bên được khuyến nghị xử lý theo trình tự ưu tiên để rút ngắn thời gian phản hồi.'],
      bullets: [
        'Người mua liên hệ HTX trước.',
        'Nếu chưa được giải quyết, có thể gửi phản ánh đến HTXONLINE.',
        'HTXONLINE đóng vai trò hỗ trợ hòa giải và phối hợp giữa các bên.',
        'Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết theo quy định của pháp luật Việt Nam.'
      ]
    },
    {
      title: '10. Điều khoản chung',
      paragraphs: [
        'HTXONLINE có quyền cập nhật Chính sách vận hành khi cần thiết để phù hợp với hoạt động thực tế và quy định pháp luật.',
        'Việc tiếp tục sử dụng nền tảng sau khi chính sách được cập nhật đồng nghĩa với việc người dùng đồng ý với các nội dung sửa đổi.'
      ]
    },
    buildPolicyContactSection(siteProfile, 'Mọi thắc mắc hoặc yêu cầu liên quan đến Chính sách vận hành, vui lòng liên hệ HTXONLINE qua các kênh dưới đây.')
  ];

  return (
    <PublicStaticPage title="Chính sách vận hành" description="Nguyên tắc vận hành nền tảng HTXONLINE dành cho hợp tác xã, người mua và đối tác liên quan.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
