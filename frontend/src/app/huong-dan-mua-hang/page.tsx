import Link from 'next/link';
import { PublicStaticPage } from '@/components/public-static-page';
import { PublicGuideSteps } from '@/components/public-policy-body';
import { Panel } from '@/components/ui';
import { buildPublicMetadata } from '@/lib/page-metadata';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Hướng dẫn sử dụng Agripassport',
    description: 'Hướng dẫn tìm sản phẩm, đọc hồ sơ công khai và tra cứu nguồn gốc bằng QR trên Agripassport.',
    path: '/huong-dan-mua-hang'
  });
}

const steps = [
  {
    title: 'Tìm sản phẩm hoặc đối tác',
    description: 'Dùng thanh tìm kiếm, vào mục Sản phẩm hoặc Đối tác để lọc thông tin theo nhu cầu. Chỉ các hồ sơ đã được xác minh mới hiển thị công khai.'
  },
  {
    title: 'Đọc hồ sơ sản phẩm',
    description: 'Mở chi tiết để xem tên sản phẩm, đơn vị sản xuất, vùng sản xuất, thông tin chứng nhận và các dữ liệu đã được công khai.'
  },
  {
    title: 'Tra cứu bằng mã QR',
    description: 'Quét mã QR trên bao bì hoặc mở đường dẫn hồ sơ số để kiểm tra nguồn gốc, nhật ký và thông tin liên quan khi dữ liệu đã được công khai.'
  },
  {
    title: 'Kết nối trực tiếp',
    description: 'Nếu muốn hợp tác, đưa sản phẩm lên nền tảng hoặc cần làm rõ thông tin, hãy gửi nhu cầu tại trang Liên hệ để đội vận hành phản hồi.'
  }
];

export default function BuyingGuidePage() {
  return (
    <PublicStaticPage title="Hướng dẫn sử dụng Agripassport" description="Tìm sản phẩm, đọc hồ sơ công khai và tra cứu nguồn gốc bằng QR trên Agripassport.">
      <div className="space-y-4">
        <PublicGuideSteps steps={steps} />
        <Panel className="text-sm leading-7 text-slate-700">
          <p>
            Hồ sơ chưa có đủ dữ liệu hoặc QR không mở đúng thông tin?{' '}
            <Link href="/lien-he" className="inline-flex min-h-10 items-center rounded-full bg-mint/80 px-3 align-middle font-semibold text-leaf">
              Liên hệ Agripassport
            </Link>
            .
          </p>
        </Panel>
      </div>
    </PublicStaticPage>
  );
}
