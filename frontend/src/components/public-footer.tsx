import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getPublicSiteProfile, telHref } from '@/lib/public-site';
import { publicContainerClass } from './public-layout';
import { PublicLogo } from './public-logo';

const footerLinkClass = 'text-sm text-white/90 transition hover:text-white';

export async function PublicFooter() {
  const profile = await getPublicSiteProfile();
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`;

  return (
    <footer className="mt-8 bg-[#1f5f3d] pb-[calc(7.75rem+var(--safe-bottom))] text-white lg:pb-0">
      <div className={publicContainerClass}>
        <div className="grid gap-4 border-b border-white/15 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">HTXONLINE</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Dua san pham HTX len san voi trai nghiem ro rang, dang tin va de chot don.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <a
              href={telHref(profile.hotline)}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-leaf transition hover:-translate-y-0.5"
            >
              Goi hotline
            </a>
            <Link
              href="/lien-he"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Nhan tu van
            </Link>
          </div>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xl font-bold">
              <PublicLogo size={40} className="ring-2 ring-white/30" />
              HTXONLINE
            </div>
            <p className="mt-3 text-sm font-bold uppercase tracking-wide text-white/95">San nong san so cho hop tac xa</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
              Ket noi nguoi mua voi san pham HTX minh bach, QR truy xuat nguon goc va dat hang COD tren mot nen tang thong nhat.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Dich vu HTXONLINE</p>
            <div className="mt-4 grid gap-2">
              <Link href="/" className={footerLinkClass}>Trang chu</Link>
              <Link href="/san-pham" className={footerLinkClass}>San pham nong san</Link>
              <Link href="/htx" className={footerLinkClass}>Danh sach HTX</Link>
              <Link href="/tin-tuc" className={footerLinkClass}>Tin tuc HTXONLINE</Link>
              <Link href="/san-pham?hasQr=true" className={footerLinkClass}>QR Passport truy xuat</Link>
              <Link href="/thanh-toan" className={footerLinkClass}>Dat hang COD</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Giai phap va quy trinh</p>
            <div className="mt-4 grid gap-2">
              <Link href="/ve-chung-toi" className={footerLinkClass}>Ve chung toi</Link>
              <Link href="/gioi-thieu" className={footerLinkClass}>Gioi thieu nen tang</Link>
              <Link href="/huong-dan-mua-hang" className={footerLinkClass}>Huong dan mua hang</Link>
              <Link href="/tra-cuu-don-hang" className={footerLinkClass}>Tra cuu don hang</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Ho tro khach hang</p>
            <div className="mt-4 grid gap-2">
              <Link href="/dieu-khoan-su-dung" className={footerLinkClass}>Dieu khoan su dung</Link>
              <Link href="/chinh-sach-bao-mat" className={footerLinkClass}>Chinh sach bao mat</Link>
              <Link href="/chinh-sach-doi-tra" className={footerLinkClass}>Chinh sach doi tra</Link>
              <Link href="/chinh-sach-van-hanh" className={footerLinkClass}>Chinh sach van hanh</Link>
              <Link href="/lien-he" className={footerLinkClass}>Lien he</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_1fr_0.82fr]">
            <div className="space-y-4">
              <p className="text-lg font-bold">{profile.appName}</p>
              <div className="grid gap-3 text-sm text-white/90">
                <p className="flex items-start gap-2">
                  <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{profile.address}</span>
                </p>
                <a href={telHref(profile.hotline)} className="flex items-center gap-2 transition hover:text-white">
                  <Phone size={18} aria-hidden="true" />
                  <span className="font-semibold">{profile.hotlineDisplay}</span>
                </a>
                <a href={`mailto:${profile.supportEmail}`} className="flex items-center gap-2 transition hover:text-white">
                  <Mail size={18} aria-hidden="true" />
                  <span>{profile.supportEmail}</span>
                </a>
              </div>
            </div>

            {profile.mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white/90">Diem ho tro va ban do</p>
                    <p className="mt-1 text-xs text-white/70">Footer hien preview dia diem on dinh. Ban do tuong tac day du co san o trang lien he.</p>
                  </div>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-3.5 text-xs font-semibold text-leaf transition hover:-translate-y-0.5"
                  >
                    Mo Google Maps
                  </a>
                </div>

                <div className="relative overflow-hidden px-4 pb-4 pt-4">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-70"
                    style={{
                      background:
                        'radial-gradient(circle at 18% 16%, rgba(255,255,255,0.16), transparent 24%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.12), transparent 18%), linear-gradient(135deg, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                      backgroundSize: 'auto, auto, 26px 26px, 26px 26px'
                    }}
                  />

                  <div className="relative rounded-[1.65rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="rounded-2xl border border-white/14 bg-[#76a386]/40 px-5 py-4 shadow-lg backdrop-blur">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">Dia chi ho tro</p>
                      <p className="mt-1 text-lg font-bold leading-8 text-white">{profile.address}</p>
                    </div>

                    <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/14 bg-[#5f8f73]">
                      <div
                        aria-hidden="true"
                        className="h-52"
                        style={{
                          background:
                            'radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 28%), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                          backgroundSize: 'auto, 64px 64px, 64px 64px, auto'
                        }}
                      />
                      <div className="absolute inset-x-0 top-[24%] h-[2px] bg-white/20" />
                      <div className="absolute inset-y-0 left-[52%] w-[2px] bg-white/15" />
                      <div className="absolute left-[52%] top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-white/20 shadow-lg backdrop-blur">
                          <MapPin size={22} className="text-white" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 rounded-full border border-white/18 bg-[#1f5f3d]/85 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur">
                        My Tho, Dong Thap
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 border-t border-white/15 px-4 py-3 sm:grid-cols-2">
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-leaf transition hover:-translate-y-0.5"
                  >
                    Mo tren Google Maps
                  </a>
                  <Link
                    href="/lien-he"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Xem trang lien he day du
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-white/80">
                <MapPin size={28} className="mb-2 text-white/60" aria-hidden="true" />
                <p>Lien he HTXONLINE de duoc ho tro tim duong den van phong hoac hen lich tu van phu hop.</p>
                <Link href="/lien-he" className="mt-3 font-semibold text-white underline-offset-2 hover:underline">
                  Xem thong tin lien he
                </Link>
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 text-sm text-white/85">
              <div>
                <p className="font-semibold text-white">Cam ket minh bach</p>
                <p className="mt-2 leading-6">
                  HTXONLINE ho tro hop tac xa so hoa san pham, vung trong, nhat ky canh tac va QR Passport de nguoi mua tin tuong nguon goc.
                </p>
              </div>
              <p className="text-xs text-white/70">© {new Date().getFullYear()} HTXONLINE. San nong san so cho hop tac xa Viet Nam.</p>
              <p className="text-xs text-white/60">Duoc thiet ke va van hanh boi HTXONLINE</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
