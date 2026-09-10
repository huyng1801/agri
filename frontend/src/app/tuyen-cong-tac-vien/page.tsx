import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  HeartHandshake,
  Leaf,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  TrendingUp,
  UsersRound
} from 'lucide-react';
import { PassportCollaboratorForm } from '@/components/passport-collaborator-form';
import { PublicImage } from '@/components/public-image';
import { PublicFaqItem, PublicPageMain } from '@/components/public-layout';
import { PublicLogo } from '@/components/public-logo';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Tuyển Cộng tác viên Chuyển đổi số Nông nghiệp',
    description: 'Gia nhập mạng lưới cộng tác viên Hộ Chiếu Nông Nghiệp: đồng hành cùng các hợp tác xã số hóa vùng canh tác, cấp mã QR truy xuất nguồn gốc và gia tăng thu nhập linh hoạt.',
    path: '/tuyen-cong-tac-vien',
    keywords: ['cộng tác viên nông nghiệp', 'chuyển đổi số HTX', 'hồ sơ số', 'truy xuất QR']
  });
}

const personas = [
  {
    icon: Sprout,
    title: 'Kỹ sư Nông nghiệp & Khuyến nông viên',
    highlight: 'Chuyên môn kỹ thuật sâu',
    desc: 'Hiểu rõ quy trình sinh trưởng, mùa vụ, tiêu chuẩn VietGAP/GlobalGAP và quản lý vật tư đầu vào.',
    role: 'Hỗ trợ nông hộ lập nhật ký canh tác chuẩn hóa và thẩm định quy trình thực tế tại vườn.'
  },
  {
    icon: HeartHandshake,
    title: 'Cán bộ & Xã viên nòng cốt HTX',
    highlight: 'Thấu hiểu địa phương',
    desc: 'Gắn bó trực tiếp với cộng đồng nhà nông, nắm bắt hiện trạng phân lô ruộng đất và năng lực sản xuất.',
    role: 'Làm cầu nối triển khai chuyển đổi số trực tiếp cho các thành viên trong hợp tác xã.'
  },
  {
    icon: GraduationCap,
    title: 'Thanh niên & Sinh viên Nông nghiệp',
    highlight: 'Năng động & am hiểu công nghệ',
    desc: 'Thành thạo ứng dụng di động, mạng xã hội, nhạy bén với công nghệ và mong muốn cống hiến cho quê hương.',
    role: 'Hướng dẫn nông dân dùng smartphone chụp ảnh nhật ký, gắn tem QR và kiểm tra thông tin.'
  },
  {
    icon: TrendingUp,
    title: 'Chuyên viên Kinh doanh & Chuỗi cung ứng',
    highlight: 'Kết nối đầu ra nông sản',
    desc: 'Có mối quan hệ với các chuỗi siêu thị, cửa hàng thực phẩm an toàn, đại lý thu mua và doanh nghiệp chế biến.',
    role: 'Hỗ trợ HTX đưa các sản phẩm đã cấp Hộ Chiếu Nông Nghiệp tiếp cận kênh phân phối cao cấp.'
  }
];

const unifiedSteps = [
  {
    step: '01',
    title: 'Kết nối & Khảo sát Hợp tác xã',
    desc: 'Tiếp cận hợp tác xã hoặc vùng trồng tại địa phương, nắm bắt nhu cầu chuẩn hóa dữ liệu và minh bạch nguồn gốc sản phẩm.'
  },
  {
    step: '02',
    title: 'Hướng dẫn số hóa vùng trồng & nhật ký',
    desc: 'Cùng ban quản trị HTX nhập dữ liệu diện tích, giống cây trồng và thiết lập thói quen ghi nhật ký chăm bón, thu hoạch.'
  },
  {
    step: '03',
    title: 'Thẩm định hồ sơ & cấp Hộ Chiếu Số',
    desc: 'Đội ngũ kỹ thuật của nền tảng hỗ trợ kiểm tra tính xác thực, cấp mã số định danh và kích hoạt hồ sơ QR Passport.'
  },
  {
    step: '04',
    title: 'Gắn tem QR & Mở rộng tiêu thụ',
    desc: 'Đưa sản phẩm đã cấp tem chứng thư ra thị trường, giúp người tiêu dùng quét mã tra cứu và ghi nhận kết quả cộng tác.'
  }
];

