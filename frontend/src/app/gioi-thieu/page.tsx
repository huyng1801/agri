import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, Database, Leaf, QrCode, Sprout, UserRound } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { PublicBreadcrumbTrail, PublicPageHeader, PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { PublicSpeakButton } from '@/components/public-speak-button';
import { Button, cn } from '@/components/ui';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Cách Agripassport hoạt động',
    description: 'Tìm hiểu cách Agripassport tổ chức dữ liệu sản phẩm, kết nối hợp tác xã và mở hồ sơ QR truy xuất.',
    path: '/gioi-thieu',
    keywords: ['cách Agripassport hoạt động', 'dữ liệu sản phẩm', 'QR truy xuất', 'hợp tác xã']
  });
}

const steps = [
  { number: '01', title: 'Chuẩn hóa dữ liệu', description: 'Hợp tác xã và đơn vị sản xuất tập hợp thông tin sản phẩm, vùng sản xuất, hình ảnh và chứng nhận theo một cấu trúc thống nhất.', icon: Database },
  { number: '02', title: 'Đối chiếu và xác minh', description: 'Đội vận hành kiểm tra hồ sơ trước khi mở công khai. Dữ liệu thiếu hoặc chưa xác minh không xuất hiện trên website.', icon: CheckCircle2 },
  { number: '03', title: 'Công khai đúng ngữ cảnh', description: 'Thông tin đã duyệt được trình bày thành hồ sơ sản phẩm, hồ sơ đối tác và nội dung hướng dẫn dễ đọc trên mọi thiết bị.', icon: Leaf },
  { number: '04', title: 'Kết nối bằng QR', description: 'Mã QR dẫn người mua đến hồ sơ số phù hợp để kiểm tra nguồn gốc, nhật ký và dữ liệu liên quan khi có.', icon: QrCode }
] as const;

const audiences = [
  { title: 'Hợp tác xã', description: 'Tổ chức dữ liệu sản phẩm và giới thiệu năng lực rõ ràng hơn.', icon: Building2 },
  { title: 'Nông hộ và trang trại', description: 'Kể câu chuyện vùng sản xuất bằng dữ liệu dễ kiểm tra.', icon: Sprout },
  { title: 'Doanh nghiệp và đối tác', description: 'Tìm kiếm thông tin sản phẩm, đơn vị và vùng sản xuất công khai.', icon: BriefcaseBusiness },
  { title: 'Người mua', description: 'Đọc thông tin minh bạch và quét QR khi cần truy xuất.', icon: UserRound }
] as const;

