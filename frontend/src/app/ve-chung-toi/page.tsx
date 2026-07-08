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
];

const coreValues = [
  { title: 'Minh bạch', description: 'Nguồn gốc và dữ liệu public rõ ràng với người mua.', icon: ShieldCheck },
  { title: 'Đồng hành HTX', description: 'Hỗ trợ HTX số hóa và tiếp cận thị trường tốt hơn.', icon: Leaf },
  { title: 'Tin cậy', description: 'Quy trình bán hàng COD và truy xuất có kiểm soát.', icon: BadgeCheck },
  { title: 'Đơn giản', description: 'Dùng được ngay, không cần xây website riêng.', icon: Sparkles },
  { title: 'Lan tỏa giá trị', description: 'Kết nối nông sản địa phương với người tiêu dùng.', icon: Target }
];

const storyHighlights = [
  {
    title: 'Từ trang trại đến bàn ăn',
    description: 'HTX đưa sản phẩm lên sàn kèm dữ liệu nhật ký, vùng trồng và QR Passport.',
    image: 'https://picsum.photos/seed/htxonline-about-farm/900/700'
  },
  {
    title: 'Số hóa vận hành HTX',
    description: 'Dashboard giúp quản lý sản phẩm, chứng nhận, đơn COD và báo cáo.',
    image: 'https://picsum.photos/seed/htxonline-about-ops/900/700'
  },
  {
    title: 'Kết nối thị trường',
    description: 'Người mua tìm sản phẩm, mua COD và kiểm tra nguồn gốc chỉ với một lần quét.',
    image: 'https://picsum.photos/seed/htxonline-about-market/900/700'
  },
  {
    title: 'Đội ngũ đồng hành',
    description: 'Hỗ trợ onboarding HTX, triển khai QR và vận hành bán hàng số.',
    image: 'https://picsum.photos/seed/htxonline-about-team/900/700'
  }
];

