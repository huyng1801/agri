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
  title: 'Ve chung toi | HTXONLINE',
  description: 'HTXONLINE mang den san nong san so, QR truy xuat va giai phap van hanh cho hop tac xa Viet Nam.',
  alternates: { canonical: 'https://htxonline.vn/ve-chung-toi' }
};

const valuePillars = [
  { title: 'San thuong mai cho HTX', description: 'Hien thi san pham public, ho so HTX va kenh tiep can nguoi mua tren toan quoc ma khong can website rieng.', icon: Store },
  { title: 'QR Passport truy xuat', description: 'Moi san pham co ma QR de khach xem nhat ky canh tac, vung trong va chung nhan da cong khai.', icon: QrCode },
  { title: 'Dat hang COD', description: 'Nguoi mua gui don nhanh, HTX chu dong lien he xac nhan va xu ly giao hang thu tien khi nhan.', icon: ShoppingBag },
  { title: 'Dashboard van hanh HTX', description: 'HTX tu quan ly san pham, nong dan, vung trong, nhat ky va don hang tren mot he thong thong nhat.', icon: Users }
] as const;

const coreValues = [
  { title: 'Minh bach', description: 'Nguon goc va du lieu public ro rang voi nguoi mua.', icon: ShieldCheck },
  { title: 'Dong hanh HTX', description: 'Ho tro HTX so hoa va tiep can thi truong tot hon.', icon: Leaf },
  { title: 'Tin cay', description: 'Quy trinh ban hang COD va truy xuat co kiem soat.', icon: BadgeCheck },
  { title: 'Don gian', description: 'Dung duoc ngay, khong can xay website rieng.', icon: Sparkles },
  { title: 'Lan toa gia tri', description: 'Ket noi nong san dia phuong voi nguoi tieu dung.', icon: Target }
] as const;

const journeySteps = [
  { title: 'Cong khai san pham', description: 'HTX dua san pham, vung trong va chung nhan public len cung mot mat bang thuong mai so.', accent: 'bg-[#f5fbf6] border-slate-200', icon: Store },
  { title: 'Chuan hoa truy xuat', description: 'QR Passport gom nhat ky canh tac, moc kiem chung va du lieu quan trong thanh mot hanh trinh ro rang.', accent: 'bg-white border-slate-200', icon: QrCode },
  { title: 'Chot don COD', description: 'Nguoi mua dat hang nhanh, con HTX chu dong xac nhan va xu ly van hanh theo quy trinh phu hop.', accent: 'bg-mint/70 border-mint/80', icon: ShoppingBag },
  { title: 'Theo doi tang truong', description: 'Dashboard giup doi van hanh nhin duoc san pham, don hang va niem tin thi truong theo thoi gian.', accent: 'bg-white border-slate-200', icon: Users }
] as const;

const trustSignals = ['San pham public da publish', 'QR mo truc tiep cho khach', 'Quan ly vung trong tap trung', 'COD theo quy trinh HTX'] as const;

