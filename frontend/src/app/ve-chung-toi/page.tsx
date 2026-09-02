import Link from 'next/link';
import { ArrowRight, CheckCircle2, QrCode, ShoppingBag, Store, Users } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { publicContainerClass } from '@/components/public-layout';
import { PublicOutcomeShowcase, type PublicOutcomeSlide } from '@/components/public-outcome-showcase';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';
import { AgripassportAboutPage } from './agripassport-about-page';

export async function generateMetadata() {
  const siteKey = await getRequestPublicSiteKey();
  const isAgripassport = siteKey === 'agripassport' || siteKey === 'local';

  return buildPublicMetadata({
    title: isAgripassport ? 'Về Agripassport' : 'Về chúng tôi',
    description: isAgripassport
      ? 'Agripassport giúp số hóa nông sản, chuẩn hóa dữ liệu sản phẩm và minh bạch nguồn gốc bằng QR.'
      : 'HTXONLINE mang đến lớp quản trị nội bộ, QR truy xuất và quy trình vận hành số cho hợp tác xã Việt Nam.',
    path: '/ve-chung-toi'
  });
}

const valuePillars = [
  {
    title: 'Quản trị thành viên tập trung',
    description: 'Tập hợp xã viên, mức độ sử dụng dịch vụ và lịch sử làm việc nội bộ trên cùng một hệ thống.',
    icon: Users
  },
  {
    title: 'Quản lý sản phẩm và dịch vụ',
    description: 'Theo dõi danh mục, xuất nhập và các đầu việc đang vận hành mà không cần chia nhỏ nhiều file rời.',
    icon: Store
  },
  {
    title: 'Đồng bộ QR và truy xuất',
    description: 'Khi cần công khai sản phẩm, dữ liệu có thể chuyển sang Agripassport và Hộ chiếu nông nghiệp theo luồng rõ ràng.',
    icon: QrCode
  },
  {
    title: 'Chốt đơn và đối soát gọn',
    description: 'Quy trình đặt hàng, COD và phối hợp vận hành được ghi nhận để ban quản trị theo dõi minh bạch hơn.',
    icon: ShoppingBag
  }
] as const;

const aboutOutcomeSlides: PublicOutcomeSlide[] = [
  {
    title: 'Quản trị xã viên',
    value: 'Hồ sơ xã viên rõ ràng',
    description: 'HTXONLINE gom hồ sơ thành viên, mức độ sử dụng dịch vụ và lịch sử tương tác để ban quản trị nhìn ra toàn cảnh nhanh hơn.',
    icon: 'users',
    note: 'Giảm phụ thuộc vào bảng tính rời và trao đổi thủ công.'
  },
  {
    title: 'Quy trình nội bộ',
    value: 'Thu chi, xuất nhập dễ theo dõi',
    description: 'Các luồng công việc vận hành được chuẩn hóa theo cùng một mặt bằng dữ liệu để đối soát, bàn giao và báo cáo thuận tiện hơn.',
    icon: 'boxes',
    note: 'Phù hợp vai trò quản trị chuyển đổi số nội bộ cho hợp tác xã.'
  },
  {
    title: 'Minh bạch sản phẩm',
    value: 'Khi cần công khai, dữ liệu đã sẵn sàng',
    description: 'Thông tin sản phẩm có thể được chuyển tiếp sang Agripassport và QR Passport mà không phải nhập liệu lại từ đầu.',
    icon: 'qrCode',
    note: 'Tạo cầu nối mượt giữa nội bộ HTX và lớp công khai ra thị trường.'
  },
  {
    title: 'Vận hành bền vững',
    value: 'Một nơi để quản trị tăng trưởng',
    description: 'Ban quản trị có thể nhìn đồng thời thành viên, hàng hóa, quy trình và các điểm cần hỗ trợ mà không cần đổi nhiều công cụ.',
    icon: 'badgeCheck',
    note: 'Ưu tiên trải nghiệm dễ dùng, đặc biệt trên mobile.'
  }
];

const trustSignals = [
  'Vai trò trọng tâm là quản trị nội bộ cho hợp tác xã.',
  'Dữ liệu sản phẩm có thể đồng bộ sang lớp công khai khi cần.',
  'Quy trình vận hành được thiết kế để dùng được ngay trên mobile.',
  'Thông tin liên hệ công khai và hồ sơ pháp lý được tách rõ để dễ đối chiếu.'
] as const;

