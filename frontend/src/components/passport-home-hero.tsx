import Link from 'next/link';
import { ArrowRight, Check, QrCode, ScanLine, ShieldCheck, Sprout } from 'lucide-react';
import { PublicImage } from './public-image';
import { Input } from './ui';

const heroBenefits = [
  'Không cần cài ứng dụng',
  'Tra cứu miễn phí trên điện thoại',
  'Dữ liệu do hợp tác xã phê duyệt'
] as const;

/**
 * The passport site is a lookup-first product. A stable hero keeps that job
 * visible instead of asking visitors to wait for a rotating marketing slide.
 */
export function PassportHomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(135deg,#f7fbf5_0%,#ffffff_48%,#edf8ef_100%)]">
      <div className="pointer-events-none absolute -right-36 -top-44 h-[30rem] w-[30rem] rounded-full bg-[#bde8c2]/35 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 h-[26rem] w-[26rem] rounded-full bg-[#dff2df]/70 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-[var(--container-max,1280px)] gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[var(--brand-primary)]/20 bg-white/80 px-3 py-1 text-xs font-bold text-[var(--brand-primary)] shadow-sm">
            <ScanLine size={15} aria-hidden="true" />
            <span>Tra cứu nguồn gốc ngay trên điện thoại</span>
          </div>

          <h1 className="mt-5 max-w-[12ch] text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.055em] text-[#102516] sm:text-[4rem] lg:text-[4.35rem]">
            Quét một mã QR.
            <span className="block text-[var(--brand-primary)]">Biết rõ nông sản.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
            Hộ chiếu nông nghiệp mở ra hồ sơ công khai của đúng sản phẩm: vùng trồng, nhật ký canh tác, thu hoạch và chứng nhận khi có.
          </p>

          <form action="/truy-xuat" method="GET" className="mt-7 max-w-xl rounded-2xl border border-[var(--border-strong)] bg-white p-2 shadow-[0_16px_35px_rgba(15,81,37,0.1)] sm:flex sm:items-center sm:gap-2">
            <label htmlFor="passport-home-code" className="sr-only">Mã sản phẩm hoặc mã lô</label>
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-3">
              <QrCode className="shrink-0 text-[var(--brand-primary)]" size={20} aria-hidden="true" />
              <Input
                id="passport-home-code"
                name="code"
                required
                autoComplete="off"
                spellCheck={false}
                placeholder="Nhập mã trên tem QR"
                className="min-h-11 border-0 bg-transparent px-0 shadow-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 sm:w-auto"
            >
              <span>Tra cứu ngay</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-5">
            <Link href="/san-pham?hasQr=true" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]">
              Xem sản phẩm đã cấp QR <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <span className="hidden h-4 w-px bg-[var(--border-strong)] sm:block" aria-hidden="true" />
            <Link href="/cay" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              Khám phá Hộ chiếu cây <Sprout size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
          <div className="absolute -inset-3 rounded-[2rem] bg-[var(--brand-primary)]/10 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white bg-white p-2 shadow-[0_26px_65px_rgba(15,81,37,0.18)] sm:p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-[var(--brand-primary-subtle)]">
              <PublicImage
                src="/hero/agripassport-app-showcase.webp"
                alt="Điện thoại hiển thị hồ sơ nông sản và mã QR tại vùng trồng"
                fallback="/hero/htx-farmer-hero-v2.webp"
                priority
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/75 bg-white/95 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-primary)]">Hồ sơ công khai</p>
                    <p className="mt-1 text-base font-extrabold text-[#102516] sm:text-lg">Một lần quét, nhiều lớp thông tin</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <ShieldCheck size={20} aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3 text-[11px] font-semibold text-[var(--text-secondary)] sm:text-xs">
                  <span>Vùng trồng</span>
                  <span>Nhật ký</span>
                  <span>Chứng nhận</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[var(--container-max,1280px)] px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-[var(--border)] bg-white/90 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-[var(--border)]">
          {heroBenefits.map((benefit) => (
            <div key={benefit} className="flex min-h-[66px] items-center gap-3 border-b border-[var(--border)] px-4 py-4 last:border-b-0 sm:border-b-0 sm:px-5">
              <Check size={17} strokeWidth={2.5} className="shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
              <span className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
