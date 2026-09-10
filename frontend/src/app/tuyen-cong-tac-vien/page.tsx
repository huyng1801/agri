import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  Leaf,
  MapPin,
  QrCode,
  Smartphone,
  UsersRound,
  type LucideIcon
} from 'lucide-react';
import { PassportCollaboratorForm } from '@/components/passport-collaborator-form';
import { PublicFaqItem, PublicPageMain } from '@/components/public-layout';
import { PublicLogo } from '@/components/public-logo';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Cộng tác viên Hộ chiếu nông nghiệp',
    description: 'Đồng hành cùng hợp tác xã hoàn thiện hồ sơ số, công khai sản phẩm và mở trải nghiệm truy xuất rõ ràng hơn cho người mua.',
    path: '/tuyen-cong-tac-vien',
    keywords: ['cộng tác viên nông nghiệp', 'hồ sơ số', 'truy xuất QR']
  });
}

const reasons = [
  {
    icon: ClipboardCheck,
    title: 'Quy trình có sẵn',
    description: 'Bạn được hướng dẫn từng bước để hỗ trợ hợp tác xã đưa dữ liệu thật lên hồ sơ số.'
  },
  {
    icon: QrCode,
    title: 'Hồ sơ dễ chia sẻ',
    description: 'Mỗi sản phẩm có QR rõ ràng hơn để người mua mở nhanh và kiểm tra thông tin công khai.'
  },
  {
    icon: Smartphone,
    title: 'Công cụ dễ dùng',
    description: 'Ưu tiên thao tác trên điện thoại, phù hợp với nhịp làm việc linh hoạt và thực địa.'
  },
  {
    icon: UsersRound,
    title: 'Có người đồng hành',
    description: 'Đội vận hành hỗ trợ giải đáp khi bạn cần kiểm tra hồ sơ hoặc làm quen quy trình.'
  }
];

const trustSignals: Array<[string, string, LucideIcon]> = [
  ['Quy trình rõ', 'Bắt đầu từ một hồ sơ cụ thể', ClipboardCheck],
  ['Linh hoạt', 'Chủ động chọn thời gian đồng hành', Smartphone],
  ['Kết quả cụ thể', 'Hồ sơ được kiểm tra và công khai', BadgeCheck]
];

const steps = [
  ['01', 'Chọn hợp tác xã', 'Tìm một hợp tác xã hoặc đơn vị sản xuất bạn đang thường xuyên tiếp xúc.'],
  ['02', 'Hỗ trợ đăng ký', 'Giúp đơn vị hiểu rõ dữ liệu cần chuẩn bị và cách bắt đầu trên hệ thống.'],
  ['03', 'Hoàn thiện hồ sơ', 'Cùng kiểm tra sản phẩm, vùng trồng, nhật ký và phạm vi thông tin công khai.'],
  ['04', 'Sản phẩm được công khai', 'Khi hồ sơ đạt yêu cầu, sản phẩm có thể mở QR để người mua tra cứu trực tiếp.']
] as const;

const fitItems = [
  'Chủ doanh nghiệp, quản lý hợp tác xã hoặc người làm trong chuỗi nông nghiệp',
  'Nhân sự kinh doanh, tư vấn, kế toán hoặc đơn vị thường tiếp xúc với doanh nghiệp',
  'Người muốn làm việc linh hoạt và thích hỗ trợ người khác dùng công cụ số',
  'Người chưa có kinh nghiệm vẫn muốn bắt đầu từ một quy trình rõ ràng'
];

const faqs = [
  {
    question: 'Đây có phải công việc bán hàng không?',
    answer: 'Không. Vai trò chính là hỗ trợ hợp tác xã chuẩn bị, kiểm tra và công khai hồ sơ số. Bạn không cần chào bán sản phẩm thay cho đơn vị.'
  },
  {
    question: 'Tôi chưa có kinh nghiệm có tham gia được không?',
    answer: 'Có. Quy trình được chia thành các bước nhỏ, đội vận hành sẽ hướng dẫn cách bắt đầu và kiểm tra thông tin trước khi công khai.'
  },
  {
    question: 'Tôi có thể làm song song với công việc hiện tại không?',
    answer: 'Có thể. Trang cộng tác được thiết kế cho hình thức linh hoạt; bạn chủ động chọn thời gian phù hợp với lịch làm việc của mình.'
  },
  {
    question: 'Khi nào một hồ sơ được ghi nhận kết quả?',
    answer: 'Kết quả được ghi nhận khi hồ sơ đạt yêu cầu và sản phẩm hoặc đơn vị đã được công khai theo đúng quy trình của hệ thống.'
  }
];

