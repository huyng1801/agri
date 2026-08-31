import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Building2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import {
  CooperativeCard,
  EmptyPublicState,
  PublicSearch
} from '@/components/public-marketplace';
import { DEFAULT_COOPERATIVE_IMAGE, PublicImage } from '@/components/public-image';
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
  const featuredCooperative = [...cooperatives].sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name, 'vi'))[0];
  const totalProducts = cooperatives.reduce((sum, cooperative) => sum + cooperative.productCount, 0);
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
        ? 'Danh sách HTX đã đồng bộ dữ liệu sản phẩm từ hệ quản trị nội bộ ra lớp công khai.'
        : `${catalog.cooperatives.length} hợp tác xã đang công khai dữ liệu sản phẩm, vùng hoạt động và lối dẫn rõ ràng sang trang chi tiết.`;
  const flowSignals =
    siteKey === 'htxonline'
      ? [
          'Quản trị nội bộ gọn trong một luồng dữ liệu.',
          'Mở nhanh danh sách HTX và sản phẩm công khai.',
          'Sẵn sàng đi tiếp sang QR truy xuất khi cần.'
        ]
      : [
          'Xem rõ HTX, tỉnh thành và số sản phẩm đang công khai.',
          'Đi từ danh sách sang chi tiết ít thao tác hơn.',
          'Giữ lối dẫn mạch lạc tới sản phẩm và hồ sơ số.'
        ];
  const quickNotes = [
    `Tổng ${cooperatives.length} HTX đang hiển thị công khai`,
    `${totalProducts}+ sản phẩm đang đi cùng hồ sơ HTX`,
    siteKey === 'passport' ? 'Có thể nối tiếp sang trang truy xuất QR' : 'Mở chi tiết HTX và sản phẩm ngay trên cùng hệ sinh thái'
  ];

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          title={pageTitle}
          description={pageDescription}
          action={
            <div className="rounded-[1.6rem] border border-[#dfe8d8] bg-[#fffdf8] p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:min-w-[18rem]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Đi nhanh hơn</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Mở thẳng danh sách sản phẩm công khai hoặc chọn HTX nổi bật để xem chi tiết.</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/san-pham"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1f9b4b] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#187a3b]"
                >
                  Xem sản phẩm
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                {featuredCooperative ? (
                  <Link
                    href={`/htx/${featuredCooperative.code}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d7e4d4] bg-white px-4 text-sm font-semibold text-[#1f2233] transition hover:-translate-y-0.5 hover:border-[#1f9b4b] hover:text-[#1f9b4b]"
                  >
                    Xem HTX nổi bật
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
          }
        />

        <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <article className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,#102437_0%,#16354a_52%,#1f8a54_100%)] p-5 text-white shadow-[0_26px_60px_rgba(15,23,42,0.18)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(160,255,202,0.18),transparent_32%)]" aria-hidden="true" />
            <div className="relative z-10">
              <div className="inline-flex min-h-9 items-center rounded-full border border-white/20 bg-white/10 px-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90">
                HTX tiêu biểu
              </div>
              <div className="mt-4">
                <h2 className="max-w-[13ch] text-[1.95rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:max-w-[15ch] sm:text-[2.8rem]">
                  Các HTX đã sẵn sàng đưa sản phẩm ra thị trường.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/82 sm:text-[0.98rem]">
                  {featuredCooperative
                    ? `${featuredCooperative.name} đang là một trong những hồ sơ có nhịp công khai rõ nhất, giúp người xem mở HTX, xem sản phẩm và đi tiếp sang các lớp dữ liệu liên quan.`
                    : 'Danh sách này ưu tiên các HTX đã có dữ liệu gọn, có sản phẩm công khai và lối dẫn rõ ràng sang thị trường số.'}
                </p>
                {featuredCooperative ? (
                  <div className="mt-4 inline-flex min-h-10 items-center rounded-full border border-white/18 bg-white/10 px-4 text-sm font-semibold text-white/92">
                    Hồ sơ nổi bật: {featuredCooperative.name}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
                  <div className="flex flex-wrap gap-2.5">
                    {flowSignals.map((signal) => (
                      <span key={signal} className="rounded-full border border-white/18 bg-white/10 px-3.5 py-2 text-sm font-medium text-white/92 backdrop-blur">
                        {signal}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-[1.9rem] border border-white/18 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <PublicImage
                      src={featuredCooperative?.avatarUrl}
                      alt={featuredCooperative?.name ?? 'HTX nổi bật'}
                      fallback={DEFAULT_COOPERATIVE_IMAGE}
                      priority
                      wrapperClassName="h-20 w-20 shrink-0 overflow-hidden rounded-[1.4rem] ring-1 ring-white/20"
                      className="h-full w-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {featuredCooperative?.province || 'Hệ sinh thái HTXONLINE'}
                      </p>
                      <p className="mt-1 truncate text-[1.2rem] font-extrabold leading-tight text-white">
                        {featuredCooperative?.code ?? 'HTXONLINE'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/80">
                        {featuredCooperative ? `${featuredCooperative.productCount} sản phẩm công khai đang gắn với HTX này.` : 'Chọn một HTX để đi sâu vào lớp sản phẩm và hồ sơ công khai.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-white/14 bg-[#ffffff14] px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/68">Tỉnh thành</p>
                      <p className="mt-1 text-lg font-extrabold text-white">{provinceCount}+</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/14 bg-[#ffffff14] px-4 py-3">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/68">Sản phẩm</p>
                      <p className="mt-1 text-lg font-extrabold text-white">{totalProducts}+</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {featuredCooperative ? (
                      <Link
                        href={`/htx/${featuredCooperative.code}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#16354a] transition hover:-translate-y-0.5"
                      >
                        Mở hồ sơ HTX
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    ) : null}
                    <Link
                      href="/san-pham"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/14"
                    >
                      Xem sản phẩm công khai
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </article>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Building2, title: 'HTX hiển thị', value: `${cooperatives.length}+`, note: 'Danh sách đã có mặt trên lớp công khai' },
              { icon: MapPin, title: 'Tỉnh thành', value: `${provinceCount}+`, note: 'Mỗi hồ sơ giữ lối dẫn địa phương rõ ràng' },
              { icon: ShieldCheck, title: 'Luồng đi tiếp', value: 'Mạch lạc', note: 'Từ HTX sang sản phẩm và thông tin liên hệ nhanh hơn' }
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[1.8rem] border border-[#e5e8db] bg-[linear-gradient(180deg,#fffef9_0%,#ffffff_100%)] p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:p-5"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7ef] text-[#1f9b4b]">
                  <item.icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">{item.title}</p>
                <p className="mt-1 text-[1.7rem] font-extrabold leading-none text-[#1f2233]">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
              </article>
            ))}

            <article className="rounded-[1.8rem] border border-[#e5e8db] bg-[#fffaf2] p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Lối dẫn dữ liệu</p>
              <h3 className="mt-2 text-[1.35rem] font-extrabold leading-[1.1] text-[#1f2233]">Chọn HTX, xem sản phẩm rồi mở tiếp hồ sơ phù hợp.</h3>
              <div className="mt-4 space-y-2.5">
                {quickNotes.map((note) => (
                  <div key={note} className="rounded-[1.1rem] border border-[#e8e2d4] bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    {note}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <article className="rounded-[2rem] border border-[#e6e0d2] bg-[linear-gradient(180deg,#fffdf7_0%,#fff8ec_100%)] p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#2b8a3e]">Theo tỉnh thành</p>
            <h3 className="mt-2 text-[1.45rem] font-extrabold leading-[1.08] text-[#1f2233] sm:text-[1.8rem]">Quét nhanh khu vực đang có HTX công khai.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Phần này gom các tỉnh thành xuất hiện nhiều nhất để người xem định vị nhanh rồi mở thẳng hồ sơ phù hợp.
            </p>
            {topProvinces.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {topProvinces.map(([province, count]) => (
                  <span key={province} className="rounded-full border border-[#d8e7d8] bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    {province} · {count} HTX
                  </span>
                ))}
              </div>
            ) : null}
          </article>

          <div className="rounded-[2rem] border border-[#e8e4d8] bg-white p-2.5 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <PublicSearch placeholder="Tìm HTX theo tên hoặc tỉnh thành" action="/htx" />
            <div className="mt-3 flex flex-wrap gap-2 px-1">
              {[
                { icon: Sparkles, text: 'Hồ sơ HTX nối thẳng sang sản phẩm công khai' },
                { icon: ShieldCheck, text: 'Mỗi thẻ giữ lối đọc gọn, dễ quét trên điện thoại' }
              ].map((item) => (
                <div key={item.text} className="inline-flex items-center gap-2 rounded-full bg-[#f0f8f0] px-3 py-2 text-sm font-medium text-slate-700">
                  <item.icon size={15} aria-hidden="true" className="text-leaf" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </section>

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
