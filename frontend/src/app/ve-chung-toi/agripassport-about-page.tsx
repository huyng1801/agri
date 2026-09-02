import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, Database, Leaf, QrCode, Store, Users } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import type { PublicSiteProfile } from '@/lib/public-site';

type AgripassportAboutPageProps = {
  siteProfile: PublicSiteProfile;
};

const startingPoints = [
  { title: 'Đưa nông sản lên môi trường số', description: 'Tập hợp câu chuyện, hình ảnh và thông tin nền tảng của từng sản phẩm.', icon: Leaf },
  { title: 'Tổ chức dữ liệu thống nhất', description: 'Đưa vùng sản xuất, đơn vị và sản phẩm về một cấu trúc dễ quản lý.', icon: Database },
  { title: 'Truy xuất nguồn gốc bằng QR', description: 'Kết nối một lần quét với thông tin được công khai đúng ngữ cảnh.', icon: QrCode },
  { title: 'Đưa sản phẩm đến gần thị trường', description: 'Giúp người mua và đối tác tiếp cận thông tin rõ ràng, đáng tin cậy.', icon: Store }
] as const;

const productData = [
  ['Thông tin sản phẩm', 'Tên, hình ảnh, mô tả và thông tin thương hiệu.'],
  ['Đơn vị sản xuất', 'Thông tin về hợp tác xã, nông hộ hoặc doanh nghiệp.'],
  ['Vùng sản xuất', 'Thông tin về vùng nguyên liệu và nơi sản phẩm được tạo ra.'],
  ['Tiêu chuẩn và chứng nhận', 'Các tiêu chuẩn, chứng nhận và thông tin liên quan đến sản phẩm.']
] as const;

const platformValues = [
  { title: 'Số hóa vùng sản xuất', description: 'Ghi nhận và tổ chức thông tin về vùng sản xuất.', icon: Leaf },
  { title: 'Quản lý sản phẩm', description: 'Chuẩn hóa và quản lý thông tin sản phẩm tập trung.', icon: Database },
  { title: 'QR truy xuất nguồn gốc', description: 'Kết nối sản phẩm với dữ liệu thông qua mã QR.', icon: QrCode },
  { title: 'Kết nối thị trường', description: 'Giúp sản phẩm có thông tin rõ ràng hơn khi tiếp cận thị trường.', icon: Users }
] as const;

const ecosystemMembers = ['Hợp tác xã', 'Nông hộ', 'Trang trại', 'Doanh nghiệp', 'Đơn vị sản xuất', 'Nhà phân phối'] as const;

