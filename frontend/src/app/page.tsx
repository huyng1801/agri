import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Leaf, QrCode, ShoppingBag, Store, type LucideIcon } from 'lucide-react';
import { ProductSlider } from '@/components/product-slider';
import {
  CooperativeCard,
  EmptyPublicState,
  NewsCard,
  PublicSearch,
  PublicShell
} from '@/components/public-marketplace';
import { PublicSection, PublicSectionHeader, publicContainerClass } from '@/components/public-layout';
import { Button, Panel, cn } from '@/components/ui';
import { fetchPublicNews } from '@/lib/news';
import { fetchPublicCatalog } from '@/lib/public-catalog';

export const metadata: Metadata = {
  title: 'HTXONLINE — Sàn nông sản số cho hợp tác xã Việt Nam',
  description: 'Kết nối người mua với sản phẩm HTX minh bạch, QR truy xuất nguồn gốc và đặt hàng COD trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/' },
  openGraph: {
    title: 'HTXONLINE — Sàn nông sản số',
    description: 'Sàn nông sản số cho hợp tác xã Việt Nam với QR Passport và đặt hàng COD.',
    url: 'https://htxonline.vn/',
    siteName: 'HTXONLINE',
    locale: 'vi_VN',
    type: 'website'
  }
};

export default async function HomePage() {
  const [catalog, news] = await Promise.all([fetchPublicCatalog(100), fetchPublicNews('/news/public?home=true&limit=3')]);
  const featuredProducts = catalog.products.slice(0, 12);
  const featuredCooperatives = catalog.cooperatives.slice(0, 6);
  const stats: Array<[string, string | number, LucideIcon]> = [
    ['Sản phẩm public', catalog.totalProducts, ShoppingBag],
    ['HTX đang hiển thị', catalog.cooperatives.length, Store],
    ['QR Passport', 'Truy xuất nhanh', QrCode]
  ];

  return (
    <PublicShell>
      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-20" />
          <div className={cn(publicContainerClass, 'relative grid min-h-[76vh] content-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center')}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-sm font-semibold text-leaf">
                <Leaf size={16} aria-hidden="true" />
                Sàn nông sản số
              </div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">HTXONLINE — Sàn nông sản số cho hợp tác xã Việt Nam.</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Kết nối người mua với sản phẩm HTX có thông tin minh bạch, QR truy xuất nguồn gốc và đặt hàng COD.
              </p>
              <PublicSearch />
              <div className="flex flex-wrap gap-3">
                <Link href="/san-pham">
                  <Button>
                    Xem sản phẩm
                    <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/htx">
                  <Button variant="ghost">Khám phá HTX</Button>
                </Link>
                <Link href="/lien-he">
                  <Button variant="ghost">Liên hệ tư vấn</Button>
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {stats.map(([title, value, Icon]) => (
                <Panel key={String(title)} className="flex items-center gap-4 bg-white/95">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-leaf text-white">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold">{String(title)}</span>
                    <span className="block text-sm text-slate-600">{String(value)}</span>
                  </span>
                </Panel>
              ))}
            </div>
          </div>
        </section>

        <PublicSection>
          <PublicSectionHeader
            title="Sản phẩm nổi bật"
            description="Nông sản public từ các HTX trên hệ thống."
            href="/san-pham"
            linkLabel="Xem tất cả"
          />
          {featuredProducts.length ? (
            <ProductSlider products={featuredProducts} />
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có sản phẩm public" description="Khi HTX publish sản phẩm, sản phẩm sẽ xuất hiện tại đây." />
            </div>
          )}
        </PublicSection>

        <PublicSection band>
          <PublicSectionHeader
            title="HTX nổi bật"
            description="Hồ sơ HTX đang có sản phẩm public."
            href="/htx"
            linkLabel="Xem HTX"
          />
          {featuredCooperatives.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredCooperatives.map((cooperative) => (
                <CooperativeCard key={cooperative.id} cooperative={cooperative} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có HTX public" description="HTX sẽ xuất hiện khi có sản phẩm được publish." />
            </div>
          )}
        </PublicSection>

        <PublicSection>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Minh bạch nguồn gốc', 'QR Passport giúp người mua kiểm tra nhật ký, vùng trồng và chứng nhận public.', QrCode],
              ['Đặt hàng COD', 'Người mua gửi đơn nhanh, HTX liên hệ xác nhận và xử lý đơn.', ShoppingBag],
              ['HTX tự vận hành', 'Sản phẩm, vùng trồng, nhật ký và đơn hàng do từng HTX tự quản lý.', BadgeCheck]
            ].map(([title, text, Icon]) => (
              <Panel key={String(title)} className="h-full">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-mint text-leaf">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{String(text)}</p>
              </Panel>
            ))}
          </div>
        </PublicSection>

        <PublicSection band>
          <PublicSectionHeader
            title="Tin tức mới nhất"
            description="Tin HTX, thị trường và truy xuất nguồn gốc từ đội vận hành HTXONLINE."
            href="/tin-tuc"
            linkLabel="Xem tin tức"
          />
          {news.data.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {news.data.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyPublicState title="Chưa có tin tức public" description="Tin tức do Super Admin publish sẽ xuất hiện tại đây." />
            </div>
          )}
        </PublicSection>
      </main>
    </PublicShell>
  );
}
