'use client';

import Link from 'next/link';
import { Leaf, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { defaultPublicSiteProfile, normalizePublicSiteProfile, telHref, type PublicSiteProfile } from '@/lib/public-site';
import { publicContainerClass } from './public-layout';

const footerLinkClass = 'text-sm text-white/90 transition hover:text-white';

export function PublicFooter() {
  const profile = usePublicSiteProfile();

  return (
    <footer className="bg-leaf text-white">
      <div className={publicContainerClass}>
        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-xl font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white/15">
                <Leaf size={22} aria-hidden="true" />
              </span>
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
              <Link href="/gioi-thieu" className={footerLinkClass}>QR Passport truy xuất</Link>
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
                    Zalo hỗ trợ
                  </a>
                )}
              </div>
            </div>

            {profile.mapEmbedUrl ? (
              <div className="overflow-hidden rounded-md border border-white/20 bg-white/10">
                <iframe
                  title="Bản đồ HTXONLINE"
                  src={profile.mapEmbedUrl}
                  className="h-56 w-full border-0 lg:h-full lg:min-h-[220px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-md border border-dashed border-white/30 bg-white/5 p-6 text-center text-sm text-white/80">
                Bản đồ sẽ được cập nhật trong phần cài đặt hệ thống.
              </div>
            )}

            <div className="flex flex-col justify-between gap-4 text-sm text-white/85">
              <div>
                <p className="font-semibold text-white">Cam kết minh bạch</p>
                <p className="mt-2 leading-6">HTXONLINE hỗ trợ hợp tác xã số hóa sản phẩm, vùng trồng, nhật ký canh tác và QR Passport để người mua tin tưởng nguồn gốc.</p>
              </div>
              <p className="text-xs text-white/70">© {new Date().getFullYear()} HTXONLINE. Sàn nông sản số cho hợp tác xã Việt Nam.</p>
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