export default async function AboutUsPage() {
  const siteKey = await getRequestPublicSiteKey();
  const [catalog, siteProfile] = await Promise.all([fetchPublicCatalog(100), getPublicSiteProfile(siteKey)]);

  if (siteKey === 'agripassport' || siteKey === 'local') {
    return <AgripassportAboutPage siteProfile={siteProfile} />;
  }

  const featuredCooperatives =
    catalog.cooperatives.slice(0, 6).length > 0 ? catalog.cooperatives.slice(0, 6) : Array.from({ length: 6 }).map((_, index) => ({ id: String(index), name: `HTX ${index + 1}` }));

  return (
    <PublicShell>
      <main id="main-content">
        <section className="bg-white">
          <div className={cn(publicContainerClass, 'grid gap-7 py-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:py-14')}>
            <div className="max-w-[42rem]">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Về hệ thống</p>
              <h1 className="mt-4 text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-[#1f9b4b] sm:text-[3.45rem]">
                {siteProfile.appName}
              </h1>
              <p className="mt-4 text-[1.18rem] font-semibold leading-8 text-[#1f2233]">{siteProfile.pageContent.aboutTitle}.</p>
              <div className="mt-4 space-y-4 text-[0.98rem] leading-8 text-[#1f2233] sm:text-[1.02rem]">
                <p>{siteProfile.pageContent.aboutDescription}</p>
                <p>
                  HTXONLINE là hệ thống quản trị chuyển đổi số nội bộ, phục vụ quản lý xã viên, dịch vụ, thu chi, xuất nhập và các lớp vận hành quan trọng thay vì lấy
                  gian hàng công khai làm trung tâm.
                </p>
                <p>
                  Khi hợp tác xã cần công khai sản phẩm ra ngoài thị trường, dữ liệu có thể được chuẩn hóa để đồng bộ sang Agripassport và Hộ chiếu nông nghiệp, giúp
                  hệ sinh thái vận hành liền mạch hơn.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/lien-he">
                  <Button className="min-h-12 w-full sm:w-auto">
                    Liên hệ tư vấn
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/gioi-thieu">
                  <Button variant="ghost" className="min-h-12 w-full sm:w-auto">
                    Khám phá hệ sinh thái
                  </Button>
                </Link>
              </div>
            </div>

            <article className="overflow-hidden rounded-[2rem] border border-[#dfe6dc] bg-[#070b14] text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
              <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
                <div className="relative min-h-[18rem] overflow-hidden lg:min-h-full">
                  <PublicImage
                    src={siteProfile.pageContent.aboutImageUrl}
                    alt={siteProfile.pageContent.aboutImageAlt || siteProfile.pageContent.aboutTitle}
                    wrapperClassName="absolute inset-0"
                    className="h-full w-full object-cover opacity-80"
                    priority
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,12,0.06),rgba(4,7,12,0.62))]" />
                  <div className="absolute inset-x-0 top-0 p-4 sm:p-5">
                    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/78">
                      Giới thiệu về {siteProfile.appName}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/65">Hệ thống lõi</p>
                      <p className="mt-2 text-lg font-bold leading-7">Quản trị nội bộ, đồng bộ dữ liệu sản phẩm và quy trình vận hành trên cùng một trục số.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-5 bg-[linear-gradient(145deg,#0f1422_0%,#122738_42%,#1b7a41_100%)] p-5 sm:p-6">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/70">HTXONLINE</p>
                    <h2 className="mt-3 text-[1.7rem] font-extrabold leading-[1.06] sm:text-[2.15rem]">Quản trị rõ hơn để hợp tác xã vận hành bền hơn.</h2>
                    <p className="mt-3 text-sm leading-7 text-white/82 sm:text-[0.98rem]">
                      Cấu trúc dữ liệu được tổ chức để đội vận hành, ban quản trị và các lớp công khai phía ngoài không bị chồng chéo vai trò.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/65">Dành cho HTX</p>
                      <p className="mt-2 text-lg font-bold leading-7">Xã viên, dịch vụ, thu chi, xuất nhập</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/65">Liên kết hệ sinh thái</p>
                      <p className="mt-2 text-lg font-bold leading-7">Agripassport và Hộ chiếu nông nghiệp</p>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/12 bg-black/18 p-4">
                    <p className="text-sm font-semibold text-white/90">Luồng triển khai điển hình</p>
                    <p className="mt-2 text-sm leading-7 text-white/76">
                      Quản trị nội bộ trong HTXONLINE trước, sau đó mới công khai sản phẩm và QR khi dữ liệu đã đủ chuẩn và đúng vai trò.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white pb-8 sm:pb-12">
          <div className={publicContainerClass}>
            <h2 className="text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-[#1f9b4b] sm:text-[3.05rem]">Thắng lợi cùng hợp tác xã</h2>
            <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-slate-600 sm:text-[1.04rem] sm:leading-8">
              Bố cục vận hành của HTXONLINE được tổ chức theo vai trò quản trị nội bộ: ghi nhận thành viên, chuẩn hóa quy trình, theo dõi dữ liệu và tạo sẵn nền để kết nối
              sang lớp công khai khi cần.
            </p>
            <PublicOutcomeShowcase items={aboutOutcomeSlides} className="mt-3" />
          </div>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-4 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-5')}>
          <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Thông tin pháp lý</p>
            <h2 className="mt-3 text-[1.8rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.3rem]">{legalEntityProfile.organizationName}</h2>
            <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">
              Hồ sơ pháp lý được giữ riêng để đối chiếu minh bạch, trong khi thông tin hiển thị trên website phục vụ mục tiêu tư vấn và vận hành công khai.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-[#f8faf7] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Giấy chứng nhận</p>
                <p className="mt-2 text-base font-bold leading-7 text-[#1f2233]">{legalEntityProfile.certificateTitle}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
              </div>
              <div className="rounded-[1.35rem] bg-[#f8faf7] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Mã số tổ hợp tác</p>
                <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#1f2233]">{legalEntityProfile.registrationNumber}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 sm:col-span-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Địa chỉ và liên hệ theo hồ sơ</p>
                <p className="mt-2 text-[0.98rem] font-semibold leading-7 text-[#1f2233]">{legalEntityProfile.legalAddress}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Người đại diện: {legalEntityProfile.representative}</p>
                <p className="text-sm leading-6 text-slate-600">
                  Email: {legalEntityProfile.legalEmail} · Điện thoại: {legalEntityProfile.legalPhone}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-[#f8faf7] p-5 shadow-sm sm:p-6">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Vai trò nền tảng</p>
            <h2 className="mt-3 text-[1.8rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.3rem]">Một lớp quản trị đứng đúng vị trí trong hệ sinh thái Agri.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {valuePillars.map((item) => (
                <article key={item.title} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#1f9b4b] text-white">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[1rem] font-bold leading-6 text-[#1f2233]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid gap-2.5">
              {trustSignals.map((item) => (
                <div key={item} className="rounded-[1.15rem] border border-[#dbe5d8] bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-4 py-2 pb-8 lg:grid-cols-[0.98fr_1.02fr]')}>
          <article className="rounded-[2rem] bg-[linear-gradient(145deg,#0c1322_0%,#13304a_46%,#1f9b4b_100%)] p-5 text-white shadow-[0_24px_56px_rgba(15,23,42,0.14)] sm:p-6">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white/68">Đồng hành cùng HTX</p>
            <h2 className="mt-3 text-[1.8rem] font-extrabold leading-[1.08] sm:text-[2.3rem]">{catalog.cooperatives.length || 12}+ hợp tác xã đang có mặt trong hệ sinh thái.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/82 sm:text-[0.98rem]">
              Dữ liệu nội bộ, hồ sơ sản phẩm và niềm tin thị trường được kết nối theo từng vai trò cụ thể, để đội vận hành triển khai thuận hơn và người mua nhận biết rõ hơn.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {featuredCooperatives.map((coop) => (
                <div key={coop.id} className="rounded-[1.2rem] border border-white/12 bg-white/10 px-3 py-3 text-center">
                  <p className="line-clamp-2 text-[0.78rem] font-semibold leading-5 text-white/88">{coop.name}</p>
                </div>
              ))}
            </div>
            <Link href="/htx" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#1f2233] transition hover:-translate-y-0.5">
              Xem danh sách HTX
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-100 bg-[#f4faf3] px-5 py-5 sm:px-6">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Bắt đầu cùng {siteProfile.appName}</p>
              <h2 className="mt-2 text-[1.75rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.2rem]">Muốn chuẩn hóa quản trị nội bộ và chuẩn bị sẵn dữ liệu cho lớp công khai?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[0.98rem]">
                Để lại thông tin, đội vận hành sẽ tư vấn lộ trình triển khai phù hợp với mô hình hợp tác xã của bạn.
              </p>
            </div>
            <div className="grid gap-4 p-5 sm:p-6">
              <div className="grid gap-3">
                {[
                  'Rà soát vai trò quản trị nội bộ, xã viên, dịch vụ, thu chi và xuất nhập theo đúng mô hình HTX.',
                  'Chuẩn hóa dữ liệu sản phẩm để sẵn sàng đồng bộ sang Agripassport và Hộ chiếu nông nghiệp.',
                  'Thiết kế giao diện public theo nhịp mobile-first để người xem vào là hiểu luồng ngay.'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.35rem] border border-[#dce7d9] bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#1f9b4b]" size={18} aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0f172a_0%,#12344b_46%,#1f9b4b_100%)] p-4 text-white">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/70">Đội vận hành phản hồi</p>
                <p className="mt-2 text-lg font-extrabold leading-7">Chúng tôi sẽ liên hệ lại sớm nhất để chốt luồng triển khai phù hợp cho HTX của bạn.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link href="/lien-he">
                    <Button variant="inverse" className="min-h-11 w-full sm:w-auto">
                      Liên hệ ngay
                      <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/gioi-thieu">
                    <Button variant="inverse-ghost" className="min-h-11 w-full sm:w-auto">
                      Xem vai trò nền tảng
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
