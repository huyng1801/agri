import { PublicPolicyBody } from '@/components/public-policy-body';
import { PublicStaticPage } from '@/components/public-static-page';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { buildPolicyContactSection } from '@/lib/policy-contact';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const isPublicSite = siteKey === 'passport' || siteKey === 'agripassport' || siteKey === 'local';
  return buildPublicMetadata({
    title: isPublicSite ? 'Chính sách xử lý phản ánh' : 'Chính sách đổi trả',
    description: isPublicSite
      ? `Cách ${siteProfile.appName} tiếp nhận và xử lý phản ánh về thông tin công khai.`
      : `Điều kiện đổi trả và trách nhiệm xử lý theo thỏa thuận giữa các bên trên ${siteProfile.appName}.`,
    path: '/chinh-sach-doi-tra'
  });
}

export default async function ReturnPolicyPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const platformName = siteProfile.appName;
  const isPublicSite = siteKey === 'passport' || siteKey === 'agripassport' || siteKey === 'local';
  const title = isPublicSite ? 'Chính sách xử lý phản ánh' : 'Chính sách đổi trả';
  const description = isPublicSite
    ? `Cách ${platformName} tiếp nhận và xử lý phản ánh về thông tin công khai.`
    : `Điều kiện đổi trả và trách nhiệm xử lý theo thỏa thuận giữa các bên trên ${platformName}.`;
  const sections = isPublicSite
    ? [
        {
          title: '1. Mục đích',
          paragraphs: [`Chính sách này hướng dẫn người dùng phản ánh thông tin sản phẩm, HTX hoặc hồ sơ QR chưa chính xác trên ${platformName}.`]
        },
        {
          title: '2. Phạm vi tiếp nhận',
          bullets: ['Thông tin sản phẩm không đúng với tài liệu đã công bố.', 'Hình ảnh, chứng nhận hoặc dữ liệu nguồn gốc cần được kiểm tra lại.', 'Hồ sơ QR không mở được hoặc hiển thị sai phạm vi.', 'Nội dung có dấu hiệu vi phạm quyền sở hữu trí tuệ hoặc quy định pháp luật.']
        },
        {
          title: '3. Cách gửi phản ánh',
          bullets: ['Gửi nội dung qua trang Liên hệ hoặc kênh hỗ trợ được công bố.', 'Mô tả rõ hồ sơ, sản phẩm hoặc đường dẫn liên quan.', 'Đính kèm hình ảnh, tài liệu hoặc bằng chứng nếu có.', 'Cung cấp thông tin liên hệ để đội vận hành có thể phản hồi.']
        },
        {
          title: '4. Quy trình xử lý',
          paragraphs: ['Đội vận hành tiếp nhận, kiểm tra phạm vi thông tin và trao đổi với đơn vị cung cấp dữ liệu khi cần. Nội dung chưa đủ căn cứ có thể được tạm ẩn khỏi phạm vi công khai trong thời gian xác minh.']
        },
        {
          title: `5. Trách nhiệm của ${platformName}`,
          paragraphs: [`${platformName} hỗ trợ tiếp nhận và chuyển phản ánh đến đúng đầu mối. Nền tảng không thay thế cơ quan quản lý nhà nước hoặc chịu trách nhiệm thay cho đơn vị cung cấp dữ liệu về các thông tin do đơn vị đó công bố.`]
        },
        buildPolicyContactSection(siteProfile, `Mọi phản ánh liên quan đến thông tin công khai, vui lòng liên hệ ${platformName} qua các kênh dưới đây.`, siteKey)
      ]
    : [
        {
          title: '1. Mục đích',
          paragraphs: [`Chính sách này nêu nguyên tắc đổi trả theo thỏa thuận giữa đơn vị cung cấp và người mua, trong trường hợp có phát sinh giao dịch ngoài phạm vi hiển thị thông tin của ${platformName}.`]
        },
        {
          title: '2. Điều kiện áp dụng',
          bullets: ['Sản phẩm không đúng thông tin đã được thỏa thuận.', 'Sản phẩm bị hư hỏng hoặc không bảo đảm chất lượng khi bàn giao.', 'Yêu cầu được gửi trong thời hạn do các bên thống nhất.', 'Người yêu cầu cung cấp thông tin và bằng chứng cần thiết để đối chiếu.']
        },
        {
          title: '3. Trường hợp không áp dụng',
          bullets: ['Thay đổi nhu cầu sau khi đã tiếp nhận sản phẩm.', 'Hư hỏng do lỗi của người sử dụng.', 'Không còn đủ căn cứ để xác định tình trạng ban đầu.', 'Yêu cầu gửi quá thời hạn đã thống nhất.']
        },
        {
          title: '4. Quy trình xử lý',
          bullets: ['Gửi yêu cầu đến đơn vị cung cấp hoặc kênh hỗ trợ phù hợp.', 'Cung cấp thông tin, hình ảnh và tài liệu liên quan.', 'Đơn vị cung cấp kiểm tra và phản hồi phương án xử lý.', 'Các bên thống nhất việc đổi, hoàn hoặc phương án khác theo quy định áp dụng.']
        },
        {
          title: `5. Vai trò của ${platformName}`,
          paragraphs: [`${platformName} hỗ trợ tiếp nhận thông tin và kết nối các bên khi phù hợp. Quyết định xử lý cuối cùng thuộc về đơn vị cung cấp theo pháp luật và thỏa thuận riêng.`]
        },
        buildPolicyContactSection(siteProfile, `Mọi thắc mắc về chính sách này, vui lòng liên hệ đơn vị cung cấp hoặc ${platformName} qua các kênh dưới đây.`, siteKey)
      ];

  return (
    <PublicStaticPage title={title} description={description}>
      <PublicPolicyBody sections={sections} />
    </PublicStaticPage>
  );
}
