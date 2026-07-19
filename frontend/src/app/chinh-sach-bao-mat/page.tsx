import type { Metadata } from 'next';
import { PublicPolicyBody } from '@/components/public-policy-body';
import { PublicStaticPage } from '@/components/public-static-page';
import { buildPolicyContactSection } from '@/lib/policy-contact';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | HTXONLINE',
  description: 'Cách HTXONLINE thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của người dùng.',
  alternates: { canonical: 'https://htxonline.vn/chinh-sach-bao-mat' }
};

export default async function PrivacyPolicyPage() {
  const siteProfile = await getPublicSiteProfile();
  const sections = [
    {
      title: '1. Mục đích và phạm vi thu thập thông tin',
      paragraphs: [
        'HTXONLINE thu thập thông tin để cung cấp và vận hành nền tảng số dành cho hợp tác xã, quản lý tài khoản, hiển thị sản phẩm, vùng trồng, QR Passport truy xuất nguồn gốc, hỗ trợ đặt hàng COD và cải thiện chất lượng dịch vụ.',
        'Việc thu thập và xử lý dữ liệu được thực hiện theo quy định của pháp luật Việt Nam, bao gồm Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, Luật An ninh mạng năm 2018 và các quy định liên quan.'
      ],
      bullets: [
        'Họ và tên, số điện thoại, địa chỉ email, địa chỉ liên hệ.',
        'Tên hợp tác xã hoặc doanh nghiệp, mã số thuế, thông tin người đại diện.',
        'Thông tin sản phẩm, vùng trồng, dữ liệu QR Passport và dữ liệu đơn hàng.',
        'Hình ảnh, video, giấy chứng nhận và tài liệu do người dùng cung cấp.',
        'Địa chỉ IP, thiết bị truy cập, trình duyệt, cookie và nhật ký truy cập.'
      ]
    },
    {
      title: '2. Cách thức thu thập thông tin',
      paragraphs: ['HTXONLINE thu thập dữ liệu qua cả hành vi chủ động của người dùng và dữ liệu kỹ thuật phát sinh trong quá trình sử dụng website.'],
      bullets: [
        'Thông tin do người dùng cung cấp khi đăng ký tài khoản, điền biểu mẫu liên hệ, đăng ký hợp tác xã, khai báo sản phẩm, cập nhật vùng trồng, tạo QR Passport, đặt hàng hoặc liên hệ hỗ trợ.',
        'Thông tin hệ thống thu thập tự động như địa chỉ IP, cookie, loại thiết bị, trình duyệt, hệ điều hành, thời gian sử dụng, các trang đã truy cập và thông tin tương tác với hệ thống.'
      ]
    },
    {
      title: '3. Mục đích sử dụng thông tin',
      bullets: [
        'Quản lý tài khoản người dùng và xác minh thông tin hợp tác xã.',
        'Quản lý sản phẩm, vùng trồng và vận hành QR Passport truy xuất nguồn gốc.',
        'Hỗ trợ đặt hàng COD và chăm sóc khách hàng.',
        'Gửi thông báo về hệ thống, phân tích chất lượng dịch vụ và cải thiện trải nghiệm sử dụng.',
        'Phát hiện, ngăn chặn gian lận hoặc truy cập trái phép và thực hiện nghĩa vụ theo quy định pháp luật.'
      ]
    },
    {
      title: '4. Chia sẻ và tiết lộ thông tin',
      paragraphs: ['HTXONLINE cam kết không bán hoặc trao đổi dữ liệu cá nhân vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp thật sự cần thiết.'],
      bullets: [
        'Có sự đồng ý của người dùng.',
        'Theo yêu cầu của cơ quan nhà nước có thẩm quyền.',
        'Với đối tác cung cấp dịch vụ kỹ thuật, lưu trữ dữ liệu hoặc vận hành hệ thống trong phạm vi cần thiết.',
        'Để bảo vệ quyền và lợi ích hợp pháp của HTXONLINE hoặc người dùng theo quy định pháp luật.',
        'Trong trường hợp sáp nhập, chuyển nhượng hoặc tái cơ cấu doanh nghiệp theo quy định pháp luật.'
      ]
    },
    {
      title: '5. Bảo mật và lưu trữ thông tin',
      paragraphs: [
        'HTXONLINE áp dụng nhiều biện pháp kỹ thuật và tổ chức nhằm bảo vệ dữ liệu cá nhân, bao gồm mã hóa dữ liệu khi truyền tải, kiểm soát quyền truy cập, sao lưu định kỳ, giám sát an toàn hệ thống và các biện pháp chống truy cập trái phép.',
        'Thông tin được lưu trữ trên hệ thống máy chủ an toàn hoặc các nhà cung cấp dịch vụ đáp ứng yêu cầu bảo mật. Dù vậy, không có hệ thống nào có thể đảm bảo an toàn tuyệt đối và người dùng vẫn cần tự bảo mật tài khoản, mật khẩu của mình.'
      ]
    },
    {
      title: '6. Quyền và nghĩa vụ của người dùng',
      paragraphs: ['Người dùng có quyền kiểm soát dữ liệu cá nhân của mình đồng thời phải bảo đảm tính chính xác của thông tin đã cung cấp.'],
      bullets: [
        'Truy cập, chỉnh sửa, cập nhật hoặc yêu cầu xóa dữ liệu trong các trường hợp pháp luật cho phép.',
        'Rút lại sự đồng ý đối với việc xử lý dữ liệu cá nhân hoặc khiếu nại nếu cho rằng quyền lợi của mình bị ảnh hưởng.',
        'Cung cấp thông tin trung thực, cập nhật khi có thay đổi và bảo mật tài khoản, mật khẩu.',
        'Không cung cấp thông tin giả mạo hoặc vi phạm quyền của bên thứ ba.'
      ]
    },
    {
      title: '7. Thời gian lưu trữ thông tin',
      paragraphs: [
        'Thông tin cá nhân được lưu trữ trong suốt thời gian người dùng sử dụng dịch vụ, theo thời hạn quy định trong hợp đồng nếu có, hoặc theo yêu cầu của pháp luật về kế toán, thuế và các quy định liên quan.',
        'Khi mục đích thu thập không còn hoặc người dùng có yêu cầu hợp lệ, dữ liệu sẽ được xóa hoặc ẩn danh theo quy định.'
      ]
    },
    {
      title: '8. Thay đổi chính sách bảo mật',
      paragraphs: [
        'HTXONLINE có quyền sửa đổi hoặc cập nhật Chính sách bảo mật để phù hợp với hoạt động của nền tảng hoặc thay đổi pháp lý.',
        'Mọi thay đổi sẽ được công bố trên website và có hiệu lực từ thời điểm đăng tải. Việc tiếp tục sử dụng dịch vụ sau khi cập nhật đồng nghĩa với việc người dùng chấp nhận nội dung sửa đổi.'
      ]
    },
    buildPolicyContactSection(siteProfile, 'Mọi thắc mắc hoặc yêu cầu liên quan đến Chính sách bảo mật, vui lòng liên hệ HTXONLINE qua các kênh dưới đây.')
  ];

  return (
    <PublicStaticPage title="Chính sách bảo mật" description="Cách HTXONLINE thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của người dùng.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
