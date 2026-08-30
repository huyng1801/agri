import Link from 'next/link';
import { ArrowRight, CheckCircle2, QrCode, ShoppingBag, Store, Users } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { ecosystemCards } from '@/components/public-ecosystem-showcase';
import { Button, cn } from '@/components/ui';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Giới thiệu',
    description: 'Nền tảng sàn nông sản số và QR truy xuất nguồn gốc cho hợp tác xã Việt Nam.',
    path: '/gioi-thieu'
  });
}

const internalFeatureCards = [
  {
    title: 'Quản trị xã viên tập trung',
    description: 'Tập trung hồ sơ thành viên, trạng thái tham gia và dữ liệu hoạt động nội bộ trên cùng một nơi dễ theo dõi.',
    icon: Users
  },
  {
    title: 'Theo dõi dịch vụ, thu chi, xuất nhập',
    description: 'Ghi nhận mức độ sử dụng dịch vụ, các khoản thu chi và biến động nhập xuất để hỗ trợ đối soát tốt hơn.',
    icon: ShoppingBag
  },
  {
    title: 'Đồng bộ dữ liệu sản phẩm',
    description: 'Sản phẩm sau khi chuẩn hóa có thể đẩy sang Agripassport mà không phải nhập lại nhiều lần.',
    icon: Store
  },
  {
    title: 'Chuẩn bị sẵn QR truy xuất',
    description: 'Khi dữ liệu đã đủ chuẩn, HTX có thể mở hồ sơ số và QR truy xuất trên đúng lớp công khai.',
    icon: QrCode
  }
] as const;

const workflowPoints = [
  'Bắt đầu từ quản trị nội bộ thay vì cố đẩy toàn bộ quy trình ra giao diện public.',
  'Tách rõ lớp dữ liệu HTXONLINE, AGRIPASSPORT và Hộ chiếu nông nghiệp.',
  'Ưu tiên nhịp mobile-first: đọc nhanh, bấm rõ, ít tầng thông tin thừa.',
  'Mỗi nền tảng có một vai trò nên người xem vào là hiểu ngay đang ở đâu.'
] as const;