const benefits = [
  {
    icon: Clock,
    title: 'Thu nhập linh hoạt',
    desc: 'Chủ động thời gian, nhận thù lao và chính sách hoa hồng xứng đáng theo từng hồ sơ HTX hoàn tất thành công.'
  },
  {
    icon: ShieldCheck,
    title: 'Quy trình chuẩn hóa sẵn sàng',
    desc: 'Được đào tạo bài bản từ công cụ phần mềm đến mẫu biểu thu thập dữ liệu, không phải tự mày mò từ đầu.'
  },
  {
    icon: UsersRound,
    title: 'Đồng hành cùng đội ngũ chuyên gia',
    desc: 'Nhóm kỹ thuật và chuyên gia nông nghiệp luôn sát cánh hỗ trợ tháo gỡ vướng mắc trong suốt quá trình thực địa.'
  },
  {
    icon: Award,
    title: 'Ý nghĩa xã hội thiết thực',
    desc: 'Góp phần trực tiếp bảo vệ thương hiệu nông sản Việt, bảo vệ quyền lợi người tiêu dùng và nâng cao giá trị nhà nông.'
  }
];

const faqs = [
  {
    question: 'Đây có phải công việc bán hàng đa cấp hay kinh doanh hàng hóa không?',
    answer: 'Hoàn toàn không. Vai trò của CTV là chuyên viên hỗ trợ công nghệ: giúp hợp tác xã chuẩn hóa thông tin, đưa dữ liệu canh tác lên nền tảng số và hoàn thiện hồ sơ cấp tem QR Passport.'
  },
  {
    question: 'Tôi chưa có kinh nghiệm công nghệ có thể tham gia được không?',
    answer: 'Có. Giao diện nền tảng được thiết kế tối giản trên điện thoại di động. Đội ngũ chuyên gia sẽ đào tạo 1-1 qua các buổi hướng dẫn ngắn gọn cho đến khi bạn thành thạo quy trình.'
  },
  {
    question: 'Tôi có thể làm cộng tác viên bán thời gian song song với công việc chính không?',
    answer: 'Hoàn toàn phù hợp. Bạn toàn quyền chủ động sắp xếp thời gian làm việc tùy theo lịch trình cá nhân và khu vực sinh sống.'
  },
  {
    question: 'Khi nào hồ sơ hợp tác xã được tính là hoàn thành?',
    answer: 'Hồ sơ được ghi nhận hoàn thành khi thông tin vùng trồng, sản phẩm và chứng nhận của HTX được thẩm định đạt chuẩn và sản phẩm được kích hoạt mã QR Passport công khai trên hệ thống.'
  }
];

