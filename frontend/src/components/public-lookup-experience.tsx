import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  History,
  MapPinned,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sprout,
  type LucideIcon
} from 'lucide-react';
import { PublicPageMain } from './public-layout';
import { Button, Input } from './ui';

type LookupKind = 'product' | 'tree';

type LookupConfig = {
  kind: LookupKind;
  eyebrow: string;
  title: string;
  description: string;
  inputLabel: string;
  placeholder: string;
  action: string;
  alternateLabel: string;
  alternateHref: string;
  alternateDescription: string;
  icon: LucideIcon;
  supportingLabel: string;
  supportingTitle: string;
  supportingDescription: string;
  benefits: Array<{ icon: LucideIcon; title: string; description: string }>;
};

const lookupConfigs: Record<LookupKind, LookupConfig> = {
  product: {
    kind: 'product',
    eyebrow: 'Tra cứu sản phẩm',
    title: 'Xem hành trình nông sản bằng mã QR',
    description:
      'Nhập mã in trên tem QR để mở hồ sơ lô hàng. Thông tin vùng trồng, nhật ký, thu hoạch hoặc giấy tờ chỉ xuất hiện khi hồ sơ có dữ liệu được phép công khai.',
    inputLabel: 'Mã sản phẩm hoặc mã lô',
    placeholder: 'Nhập mã trên tem QR',
    action: '/truy-xuat',
    alternateLabel: 'Tra cứu Hộ chiếu cây',
    alternateHref: '/cay',
    alternateDescription: 'Mở hồ sơ của từng cá thể cây, vùng trồng và dòng thời gian chăm sóc.',
    icon: QrCode,
    supportingLabel: 'Một lần quét, nhiều lớp dữ liệu',
    supportingTitle: 'Biết nông sản đến từ đâu trước khi chọn mua.',
    supportingDescription:
      'Hồ sơ công khai giúp bạn kiểm tra thông tin theo đúng sản phẩm thay vì phải tìm kiếm qua nhiều nguồn rời rạc.',
    benefits: [
      { icon: ScanLine, title: 'Quét hoặc nhập mã', description: 'Không cần đăng nhập và không phải cài thêm ứng dụng.' },
      { icon: MapPinned, title: 'Về đúng vùng trồng', description: 'Xem nơi sản xuất và đơn vị đang chịu trách nhiệm hồ sơ.' },
      { icon: ShieldCheck, title: 'Đối chiếu dữ liệu', description: 'Xem nhật ký, thu hoạch hoặc chứng nhận khi hồ sơ có thông tin đã công khai.' }
    ]
  },
  tree: {
    kind: 'tree',
    eyebrow: 'Tra cứu Hộ chiếu cây',
    title: 'Mở hồ sơ của từng cá thể cây',
    description:
      'Nhập mã cây trên tem QR để xem thông tin vùng sản xuất, giống cây, hình ảnh hoặc mốc chăm sóc nếu các dữ liệu đó đã được cập nhật và công khai.',
    inputLabel: 'Mã cây',
    placeholder: 'Nhập mã trên tem cây',
    action: '/cay',
    alternateLabel: 'Tra cứu sản phẩm',
    alternateHref: '/truy-xuat',
    alternateDescription: 'Mở hồ sơ của lô hàng và truy ngược về các cá thể cây tạo ra sản lượng.',
    icon: Sprout,
    supportingLabel: 'Định danh tận cây',
    supportingTitle: 'Mỗi cá thể có một câu chuyện sản xuất rõ ràng.',
    supportingDescription:
      'Hộ chiếu cây nối thông tin ngoài thực địa với hồ sơ số để người xem hiểu cây được chăm sóc và tạo ra nông sản như thế nào.',
    benefits: [
      { icon: ScanLine, title: 'Mã nằm trên tem cây', description: 'Dùng ứng dụng Camera của điện thoại để quét hoặc nhập mã thủ công.' },
      { icon: MapPinned, title: 'Xem vùng và giống cây', description: 'Biết vị trí, giống cây và đơn vị quản lý hồ sơ.' },
      { icon: History, title: 'Theo dõi dòng thời gian', description: 'Đọc các mốc chăm sóc, thu hoạch và cập nhật liên quan.' }
    ]
  }
};

function LookupStep({ number, icon: Icon, title, description }: { number: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <article className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--public-shadow-card)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <span className="text-xs font-extrabold tracking-[0.16em] text-[var(--brand-primary)]">{number}</span>
      </div>
      <h3 className="mt-4 text-base font-extrabold leading-6 text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </article>
  );
}

