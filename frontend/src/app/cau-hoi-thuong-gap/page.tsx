import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, QrCode, Building2, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { PublicBreadcrumbTrail, PublicFaqItem, PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from '@/lib/request-site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const siteName = siteKey === 'passport' ? 'Hộ chiếu Nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';
  return buildPublicMetadata({
    title: `Câu hỏi thường gặp - ${siteName}`,
    description: `Giải đáp chi tiết về định danh nông sản, quét mã QR truy xuất nguồn gốc, dữ liệu nhật ký canh tác và quy trình cấp Hộ chiếu Nông nghiệp.`,
    path: '/cau-hoi-thuong-gap',
    keywords: ['FAQ Hộ chiếu Nông nghiệp', 'QR truy xuất nguồn gốc', 'hồ sơ nông sản số', 'hợp tác xã', 'VietGAP', 'OCOP']
  });
}

type FaqCategory = {
  title: string;
  icon: typeof HelpCircle;
  description: string;
  items: Array<{ question: string; answer: string }>;
};

export default async function FaqPage() {
  const [siteKey, homeUrl, currentUrl] = await Promise.all([
    getRequestPublicSiteKey(),
    getRequestAbsoluteUrl('/'),
    getRequestAbsoluteUrl('/cau-hoi-thuong-gap')
  ]);
  const siteProfile = await getPublicSiteProfile(siteKey);
  const siteName = siteKey === 'passport' ? 'Hộ chiếu Nông nghiệp' : siteKey === 'htxonline' ? 'HTXONLINE' : 'Agripassport';

  const categories: FaqCategory[] = [
    {
      title: 'Về nền tảng Hộ Chiếu Nông Nghiệp',
      icon: HelpCircle,
      description: 'Khái niệm, cấu trúc hệ sinh thái và nguyên tắc công khai dữ liệu nông sản.',
      items: [
        {
          question: `${siteName} là gì?`,
          answer: `${siteName} là giải pháp định danh số và hồ sơ số hóa dành riêng cho nông sản Việt Nam. Mỗi sản phẩm được cấp một Hộ chiếu điện tử gắn với mã QR duy nhất, hiển thị thông tin xuất xứ, vùng trồng, hợp tác xã sản xuất, quy trình canh tác và giấy chứng nhận kiểm nghiệm.`
        },
        {
          question: 'Hệ sinh thái gồm những cấu phần nào?',
          answer: 'Hệ sinh thái gồm 3 lớp độc lập: (1) HỘ CHIẾU NÔNG NGHIỆP là cổng tra cứu số công khai và định danh QR; (2) AGRIPASSPORT là danh mục kết nối dữ liệu thị trường nông sản; (3) HTXONLINE là phần mềm nghiệp vụ quản trị nội bộ dành cho ban quản trị và xã viên Hợp tác xã.'
        },
        {
          question: 'Dữ liệu trên Hộ chiếu được đối chiếu ra sao?',
          answer: 'Toàn bộ hồ sơ gồm mã vùng trồng, thông tin cơ sở đóng gói, xã viên canh tác và các văn bằng chứng nhận (VietGAP, GlobalGAP, OCOP, HACCP...) đều được kiểm tra tính hợp lệ trước khi kích hoạt hiển thị công khai trên giao diện mã QR.'
        }
      ]
    },
    {
      title: 'Dành cho Người tiêu dùng & Quét mã QR',
      icon: QrCode,
      description: 'Cách tra cứu, đọc nhật ký canh tác và kiểm chứng chất lượng khi mua nông sản.',
      items: [
        {
          question: 'Tôi quét và kiểm tra mã QR như thế nào?',
          answer: 'Bạn có thể sử dụng ứng dụng Zalo hoặc camera mặc định trên điện thoại thông minh để quét mã QR in trên bao bì hoặc tem sản phẩm. Trình duyệt sẽ mở trực tiếp trang Hộ chiếu số của đúng lô sản phẩm đó.'
        },
        {
          question: 'Có cần cài đặt app hoặc đăng ký tài khoản để xem không?',
          answer: 'Hoàn toàn không. Trang Hộ chiếu Nông nghiệp hoạt động trực tiếp trên nền web chuẩn di động, không yêu cầu người tiêu dùng tải ứng dụng hay đăng nhập tài khoản cá nhân.'
        },
        {
          question: 'Nếu tem QR bị xước mờ hoặc không quét được thì làm sao?',
          answer: 'Bên dưới mỗi mã QR trên tem luôn có mã số định danh định dạng văn bản (ví dụ: HP-xxxxxx). Bạn có thể truy cập website hochieunongnghiep.com và nhập trực tiếp mã số này vào ô tìm kiếm để tra cứu.'
        },
        {
          question: 'Làm sao để biết chứng nhận VietGAP / OCOP còn hạn hay không?',
          answer: 'Trong mục "Chứng nhận & Kiểm định" trên Hộ chiếu sản phẩm, bạn có thể xem bản chụp tài liệu chứng nhận gốc, số hiệu cấp, tổ chức chứng nhận và thời hạn hiệu lực được niêm yết minh bạch.'
        }
      ]
    },
    {
      title: 'Dành cho Hợp tác xã & Nhà sản xuất',
      icon: Building2,
      description: 'Thủ tục đăng ký, cấp mã định danh và giải pháp in ấn tem QR.',
      items: [
        {
          question: 'Hợp tác xã cần chuẩn bị gì để được cấp Hộ chiếu Nông nghiệp?',
          answer: 'Đơn vị cần chuẩn bị: Giấy đăng ký kinh doanh/thành lập HTX, thông tin người đại diện, danh sách sản phẩm đăng ký, mã vùng trồng/cơ sở sản xuất và các bản scan giấy chứng nhận chất lượng (nếu có).'
        },
        {
          question: 'Quy trình từ lúc nộp hồ sơ đến khi có mã QR mất bao lâu?',
          answer: 'Sau khi tiếp nhận đầy đủ dữ liệu, đội ngũ vận hành sẽ hỗ trợ chuẩn hóa cấu trúc dữ liệu và bàn giao mã QR động trong vòng 24 - 48 giờ làm việc.'
        },
        {
          question: 'Nền tảng có cung cấp dịch vụ in tem nhãn QR chống giả không?',
          answer: 'Có. Chúng tôi hỗ trợ tư vấn và cung cấp các giải pháp tem nhãn QR: tem vỡ, tem hologram chống bóc dán lại, tem chống thấm nước cho hàng đông lạnh hoặc cung cấp file vector QR gốc để HTX chủ động in trên bao bì xuất khẩu.'
        }
      ]
    },
    {
      title: 'Minh bạch Dữ liệu & Pháp lý',
      icon: ShieldCheck,
      description: 'Trách nhiệm thông tin, bảo mật và cơ chế tiếp nhận phản ánh.',
      items: [
        {
          question: 'Hộ chiếu Nông nghiệp có thay thế chứng nhận của Nhà nước không?',
          answer: 'Không. Hộ chiếu Nông nghiệp là giải pháp công nghệ số hóa và minh bạch hóa dữ liệu. Nền tảng không tự cấp chứng chỉ chất lượng mà đóng vai trò công khai và lưu trữ bằng chứng kiểm định do các cơ quan chức năng có thẩm quyền cấp.'
        },
        {
          question: 'Dữ liệu nhật ký canh tác có thể bị sửa đổi tùy tiện không?',
          answer: 'Mỗi hoạt động canh tác (bón phân, tưới tiêu, phun thuốc, thu hoạch) khi đã được ghi nhận và khóa mốc thời gian sẽ lưu dấu vĩnh viễn trên nhật ký số, đảm bảo tính nguyên bản và không thể bị sửa chữa tùy tiện.'
        },
        {
          question: 'Người tiêu dùng phản ánh sai lệch thông tin bằng cách nào?',
          answer: 'Tại mỗi trang Hộ chiếu sản phẩm và chân trang đều có nút "Phản hồi/Liên hệ". Bạn có thể gửi thông tin kèm ảnh chụp sản phẩm thực tế để ban kiểm soát dữ liệu của nền tảng tiến hành xác minh và xử lý theo quy chế.'
        }
      ]
    }
  ];

  const allFaqs = categories.flatMap((cat) => cat.items);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  };

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PublicPageMain className="pb-12 sm:pb-16">
        <PublicBreadcrumbTrail current="Câu hỏi thường gặp" path="/cau-hoi-thuong-gap" homeUrl={homeUrl} currentUrl={currentUrl} />

        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Hỗ trợ & Giải đáp</p>
          <h1 className="type-h1 mt-3 text-3xl sm:text-5xl">Câu hỏi thường gặp</h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            Giải đáp chi tiết về nền tảng Hộ Chiếu Nông Nghiệp, cách quét mã QR truy xuất nguồn gốc, quy trình dành cho hợp tác xã và cam kết minh bạch dữ liệu.
          </p>
        </header>

        <div className="mt-10 space-y-12">
          {categories.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <section key={cat.title} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xs sm:p-7">
                <div className="flex items-start gap-3.5 border-b border-[var(--border)] pb-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{cat.title}</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{cat.description}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {cat.items.map((faq, faqIdx) => (
                    <PublicFaqItem
                      key={faq.question}
                      question={faq.question}
                      answer={faq.answer}
                      defaultOpen={catIdx === 0 && faqIdx === 0}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-12 overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 p-6 text-center sm:p-8">
          <MessageSquare className="mx-auto h-10 w-10 text-[var(--brand-primary)]" aria-hidden="true" />
          <h3 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">Bạn chưa tìm thấy câu trả lời?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ trực tiếp mọi thắc mắc từ người tiêu dùng, hợp tác xã và doanh nghiệp phân phối.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/lien-he"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-xs transition hover:bg-[var(--brand-primary-strong)]"
            >
              Gửi câu hỏi cho chúng tôi <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={`tel:${siteProfile.hotline}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 shadow-xs transition hover:bg-slate-50"
            >
              Hotline: {siteProfile.hotlineDisplay}
            </a>
          </div>
        </section>
      </PublicPageMain>
    </PublicShell>
  );
}
