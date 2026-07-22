import type { Metadata } from 'next';
import { Building2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import {
  CooperativeCard,
  EmptyPublicState,
  PublicSearch,
  PublicShell
} from '@/components/public-marketplace';
import { PublicPageHeader, PublicPageMain } from '@/components/public-layout';
import { fetchPublicCatalog } from '@/lib/public-catalog';

export const metadata: Metadata = {
  title: 'Danh sách HTX | HTXONLINE',
  description: 'Khám phá hợp tác xã đang bán sản phẩm nông nghiệp minh bạch trên sàn HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/htx' }
};

type CooperativesPageProps = {
  searchParams?: Promise<{ search?: string }>;
};

export default async function CooperativesPublicPage({ searchParams }: CooperativesPageProps) {
  const filters = (await searchParams) ?? {};
  const catalog = await fetchPublicCatalog(100);
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

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          title="HTX trên HTXONLINE"
          description={`${catalog.cooperatives.length} hợp tác xã đang có sản phẩm public trên sàn.`}
        />

        <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(244,250,243,0.94)_100%)] p-4 shadow-[var(--shadow-card)] backdrop-blur sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-leaf/80">Danh sách HTX</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Khám phá các hợp tác xã đã sẵn sàng công khai sản phẩm và tiếp cận người mua.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Mỗi hồ sơ HTX trên sàn là một điểm chạm thương hiệu: có ảnh đại diện, vùng hoạt động, số lượng sản phẩm public và lối dẫn rõ ràng sang trang chi tiết.
              </p>
              {topProvinces.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {topProvinces.map(([province, count]) => (
                    <span key={province} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {province} · {count} HTX
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {[
                { icon: Building2, title: 'HTX hiển thị', value: `${cooperatives.length}+`, note: 'Hồ sơ đang có mặt trên sàn' },
                { icon: MapPin, title: 'Tỉnh thành', value: `${new Set(cooperatives.map((item) => item.province).filter(Boolean)).size || 1}+`, note: 'Khu vực hoạt động được công khai' },
                { icon: ShieldCheck, title: 'Tín hiệu tin cậy', value: 'Công khai', note: 'Dẫn thẳng tới sản phẩm, QR và thông tin liên hệ' }
              ].map((item, index) => (
                <article key={item.title} className={`rounded-2xl border border-slate-200/80 bg-white/86 p-3.5 shadow-sm sm:p-4 ${index === 2 ? 'col-span-2 lg:col-span-1' : ''}`}>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-leaf sm:h-11 sm:w-11">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <p className="mt-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:mt-3 sm:text-sm">{item.title}</p>
                  <p className="mt-1 text-[1.85rem] font-bold text-ink sm:text-2xl">{item.value}</p>
                  <p className="mt-1 text-sm leading-[1.6] text-slate-600">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-5 rounded-[2rem] border border-slate-200/80 bg-white/94 p-2.5 shadow-[var(--shadow-card)] backdrop-blur">
          <PublicSearch placeholder="Tìm HTX theo tên hoặc tỉnh thành" action="/htx" />
          <div className="mt-3 flex flex-wrap gap-2 px-1">
            {[
              { icon: Sparkles, text: 'Hồ sơ HTX gắn trực tiếp với sản phẩm public' },
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
              title={search ? 'Không tìm thấy HTX phù hợp' : 'Chưa có HTX public'}
              description={search ? 'Thử từ khóa khác hoặc xem toàn bộ danh sách HTX.' : 'HTX sẽ xuất hiện khi có sản phẩm được publish lên sàn.'}
            />
          </div>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
