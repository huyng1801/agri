import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Leaf, QrCode, ShieldCheck, ShoppingBag, Sparkles, Store, Target, Users } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicImage } from '@/components/public-image';
import { PublicLogo } from '@/components/public-logo';
import { PublicShell } from '@/components/public-marketplace';
import { publicContainerClass } from '@/components/public-layout';
import { Button, cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getPublicSiteProfile } from '@/lib/public-site';

export const metadata: Metadata = {
  title: 'V? ch?ng t?i | HTXONLINE',
  description: 'HTXONLINE mang ??n s?n n?ng s?n s?, QR truy xu?t v? gi?i ph?p v?n h?nh cho h?p t?c x? Vi?t Nam.',
  alternates: { canonical: 'https://htxonline.vn/ve-chung-toi' }
};

const valuePillars = [
  { title: 'S?n th??ng m?i cho HTX', description: 'Hi?n th? s?n ph?m public, h? s? HTX v? k?nh ti?p c?n ng??i mua tr?n to?n qu?c m? kh?ng c?n website ri?ng.', icon: Store },
  { title: 'QR Passport truy xu?t', description: 'M?i s?n ph?m c? m? QR ?? kh?ch xem nh?t k? canh t?c, v?ng tr?ng v? ch?ng nh?n ?? c?ng khai.', icon: QrCode },
  { title: '??t h?ng COD', description: 'Ng??i mua g?i ??n nhanh, HTX ch? ??ng li?n h? x?c nh?n v? x? l? giao h?ng thu ti?n khi nh?n.', icon: ShoppingBag },
  { title: 'Dashboard van hanh HTX', description: 'HTX tu quan ly san pham, nong dan, vung trong, nhat ky va don hang tren mot he thong thong nhat.', icon: Users }
] as const;

const coreValues = [
  { title: 'Minh bach', description: 'Nguon goc va du lieu public ro rang voi nguoi mua.', icon: ShieldCheck },
  { title: '??ng h?nh HTX', description: 'H? tr? HTX s? h?a v? ti?p c?n th? tr??ng t?t h?n.', icon: Leaf },
  { title: 'Tin c?y', description: 'Quy tr?nh b?n h?ng COD v? truy xu?t c? ki?m so?t.', icon: BadgeCheck },
  { title: '??n gi?n', description: 'D?ng ???c ngay, kh?ng c?n x?y website ri?ng.', icon: Sparkles },
  { title: 'Lan toa gia tri', description: 'Ket noi nong san dia phuong voi nguoi tieu dung.', icon: Target }
] as const;

const journeySteps = [
  { title: 'Cong khai san pham', description: 'HTX dua san pham, vung trong va chung nhan public len cung mot mat bang thuong mai so.', accent: 'bg-[#f5fbf6] border-slate-200', icon: Store },
  { title: 'Chuan hoa truy xuat', description: 'QR Passport gom nhat ky canh tac, moc kiem chung va du lieu quan trong thanh mot hanh trinh ro rang.', accent: 'bg-white border-slate-200', icon: QrCode },
  { title: 'Ch?t ??n COD', description: 'Ng??i mua ??t h?ng nhanh, c?n HTX ch? ??ng x?c nh?n v? x? l? v?n h?nh theo quy tr?nh ph? h?p.', accent: 'bg-mint/70 border-mint/80', icon: ShoppingBag },
  { title: 'Theo d?i t?ng tr??ng', description: 'Dashboard gi?p ??i v?n h?nh nh?n ???c s?n ph?m, ??n h?ng v? ni?m tin th? tr??ng theo th?i gian.', accent: 'bg-white border-slate-200', icon: Users }
] as const;

const trustSignals = ['San pham public da publish', 'QR mo truc tiep cho khach', 'Quan ly vung trong tap trung', 'COD theo quy trinh HTX'] as const;

