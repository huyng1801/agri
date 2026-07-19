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
import { legalEntityProfile } from '@/lib/legal-entity';
import { getPublicSiteProfile } from '@/lib/public-site';

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
  const [catalog, siteProfile] = await Promise.all([fetchPublicCatalog(100), getPublicSiteProfile()]);
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
          <div className={cn(publicContainerClass, 'relative grid items-center gap-4 py-9 sm:gap-6 sm:py-12 lg:grid-cols-[0.95fr_0.9fr_0.95fr] lg:py-16')}>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Về chúng tôi</p>
              <h1 className="mt-2 text-[2.14rem] font-bold leading-[1.02] text-ink sm:mt-3 sm:text-5xl">
                Chúng tôi là
                <span className="mt-2 block text-leaf">HTXONLINE</span>
              </h1>
              <p className="mt-3 max-w-md text-[0.96rem] leading-[1.72] text-slate-700 sm:text-base sm:leading-[1.8]">
                Sàn nông sản số giúp hợp tác xã kết nối thị trường, minh bạch nguồn gốc và bán hàng COD hiệu quả.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:flex sm:flex-wrap">
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

            <article className="rounded-[1.5rem] border border-white/85 bg-white/92 p-3 text-ink shadow-[0_20px_50px_rgba(148,163,184,0.14)] lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PublicLogo size={34} />
                  <div>
                    <p className="text-[0.82rem] font-bold">HTXONLINE</p>
                    <p className="text-[11px] text-slate-500">Số hóa gọn hơn trên mobile</p>
                  </div>
                </div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-leaf">
                  Live
                </span>
              </div>
              <div className="mt-3 rounded-[1.1rem] bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-3 ring-1 ring-mint/70">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-leaf/70">QR Passport</p>
                <p className="mt-1.5 text-[1.45rem] font-bold leading-[1.06]">Minh bạch nguồn gốc, chốt đơn nhanh và quản lý gọn.</p>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {[
                  { label: 'QR', value: 'Truy xuất' },
                  { label: 'COD', value: 'Chốt nhanh' },
                  { label: 'Admin', value: 'Một nơi' }
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.1rem] bg-[#f8faf7] px-2.5 py-2.5 text-center ring-1 ring-mint/65">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-leaf/65">{item.label}</p>
                    <p className="mt-1 text-[0.78rem] font-semibold leading-tight text-ink">{item.value}</p>
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

            <article className="rounded-[1.6rem] border border-slate-200 bg-white p-4 text-ink shadow-sm sm:p-7">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-leaf/80 sm:text-sm sm:tracking-wide">Câu chuyện thương hiệu</p>
              <p className="mt-3 text-[0.96rem] leading-[1.7] text-slate-700 sm:text-base sm:leading-[1.8]">
                HTXONLINE ra đời để giúp hợp tác xã Việt Nam đưa nông sản địa phương lên môi trường số một cách minh bạch. Chúng tôi kết hợp sàn bán hàng,
                QR Passport và dashboard vận hành để HTX tập trung vào chất lượng sản phẩm, còn người mua dễ dàng tin tưởng nguồn gốc.
              </p>
              <p className="mt-2.5 text-[0.84rem] leading-[1.66] text-slate-600 sm:mt-3 sm:text-sm sm:leading-[1.75]">
                Không chỉ là website giới thiệu, đây là hệ sinh thái sản xuất, truy xuất và bán hàng trên cùng một nền tảng.
              </p>
              <div className="mt-3.5 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {trustSignals.map((item) => (
                  <div key={item} className="rounded-xl bg-[#f8faf7] px-2.5 py-2 text-[0.8rem] leading-[1.4] text-slate-700 ring-1 ring-mint/60 sm:px-3 sm:py-2.5 sm:text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-8 sm:py-10')}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-sm sm:p-5">
                <p className="text-[1.7rem] font-bold text-leaf sm:text-3xl">{item.value}</p>
                <p className="mt-1 text-[0.82rem] leading-[1.55] text-slate-600 sm:mt-1.5 sm:text-sm sm:leading-[1.65]">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-3 sm:pb-4')}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Thông tin pháp lý</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">{legalEntityProfile.organizationName}</h2>
              <p className="mt-2 text-[0.92rem] leading-[1.68] text-slate-600 sm:text-base sm:leading-7">
                Hồ sơ pháp lý trên giấy chứng nhận được tách rõ với thông tin liên hệ công khai trên website để người xem dễ đối chiếu khi cần xác minh.
              </p>
              <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Giấy chứng nhận</p>
                  <p className="mt-2 text-base font-bold text-ink">{legalEntityProfile.certificateTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Mã số tổ hợp tác</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Địa chỉ và người đại diện theo hồ sơ</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Người đại diện: {legalEntityProfile.representative}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Email hồ sơ: {legalEntityProfile.legalEmail} · Điện thoại hồ sơ: {legalEntityProfile.legalPhone}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.7rem] bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Thông tin công khai trên HTXONLINE</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">Kênh liên hệ dành cho khách hàng và HTX</h2>
              <p className="mt-2.5 text-[0.92rem] leading-[1.68] text-slate-600 sm:text-base sm:leading-7">
                Bộ thông tin này đang được dùng đồng nhất ở footer, liên hệ và các trang chính sách theo nội dung bạn cung cấp trong tài liệu cập nhật.
              </p>
              <div className="mt-4 grid gap-3 sm:mt-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Địa chỉ công khai</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{siteProfile.address}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hotline</p>
                    <p className="mt-2 text-lg font-bold text-ink">{siteProfile.hotlineDisplay}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Email hỗ trợ</p>
                    <p className="mt-2 break-all text-lg font-bold text-ink">{siteProfile.supportEmail}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Khi cần đối chiếu hồ sơ, người dùng có thể xem phần thông tin pháp lý ở cùng trang này hoặc liên hệ trực tiếp qua trang liên hệ.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white py-9 sm:py-12">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-[1.85rem] font-bold leading-tight text-ink sm:text-3xl">Thành công được tạo dựng từ giá trị khác biệt</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                HTXONLINE giúp HTX hiện diện trên thị trường số bằng dữ liệu minh bạch, quy trình bán hàng rõ ràng và trải nghiệm mua sắm đơn giản.
              </p>
            </div>
            <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4">
              {valuePillars.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f8faf7] p-4 shadow-sm sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf text-white sm:h-12 sm:w-12">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[1.05rem] font-bold leading-tight text-ink sm:mt-4 sm:text-xl">{item.title}</h3>
                  <p className="mt-2 text-[0.84rem] leading-[1.65] text-slate-600 sm:text-sm sm:leading-7">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-9 sm:py-12')}>
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#f8faf7_0%,#edf7f0_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <article className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                  <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Tầm nhìn</p>
                  <h3 className="mt-2 text-[1.38rem] font-bold leading-[1.12] text-ink sm:text-2xl">Trở thành nền tảng số tin cậy cho hợp tác xã nông nghiệp Việt Nam.</h3>
                  <p className="mt-2.5 text-[0.84rem] leading-[1.65] text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                    Mỗi HTX có thể kể câu chuyện nguồn gốc rõ ràng, mỗi người mua đều kiểm tra được sản phẩm trước khi quyết định mua.
                  </p>
                </article>
                <article className="rounded-2xl bg-leaf p-4 text-white shadow-sm sm:p-5">
                  <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-sm sm:tracking-wide">Sứ mệnh</p>
                  <h3 className="mt-2 text-[1.38rem] font-bold leading-[1.12] sm:text-2xl">Số hóa bán hàng và truy xuất nguồn gốc cho HTX.</h3>
                  <p className="mt-2.5 text-[0.84rem] leading-[1.65] text-white/85 sm:mt-3 sm:text-sm sm:leading-7">
                    Chúng tôi mang đến công cụ thực tế: sàn public, QR Passport, dashboard vận hành và đơn COD để HTX phát triển bền vững hơn.
                  </p>
                </article>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Bản đồ giá trị</p>
              <h3 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">Một hành trình rõ ràng từ niềm tin đến đơn hàng.</h3>
              <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-3">
                {journeySteps.map((step, index) => (
                  <article key={step.title} className={cn('rounded-2xl border p-3.5 shadow-sm sm:p-4', step.accent)}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-leaf text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                        <step.icon size={18} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[0.72rem] sm:tracking-[0.18em]">Bước {index + 1}</p>
                        <h4 className="mt-1 text-[1rem] font-bold leading-tight text-ink sm:text-lg">{step.title}</h4>
                        <p className="mt-1.5 text-[0.82rem] leading-[1.58] text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{step.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-9 sm:py-12">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-[1.85rem] font-bold leading-tight text-ink sm:text-3xl">Giá trị cốt lõi</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">Những nguyên tắc định hướng mọi sản phẩm và dịch vụ trên HTXONLINE.</p>
            </div>
            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-5">
              {coreValues.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f8faf7] p-4 text-center shadow-sm sm:p-5">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-leaf text-white sm:h-12 sm:w-12">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[0.98rem] font-bold leading-tight text-ink sm:mt-4 sm:text-base">{item.title}</h3>
                  <p className="mt-1.5 text-[0.82rem] leading-[1.58] text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-9 sm:py-12')}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.7rem] bg-[linear-gradient(180deg,#245f3e_0%,#1b4f33_100%)] p-4 text-white shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-white/70 sm:text-sm sm:tracking-wide">Đội ngũ đồng hành</p>
              <h2 className="mt-2 max-w-lg text-[1.7rem] font-bold leading-[1.12] sm:text-3xl">Những con người trẻ cùng đam mê tạo nên giá trị lớn cho nông sản Việt.</h2>
              <p className="mt-3 max-w-xl text-[0.84rem] leading-[1.66] text-white/82 sm:mt-4 sm:text-sm sm:leading-7">
                Chúng tôi làm việc để HTX dễ hiện diện hơn trên môi trường số, còn người mua có thêm niềm tin khi chọn sản phẩm minh bạch nguồn gốc.
              </p>
              <div className="mt-4 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 sm:p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/65 sm:text-[0.72rem] sm:tracking-[0.18em]">Onboarding</p>
                  <p className="mt-1.5 text-[1.02rem] font-bold sm:mt-2 sm:text-xl">HTX mới</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 sm:p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/65 sm:text-[0.72rem] sm:tracking-[0.18em]">Chuẩn hóa</p>
                  <p className="mt-1.5 text-[1.02rem] font-bold sm:mt-2 sm:text-xl">QR & vùng trồng</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 sm:p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/65 sm:text-[0.72rem] sm:tracking-[0.18em]">Vận hành</p>
                  <p className="mt-1.5 text-[1.02rem] font-bold sm:mt-2 sm:text-xl">Đơn COD</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Đối tác & niềm tin</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">{catalog.cooperatives.length || 12}+ HTX đồng hành</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                Cảm ơn các hợp tác xã và người mua đã tin tưởng HTXONLINE để kết nối nông sản minh bạch trên môi trường số.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                {featuredCooperatives.map((coop) => (
                  <div key={coop.id} className="rounded-xl border border-slate-200 bg-[#f8faf7] px-3 py-3 text-center">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-[1.45] text-slate-700 sm:text-xs">{'name' in coop ? coop.name : 'HTX'}</p>
                  </div>
                ))}
              </div>
              <Link href="/htx" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf sm:mt-5">
                Xem danh sách HTX
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-12 pt-3 sm:pt-4')}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-100 bg-mint/70 px-4 py-4 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Bắt đầu cùng HTXONLINE</p>
                  <h2 className="mt-2 max-w-2xl text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">
                    HTX muốn tham gia sàn hoặc cần tư vấn triển khai truy xuất?
                  </h2>
                </div>
                <p className="max-w-md text-[0.84rem] leading-[1.6] text-slate-600 sm:text-sm sm:leading-6">
                  Để lại thông tin, đội vận hành sẽ hỗ trợ onboarding và hướng dẫn quy trình phù hợp với HTX của bạn.
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-8">
              <PublicContactForm sourcePath="/ve-chung-toi" variant="hero" />
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