export function AgripassportAboutPage({ siteProfile }: AgripassportAboutPageProps) {
  return (
    <PublicShell>
      <main id="main-content" className="overflow-hidden bg-[#fffdf8]">
        <section className="relative border-b border-[#dce7d5] bg-[radial-gradient(circle_at_88%_10%,rgba(135,205,119,0.24),transparent_28%),linear-gradient(135deg,#fffdf8_0%,#f2f8ed_100%)]">
          <div className={cn(publicContainerClass, 'grid gap-8 py-10 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:py-20')}>
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Agripassport</p>
              <h1 className="mt-4 text-[2.55rem] font-extrabold leading-[1.02] text-[#173327] sm:text-6xl">Số hóa nông sản, minh bạch nguồn gốc.</h1>
              <div className="mt-6 space-y-4 text-[1rem] leading-8 text-[#405349] sm:text-[1.1rem]">
                <p>Agripassport là nền tảng số giúp hợp tác xã, nông hộ và doanh nghiệp chuẩn hóa dữ liệu sản xuất, quản lý sản phẩm và truy xuất nguồn gốc bằng QR.</p>
                <p>Từ vùng sản xuất đến sản phẩm, Agripassport kết nối thông tin trên một nền tảng thống nhất, giúp dữ liệu rõ ràng hơn, sản phẩm minh bạch hơn và tạo nền tảng để nông sản tiếp cận thị trường hiệu quả hơn.</p>
              </div>
              <p className="mt-5 border-l-2 border-[#2f9c50] pl-4 text-sm font-semibold leading-6 text-[#355443] sm:text-base">Chúng tôi tin rằng mỗi sản phẩm nông nghiệp đều có một hành trình đáng được biết đến.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="#giai-phap">
                  <Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">
                    Khám phá giải pháp
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="#he-sinh-thai">
                  <Button variant="ghost" className="min-h-12 w-full rounded-full border-[#cfe0c9] bg-white/70 px-6 text-[#1a5f35] hover:bg-white sm:w-auto">
                    Khám phá hệ sinh thái
                  </Button>
                </Link>
              </div>
            </div>

            <figure className="overflow-hidden rounded-[2rem] border border-white/80 bg-[#e8f1e2] shadow-[0_28px_70px_rgba(25,73,39,0.16)]">
              <PublicImage
                src={siteProfile.pageContent.aboutImageUrl}
                alt={siteProfile.pageContent.aboutImageAlt || 'Người nông dân sử dụng công nghệ trong sản xuất'}
                wrapperClassName="aspect-[4/3]"
                className="h-full w-full object-cover"
                priority
              />
            </figure>
          </div>
        </section>

        <section id="giai-phap" className={cn(publicContainerClass, 'py-12 sm:py-16 lg:py-20')}>
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Chúng tôi bắt đầu từ dữ liệu</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Để giá trị của nông sản được nhìn thấy rõ hơn.</h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#52645b] sm:text-[1.08rem]">Nông sản Việt có những giá trị riêng từ vùng đất, người sản xuất và quy trình tạo ra sản phẩm. Agripassport giúp những giá trị đó được số hóa, chuẩn hóa và kết nối thành dữ liệu dễ quản lý, dễ tiếp cận.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article key={item.title} className="group rounded-[1.6rem] border border-[#dce7d5] bg-white p-5 shadow-[0_12px_30px_rgba(40,75,47,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(40,75,47,0.12)]">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e4f4e6] text-[#198641]"><item.icon size={21} aria-hidden="true" /></span>
                <p className="mt-5 text-xs font-bold text-[#54a66b]">0{index + 1}</p>
                <h3 className="mt-2 text-xl font-extrabold leading-7 text-[#173327]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#617268]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#dce7d5] bg-[#eff6ea]">
          <div className={cn(publicContainerClass, 'grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14 lg:py-20')}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Mỗi sản phẩm là một hồ sơ dữ liệu</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Một sản phẩm. Một hồ sơ. Một hành trình có thể truy xuất.</h2>
              <p className="mt-5 text-[1rem] leading-8 text-[#52645b] sm:text-[1.08rem]">Agripassport xây dựng dữ liệu xoay quanh sản phẩm, từ thông tin sản xuất đến thông tin được công khai cho người tiêu dùng.</p>
            </div>
            <div className="rounded-[1.8rem] border border-[#d3e4ce] bg-white p-5 shadow-[0_20px_52px_rgba(37,83,45,0.08)] sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1f9147] text-white"><Database size={21} aria-hidden="true" /></span>
                <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#4a9f62]">Dữ liệu sản phẩm</p><p className="mt-1 font-extrabold text-[#173327]">Xây dựng hồ sơ số cho từng sản phẩm</p></div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[#607267]">Agripassport giúp tập trung những thông tin quan trọng của sản phẩm trên một nền tảng thống nhất, tạo cơ sở cho quản lý và truy xuất nguồn gốc.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {productData.map(([title, description]) => <div key={title} className="rounded-2xl bg-[#f5f9f3] p-4"><p className="font-bold text-[#214832]">{title}</p><p className="mt-1.5 text-sm leading-6 text-[#65756c]">{description}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-12 sm:py-16 lg:py-20')}>
          <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Giá trị của nền tảng</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Kết nối dữ liệu từ sản xuất đến thị trường.</h2></div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformValues.map((item) => <article key={item.title} className="rounded-[1.6rem] border border-[#dce7d5] bg-[#fbfdf9] p-5"><item.icon className="text-[#218947]" size={25} aria-hidden="true" /><h3 className="mt-5 text-xl font-extrabold text-[#173327]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#617268]">{item.description}</p></article>)}
          </div>
        </section>

        <section id="he-sinh-thai" className="bg-[#123d28] text-white">
          <div className={cn(publicContainerClass, 'grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14 lg:py-20')}>
            <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#9ae5ae]">Hệ sinh thái Agripassport</p><h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">Nối các chủ thể trong nông nghiệp số.</h2><p className="mt-5 max-w-2xl text-[1rem] leading-8 text-white/76 sm:text-[1.08rem]">Agripassport hướng đến một hệ sinh thái nơi hợp tác xã, nông hộ, doanh nghiệp và các đối tác cùng tham gia xây dựng dữ liệu và nâng cao giá trị nông sản.</p><Link href="/gioi-thieu" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-[#17442c] transition hover:-translate-y-0.5">Xem hệ sinh thái <ArrowRight size={17} aria-hidden="true" /></Link></div>
            <div className="grid grid-cols-2 gap-3">{ecosystemMembers.map((member, index) => <div key={member} className={cn('rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm', index === 0 && 'bg-[#2c9e51]')}><Building2 size={20} className="text-[#a7efb8]" aria-hidden="true" /><p className="mt-5 font-extrabold leading-6">{member}</p></div>)}</div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-12 sm:py-16 lg:py-20')}>
          <div className="rounded-[2rem] bg-[linear-gradient(130deg,#e7f5e5_0%,#fbfdf7_52%,#d8f0dc_100%)] px-5 py-8 text-center shadow-[0_18px_45px_rgba(38,84,48,0.08)] sm:px-10 sm:py-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Bắt đầu cùng Agripassport</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Số hóa sản phẩm bắt đầu từ dữ liệu.</h2><p className="mx-auto mt-5 max-w-3xl text-[1rem] leading-8 text-[#52645b]">Không cần thay đổi mọi thứ cùng lúc. Agripassport giúp các đơn vị từng bước chuẩn hóa dữ liệu và xây dựng nền tảng truy xuất phù hợp với nhu cầu thực tế.</p>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left">{['Xác định thông tin về đơn vị, vùng sản xuất và sản phẩm.', 'Tổ chức dữ liệu sản phẩm theo cấu trúc rõ ràng và thống nhất.', 'Kết nối sản phẩm với thông tin truy xuất để người tiêu dùng dễ dàng tra cứu.'].map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold leading-6 text-[#3c5a49]"><CheckCircle2 className="mt-0.5 shrink-0 text-[#208d46]" size={18} aria-hidden="true" />{item}</p>)}</div>
            <p className="mt-8 text-xl font-extrabold text-[#173327]">Bạn đã sẵn sàng số hóa sản phẩm?</p><p className="mt-2 text-[#52645b]">Chúng tôi sẵn sàng đồng hành cùng bạn trong từng bước triển khai.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/lien-he"><Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">Liên hệ tư vấn <ArrowRight size={18} aria-hidden="true" /></Button></Link><Link href="/san-pham"><Button variant="ghost" className="min-h-12 w-full rounded-full border-[#c7dfc7] bg-white px-6 text-[#1a5f35] hover:bg-[#f8fff7] sm:w-auto">Khám phá giải pháp</Button></Link></div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
