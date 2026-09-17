import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Database,
  Eye,
  Leaf,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Store
} from 'lucide-react';
import { PublicEcosystemShowcase } from '@/components/public-ecosystem-showcase';
import { PublicImage } from '@/components/public-image';
import { PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { cn } from '@/components/ui';
import type { PublicSiteProfile } from '@/lib/public-site';

type PassportIntroPageProps = {
  siteProfile: PublicSiteProfile;
};

const journey = [
  {
    step: '01',
    title: 'Ghi nhận tại vùng trồng',
    description: 'Thông tin mùa vụ và hoạt động canh tác bắt đầu từ đơn vị sản xuất.',
    image: '/hero/passport-journey-field.webp',
    alt: 'Nông dân ghi nhận thông tin mùa vụ bằng điện thoại tại vườn'
  },
  {
    step: '02',
    title: 'Gắn với sản phẩm hoặc lô',
    description: 'Dữ liệu liên quan được sắp xếp vào đúng hồ sơ cần giới thiệu.',
    image: '/hero/passport-journey-pack.webp',
    alt: 'Nông sản được phân loại và đóng gói tại cơ sở sản xuất'
  },
  {
    step: '03',
    title: 'Mở hồ sơ bằng QR',
    description: 'Người mua xem phần thông tin đã được đơn vị cho phép công khai.',
    image: '/hero/passport-journey-market.webp',
    alt: 'Người mua xem thông tin nông sản trên điện thoại tại điểm bán'
  }
] as const;

const process = [
  { title: 'Chuẩn hóa thông tin', description: 'Tập hợp mã, tên sản phẩm, đơn vị và dữ liệu liên quan theo một cấu trúc dễ tra cứu.', icon: Database },
  { title: 'Liên kết đúng hồ sơ', description: 'Gắn thông tin vùng trồng, nhật ký hoặc thu hoạch vào đúng cây, sản phẩm hay lô hàng.', icon: Leaf },
  { title: 'Chọn phạm vi chia sẻ', description: 'Đơn vị kiểm tra nội dung trước khi đưa các trường dữ liệu ra trang công khai.', icon: ShieldCheck },
  { title: 'Tra cứu theo mã QR', description: 'Mã QR dẫn người xem đến hồ sơ tương ứng; dữ liệu chưa có sẽ không được thay bằng nội dung giả.', icon: QrCode }
] as const;

const publicFields = [
  'Tên sản phẩm hoặc mã hồ sơ',
  'Thông tin đơn vị và vùng trồng trong phạm vi được công khai',
  'Nhật ký, thu hoạch hoặc giấy tờ khi hồ sơ có dữ liệu phù hợp'
];

const privateFields = [
  'Thông tin thành viên, thu chi và nghiệp vụ quản trị nội bộ',
  'Trường dữ liệu chưa được đơn vị duyệt để chia sẻ',
  'Vị trí chi tiết hoặc thông tin cần được giới hạn'
];

export function PassportIntroPage({ siteProfile }: PassportIntroPageProps) {
  return (
    <PublicShell>
      <PublicPageMain className="pb-12 sm:pb-16">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] shadow-[0_22px_55px_rgba(15,23,42,0.07)]">
          <div className={cn(publicContainerClass, 'grid gap-7 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:gap-12 lg:px-12 lg:py-14')}>
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)]">Cách Hộ chiếu hoạt động</p>
              <h1 className="mt-4 max-w-[16ch] text-[2.2rem] font-extrabold leading-[1.06] tracking-[-0.035em] text-[var(--text-primary)] sm:text-[3.25rem]">
                Từ dữ liệu sản xuất đến hồ sơ nông sản minh bạch
              </h1>
              <p className="mt-5 max-w-[58ch] text-base leading-7 text-[var(--text-secondary)] sm:text-[1.08rem] sm:leading-8">
                Hộ chiếu nông nghiệp sắp xếp thông tin đã có, gắn dữ liệu với đúng sản phẩm và đưa phần được duyệt ra trang tra cứu QR.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/truy-xuat" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)] focus-visible:ring-offset-2 sm:w-auto">
                  Tra cứu mã QR <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link href="/san-pham?hasQr=true" className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 text-sm font-bold text-[var(--brand-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)] focus-visible:ring-offset-2 sm:w-auto">
                  Xem sản phẩm có hồ sơ QR
                </Link>
              </div>
            </div>
            <figure className="min-w-0 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/60 shadow-sm">
              <PublicImage
                src={siteProfile.pageContent.introImageUrl}
                alt={siteProfile.pageContent.introImageAlt}
                wrapperClassName="aspect-[4/3] sm:aspect-[16/10]"
                className="h-full w-full object-cover"
                priority
              />
              <figcaption className="px-4 py-3 text-xs leading-5 text-[var(--text-secondary)] sm:px-5">
                Hồ sơ QR giúp nối thông tin sản xuất với sản phẩm được giới thiệu.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="passport-journey-title">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)]">Hành trình của dữ liệu</p>
            <h2 id="passport-journey-title" className="mt-2 text-[1.85rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
              Từ vùng trồng đến lần quét QR
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
              Ba khoảnh khắc cho thấy hồ sơ được tạo ra như thế nào — không phải mọi dữ liệu nội bộ đều xuất hiện với người mua.
            </p>
          </div>

          <ol className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-3 lg:gap-5">
            {journey.map((item) => (
              <li key={item.step} className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-elevated)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-primary-subtle)]">
                  <PublicImage src={item.image} alt={item.alt} wrapperClassName="h-full w-full" className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/95 text-xs font-extrabold text-[var(--brand-primary)] shadow-sm">
                    {item.step}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg font-extrabold leading-6 text-[var(--text-primary)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 border-y border-[var(--border)] py-10 sm:mt-16 sm:py-14" aria-labelledby="passport-process-title">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)]">Quy trình hồ sơ</p>
              <h2 id="passport-process-title" className="mt-2 text-[1.85rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
                Bốn bước để thông tin đến đúng người
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
                Mỗi bước có mục đích riêng: giữ dữ liệu có ngữ cảnh, dễ đối chiếu và chỉ hiển thị trong phạm vi đã chọn.
              </p>
            </div>

            <ol className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {process.map(({ title, description, icon: Icon }, index) => (
                <li key={title} className="flex min-w-0 gap-3 border-t border-[var(--border)] pt-4 sm:odd:pr-4 sm:even:pl-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-[0.1em] text-[var(--brand-primary)]">BƯỚC 0{index + 1}</p>
                    <h3 className="mt-1 text-base font-extrabold leading-6 text-[var(--text-primary)]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="mt-12 sm:mt-16" id="he-sinh-thai">
          <PublicEcosystemShowcase siteKey="passport" compact />
        </div>

        <section className="mt-12 rounded-[1.7rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:mt-16 sm:p-8" aria-labelledby="passport-visibility-title">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)]">Ranh giới dữ liệu</p>
            <h2 id="passport-visibility-title" className="mt-2 text-[1.85rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
              Công khai có chọn lọc, không mở toàn bộ dữ liệu
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
              Trang QR chỉ trình bày trường dữ liệu phù hợp đã được đơn vị cho phép chia sẻ. Nội dung chưa có hoặc chưa được duyệt sẽ không được tự điền thay.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"><Eye size={19} aria-hidden="true" /></span>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Có thể hiển thị khi được công khai</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {publicFields.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-[var(--text-secondary)]"><Check size={17} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" /><span>{item}</span></li>)}
              </ul>
            </article>
            <article className="rounded-[1.25rem] border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)]"><LockKeyhole size={19} aria-hidden="true" /></span>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Không thuộc hồ sơ người mua</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {privateFields.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-[var(--text-secondary)]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-tertiary)]" aria-hidden="true" /><span>{item}</span></li>)}
              </ul>
            </article>
          </div>
        </section>

        <section className="mt-12 grid gap-5 rounded-[1.7rem] bg-[var(--brand-primary)] p-5 text-white shadow-[0_20px_45px_rgba(15,81,91,0.16)] sm:mt-16 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8" aria-labelledby="passport-next-title">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-white/80">Chọn bước tiếp theo</p>
            <h2 id="passport-next-title" className="mt-2 max-w-[24ch] text-2xl font-extrabold leading-tight sm:text-3xl">Bạn muốn tra cứu, xem sản phẩm hay đưa hồ sơ lên QR?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">Người mua có thể mở hồ sơ ngay; hợp tác xã có thể liên hệ để trao đổi cách chuẩn bị dữ liệu sản xuất.</p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-52">
            <Link href="/truy-xuat" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]">
              Tra cứu mã QR <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/lien-he" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/50 px-5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Liên hệ triển khai <Store size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
