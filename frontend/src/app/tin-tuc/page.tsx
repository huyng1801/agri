import { PublicStaticPage } from '@/components/public-static-page';
import { EmptyPublicState } from '@/components/public-marketplace';

export default function NewsPage() {
  return (
    <PublicStaticPage title="Tin tức" description="Tin HTX, thị trường, kiến thức nông nghiệp, chuyển đổi số và truy xuất nguồn gốc.">
      <EmptyPublicState title="Chưa có tin tức public" description="Tin tức do Super Admin đăng sẽ hiển thị tại đây." />
    </PublicStaticPage>
  );
}
