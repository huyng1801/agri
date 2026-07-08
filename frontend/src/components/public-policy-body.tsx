import { PublicInfoTile, publicProseClass } from './public-layout';
import { Panel, cn } from './ui';

export function PublicPolicyBody({ sections }: { sections: Array<{ title: string; paragraphs: string[] }> }) {
  return (
    <Panel className="space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-lg font-bold text-ink">{section.title}</h2>
          <div className={cn('mt-3 space-y-3', publicProseClass)}>
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
