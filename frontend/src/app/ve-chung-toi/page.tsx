import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Users
} from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicLogo } from '@/components/public-logo';
import { PublicShell } from '@/components/public-marketplace';
import { publicContainerClass } from '@/components/public-layout';
import { Button, cn } from '@/components/ui';
import { fetchPublicCatalog } from '@/lib/public-catalog';

export const metadata: Metadata = {
  title: 'Về chúng tôi',
  description: 'HTXONLINE mang đến sàn nông sản số, QR truy xuất và giải pháp vận hành cho hợp tác xã Việt Nam.',
  alternates: { canonical: 'https://htxonline.vn/ve-chung-toi' }
};

const valuePillars = [
  {
    title: 'Sàn thương mại cho HTX',
    description: 'Hiển thị sản phẩm public, hồ sơ HTX và kênh tiếp cận người mua trên toàn quốc mà không cần website riêng.',
    icon: Store
  },
  {
    title: 'QR Passport truy xuất',
    description: 'Mỗi sản phẩm có mã QR để khách xem nhật ký canh tác, vùng trồng và chứng nhận đã công khai.',
    icon: QrCode
  },
  {
    title: 'Đặt hàng COD',
    description: 'Người mua gửi đơn nhanh, HTX chủ động liên hệ xác nhận và xử lý giao hàng thu tiền khi nhận.',
    icon: ShoppingBag
  },
  {
    title: 'Dashboard vận hành HTX',
    description: 'HTX tự quản lý sản phẩm, nông dân, vùng trồng, nhật ký và đơn hàng trên một hệ thống thống nhất.',
    icon: Users
  }
] as const;

const coreValues = [
  { title: 'Minh bạch', description: 'Nguồn gốc và dữ liệu public rõ ràng với người mua.', icon: ShieldCheck },
  { title: 'Đồng hành HTX', description: 'Hỗ trợ HTX số hóa và tiếp cận thị trường tốt hơn.', icon: Leaf },
  { title: 'Tin cậy', description: 'Quy trình bán hàng COD và truy xuất có kiểm soát.', icon: BadgeCheck },
  { title: 'Đơn giản', description: 'Dùng được ngay, không cần xây website riêng.', icon: Sparkles },
  { title: 'Lan tỏa giá trị', description: 'Kết nối nông sản địa phương với người tiêu dùng.', icon: Target }
] as const;

const journeySteps = [
  {
    title: 'Công khai sản phẩm',
    description: 'HTX đưa sản phẩm, vùng trồng và chứng nhận public lên cùng một mặt bằng thương mại số.',
    accent: 'bg-[#f5fbf6] border-slate-200',
    icon: Store
  },
  {
    title: 'Chuẩn hóa truy xuất',
    description: 'QR Passport gom nhật ký canh tác, mốc kiểm chứng và dữ liệu quan trọng thành một hành trình rõ ràng.',
    accent: 'bg-white border-slate-200',
    icon: QrCode
  },
  {
    title: 'Chốt đơn COD',
    description: 'Người mua đặt hàng nhanh, còn HTX chủ động xác nhận và xử lý vận hành theo quy trình phù hợp.',
    accent: 'bg-mint/70 border-mint/80',
    icon: ShoppingBag
  },
  {
    title: 'Theo dõi tăng trưởng',
    description: 'Dashboard giúp đội vận hành nhìn được sản phẩm, đơn hàng và niềm tin thị trường theo thời gian.',
    accent: 'bg-white border-slate-200',
    icon: Users
  }
] as const;

const trustSignals = [
  'Sản phẩm public đã publish',
  'QR mở trực tiếp cho khách',
  'Quản lý vùng trồng tập trung',
  'COD theo quy trình HTX'
] as const;