export default async function AboutUsPage() {
  const catalog = await fetchPublicCatalog(100);
  const stats = [
    { value: `${catalog.cooperatives.length || 12}+`, label: 'HTX đang hiển thị trên sàn' },
    { value: `${catalog.totalProducts || 60}+`, label: 'Sản phẩm public đang bán' },
    { value: '100%', label: 'QR Passport xem được không cần đăng nhập' },
    { value: '1 nền tảng', label: 'Từ sản xuất đến bán hàng COD' }
  ];

  return (
    <PublicShell>
      <main id="main-content">
        <section className="relative overflow-hidden bg-mint/60">
          <div className={cn(publicContainerClass, 'relative grid items-center gap-6 py-12 lg:grid-cols-[1fr_0.85fr_1fr] lg:py-16')}>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Về chúng tôi</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Chúng tôi là
                <span className="mt-2 block text-leaf">HTXONLINE</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-700">
                Sàn nông sản số giúp hợp tác xã kết nối thị trường, minh bạch nguồn gốc và bán hàng COD hiệu quả.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/lien-he">
                  <Button>
                    Liên hệ tư vấn
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/san-pham">
                  <Button variant="ghost">Xem sản phẩm</Button>
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-lg">
                <img
                  src="https://picsum.photos/seed/htxonline-about-hero/720/900"
                  alt="Đội ngũ HTXONLINE đồng hành cùng hợp tác xã"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-slate-200 backdrop-blur">
                <div className="flex items-center gap-3">
                  <PublicLogo size={40} />
                  <div>
                    <p className="text-sm font-bold text-ink">HTXONLINE</p>
                    <p className="text-xs text-slate-500">Đồng hành số hóa cho hợp tác xã</p>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-2xl bg-leaf p-6 text-white shadow-sm sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/75">Câu chuyện thương hiệu</p>
              <p className="mt-4 text-base leading-7 text-white/95">
                HTXONLINE ra đời để giúp hợp tác xã Việt Nam đưa nông sản địa phương lên môi trường số một cách minh bạch.
                Chúng tôi kết hợp sàn bán hàng, QR Passport và dashboard vận hành để HTX tập trung vào chất lượng sản phẩm,
                còn người mua dễ dàng tin tưởng nguồn gốc.
              </p>
              <p className="mt-4 text-sm leading-6 text-white/80">
                Không chỉ là website giới thiệu — đây là hệ sinh thái sản xuất → truy xuất → bán hàng → báo cáo trên cùng một nền tảng.
              </p>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10')}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-leaf">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
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
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <img
                src="https://picsum.photos/seed/htxonline-about-vision/1200/900"
                alt="Không gian vận hành và đồng hành cùng HTX"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-leaf">Tầm nhìn</p>
                <h3 className="mt-2 text-2xl font-bold text-ink">Trở thành nền tảng số tin cậy cho hợp tác xã nông nghiệp Việt Nam.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Mỗi HTX có thể kể câu chuyện nguồn gốc rõ ràng, mỗi người mua đều kiểm tra được sản phẩm trước khi quyết định mua.
                </p>
              </article>
              <article className="rounded-2xl bg-mint p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-leaf">Sứ mệnh</p>
                <h3 className="mt-2 text-2xl font-bold text-ink">Số hóa bán hàng và truy xuất nguồn gốc cho HTX.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Chúng tôi mang đến công cụ thực tế: sàn public, QR Passport, dashboard vận hành và đặt hàng COD — đơn giản để dùng, đủ mạnh để phát triển.
                </p>
              </article>
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
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink">Hành trình tạo giá trị</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">Từ đồng ruộng đến đơn hàng COD — mỗi bước đều hướng đến niềm tin của người mua.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storyHighlights.slice(0, 2).map((item) => (
              <article key={item.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src={item.image} alt={item.title} className="aspect-[5/3] w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
            <article className="flex min-h-[220px] items-center rounded-2xl bg-leaf p-6 text-white shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-2xl font-bold leading-snug">
                Những con người trẻ với cùng <span className="text-mint">đam mê</span> tạo nên <span className="text-mint">giá trị lớn</span> cho nông sản Việt.
              </p>
            </article>
            {storyHighlights.slice(2).map((item) => (
              <article key={item.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:col-span-1">
                <img src={item.image} alt={item.title} className="aspect-[5/3] w-full object-cover" />
                <div className="p-5">
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-mint p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Cam kết</p>
              <h3 className="mt-2 text-xl font-bold text-ink">Minh bạch từng sản phẩm</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Chỉ sản phẩm đã publish, vùng trồng public và dữ liệu được HTX chủ động công bố mới xuất hiện trên sàn.
              </p>
              <Link href="/huong-dan-mua-hang" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                Xem hướng dẫn mua hàng
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-12">
          <div className={cn(publicContainerClass, 'grid items-center gap-6 lg:grid-cols-2')}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <img
                src="https://picsum.photos/seed/htxonline-about-trust/1100/800"
                alt="HTXONLINE đồng hành cùng khách hàng và hợp tác xã"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Đối tác & niềm tin</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">{catalog.cooperatives.length || 12}+ HTX đồng hành</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Cảm ơn các hợp tác xã và người mua đã tin tưởng HTXONLINE để kết nối nông sản minh bạch trên môi trường số.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(catalog.cooperatives.slice(0, 6).length
                  ? catalog.cooperatives.slice(0, 6)
                  : Array.from({ length: 6 }).map((_, index) => ({ id: String(index), name: `HTX ${index + 1}`, code: `htx-${index}` }))
                ).map((coop) => (
                  <div key={coop.id} className="rounded-xl border border-slate-200 bg-[#f8faf7] px-3 py-4 text-center">
                    <p className="line-clamp-2 text-xs font-semibold text-slate-700">{'name' in coop ? coop.name : 'HTX'}</p>
                  </div>
                ))}
              </div>
              <Link href="/htx" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-leaf">
                Xem danh sách HTX
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
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
                  Để lại thông tin — đội vận hành sẽ hỗ trợ onboarding và hướng dẫn quy trình phù hợp với HTX của bạn.
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
