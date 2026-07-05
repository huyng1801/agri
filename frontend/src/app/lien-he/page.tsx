import { Mail, MapPinned, MessageSquareText, PhoneCall } from 'lucide-react';
import { PublicContactForm } from '@/components/public-contact-form';
import { PublicStaticPage } from '@/components/public-static-page';
import { Panel } from '@/components/ui';
import { getPublicSiteProfile, telHref } from '@/lib/public-site';

export default async function ContactPage() {
  const siteProfile = await getPublicSiteProfile();

  return (
    <PublicStaticPage title="Liên hệ" description="Gửi thông tin để HTXONLINE tư vấn tham gia sàn, hỗ trợ đơn hàng hoặc đồng hành triển khai truy xuất nguồn gốc.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Panel>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-ink">Gửi yêu cầu</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Đội vận hành sẽ tiếp nhận thông tin và phản hồi theo số điện thoại hoặc email bạn để lại.</p>
          </div>
          <PublicContactForm />
        </Panel>

        <div className="grid gap-4">
          <Panel>
            <h2 className="text-lg font-bold">Thông tin nhanh</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <a href={telHref(siteProfile.hotline)} className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
                <PhoneCall className="mt-0.5 text-leaf" size={18} aria-hidden="true" />
                <span>
                  <span className="block text-xs font-semibold uppercase text-slate-500">Hotline</span>
                  <span className="mt-1 block font-bold text-ink">{siteProfile.hotlineDisplay}</span>
                </span>
              </a>
              <a href={`mailto:${siteProfile.supportEmail}`} className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
                <Mail className="mt-0.5 text-leaf" size={18} aria-hidden="true" />
                <span>
                  <span className="block text-xs font-semibold uppercase text-slate-500">Email</span>
                  <span className="mt-1 block font-bold text-ink">{siteProfile.supportEmail}</span>
                </span>
              </a>
              {siteProfile.zaloUrl && (
                <a href={siteProfile.zaloUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
                  <MessageSquareText className="mt-0.5 text-leaf" size={18} aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-semibold uppercase text-slate-500">Zalo</span>
                    <span className="mt-1 block font-bold text-ink">Chat nhanh với HTXONLINE</span>
                  </span>
                </a>
              )}
              <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
                <MapPinned className="mt-0.5 text-leaf" size={18} aria-hidden="true" />
                <span>
                  <span className="block text-xs font-semibold uppercase text-slate-500">Địa chỉ</span>
                  <span className="mt-1 block font-bold text-ink">{siteProfile.address}</span>
                </span>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-lg font-bold">FAQ nhanh</h2>
            <div className="mt-4 space-y-3">
              {siteProfile.faqs.map((faq) => (
                <div key={faq.question} className="rounded-md bg-slate-50 p-3">
                  <p className="font-semibold text-ink">{faq.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Panel>

          {siteProfile.mapEmbedUrl ? (
            <Panel className="overflow-hidden p-0">
              <iframe
                title="Bản đồ HTXONLINE"
                src={siteProfile.mapEmbedUrl}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Panel>
          ) : null}
        </div>
      </div>
    </PublicStaticPage>
  );
}
