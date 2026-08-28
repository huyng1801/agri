import Link from 'next/link';
import { ArrowRight, Clock3, Download, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicImage } from '@/components/public-image';
import { PublicLogo } from '@/components/public-logo';
import { PublicMapPreview } from '@/components/public-map-preview';
import { PublicInfoTile, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Liên hệ',
    description: 'Liên hệ HTXONLINE để được tư vấn tham gia sàn, hỗ trợ đơn hàng hoặc triển khai truy xuất nguồn gốc.',
    path: '/lien-he'
  });
}

export default async function ContactPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteProfile.address)}`;
  const mapLocation = getPublicMapLocation(siteProfile);
  const showMapPreview = Boolean(siteProfile.address.trim());
  const supportTagline =
    siteKey === 'htxonline'
      ? 'Hệ thống quản trị nội bộ cho hợp tác xã'
      : siteKey === 'passport'
        ? 'Hồ sơ QR công khai cho nông sản'
        : 'Sàn nông sản số cho hợp tác xã';

  return (
    <PublicShell>
      <main id="main-content">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbf6_100%)]">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 34%), radial-gradient(circle at 86% 12%, rgba(47,132,81,0.1), transparent 24%), linear-gradient(135deg, rgba(47,132,81,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(47,132,81,0.02) 1px, transparent 1px)',
              backgroundSize: 'auto, auto, 28px 28px, 28px 28px'
            }}
          />
          <div className={cn(publicContainerClass, 'relative py-4 text-left sm:py-10 lg:py-12 sm:text-center')}>
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e] sm:text-sm sm:tracking-wide">Liên hệ</p>
            <h1 className="mt-1.5 max-w-[20rem] text-[1.5rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-[#1f2233] sm:mx-auto sm:mt-3 sm:max-w-3xl sm:text-[2.7rem] sm:leading-[1.02]">
              {siteProfile.pageContent.contactTitle}
            </h1>
            <p className="mt-2 max-w-[20.5rem] text-[0.9rem] leading-[1.65] text-slate-600 sm:mx-auto sm:mt-4 sm:max-w-2xl sm:text-[1.02rem] sm:leading-7">
              {siteProfile.pageContent.contactDescription}
            </p>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-2.5 py-3.5 sm:hidden')}>
          <a href={telHref(siteProfile.hotline)} className="flex items-center justify-between rounded-[1rem] bg-white px-4 py-3 shadow-sm">
            <span>
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Hotline</span>
              <span className="mt-1 block text-[1.05rem] font-medium text-ink">{siteProfile.hotlineDisplay}</span>
            </span>
            <PhoneCall className="text-leaf" size={22} aria-hidden="true" />
          </a>
          <a href={`mailto:${siteProfile.supportEmail}`} className="flex items-center justify-between rounded-[1rem] bg-white px-4 py-3 shadow-sm">
            <span>
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Email</span>
              <span className="mt-1 block text-[1.05rem] font-bold text-ink">{siteProfile.supportEmail}</span>
            </span>
            <Mail className="text-leaf" size={22} aria-hidden="true" />
          </a>
        </section>

        <section className={cn(publicContainerClass, 'py-6 sm:py-9')}>
          <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
            <article className="flex flex-col justify-between rounded-[1.7rem] border border-[#e8e4d8] bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:rounded-[2rem] sm:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <PublicLogo size={44} />
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1f2233] sm:text-xl">{siteProfile.appName}</h2>
                    <p className="text-sm font-semibold text-[#2b8a3e]">{supportTagline}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3.5 text-sm leading-6 text-slate-700">
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
                      <span className="mt-1 block font-medium text-ink">{siteProfile.hotlineDisplay}</span>
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
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#e8e4d8] bg-[#f8fbf7] p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Phản hồi</p>
                    <p className="mt-1 text-lg font-bold text-[#1f2233]">Trong ngày</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e4d8] bg-[#f8fbf7] p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Triển khai</p>
                    <p className="mt-1 text-lg font-bold text-[#1f2233]">QR Passport</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e4d8] bg-[#f8fbf7] p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hỗ trợ</p>
                    <p className="mt-1 text-lg font-bold text-[#1f2233]">Đơn COD</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 hidden rounded-xl bg-[#f8fbf7] p-3 shadow-sm sm:block">
                <div className="overflow-hidden rounded-xl border border-[#e8e4d8] bg-white">
                  <PublicImage
                    src={siteProfile.pageContent.contactImageUrl}
                    alt={siteProfile.pageContent.contactImageAlt || siteProfile.pageContent.contactTitle}
                    wrapperClassName="aspect-[16/9]"
                    className="h-full w-full object-cover"
                    priority
                  />
                  <div className="flex items-center gap-3 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-leaf">
                      <Download size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink">Giới thiệu {siteProfile.appName}</p>
                      <p className="text-xs text-slate-500">Xem giải pháp sàn + QR Passport cho HTX</p>
                    </div>
                    <Link href="/gioi-thieu" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#eef7ef] px-4 text-sm font-semibold text-leaf transition hover:-translate-y-0.5">
                      Xem ngay
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.7rem] border border-[#e8e4d8] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:rounded-[2rem]">
              {showMapPreview ? (
                <div className="h-full p-2.5 sm:p-3">
                  <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-[#dbece1] sm:rounded-[1.6rem]">
                    <div className="border-b border-slate-200 bg-white/75 px-4 py-3">
                      <p className="text-sm font-semibold text-ink">Bản đồ và điểm hỗ trợ</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Xem nhanh vị trí ngay trong trang. Khi cần chỉ đường đầy đủ, bạn có thể mở Google Maps ngay bên dưới.
                      </p>
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <PublicMapPreview
                        address={siteProfile.address}
                        location={mapLocation}
                        mapSearchUrl={mapSearchUrl}
                        className="mt-3 border-slate-200 bg-[#dbece1]"
                        frameClassName="rounded-[1.45rem]"
                      />
                    </div>
                  </div>
                </div>
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
                        <h3 className="mt-4 max-w-sm text-[1.9rem] font-bold leading-tight text-ink">Văn phòng hỗ trợ {siteProfile.appName}</h3>
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
                          <a href={telHref(siteProfile.hotline)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-leaf px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                            <PhoneCall size={16} aria-hidden="true" />
                            Gọi hotline
                          </a>
                          <Link href="/gioi-thieu" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
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
          <div className="overflow-hidden rounded-[2rem] border border-[#e8e4d8] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#e8e4d8] bg-[#f6fbf4] px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <PublicLogo size={52} />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Form tư vấn</p>
                    <h2 className="text-2xl font-bold text-ink">Kết nối với đội vận hành {siteProfile.appName}</h2>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">Điền thông tin bên dưới. Chúng tôi sẽ phản hồi qua điện thoại hoặc email trong thời gian sớm nhất.</p>
              </div>
            </div>
            <div className="p-5 sm:p-8">
              <PublicContactForm variant="hero" />
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-8 sm:pb-10')}>
          <div className="grid gap-3 rounded-[2rem] bg-[linear-gradient(120deg,#1d7f3e_0%,#25a34d_55%,#2db95a_100%)] p-4 text-white shadow-[0_22px_44px_rgba(31,155,75,0.18)] sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/20 sm:p-0">
            <div className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 sm:rounded-none sm:rounded-l-2xl">
              <MapPinned size={22} aria-hidden="true" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Địa chỉ</span>
                <span className="mt-1 block font-bold">Văn phòng hỗ trợ</span>
              </span>
            </div>
            <a href={telHref(siteProfile.hotline)} className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 transition hover:bg-white/10 sm:rounded-none">
              <PhoneCall size={22} aria-hidden="true" />
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Hotline</span>
                <span className="mt-1 block font-medium">{siteProfile.hotlineDisplay}</span>
              </span>
            </a>
            <a href={`mailto:${siteProfile.supportEmail}`} className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 transition hover:bg-white/10 sm:rounded-none sm:rounded-r-2xl">
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
              <h2 className="mt-2 text-[1.38rem] font-bold leading-[1.12] text-ink sm:text-3xl">{legalEntityProfile.organizationName}</h2>
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
              <h2 className="mt-2 text-[1.38rem] font-bold leading-[1.12] text-ink sm:text-3xl">Kênh hỗ trợ công khai và hồ sơ pháp lý được tách rõ</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hotline công khai trên website</p>
                  <p className="mt-2 text-lg font-medium text-ink">{siteProfile.hotlineDisplay}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Email hỗ trợ trên website</p>
                  <p className="mt-2 break-all text-lg font-bold text-ink">{siteProfile.supportEmail}</p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Thông tin công khai đang phục vụ tư vấn và hỗ trợ người dùng trên {siteProfile.appName}. Khi cần xác minh pháp lý, bạn có thể đối chiếu thêm với bộ hồ sơ ở cột bên cạnh.
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
