import Link from 'next/link';
import { ArrowRight, CalendarDays, ClipboardCheck, Leaf, MapPinned, QrCode, Sprout, Wheat } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import type { PublicSiteProfile } from '@/lib/public-site';

type PassportAboutPageProps = {
  siteProfile: PublicSiteProfile;
};

const traceabilityChain = [
  { title: 'Cây', description: 'Định danh từng cây bằng mã đọc được và hồ sơ riêng.', icon: Sprout },
  { title: 'Vùng trồng', description: 'Gắn cây với vùng sản xuất và vị trí được hiển thị đúng phạm vi.', icon: MapPinned },
  { title: 'Nhật ký', description: 'Ghi nhận hoạt động chăm sóc, vật tư và tình trạng theo thời gian.', icon: CalendarDays },
  { title: 'Thu hoạch', description: 'Theo dõi sản lượng từng cây theo ngày và mùa vụ.', icon: Wheat },
  { title: 'Lô và sản phẩm', description: 'Liên kết nhiều lần thu hoạch thành lô sản phẩm cụ thể.', icon: ClipboardCheck },
  { title: 'Mã truy xuất', description: 'Mở hồ sơ công khai để người mua kiểm chứng hành trình.', icon: QrCode }
] as const;

const principles = [
  'Mã cây được cấp một lần và không đổi trong suốt vòng đời hồ sơ.',
  'Dữ liệu nội bộ và dữ liệu công khai được phân tách theo quyền truy cập.',
  'Vị trí hiển thị cho người mua được làm mờ để bảo vệ vùng sản xuất.',
  'Hồ sơ đã công khai được lưu lịch sử thay vì xóa khỏi hệ thống.'
] as const;

export function PassportAboutPage({ siteProfile }: PassportAboutPageProps) {
  return (
    <PublicShell>
      <PublicPageMain className="pb-12 sm:pb-16">
        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className={cn(publicContainerClass, 'grid gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12 lg:px-12 lg:py-16')}>
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-primary)]">Hồ sơ số và truy xuất nguồn gốc</p>
              <h1 className="mt-4 max-w-[15ch] text-[2.35rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[3.45rem]">
                Mỗi cây, mỗi lô hàng, một hồ sơ rõ ràng
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-[1.08rem]">
                Hộ chiếu nông nghiệp kết nối cây, vùng trồng, nhật ký, thu hoạch và sản phẩm thành một hành trình có thể kiểm chứng.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/cay">
                  <Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">
                    Khám phá hồ sơ cây
                    <ArrowRight size={17} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/truy-xuat">
                  <Button variant="ghost" className="min-h-12 w-full rounded-full border-[var(--border-strong)] bg-white px-6 text-[var(--brand-primary)] sm:w-auto">
                    Tra cứu QR
                  </Button>
                </Link>
              </div>
            </div>

            <figure className="overflow-hidden rounded-[1.7rem]">
              <PublicImage
                src={siteProfile.pageContent.aboutImageUrl}
                alt={siteProfile.pageContent.aboutImageAlt}
                wrapperClassName="aspect-[16/9]"
                className="h-full w-full object-cover"
                priority
              />
            </figure>
          </div>
        </section>

        <section className="mt-10 sm:mt-14" aria-labelledby="passport-chain-title">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-primary)]">Một chuỗi dữ liệu liền mạch</p>
            <h2 id="passport-chain-title" className="type-h2 mt-3 text-[1.9rem] sm:text-[3rem]">Từ cây đến mã truy xuất</h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] sm:text-[1.05rem] sm:leading-8">
              Mỗi lớp thông tin bổ sung cho lớp trước để hợp tác xã quản lý dễ hơn và người mua hiểu đúng hơn về sản phẩm.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {traceabilityChain.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="flex h-full flex-col rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-[var(--brand-primary)]">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] sm:mt-14">
          <article className="rounded-[1.8rem] bg-[linear-gradient(145deg,#062c22_0%,#0d7a28_60%,#106f8a_100%)] p-6 text-white shadow-[0_22px_52px_rgba(15,81,91,0.16)] sm:p-8">
            <Leaf size={28} aria-hidden="true" />
            <p className="mt-6 text-xs font-semibold tracking-[0.16em] text-white/75">Giá trị cốt lõi</p>
            <h2 className="mt-3 text-[1.8rem] font-extrabold leading-tight sm:text-[2.4rem]">Rõ dữ liệu, đúng phạm vi, dễ kiểm chứng.</h2>
            <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
              Hộ chiếu nông nghiệp giúp chuyển dữ liệu sản xuất thành thông tin có cấu trúc, để mỗi bên nhìn thấy đúng phần mình cần.
            </p>
          </article>

          <article className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[0_16px_38px_rgba(15,23,42,0.05)] sm:p-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-primary)]">Nguyên tắc công khai</p>
            <h2 className="mt-3 text-[1.8rem] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[2.4rem]">Minh bạch nhưng tôn trọng dữ liệu sản xuất.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div key={principle} className="rounded-[1.15rem] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--text-secondary)]">
                  {principle}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-10 rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center sm:mt-14 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-primary)]">Bắt đầu từ dữ liệu thật</p>
          <h2 className="mt-3 text-[1.8rem] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[2.6rem]">Sẵn sàng tạo hồ sơ rõ ràng cho cây và sản phẩm?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            Khám phá hồ sơ công khai hoặc liên hệ để được hướng dẫn chuẩn hóa dữ liệu theo mô hình sản xuất của bạn.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/cay">
              <Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">Xem hồ sơ cây</Button>
            </Link>
            <Link href="/lien-he">
              <Button variant="ghost" className="min-h-12 w-full rounded-full border-[var(--border-strong)] bg-white px-6 text-[var(--brand-primary)] sm:w-auto">Liên hệ tư vấn</Button>
            </Link>
          </div>
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
