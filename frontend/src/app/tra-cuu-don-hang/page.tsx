import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail, PhoneCall } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { OrderLookupClient } from '@/components/order-lookup-client';
import { Panel } from '@/components/ui';
import { getPublicSiteProfile, telHref } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng',
  description: 'Nhập mã đơn hàng và số điện thoại để xem trạng thái đơn COD trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/tra-cuu-don-hang' }
};

export default async function OrderLookupPage() {
  const siteProfile = await getPublicSiteProfile();

  return (
    <PublicStaticPage title="Tra cứu đơn hàng" description="Nhập mã đơn hàng và số điện thoại để xem trạng thái đơn COD.">
      <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <OrderLookupClient />
        <Panel className="space-y-4 border-slate-200 bg-[linear-gradient(180deg,#f7fbf7_0%,#eef7f1_100%)]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-leaf/80">Hỗ trợ tra cứu</p>
            <h2 className="mt-2 text-xl font-bold text-ink">Nếu đơn chưa hiện, đội vận hành sẽ kiểm tra giúp bạn.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Khi cần hỗ trợ nhanh, hãy gửi mã đơn hoặc số điện thoại đặt hàng qua hotline hay email bên dưới để được đối chiếu sớm hơn.
            </p>
          </div>

          <div className="grid gap-3">
            <a
              href={telHref(siteProfile.hotline)}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-leaf/40 hover:bg-mint/30"
            >
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-leaf">
                <PhoneCall size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Hotline</span>
                <span className="mt-1 block text-lg font-medium text-ink">{siteProfile.hotlineDisplay}</span>
              </span>
            </a>
            <a
              href={`mailto:${siteProfile.supportEmail}`}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-leaf/40 hover:bg-mint/30"
            >
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-leaf">
                <Mail size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Email hỗ trợ</span>
                <span className="mt-1 block break-all text-base font-semibold text-ink">{siteProfile.supportEmail}</span>
              </span>
            </a>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm leading-6 text-slate-600">
            Nếu muốn cập nhật thêm kênh hỗ trợ, hotline, email hoặc nội dung các trang công khai mà không sửa code, bạn có thể vào phần cài đặt nội dung công khai trong dashboard.
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/lien-he"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-leaf px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              Xem trang liên hệ
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/huong-dan-mua-hang"
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
            >
              Xem hướng dẫn mua hàng
            </Link>
          </div>
        </Panel>
      </div>
    </PublicStaticPage>
  );
}
