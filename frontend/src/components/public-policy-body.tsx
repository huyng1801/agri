import { Mail, MapPin, Phone } from 'lucide-react';
import { PublicInfoTile, publicProseClass } from './public-layout';
import { Panel, cn } from './ui';

type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  kind?: 'default' | 'contact';
};

export function PublicPolicyBody({
  sections
}: {
  sections: PolicySection[];
}) {
  const quickLinks = sections.map((section) => ({
    id: sectionId(section.title),
    title: section.title.replace(/^\d+\.\s*/, '')
  }));

  return (
    <div className="space-y-4">
      <Panel className="space-y-3 border-slate-200 bg-slate-50/90">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Muc luc nhanh</p>
            <p className="mt-1 text-sm font-bold text-ink">Chon dung muc can doc truoc, de quet nhanh tren mobile thay vi cuon het mot mach.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">{sections.length} muc</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
            >
              {item.title}
            </a>
          ))}
        </div>
      </Panel>
      <Panel className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} id={sectionId(section.title)} className="scroll-mt-24">
            <h2 className="text-lg font-bold text-ink">{section.title}</h2>
            <div className={cn('mt-3 space-y-3', publicProseClass)}>
              {(section.paragraphs ?? []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.kind === 'contact' ? (
                <PolicyContactCard bullets={section.bullets ?? []} />
              ) : section.bullets?.length ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </Panel>
    </div>
  );
}

export function PublicGuideSteps({ steps }: { steps: Array<{ title: string; description: string }> }) {
  return (
    <div className="grid gap-4">
      {steps.map((step, index) => (
        <PublicInfoTile key={step.title} title={`Bước ${index + 1}. ${step.title}`} description={step.description} />
      ))}
    </div>
  );
}

function PolicyContactCard({ bullets }: { bullets: string[] }) {
  const address = extractPrefixedValue(bullets, 'Địa chỉ:');
  const hotline = extractPrefixedValue(bullets, 'Hotline:');
  const email = extractPrefixedValue(bullets, 'Email:');
  const website = extractPrefixedValue(bullets, 'Website:');
  const supportTime = extractPrefixedValue(bullets, 'Thời gian hỗ trợ:');

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {address ? <PublicInfoTile title="Địa chỉ" description={address} /> : null}
        {supportTime ? <PublicInfoTile title="Thời gian hỗ trợ" description={supportTime} /> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {hotline ? (
          <a
            href={`tel:${hotline.replace(/\s+/g, '')}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
          >
            <Phone size={16} aria-hidden="true" />
            Gọi {hotline}
          </a>
        ) : null}
        {email ? (
          <a
            href={`mailto:${email}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
          >
            <Mail size={16} aria-hidden="true" />
            Gui email
          </a>
        ) : null}
      </div>
      <div className="grid gap-2 text-sm text-slate-700">
        {hotline ? <p className="flex items-start gap-2"><Phone size={16} aria-hidden="true" className="mt-1 shrink-0 text-leaf" /><span>{hotline}</span></p> : null}
        {email ? <p className="flex items-start gap-2 break-all"><Mail size={16} aria-hidden="true" className="mt-1 shrink-0 text-leaf" /><span>{email}</span></p> : null}
        {address ? <p className="flex items-start gap-2"><MapPin size={16} aria-hidden="true" className="mt-1 shrink-0 text-leaf" /><span>{address}</span></p> : null}
        {website ? <p className="text-slate-500">Website: {website}</p> : null}
      </div>
    </div>
  );
}

function extractPrefixedValue(items: string[], prefix: string) {
  const match = items.find((item) => item.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : '';
}

function sectionId(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