export function PublicLookupExperience({ kind }: { kind: LookupKind }) {
  const config = lookupConfigs[kind];
  const Icon = config.icon;

  return (
    <PublicPageMain className="py-8 sm:py-12 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)] lg:items-stretch lg:gap-8">
        <section
          aria-labelledby="lookup-page-title"
          className="order-2 relative isolate overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(145deg,var(--brand-primary-subtle)_0%,var(--surface-elevated)_62%,#ffffff_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:order-1 lg:p-10"
        >
          <div className="absolute -right-24 -top-24 -z-10 h-64 w-64 rounded-full bg-[var(--brand-primary-subtle)] blur-3xl" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand-primary)] text-white shadow-sm">
              <Icon size={24} aria-hidden="true" />
            </span>
            <p className="text-xs font-extrabold tracking-[0.16em] text-[var(--brand-primary)]">{config.eyebrow}</p>
          </div>

          <h1 id="lookup-page-title" className="mt-7 max-w-[15ch] text-[2.15rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[3.15rem]">
            {config.title}
          </h1>
          <p className="mt-5 max-w-[58ch] text-[0.98rem] leading-7 text-[var(--text-secondary)] sm:text-base sm:leading-8">
            {config.description}
          </p>

          <ul className="mt-8 space-y-4" aria-label="Lợi ích khi tra cứu">
            {config.benefits.map(({ icon: BenefitIcon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--brand-primary)]/10">
                  <BenefitIcon size={16} aria-hidden="true" />
                </span>
                <span>
                  <strong className="block text-sm font-extrabold text-[var(--text-primary)]">{title}</strong>
                  <span className="mt-0.5 block text-sm leading-6 text-[var(--text-secondary)]">{description}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="lookup-form-title" className="order-1 rounded-[2rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:order-2 lg:p-10">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-[var(--brand-primary)]">Bắt đầu tại đây</p>
              <h2 id="lookup-form-title" className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-[var(--text-primary)] sm:text-[2rem]">
                Nhập mã để mở hồ sơ
              </h2>
            </div>
            <BadgeCheck className="mt-1 shrink-0 text-[var(--brand-primary)]" size={24} aria-hidden="true" />
          </div>

          <form action={config.action} method="GET" className="mt-6" aria-describedby="lookup-form-help">
            <label htmlFor="public-lookup-code" className="text-sm font-bold text-[var(--text-primary)]">
              {config.inputLabel}
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Input
                id="public-lookup-code"
                required
                name="code"
                placeholder={config.placeholder}
                aria-label={config.inputLabel}
                autoComplete="off"
                spellCheck={false}
                className="min-h-12 sm:flex-1"
              />
              <Button type="submit" className="min-h-12 shrink-0 px-5 sm:px-6">
                <QrCode size={18} aria-hidden="true" />
                Mở hồ sơ
              </Button>
            </div>
            <p id="lookup-form-help" className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Dùng ứng dụng Camera của điện thoại để quét mã. Nếu liên kết không tự mở hồ sơ, hãy nhập chuỗi mã in trên tem.
            </p>
          </form>

          <div className="mt-7 rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
            <p className="text-xs font-extrabold tracking-[0.16em] text-[var(--brand-primary)]">{config.supportingLabel}</p>
            <h3 className="mt-2 text-lg font-extrabold leading-6 text-[var(--text-primary)]">{config.supportingTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{config.supportingDescription}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
            <Link href={config.alternateHref} className="inline-flex min-h-11 items-center gap-2 text-[var(--brand-primary)] transition hover:text-[var(--brand-primary-hover)]">
              {config.alternateLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/san-pham?hasQr=true" className="inline-flex min-h-11 items-center text-[var(--text-secondary)] transition hover:text-[var(--brand-primary)]">
              Xem sản phẩm đã có QR
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-8 sm:mt-12" aria-labelledby="lookup-steps-title">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold tracking-[0.16em] text-[var(--brand-primary)]">Luồng tra cứu rõ ràng</p>
          <h2 id="lookup-steps-title" className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)] sm:text-[2.45rem]">
            Từ chiếc tem đến dữ liệu bạn cần
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            Chỉ cần một mã định danh. Hệ thống sẽ đưa bạn đến đúng hồ sơ công khai, đúng sản phẩm và đúng phạm vi dữ liệu.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
          <LookupStep number="01" icon={ScanLine} title="Quét tem QR" description="Dùng ứng dụng Camera hoặc ứng dụng quét QR có sẵn trên điện thoại." />
          <LookupStep number="02" icon={QrCode} title="Xác nhận mã" description="Nếu không quét được, nhập chuỗi mã in cạnh QR vào ô tra cứu." />
          <LookupStep number="03" icon={ShieldCheck} title="Đọc hồ sơ" description="Kiểm tra vùng trồng, dòng thời gian và các thông tin được phép công khai." />
        </div>
      </section>

      <section className="mt-8 grid gap-4 rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:mt-12 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-extrabold text-[var(--text-primary)]">{config.alternateLabel}</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{config.alternateDescription}</p>
        </div>
        <Link href={config.alternateHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white px-4 text-sm font-extrabold text-[var(--brand-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)]">
          Đi tới tra cứu
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </PublicPageMain>
  );
}
