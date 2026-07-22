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
              Đưa sản phẩm HTX lên sàn với trải nghiệm rõ ràng, đáng tin và dễ chốt đơn.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <a
              href={telHref(profile.hotline)}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-leaf transition hover:-translate-y-0.5"
            >
              Gọi hotline
            </a>
            <Link
              href="/lien-he"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Nhận tư vấn
            </Link>
          </div>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xl font-bold">
              <PublicLogo size={40} className="ring-2 ring-white/30" />
              HTXONLINE
            </div>
            <p className="mt-3 text-sm font-bold uppercase tracking-wide text-white/95">Sàn nông sản số cho hợp tác xã</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
              Kết nối người mua với sản phẩm HTX minh bạch, QR truy xuất nguồn gốc và đặt hàng COD trên một nền tảng thống nhất.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Dịch vụ HTXONLINE</p>
            <div className="mt-4 grid gap-2">
              <Link href="/san-pham" className={footerLinkClass}>Sản phẩm nông sản</Link>
              <Link href="/htx" className={footerLinkClass}>Danh sách HTX</Link>
              <Link href="/tin-tuc" className={footerLinkClass}>Tin tức</Link>
              <Link href="/san-pham?hasQr=true" className={footerLinkClass}>QR Passport truy xuất</Link>
              <Link href="/thanh-toan" className={footerLinkClass}>Đặt hàng COD</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Giải pháp và quy trình</p>
            <div className="mt-4 grid gap-2">
              <Link href="/ve-chung-toi" className={footerLinkClass}>Về chúng tôi</Link>
              <Link href="/gioi-thieu" className={footerLinkClass}>Giới thiệu nền tảng</Link>
              <Link href="/huong-dan-mua-hang" className={footerLinkClass}>Hướng dẫn mua hàng</Link>
              <Link href="/tra-cuu-don-hang" className={footerLinkClass}>Tra cứu đơn hàng</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Hỗ trợ khách hàng</p>
            <div className="mt-4 grid gap-2">
              <Link href="/dieu-khoan-su-dung" className={footerLinkClass}>Điều khoản sử dụng</Link>
              <Link href="/chinh-sach-bao-mat" className={footerLinkClass}>Chính sách bảo mật</Link>
              <Link href="/chinh-sach-doi-tra" className={footerLinkClass}>Chính sách đổi trả</Link>
              <Link href="/chinh-sach-van-hanh" className={footerLinkClass}>Chính sách vận hành</Link>
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
                  <Phone size={18} className="text-white" aria-hidden="true" />
                  <span>{profile.hotlineDisplay}</span>
                </a>
                <a href={`mailto:${profile.supportEmail}`} className="flex items-center gap-2 transition hover:text-white">
                  <Mail size={18} aria-hidden="true" />
                  <span>{profile.supportEmail}</span>
                </a>
              </div>
              <p className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-sm leading-6 text-white/75">
                Náº¿u tra cá»©u QR Passport hoáº·c Ä‘Æ¡n hÃ ng gáº·p váº¥n Ä‘á», hÃ£y liÃªn há»‡ hotline hoáº·c email Ä‘á»ƒ Ä‘Æ°á»£c há»— trá»£ nhanh.
              </p>
            </div>

            {profile.mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white/90">Điểm hỗ trợ và bản đồ</p>
                    <p className="mt-1 text-xs text-white/70">Xem nhanh vị trí ngay trong footer, đồng thời mở Google Maps hoặc vào trang liên hệ để lấy chỉ đường rõ hơn.</p>
                  </div>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-3.5 text-xs font-semibold text-leaf transition hover:-translate-y-0.5"
                  >
                    Mở Google Maps
                  </a>
                </div>

                <div className="px-4 pb-4 pt-4">
                  <div className="overflow-hidden rounded-[1.65rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="rounded-2xl border border-white/14 bg-[#76a386]/40 px-4 py-3 shadow-lg backdrop-blur">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">Địa chỉ hỗ trợ</p>
                      <p className="mt-1 text-base font-bold leading-7 text-white">{profile.address}</p>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-2xl border border-white/14 bg-white/10">
                      <iframe
                        title="Bản đồ HTXONLINE tại footer"
                        src={profile.mapEmbedUrl}
                        className="h-56 w-full border-0 md:h-64"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
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
                    Mở trên Google Maps
                  </a>
                  <Link
                    href="/lien-he"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Xem trang liên hệ đầy đủ
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-white/80">
                <MapPin size={28} className="mb-2 text-white/60" aria-hidden="true" />
                <p>Liên hệ HTXONLINE để được hỗ trợ tìm đường đến văn phòng hoặc hẹn lịch tư vấn phù hợp.</p>
                <Link href="/lien-he" className="mt-3 font-semibold text-white underline-offset-2 hover:underline">
                  Xem thông tin liên hệ
                </Link>
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 text-sm text-white/85">
              <div>
                <p className="font-semibold text-white">Cam kết minh bạch</p>
                <p className="mt-2 leading-6">
                  HTXONLINE hỗ trợ hợp tác xã số hóa sản phẩm, vùng trồng, nhật ký canh tác và QR Passport để người mua tin tưởng nguồn gốc.
                </p>
              </div>
              <p className="text-xs text-white/70">© {new Date().getFullYear()} HTXONLINE. Sàn nông sản số cho hợp tác xã Việt Nam.</p>
              <p className="text-xs text-white/60">Được thiết kế và vận hành bởi Agripassport</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
