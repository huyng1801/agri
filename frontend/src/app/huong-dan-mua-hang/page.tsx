import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, QrCode, ShieldCheck, Handshake, ArrowRight, PhoneCall } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu Nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';
  return buildPublicMetadata({
    title: `Hướng dẫn tra cứu & kết nối - ${siteName}`,
    description: `Hướng dẫn tìm kiếm sản phẩm, quét mã QR truy xuất nguồn gốc và kết nối trực tiếp với Hợp tác xã trên ${siteName}.`,
    path: '/huong-dan-mua-hang'
  });
}

const guideSteps = [
  {
    step: '01',
    icon: Search,
    title: 'Tìm kiếm sản phẩm hoặc Hợp tác xã',
    description: 'Truy cập mục "Sản phẩm" hoặc "Hợp tác xã" trên thanh điều hướng. Sử dụng bộ lọc thông minh theo danh mục (Trái cây, Rau củ, Thảo dược...), địa phương hoặc chứng nhận chất lượng (VietGAP, OCOP, GlobalGAP) để tìm sản phẩm mong muốn.'
  },
  {
    step: '02',
    icon: QrCode,
    title: 'Quét mã QR truy xuất nguồn gốc',
    description: 'Khi cầm sản phẩm trên tay, sử dụng camera điện thoại hoặc Zalo để quét tem QR dán trên bao bì. Trình duyệt sẽ mở trực tiếp trang Hộ chiếu số của lô hàng với đầy đủ thông tin định danh và nhật ký mùa vụ.'
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Kiểm chứng hồ sơ & Chứng nhận kiểm định',
    description: 'Đọc kỹ các tab thông tin: Vùng trồng, Xã viên phụ trách, Lịch trình bón phân/chăm sóc và mục Chứng nhận để xem ảnh chụp giấy chứng nhận còn hiệu lực từ các tổ chức kiểm định độc lập.'
  },
  {
    step: '04',
    icon: Handshake,
    title: 'Kết nối giao thương trực tiếp với HTX',
    description: 'Tại trang chi tiết sản phẩm hoặc trang HTX, bấm "Liên hệ Hợp tác xã" để nhận số hotline, Zalo hoặc gửi yêu cầu kết nối cung cầu số lượng lớn trực tiếp tới ban quản trị HTX mà không qua trung gian.'
  }
];

export default async function BuyingGuidePage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu Nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';

  return (
    <PublicStaticPage
      title={`Hướng dẫn tra cứu & kết nối ${siteName}`}
      description="Quy trình 4 bước đơn giản giúp người tiêu dùng, nhà thu mua và đối tác tra cứu nguồn gốc sản phẩm và kết nối trực tiếp với vùng trồng."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {guideSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs transition hover:border-[#106f8a]/40 hover:shadow-md sm:p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-[var(--brand-primary-subtle)] transition-colors">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Panel className="border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cần hỗ trợ tra cứu hoặc kết nối trực tiếp?</h3>
              <p className="mt-1 text-sm text-slate-600">Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp thắc mắc và hướng dẫn chi tiết.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                href="/san-pham"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#106f8a] px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#0d596e]"
              >
                Khám phá sản phẩm
              </Link>
              <Link
                href="/lien-he"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs sm:text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </PublicStaticPage>
  );
}
