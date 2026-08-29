import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import type { PublicSiteKey } from '@/lib/domain';
import { publicContainerClass } from './public-layout';
import { PublicLogo } from './public-logo';
import { PublicMapPreview } from './public-map-preview';

const footerLinkClass = 'inline-flex min-h-11 items-center text-sm font-medium text-slate-600 transition hover:text-[#1f9b4b]';

export async function PublicFooter({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const profile = await getPublicSiteProfile(siteKey);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`;
  const mapLocation = getPublicMapLocation(profile);
  const showMapPreview = Boolean(profile.address.trim());
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const footerHeadline = isInternal
    ? 'Chuẩn hóa vận hành nội bộ của hợp tác xã bằng một hệ thống số rõ ràng và dễ đối soát.'
    : isPassport
      ? 'Mở QR để xem hồ sơ số, nguồn gốc và thông tin công khai của sản phẩm nhanh hơn.'
      : 'Đưa dữ liệu sản phẩm nông nghiệp lên một nền tảng thống nhất, rõ ràng và dễ kết nối tiêu thụ.';
  const brandTagline = isInternal
    ? 'Nền tảng quản trị nội bộ cho hợp tác xã'
    : isPassport
      ? 'QR và hồ sơ số cho sản phẩm nông nghiệp'
      : 'Nền tảng dữ liệu sản phẩm nông nghiệp';
  const brandDescription = isInternal
    ? 'Tập trung hồ sơ thành viên, lịch sử sử dụng dịch vụ, thu chi, xuất nhập và báo cáo quản trị nội bộ cho hợp tác xã.'
    : isPassport
      ? 'Hiển thị hồ sơ sản phẩm, vùng trồng, nhật ký và chứng nhận công khai để người mua và đối tác truy xuất nhanh hơn.'
      : 'Chuẩn hóa thông tin hợp tác xã, sản phẩm, vùng trồng, nhật ký, chứng nhận và QR truy xuất trên một hệ thống công khai thống nhất.';
  const serviceTitle = isInternal ? 'Điểm truy cập nhanh' : isPassport ? 'Luồng truy xuất' : 'Giải pháp và dữ liệu';
  const serviceLinks = isInternal
    ? [
        { href: '/login', label: 'Đăng nhập quản trị' },
        { href: '/gioi-thieu', label: 'Vai trò nền tảng' },
        { href: '/tin-tuc', label: 'Tin tức vận hành' },
        { href: '/lien-he', label: 'Liên hệ triển khai' }
      ]
    : isPassport
      ? [
          { href: '/passport/DEMO-PASSPORT', label: 'Mở hồ sơ mẫu' },
          { href: '/san-pham?hasQr=true', label: 'Sản phẩm có QR' },
          { href: '/ve-chung-toi', label: 'Cách hoạt động' },
          { href: '/lien-he', label: 'Liên hệ hỗ trợ' }
        ]
      : [
          { href: '/san-pham', label: 'Danh mục sản phẩm' },
          { href: '/htx', label: 'Hợp tác xã' },
          { href: '/san-pham?hasQr=true', label: 'QR truy xuất' },
          { href: '/thanh-toan', label: 'Đặt hàng COD' }
        ];
  const processLinks = isInternal
    ? [
        { href: '/ve-chung-toi', label: 'Về chúng tôi' },
        { href: '/gioi-thieu', label: 'Vai trò HTXONLINE' },
        { href: '/tin-tuc', label: 'Tin tức' },
        { href: '/lien-he', label: 'Liên hệ' }
      ]
    : [
        { href: '/ve-chung-toi', label: 'Về chúng tôi' },
        { href: '/gioi-thieu', label: 'Giới thiệu nền tảng' },
        { href: '/huong-dan-mua-hang', label: 'Hướng dẫn' },
        { href: '/tra-cuu-don-hang', label: 'Tra cứu đơn hàng' }
      ];
  const supportNote = isInternal
    ? 'Nếu cần hỗ trợ quản trị, phân quyền hoặc đồng bộ dữ liệu giữa các lớp hệ thống, hãy liên hệ hotline hoặc email.'
    : isPassport
      ? 'Nếu quét QR không ra hồ sơ hoặc thông tin truy xuất chưa đúng, hãy liên hệ hotline hoặc email để được hỗ trợ nhanh.'
      : 'Nếu tra cứu QR hoặc đơn hàng gặp vấn đề, hãy liên hệ hotline hoặc email để được hỗ trợ nhanh.';
  const mapHint = isInternal
    ? 'Xem nhanh vị trí hỗ trợ triển khai, đồng thời mở Google Maps hoặc vào trang liên hệ để lấy chỉ đường rõ hơn.'
    : isPassport
      ? 'Xem nhanh vị trí hỗ trợ hồ sơ số, đồng thời mở Google Maps hoặc vào trang liên hệ để lấy chỉ đường rõ hơn.'
      : 'Xem nhanh vị trí hỗ trợ nền tảng, đồng thời mở Google Maps hoặc vào trang liên hệ để lấy chỉ đường rõ hơn.';
  const emptyMapText = isInternal
    ? 'Liên hệ HTXONLINE để được hỗ trợ tư vấn triển khai và vận hành nội bộ phù hợp.'
    : isPassport
      ? 'Liên hệ đội vận hành Hộ chiếu nông nghiệp để được hỗ trợ cấu hình QR và hồ sơ số.'
      : 'Liên hệ AGRIPASSPORT để được hỗ trợ chuẩn hóa dữ liệu sản phẩm và truy xuất.';
  const transparencyText = isInternal
    ? 'HTXONLINE hỗ trợ hợp tác xã số hóa vận hành nội bộ, còn dữ liệu sản phẩm và truy xuất được kết nối sang AGRIPASSPORT khi cần công khai.'
    : isPassport
      ? 'Hộ chiếu nông nghiệp hiển thị hồ sơ công khai được tạo từ dữ liệu sản phẩm trên AGRIPASSPORT.'
      : 'AGRIPASSPORT hỗ trợ hợp tác xã chuẩn hóa dữ liệu sản phẩm, vùng trồng, nhật ký và QR truy xuất để tăng tính minh bạch.';
  const operatorLine = isInternal
    ? 'Dữ liệu sản phẩm và hồ sơ công khai được kết nối với AGRIPASSPORT khi cần công khai hoặc tiêu thụ.'
    : isPassport
      ? 'Được tạo từ dữ liệu sản phẩm và truy xuất trên AGRIPASSPORT.'
      : 'Liên hệ hotline hoặc email để được đội vận hành AGRIPASSPORT hỗ trợ nhanh.';

  return (
    <footer className="mt-10 pb-[calc(6.5rem+var(--safe-bottom))] text-[#1f2233] lg:pb-0">
      <div className={publicContainerClass}>
        <div className="overflow-hidden rounded-[2.2rem] border border-[#e8e4d8] bg-[#fbfaf6] shadow-[0_28px_64px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 border-b border-[#1f9b4b]/12 bg-[linear-gradient(135deg,#1d8f44_0%,#25a34d_58%,#31b35b_100%)] px-4 py-5 text-white sm:px-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-6 lg:py-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.72)]">{profile.appName}</p>
              <h2 className="mt-2 text-[1.55rem] font-bold leading-tight tracking-normal sm:text-2xl">{footerHeadline}</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <a
                href={telHref(profile.hotline)}
                className="inline-flex min-h-12 items-center justify-center rounded-[1.1rem] bg-white px-5 text-sm font-bold text-leaf shadow-[0_16px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
              >
                Gọi hotline
              </a>
              <Link
                href="/lien-he"
                className="inline-flex min-h-12 items-center justify-center rounded-[1.1rem] border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16"
              >
                Nhận tư vấn
              </Link>
            </div>
          </div>

          <div className="grid gap-4 px-4 py-8 sm:grid-cols-2 sm:px-5 xl:grid-cols-4 xl:px-6">
            <div className="rounded-[1.75rem] border border-[#e8e4d8] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] sm:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-2 text-xl font-bold">
                <PublicLogo size={40} className="ring-2 ring-[#e1eadc]" />
                {profile.appName}
              </div>
              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-[#2b8a3e]">{brandTagline}</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                {brandDescription}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#e8e4d8] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-bold uppercase tracking-wide text-[#1f2233]">{serviceTitle}</p>
              <div className="mt-4 grid gap-2">
                {serviceLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#e8e4d8] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-bold uppercase tracking-wide text-[#1f2233]">Giải pháp và quy trình</p>
              <div className="mt-4 grid gap-2">
                {processLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#e8e4d8] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-bold uppercase tracking-wide text-[#1f2233]">Hỗ trợ khách hàng</p>
              <div className="mt-4 grid gap-2">
                <Link href="/dieu-khoan-su-dung" className={footerLinkClass}>Điều khoản sử dụng</Link>
                <Link href="/chinh-sach-bao-mat" className={footerLinkClass}>Chính sách bảo mật</Link>
                <Link href="/chinh-sach-doi-tra" className={footerLinkClass}>Chính sách đổi trả</Link>
                <Link href="/chinh-sach-van-hanh" className={footerLinkClass}>Chính sách vận hành</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[#ebe6da] bg-[rgba(255,255,255,0.55)] px-4 py-8 sm:px-5 lg:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_1fr_0.82fr]">
              <div className="space-y-4 rounded-[1.8rem] border border-[#e8e4d8] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                <p className="text-lg font-bold text-[#1f2233]">{profile.appName}</p>
                <div className="grid gap-3 text-sm text-slate-700">
                  <p className="flex items-start gap-2">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-[#1f9b4b]" aria-hidden="true" />
                    <span>{profile.address}</span>
                  </p>
                  <a href={telHref(profile.hotline)} className="flex min-h-11 items-center gap-2 rounded-xl px-1 transition hover:text-[#1f9b4b]">
                    <Phone size={18} className="text-[#1f9b4b]" aria-hidden="true" />
                    <span>{profile.hotlineDisplay}</span>
                  </a>
                  <a href={`mailto:${profile.supportEmail}`} className="flex min-h-11 items-center gap-2 rounded-xl px-1 transition hover:text-[#1f9b4b]">
                    <Mail size={18} className="text-[#1f9b4b]" aria-hidden="true" />
                    <span>{profile.supportEmail}</span>
                  </a>
                </div>
                <p className="rounded-2xl border border-[#e1eadc] bg-[#f6fbf3] px-3 py-2 text-sm leading-6 text-slate-600">
                  {supportNote}
                </p>
              </div>

              {showMapPreview ? (
                <div className="overflow-hidden rounded-[1.8rem] border border-[#e8e4d8] bg-[#f8fbf6] shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eadf] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1f2233]">Điểm hỗ trợ và bản đồ</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {mapHint}
                      </p>
                    </div>
                    <a
                      href={mapSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#1f9b4b] px-3.5 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(31,155,75,0.2)] transition hover:-translate-y-0.5"
                    >
                      Mở Google Maps
                    </a>
                  </div>

                  <div className="px-4 pb-4 pt-4">
                    <div className="overflow-hidden rounded-[1.65rem] border border-[#dfe9dc] bg-white p-3 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <div className="rounded-2xl border border-[#dce7d9] bg-[#eef6ef] px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Địa chỉ hỗ trợ</p>
                        <p className="mt-1 text-base font-bold leading-7 text-[#1f2233]">{profile.address}</p>
                      </div>
                      <PublicMapPreview address={profile.address} location={mapLocation} mapSearchUrl={mapSearchUrl} className="mt-3 border-[#dbe7d9] bg-[#eef5ee]" compact />
                    </div>
                  </div>

                  <div className="grid gap-2 border-t border-[#e4eadf] px-4 py-3 sm:grid-cols-2">
                    <a
                      href={mapSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-leaf shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
                    >
                      Mở trên Google Maps
                    </a>
                    <Link
                      href="/lien-he"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d9e4d7] bg-[#f6fbf3] px-4 text-sm font-semibold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                    >
                      Xem trang liên hệ đầy đủ
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9e4d7] bg-white p-6 text-center text-sm text-slate-600">
                  <MapPin size={28} className="mb-2 text-[#1f9b4b]" aria-hidden="true" />
                  <p>{emptyMapText}</p>
                  <Link href="/lien-he" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d9e4d7] bg-[#f6fbf3] px-4 font-semibold text-[#1f2233] underline-offset-2 hover:border-[#1f9b4b] hover:text-[#1f9b4b] hover:underline">
                    Xem thông tin liên hệ
                  </Link>
                </div>
              )}

              <div className="flex flex-col justify-between gap-4 rounded-[1.8rem] border border-[#dce7d9] bg-[linear-gradient(180deg,#f6fbf4_0%,#edf7ef_100%)] p-5 text-sm text-slate-700 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                <div>
                  <p className="font-semibold text-[#1f2233]">Cam kết minh bạch</p>
                  <p className="mt-2 leading-6">
                    {transparencyText}
                  </p>
                </div>
                <p className="text-xs text-slate-500">© {new Date().getFullYear()} {profile.appName}.</p>
                <p className="text-xs text-slate-500">Được thiết kế và vận hành bởi Agri Passport.</p>
                <p className="text-xs text-slate-500">{operatorLine}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
