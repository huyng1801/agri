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

        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0c1020_0%,#122033_38%,#245f3e_100%)] p-4 text-white shadow-[0_32px_70px_rgba(12,16,32,0.16)] sm:p-5">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-80"
            style={{
              background:
                'radial-gradient(circle at left top, rgba(255,255,255,0.16), transparent 26%), radial-gradient(circle at 84% 16%, rgba(255,255,255,0.1), transparent 18%)'
            }}
          />
          <div className="relative grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/66">Danh sách HTX</p>
              <h2 className="mt-2 text-[1.85rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-[2.55rem]">
                Khám phá các hợp tác xã đã sẵn sàng công khai sản phẩm và tiếp cận người mua.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                Mỗi hồ sơ HTX là một điểm chạm thương hiệu trong hệ sinh thái {siteProfile.appName}: có ảnh đại diện, địa phương, sản phẩm công khai và lối dẫn rõ ràng sang trang chi tiết.
              </p>
              {topProvinces.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {topProvinces.map(([province, count]) => (
                    <span key={province} className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/88">
                      {province} · {count} HTX
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {[
                { icon: Building2, title: 'HTX hiển thị', value: `${cooperatives.length}+`, note: 'Hồ sơ đang có mặt trên sàn' },
                { icon: MapPin, title: 'Tỉnh thành', value: `${provinceCount}+`, note: 'Khu vực hoạt động được công khai' },
                { icon: ShieldCheck, title: 'Tín hiệu tin cậy', value: 'Công khai', note: 'Dẫn thẳng tới sản phẩm, QR và thông tin liên hệ' }
              ].map((item, index) => (
                <article
                  key={item.title}
                  className={`rounded-[1.45rem] border border-white/12 bg-white/10 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-4 ${index === 2 ? 'col-span-2 lg:col-span-1' : ''}`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-[#d9f99d] sm:h-11 sm:w-11">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <p className="mt-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-white/58 sm:mt-3 sm:text-sm">{item.title}</p>
                  <p className="mt-1 text-[1.85rem] font-bold text-white sm:text-2xl">{item.value}</p>
                  <p className="mt-1 text-sm leading-[1.6] text-white/76">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-5 rounded-[2rem] border border-slate-200/80 bg-white/94 p-2.5 shadow-[var(--shadow-card)] backdrop-blur">
          <PublicSearch placeholder="Tìm HTX theo tên hoặc tỉnh thành" action="/htx" />
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            {[
              { icon: Sparkles, text: 'Hồ sơ HTX gắn trực tiếp với sản phẩm công khai' },
              { icon: ShieldCheck, text: 'Người mua đi từ danh sách sang chi tiết nhanh hơn' }
            ].map((item) => (
              <div key={item.text} className="inline-flex items-center gap-2 rounded-full bg-mint/65 px-3 py-2 text-sm font-medium text-slate-700">
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
