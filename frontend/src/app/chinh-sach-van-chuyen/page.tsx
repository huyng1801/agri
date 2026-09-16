import { PublicPolicyBody } from '@/components/public-policy-body';
import { PublicStaticPage } from '@/components/public-static-page';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { buildPolicyContactSection } from '@/lib/policy-contact';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  return buildPublicMetadata({
    title: 'Chính sách vận chuyển',
    description: `Phạm vi hỗ trợ kết nối, tiếp nhận thông tin giao nhận và xử lý phản ánh liên quan đến sản phẩm trên ${siteProfile.appName}.`,
    path: '/chinh-sach-van-chuyen'
  });
}

export default async function ShippingPolicyPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const platformName = siteProfile.appName;
  const sections = [
    {
      title: '1. Phạm vi chính sách',
      paragraphs: [
        `Chính sách này mô tả cách ${platformName} tiếp nhận thông tin giao nhận và hỗ trợ kết nối giữa người mua với hợp tác xã hoặc đơn vị sản xuất đang công khai sản phẩm.`,
        `${platformName} không tự động xác nhận đơn hàng, thu tiền hoặc trực tiếp vận chuyển nếu trên hồ sơ sản phẩm không có thông tin dịch vụ tương ứng.`
      ]
    },
    {
      title: '2. Thông tin giao nhận',
      paragraphs: ['Thông tin về khu vực giao hàng, thời gian dự kiến, phí vận chuyển và phương thức nhận hàng do đơn vị cung cấp sản phẩm trao đổi trực tiếp với người mua trước khi xác nhận giao dịch.'],
      bullets: [
        'Người mua nên cung cấp đúng họ tên, số điện thoại và địa chỉ nhận hàng.',
        'Đơn vị cung cấp sản phẩm cần thông báo rõ phạm vi giao nhận, chi phí và thời gian dự kiến.',
        'Mọi thay đổi về lịch giao hoặc địa chỉ cần được hai bên xác nhận lại qua kênh liên hệ phù hợp.'
      ]
    },
    {
      title: '3. Trách nhiệm của đơn vị cung cấp sản phẩm',
      bullets: [
        'Đóng gói phù hợp với đặc tính của nông sản và điều kiện vận chuyển.',
        'Cung cấp thông tin trung thực về tình trạng sản phẩm, số lượng và thời gian có thể giao.',
        'Chủ động thông báo khi có sự cố làm chậm, đổi hoặc hủy lịch giao nhận.',
        'Phối hợp xử lý phản ánh liên quan đến sản phẩm và việc bàn giao.'
      ]
    },
    {
      title: '4. Trách nhiệm của người mua',
      bullets: [
        'Kiểm tra thông tin sản phẩm và điều kiện giao nhận trước khi đồng ý mua.',
        'Bảo đảm có thể nhận hàng theo thời gian đã thống nhất.',
        'Kiểm tra tình trạng kiện hàng khi nhận và liên hệ sớm nếu có bất thường.',
        'Không sử dụng thông tin liên hệ của đơn vị cung cấp cho mục đích ngoài giao dịch hợp pháp.'
      ]
    },
    {
      title: '5. Giao hàng không thành công hoặc có phát sinh',
      paragraphs: ['Khi giao hàng không thành công, hai bên nên chủ động thống nhất phương án giao lại, thay đổi địa chỉ hoặc hoàn trả. Với phản ánh cần hỗ trợ, người dùng có thể gửi thông tin cho đội vận hành để được tiếp nhận và hướng dẫn thêm.'],
      bullets: [
        'Mô tả rõ mã sản phẩm, thời điểm giao nhận và nội dung cần hỗ trợ.',
        'Đính kèm hình ảnh hoặc bằng chứng liên quan nếu có.',
        'Không gửi thông tin nhạy cảm không cần thiết qua kênh công khai.'
      ]
    },
    {
      title: '6. Cập nhật chính sách',
      paragraphs: [`${platformName} có thể cập nhật chính sách này khi mô hình kết nối, phạm vi hỗ trợ hoặc quy định liên quan thay đổi. Nội dung mới có hiệu lực từ thời điểm được công bố trên website.`]
    },
    buildPolicyContactSection(siteProfile, `Mọi thắc mắc hoặc yêu cầu hỗ trợ liên quan đến giao nhận, vui lòng liên hệ ${platformName} qua các kênh dưới đây.`, siteKey)
  ];

  return (
    <PublicStaticPage title="Chính sách vận chuyển" description={`Phạm vi hỗ trợ kết nối và xử lý thông tin giao nhận sản phẩm trên ${platformName}.`}>
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
