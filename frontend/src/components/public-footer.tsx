'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { defaultPublicSiteProfile, normalizePublicSiteProfile, telHref, type PublicSiteProfile } from '@/lib/public-site';
import { publicContainerClass } from './public-layout';
import { PublicLogo } from './public-logo';
import { ZaloIcon } from './zalo-icon';

const footerLinkClass = 'text-sm text-white/90 transition hover:text-white';

export function PublicFooter() {
  const profile = usePublicSiteProfile();

  return (
    <footer className="mt-8 bg-[#1f5f3d] pb-24 text-white lg:pb-0">
      <div className={publicContainerClass}>
        <div className="grid gap-4 border-b border-white/15 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">HTXONLINE</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Đưa sản phẩm HTX lên sàn với trải nghiệm rõ ràng, đáng tin và dễ chốt đơn.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <a href={telHref(profile.hotline)} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-leaf transition hover:-translate-y-0.5">
              Gọi hotline
            </a>
            <Link href="/lien-he" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-5 text-sm font-bold text-white transition hover:bg-white/10">
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
              <Link href="/san-pham?hasQr=true" className={footerLinkClass}>QR Passport truy xuất</Link>
              <Link href="/thanh-toan" className={footerLinkClass}>Đặt hàng COD</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">Giải pháp &amp; Quy trình</p>
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
              <Link href="/chinh-sach-van-chuyen" className={footerLinkClass}>Chính sách vận chuyển</Link>
              <Link href="/lien-he" className={footerLinkClass}>Liên hệ</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_0.8fr]">
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
                {profile.zaloUrl && (
                  <a href={profile.zaloUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25">
                    <ZaloIcon size={22} />
                    Zalo hỗ trợ
                  </a>
                )}
              </div>
            </div>

            {profile.mapEmbedUrl ? (
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                <iframe
                  title="Bản đồ HTXONLINE"
                  src={profile.mapEmbedUrl}
                  className="h-56 w-full border-0 lg:h-full lg:min-h-[220px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-white/80">
                <MapPin size={28} className="mb-2 text-white/60" aria-hidden="true" />
                <p>Liên hệ HTXONLINE để được hỗ trợ tìm đường đến văn phòng hoặc HTX địa phương.</p>
                <Link href="/lien-he" className="mt-3 font-semibold text-white underline-offset-2 hover:underline">
                  Xem thông tin liên hệ
                </Link>
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 text-sm text-white/85">
              <div>
                <p className="font-semibold text-white">Cam kết minh bạch</p>
                <p className="mt-2 leading-6">HTXONLINE hỗ trợ hợp tác xã số hóa sản phẩm, vùng trồng, nhật ký canh tác và QR Passport để người mua tin tưởng nguồn gốc.</p>
              </div>
              <p className="text-xs text-white/70">© {new Date().getFullYear()} HTXONLINE. Sàn nông sản số cho hợp tác xã Việt Nam.</p>
              <p className="text-xs text-white/60">Được thiết kế và Vận Hành bởi THT Agri PassPort</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function usePublicSiteProfile() {
  const [profile, setProfile] = useState<PublicSiteProfile>(defaultPublicSiteProfile);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${API_URL}/settings/public/site-profile`, { cache: 'no-store' });
        if (!response.ok) return;
        const body = (await response.json()) as ApiEnvelope<Partial<PublicSiteProfile>>;
        if (!active) return;
        setProfile(normalizePublicSiteProfile(body.data));
      } catch {
        // keep default
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return profile;
}