export default async function AboutPage() {
  const [siteKey, homeUrl, currentUrl] = await Promise.all([
    getRequestPublicSiteKey(),
    getRequestAbsoluteUrl('/'),
    getRequestAbsoluteUrl('/gioi-thieu')
  ]);
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const siteProfile = isPassport ? await getPublicSiteProfile(siteKey) : null;

  if (isInternal) {
    return (
      <PublicShell>
        <PublicPageMain>
          <PublicBreadcrumbTrail current="Cách hoạt động" path="/gioi-thieu" homeUrl={homeUrl} currentUrl={currentUrl} />
          <PublicPageHeader eyebrow="HTXONLINE" title="Quản trị nội bộ trước, công khai đúng lớp sau." description="HTXONLINE tập trung vào thành viên, thu chi, xuất nhập và dữ liệu vận hành. Khi thông tin đủ chuẩn, dữ liệu phù hợp mới được kết nối sang Agripassport và Hộ chiếu nông nghiệp." />
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => <article key={step.number} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5"><step.icon size={24} className="text-[var(--brand-primary)]" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">{step.number}</p><h2 className="mt-2 text-xl font-extrabold text-[var(--text-primary)]">{step.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p></article>)}
          </section>
        </PublicPageMain>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
        <PublicPageMain className="pb-10 sm:pb-14 lg:pb-16">
          <PublicBreadcrumbTrail current="Cách hoạt động" path="/gioi-thieu" homeUrl={homeUrl} currentUrl={currentUrl} />
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] shadow-[0_22px_55px_rgba(15,23,42,0.07)]">
          <div className={cn(publicContainerClass, 'grid gap-8 px-5 py-9 sm:px-8 sm:py-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:px-12 lg:py-16')}>
            <div className={cn(isPassport && 'order-2 lg:order-1')}>
              <PublicPageHeader eyebrow="Cách Agripassport hoạt động" title="Từ dữ liệu sản xuất đến hồ sơ nông sản minh bạch" description="Agripassport không thay thế quy trình sản xuất. Nền tảng giúp tổ chức những dữ liệu đã có, kiểm tra trước khi công khai và kết nối người mua với thông tin đúng sản phẩm." titleClassName="sm:text-[2.65rem] sm:leading-[1.02] lg:text-[3rem]" />
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/san-pham"><Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">Xem sản phẩm <ArrowRight size={17} aria-hidden="true" /></Button></Link>
                <Link href="/lien-he"><Button variant="ghost" className="min-h-12 w-full rounded-full border-[var(--border-strong)] bg-white px-6 text-[var(--brand-primary)] sm:w-auto">Đưa sản phẩm lên nền tảng</Button></Link>
              </div>
            </div>
            {isPassport && siteProfile ? (
              <figure className="order-1 overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/65 p-2 shadow-[0_20px_44px_rgba(15,23,42,0.1)] lg:order-2">
                <PublicImage
                  src={siteProfile.pageContent.introImageUrl}
                  alt={siteProfile.pageContent.introImageAlt}
                  wrapperClassName="aspect-[16/10] rounded-[1.25rem]"
                  className="h-full w-full object-cover"
                  priority
                />
              </figure>
            ) : null}
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="workflow-title">
          <div className="max-w-none"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Một quy trình rõ ràng</p><h2 id="workflow-title" className="type-h2 mt-3 text-[1.7rem] leading-[1.05] sm:text-[2.7rem] lg:whitespace-nowrap">Bốn bước để dữ liệu trở nên hữu ích</h2><p className="mt-4 max-w-none text-base leading-7 text-[var(--text-secondary)] lg:whitespace-nowrap">Mỗi bước có một mục đích riêng để giảm thông tin thiếu, tránh hiểu nhầm và giúp người xem tra cứu nhanh hơn</p></div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => <article key={step.number} className="relative rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand-primary)] text-white"><step.icon size={21} aria-hidden="true" /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">Bước {step.number}</p><h3 className="mt-2 text-xl font-extrabold leading-6 text-[var(--text-primary)]">{step.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p></article>)}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start sm:mt-10">
          <article className="rounded-[1.8rem] bg-[var(--brand-primary)] p-6 text-white shadow-[0_20px_45px_rgba(15,81,91,0.16)] sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">Ai cùng tham gia?</p><h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Một hệ sinh thái, nhiều vai trò rõ ràng</h2><p className="mt-4 text-sm leading-7 text-white/80">Mỗi chủ thể đóng góp một phần dữ liệu và nhận lại một cách trình bày phù hợp với nhu cầu của mình.</p><PublicSpeakButton className="mt-5" text="Ai cùng tham gia? Một hệ sinh thái, nhiều vai trò rõ ràng. Mỗi chủ thể đóng góp một phần dữ liệu và nhận lại một cách trình bày phù hợp với nhu cầu của mình." /></article>
          <div className="grid gap-3 sm:grid-cols-2">{audiences.map(({ title, description, icon: Icon }) => <article key={title} className="rounded-[1.45rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5"><Icon size={21} className="text-[var(--brand-primary)]" aria-hidden="true" /><h3 className="mt-4 text-lg font-extrabold text-[var(--text-primary)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p></article>)}</div>
        </section>

        <section className="mt-8 rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:mt-10 sm:p-8" aria-labelledby="principles-title"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Nguyên tắc công khai</p><h2 id="principles-title" className="mt-3 text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">Rõ dữ liệu, đúng nhận diện, không phóng đại</h2><div className="mt-5 grid gap-3 sm:grid-cols-3"><p className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold leading-6 text-[var(--text-secondary)]">Chỉ hiển thị hồ sơ đã được xác minh</p><p className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold leading-6 text-[var(--text-secondary)]">Không dùng ảnh ngẫu nhiên để đại diện sản phẩm</p><p className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold leading-6 text-[var(--text-secondary)]">Mở QR để xem đúng hồ sơ công khai</p></div></section>
      </PublicPageMain>
    </PublicShell>
  );
}
