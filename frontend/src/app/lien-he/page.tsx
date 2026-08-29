import Link from 'next/link';
import { Clock3, Mail, MapPinned, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicMapPreview } from '@/components/public-map-preview';
import { PublicInfoTile, publicContainerClass } from '@/components/public-layout';
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
      <main id="main-content">
        <section className="overflow-hidden border-b border-[#d3e5ea] bg-[#c7e1eb]">
          <div className={cn(publicContainerClass, 'py-5 sm:py-6')}>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#1f2233] sm:text-[1rem]">
              <Link href="/" className="transition hover:text-[#1f9b4b]">
                Trang Chủ
              </Link>
              <span aria-hidden="true">→</span>
              <span className="font-medium">Liên Hệ</span>
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-6 py-8 sm:py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-8')}>
          <div className="space-y-6">
            <div>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1f9b4b]">Liên hệ {siteProfile.appName}</p>
              <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-[#111827] sm:text-[2.8rem]">
                {siteProfile.pageContent.contactTitle}
              </h1>
              <p className="mt-4 max-w-[40rem] text-[0.98rem] leading-8 text-slate-700 sm:text-[1.03rem]">{siteProfile.pageContent.contactDescription}</p>
            </div>

            <div className="space-y-5 text-[#111827]">
              <div className="flex items-start gap-4">
                <PhoneCall className="mt-1 shrink-0 text-[#1f2233]" size={28} aria-hidden="true" />
                <div>
                  <p className="text-[1.05rem] font-bold">Hotline:</p>
                  <a href={telHref(siteProfile.hotline)} className="mt-1 block text-[1.02rem] leading-7 text-slate-700 transition hover:text-[#1f9b4b]">
                    {siteProfile.hotlineDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="mt-1 shrink-0 text-[#1f2233]" size={28} aria-hidden="true" />
                <div>
                  <p className="text-[1.05rem] font-bold">Email:</p>
                  <a
                    href={`mailto:${siteProfile.supportEmail}`}
                    className="mt-1 block break-all text-[1.02rem] leading-7 text-slate-700 transition hover:text-[#1f9b4b]"
                  >
                    {siteProfile.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPinned className="mt-1 shrink-0 text-[#1f2233]" size={28} aria-hidden="true" />
                <div>
                  <p className="text-[1.05rem] font-bold">Địa chỉ:</p>
                  <p className="mt-1 text-[1.02rem] leading-8 text-slate-700">{siteProfile.address}</p>
                </div>
              </div>
            </div>

            {showMapPreview ? (
              <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
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

            <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8faf7] p-4 sm:p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Giờ hỗ trợ</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#1f2233]">
                <Clock3 size={16} aria-hidden="true" />
                08:00 - 17:30 từ thứ Hai đến thứ Bảy
              </p>
            </div>
          </div>

          <PublicContactForm sourcePath="/lien-he" variant="contact" />
        </section>

        <section className={cn(publicContainerClass, 'pb-8 sm:pb-10')}>
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
          <section className={cn(publicContainerClass, 'pb-[calc(10.5rem+var(--safe-bottom))] sm:pb-12')}>
            <h2 className="text-[1.9rem] font-extrabold leading-tight text-[#1f2233] sm:text-[2.3rem]">Câu hỏi thường gặp</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {siteProfile.faqs.map((faq) => (
                <PublicInfoTile key={faq.question} title={faq.question} description={faq.answer} />
              ))}
            </div>
          </section>
        )}
      </main>
    </PublicShell>
  );
}