export default async function PassportCollaboratorPage() {
  const siteKey = await getRequestPublicSiteKey();
  const profile = await getPublicSiteProfile(siteKey);

  return (
    <PublicShell>
      <PublicPageMain className="pb-12 pt-4 sm:pb-16 sm:pt-8 lg:pb-20">
        <section className="relative isolate overflow-hidden rounded-[2.2rem] bg-[linear-gradient(132deg,#073d24_0%,#0b6f36_46%,#65aa45_100%)] p-5 text-white shadow-[0_28px_66px_rgba(10,84,42,0.2)] sm:p-8 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(222,250,175,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_35%)]" aria-hidden="true" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/88">
                <Leaf size={15} aria-hidden="true" /> Cộng tác hỗ trợ hợp tác xã
              </div>
              <h1 className="mt-5 max-w-[15ch] text-[2.45rem] font-extrabold leading-[0.94] tracking-[-0.055em] sm:text-[4.4rem]">Giúp hợp tác xã xây dựng hồ sơ số rõ ràng.</h1>
              <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-white/84 sm:text-[1.1rem]">Hỗ trợ hoàn thiện và công khai dữ liệu sản phẩm trên Hộ chiếu nông nghiệp. Làm việc theo quy trình, linh hoạt theo thời gian của bạn.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#dang-ky" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[#0b6f36] shadow-[0_14px_28px_rgba(4,45,24,0.18)] transition hover:-translate-y-0.5">Đăng ký cộng tác <ArrowRight size={16} aria-hidden="true" /></a>
                <Link href="/gioi-thieu" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16">Tìm hiểu Hộ chiếu</Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[27rem]">
              <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full bg-[#d8f6a7]/20 blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/25 bg-white/[0.12] p-5 shadow-[0_24px_54px_rgba(3,43,22,0.2)] backdrop-blur-sm sm:p-7">
                <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-5">
                  <PublicLogo size={30} variant="passport-wordmark" className="h-8 w-auto max-w-[13rem]" />
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">Hồ sơ số</span>
                </div>
                <div className="mt-6 rounded-[1.4rem] bg-white p-4 text-[#123c26] shadow-[0_16px_30px_rgba(5,52,26,0.14)]">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#287b43]">Một nhiệm vụ rõ ràng</p>
                  <p className="mt-3 text-[1.5rem] font-extrabold leading-tight tracking-[-0.035em]">Một hồ sơ dễ kiểm chứng.</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold">
                    {['Sản phẩm', 'Vùng trồng', 'Nhật ký', 'Mã QR'].map((item) => <span key={item} className="rounded-xl bg-[#eef8e8] px-3 py-3 text-center text-[#27713d]">{item}</span>)}
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/72">Cùng đưa dữ liệu nông nghiệp đáng tin đến gần người mua hơn.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 border-y border-[var(--border)] py-5 sm:grid-cols-3 sm:gap-6 sm:py-6">
          {trustSignals.map(([label, text, Icon]) => (
            <div key={String(label)} className="flex items-center gap-3 sm:justify-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"><Icon size={19} aria-hidden="true" /></span>
              <span><strong className="block text-sm font-extrabold text-[var(--text-primary)]">{label}</strong><span className="mt-0.5 block text-xs leading-5 text-[var(--text-secondary)]">{text}</span></span>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-8 border-b border-[var(--border)] py-8 sm:py-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Vì sao dễ bắt đầu?</p>
            <h2 className="mt-3 max-w-[14ch] text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-[3.1rem]">Bạn không phải tự xây dựng mọi thứ từ đầu.</h2>
            <p className="mt-4 max-w-md text-[0.98rem] leading-7 text-[var(--text-secondary)]">Hộ chiếu nông nghiệp cung cấp một luồng làm việc ngắn gọn để bạn tập trung vào việc hỗ trợ đúng người, đúng sản phẩm và đúng thông tin.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"><Icon size={20} aria-hidden="true" /></span>
                <h3 className="mt-4 text-[1.08rem] font-extrabold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-[var(--surface-muted)] p-5 sm:p-8 lg:p-10" id="cong-viec">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Công việc của bạn</p>
              <h2 className="mt-3 max-w-[16ch] text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-[3rem]">Bốn bước để hỗ trợ một hợp tác xã.</h2>
            </div>
            <a href="#dang-ky" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-primary-hover)]">Tôi muốn bắt đầu <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {steps.map(([number, title, description]) => (
              <article key={number} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_12px_25px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between gap-3"><span className="text-3xl font-extrabold tracking-[-0.06em] text-[var(--brand-primary)]">{number}</span><ArrowRight size={17} className="text-[var(--border-strong)]" aria-hidden="true" /></div>
                <h3 className="mt-5 text-[1.08rem] font-extrabold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 overflow-hidden rounded-[2rem] bg-[#092f20] p-5 text-white sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:p-10" id="lo-trinh">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#b6e58a]">Lộ trình cộng tác</p>
            <h2 className="mt-3 max-w-[12ch] text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] sm:text-[3rem]">Một nhiệm vụ rõ ràng. Một kết quả cụ thể.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/72">Bạn được hướng dẫn để từng bước hỗ trợ hợp tác xã hoàn thiện và công khai hồ sơ số trên cùng một luồng dữ liệu.</p>
          </div>
          <div className="grid gap-0 divide-y divide-white/15">
            {[
              ['01', 'Làm quen quy trình', 'Biết dữ liệu nào cần chuẩn bị và kiểm tra ở đâu.'],
              ['02', 'Hỗ trợ hợp tác xã', 'Đồng hành cùng đơn vị trong lúc hoàn thiện hồ sơ.'],
              ['03', 'Hồ sơ được công khai', 'Sản phẩm có QR rõ ràng hơn để người mua dễ tra cứu.']
            ].map(([number, title, description]) => (
              <div key={number} className="grid gap-3 py-4 sm:grid-cols-[3.2rem_0.7fr_1.3fr] sm:items-start sm:gap-5">
                <span className="text-sm font-extrabold text-[#b6e58a]">{number}</span>
                <h3 className="text-base font-extrabold">{title}</h3>
                <p className="text-sm leading-6 text-white/68">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 border-b border-[var(--border)] py-8 sm:py-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16" id="phu-hop">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Ai phù hợp?</p>
            <h2 className="mt-3 max-w-[17ch] text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-[3rem]">Thường xuyên tiếp xúc hoặc hỗ trợ hợp tác xã? Đây là công việc phù hợp với bạn.</h2>
            <p className="mt-4 max-w-xl text-[0.98rem] leading-7 text-[var(--text-secondary)]">Bạn không cần có sẵn một mạng lưới lớn. Chỉ cần hiểu người mình đang hỗ trợ và sẵn sàng đi cùng họ qua một quy trình rõ ràng.</p>
          </div>
          <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--brand-primary-subtle)] p-5 sm:p-6">
            <div className="grid gap-4">
              {fitItems.map((item) => <div key={item} className="flex items-start gap-3 text-sm leading-6 text-[var(--text-primary)]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--brand-primary)] text-white"><Check size={13} strokeWidth={3} aria-hidden="true" /></span><span>{item}</span></div>)}
            </div>
            <div className="mt-6 flex items-start gap-3 border-t border-[var(--brand-primary)]/15 pt-5 text-sm leading-6 text-[var(--text-secondary)]"><MapPin size={18} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" /><span>Làm việc tại nơi bạn đang sống và làm việc.</span></div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 rounded-[2rem] bg-[#eff8e9] p-5 sm:p-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:p-10" id="faq">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Hiểu đúng trước khi bắt đầu</p>
            <h2 className="mt-3 max-w-[12ch] text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-[3rem]">Những điều ứng viên thường quan tâm.</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => <PublicFaqItem key={faq.question} {...faq} />)}
          </div>
        </section>

        <section className="mt-8 grid gap-8 rounded-[2rem] bg-[var(--surface-muted)] p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:p-10">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Đăng ký cộng tác</p>
            <h2 className="mt-3 max-w-[13ch] text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] text-[var(--text-primary)] sm:text-[3rem]">Bắt đầu bằng một hồ sơ đơn giản cho hợp tác xã đầu tiên.</h2>
            <p className="mt-4 max-w-md text-[0.98rem] leading-7 text-[var(--text-secondary)]">Chúng tôi muốn hiểu công việc hiện tại và thời gian bạn có thể bắt đầu, để hướng dẫn bước đầu tiên vừa sức và rõ ràng.</p>
            <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--text-secondary)] shadow-sm"><strong className="block text-[var(--text-primary)]">Cần hỗ trợ đăng ký?</strong><span className="mt-1 block">{profile.hotlineDisplay} · {profile.supportEmail}</span></div>
          </div>
          <PassportCollaboratorForm />
        </section>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0a542e_0%,#16803c_55%,#8fc85d_100%)] px-5 py-14 text-center text-white sm:px-8 sm:py-20">
          <div className="absolute -left-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/15" aria-hidden="true" />
          <div className="absolute -right-12 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-white/15" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/70">Một công việc linh hoạt hôm nay. Một năng lực hỗ trợ cho tương lai.</p>
            <h2 className="mt-4 text-[2rem] font-extrabold leading-[1] tracking-[-0.045em] sm:text-[3.2rem]">Sẵn sàng giúp hợp tác xã được tin tưởng hơn?</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/78 sm:text-base">Hãy bắt đầu với một hồ sơ, một quy trình rõ ràng và một sản phẩm có thể kiểm chứng.</p>
            <a href="#dang-ky" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#0a6d35] shadow-[0_14px_28px_rgba(4,45,24,0.18)] transition hover:-translate-y-0.5">Đăng ký cộng tác <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
