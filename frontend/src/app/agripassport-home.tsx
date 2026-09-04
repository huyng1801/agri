import Link from 'next/link';
import { ArrowRight, CheckCircle2, Database, Leaf, QrCode, Store, Users } from 'lucide-react';
import { NewsCard, PublicSearch } from '@/components/public-marketplace';
import { ProductSlider } from '@/components/product-slider';
import { PublicImage } from '@/components/public-image';
import { publicContainerClass } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { Button, cn } from '@/components/ui';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';

const steps = [
  ['01', 'Chuẩn hóa dữ liệu', 'Tổ chức thông tin đơn vị, vùng trồng và sản phẩm theo một cấu trúc dễ quản lý.', Database],
  ['02', 'Công khai đúng phần cần thiết', 'Mở hồ sơ sản phẩm rõ ràng cho người mua, đối tác và kênh bán hàng.', Store],
  ['03', 'Kết nối QR truy xuất', 'Dẫn người xem đến hành trình sản phẩm bằng một lần quét trên điện thoại.', QrCode]
] as const;

export async function AgripassportHome() {
  const [catalog, news] = await Promise.all([
    fetchPublicCatalog(24),
    fetchPublicNews('/news/public?home=true&limit=3')
  ]);
  const products = catalog.products.slice(0, 10);
  const cooperatives = catalog.cooperatives.slice(0, 6);

  return (
    <PublicShell>
      <main id="main-content" className="overflow-hidden bg-[#fffdf8]">
        <section className="relative border-b border-[#dfe9db] bg-[radial-gradient(circle_at_88%_8%,rgba(119,199,110,0.20),transparent_26%),linear-gradient(135deg,#f9fcf5_0%,#edf7eb_100%)]">
          <div className={cn(publicContainerClass, 'grid gap-6 py-6 sm:gap-8 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:py-16')}>
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Nền tảng dữ liệu nông nghiệp</p>
              <h1 className="mt-3 max-w-[15ch] text-[2.35rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-[#163526] sm:max-w-none sm:text-6xl">Mỗi nông sản đều có một hành trình đáng tin.</h1>
              <p className="mt-5 max-w-xl text-[1rem] leading-8 text-[#52645b] sm:text-[1.1rem]">Agripassport giúp hợp tác xã, nông hộ và doanh nghiệp chuẩn hóa dữ liệu sản phẩm, công khai thông tin cần thiết và kết nối truy xuất QR trên cùng một nền tảng.</p>
              <div className="mt-6 max-w-xl"><PublicSearch placeholder="Nhập mã sản phẩm hoặc mã QR để tra cứu" /></div>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold text-[#3d5e49]">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#208d46]" aria-hidden="true" />Dữ liệu sản phẩm rõ ràng</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#208d46]" aria-hidden="true" />QR mở nhanh trên mobile</span>
              </div>
            </div>
            <figure className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-[#dcebd8] shadow-[0_22px_48px_rgba(29,82,43,0.14)] sm:rounded-[2rem] sm:shadow-[0_26px_64px_rgba(29,82,43,0.14)]">
              <PublicImage src="/hero/htx-farmer-hero-v2.png" alt="Nông hộ sẵn sàng đưa nông sản lên môi trường số" priority wrapperClassName="aspect-[16/10] sm:aspect-[4/3]" className="h-full w-full object-cover object-[55%_38%]" />
            </figure>
          </div>
        </section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Bắt đầu từ dữ liệu đúng</p><h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Một luồng rõ ràng, từ nơi sản xuất đến người mua.</h2></div>
            <Link href="/ve-chung-toi" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#cfe1ca] bg-white px-5 text-sm font-bold text-[#1b7138] transition hover:-translate-y-0.5 sm:self-auto">Về Agripassport <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {steps.map(([number, title, description, Icon]) => <article key={title} className="rounded-[1.55rem] border border-[#dce8d8] bg-white p-5 shadow-[0_14px_34px_rgba(35,77,45,0.06)]"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e4f4e6] text-[#1a8841]"><Icon size={21} aria-hidden="true" /></span><span className="text-sm font-extrabold text-[#87ba8d]">{number}</span></div><h3 className="mt-5 text-xl font-extrabold text-[#173327]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#65756c]">{description}</p></article>)}
          </div>
        </section>

        <section className="border-y border-[#dce8d8] bg-[#f2f8ef] py-10 sm:py-14 lg:py-16">
          <div className={publicContainerClass}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Sản phẩm công khai</p><h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Khám phá nông sản có câu chuyện rõ ràng.</h2><p className="mt-3 max-w-2xl text-[1rem] leading-7 text-[#607267]">Thông tin sản phẩm, đơn vị và kết nối truy xuất được đặt gần nhau để người mua quyết định nhanh hơn.</p></div><Link href="/san-pham" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-[#1e8745] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(31,139,67,0.18)] transition hover:-translate-y-0.5 sm:self-auto">Xem danh mục <ArrowRight size={16} aria-hidden="true" /></Link></div>
            {products.length ? <ProductSlider products={products} /> : <div className="mt-6 rounded-[1.6rem] border border-[#d7e5d2] bg-white p-6 text-[#52645b]">Sản phẩm công khai sẽ xuất hiện tại đây khi đơn vị hoàn thiện hồ sơ.</div>}
          </div>
        </section>

        <section className={cn(publicContainerClass, 'grid gap-7 py-10 sm:py-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-14 lg:py-16')}>
          <div className="rounded-[1.9rem] bg-[#143d28] p-6 text-white shadow-[0_22px_54px_rgba(22,61,40,0.16)] sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#a6ebb4]">Dành cho đơn vị sản xuất</p><h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Đưa dữ liệu lên số theo từng bước phù hợp.</h2><p className="mt-4 text-[1rem] leading-7 text-white/78">Không cần thay đổi mọi thứ cùng lúc. Bắt đầu từ sản phẩm, vùng sản xuất và thông tin đơn vị đang có.</p><Link href="/lien-he" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-[#17442c] transition hover:-translate-y-0.5">Liên hệ tư vấn <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2"><article className="rounded-[1.55rem] border border-[#dce8d8] bg-white p-5"><Leaf className="text-[#208d46]" size={24} aria-hidden="true" /><h3 className="mt-5 text-xl font-extrabold text-[#173327]">Vùng trồng dễ quản lý</h3><p className="mt-2 text-sm leading-6 text-[#64746b]">Ghi nhận nơi sản xuất và dữ liệu nền tảng theo từng sản phẩm.</p></article><article className="rounded-[1.55rem] border border-[#dce8d8] bg-white p-5"><Users className="text-[#208d46]" size={24} aria-hidden="true" /><h3 className="mt-5 text-xl font-extrabold text-[#173327]">Kết nối đúng vai trò</h3><p className="mt-2 text-sm leading-6 text-[#64746b]">Hợp tác xã, nông hộ và đối tác cùng có điểm truy cập phù hợp.</p></article><article className="rounded-[1.55rem] border border-[#dce8d8] bg-white p-5 sm:col-span-2"><QrCode className="text-[#208d46]" size={24} aria-hidden="true" /><h3 className="mt-5 text-xl font-extrabold text-[#173327]">Truy xuất không làm rối trải nghiệm mua hàng</h3><p className="mt-2 text-sm leading-6 text-[#64746b]">Mã QR dẫn đến đúng hồ sơ cần xem, không buộc người mua đi qua nhiều lớp thông tin.</p></article></div>
        </section>

        <section className="border-y border-[#dce8d8] bg-[#f8fbf5] py-10 sm:py-14 lg:py-16"><div className={publicContainerClass}><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Đối tác trong hệ sinh thái</p><h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Mỗi đơn vị đều có một điểm nhận diện rõ.</h2></div><Link href="/htx" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#cfe1ca] bg-white px-5 text-sm font-bold text-[#1b7138] sm:self-auto">Xem đối tác <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cooperatives.map((cooperative, index) => <Link key={cooperative.id} href={`/htx/${cooperative.code}`} className="group flex min-h-[8.5rem] items-center gap-4 rounded-[1.55rem] border border-[#dce8d8] bg-white p-4 shadow-[0_12px_30px_rgba(35,77,45,0.05)] transition hover:-translate-y-1"><PublicImage src={cooperative.avatarUrl} alt={cooperative.name} decorative priority={index < 3} wrapperClassName="h-14 w-14 shrink-0 rounded-2xl bg-[#edf6e9]" className="h-full w-full object-cover" /><span className="min-w-0"><span className="block line-clamp-2 font-extrabold leading-5 text-[#173327]">{cooperative.name}</span><span className="mt-1 block text-sm text-[#6b7b72]">{cooperative.province || 'Việt Nam'} · {cooperative.productCount} sản phẩm</span></span></Link>)}</div></div></section>

        <section className={cn(publicContainerClass, 'py-10 sm:py-14 lg:py-16')}><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#218947]">Từ đội vận hành</p><h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#173327] sm:text-5xl">Tin tức và kiến thức thực tế.</h2></div><Link href="/tin-tuc" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#cfe1ca] bg-white px-5 text-sm font-bold text-[#1b7138] sm:self-auto">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></Link></div>{news.data.length ? <div className="mt-7 grid gap-4 md:grid-cols-3">{news.data.slice(0, 3).map((article, index) => <NewsCard key={article.id} article={article} priority={index === 0} />)}</div> : null}</section>

        <section className="bg-[#143d28] py-10 text-white sm:py-14"><div className={publicContainerClass}><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#a6ebb4]">Sẵn sàng bắt đầu</p><h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">Sản phẩm rõ hơn, dữ liệu vững hơn.</h2><p className="mt-4 text-[1rem] leading-7 text-white/76">Đội Agripassport sẵn sàng đồng hành từ khi chuẩn hóa hồ sơ sản phẩm đến lúc mở QR truy xuất và kênh công khai.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/lien-he"><Button variant="inverse" className="min-h-12 w-full rounded-full px-6 sm:w-auto">Liên hệ tư vấn <ArrowRight size={17} aria-hidden="true" /></Button></Link><Link href="/ve-chung-toi"><Button variant="inverse-ghost" className="min-h-12 w-full rounded-full px-6 sm:w-auto">Khám phá nền tảng</Button></Link></div></div></div></section>
      </main>
    </PublicShell>
  );
}
