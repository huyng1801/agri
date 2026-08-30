import type { Metadata } from 'next';
import { Building2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import {
  CooperativeCard,
  EmptyPublicState,
  PublicSearch
} from '@/components/public-marketplace';
import { PublicPageHeader, PublicPageMain } from '@/components/public-layout';
import { PublicShell } from '@/components/public-shell';
import { buildPublicMetadata } from '@/lib/page-metadata';
import { fetchPublicCatalog } from '@/lib/public-catalog';
import { getPublicSiteProfile } from '@/lib/public-site';
import { getRequestPublicSiteKey } from '@/lib/request-site';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata({
    title: 'Danh sách HTX',
    description: 'Khám phá hợp tác xã đang công khai dữ liệu sản phẩm, QR hoặc hồ sơ truy xuất trên nền tảng.',
    path: '/htx'
  });
}

type CooperativesPageProps = {
  searchParams?: Promise<{ search?: string }>;
};

export default async function CooperativesPublicPage({ searchParams }: CooperativesPageProps) {
  const filters = (await searchParams) ?? {};
  const siteKey = await getRequestPublicSiteKey();
  const [catalog, siteProfile] = await Promise.all([fetchPublicCatalog(100), getPublicSiteProfile(siteKey)]);
  const search = filters.search?.trim().toLowerCase();
  const cooperatives = search
    ? catalog.cooperatives.filter((cooperative) =>
        [cooperative.name, cooperative.code, cooperative.province ?? ''].some((value) => value.toLowerCase().includes(search))
      )
    : catalog.cooperatives;

  const topProvinces = Array.from(
    cooperatives.reduce((map, cooperative) => {
      const province = cooperative.province?.trim();
      if (!province) return map;
      map.set(province, (map.get(province) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))
    .slice(0, 4);
  const provinceCount = new Set(cooperatives.map((item) => item.province).filter(Boolean)).size || 1;
  const pageTitle =
    siteKey === 'passport'
      ? 'HTX có hồ sơ truy xuất'
      : siteKey === 'htxonline'
        ? 'HTX đang kết nối dữ liệu'
        : `HTX trong hệ sinh thái ${siteProfile.appName}`;
  const pageDescription =
    siteKey === 'passport'
      ? 'Những hợp tác xã đang có sản phẩm, QR hoặc hồ sơ truy xuất công khai để người mua tra cứu nhanh hơn.'
      : siteKey === 'htxonline'
        ? 'Danh sách HTX đang có dữ liệu sản phẩm công khai, đồng bộ từ lớp quản trị nội bộ sang hệ sinh thái số.'
        : `${catalog.cooperatives.length} hợp tác xã đang công khai dữ liệu sản phẩm, vùng hoạt động và lối dẫn rõ ràng sang trang chi tiết.`;

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader title={pageTitle} description={pageDescription} />

        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <article className="rounded-[2rem] border border-[#e8e4d8] bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-[#2b8a3e]">Danh sách HTX</p>
            <h2 className="mt-3 text-[1.78rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#24283a] sm:text-[2.45rem]">
              Khám phá các hợp tác xã đã sẵn sàng công khai sản phẩm và kết nối thị trường.
            </h2>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-slate-600 sm:text-base">
              Phần HTX được trình bày theo bố cục sáng, thoáng và dễ quét để người xem tập trung vào chủ thể, địa phương và sản phẩm công khai.
            </p>
            {topProvinces.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {topProvinces.map(([province, count]) => (
                  <span key={province} className="rounded-full border border-[#d8e7d8] bg-[#f6fbf4] px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    {province} · {count} HTX
                  </span>
                ))}
              </div>
            )}
          </article>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Building2, title: 'HTX hiển thị', value: `${cooperatives.length}+`, note: 'Hồ sơ đang có mặt trên sàn' },
              { icon: MapPin, title: 'Tỉnh thành', value: `${provinceCount}+`, note: 'Khu vực hoạt động được công khai' },
              { icon: ShieldCheck, title: 'Tín hiệu tin cậy', value: 'Công khai', note: 'Dẫn thẳng tới sản phẩm và thông tin liên hệ' }
            ].map((item) => (
              <article key={item.title} className="rounded-[1.7rem] border border-[#e8e4d8] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7ef] text-[#1f9b4b]">
                  <item.icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{item.title}</p>
                <p className="mt-1 text-[1.7rem] font-extrabold leading-none text-[#1f2233]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-5 rounded-[2rem] border border-[#e8e4d8] bg-white p-2.5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <PublicSearch placeholder="Tìm HTX theo tên hoặc tỉnh thành" action="/htx" />
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            {[
              { icon: Sparkles, text: 'Hồ sơ HTX gắn trực tiếp với sản phẩm công khai' },
              { icon: ShieldCheck, text: 'Người mua đi từ danh sách sang chi tiết nhanh hơn' }
            ].map((item) => (
              <div key={item.text} className="inline-flex items-center gap-2 rounded-full bg-[#f0f8f0] px-3 py-2 text-sm font-medium text-slate-700">
                <item.icon size={15} aria-hidden="true" className="text-leaf" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {cooperatives.length ? (
          <div className="mt-6 grid gap-4 md:auto-rows-fr md:grid-cols-2 lg:grid-cols-3">
            {cooperatives.map((cooperative, index) => (
              <CooperativeCard key={cooperative.id} cooperative={cooperative} priority={index < 3} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPublicState
              title={search ? 'Không tìm thấy HTX phù hợp' : 'Chưa có HTX công khai'}
              description={search ? 'Thử từ khóa khác hoặc xem toàn bộ danh sách HTX.' : 'HTX sẽ xuất hiện khi có sản phẩm được đăng công khai lên sàn.'}
            />
          </div>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
