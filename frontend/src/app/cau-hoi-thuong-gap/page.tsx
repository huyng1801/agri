import type { Metadata } from 'next';
import { PublicBreadcrumbTrail, PublicInfoTile, PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp nhanh về sản phẩm, dữ liệu, QR truy xuất và cách kết nối với Agripassport.',
    path: '/cau-hoi-thuong-gap',
    keywords: ['FAQ Agripassport', 'QR truy xuất', 'hồ sơ sản phẩm', 'hợp tác xã']
  });
}

const extraFaqs = [
  ['Agripassport là gì?', 'Agripassport là nền tảng tổ chức dữ liệu sản phẩm nông nghiệp, giúp hợp tác xã và đơn vị sản xuất công khai thông tin rõ ràng hơn.'],
  ['Thông tin nào được hiển thị công khai?', 'Chỉ hồ sơ đã đủ trường bắt buộc và được xác minh mới được hiển thị trên website. Dữ liệu đang hoàn thiện sẽ chưa xuất hiện.'],
  ['Có cần đăng nhập để xem sản phẩm không?', 'Không. Người xem có thể đọc các hồ sơ công khai mà không cần tạo tài khoản.'],
  ['Tôi tra cứu QR như thế nào?', 'Quét mã QR trên bao bì hoặc mở đường dẫn hồ sơ số. Kiểm tra tên sản phẩm, đơn vị, vùng sản xuất và nhật ký khi các thông tin này đã được công khai.'],
  ['Nếu QR không mở được thì làm gì?', 'Kiểm tra kết nối mạng và thử lại. Nếu vẫn không có hồ sơ, gửi mã QR hoặc đường dẫn tại trang Liên hệ để đội vận hành kiểm tra.'],
  ['Làm thế nào để đưa sản phẩm lên Agripassport?', 'Gửi thông tin hợp tác xã, sản phẩm và nhu cầu tại trang Liên hệ. Đội vận hành sẽ hướng dẫn chuẩn hóa hồ sơ và các bước xác minh.'],
  ['Agripassport có thay thế quy trình sản xuất không?', 'Không. Nền tảng chỉ tổ chức và trình bày dữ liệu được cung cấp, không thay thế trách nhiệm sản xuất, chất lượng hay tuân thủ pháp luật của đơn vị.'],
  ['Ảnh và chứng nhận được kiểm tra ra sao?', 'Ảnh, tài liệu và thông tin chứng nhận cần được đơn vị cung cấp để đối chiếu. Nội dung chưa được xác minh sẽ không dùng làm đại diện công khai.'],
  ['Đối tác có thể tìm HTX bằng cách nào?', 'Mở mục Đối tác để xem các hồ sơ HTX đã được xác minh và các sản phẩm đang được công khai.'],
  ['Tôi có thể góp ý hoặc báo thông tin chưa đúng không?', 'Có. Gửi nội dung cần đối chiếu cùng đường dẫn hồ sơ qua trang Liên hệ hoặc email Agripassport@gmail.com.'],
  ['Thời gian hỗ trợ của Agripassport?', 'Đội ngũ hỗ trợ từ 08:00 đến 17:30, thứ Hai đến thứ Bảy. Hotline: 0907 001 200.'],
  ['Agripassport bảo vệ thông tin liên hệ thế nào?', 'Thông tin gửi qua biểu mẫu được dùng để tiếp nhận và phản hồi yêu cầu. Vui lòng xem Chính sách bảo mật để biết thêm phạm vi xử lý dữ liệu.']
] as const;

export default async function FaqPage() {
  const profile = await getPublicSiteProfile('agripassport');
  const faqs = [...extraFaqs.map(([question, answer]) => ({ question, answer })), ...profile.faqs].filter((faq, index, list) => list.findIndex((item) => item.question === faq.question) === index);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PublicPageMain className="pb-12 sm:pb-16">
        <PublicBreadcrumbTrail current="Câu hỏi thường gặp" />
        <header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Hỗ trợ nhanh</p><h1 className="type-h1 mt-3 text-3xl sm:text-5xl">Câu hỏi thường gặp</h1><p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">Những câu trả lời ngắn gọn để bạn hiểu cách đọc hồ sơ, tra cứu QR và kết nối với Agripassport.</p></header>
        <section className="mt-7 grid gap-3 md:grid-cols-2" aria-label="Danh sách câu hỏi thường gặp">
          {faqs.map((faq) => <PublicInfoTile key={faq.question} title={faq.question} description={faq.answer} />)}
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