export default async function PassportCollaboratorPage() {
  return (
    <PublicShell>
      <PublicPageMain className="py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* =========================================================================
            1. HERO SECTION: RICH PHOTOGRAPHY & VALUE PROPOSITION
           ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#062c22_0%,#0d7a28_60%,#106f8a_100%)] p-6 sm:p-10 lg:p-14 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border-[30px] border-white/10" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#d6f3c7]">
                <Leaf size={14} />
                <span>Mạng lưới Chuyển đổi số Nông nghiệp</span>
              </span>

              <h1 className="type-hero-h1 text-white leading-tight">
                Cùng Hộ Chiếu Nông Nghiệp{' '}
                <span className="block text-[#b8edc0]">
                  Đồng hành số hóa Hợp tác xã
                </span>
              </h1>

              <p className="type-body-large text-white/85 max-w-2xl leading-relaxed">
                Gia nhập mạng lưới cộng tác viên trên toàn quốc: hỗ trợ bà con nông dân chuẩn hóa quy trình canh tác, đưa nông sản lên nền tảng truy xuất nguồn gốc số và tạo thu nhập bền vững.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#dang-ky"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#062c22] shadow-md transition hover:bg-[#d6f3c7] active:scale-95"
                >
                  <span>Đăng ký tham gia ngay</span>
                  <ArrowRight size={16} />
                </a>

                <a
                  href="#quy-trinh"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                >
                  <span>Xem quy trình cộng tác</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs font-medium text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#b8edc0]" />
                  Chủ động thời gian
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#b8edc0]" />
                  Được đào tạo 1-1 bài bản
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#b8edc0]" />
                  Gia tăng thu nhập xứng đáng
                </span>
              </div>
            </div>

            {/* Right: Media Showcase */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/10">
                  <PublicImage
                    src="/hero/htx-farmer-hero-v1.png"
                    alt="Cộng tác viên hỗ trợ nông dân tại hiện trường"
                    fallback="/news/field-qr.webp"
                    priority
                    wrapperClassName="h-full w-full"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-[#062c22]/85 p-3.5 backdrop-blur-md">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#b8edc0]">
                      Sứ mệnh đồng hành
                    </p>
                    <p className="text-xs font-bold text-white mt-0.5">
                      Mang công nghệ số tới từng nông hộ & mảnh vườn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. QUYỀN LỢI CỦA CỘNG TÁC VIÊN (4 BENEFITS)
           ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
              Giá trị nhận được
            </span>
            <h2 className="type-h2 text-[var(--text-primary)]">
              Tại sao nên trở thành Cộng tác viên?
            </h2>
            <p className="type-body text-[var(--text-secondary)]">
              Cơ hội phát triển năng lực cá nhân, mở rộng quan hệ với các HTX và tạo giá trị bền vững cho cộng đồng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs transition hover:border-[#0d7a28]/40 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d7a28]/10 text-[#0d7a28] mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. 4 PERSONA THẺ CARD: AI PHÙ HỢP?
           ========================================================================= */}
        <section className="rounded-3xl bg-[var(--surface-muted)] p-6 sm:p-10 lg:p-12 border border-[var(--border)] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
              Đối tượng tham gia
            </span>
            <h2 className="type-h2 text-[var(--text-primary)]">
              Ai là người phù hợp nhất với vai trò này?
            </h2>
            <p className="type-body text-[var(--text-secondary)]">
              Bạn không cần có sẵn mạng lưới lớn — chỉ cần am hiểu địa phương và nhiệt huyết cùng nông nghiệp sạch.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona, idx) => {
              const Icon = persona.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs flex flex-col justify-between transition duration-300 hover:-translate-y-1 hover:border-[#0d7a28]/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d7a28]/10 text-[#0d7a28] mb-4">
                      <Icon size={24} />
                    </div>
                    <span className="inline-block rounded-md bg-[#0d7a28]/10 px-2 py-0.5 text-[10px] font-bold text-[#0d7a28]">
                      {persona.highlight}
                    </span>
                    <h3 className="mt-2.5 text-base font-bold text-[var(--text-primary)]">
                      {persona.title}
                    </h3>
                    <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {persona.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-[11px] font-semibold text-[#0d7a28] leading-normal">
                      <strong className="font-bold">Đóng góp chính:</strong> {persona.role}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            4. QUY TRÌNH 4 BƯỚC THỐNG NHẤT (MERGED UNIFIED WORKFLOW)
           ========================================================================= */}
        <section id="quy-trinh" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
              Lộ trình triển khai
            </span>
            <h2 className="type-h2 text-[var(--text-primary)]">
              Bốn bước hỗ trợ Hợp tác xã số hóa
            </h2>
            <p className="type-body text-[var(--text-secondary)]">
              Quy trình khép kín, minh bạch và có sự đồng hành trực tiếp từ ban quản trị nền tảng.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {unifiedSteps.map((s, idx) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-3xl font-black text-[#0d7a28]">
                    {s.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[var(--text-primary)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-semibold text-[#0d7a28]">
                  <CheckCircle2 size={13} />
                  <span>Bước {idx + 1} của quy trình</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. FAQ SECTION (CÂU HỎI THƯỜNG GẶP)
           ========================================================================= */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0d7a28]">
                Giải đáp thắc mắc
              </span>
              <h2 className="type-h2 text-[var(--text-primary)]">
                Những điều ứng viên thường quan tâm
              </h2>
              <p className="type-body text-[var(--text-secondary)]">
                Nếu bạn cần hỗ trợ thêm thông tin chi tiết, đừng ngần ngại liên hệ đường dây nóng của chúng tôi.
              </p>
              <div className="pt-2">
                <a
                  href="#dang-ky"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0d7a28] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0a6120]"
                >
                  <span>Điền form đăng ký</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {faqs.map((faq, idx) => (
                <PublicFaqItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. REGISTRATION FORM: 2-COLUMN DESKTOP / 1-COLUMN MOBILE
           ========================================================================= */}
        <section id="dang-ky" className="scroll-mt-20">
          <div className="rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 lg:items-start">
              {/* Left Column: Form introduction & Support info (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0d7a28]/10 px-2.5 py-1 text-xs font-bold text-[#0d7a28]">
                    <Sparkles size={13} />
                    <span>Đăng ký tham gia</span>
                  </span>
                  <h2 className="type-h2 text-[var(--text-primary)] mt-3">
                    Gia nhập mạng lưới Cộng tác viên
                  </h2>
                  <p className="type-body text-[var(--text-secondary)] mt-2">
                    Điền thông tin cơ bản bên cạnh. Đội ngũ vận hành của Hộ Chiếu Nông Nghiệp sẽ liên hệ lại trong vòng 24 giờ làm việc để hướng dẫn chi tiết.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                  <div className="aspect-[16/9] w-full overflow-hidden">
                    <PublicImage
                      src="/hero/passport-about-hero.png"
                      alt="Nông dân và cộng tác viên cùng kiểm tra nông sản"
                      fallback="/news/field-qr.webp"
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <p className="font-bold text-[var(--text-primary)]">
                      Hỗ trợ trực tiếp từ Ban Điều Hành:
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      Hotline / Zalo: <a href="tel:0907001200" className="font-bold text-[#0d7a28]">0907 001 200</a>
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      Email hỗ trợ: <a href="mailto:Agripassport@gmail.com" className="font-bold text-[#0d7a28]">Agripassport@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Registration Form (7 cols) */}
              <div className="lg:col-span-7">
                <PassportCollaboratorForm />
              </div>
            </div>
          </div>
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
