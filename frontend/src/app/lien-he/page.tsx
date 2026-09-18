import Link from 'next/link';
import { Clock3, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicMapPreview } from '@/components/public-map-preview';
import { PublicImage } from '@/components/public-image';
import { PublicBreadcrumbTrail, PublicInfoTile, PublicPageMain, publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { cn } from '@/components/ui';
import { legalEntityProfile } from '@/lib/legal-entity';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicMapLocation, getPublicSiteProfile, telHref } from '@/lib/public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata() {
  const siteKey = await getRequestPublicSiteKey();
  const appName = siteKey === 'passport' ? 'Hộ chiếu nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'AGRIPASSPORT';
  return buildPublicMetadata({
    title: `Liên hệ ${appName}`,
    description:
      siteKey === 'passport'
        ? 'Liên hệ Hộ chiếu nông nghiệp để tìm hiểu thông tin định danh, QR truy xuất nguồn gốc nông sản và kết nối hợp tác xã.'
        : siteKey === 'htxonline'
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
  const isHtxonline = siteKey === 'htxonline';
  const isPassport = siteKey === 'passport';
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteProfile.address)}`;
  const mapLocation = getPublicMapLocation(siteProfile);
  const showMapPreview = Boolean(siteProfile.address.trim());
  const contactDescription = isHtxonline
    ? siteProfile.pageContent.contactDescription
    : isPassport
    ? 'Tìm hiểu định danh nông sản, cấp mã QR truy xuất nguồn gốc hoặc hợp tác triển khai giải pháp Hộ chiếu nông nghiệp.'
    : 'Tìm hiểu sản phẩm, QR truy xuất nguồn gốc hoặc kết nối với hợp tác xã phù hợp với nhu cầu của bạn.';
  if (isPassport) {
    return (
      <PublicShell>
        <PublicPageMain className="pb-8 sm:pb-10 lg:pb-12">
          <PublicBreadcrumbTrail current="Liên hệ" path="/lien-he" homeUrl={homeUrl} currentUrl={currentUrl} />

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-6">
            <article className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(145deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] p-5 shadow-sm sm:p-7">
              <p className="inline-flex min-h-8 items-center rounded-full border border-[var(--border-strong)] bg-white/80 px-3 text-xs font-bold text-[var(--brand-primary)]">
                Kết nối Hộ chiếu nông nghiệp
              </p>
              <h1 className="mt-4 max-w-[18ch] text-3xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl">
                {siteProfile.pageContent.contactTitle}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
                Hỏi về hồ sơ QR, dữ liệu truy xuất hoặc cách kết nối hợp tác xã.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: PhoneCall, label: 'Hotline', value: siteProfile.hotlineDisplay, href: telHref(siteProfile.hotline) },
                  { icon: Mail, label: 'Email', value: siteProfile.supportEmail, href: `mailto:${siteProfile.supportEmail}` },
                  { icon: MapPinned, label: 'Địa chỉ', value: siteProfile.address, href: mapSearchUrl }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.label === 'Địa chỉ' ? '_blank' : undefined}
                    rel={item.label === 'Địa chỉ' ? 'noreferrer' : undefined}
                    className={cn(
                      'flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/85 p-3 transition hover:border-[var(--brand-primary)] hover:bg-white',
                      item.label === 'Địa chỉ' && 'sm:col-span-2'
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                      <item.icon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-[var(--text-tertiary)]">{item.label}</span>
                      <span className="mt-0.5 block break-words text-sm font-bold leading-5 text-[var(--text-primary)]">{item.value}</span>
                    </span>
                  </a>
                ))}
              </div>
            </article>

            <div id="gui-yeu-cau" className="scroll-mt-24">
              <PublicContactForm sourcePath="/lien-he" variant="contact" audience="public" siteKey={siteKey} />
            </div>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <figure className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)]">
              <PublicImage
                src={siteProfile.pageContent.contactImageUrl}
                alt={siteProfile.pageContent.contactImageAlt}
                wrapperClassName="aspect-[16/10] h-full min-h-56"
                className="h-full w-full object-cover"
                priority
              />
            </figure>
            <div className="grid gap-4">
              {showMapPreview && (
                <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white">
                  <PublicMapPreview
                    address={siteProfile.address}
                    location={mapLocation}
                    mapSearchUrl={mapSearchUrl}
                    mapEmbedUrl={siteProfile.mapEmbedUrl}
                    compact
                    className="rounded-none"
                  />
                </div>
              )}
              <article className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[var(--brand-primary)] shadow-sm">
                  <Clock3 size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)]">Giờ hỗ trợ</p>
                  <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">08:00–17:30, thứ Hai đến thứ Bảy</p>
                </div>
              </article>
            </div>
          </section>

          <details className="mt-4 rounded-2xl border border-[var(--border)] bg-white">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-[var(--text-primary)] marker:hidden sm:px-5">
              Thông tin đơn vị tiếp nhận
              <span className="text-xs font-medium text-[var(--text-tertiary)]">Mở khi cần đối chiếu</span>
            </summary>
            <div className="grid gap-3 border-t border-[var(--border)] p-4 sm:grid-cols-2 sm:p-5">
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-semibold text-[var(--text-tertiary)]">Đơn vị</p>
                <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{legalEntityProfile.organizationName}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-4">
                <p className="text-xs font-semibold text-[var(--text-tertiary)]">Mã số đăng ký</p>
                <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{legalEntityProfile.registrationNumber}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-4 sm:col-span-2">
                <p className="text-xs font-semibold text-[var(--text-tertiary)]">Địa chỉ theo hồ sơ</p>
                <p className="mt-1 text-sm font-bold leading-6 text-[var(--text-primary)]">{legalEntityProfile.legalAddress}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Đại diện: {legalEntityProfile.representative} · {legalEntityProfile.authority}</p>
              </div>
            </div>
          </details>

        </PublicPageMain>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PublicPageMain className="pb-8 sm:pb-10 lg:pb-12">
        <PublicBreadcrumbTrail current="Liên hệ" path="/lien-he" homeUrl={homeUrl} currentUrl={currentUrl} />

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-8">
          <div className="space-y-4">
            <article className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(145deg,var(--surface-elevated)_0%,var(--brand-primary-subtle)_100%)] p-5 text-[var(--text-primary)] shadow-[0_22px_52px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--brand-primary-subtle)] blur-2xl" aria-hidden="true" />
              <div className="relative z-10">
                <p className={cn('inline-flex min-h-8 items-center rounded-full border border-[var(--border-strong)] bg-white/70 px-3 text-[0.7rem] font-semibold tracking-[0.16em] text-[var(--brand-primary)]', !isPassport && 'uppercase')}>
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
                      <span className={cn('block text-[0.68rem] font-semibold tracking-[0.16em] text-[var(--brand-primary)]', !isPassport && 'uppercase')}>{item.label}</span>
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
                <p className={cn('text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--brand-primary-strong)]', !isPassport && 'uppercase')}>Nhịp phản hồi</p>
                <h2 className="type-h2 mt-2 text-[1.35rem]">
                  {isHtxonline ? 'Hỗ trợ rõ luồng nội bộ, công khai và QR.' : 'Chúng tôi luôn sẵn sàng hỗ trợ bạn.'}
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                    <p className={cn('text-[0.7rem] font-semibold tracking-[0.16em] text-slate-500', !isPassport && 'uppercase')}>Giờ hỗ trợ</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                      <Clock3 size={15} aria-hidden="true" />
                      08:00 - 17:30, thứ Hai đến thứ Bảy
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {isHtxonline
                      ? 'Điền form nếu bạn cần tư vấn triển khai theo mô hình hợp tác xã, phân quyền nội bộ hoặc kết nối dữ liệu sang lớp công khai.'
                      : 'Gửi câu hỏi về sản phẩm, mã QR truy xuất, nguồn gốc nông sản hoặc kết nối hợp tác xã; đội ngũ sẽ phản hồi nhanh chóng.'}
                  </div>
                </div>
              </article>
            </div>
          </div>

          <PublicContactForm sourcePath="/lien-he" variant="contact" audience={isHtxonline ? 'operator' : 'public'} siteKey={siteKey} />
        </section>

        <section className="mt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-sm sm:p-6">
              <p className={cn('text-[0.78rem] font-semibold tracking-[0.18em] text-[var(--brand-primary)]', !isPassport && 'uppercase')}>Thông tin pháp lý đối chiếu</p>
              <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[2.1rem]">{legalEntityProfile.organizationName}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[var(--surface-muted)] p-4">
                  <p className={cn('text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500', !isPassport && 'uppercase')}>Mã số tổ hợp tác</p>
                  <p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">{legalEntityProfile.registrationNumber}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Đăng ký lần đầu ngày {legalEntityProfile.registrationDate}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[var(--surface-muted)] p-4">
                  <p className={cn('text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500', !isPassport && 'uppercase')}>Người đại diện</p>
                  <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">{legalEntityProfile.representative}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{legalEntityProfile.authority}</p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:col-span-2">
                  <p className={cn('text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500', !isPassport && 'uppercase')}>Địa chỉ và liên hệ theo hồ sơ</p>
                  <p className="mt-2 text-[0.98rem] font-semibold leading-7 text-[var(--text-primary)]">{legalEntityProfile.legalAddress}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Điện thoại: {legalEntityProfile.legalPhone}</p>
                  <p className="text-sm leading-6 text-slate-600">Email: {legalEntityProfile.legalEmail}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface-muted)] p-5 shadow-sm sm:p-6">
              <p className={cn('text-[0.78rem] font-semibold tracking-[0.18em] text-[var(--brand-primary)]', !isPassport && 'uppercase')}>Hướng dẫn liên hệ</p>
              <h2 className="mt-3 text-[1.7rem] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[2.1rem]">
                {isHtxonline ? 'Quy trình tiếp nhận và xử lý yêu cầu' : 'Tiếp nhận yêu cầu theo từng nhóm đối tượng'}
              </h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">Hợp tác xã và nông hộ</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Cần hướng dẫn tạo tài khoản, đăng ký vùng trồng hoặc số hóa quy trình cấp mã QR Hộ chiếu nông nghiệp, vui lòng điền form yêu cầu hỗ trợ chuyển đổi số.
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-xs font-bold tracking-wider text-[var(--brand-primary)]">Doanh nghiệp và người tiêu dùng</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Cần kết nối tiêu thụ nông sản số lượng lớn, đối chiếu hồ sơ kiểm định hoặc phản hồi thông tin sản phẩm, đội ngũ sẽ hỗ trợ xác minh trong 24 giờ.
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <p className={cn('text-xs font-bold tracking-wider text-[var(--brand-primary)]', !isPassport && 'uppercase')}>Cam kết phản hồi</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Tất cả thư điện tử và thông tin liên hệ được bảo mật theo quy định, phản hồi đúng thẩm quyền và lưu vết trong hệ thống tiếp nhận.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

      </PublicPageMain>
    </PublicShell>
  );
}
