import { PublicShell } from './public-marketplace';
import { PublicPageHeader, PublicPageMain } from './public-layout';
import { Panel } from './ui';

export function PublicStaticPage({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <PublicShell>
      <PublicPageMain>
        <PublicPageHeader title={title} description={description} />
        {children ?? (
          <Panel>
            <p className="leading-7 text-slate-700">Nội dung đang được đội vận hành HTXONLINE cập nhật.</p>
          </Panel>
        )}
      </PublicPageMain>
    </PublicShell>
  );
}
