import type { CapabilitiesSection } from "@/types";

interface Props {
  data: CapabilitiesSection | null;
}

const icons = ["◆", "◇", "▣"];

export default function CapabilityBlocks({ data }: Props) {
  if (!data?.blocks?.length) return null;

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-28">
      <h2 className="text-xs text-white/20 font-mono uppercase tracking-[0.3em] mb-14 animate-fade-up">
        What I Do
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
        {data.blocks.map((block, i) => (
          <div
            key={block.title}
            className="group glass rounded-2xl p-8 hover:border-sky-500/20 transition-all duration-500 glow-hover animate-fade-up"
          >
            <span className="text-sky-400/60 text-lg mb-4 block font-mono">
              {icons[i % icons.length]}
            </span>
            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-gradient transition-colors duration-300">
              {block.title}
            </h3>
            <p className="text-sm text-white/30 leading-relaxed">
              {block.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
