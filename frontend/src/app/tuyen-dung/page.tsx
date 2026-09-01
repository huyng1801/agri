import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Mail, MapPin, UsersRound } from 'lucide-react';
import { PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Tuyển dụng',
    description: 'Cơ hội đồng hành cùng AGRIPASSPORT để số hóa dữ liệu nông nghiệp và kết nối thị trường.',
    path: '/tuyen-dung'
  });
}

export default async function RecruitmentPage() {
  const siteProfile = await getPublicSiteProfile('agripassport');

  return (
    <PublicShell>
      <PublicPageMain className="pb-10 pt-4 sm:pb-12 sm:pt-8">
        <section className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#0b443d_0%,#0f7d63_48%,#55aa4d_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,250,185,0.24),transparent_31%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_35%)]" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 text-sm font-semibold"><BriefcaseBusiness size={17} aria-hidden="true" /> Tuyển dụng</span>
            <h1 className="mt-5 text-[2.3rem] font-extrabold leading-[0.96] tracking-[-0.05em] sm:text-[3.5rem]">Cùng số hóa dữ liệu nông nghiệp Việt Nam.</h1>
            <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-white/86 sm:text-[1.1rem]">AGRIPASSPORT tìm những người muốn cùng hợp tác xã, nông hộ và doanh nghiệp xây dựng dữ liệu minh bạch, dễ dùng và có giá trị cho thị trường.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[#dce7dc] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#167a4a]">Môi trường làm việc</p>
            <h2 className="mt-3 text-[1.8rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#1f2233] sm:text-[2.3rem]">Việc làm gần dữ liệu thật, tác động thật.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Đồng hành thực địa', 'Lắng nghe nhu cầu vận hành của HTX và nông hộ.'],
                ['Sản phẩm dễ dùng', 'Ưu tiên thao tác rõ ràng trên cả điện thoại và máy tính.'],
                ['Tăng trưởng cùng nhau', 'Tôn trọng tinh thần chủ động, học hỏi và hợp tác.']
              ].map(([title, description]) => <div key={title} className="rounded-[1.4rem] bg-[#f5faf4] p-4"><p className="font-bold text-[#1f2233]">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>)}
            </div>
          </article>

          <aside className="rounded-[2rem] border border-[#dce7dc] bg-[#f9fcf7] p-5 sm:p-6">
            <UsersRound className="text-[#167a4a]" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-[1.45rem] font-extrabold leading-tight text-[#1f2233]">Ứng tuyển hoặc kết nối với đội ngũ.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Gửi CV hoặc lời giới thiệu ngắn về vị trí bạn quan tâm. Đội ngũ sẽ phản hồi khi có vai trò phù hợp.</p>
            <a href={`mailto:${siteProfile.supportEmail}?subject=Ứng tuyển AGRIPASSPORT`} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#167a4a] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(22,122,74,0.2)]"><Mail size={17} aria-hidden="true" /> Gửi hồ sơ qua email</a>
            <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-600"><MapPin className="mt-0.5 shrink-0 text-[#167a4a]" size={17} aria-hidden="true" /><span>{siteProfile.address}</span></div>
          </aside>
        </section>

        <Link href="/lien-he" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-[#167a4a]">Có câu hỏi trước khi ứng tuyển? Liên hệ đội ngũ <ArrowRight size={16} aria-hidden="true" /></Link>
      </PublicPageMain>
    </PublicShell>
  );
}
