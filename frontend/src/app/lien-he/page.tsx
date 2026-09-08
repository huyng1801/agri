import Link from 'next/link';
import { Clock3, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicMapPreview } from '@/components/public-map-preview';
import { PublicBreadcrumbTrail, PublicFaqItem, PublicInfoTile, PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  const siteKey = await getRequestPublicSiteKey();
  const appName = siteKey === 'htxonline' ? 'HTXONLINE' : 'AGRIPASSPORT';
  return buildPublicMetadata({
    title: `Liên hệ ${appName}`,
    description:
      siteKey === 'htxonline'
        ? 'Liên hệ HTXONLINE để được tư vấn quản trị và vận hành hợp tác xã.'
        : 'Liên hệ Agripassport để tìm hiểu sản phẩm, QR truy xuất và kết nối với hợp tác xã.',
    path: '/lien-he'
  });
}

export default async function ContactPage() {
  const [siteKey, homeUrl, currentUrl] = await Promise.all([
    getRequestPublicSiteKey(),
    getRequestAbsoluteUrl('/'),
    getRequestAbsoluteUrl('/lien-he')
  ]);
  const siteProfile = await getPublicSiteProfile(siteKey);
  const isAgripassport = siteKey === 'agripassport' || siteKey === 'local';
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteProfile.address)}`;
  const mapLocation = getPublicMapLocation(siteProfile);
  const showMapPreview = Boolean(siteProfile.address.trim());
  const contactDescription = isAgripassport
    ? 'Tìm hiểu sản phẩm, QR truy xuất nguồn gốc hoặc kết nối với hợp tác xã phù hợp với nhu cầu của bạn.'
    : siteProfile.pageContent.contactDescription;
  const faqs = isAgripassport
    ? siteProfile.faqs.filter((faq) => !/COD|đơn hàng/i.test(`${faq.question} ${faq.answer}`))
    : siteProfile.faqs;

  return (
    <PublicShell>
      <PublicPageMain className="pb-8 sm:pb-10 lg:pb-12">
        <PublicBreadcrumbTrail current="Liên hệ" path="/lien-he" homeUrl={homeUrl} currentUrl={currentUrl} />

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-8">
          <div className="space-y-4">
            <article className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(145deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] p-5 text-[var(--text-primary)] shadow-[0_22px_52px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--brand-primary-subtle)] blur-2xl" aria-hidden="true" />
              <div className="relative z-10">
                <p className="inline-flex min-h-8 items-center rounded-full border border-[var(--border-strong)] bg-white/70 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                  Liên hệ {siteProfile.appName}
                </p>
                <h1 className="type-h1 mt-4 max-w-[18ch] text-[2rem] sm:max-w-[14ch] sm:text-[2.75rem]">
                  {siteProfile.pageContent.contactTitle}
                </h1>
                <p className="mt-3 max-w-[42rem] text-[0.95rem] leading-7 text-[var(--text-secondary)] sm:text-[1rem]">
                  {contactDescription}
                </p>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
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
                      className={cn('flex items-start gap-3 rounded-[1.2rem] border border-[var(--border-strong)] bg-white/72 px-3.5 py-3 transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:bg-white', (item.label === 'Địa chỉ' || item.label === 'Email') && 'sm:col-span-2')}
                    >
                      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                        <item.icon size={20} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                      <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">{item.label}</span>
                        <span className="mt-1 block break-words text-sm font-semibold leading-5 text-ink sm:text-[0.95rem]">{item.value}</span>
                      </span>
                    </a>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href={telHref(siteProfile.hotline)}
                    className="brand-gradient-bg inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Gọi hotline
                  </a>
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-white/70 px-4 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    Mở bản đồ
                  </a>
                </div>
              </div>
            </article>

            <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
              {showMapPreview ? (
                <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
                  <PublicMapPreview
                    address={siteProfile.address}
                    location={mapLocation}
                    mapSearchUrl={mapSearchUrl}
                    mapEmbedUrl={siteProfile.mapEmbedUrl}
                    compact
                    className="rounded-none border-0 bg-[var(--brand-primary-subtle)]"
                    frameClassName="rounded-none"
                  />
                </div>
              ) : null}

              <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary-strong)]">Nhịp phản hồi</p>
                <h2 className="type-h2 mt-2 text-[1.35rem]">
                  {isAgripassport ? 'Chúng tôi sẽ giúp bạn tìm đúng thông tin.' : 'Hỗ trợ rõ luồng nội bộ, công khai và QR.'}
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Giờ hỗ trợ</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                      <Clock3 size={15} aria-hidden="true" />
                      08:00 - 17:30, thứ Hai đến thứ Bảy
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {isAgripassport
                      ? 'Gửi câu hỏi về sản phẩm, QR, nguồn gốc hoặc HTX; đội ngũ sẽ phản hồi theo đúng nội dung bạn cần.'
                      : 'Điền form nếu bạn cần tư vấn triển khai theo mô hình HTX, phân quyền nội bộ hoặc kết nối dữ liệu sang lớp công khai.'}
                  </div>
                </div>
              </article>
            </div>
          </div>

          <PublicContactForm sourcePath="/lien-he" variant="contact" audience={isAgripassport ? 'public' : 'operator'} />
        </section>

        <section className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-sm sm:p-6">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Thông tin pháp lý đối chiếu</p>
              <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[2.1rem]">{legalEntityProfile.organizationName}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[var(--surface-muted)] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Mã số tổ hợp tác</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[var(--surface-muted)] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Người đại diện</p>
                  <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{legalEntityProfile.representative}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:col-span-2">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Địa chỉ và liên hệ theo hồ sơ</p>
                  <p className="mt-2 text-[0.98rem] font-semibold leading-7 text-[var(--text-primary)]">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Điện thoại: {legalEntityProfile.legalPhone}</p>
                  <p className="text-sm leading-6 text-slate-600">Email: {legalEntityProfile.legalEmail}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-sm sm:p-6">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Lưu ý khi liên hệ</p>
              <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[2.1rem]">
                {isAgripassport ? 'Kênh liên hệ chính thức của Agripassport.' : 'Luồng hỗ trợ được tách rõ giữa nội bộ HTX và lớp công khai.'}
              </h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.2rem] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Hotline công khai</p>
                  <p className="mt-2 text-lg font-medium text-[var(--text-primary)]">{siteProfile.hotlineDisplay}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Email hỗ trợ</p>
                  <p className="mt-2 break-all text-lg font-bold text-[var(--text-primary)]">{siteProfile.supportEmail}</p>
                </div>
                <p className="text-sm leading-7 text-slate-600">
                  {isAgripassport
                    ? 'Bạn có thể gọi hotline hoặc gửi email để được hỗ trợ tra cứu sản phẩm, QR và thông tin hợp tác xã.'
                    : 'HTXONLINE ưu tiên hỗ trợ chuẩn hóa quản trị nội bộ, phân quyền, dữ liệu vận hành và kết nối sang các lớp công khai của hệ sinh thái khi cần.'}
                </p>
              </div>
            </article>
          </div>
        </section>

        {faqs.length > 0 && (
          <section className="pb-[calc(10.5rem+var(--safe-bottom))] pt-6 sm:pb-12">
            <h2 className="type-h2 text-[1.9rem] sm:text-[2.3rem]">Câu hỏi thường gặp</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {faqs.map((faq) => (
                <PublicFaqItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