export default async function AboutUsPage() {
  const [catalog, siteProfile] = await Promise.all([fetchPublicCatalog(100), getPublicSiteProfile()]);
  const stats = [
    { value: `${catalog.cooperatives.length || 12}+`, label: 'HTX dang hien thi tren san' },
    { value: `${catalog.totalProducts || 60}+`, label: 'San pham public dang ban' },
    { value: '100%', label: 'QR Passport xem duoc khong can dang nhap' },
    { value: '1 nen tang', label: 'Tu san xuat den ban hang COD' }
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
              <p className="text-sm font-bold uppercase tracking-wide text-leaf">Ve chung toi</p>
              <h1 className="mt-2 text-[2.14rem] font-bold leading-[1.02] text-ink sm:mt-3 sm:text-5xl">{siteProfile.pageContent.aboutTitle}</h1>
              <p className="mt-3 max-w-md text-[0.96rem] leading-[1.72] text-slate-700 sm:text-base sm:leading-[1.8]">{siteProfile.pageContent.aboutDescription}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:flex sm:flex-wrap">
                <Link href="/lien-he">
                  <Button className="min-h-12 w-full">
                    Lien he tu van
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/san-pham">
                  <Button variant="ghost" className="min-h-12 w-full">
                    Xem san pham
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
                    <p className="text-[11px] text-slate-500">So hoa gon hon tren mobile</p>
                  </div>
                </div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-leaf">Live</span>
              </div>
              <div className="mt-3 rounded-[1.1rem] bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-3 ring-1 ring-mint/70">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-leaf/70">QR Passport</p>
                <p className="mt-1.5 text-[1.45rem] font-bold leading-[1.06]">Minh bach nguon goc, chot don nhanh va quan ly gon.</p>
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
                        <p className="text-xs text-white/75">Dong hanh so hoa cho hop tac xa</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Live</span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">QR Passport</p>
                          <p className="mt-1 text-xl font-bold">Minh bach tung san pham</p>
                        </div>
                        <QrCode size={28} aria-hidden="true" className="text-mint" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">Don COD</p>
                        <p className="mt-2 text-2xl font-bold">Chot nhanh</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/70">Dashboard</p>
                        <p className="mt-2 text-2xl font-bold">Mot noi quan ly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <article className="rounded-[1.6rem] border border-slate-200 bg-white p-4 text-ink shadow-sm sm:p-7">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-leaf/80 sm:text-sm sm:tracking-wide">Cau chuyen thuong hieu</p>
              <p className="mt-3 text-[0.96rem] leading-[1.7] text-slate-700 sm:text-base sm:leading-[1.8]">
                HTXONLINE ra doi de giup hop tac xa Viet Nam dua nong san dia phuong len moi truong so mot cach minh bach. Chung toi ket hop san ban hang,
                QR Passport va dashboard van hanh de HTX tap trung vao chat luong san pham, con nguoi mua de dang tin tuong nguon goc.
              </p>
              <p className="mt-2.5 text-[0.84rem] leading-[1.66] text-slate-600 sm:mt-3 sm:text-sm sm:leading-[1.75]">
                Khong chi la website gioi thieu, day la he sinh thai san xuat, truy xuat va ban hang tren cung mot nen tang.
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
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Thong tin phap ly</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">{legalEntityProfile.organizationName}</h2>
              <p className="mt-2 text-[0.92rem] leading-[1.68] text-slate-600 sm:text-base sm:leading-7">
                Ho so phap ly tren giay chung nhan duoc tach ro voi thong tin lien he cong khai tren website de nguoi xem de doi chieu khi can xac minh.
              </p>
              <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Giay chung nhan</p>
                  <p className="mt-2 text-base font-bold text-ink">{legalEntityProfile.certificateTitle}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-2xl bg-[#f8faf7] p-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Ma so to hop tac</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Dang ky lan dau ngay {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Dia chi va nguoi dai dien theo ho so</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Nguoi dai dien: {legalEntityProfile.representative}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Email ho so: {legalEntityProfile.legalEmail} · Dien thoai ho so: {legalEntityProfile.legalPhone}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.7rem] bg-[linear-gradient(180deg,#f8faf7_0%,#eef7f1_100%)] p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Thong tin cong khai tren HTXONLINE</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">Kenh lien he danh cho khach hang va HTX</h2>
              <p className="mt-2.5 text-[0.92rem] leading-[1.68] text-slate-600 sm:text-base sm:leading-7">
                Bo thong tin nay dang duoc dung dong nhat o footer, lien he va cac trang chinh sach theo noi dung ban cung cap trong tai lieu cap nhat.
              </p>
              <div className="mt-4 grid gap-3 sm:mt-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Dia chi cong khai</p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-7 text-ink">{siteProfile.address}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Hotline</p>
                    <p className="mt-2 text-lg font-bold text-ink">{siteProfile.hotlineDisplay}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Email ho tro</p>
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
              <h2 className="text-[1.85rem] font-bold leading-tight text-ink sm:text-3xl">Thanh cong duoc tao dung tu gia tri khac biet</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                HTXONLINE giup HTX hien dien tren thi truong so bang du lieu minh bach, quy trinh ban hang ro rang va trai nghiem mua sam don gian.
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
                  <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Tam nhin</p>
                  <h3 className="mt-2 text-[1.38rem] font-bold leading-[1.12] text-ink sm:text-2xl">Tro thanh nen tang so tin cay cho hop tac xa nong nghiep Viet Nam.</h3>
                  <p className="mt-2.5 text-[0.84rem] leading-[1.65] text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                    Moi HTX co the ke cau chuyen nguon goc ro rang, moi nguoi mua deu kiem tra duoc san pham truoc khi quyet dinh mua.
                  </p>
                </article>
                <article className="rounded-2xl bg-leaf p-4 text-white shadow-sm sm:p-5">
                  <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-sm sm:tracking-wide">Su menh</p>
                  <h3 className="mt-2 text-[1.38rem] font-bold leading-[1.12] sm:text-2xl">So hoa ban hang va truy xuat nguon goc cho HTX.</h3>
                  <p className="mt-2.5 text-[0.84rem] leading-[1.65] text-white/85 sm:mt-3 sm:text-sm sm:leading-7">
                    Chung toi mang den cong cu thuc te: san public, QR Passport, dashboard van hanh va don COD de HTX phat trien ben vung hon.
                  </p>
                </article>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Ban do gia tri</p>
              <h3 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">Mot hanh trinh ro rang tu niem tin den don hang.</h3>
              <div className="mt-4 grid gap-2.5 sm:mt-6 sm:gap-3">
                {journeySteps.map((step, index) => (
                  <article key={step.title} className={cn('rounded-2xl border p-3.5 shadow-sm sm:p-4', step.accent)}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[1rem] bg-leaf text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                        <step.icon size={18} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[0.72rem] sm:tracking-[0.18em]">Buoc {index + 1}</p>
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
              <h2 className="text-[1.85rem] font-bold leading-tight text-ink sm:text-3xl">Gia tri cot loi</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">Nhung nguyen tac dinh huong moi san pham va dich vu tren HTXONLINE.</p>
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
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-white/70 sm:text-sm sm:tracking-wide">Doi ngu dong hanh</p>
              <h2 className="mt-2 max-w-lg text-[1.7rem] font-bold leading-[1.12] sm:text-3xl">Nhung con nguoi tre cung dam me tao nen gia tri lon cho nong san Viet.</h2>
              <p className="mt-3 max-w-xl text-[0.84rem] leading-[1.66] text-white/82 sm:mt-4 sm:text-sm sm:leading-7">
                Chung toi lam viec de HTX de hien dien hon tren moi truong so, con nguoi mua co them niem tin khi chon san pham minh bach nguon goc.
              </p>
            </article>

            <article className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Doi tac & niem tin</p>
              <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">{catalog.cooperatives.length || 12}+ HTX dong hanh</h2>
              <p className="mt-2.5 text-[0.95rem] leading-[1.7] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                Cam on cac hop tac xa va nguoi mua da tin tuong HTXONLINE de ket noi nong san minh bach tren moi truong so.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3">
                {featuredCooperatives.map((coop) => (
                  <div key={coop.id} className="rounded-xl border border-slate-200 bg-[#f8faf7] px-3 py-3 text-center">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-[1.45] text-slate-700 sm:text-xs">{coop.name}</p>
                  </div>
                ))}
              </div>
              <Link href="/htx" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf sm:mt-5">
                Xem danh sach HTX
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
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-leaf sm:text-sm sm:tracking-wide">Bat dau cung HTXONLINE</p>
                  <h2 className="mt-2 max-w-2xl text-[1.7rem] font-bold leading-tight text-ink sm:text-3xl">HTX muon tham gia san hoac can tu van trien khai truy xuat?</h2>
                </div>
                <p className="max-w-md text-[0.84rem] leading-[1.6] text-slate-600 sm:text-sm sm:leading-6">
                  De lai thong tin, doi van hanh se ho tro onboarding va huong dan quy trinh phu hop voi HTX cua ban.
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