export default async function AboutUsPage() {
  const catalog = await fetchPublicCatalog(100);
  const stats = [
    { value: `${catalog.cooperatives.length || 12}+`, label: 'HTX đang hiển thị trên sàn' },
    { value: `${catalog.totalProducts || 60}+`, label: 'Sản phẩm public đang bán' },
    { value: '100%', label: 'QR Passport xem được không cần đăng nhập' },
    { value: '1 nền tảng', label: 'Từ sản xuất đến bán hàng COD' }
  ];

  const featuredCooperatives =
    catalog.cooperatives.slice(0, 6).length > 0
      ? catalog.cooperatives.slice(0, 6)
      : Array.from({ length: 6 }).map((_, index) => ({ id: String(index), name: `HTX ${index + 1}`, code: `htx-${index}` }));

  return (
    <PublicShell>
      <main id="main-content">
        <section className="relative overflow-hidden bg-mint/60">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 36%), radial-gradient(circle at bottom right, rgba(47,132,81,0.14), transparent 34%)'
            }}
          />
          <div className={cn(publicContainerClass, 'relative grid items-center gap-5 py-10 sm:gap-6 sm:py-12 lg:grid-cols-[0.95fr_0.9fr_0.95fr] lg:py-16')}>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Về chúng tôi</p>
              <h1 className="mt-2.5 text-[2.35rem] font-bold leading-[1.02] text-ink sm:mt-3 sm:text-5xl">
                Chúng tôi là
                <span className="mt-2 block text-leaf">HTXONLINE</span>
              </h1>
              <p className="mt-3.5 max-w-md text-base leading-[1.8] text-slate-700">
                Sàn nông sản số giúp hợp tác xã kết nối thị trường, minh bạch nguồn gốc và bán hàng COD hiệu quả.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <Link href="/lien-he">
                  <Button className="min-h-12 w-full">
                    Liên hệ tư vấn
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/san-pham">
                  <Button variant="ghost" className="min-h-12 w-full">
                    Xem sản phẩm
                  </Button>
                </Link>
              </div>
            </div>

            <article className="rounded-[1.75rem] bg-leaf p-4 text-white shadow-sm lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PublicLogo size={38} />
                  <div>
                    <p className="text-sm font-bold">HTXONLINE</p>
                    <p className="text-xs text-white/72">Số hóa gọn hơn trên mobile</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  Live
                </span>
              </div>
              <div className="mt-4 rounded-[1.35rem] bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">QR Passport</p>
                <p className="mt-1.5 text-xl font-bold leading-tight">Minh bạch nguồn gốc, chốt đơn gọn và quản lý tập trung.</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[
                  { label: 'QR', value: 'Truy xuất' },
                  { label: 'COD', value: 'Chốt nhanh' },
                  { label: 'Admin', value: 'Một nơi' }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/10">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/65">{item.label}</p>
                    <p className="mt-1.5 text-sm font-semibold text-white/95">{item.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="relative mx-auto hidden w-full max-w-sm lg:block">
              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-4 shadow-[0_24px_60px_rgba(18,42,28,0.14)] backdrop-blur">
                <div className="rounded-[1.6rem] bg-[linear-gradient(160deg,#2f8451_0%,#1f5f3d_65%,#153b28_100%)] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PublicLogo size={42} />
                      <div>
                        <p className="text-sm font-bold">HTXONLINE</p>
                        <p className="text-xs text-white/75">Đồng hành số hóa cho hợp tác xã</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      Live
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">QR Passport</p>
                          <p className="mt-1 text-xl font-bold">Minh bạch từng sản phẩm</p>
                        </div>
                        <QrCode size={28} aria-hidden="true" className="text-mint" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">Đơn COD</p>
                        <p className="mt-2 text-2xl font-bold">Chốt nhanh</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">Dashboard</p>
                        <p className="mt-2 text-2xl font-bold">Một nơi quản lý</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-2xl bg-leaf p-5 text-white shadow-sm sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/75">Câu chuyện thương hiệu</p>
              <p className="mt-3.5 text-base leading-[1.8] text-white/95">
                HTXONLINE ra đời để giúp hợp tác xã Việt Nam đưa nông sản địa phương lên môi trường số một cách minh bạch. Chúng tôi kết hợp sàn bán hàng,
                QR Passport và dashboard vận hành để HTX tập trung vào chất lượng sản phẩm, còn người mua dễ dàng tin tưởng nguồn gốc.
              </p>
              <p className="mt-3 text-sm leading-[1.75] text-white/80">
                Không chỉ là website giới thiệu, đây là hệ sinh thái sản xuất, truy xuất và bán hàng trên cùng một nền tảng.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {trustSignals.map((item) => (
                  <div key={item} className="rounded-xl bg-white/10 px-3 py-2.5 text-sm leading-[1.45] text-white/92 ring-1 ring-white/10">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-9 sm:py-10')}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm sm:p-5">
                <p className="text-[1.85rem] font-bold text-leaf sm:text-3xl">{item.value}</p>
                <p className="mt-1.5 text-sm leading-[1.65] text-slate-600">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-10 sm:py-12">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-ink">Thành công được tạo dựng từ giá trị khác biệt</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                HTXONLINE giúp HTX hiện diện trên thị trường số bằng dữ liệu minh bạch, quy trình bán hàng rõ ràng và trải nghiệm mua sắm đơn giản.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {valuePillars.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f8faf7] p-6 shadow-sm">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-leaf text-white">
                    <item.icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-12')}>
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#f8faf7_0%,#edf7f0_100%)] p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-wide text-leaf">Tầm nhìn</p>
                  <h3 className="mt-2 text-2xl font-bold text-ink">Trở thành nền tảng số tin cậy cho hợp tác xã nông nghiệp Việt Nam.</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Mỗi HTX có thể kể câu chuyện nguồn gốc rõ ràng, mỗi người mua đều kiểm tra được sản phẩm trước khi quyết định mua.
                  </p>
                </article>
                <article className="rounded-2xl bg-leaf p-5 text-white shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-wide text-white/75">Sứ mệnh</p>
                  <h3 className="mt-2 text-2xl font-bold">Số hóa bán hàng và truy xuất nguồn gốc cho HTX.</h3>
                  <p className="mt-3 text-sm leading-7 text-white/85">
                    Chúng tôi mang đến công cụ thực tế: sàn public, QR Passport, dashboard vận hành và đơn COD để HTX phát triển bền vững hơn.
                  </p>
                </article>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Bản đồ giá trị</p>
              <h3 className="mt-2 text-3xl font-bold text-ink">Một hành trình rõ ràng từ niềm tin đến đơn hàng.</h3>
              <div className="mt-6 grid gap-3">
                {journeySteps.map((step, index) => (
                  <article key={step.title} className={cn('rounded-2xl border p-4 shadow-sm', step.accent)}>
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf text-white shadow-sm">
                        <step.icon size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500">Bước {index + 1}</p>
                        <h4 className="mt-1 text-lg font-bold text-ink">{step.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-12">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-ink">Giá trị cốt lõi</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">Những nguyên tắc định hướng mọi sản phẩm và dịch vụ trên HTXONLINE.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {coreValues.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f8faf7] p-5 text-center shadow-sm">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-leaf text-white">
                    <item.icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-12')}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-3xl bg-[linear-gradient(180deg,#245f3e_0%,#1b4f33_100%)] p-6 text-white shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-white/70">Đội ngũ đồng hành</p>
              <h2 className="mt-2 max-w-lg text-3xl font-bold leading-tight">Những con người trẻ cùng đam mê tạo nên giá trị lớn cho nông sản Việt.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/82">
                Chúng tôi làm việc để HTX dễ hiện diện hơn trên môi trường số, còn người mua có thêm niềm tin khi chọn sản phẩm minh bạch nguồn gốc.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/65">Onboarding</p>
                  <p className="mt-2 text-xl font-bold">HTX mới</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/65">Chuẩn hóa</p>
                  <p className="mt-2 text-xl font-bold">QR & vùng trồng</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/65">Vận hành</p>
                  <p className="mt-2 text-xl font-bold">Đơn COD</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Đối tác & niềm tin</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">{catalog.cooperatives.length || 12}+ HTX đồng hành</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Cảm ơn các hợp tác xã và người mua đã tin tưởng HTXONLINE để kết nối nông sản minh bạch trên môi trường số.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {featuredCooperatives.map((coop) => (
                  <div key={coop.id} className="rounded-xl border border-slate-200 bg-[#f8faf7] px-3 py-4 text-center">
                    <p className="line-clamp-2 text-xs font-semibold text-slate-700">{'name' in coop ? coop.name : 'HTX'}</p>
                  </div>
                ))}
              </div>
              <Link href="/htx" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                Xem danh sách HTX
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-12 pt-4')}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-100 bg-mint/70 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Bắt đầu cùng HTXONLINE</p>
                  <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-ink">
                    HTX muốn tham gia sàn hoặc cần tư vấn triển khai truy xuất?
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Để lại thông tin, đội vận hành sẽ hỗ trợ onboarding và hướng dẫn quy trình phù hợp với HTX của bạn.
                </p>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              <PublicContactForm sourcePath="/ve-chung-toi" variant="hero" />
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
