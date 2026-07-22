import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock3, Download, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicImage } from '@/components/public-image';
import { PublicLogo } from '@/components/public-logo';
import { PublicMapPreview } from '@/components/public-map-preview';
import { PublicShell } from '@/components/public-marketplace';
import { PublicInfoTile, publicContainerClass } from '@/components/public-layout';
import { cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'Li?n h? | HTXONLINE',
  description: 'Li?n h? HTXONLINE ?? ???c t? v?n tham gia s?n, h? tr? ??n h?ng ho?c tri?n khai truy xu?t ngu?n g?c.',
  alternates: { canonical: 'https://htxonline.vn/lien-he' }
};

export default async function ContactPage() {
  const siteProfile = await getPublicSiteProfile();
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteProfile.address)}`;
  const mapLocation = getPublicMapLocation(siteProfile);

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
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-leaf/80 sm:text-sm sm:tracking-wide">Li?n h?</p>
            <h1 className="mt-2 max-w-[18rem] text-[1.72rem] font-bold leading-[0.98] tracking-tight text-ink sm:mx-auto sm:mt-3 sm:max-w-3xl sm:text-4xl sm:leading-[1.04]">
              {siteProfile.pageContent.contactTitle}
            </h1>
            <p className="mt-2.5 max-w-[19.5rem] text-[0.92rem] leading-[1.66] text-slate-700 sm:mx-auto sm:mt-4 sm:max-w-2xl sm:text-[1.02rem] sm:leading-7">
              {siteProfile.pageContent.contactDescription}
            </p>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-3 py-4 sm:hidden')}>
          <a href={telHref(siteProfile.hotline)} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <span>
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Hotline</span>
              <span className="mt-1 block text-[1.05rem] font-medium text-ink">{siteProfile.hotlineDisplay}</span>
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
                    <p className="text-sm font-semibold text-leaf">S?n n?ng s?n s? cho h?p t?c x?</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
                  <p className="flex items-start gap-3">
                    <MapPinned className="mt-0.5 shrink-0 text-leaf" size={18} aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">??a ch?</span>
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
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/82 p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Ph?n h?i</p>
                    <p className="mt-1 text-lg font-bold text-ink">Trong ngay</p>
                  </div>
                  <div className="rounded-xl bg-white/82 p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Tri?n khai</p>
                    <p className="mt-1 text-lg font-bold text-ink">QR Passport</p>
                  </div>
                  <div className="rounded-xl bg-white/82 p-3 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">H? tr?</p>
                    <p className="mt-1 text-lg font-bold text-ink">Don COD</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 hidden rounded-xl bg-white p-4 shadow-sm sm:block">
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
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
                      <p className="text-sm font-bold text-ink">Gi?i thi?u HTXONLINE</p>
                      <p className="text-xs text-slate-500">Xem gi?i ph?p s?n + QR Passport cho HTX</p>
                    </div>
                    <Link href="/gioi-thieu" className="shrink-0 text-sm font-semibold text-leaf hover:underline">
                      Xem ngay
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {siteProfile.mapEmbedUrl ? (
                <div className="h-full p-3 sm:p-4">
                  <PublicMapPreview
                    address={siteProfile.address}
                    location={mapLocation}
                    mapSearchUrl={mapSearchUrl}
                    className="h-full border-slate-200 bg-[#dbece1]"
                    frameClassName="rounded-[1.45rem]"
                  />
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
                          ?i?m h? tr?
                        </p>
                        <h3 className="mt-4 max-w-sm text-[1.9rem] font-bold leading-tight text-ink">V?n ph?ng h? tr? HTXONLINE</h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                          B?n ?? ?ang ???c c?p nh?t. B?n v?n c? th? li?n h? tr??c ?? ???c ??i v?n h?nh h??ng d?n ???ng ?i ho?c h?n l?ch t? v?n ph? h?p.
                        </p>
                      </div>
                      <div className="hidden rounded-2xl border border-white/70 bg-white/70 p-4 text-left shadow-sm lg:block">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Gi? h? tr?</p>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                          <Clock3 size={16} aria-hidden="true" />
                          08:00 - 17:30
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-sm backdrop-blur-sm">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">??a ch? li?n h?</p>
                        <p className="mt-2 text-lg font-bold leading-8 text-ink">{siteProfile.address}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a href={telHref(siteProfile.hotline)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-leaf px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                            <PhoneCall size={16} aria-hidden="true" />
                            G?i hotline
                          </a>
                          <Link href="/gioi-thieu" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                            Xem gi?i ph?p
                            <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-dashed border-leaf/25 bg-white/65 p-5 shadow-sm backdrop-blur-sm">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">?u ti?n h? tr?</p>
                        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                          <p>Onboarding HTX m?i l?n s?n</p>
                          <p>Thi?t l?p QR Passport v? v?ng tr?ng</p>
                          <p>H? tr? quy trinh don hang COD</p>
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
                    <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Form t? v?n</p>
                    <h2 className="text-2xl font-bold text-ink">K?t n?i v?i ??i v?n h?nh HTXONLINE</h2>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">?i?n th?ng tin b?n d??i. Ch?ng t?i s? ph?n h?i qua ?i?n tho?i ho?c email trong th?i gian s?m nh?t.</p>
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
                <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">??a ch?</span>
                <span className="mt-1 block font-bold">V?n ph?ng h? tr?</span>
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
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Th?ng tin ph?p l? ??i chi?u</p>
              <h2 className="mt-2 text-[1.65rem] font-bold leading-tight text-ink sm:text-3xl">{legalEntityProfile.organizationName}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">M? s? t? h?p t?c</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">??ng k? l?n ??u ng?y {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Ng??i ??i di?n</p>
                  <p className="mt-2 text-lg font-bold text-ink">{legalEntityProfile.representative}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">??a ch? v? li?n h? tr?n h? s?</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Dien thoai: {legalEntityProfile.legalPhone}</p>
                  <p className="text-sm leading-6 text-slate-600">Email: {legalEntityProfile.legalEmail}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-5 shadow-sm sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">L?u ? khi li?n h?</p>
              <h2 className="mt-2 text-[1.65rem] font-bold leading-tight text-ink sm:text-3xl">K?nh h? tr? c?ng khai v? h? s? ph?p l? ???c t?ch r?</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hotline cong khai tren website</p>
                  <p className="mt-2 text-lg font-medium text-ink">{siteProfile.hotlineDisplay}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Email ho tro tren website</p>
                  <p className="mt-2 break-all text-lg font-bold text-ink">{siteProfile.supportEmail}</p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Th?ng tin c?ng khai ?ang ph?c v? t? v?n v? h? tr? ng??i d?ng tr?n HTXONLINE. Khi c?n x?c minh ph?p l?, b?n c? th? ??i chi?u th?m v?i b? h? s? ? c?t b?n c?nh.
                </p>
              </div>
            </article>
          </div>
        </section>

        {siteProfile.faqs.length > 0 && (
          <section className={cn(publicContainerClass, 'pb-[calc(10.5rem+var(--safe-bottom))] sm:pb-12')}>
            <h2 className="text-2xl font-bold text-ink">C?u h?i th??ng g?p</h2>
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
