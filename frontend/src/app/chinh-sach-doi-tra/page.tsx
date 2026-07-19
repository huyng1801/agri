import type { Metadata } from 'next';
import { PublicPolicyBody } from '@/components/public-policy-body';
import { PublicStaticPage } from '@/components/public-static-page';
import { buildPolicyContactSection } from '@/lib/policy-contact';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Chính sách đổi trả | HTXONLINE',
  description: 'Điều kiện đổi trả, trách nhiệm xử lý và quy trình hỗ trợ đơn hàng trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/chinh-sach-doi-tra' }
};

export default async function ReturnPolicyPage() {
  const siteProfile = await getPublicSiteProfile();
  const sections = [
    {
      title: '1. Mục đích',
      paragraphs: [
        'HTXONLINE là nền tảng kết nối giữa các hợp tác xã và người mua thông qua hệ thống trưng bày sản phẩm, QR Passport truy xuất nguồn gốc và quy trình đặt hàng COD.',
        'Chính sách đổi trả này quy định quyền và trách nhiệm của người mua, HTX và HTXONLINE trong quá trình xử lý các yêu cầu đổi trả hàng hóa.'
      ]
    },
    {
      title: '2. Phạm vi áp dụng',
      bullets: [
        'Người mua đặt hàng thông qua HTXONLINE.',
        'Các hợp tác xã đang kinh doanh trên nền tảng.',
        'Các đơn hàng được tạo trên hệ thống HTXONLINE.'
      ]
    },
    {
      title: '3. Điều kiện đổi trả',
      paragraphs: ['Người mua có thể yêu cầu đổi hoặc trả hàng trong các trường hợp sau:'],
      bullets: [
        'Sản phẩm giao không đúng chủng loại, số lượng hoặc quy cách đã đặt.',
        'Sản phẩm bị hư hỏng trong quá trình vận chuyển.',
        'Sản phẩm hết hạn sử dụng nếu có.',
        'Sản phẩm có dấu hiệu hư hỏng, nấm mốc hoặc không đảm bảo chất lượng khi nhận.',
        'Sản phẩm không đúng thông tin đã công bố trên HTXONLINE.',
        'Yêu cầu đổi trả được gửi trong vòng 48 giờ kể từ khi nhận hàng hoặc theo quy định riêng của từng HTX.'
      ]
    },
    {
      title: '4. Trường hợp không áp dụng đổi trả',
      paragraphs: ['HTX có quyền từ chối đổi trả nếu yêu cầu không đáp ứng điều kiện xử lý.'],
      bullets: [
        'Người mua thay đổi nhu cầu sử dụng sau khi đã nhận hàng.',
        'Sản phẩm bị hư hỏng do lỗi của người mua.',
        'Người mua không cung cấp được bằng chứng về tình trạng sản phẩm.',
        'Quá thời hạn tiếp nhận yêu cầu đổi trả.',
        'Sản phẩm thuộc nhóm hàng không được đổi trả theo quy định pháp luật hoặc theo chính sách riêng của HTX.'
      ]
    },
    {
      title: '5. Quy trình đổi trả',
      paragraphs: ['Quy trình xử lý đổi trả được thực hiện theo các bước sau để đảm bảo có đủ thông tin đối chiếu.'],
      bullets: [
        'Bước 1: Người mua gửi yêu cầu thông qua HTXONLINE hoặc liên hệ trực tiếp với HTX.',
        'Bước 2: Cung cấp mã đơn hàng, hình ảnh hoặc video và mô tả tình trạng sản phẩm.',
        'Bước 3: HTX kiểm tra và phản hồi trong thời gian sớm nhất.',
        'Bước 4: Nếu đủ điều kiện, HTX có thể đổi sản phẩm mới, hoàn tiền hoặc áp dụng phương án khác theo thỏa thuận.'
      ]
    },
    {
      title: '6. Trách nhiệm của HTXONLINE',
      paragraphs: [
        'HTXONLINE hỗ trợ tiếp nhận yêu cầu, kết nối giữa người mua và HTX, đồng thời hỗ trợ theo dõi quá trình xử lý.',
        'HTXONLINE không trực tiếp sản xuất, kinh doanh hoặc sở hữu hàng hóa, do đó quyết định đổi trả thuộc trách nhiệm của HTX bán hàng theo quy định của pháp luật và chính sách riêng của HTX.'
      ]
    },
    buildPolicyContactSection(siteProfile, 'Mọi thắc mắc về đổi trả, vui lòng liên hệ HTX hoặc bộ phận hỗ trợ của HTXONLINE qua các kênh dưới đây.')
  ];

  return (
    <PublicStaticPage title="Chính sách đổi trả" description="Điều kiện đổi trả, trách nhiệm xử lý và quy trình hỗ trợ đơn hàng trên HTXONLINE.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
