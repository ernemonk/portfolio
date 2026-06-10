import type { CapabilitiesSection } from "@/types";
import { Card } from "@/components/Card";
import { Heading } from "@/components/Heading";

interface Props {
  data: CapabilitiesSection | null;
}

const icons = ["◆", "◇", "▣"];

export default function CapabilityBlocks({ data }: Props) {
  if (!data?.blocks?.length) return null;

  return (
    <section id="capabilities" className="container-max px-6 py-28 relative isolate overflow-hidden scroll-mt-24 section-glow-tr">
      {/* Section header */}
      <div className="mb-12 animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-50 tracking-tight">
          What I Do
        </h2>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
        {data.blocks.map((block, i) => (
          <Card
            key={block.title}
            variant="glass"
            className="group animate-fade-up hover:border-primary-500/30 transition-all duration-300"
          >
            {/* Icon */}
            <span className="text-primary-500/80 text-2xl mb-4 block font-mono">
              {icons[i % icons.length]}
            </span>

            {/* Title */}
            <h3 className="text-lg font-semibold text-neutral-50 mb-3 group-hover:text-gradient transition-colors duration-300">
              {block.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-neutral-400 leading-relaxed">
              {block.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
