import { PublicInfoTile } from './public-layout';
import { Panel } from './ui';

export function PublicPolicyBody({ sections }: { sections: Array<{ title: string; paragraphs: string[] }> }) {
  return (
    <Panel className="space-y-6">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-lg font-bold text-ink">{section.title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </Panel>
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