export default async function AboutUsPage() {
  const [catalog, siteProfile] = await Promise.all([fetchPublicCatalog(100), getPublicSiteProfile()]);
  const stats = [
    { value: `${catalog.cooperatives.length || 12}+`, label: 'HTX dang hien thi tren san' },
    { value: `${catalog.totalProducts || 60}+`, label: 'S?n ph?m public ?ang b?n' },
    { value: '100%', label: 'QR Passport xem ???c kh?ng c?n ??ng nh?p' },
    { value: '1 n?n t?ng', label: 'T? s?n xu?t ??n b?n h?ng COD' }
  ];
  const featuredCooperatives =
    catalog.cooperatives.slice(0, 6).length > 0 ? catalog.cooperatives.slice(0, 6) : Array.from({ length: 6 }).map((_, index) => ({ id: String(index), name: `HTX ${index + 1}` }));

  return (
    <PublicShell>
      <main id="main-content">
        <section className="relative overflow-hidden bg-mint/60">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 36%), radial-gradient(circle at bottom right, rgba(47,132,81,0.14), transparent 34%)'
            }}
          />
          <div className={cn(publicContainerClass, 'relative grid items-center gap-4 py-9 sm:gap-6 sm:py-12 lg:grid-cols-[0.95fr_0.9fr_0.95fr] lg:py-16')}>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">V? ch?ng t?i</p>
              <h1 className="mt-2 text-[2.14rem] font-bold leading-[1.02] text-ink sm:mt-3 sm:text-5xl">{siteProfile.pageContent.aboutTitle}</h1>
              <p className="mt-3 max-w-md text-[0.96rem] leading-[1.72] text-slate-700 sm:text-base sm:leading-[1.8]">{siteProfile.pageContent.aboutDescription}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:flex sm:flex-wrap">
                <Link href="/lien-he">
                  <Button className="min-h-12 w-full">
                    Li?n h? t? v?n
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/san-pham">
                  <Button variant="ghost" className="min-h-12 w-full">
                    Xem s?n ph?m
                  </Button>
                </Link>
              </div>
            </div>

            <article className="rounded-[1.5rem] border border-white/85 bg-white/92 p-3 text-ink shadow-[0_20px_50px_rgba(148,163,184,0.14)] lg:hidden">
              <PublicImage
                src={siteProfile.pageContent.aboutImageUrl}
                alt={siteProfile.pageContent.aboutImageAlt || siteProfile.pageContent.aboutTitle}
                wrapperClassName="aspect-[16/10] rounded-[1.15rem]"
                className="h-full w-full object-cover"
                priority
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PublicLogo size={34} />
                  <div>
                    <p className="text-[0.82rem] font-bold">HTXONLINE</p>
                    <p className="text-[11px] text-slate-500">S? h?a g?n h?n tr?n mobile</p>
                  </div>
                </div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-leaf">Live</span>
              </div>
              <div className="mt-3 rounded-[1.1rem] bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-3 ring-1 ring-mint/70">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-leaf/70">QR Passport</p>
                <p className="mt-1.5 text-[1.45rem] font-bold leading-[1.06]">Minh b?ch ngu?n g?c, ch?t ??n nhanh v? qu?n l? g?n.</p>
              </div>
            </article>

            <div className="relative mx-auto hidden w-full max-w-sm lg:block">
              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-4 shadow-[0_24px_60px_rgba(18,42,28,0.14)] backdrop-blur">
                <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/75 p-2">
                  <PublicImage
                    src={siteProfile.pageContent.aboutImageUrl}
                    alt={siteProfile.pageContent.aboutImageAlt || siteProfile.pageContent.aboutTitle}
                    wrapperClassName="aspect-[16/10] rounded-[1.1rem]"
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="rounded-[1.6rem] bg-[linear-gradient(160deg,#2f8451_0%,#1f5f3d_65%,#153b28_100%)] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PublicLogo size={42} />
                      <div>
                        <p className="text-sm font-bold">HTXONLINE</p>
                        <p className="text-xs text-white/75">??ng h?nh s? h?a cho h?p t?c x?</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Live</span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">QR Passport</p>
                          <p className="mt-1 text-xl font-bold">Minh b?ch t?ng s?n ph?m</p>
                        </div>
                        <QrCode size={28} aria-hidden="true" className="text-mint" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">??n COD</p>
                        <p className="mt-2 text-2xl font-bold">Ch?t nhanh</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">Dashboard</p>
                        <p className="mt-2 text-2xl font-bold">M?t n?i qu?n l?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-[1.6rem] border border-slate-200 bg-white p-4 text-ink shadow-sm sm:p-7">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-leaf/80 sm:text-sm sm:tracking-wide">C?u chuy?n th??ng hi?u</p>
              <p className="mt-3 text-[0.96rem] leading-[1.7] text-slate-700 sm:text-base sm:leading-[1.8]">
                HTXONLINE ra ??i ?? gi?p h?p t?c x? Vi?t Nam ??a n?ng s?n ??a ph??ng l?n m?i tr??ng s? m?t c?ch minh b?ch. Ch?ng t?i k?t h?p s?n b?n h?ng,
                QR Passport va dashboard van hanh de HTX tap trung vao chat luong san pham, con nguoi mua de dang tin tuong nguon goc.
              </p>
              <p className="mt-2.5 text-[0.84rem] leading-[1.66] text-slate-600 sm:mt-3 sm:text-sm sm:leading-[1.75]">
                Kh?ng ch? l? website gi?i thi?u, ??y l? h? sinh th?i s?n xu?t, truy xu?t v? b?n h?ng tr?n c?ng m?t n?n t?ng.
              </p>
              <div className="mt-3.5 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {trustSignals.map((item) => (
                  <div key={item} className="rounded-xl bg-[#f8faf7] px-2.5 py-2 text-[0.8rem] leading-[1.4] text-slate-700 ring-1 ring-mint/60 sm:px-3 sm:py-2.5 sm:text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-8 sm:py-10')}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-sm sm:p-5">
                <p className="text-[1.7rem] font-bold text-leaf sm:text-3xl">{item.value}</p>
                <p className="mt-1 text-[0.82rem] leading-[1.55] text-slate-600 sm:mt-1.5 sm:text-sm sm:leading-[1.65]">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-3 sm:pb-4')}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Th?ng tin ph?p l?</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">{legalEntityProfile.organizationName}</h2>
              <p className="mt-2 text-[0.92rem] leading-[1.68] text-slate-600 sm:text-base sm:leading-7">
                H? s? ph?p l? tr?n gi?y ch?ng nh?n ???c t?ch r? v?i th?ng tin li?n h? c?ng khai tr?n website ?? ng??i xem d? ??i chi?u khi c?n x?c minh.
              </p>
              <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Gi?y ch?ng nh?n</p>
                  <p className="mt-2 text-base font-bold text-ink">{legalEntityProfile.certificateTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">M? s? t? h?p t?c</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">??ng k? l?n ??u ng?y {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">??a ch? v? ng??i ??i di?n theo h? s?</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Ng??i ??i di?n: {legalEntityProfile.representative}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Email ho so: {legalEntityProfile.legalEmail} · ?i?n tho?i h? s?: {legalEntityProfile.legalPhone}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.7rem] bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Th?ng tin c?ng khai tr?n HTXONLINE</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">K?nh li?n h? d?nh cho kh?ch h?ng v? HTX</h2>
              <p className="mt-2.5 text-[0.92rem] leading-[1.68] text-slate-600 sm:text-base sm:leading-7">
                B? th?ng tin n?y ?ang ???c d?ng ??ng nh?t ? footer, li?n h? v? c?c trang ch?nh s?ch theo n?i dung b?n cung c?p trong t?i li?u c?p nh?t.
              </p>
              <div className="mt-4 grid gap-3 sm:mt-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">??a ch? c?ng khai</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{siteProfile.address}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hotline</p>
                    <p className="mt-2 text-lg font-bold text-ink">{siteProfile.hotlineDisplay}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Email h? tr?</p>
                    <p className="mt-2 break-all text-lg font-bold text-ink">{siteProfile.supportEmail}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white py-9 sm:py-12">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-[1.85rem] font-bold leading-tight text-ink sm:text-3xl">Th?nh c?ng ???c t?o d?ng t? gi? tr? kh?c bi?t</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                HTXONLINE gi?p HTX hi?n di?n tr?n th? tr??ng s? b?ng d? li?u minh b?ch, quy tr?nh b?n h?ng r? r?ng v? tr?i nghi?m mua s?m ??n gi?n.
              </p>
            </div>
            <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-4">
              {valuePillars.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f8faf7] p-4 shadow-sm sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf text-white sm:h-12 sm:w-12">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[1.05rem] font-bold leading-tight text-ink sm:mt-4 sm:text-xl">{item.title}</h3>
                  <p className="mt-2 text-[0.84rem] leading-[1.65] text-slate-600 sm:text-sm sm:leading-7">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-9 sm:py-12')}>
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.7rem] border border-slate-200 bg-[linear-gradient(180deg,#f8faf7_0%,#edf7f0_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <article className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                  <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">T?m nh?n</p>
                  <h3 className="mt-2 text-[1.38rem] font-bold leading-[1.12] text-ink sm:text-2xl">Tr? th?nh n?n t?ng s? tin c?y cho h?p t?c x? n?ng nghi?p Vi?t Nam.</h3>
                  <p className="mt-2.5 text-[0.84rem] leading-[1.65] text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                    M?i HTX c? th? k? c?u chuy?n ngu?n g?c r? r?ng, m?i ng??i mua ??u ki?m tra ???c s?n ph?m tr??c khi quy?t ??nh mua.
                  </p>
                </article>
                <article className="rounded-2xl bg-leaf p-4 text-white shadow-sm sm:p-5">
                  <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-sm sm:tracking-wide">S? m?nh</p>
                  <h3 className="mt-2 text-[1.38rem] font-bold leading-[1.12] sm:text-2xl">S? h?a b?n h?ng v? truy xu?t ngu?n g?c cho HTX.</h3>
                  <p className="mt-2.5 text-[0.84rem] leading-[1.65] text-white/85 sm:mt-3 sm:text-sm sm:leading-7">
                    Chung toi mang den cong cu thuc te: san public, QR Passport, dashboard van hanh va don COD de HTX phat trien ben vung hon.
                  </p>
                </article>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">B?n ?? gi? tr?</p>
              <h3 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">M?t h?nh tr?nh r? r?ng t? ni?m tin ??n ??n h?ng.</h3>
              <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-3">
                {journeySteps.map((step, index) => (
                  <article key={step.title} className={cn('rounded-2xl border p-3.5 shadow-sm sm:p-4', step.accent)}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-leaf text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                        <step.icon size={18} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[0.72rem] sm:tracking-[0.18em]">B??c {index + 1}</p>
                        <h4 className="mt-1 text-[1rem] font-bold leading-tight text-ink sm:text-lg">{step.title}</h4>
                        <p className="mt-1.5 text-[0.82rem] leading-[1.58] text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{step.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-9 sm:py-12">
          <div className={publicContainerClass}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-[1.85rem] font-bold leading-tight text-ink sm:text-3xl">Gi? tr? c?t l?i</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">Nh?ng nguy?n t?c ??nh h??ng m?i s?n ph?m v? d?ch v? tr?n HTXONLINE.</p>
            </div>
            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-5">
              {coreValues.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-[#f8faf7] p-4 text-center shadow-sm sm:p-5">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-leaf text-white sm:h-12 sm:w-12">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[0.98rem] font-bold leading-tight text-ink sm:mt-4 sm:text-base">{item.title}</h3>
                  <p className="mt-1.5 text-[0.82rem] leading-[1.58] text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-9 sm:py-12')}>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.7rem] bg-[linear-gradient(180deg,#245f3e_0%,#1b4f33_100%)] p-4 text-white shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-white/70 sm:text-sm sm:tracking-wide">??i ng? ??ng h?nh</p>
              <h2 className="mt-2 max-w-lg text-[1.7rem] font-bold leading-[1.12] sm:text-3xl">Nh?ng con ng??i tr? c?ng ?am m? t?o n?n gi? tr? l?n cho n?ng s?n Vi?t.</h2>
              <p className="mt-3 max-w-xl text-[0.84rem] leading-[1.66] text-white/82 sm:mt-4 sm:text-sm sm:leading-7">
                Chung toi lam viec de HTX de hien dien hon tren moi truong so, con nguoi mua co them niem tin khi chon san pham minh bach nguon goc.
              </p>
            </article>

            <article className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">??i t?c & ni?m tin</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">{catalog.cooperatives.length || 12}+ HTX dong hanh</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                C?m ?n c?c h?p t?c x? v? ng??i mua ?? tin t??ng HTXONLINE ?? k?t n?i n?ng s?n minh b?ch tr?n m?i tr??ng s?.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                {featuredCooperatives.map((coop) => (
                  <div key={coop.id} className="rounded-xl border border-slate-200 bg-[#f8faf7] px-3 py-3 text-center">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-[1.45] text-slate-700 sm:text-xs">{coop.name}</p>
                  </div>
                ))}
              </div>
              <Link href="/htx" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf sm:mt-5">
                Xem danh s?ch HTX
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'pb-12 pt-3 sm:pt-4')}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-100 bg-mint/70 px-4 py-4 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">B?t ??u c?ng HTXONLINE</p>
                  <h2 className="mt-2 max-w-2xl text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">HTX mu?n tham gia s?n ho?c c?n t? v?n tri?n khai truy xu?t?</h2>
                </div>
                <p className="max-w-md text-[0.84rem] leading-[1.6] text-slate-600 sm:text-sm sm:leading-6">
                  ?? l?i th?ng tin, ??i v?n h?nh s? h? tr? onboarding v? h??ng d?n quy tr?nh ph? h?p v?i HTX c?a b?n.
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-8">
              <PublicContactForm sourcePath="/ve-chung-toi" variant="hero" />
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
