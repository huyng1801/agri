import type { Metadata } from 'next';
import { PublicPolicyBody } from '@/components/public-policy-body';
import { PublicStaticPage } from '@/components/public-static-page';
import { buildPolicyContactSection } from '@/lib/policy-contact';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng | HTXONLINE',
  description: 'Quy định sử dụng nền tảng HTXONLINE dành cho hợp tác xã, khách hàng và người truy cập.',
  alternates: { canonical: 'https://htxonline.vn/dieu-khoan-su-dung' }
};

export default async function TermsPage() {
  const siteProfile = await getPublicSiteProfile();
  const sections = [
    {
      title: '1. Giới thiệu và phạm vi áp dụng',
      paragraphs: [
        'HTXONLINE là nền tảng số hỗ trợ các hợp tác xã và đơn vị sản xuất đưa sản phẩm lên môi trường trực tuyến, công khai thông tin sản phẩm, truy xuất nguồn gốc thông qua QR Passport, quản lý dữ liệu sản phẩm và hỗ trợ quy trình đặt hàng COD.',
        'Điều khoản sử dụng này áp dụng đối với tất cả cá nhân, tổ chức, hợp tác xã, khách hàng, đối tác và người truy cập website HTXONLINE. Việc truy cập hoặc sử dụng nền tảng đồng nghĩa với việc người dùng đã đọc, hiểu và đồng ý tuân thủ toàn bộ điều khoản dưới đây.'
      ]
    },
    {
      title: '2. Quyền và nghĩa vụ của người dùng',
      paragraphs: ['Người dùng có quyền sử dụng các chức năng của HTXONLINE theo đúng phạm vi được cấp và đồng thời phải chịu trách nhiệm với toàn bộ nội dung mình cung cấp lên hệ thống.'],
      bullets: [
        'Truy cập, sử dụng, đăng tải và quản lý thông tin sản phẩm, vùng trồng, thông tin HTX theo quy định của nền tảng.',
        'Sử dụng các tính năng QR Passport, truy xuất nguồn gốc và đặt hàng COD nếu được kích hoạt.',
        'Được hỗ trợ kỹ thuật và yêu cầu cập nhật thông tin tài khoản theo quy định.',
        'Cung cấp thông tin chính xác, đầy đủ và cập nhật.',
        'Không đăng tải thông tin sai sự thật, vi phạm pháp luật, phát tán mã độc hoặc xâm phạm quyền sở hữu trí tuệ của bên thứ ba.',
        'Bảo mật tài khoản, mật khẩu đăng nhập và thực hiện đầy đủ các nghĩa vụ thanh toán nếu có.'
      ]
    },
    {
      title: '3. Quyền và nghĩa vụ của HTXONLINE',
      bullets: [
        'Cập nhật, nâng cấp hoặc thay đổi các tính năng của nền tảng nhằm cải thiện chất lượng dịch vụ.',
        'Tạm ngừng hoặc chấm dứt quyền sử dụng nếu phát hiện hành vi vi phạm điều khoản hoặc quy định pháp luật.',
        'Kiểm tra, rà soát, yêu cầu chỉnh sửa hoặc gỡ bỏ sản phẩm, nội dung có dấu hiệu giả mạo, sai sự thật hoặc vi phạm pháp luật.',
        'Thu phí dịch vụ theo chính sách công bố hoặc theo hợp đồng đã ký kết nếu có.',
        'Cam kết cung cấp nền tảng đúng chức năng đã công bố, bảo mật dữ liệu theo quy định pháp luật và hỗ trợ người dùng trong quá trình sử dụng.'
      ]
    },
    {
      title: '4. Quyền sở hữu trí tuệ',
      paragraphs: [
        'Toàn bộ giao diện, thiết kế, logo, biểu tượng, mã nguồn, cơ sở dữ liệu, tài liệu hướng dẫn và các nội dung thuộc website HTXONLINE thuộc quyền sở hữu của HTXONLINE hoặc các bên cấp phép hợp pháp.',
        'Người dùng vẫn giữ quyền sở hữu đối với các thông tin, hình ảnh và dữ liệu do mình đăng tải nhưng đồng ý cho HTXONLINE quyền hiển thị, lưu trữ và sử dụng các nội dung này nhằm phục vụ việc vận hành hệ thống.'
      ],
      bullets: ['Người dùng không được sao chép, chỉnh sửa, phân phối hoặc khai thác thương mại bất kỳ nội dung nào thuộc HTXONLINE nếu chưa có sự đồng ý bằng văn bản.']
    },
    {
      title: '5. Giới hạn trách nhiệm',
      paragraphs: ['HTXONLINE không đảm bảo hệ thống sẽ hoạt động liên tục hoặc hoàn toàn không xảy ra lỗi kỹ thuật và không chịu trách nhiệm đối với một số rủi ro nằm ngoài phạm vi kiểm soát trực tiếp.'],
      bullets: [
        'Thiệt hại phát sinh từ việc người dùng sử dụng sai mục đích.',
        'Thông tin do HTX hoặc người bán tự đăng tải.',
        'Sai lệch về chất lượng sản phẩm thực tế so với nội dung do đơn vị bán cung cấp.',
        'Thiệt hại phát sinh từ sự cố Internet, thiên tai, tấn công mạng hoặc các sự kiện bất khả kháng.',
        'Các giao dịch giữa người mua và HTX ngoài phạm vi hỗ trợ của nền tảng.',
        'Trách nhiệm bồi thường tối đa của HTXONLINE, nếu có, sẽ không vượt quá tổng giá trị phí dịch vụ mà khách hàng đã thanh toán trong vòng 03 tháng gần nhất trước thời điểm phát sinh khiếu nại.'
      ]
    },
    {
      title: '6. Bảo mật và thông tin cá nhân',
      paragraphs: [
        'HTXONLINE cam kết bảo vệ thông tin cá nhân của người dùng theo quy định pháp luật Việt Nam.',
        'Thông tin có thể được thu thập bao gồm họ tên, số điện thoại, email, thông tin HTX, thông tin sản phẩm, dữ liệu vùng trồng, dữ liệu truy xuất nguồn gốc và dữ liệu đơn hàng.',
        'Dữ liệu được sử dụng để vận hành nền tảng, hỗ trợ khách hàng, cải thiện chất lượng dịch vụ và thực hiện các nghĩa vụ theo quy định pháp luật.'
      ],
      bullets: ['HTXONLINE không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba, trừ trường hợp có sự đồng ý của người dùng, theo yêu cầu của cơ quan nhà nước có thẩm quyền hoặc theo quy định của pháp luật.']
    },
    {
      title: '7. Luật áp dụng và giải quyết tranh chấp',
      paragraphs: [
        'Điều khoản sử dụng này được điều chỉnh theo pháp luật Việt Nam.',
        'Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng. Nếu sau 30 ngày các bên không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại Việt Nam theo quy định của pháp luật.'
      ]
    },
    buildPolicyContactSection(siteProfile, 'Mọi thắc mắc liên quan đến Điều khoản sử dụng, vui lòng liên hệ HTXONLINE qua các kênh dưới đây.')
  ];

  return (
    <PublicStaticPage title="Điều khoản sử dụng" description="Quy định sử dụng nền tảng HTXONLINE dành cho hợp tác xã, khách hàng và người truy cập.">
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
