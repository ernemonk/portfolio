import type { WorkItem } from "@/types";
import { WorkGrid } from "@/components/WorkGrid";

interface Props {
  items: WorkItem[];
}

export default function WorkSection({ items }: Props) {
  return (
    <section id="work" className="container-max px-6 py-28 scroll-mt-24 relative isolate overflow-hidden section-glow-tr">
      <div className="gradient-line mb-12" />

      <div className="mb-16 animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-50 tracking-tight mb-6">
          Work
        </h2>
        <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed">
          Ventures I&apos;ve built, enterprise systems I&apos;ve engineered,
          clients I&apos;ve consulted, and experiments I&apos;m running.
        </p>
      </div>

      <WorkGrid items={items} />
    </section>
  );
}
