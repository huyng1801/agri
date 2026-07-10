import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicLogo } from '@/components/public-logo';
import { PublicShell } from '@/components/public-marketplace';
import { PublicInfoTile, publicContainerClass } from '@/components/public-layout';
import { ZaloIcon } from '@/components/zalo-icon';
import { cn } from '@/components/ui';
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
        <section className="relative overflow-hidden bg-leaf">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />
          <div className={cn(publicContainerClass, 'relative py-10 text-center sm:py-16')}>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Liên hệ</p>
            <h1 className="mx-auto mt-3 max-w-3xl text-[2.1rem] font-bold leading-[1.03] text-white sm:text-4xl">
              Hãy để HTXONLINE kết nối và đồng hành cùng hợp tác xã của bạn
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-7 text-white/85 sm:max-w-2xl sm:text-[1.02rem]">
              Tư vấn tham gia sàn, QR truy xuất nguồn gốc, hỗ trợ đơn hàng COD và vận hành số cho HTX.
            </p>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-8 sm:py-10')}>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="flex flex-col justify-between rounded-2xl bg-mint p-6 shadow-sm sm:p-7">
              <div>
                <div className="flex items-center gap-3">
                  <PublicLogo size={48} />
                  <div>
                    <h2 className="text-xl font-bold text-ink">{siteProfile.appName}</h2>
                    <p className="text-sm font-semibold text-leaf">Sàn nông sản số cho hợp tác xã</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
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
              </div>

              <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
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
                <div className="grid min-h-[320px] place-items-center bg-slate-50 p-6 text-center lg:min-h-[420px]">
                  <div>
                    <MapPinned className="mx-auto text-leaf" size={36} aria-hidden="true" />
                    <p className="mt-3 font-bold text-ink">Bản đồ đang được cập nhật</p>
                    <p className="mt-1 text-sm text-slate-600">{siteProfile.address}</p>
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
            {siteProfile.zaloUrl ? (
              <a
                href={siteProfile.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 rounded-xl px-4 py-4 transition hover:bg-white/10 sm:rounded-none sm:rounded-l-2xl"
              >
                <ZaloIcon size={28} />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Chat nhanh</span>
                  <span className="mt-1 block font-bold">Zalo hỗ trợ</span>
                </span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-3 px-4 py-4">
                <ZaloIcon size={28} />
                <span className="font-bold">Zalo hỗ trợ</span>
              </div>
            )}
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

        {siteProfile.faqs.length > 0 && (
          <section className={cn(publicContainerClass, 'pb-12')}>
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