export default async function AboutPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const isInternal = siteKey === 'htxonline';
  const cards = isInternal ? ecosystemCards : ecosystemCards.filter((card) => card.key !== 'htxonline');
  const heroStats = isInternal
    ? ['Xã viên', 'Thu chi', 'Đồng bộ dữ liệu']
    : ['Sản phẩm', 'QR truy xuất', 'Công khai'];

  return (
    <PublicShell>
      <main id="main-content">
        <section className="overflow-hidden border-b border-[#d3e5ea] bg-[#c7e1eb]">
          <div className={cn(publicContainerClass, 'py-5 sm:py-6')}>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#1f2233] sm:text-[1rem]">
              <Link href="/" className="transition hover:text-[#1f9b4b]">
                Trang Chủ
              </Link>
              <span aria-hidden="true">→</span>
              <span className="font-medium">Vai Trò Nền Tảng</span>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className={cn(publicContainerClass, 'grid gap-5 py-7 sm:gap-6 sm:py-9 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-8 lg:py-12')}>
            <div className="max-w-[42rem]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#82a954] sm:text-sm">Nền tảng</p>
              <h1 className="mt-2 text-[2rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-[#1f2233] sm:text-[3rem] lg:text-[3.35rem]">
                {isInternal ? 'Giải pháp dịch vụ tiêu biểu cho HTX số' : siteProfile.pageContent.introTitle}
              </h1>
              <p className="mt-4 text-[1rem] leading-8 text-slate-700 sm:text-[1.05rem]">
                {isInternal
                  ? 'HTXONLINE giữ vai trò quản trị nội bộ, còn AGRIPASSPORT và Hộ chiếu nông nghiệp là hai lớp công khai bên ngoài. Nhìn vào là hiểu ngay lớp nào dùng để vận hành, lớp nào dùng để công khai sản phẩm và lớp nào dùng để truy xuất QR.'
                  : siteProfile.pageContent.introDescription}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/ve-chung-toi">
                  <Button className="min-h-12 w-full sm:w-auto">
                    Về chúng tôi
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/lien-he">
                  <Button variant="ghost" className="min-h-12 w-full sm:w-auto">
                    Liên hệ triển khai
                  </Button>
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {heroStats.map((item) => (
                  <span
                    key={item}
                    className="inline-flex min-h-10 items-center rounded-full border border-[#dbe7d8] bg-[#f5faf2] px-4 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#2b8a3e]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <article className="overflow-hidden rounded-[2rem] border border-[#e1e7dd] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="p-3 sm:p-4">
                  <div className="overflow-hidden rounded-[1.6rem] border border-[#e6ebdf]">
                    <PublicImage
                      src={siteProfile.pageContent.introImageUrl}
                      alt={siteProfile.pageContent.introImageAlt || siteProfile.pageContent.introTitle}
                      wrapperClassName="aspect-[1.18/1] w-full"
                      className="h-full w-full object-cover"
                      priority
                    />
                  </div>
                </div>
                <div className="bg-[linear-gradient(145deg,#0e1321_0%,#12344b_52%,#1f9b4b_100%)] p-5 text-white sm:p-6">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/68">HTXONLINE</p>
                  <h2 className="mt-3 text-[1.55rem] font-extrabold leading-[1.06] sm:text-[2rem]">
                    Quản trị nội bộ trước, công khai đúng lớp sau.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/82 sm:text-[0.98rem]">
                    Đây là điểm khác biệt cốt lõi của hệ sinh thái Agri: dữ liệu trong HTXONLINE được chuẩn hóa trước, sau đó mới đẩy sang lớp sản phẩm công khai hoặc QR truy xuất khi cần.
                  </p>

                  <div className="mt-5 grid gap-3">
                    {workflowPoints.slice(0, 2).map((item) => (
                      <div key={item} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-3 text-sm leading-6 text-white/88">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-[#faf9f3] py-8 sm:py-10 lg:py-12">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#82a954] sm:text-sm">Hệ sinh thái giải pháp toàn diện</p>
                <h2 className="mt-2 text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#24283a] sm:text-[2.75rem]">
                  Giải pháp dịch vụ tiêu biểu
                </h2>
                <p className="mt-3 text-[0.96rem] leading-7 text-slate-600 sm:text-base">
                  Ba card lớn bên dưới giúp nhìn nhanh vai trò thật của từng nền tảng trong hệ sinh thái Agri.
                </p>
              </div>
              <Link
                href="/ve-chung-toi"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8e7d8] bg-white px-5 text-sm font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
              >
                Khám phá thêm
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-5 grid gap-4">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <a
                    key={card.key}
                    href={card.href}
                    className="group relative overflow-hidden rounded-[2rem] text-white shadow-[0_20px_42px_rgba(15,23,42,0.12)] transition hover:-translate-y-1"
                  >
                    <div className={cn('absolute inset-0', card.gradientClassName)} />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-80"
                      style={{
                        background:
                          'radial-gradient(circle at left top, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 90% 22%, rgba(255,255,255,0.12), transparent 24%)'
                      }}
                    />
                    <div className="relative grid gap-4 px-5 py-5 sm:px-6 sm:py-6 md:grid-cols-[6.2rem_1fr] md:items-center">
                      <div className="grid h-[5.8rem] w-[5.8rem] place-items-center rounded-full border border-white/16 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] sm:h-[6.4rem] sm:w-[6.4rem]">
                        <Icon size={42} strokeWidth={1.8} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/70">{card.label}</p>
                        <h3 className="mt-2 text-[1.35rem] font-extrabold leading-tight sm:text-[1.85rem]">{card.name}</h3>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/84 sm:text-[1rem]">{card.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-8 sm:py-10 lg:py-12">
          <div className={cn(publicContainerClass, 'grid gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-5')}>
            <article className="rounded-[2rem] border border-[#e4eadf] bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#82a954] sm:text-sm">HTXONLINE quản trị gì</p>
              <h2 className="mt-2 text-[1.85rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-[#24283a] sm:text-[2.55rem]">
                Một lớp dữ liệu quản trị rõ ràng để không bị rối trong hệ Agri.
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {internalFeatureCards.map((item) => (
                  <article key={item.title} className="rounded-[1.45rem] border border-[#e3eadf] bg-[#f9fbf7] p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf7eb] text-[#2b8a3e]">
                      <item.icon size={20} aria-hidden="true" />
                    </span>
                    <h3 className="mt-3 text-[1rem] font-bold leading-6 text-[#1f2233]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[#e4eadf] bg-[#f8faf7] p-5 shadow-sm sm:p-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#82a954] sm:text-sm">Nguyên tắc triển khai</p>
              <h2 className="mt-2 text-[1.85rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-[#24283a] sm:text-[2.55rem]">
                Nhìn vào là hiểu luồng từ nội bộ ra công khai.
              </h2>
              <div className="mt-5 grid gap-3">
                {workflowPoints.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.35rem] border border-[#dce7d9] bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#1f9b4b]" size={18} aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.45rem] bg-[linear-gradient(135deg,#0f172a_0%,#12344b_48%,#1f9b4b_100%)] p-4 text-white">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/68">Bước tiếp theo</p>
                <p className="mt-2 text-lg font-extrabold leading-7">Muốn triển khai hiệu quả, giao diện cần headline rõ, card lớn và CTA dễ bấm để HTX lẫn người mua dùng tốt trên mobile.</p>
                <Link href="/lien-he" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-[#1f2233] transition hover:-translate-y-0.5">
                  Nhận tư vấn triển khai
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
