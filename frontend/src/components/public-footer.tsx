import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import type { PublicSiteKey } from '@/lib/domain';
import { publicContainerClass } from './public-layout';
import { PublicLogo } from './public-logo';
import { PublicMapPreview } from './public-map-preview';
import { ecosystemCards } from './public-ecosystem-showcase';
import { cn } from './ui';

const footerLinkClass = 'inline-flex min-h-11 items-center text-sm font-medium text-slate-600 transition hover:text-[#1f9b4b]';

export async function PublicFooter({ siteKey = 'agripassport' }: { siteKey?: PublicSiteKey }) {
  const profile = await getPublicSiteProfile(siteKey);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`;
  const mapLocation = getPublicMapLocation(profile);
  const showMapPreview = Boolean(profile.address.trim());
  const isInternal = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
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
  const policyLinks = [
    { href: '/dieu-khoan-su-dung', label: 'Điều khoản sử dụng' },
    { href: '/chinh-sach-bao-mat', label: 'Chính sách bảo mật' },
    { href: '/chinh-sach-doi-tra', label: 'Chính sách đổi trả' },
    { href: '/chinh-sach-van-hanh', label: 'Chính sách vận hành' }
  ];
  const supportNote = isInternal
    ? 'Nếu cần hỗ trợ quản trị, phân quyền hoặc đồng bộ dữ liệu giữa các lớp hệ thống, hãy liên hệ hotline hoặc email.'
    : isPassport
      ? 'Nếu quét QR không ra hồ sơ hoặc thông tin truy xuất chưa đúng, hãy liên hệ hotline hoặc email để được hỗ trợ nhanh.'
      : 'Nếu tra cứu QR hoặc đơn hàng gặp vấn đề, hãy liên hệ hotline hoặc email để được hỗ trợ nhanh.';
  const mapHint = isInternal
    ? 'Xem nhanh vị trí hỗ trợ triển khai và mở Google Maps khi cần lấy chỉ đường rõ hơn.'
    : isPassport
      ? 'Xem nhanh vị trí hỗ trợ hồ sơ số và mở Google Maps khi cần lấy chỉ đường rõ hơn.'
      : 'Xem nhanh vị trí hỗ trợ nền tảng và mở Google Maps khi cần lấy chỉ đường rõ hơn.';
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

  if (isInternal) {
    return (
      <footer className="mt-12 border-t border-[#e6ece0] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbf6_100%)] pb-[calc(6.5rem+var(--safe-bottom))] text-[#1f2233] lg:pb-0">
        <div className={publicContainerClass}>
          <div className="py-8 sm:py-10">
            <div className="grid gap-5 border-b border-[#e4eadf] pb-8 sm:grid-cols-2 lg:grid-cols-[0.88fr_0.98fr_1.14fr_0.9fr]">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-[#dce7d9] bg-[#1d2436] shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                    <PublicLogo size={36} />
                  </span>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">
                      {brandTagline}
                    </p>
                    <p className="mt-1 text-[1.2rem] font-extrabold tracking-[-0.03em]">
                      {profile.appName}
                    </p>
                  </div>
                </div>

                <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">
                  {brandDescription}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={telHref(profile.hotline)}
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#dce7d9] bg-white text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                  >
                    Gọi
                  </a>
                  <a
                    href={`mailto:${profile.supportEmail}`}
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#dce7d9] bg-white text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                  >
                    Mail
                  </a>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#dce7d9] bg-white text-[0.56rem] font-bold uppercase tracking-[0.08em] text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                  >
                    Map
                  </a>
                  <Link
                    href="/tin-tuc"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[#dce7d9] bg-white text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                  >
                    Tin
                  </Link>
                </div>

                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#1f2233]">
                  Theo dõi vận hành
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  {supportNote}
                </p>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#1f2233]">
                  Trung tâm hỗ trợ HTXONLINE
                </p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <p className="flex items-start gap-2">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[#1f9b4b]"
                      aria-hidden="true"
                    />
                    <span>{profile.address}</span>
                  </p>
                  <a
                    href={telHref(profile.hotline)}
                    className="flex min-h-11 items-center gap-2 transition hover:text-[#1f9b4b]"
                  >
                    <Phone size={18} className="text-[#1f9b4b]" aria-hidden="true" />
                    <span>{profile.hotlineDisplay}</span>
                  </a>
                  <a
                    href={`mailto:${profile.supportEmail}`}
                    className="flex min-h-11 items-center gap-2 transition hover:text-[#1f9b4b]"
                  >
                    <Mail size={18} className="text-[#1f9b4b]" aria-hidden="true" />
                    <span>{profile.supportEmail}</span>
                  </a>
                </div>

                <p className="mt-5 rounded-[1.35rem] bg-[#f3f8f1] px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-[#dbe6d7]">
                  {transparencyText}
                </p>
              </div>

              <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2 lg:col-span-1">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#1f2233]">
                    Truy cập nhanh
                  </p>
                  <div className="mt-4 grid gap-2">
                    {serviceLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex min-h-10 items-center rounded-full border border-[#e1e8dd] bg-white px-3.5 py-2 text-[0.78rem] font-semibold leading-5 text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#1f2233]">
                    Quy trình và chính sách
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[...processLinks, ...policyLinks].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex min-h-10 items-center rounded-full border border-[#e1e8dd] bg-white px-3.5 py-2 text-[0.78rem] font-semibold leading-5 text-[#1f2233] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-[#e2e9dc] bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)] sm:col-span-2 lg:col-span-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                      Điểm hỗ trợ
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1f2233]">
                      Bản đồ và liên hệ nhanh
                    </p>
                  </div>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#dce7d9] bg-white px-4 text-xs font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
                  >
                    Google Maps
                  </a>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">{mapHint}</p>

                {showMapPreview ? (
                  <>
                    <div className="mt-4 rounded-[1.4rem] border border-[#dbe7d9] bg-[#f6fbf3] p-4 sm:hidden">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">
                        Văn phòng hỗ trợ
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#1f2233]">
                        {profile.address}
                      </p>
                      <a
                        href={mapSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#1f9b4b] px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(31,155,75,0.18)] transition hover:-translate-y-0.5"
                      >
                        Mở trên Google Maps
                      </a>
                    </div>
                    <div className="mt-4 hidden overflow-hidden rounded-[1.5rem] border border-[#dbe7d9] bg-[#eef5ee] p-2 sm:block">
                      <PublicMapPreview
                        address={profile.address}
                        location={mapLocation}
                        mapSearchUrl={mapSearchUrl}
                        compact
                      />
                    </div>
                  </>
                ) : (
                  <Link
                    href="/lien-he"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-[#dce7d9] bg-[#f6fbf3] px-4 text-sm font-semibold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                  >
                    Xem thông tin liên hệ
                  </Link>
                )}
              </div>
            </div>

            <div className="py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-xl">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e]">
                    Hệ sinh thái giải pháp toàn diện
                  </p>
                  <p className="mt-2 text-[1.1rem] font-extrabold leading-tight tracking-[-0.02em] text-[#1f2233]">
                    Mỗi nền tảng giữ một vai trò rõ để HTX vận hành nội bộ gọn hơn, công khai sản phẩm đúng lớp và truy xuất minh bạch hơn.
                  </p>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600 sm:text-right">
                  {operatorLine}
                </p>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {ecosystemCards.map((card) => {
                  const Icon = card.icon;
                  const isCurrent = siteKey === card.key;
                  return (
                    <a
                      key={card.key}
                      href={card.href}
                      className={`group relative overflow-hidden rounded-[1.55rem] px-4 py-4 text-white shadow-[0_18px_38px_rgba(15,23,42,0.1)] transition hover:-translate-y-0.5 ${isCurrent ? 'ring-2 ring-[#9fe2b1]/70' : ''}`}
                    >
                      <div className={`absolute inset-0 ${card.gradientClassName}`} />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-80"
                        style={{
                          background:
                            'radial-gradient(circle at left top, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 90% 22%, rgba(255,255,255,0.12), transparent 24%)'
                        }}
                      />
                      <div className="relative flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/16 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.72)]">
                            {card.label}
                          </span>
                          <span className="mt-1 block text-[1rem] font-extrabold leading-tight">
                            {card.name}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-[rgba(255,255,255,0.86)]">
                            {isCurrent ? 'Đang là giao diện bạn đang xem' : card.signal}
                          </span>
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#101725] text-white/72">
          <div className={cn(publicContainerClass, 'flex flex-col gap-2 py-4 text-sm sm:flex-row sm:items-center sm:justify-between')}>
            <p>© {new Date().getFullYear()} {profile.appName}. Được thiết kế và vận hành bởi Agri Passport.</p>
            <p className="text-white/56">Luồng nội bộ, sản phẩm công khai và QR truy xuất được tách vai trò rõ ràng.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-10 border-t border-[#e6ece0] bg-[linear-gradient(180deg,#ffffff_0%,#f7faf5_100%)] pb-[calc(6.5rem+var(--safe-bottom))] text-[#1f2233] lg:pb-0">
      <div className={publicContainerClass}>
        <div className="py-10 sm:py-12">
          <div className="grid gap-8 border-b border-[#e4eadf] pb-8 lg:grid-cols-[1.12fr_0.72fr_0.78fr_1fr]">
            <div>
              <div className="flex items-center gap-3 text-xl font-extrabold text-[#1f2233]">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-[#dce7d9] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                  <PublicLogo size={40} />
                </span>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">{brandTagline}</p>
                  <p className="mt-1 text-[1.15rem] font-extrabold tracking-[-0.03em]">{profile.appName}</p>
                </div>
              </div>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">{brandDescription}</p>

              <div className="mt-5 grid gap-3 text-sm text-slate-700">
                <p className="flex items-start gap-2">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-[#1f9b4b]" aria-hidden="true" />
                  <span>{profile.address}</span>
                </p>
                <a href={telHref(profile.hotline)} className="flex min-h-11 items-center gap-2 transition hover:text-[#1f9b4b]">
                  <Phone size={18} className="text-[#1f9b4b]" aria-hidden="true" />
                  <span>{profile.hotlineDisplay}</span>
                </a>
                <a href={`mailto:${profile.supportEmail}`} className="flex min-h-11 items-center gap-2 transition hover:text-[#1f9b4b]">
                  <Mail size={18} className="text-[#1f9b4b]" aria-hidden="true" />
                  <span>{profile.supportEmail}</span>
                </a>
              </div>

              <p className="mt-4 rounded-[1.4rem] bg-[#f4faf2] px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-[#dce8da]">{supportNote}</p>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#1f2233]">{serviceTitle}</p>
              <div className="mt-4 grid gap-1">
                {serviceLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#1f2233]">Quy trình và chính sách</p>
              <div className="mt-4 grid gap-1">
                {[...processLinks, ...policyLinks].map((item) => (
                  <Link key={item.href} href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-[#e2e9dc] bg-white/80 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Điểm hỗ trợ</p>
                  <p className="mt-1 text-sm font-semibold text-[#1f2233]">Bản đồ và liên hệ nhanh</p>
                </div>
                <a
                  href={mapSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#dce7d9] bg-white px-4 text-xs font-semibold text-[#1f9b4b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1f9b4b]"
                >
                  Google Maps
                </a>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{showMapPreview ? mapHint : emptyMapText}</p>

              {showMapPreview ? (
                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#dbe7d9] bg-[#eef5ee] p-2">
                  <PublicMapPreview address={profile.address} location={mapLocation} mapSearchUrl={mapSearchUrl} compact />
                </div>
              ) : (
                <Link
                  href="/lien-he"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-[#dce7d9] bg-[#f6fbf3] px-4 text-sm font-semibold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                >
                  Xem thông tin liên hệ
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 border-b border-[#e4eadf] py-6 text-sm text-slate-600 lg:grid-cols-[1.18fr_0.82fr]">
            <p className="leading-7">{transparencyText}</p>
            <div className="flex flex-col gap-1 leading-7 lg:items-end lg:text-right">
              <p>{operatorLine}</p>
              <p>© {new Date().getFullYear()} {profile.appName}. Được thiết kế và vận hành bởi Agri Passport.</p>
            </div>
          </div>

          <div className="py-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#2b8a3e]">Hệ sinh thái giải pháp toàn diện</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {ecosystemCards.map((card) => {
                const Icon = card.icon;
                const isCurrent = siteKey === card.key;
                return (
                  <a
                    key={card.key}
                    href={card.href}
                    className={`group relative overflow-hidden rounded-[1.55rem] px-4 py-4 text-white shadow-[0_18px_38px_rgba(15,23,42,0.1)] transition hover:-translate-y-0.5 ${isCurrent ? 'ring-2 ring-[#9fe2b1]/70' : ''}`}
                  >
                    <div className={`absolute inset-0 ${card.gradientClassName}`} />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-80"
                      style={{
                        background:
                          'radial-gradient(circle at left top, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 90% 22%, rgba(255,255,255,0.12), transparent 24%)'
                      }}
                    />
                    <div className="relative flex items-start gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/16 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.72)]">{card.label}</span>
                        <span className="mt-1 block text-[1rem] font-extrabold leading-tight">{card.name}</span>
                        <span className="mt-1 block text-sm leading-6 text-[rgba(255,255,255,0.86)]">{isCurrent ? 'Đang là giao diện bạn đang xem' : card.signal}</span>
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
