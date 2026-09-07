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
    title: 'Chính sách vận hành',
    description: `Nguyên tắc vận hành nền tảng ${siteProfile.appName} dành cho hợp tác xã, đối tác và người truy cập.`,
    path: '/chinh-sach-van-hanh'
  });
}

export default async function OperationsPolicyPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const platformName = siteProfile.appName;
  const sections = [
    {
      title: '1. Mục đích',
      paragraphs: [`Chính sách này quy định nguyên tắc vận hành nền tảng ${platformName}, nhằm tạo môi trường công khai dữ liệu nông nghiệp rõ ràng, an toàn và có trách nhiệm.`]
    },
    {
      title: '2. Đối tượng áp dụng',
      bullets: ['Hợp tác xã và đơn vị sản xuất.', 'Doanh nghiệp và đối tác liên quan.', 'Người dùng tra cứu thông tin.', 'Người truy cập website.']
    },
    {
      title: '3. Nguyên tắc hoạt động',
      paragraphs: [`${platformName} hoạt động theo các nguyên tắc sau để người dùng hiểu đúng dữ liệu và nguồn gốc sản phẩm.`],
      bullets: ['Minh bạch phạm vi thông tin.', 'Chỉ công khai dữ liệu đã được đối chiếu theo quy trình.', 'Hỗ trợ truy xuất qua QR khi hồ sơ đã được kích hoạt.', 'Tôn trọng quyền riêng tư và quyền sở hữu nội dung.', 'Tuân thủ quy định pháp luật Việt Nam.']
    },
    {
      title: '4. Trách nhiệm của đơn vị cung cấp dữ liệu',
      bullets: ['Cung cấp thông tin chính xác và có căn cứ.', 'Đăng tải hình ảnh, chứng nhận và tài liệu đúng thực tế.', 'Cập nhật khi dữ liệu thay đổi.', 'Chịu trách nhiệm về nội dung và nguồn gốc do mình cung cấp.', 'Phối hợp xử lý phản ánh liên quan đến hồ sơ.']
    },
    {
      title: '5. Trách nhiệm của người dùng',
      bullets: ['Sử dụng thông tin đúng mục đích.', 'Không sao chép hoặc sử dụng nội dung trái phép.', 'Thông báo khi phát hiện dữ liệu không chính xác.', 'Không đăng tải nội dung vi phạm pháp luật hoặc quyền của bên thứ ba.']
    },
    {
      title: `6. Trách nhiệm của ${platformName}`,
      bullets: ['Vận hành nền tảng trong khả năng kiểm soát hợp lý.', 'Bảo vệ dữ liệu người dùng theo quy định.', 'Hiển thị trạng thái và phạm vi công khai phù hợp.', 'Tiếp nhận phản ánh và hỗ trợ kỹ thuật.', 'Từ chối hiển thị hoặc tạm khóa nội dung có dấu hiệu sai lệch, giả mạo hoặc vi phạm.']
    },
    {
      title: '7. Quản lý nội dung công khai',
      paragraphs: ['Đơn vị cung cấp dữ liệu không được đăng tải thông tin sai sự thật, hàng hóa bị cấm, hàng giả, nội dung xâm phạm sở hữu trí tuệ hoặc nội dung trái pháp luật.'],
      bullets: ['Nền tảng có thể yêu cầu bổ sung bằng chứng xác minh.', 'Dữ liệu chưa đủ điều kiện sẽ được giữ ở phạm vi quản trị và không hiển thị công khai.', 'Nội dung vi phạm có thể bị ẩn, chỉnh sửa hoặc gỡ theo quy trình xử lý.']
    },
    {
      title: '8. Phản ánh và xử lý yêu cầu',
      paragraphs: ['Khi phát hiện thông tin chưa chính xác hoặc cần hỗ trợ, người dùng có thể gửi yêu cầu qua trang Liên hệ. Đội vận hành sẽ đối chiếu phạm vi thông tin và phản hồi theo mức độ cần thiết.']
    },
    {
      title: '9. Điều khoản chung',
      paragraphs: [`${platformName} có quyền cập nhật Chính sách vận hành để phù hợp với hoạt động thực tế và quy định pháp luật. Việc tiếp tục sử dụng nền tảng sau khi chính sách được cập nhật đồng nghĩa với việc người dùng đồng ý với nội dung sửa đổi.`]
    },
    buildPolicyContactSection(siteProfile, `Mọi thắc mắc hoặc yêu cầu liên quan đến Chính sách vận hành, vui lòng liên hệ ${platformName} qua các kênh dưới đây.`, siteKey)
  ];

  return (
    <PublicStaticPage title="Chính sách vận hành" description={`Nguyên tắc vận hành nền tảng ${platformName} dành cho hợp tác xã, đối tác và người truy cập.`}>
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
