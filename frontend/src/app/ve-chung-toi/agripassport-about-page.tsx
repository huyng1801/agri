import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, Database, Factory, Leaf, QrCode, Sprout, Store, Tractor, Truck, Users, Warehouse } from 'lucide-react';
import { PublicImage } from '@/components/public-image';
import { publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import type { PublicSiteProfile } from '@/lib/public-site';

type AgripassportAboutPageProps = {
  siteProfile: PublicSiteProfile;
};

const startingPoints = [
  { title: 'Đưa nông sản lên', description: 'Tập hợp câu chuyện, hình ảnh và thông tin nền tảng của từng sản phẩm.', icon: Leaf },
  { title: 'Tổ chức dữ liệu', description: 'Đưa vùng sản xuất, đơn vị và sản phẩm về một cấu trúc dễ quản lý.', icon: Database },
  { title: 'Truy xuất nguồn gốc', description: 'Kết nối một lần quét với thông tin được công khai đúng ngữ cảnh.', icon: QrCode },
  { title: 'Đến gần thị trường', description: 'Giúp người mua và đối tác tiếp cận thông tin rõ ràng, đáng tin cậy.', icon: Store }
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
  { title: 'Truy xuất nguồn gốc', description: 'Kết nối sản phẩm với dữ liệu thông qua mã QR.', icon: QrCode },
  { title: 'Kết nối thị trường', description: 'Giúp sản phẩm có thông tin rõ ràng hơn khi tiếp cận thị trường.', icon: Users }
] as const;

const ecosystemMembers = [
  { label: 'Hợp tác xã', icon: Building2 },
  { label: 'Nông hộ', icon: Sprout },
  { label: 'Trang trại', icon: Tractor },
  { label: 'Doanh nghiệp', icon: Factory },
  { label: 'Đơn vị sản xuất', icon: Warehouse },
  { label: 'Nhà phân phối', icon: Truck }
] as const;

const agripassportAppShowcaseUrl = '/hero/agripassport-app-showcase.png';

export function AgripassportAboutPage({ siteProfile }: AgripassportAboutPageProps) {
  return (
    <PublicShell>
      <main id="main-content" className="overflow-hidden bg-[var(--surface-1)]">
        <section className="relative border-b border-[var(--border)] bg-[radial-gradient(circle_at_88%_10%,color-mix(in_srgb,var(--brand-primary)_18%,transparent),transparent_28%),linear-gradient(135deg,var(--surface-1)_0%,var(--brand-primary-subtle)_100%)]">
          <div className={cn(publicContainerClass, 'grid gap-8 py-10 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-14 lg:py-20')}>
            <div className="order-2 max-w-2xl lg:order-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--brand-primary)]">Agripassport</p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl lg:leading-[1.12]">Số hóa nông sản, minh bạch nguồn gốc</h1>
              <div className="mt-6 space-y-4 text-[1rem] leading-8 text-[var(--text-secondary)] sm:text-[1.1rem]">
                <p>Agripassport là nền tảng số giúp hợp tác xã, nông hộ và doanh nghiệp chuẩn hóa dữ liệu sản xuất, quản lý sản phẩm và truy xuất nguồn gốc bằng QR.</p>
                <p>Từ vùng sản xuất đến sản phẩm, Agripassport kết nối thông tin trên một nền tảng thống nhất, giúp dữ liệu rõ ràng hơn, sản phẩm minh bạch hơn và tạo nền tảng để nông sản tiếp cận thị trường hiệu quả hơn.</p>
              </div>
              <p className="mt-5 border-l-2 border-[var(--brand-primary)] pl-4 text-sm font-semibold leading-6 text-[var(--text-primary)] sm:text-base">Chúng tôi tin rằng mỗi sản phẩm nông nghiệp đều có một hành trình đáng được biết đến.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="#giai-phap">
                  <Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">
                    Khám phá giải pháp
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="#he-sinh-thai">
                  <Button variant="ghost" className="min-h-12 w-full rounded-full border-[var(--border-strong)] bg-white/70 px-6 text-[var(--brand-primary)] hover:bg-white sm:w-auto">
                    Khám phá hệ sinh thái
                  </Button>
                </Link>
              </div>
            </div>

            <figure className="order-1 h-full overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#dff4f5] shadow-[0_28px_70px_rgba(25,73,39,0.16)] lg:order-2">
              <PublicImage
                src={agripassportAppShowcaseUrl}
                alt="Ứng dụng Agripassport quản lý sản xuất và truy xuất QR"
                wrapperClassName="aspect-square h-full w-full lg:aspect-auto"
                className="h-full w-full object-cover"
                priority
              />
            </figure>
          </div>
        </section>

        <section id="giai-phap" className={cn(publicContainerClass, 'py-12 sm:py-16 lg:py-20')}>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--brand-primary)]">Chúng tôi bắt đầu từ dữ liệu</p>
            <h2 className="type-h2 mt-3 text-3xl sm:text-5xl lg:whitespace-nowrap">Để giá trị của nông sản được nhìn thấy rõ hơn</h2>
            <p className="mt-4 max-w-3xl text-[1rem] leading-8 text-[var(--text-secondary)] sm:text-[1.08rem] lg:max-w-5xl">Nông sản Việt có những giá trị riêng từ vùng đất, người sản xuất và quy trình tạo ra sản phẩm. Agripassport giúp những giá trị đó được số hóa, chuẩn hóa và kết nối thành dữ liệu để quản lý và dễ tiếp cận.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoints.map((item, index) => (
              <article key={item.title} className="group rounded-[1.45rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-primary)] hover:shadow-[0_20px_42px_rgba(15,23,42,0.12)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"><item.icon size={21} aria-hidden="true" /></span>
                  <p className="text-lg font-extrabold leading-none text-[var(--brand-primary-strong)]">0{index + 1}</p>
                </div>
                <h3 className="mt-5 text-xl font-extrabold leading-7 text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface-muted)]">
          <div className={cn(publicContainerClass, 'grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14 lg:py-20')}>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--brand-primary)]">Mỗi sản phẩm là một hồ sơ dữ liệu</p>
              <h2 className="type-h2 mt-3 text-3xl sm:text-5xl">Một sản phẩm - một hồ sơ - một hành trình</h2>
              <p className="mt-5 text-[1rem] leading-8 text-[var(--text-secondary)] sm:text-[1.08rem]">Agripassport số hóa thông tin xoay quanh từng sản phẩm, từ vùng nguyên liệu, quá trình sản xuất đến các tiêu chuẩn và thông tin công khai cho người tiêu dùng. Tất cả được kết nối trong một hồ sơ số thống nhất, giúp sản phẩm minh bạch hơn, dễ hiểu rõ ràng hơn và hành trình dễ dàng truy xuất hơn.</p>
              <Link href="/lien-he" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-primary)] px-6 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand-primary-hover)] sm:w-auto">Nhận tư vấn giải pháp <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <div className="rounded-[1.7rem] border border-[var(--border-strong)] bg-[var(--surface-elevated)] p-5 shadow-[0_20px_52px_rgba(15,23,42,0.08)] sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--brand-primary)] text-white"><Database size={21} aria-hidden="true" /></span>
                <p className="font-extrabold text-[var(--text-primary)]">Xây dựng hồ sơ số cho từng sản phẩm</p>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">Agripassport giúp tập trung những thông tin quan trọng của sản phẩm trên một nền tảng thống nhất, tạo cơ sở cho quản lý và truy xuất nguồn gốc.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {productData.map(([title, description]) => <div key={title} className="rounded-2xl bg-[var(--brand-primary-subtle)] p-4"><p className="font-bold text-[var(--text-primary)]">{title}</p><p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">{description}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-12 sm:py-16 lg:py-20')}>
          <div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--brand-primary)]">Giá trị của nền tảng</p><h2 className="type-h2 mx-auto mt-3 max-w-3xl text-3xl sm:text-5xl lg:max-w-none lg:whitespace-nowrap">Kết nối dữ liệu từ sản xuất đến thị trường</h2></div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformValues.map((item) => <article key={item.title} className="rounded-[1.45rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]"><item.icon size={22} aria-hidden="true" /></span><h3 className="text-lg font-extrabold leading-6 text-[var(--text-primary)]">{item.title}</h3></div><p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p></article>)}
          </div>
        </section>

        <section id="he-sinh-thai" className="brand-gradient-bg text-white">
          <div className={cn(publicContainerClass, 'grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14 lg:py-20')}>
            <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-white/80">Hệ sinh thái Agripassport</p><h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">Nối các chủ thể trong nông nghiệp số</h2><p className="mt-5 max-w-2xl text-[1rem] leading-8 text-white/76 sm:text-[1.08rem]">Agripassport hướng đến một hệ sinh thái nơi hợp tác xã, nông hộ, doanh nghiệp và các đối tác cùng tham gia xây dựng dữ liệu và nâng cao giá trị nông sản.</p><Link href="/gioi-thieu" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-[var(--brand-primary-hover)] transition hover:-translate-y-0.5">Xem hệ sinh thái <ArrowRight size={17} aria-hidden="true" /></Link></div>
            <div className="grid grid-cols-2 gap-3">{ecosystemMembers.map((member, index) => { const Icon = member.icon; return <div key={member.label} className={cn('rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm', index === 0 && 'bg-white/18')}><Icon size={20} className="text-white/80" aria-hidden="true" /><p className="mt-5 font-extrabold leading-6">{member.label}</p></div>; })}</div>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-12 sm:py-16 lg:py-20')}>
          <div className="rounded-[1.75rem] bg-[linear-gradient(130deg,var(--brand-primary-subtle)_0%,var(--surface-elevated)_52%,color-mix(in_srgb,var(--brand-primary)_16%,white)_100%)] px-5 py-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-10 sm:py-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--brand-primary)]">Bắt đầu cùng Agripassport</p><h2 className="type-h2 mx-auto mt-3 max-w-3xl text-3xl sm:text-5xl">Số hóa sản phẩm bắt đầu từ dữ liệu</h2><p className="mx-auto mt-5 max-w-3xl text-[1rem] leading-8 text-[var(--text-secondary)]">Không cần thay đổi mọi thứ cùng lúc. Agripassport giúp các đơn vị từng bước chuẩn hóa dữ liệu <br />và xây dựng nền tảng truy xuất phù hợp với nhu cầu thực tế.</p>
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-left">{['Xác định thông tin về đơn vị, vùng sản xuất và sản phẩm.', 'Tổ chức dữ liệu sản phẩm theo cấu trúc rõ ràng và thống nhất.', 'Kết nối sản phẩm với thông tin truy xuất để người tiêu dùng dễ dàng tra cứu.'].map((item) => <p key={item} className="flex gap-3 rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold leading-6 text-[var(--text-secondary)]"><CheckCircle2 className="mt-0.5 shrink-0 text-[var(--brand-primary)]" size={18} aria-hidden="true" />{item}</p>)}</div>
            <p className="mt-8 text-xl font-extrabold text-[var(--text-primary)]">Bạn đã sẵn sàng số hóa sản phẩm?</p><p className="mt-2 text-[var(--text-secondary)]">Chúng tôi sẵn sàng đồng hành cùng bạn trong từng bước triển khai.</p><div className="mt-6 flex justify-center"><Link href="/lien-he"><Button className="min-h-12 w-full rounded-full px-6 sm:w-auto">Nhận tư vấn giải pháp <ArrowRight size={18} aria-hidden="true" /></Button></Link></div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
