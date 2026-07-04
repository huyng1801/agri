import { PublicShell } from './public-marketplace';
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
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-ink">{title}</h1>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">{description}</p>
        </div>
        {children ?? (
          <Panel>
            <p className="leading-7 text-slate-700">Nội dung đang được đội vận hành HTXONLINE cập nhật.</p>
          </Panel>
        )}
      </main>
    </PublicShell>
  );
}
