import Link from 'next/link';
import { Clock3, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicMapPreview } from '@/components/public-map-preview';
import { PublicInfoTile, PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Liên hệ',
    description: 'Liên hệ HTXONLINE để được tư vấn tham gia sàn, hỗ trợ đơn hàng hoặc triển khai truy xuất nguồn gốc.',
    path: '/lien-he'
  });
}

export default async function ContactPage() {
  const siteKey = await getRequestPublicSiteKey();
  const siteProfile = await getPublicSiteProfile(siteKey);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteProfile.address)}`;
  const mapLocation = getPublicMapLocation(siteProfile);
  const showMapPreview = Boolean(siteProfile.address.trim());

  return (
    <PublicShell>
      <PublicPageMain className="pb-8 sm:pb-10 lg:pb-12">
        <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#dbe6d9] bg-[#f7faf4] px-4 py-2 text-sm text-[#1f2233]">
          <Link href="/" className="transition hover:text-[#1f9b4b]">
            Trang chủ
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium">Liên hệ</span>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-8">
          <div className="space-y-4">
            <article className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(140deg,#0d1e30_0%,#173a50_48%,#1f9b4b_100%)] p-5 text-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(173,255,208,0.18),transparent_30%)]" aria-hidden="true" />
              <div className="relative z-10">
                <p className="inline-flex min-h-9 items-center rounded-full border border-white/16 bg-white/10 px-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/88">
                  Liên hệ {siteProfile.appName}
                </p>
                <h1 className="mt-4 max-w-[12ch] text-[2rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:max-w-[14ch] sm:text-[2.85rem]">
                  {siteProfile.pageContent.contactTitle}
                </h1>
                <p className="mt-4 max-w-[42rem] text-[0.96rem] leading-7 text-white/82 sm:text-[1rem]">
                  {siteProfile.pageContent.contactDescription}
                </p>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      icon: PhoneCall,
                      label: 'Hotline',
                      value: siteProfile.hotlineDisplay,
                      href: telHref(siteProfile.hotline)
                    },
                    {
                      icon: Mail,
                      label: 'Email',
                      value: siteProfile.supportEmail,
                      href: `mailto:${siteProfile.supportEmail}`
                    },
                    {
                      icon: MapPinned,
                      label: 'Địa chỉ',
                      value: siteProfile.address,
                      href: mapSearchUrl
                    }
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.label === 'Địa chỉ' ? '_blank' : undefined}
                      rel={item.label === 'Địa chỉ' ? 'noreferrer' : undefined}
                      className="flex items-start gap-3 rounded-[1.35rem] border border-white/14 bg-white/10 px-4 py-3.5 text-white transition hover:-translate-y-0.5 hover:bg-white/14"
                    >
                      <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/12 text-white">
                        <item.icon size={20} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/64">{item.label}</span>
                        <span className="mt-1 block break-words text-sm font-semibold leading-6 text-white/92 sm:text-[0.98rem]">{item.value}</span>
                      </span>
                    </a>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href={telHref(siteProfile.hotline)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#14344b] transition hover:-translate-y-0.5"
                  >
                    Gọi hotline
                  </a>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/14"
                  >
                    Mở bản đồ
                  </a>
                </div>
              </div>
            </article>

            <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
              {showMapPreview ? (
                <div className="overflow-hidden rounded-[1.9rem] border border-[#dfe6da] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
                  <PublicMapPreview
                    address={siteProfile.address}
                    location={mapLocation}
                    mapSearchUrl={mapSearchUrl}
                    compact
                    className="rounded-none border-0 bg-[#dbece1]"
                    frameClassName="rounded-none"
                  />
                </div>
              ) : null}

              <article className="rounded-[1.9rem] border border-[#e6eadf] bg-[#fffaf2] p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Nhịp phản hồi</p>
                <h2 className="mt-2 text-[1.35rem] font-extrabold leading-[1.1] text-[#1f2233]">Hỗ trợ rõ luồng nội bộ, công khai và QR.</h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1.1rem] border border-[#e7dfcf] bg-white px-4 py-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Giờ hỗ trợ</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[#1f2233]">
                      <Clock3 size={15} aria-hidden="true" />
                      08:00 - 17:30, thứ Hai đến thứ Bảy
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#e7dfcf] bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    Điền form nếu bạn cần tư vấn triển khai theo mô hình HTX, phân quyền nội bộ hoặc kết nối dữ liệu sang lớp công khai.
                  </div>
                </div>
              </article>
            </div>
          </div>

          <PublicContactForm sourcePath="/lien-he" variant="contact" />
        </section>

        <section className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Thông tin pháp lý đối chiếu</p>
              <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.1rem]">{legalEntityProfile.organizationName}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[#f8faf7] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Mã số tổ hợp tác</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#1f2233]">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[#f8faf7] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Người đại diện</p>
                  <p className="mt-2 text-lg font-bold text-[#1f2233]">{legalEntityProfile.representative}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 sm:col-span-2">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Địa chỉ và liên hệ theo hồ sơ</p>
                  <p className="mt-2 text-[0.98rem] font-semibold leading-7 text-[#1f2233]">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Điện thoại: {legalEntityProfile.legalPhone}</p>
                  <p className="text-sm leading-6 text-slate-600">Email: {legalEntityProfile.legalEmail}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-slate-200 bg-[#f8faf7] p-5 shadow-sm sm:p-6">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Lưu ý khi liên hệ</p>
              <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.1rem]">Luồng hỗ trợ được tách rõ giữa nội bộ HTX và lớp công khai.</h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.2rem] border border-[#dde7d9] bg-white p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Hotline công khai</p>
                  <p className="mt-2 text-lg font-medium text-[#1f2233]">{siteProfile.hotlineDisplay}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[#dde7d9] bg-white p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Email hỗ trợ</p>
                  <p className="mt-2 break-all text-lg font-bold text-[#1f2233]">{siteProfile.supportEmail}</p>
                </div>
                <p className="text-sm leading-7 text-slate-600">
                  HTXONLINE ưu tiên hỗ trợ chuẩn hóa quản trị nội bộ, phân quyền, dữ liệu vận hành và kết nối sang các lớp công khai của hệ sinh thái khi cần.
                </p>
              </div>
            </article>
          </div>
        </section>

        {siteProfile.faqs.length > 0 && (
          <section className="pb-[calc(10.5rem+var(--safe-bottom))] pt-6 sm:pb-12">
            <h2 className="text-[1.9rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.3rem]">Câu hỏi thường gặp</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {siteProfile.faqs.map((faq) => (
                <PublicInfoTile key={faq.question} title={faq.question} description={faq.answer} />
              ))}
            </div>
          </section>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
