import type { WorkItem, WorkItemType } from "@/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Heading } from "@/components/Heading";

interface Props {
  items: WorkItem[];
}

/** Derive a clear, action-oriented CTA label from the destination URL. */
function ctaLabel(url: string): string {
  if (/apps\.apple\.com/i.test(url)) return "View on App Store";
  if (/play\.google\.com/i.test(url)) return "View on Play Store";
  return "Visit Site";
}

const typeLabels: Record<WorkItemType, string> = {
  venture: "Ventures & Products",
  project: "Enterprise Engineering",
  client: "Consulting",
  experiment: "Lab & R&D",
};

const typeColors: Record<WorkItemType, "primary" | "secondary" | "success" | "warning"> = {
  venture: "primary",
  project: "secondary",
  client: "success",
  experiment: "warning",
};

const typeOrder: WorkItemType[] = ["venture", "project", "client", "experiment"];

export default function SelectedWork({ items = [] }: Props) {
  if (!items.length) return null;

  const presentTypes = typeOrder.filter((t) =>
    items.some((i) => i.type === t)
  );

  return (
    <section id="selected-work" className="container-max px-6 py-28 relative">
      <div className="gradient-line mb-12" />

      {/* Section label */}
      <p className="text-xs text-neutral-500 font-mono uppercase tracking-[0.3em] mb-12 animate-fade-up">
        Selected Work
      </p>

      <div className="space-y-20">
        {presentTypes.map((type) => {
          const group = items.filter((i) => i.type === type);
          return (
            <div key={type} className="animate-fade-up">
              {/* Category heading */}
              <h3 className="text-sm text-primary-400 font-mono uppercase tracking-wider mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-primary-400/60" />
                {typeLabels[type] ?? type}
              </h3>

              {/* Work items grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {group.map((item) => (
                  <Card
                    key={item.id}
                    variant="glass"
                    className="group animate-fade-up hover:border-primary-500/30 transition-all duration-300"
                  >
                    {/* Header: name + status badge */}
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <h4 className="text-neutral-50 font-semibold leading-tight flex-1">
                        {item.website ? (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group-hover:text-primary-400 transition-colors duration-300"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h4>
                    </div>

                    {/* Role */}
                    {item.role && (
                      <p className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider mb-3">
                        {item.role}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-sm text-neutral-400 mb-4 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {/* Metrics — a highlight stat, deliberately styled to read as info, not a link */}
                    {item.metrics && (
                      <div className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-neutral-800/60 px-2.5 py-1 text-xs text-neutral-300">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3 flex-shrink-0 text-success-400/80"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="font-mono">{item.metrics}</span>
                      </div>
                    )}

                    {/* Tech stack pills */}
                    {item.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.techStack.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest bg-neutral-800 px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                        {item.techStack.length > 5 && (
                          <span className="text-[9px] text-neutral-600 font-mono">
                            +{item.techStack.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Primary CTA — single obvious affordance when there's somewhere to go */}
                    {item.website && (
                      <div className="mt-4 pt-4 border-t border-neutral-800/60">
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          {ctaLabel(item.website)}
                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
