import Link from 'next/link';
import { ArrowRight, CheckCircle2, Database, Leaf, QrCode, UsersRound } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import type { PublicSiteProfile } from '@/lib/public-site';

type PassportIntroPageProps = {
  siteProfile: PublicSiteProfile;
};

const steps = [
  { title: 'Chuẩn hóa dữ liệu', description: 'Tập hợp thông tin cây, vùng trồng, nhật ký, thu hoạch và sản phẩm theo cấu trúc thống nhất.', icon: Database },
  { title: 'Đối chiếu và xác minh', description: 'Kiểm tra dữ liệu trước khi hồ sơ được phép hiển thị cho người mua và đối tác.', icon: CheckCircle2 },
  { title: 'Tạo hồ sơ số', description: 'Liên kết các bản ghi thành hồ sơ cây, lô sản phẩm và mã truy xuất rõ ràng.', icon: Leaf },
  { title: 'Công khai đúng phạm vi', description: 'Chỉ hiển thị thông tin đã được phê duyệt, đồng thời làm mờ vị trí nhạy cảm.', icon: QrCode }
] as const;

const audiences = [
  { title: 'Hợp tác xã', description: 'Quản lý cây, vùng trồng, nhật ký và sản lượng trên cùng một chuỗi dữ liệu.', icon: UsersRound },
  { title: 'Nông hộ và trang trại', description: 'Ghi nhận hành trình canh tác theo từng cây và từng mùa vụ.', icon: Leaf },
  { title: 'Người mua', description: 'Quét mã để xem nguồn gốc, lô hàng và thông tin đã được công khai.', icon: QrCode }
] as const;

export function PassportIntroPage({ siteProfile }: PassportIntroPageProps) {
  return (
    <PublicShell>
      <PublicPageMain className="pb-12 sm:pb-16">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] shadow-[0_22px_55px_rgba(15,23,42,0.07)]">
          <div className={cn(publicContainerClass, 'grid gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:gap-12 lg:px-12 lg:py-16')}>
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-primary)]">Cách hoạt động</p>
              <h1 className="mt-4 max-w-[16ch] text-[2.3rem] font-extrabold leading-[1.03] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[3.35rem]">Từ dữ liệu sản xuất đến hồ sơ nông sản minh bạch</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-[1.08rem]">Hộ chiếu nông nghiệp tổ chức dữ liệu đã có, kiểm tra trước khi công khai và kết nối người mua với thông tin đúng sản phẩm.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/san-pham"><Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">Xem sản phẩm <ArrowRight size={17} aria-hidden="true" /></Button></Link>
                <Link href="/lien-he"><Button variant="ghost" className="min-h-12 w-full rounded-full border-[var(--border-strong)] bg-white px-6 text-[var(--brand-primary)] sm:w-auto">Đưa sản phẩm lên nền tảng</Button></Link>
              </div>
            </div>
            <figure className="overflow-hidden rounded-[1.7rem]">
              <PublicImage src={siteProfile.pageContent.introImageUrl} alt={siteProfile.pageContent.introImageAlt} wrapperClassName="aspect-[3/2]" className="h-full w-full object-cover" priority />
            </figure>
          </div>
        </section>

        <section className="mt-10 sm:mt-14" aria-labelledby="passport-workflow-title">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-primary)]">Một quy trình rõ ràng</p>
          <h2 id="passport-workflow-title" className="type-h2 mt-3 text-[1.9rem] sm:text-[3rem]">Bốn bước để dữ liệu trở nên hữu ích</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem] sm:leading-8 lg:max-w-none lg:whitespace-nowrap">Mỗi bước có một mục đích riêng để giảm thông tin thiếu, tránh hiểu nhầm và giúp người xem tra cứu nhanh hơn.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand-primary)] text-white"><Icon size={21} aria-hidden="true" /></span>
                <p className="mt-5 text-xs font-bold tracking-[0.16em] text-[var(--brand-primary)]">Bước 0{index + 1}</p>
                <h3 className="mt-2 text-xl font-extrabold leading-6 text-[var(--text-primary)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] sm:mt-14">
          <article className="rounded-[1.8rem] bg-[var(--brand-primary)] p-6 text-white shadow-[0_20px_45px_rgba(15,81,91,0.16)] sm:p-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/75">Ai cùng tham gia?</p>
            <h2 className="mt-3 text-[1.9rem] font-extrabold leading-tight sm:text-[2.5rem]">Một hệ sinh thái, nhiều vai trò rõ ràng</h2>
            <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">Mỗi chủ thể đóng góp một phần dữ liệu và nhận lại cách trình bày phù hợp với nhu cầu của mình.</p>
          </article>
          <div className="grid gap-3 sm:grid-cols-3">
            {audiences.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-[1.45rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
                <Icon size={21} className="text-[var(--brand-primary)]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-extrabold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
