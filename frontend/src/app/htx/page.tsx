import type { Metadata } from 'next';
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

  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader
          title="HTX trên HTXONLINE"
          description={`${catalog.cooperatives.length} hợp tác xã đang có sản phẩm public trên sàn.`}
        />
        <PublicSearch placeholder="Tìm HTX theo tên hoặc tỉnh thành" action="/htx" />
        {cooperatives.length ? (
          <div className="mt-6 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3">
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
