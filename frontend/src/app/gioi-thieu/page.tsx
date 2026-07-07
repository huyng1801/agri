import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';

export default function AboutPage() {
  return (
    <PublicStaticPage title="Giới thiệu HTXONLINE" description="Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Kết nối HTX với người mua', 'Minh bạch nguồn gốc bằng QR Passport', 'Hỗ trợ vận hành bán hàng COD'].map((item) => (
          <Panel key={item}>
            <h2 className="text-lg font-bold text-ink">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">HTXONLINE giúp HTX số hóa hồ sơ, sản phẩm và quy trình truy xuất để tạo niềm tin với thị trường.</p>
          </Panel>
        ))}
      </div>
    </PublicStaticPage>
  );
}
