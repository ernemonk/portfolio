import type { WorkItem, WorkItemType } from "@/types";

interface Props {
  items: WorkItem[];
}

const typeLabels: Record<WorkItemType, string> = {
  venture: "Ventures & Products",
  project: "Enterprise Engineering",
  client: "Consulting",
  experiment: "Lab & R&D",
};

const typeOrder: WorkItemType[] = ["venture", "project", "client", "experiment"];

export default function SelectedWork({ items = [] }: Props) {
  if (!items.length) return null;

  const presentTypes = typeOrder.filter((t) =>
    items.some((i) => i.type === t)
  );

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-28">
      <div className="gradient-line mb-28" />

      <h2 className="text-xs text-white/20 font-mono uppercase tracking-[0.3em] mb-14 animate-fade-up">
        Selected Work
      </h2>

      <div className="space-y-20">
        {presentTypes.map((type) => {
          const group = items.filter((i) => i.type === type);
          return (
            <div key={type} className="animate-fade-up">
              <h3 className="text-sm text-sky-400/80 font-mono uppercase tracking-wider mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-sky-400/30" />
                {typeLabels[type] ?? type}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                {group.map((item) => (
                  <div
                    key={item.id}
                    className="group glass rounded-2xl p-6 hover:border-sky-500/20 transition-all duration-500 glow-hover animate-fade-up"
                  >
                    {/* Header: name + status */}
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-semibold leading-tight">
                        {item.website ? (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-sky-400 transition-colors duration-300"
                          >
                            {item.name}
                            <span className="ml-1.5 text-white/15 group-hover:text-sky-400/50 text-xs transition-colors">↗</span>
                          </a>
                        ) : (
                          item.name
                        )}
                      </h4>
                      {item.owned && (
                        <span className="shrink-0 text-[9px] font-mono uppercase tracking-wider text-emerald-400/60 bg-emerald-400/5 px-2 py-0.5 rounded-full">
                          Owned
                        </span>
                      )}
                    </div>

                    {/* Role */}
                    {item.role && (
                      <p className="text-[11px] text-white/20 font-mono uppercase tracking-wider mb-3">
                        {item.role}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-sm text-white/30 mb-4 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Metrics */}
                    {item.metrics && (
                      <p className="text-xs text-sky-400/60 font-mono mb-4">
                        {item.metrics}
                      </p>
                    )}

                    {/* Tech stack pills */}
                    {item.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.techStack.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] text-white/15 font-mono uppercase tracking-widest bg-white/[0.02] px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                        {item.techStack.length > 5 && (
                          <span className="text-[9px] text-white/10 font-mono">
                            +{item.techStack.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
