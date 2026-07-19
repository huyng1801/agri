import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock3, Download, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicLogo } from '@/components/public-logo';
import { PublicShell } from '@/components/public-marketplace';
import { PublicInfoTile, publicContainerClass } from '@/components/public-layout';
import { cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { getPublicSiteProfile, telHref } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Liên hệ | HTXONLINE',
  description: 'Liên hệ HTXONLINE để được tư vấn tham gia sàn, hỗ trợ đơn hàng hoặc triển khai truy xuất nguồn gốc.',
  alternates: { canonical: 'https://htxonline.vn/lien-he' }
};

export default async function ContactPage() {
  const siteProfile = await getPublicSiteProfile();

  return (
    <PublicShell>
      <main id="main-content">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f7fbf7_0%,#eef7f1_58%,#e5f2e8_100%)]">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 34%), radial-gradient(circle at 86% 12%, rgba(47,132,81,0.12), transparent 24%), linear-gradient(135deg, rgba(47,132,81,0.04) 1px, transparent 1px), linear-gradient(45deg, rgba(47,132,81,0.03) 1px, transparent 1px)',
              backgroundSize: 'auto, auto, 28px 28px, 28px 28px'
            }}
          />
          <div className={cn(publicContainerClass, 'relative py-4 text-left sm:py-16 sm:text-center')}>
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-leaf/80 sm:text-sm sm:tracking-wide">Liên hệ</p>
            <h1 className="mt-2 max-w-[18rem] text-[1.72rem] font-bold leading-[0.98] tracking-tight text-ink sm:mx-auto sm:mt-3 sm:max-w-3xl sm:text-4xl sm:leading-[1.04]">
              Hãy để HTXONLINE kết nối và đồng hành cùng hợp tác xã của bạn
            </h1>
            <p className="mt-2.5 max-w-[19.5rem] text-[0.92rem] leading-[1.66] text-slate-700 sm:mx-auto sm:mt-4 sm:max-w-2xl sm:text-[1.02rem] sm:leading-7">
              Tư vấn tham gia sàn, QR truy xuất nguồn gốc, hỗ trợ đơn hàng COD và vận hành số cho HTX.
            </p>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-3 py-4 sm:hidden')}>
          <a href={telHref(siteProfile.hotline)} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <span>
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Hotline</span>
              <span className="mt-1 block text-[1.05rem] font-bold text-ink">{siteProfile.hotlineDisplay}</span>
            </span>
            <PhoneCall className="text-leaf" size={22} aria-hidden="true" />
          </a>
          <a href={`mailto:${siteProfile.supportEmail}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <span>
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Email</span>
              <span className="mt-1 block text-[1.05rem] font-bold text-ink">{siteProfile.supportEmail}</span>
            </span>
            <Mail className="text-leaf" size={22} aria-hidden="true" />
          </a>
        </section>

        <section className={cn(publicContainerClass, 'py-8 sm:py-10')}>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="flex flex-col justify-between rounded-2xl bg-mint p-5 shadow-sm sm:p-7">
              <div>
                <div className="flex items-center gap-3">
                  <PublicLogo size={44} />
                  <div>
                    <h2 className="text-lg font-bold text-ink sm:text-xl">{siteProfile.appName}</h2>
                    <p className="text-sm font-semibold text-leaf">Sàn nông sản số cho hợp tác xã</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
                  <p className="flex items-start gap-3">
                    <MapPinned className="mt-0.5 shrink-0 text-leaf" size={18} aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Địa chỉ</span>
                      <span className="mt-1 block font-semibold text-ink">{siteProfile.address}</span>
                    </span>
                  </p>
                  <a href={telHref(siteProfile.hotline)} className="flex items-start gap-3 transition hover:text-leaf">
                    <PhoneCall className="mt-0.5 shrink-0 text-leaf" size={18} aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Hotline</span>
                      <span className="mt-1 block font-bold text-ink">{siteProfile.hotlineDisplay}</span>
                    </span>
                  </a>
                  <a href={`mailto:${siteProfile.supportEmail}`} className="flex items-start gap-3 transition hover:text-leaf">
                    <Mail className="mt-0.5 shrink-0 text-leaf" size={18} aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Email</span>
                      <span className="mt-1 block font-bold text-ink">{siteProfile.supportEmail}</span>
                    </span>
                  </a>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/82 p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Phản hồi</p>
                    <p className="mt-1 text-lg font-bold text-ink">Trong ngày</p>
                  </div>
                  <div className="rounded-xl bg-white/82 p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Triển khai</p>
                    <p className="mt-1 text-lg font-bold text-ink">QR Passport</p>
                  </div>
                  <div className="rounded-xl bg-white/82 p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hỗ trợ</p>
                    <p className="mt-1 text-lg font-bold text-ink">Đơn COD</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 hidden rounded-xl bg-white p-4 shadow-sm sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-leaf">
                    <Download size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">Giới thiệu HTXONLINE</p>
                    <p className="text-xs text-slate-500">Xem giải pháp sàn + QR Passport cho HTX</p>
                  </div>
                  <Link href="/gioi-thieu" className="shrink-0 text-sm font-semibold text-leaf hover:underline">
                    Xem ngay
                  </Link>
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {siteProfile.mapEmbedUrl ? (
                <iframe
                  title="Bản đồ HTXONLINE"
                  src={siteProfile.mapEmbedUrl}
                  className="h-full min-h-[320px] w-full border-0 lg:min-h-[420px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="relative grid min-h-[320px] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(223,244,232,0.95),rgba(248,250,247,1)_60%)] p-6 lg:min-h-[420px]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-60"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, rgba(47,132,81,0.08) 1px, transparent 1px), linear-gradient(45deg, rgba(47,132,81,0.06) 1px, transparent 1px)',
                      backgroundSize: '26px 26px'
                    }}
                  />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-leaf shadow-sm">
                          <MapPinned size={14} aria-hidden="true" />
                          Điểm hỗ trợ
                        </p>
                        <h3 className="mt-4 max-w-sm text-[1.9rem] font-bold leading-tight text-ink">Văn phòng hỗ trợ HTXONLINE</h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                          Bản đồ đang được cập nhật. Bạn vẫn có thể liên hệ trước để được đội vận hành hướng dẫn đường đi hoặc hẹn lịch tư vấn phù hợp.
                        </p>
                      </div>
                      <div className="hidden rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-sm lg:block">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Giờ hỗ trợ</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                          <Clock3 size={16} aria-hidden="true" />
                          08:00 - 17:30
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-sm backdrop-blur-sm">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Địa chỉ liên hệ</p>
                        <p className="mt-2 text-lg font-bold leading-8 text-ink">{siteProfile.address}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={telHref(siteProfile.hotline)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-leaf px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                          >
                            <PhoneCall size={16} aria-hidden="true" />
                            Gọi hotline
                          </a>
                          <Link
                            href="/gioi-thieu"
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
                          >
                            Xem giải pháp
                            <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-dashed border-leaf/25 bg-white/65 p-5 shadow-sm backdrop-blur-sm">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Ưu tiên hỗ trợ</p>
                        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                          <p>Onboarding HTX mới lên sàn</p>
                          <p>Thiết lập QR Passport và vùng trồng</p>
                          <p>Hỗ trợ quy trình đơn hàng COD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-8 sm:pb-10')}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-100 bg-mint/70 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <PublicLogo size={52} />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Form tư vấn</p>
                    <h2 className="text-2xl font-bold text-ink">Kết nối với đội vận hành HTXONLINE</h2>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">
                  Điền thông tin bên dưới. Chúng tôi sẽ phản hồi qua điện thoại hoặc email trong thời gian sớm nhất.
                </p>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              <PublicContactForm variant="hero" />
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-8 sm:pb-10')}>
          <div className="grid gap-3 rounded-2xl bg-leaf p-4 text-white shadow-sm sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/20 sm:p-0">
            <div className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 sm:rounded-none sm:rounded-l-2xl">
              <MapPinned size={22} aria-hidden="true" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Địa chỉ</span>
                <span className="mt-1 block font-bold">Văn phòng hỗ trợ</span>
              </span>
            </div>
            <a
              href={telHref(siteProfile.hotline)}
              className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 transition hover:bg-white/10 sm:rounded-none"
            >
              <PhoneCall size={22} aria-hidden="true" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Hotline</span>
                <span className="mt-1 block font-bold">{siteProfile.hotlineDisplay}</span>
              </span>
            </a>
            <a
              href={`mailto:${siteProfile.supportEmail}`}
              className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 transition hover:bg-white/10 sm:rounded-none sm:rounded-r-2xl"
            >
              <Mail size={22} aria-hidden="true" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Email</span>
                <span className="mt-1 block break-all font-bold">{siteProfile.supportEmail}</span>
              </span>
            </a>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-8 sm:pb-10')}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Thông tin pháp lý đối chiếu</p>
              <h2 className="mt-2 text-[1.65rem] font-bold leading-tight text-ink sm:text-3xl">{legalEntityProfile.organizationName}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Mã số tổ hợp tác</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Người đại diện</p>
                  <p className="mt-2 text-lg font-bold text-ink">{legalEntityProfile.representative}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Địa chỉ và liên hệ trên hồ sơ</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Điện thoại: {legalEntityProfile.legalPhone}</p>
                  <p className="text-sm leading-6 text-slate-600">Email: {legalEntityProfile.legalEmail}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-5 shadow-sm sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Lưu ý khi liên hệ</p>
              <h2 className="mt-2 text-[1.65rem] font-bold leading-tight text-ink sm:text-3xl">Kênh hỗ trợ công khai và hồ sơ pháp lý được tách rõ</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hotline công khai trên website</p>
                  <p className="mt-2 text-lg font-bold text-ink">{siteProfile.hotlineDisplay}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Email hỗ trợ trên website</p>
                  <p className="mt-2 break-all text-lg font-bold text-ink">{siteProfile.supportEmail}</p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Thông tin công khai đang phục vụ tư vấn và hỗ trợ người dùng trên HTXONLINE. Khi cần xác minh pháp lý, bạn có thể đối chiếu thêm với bộ hồ sơ ở cột bên cạnh.
                </p>
              </div>
            </article>
          </div>
        </section>

        {siteProfile.faqs.length > 0 && (
          <section className={cn(publicContainerClass, 'pb-[calc(10.5rem+var(--safe-bottom))] sm:pb-12')}>
            <h2 className="text-2xl font-bold text-ink">Câu hỏi thường gặp</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {siteProfile.faqs.map((faq) => (
                <PublicInfoTile key={faq.question} title={faq.question} description={faq.answer} />
              ))}
            </div>
          </section>
        )}
      </main>
    </PublicShell>
  );
}
