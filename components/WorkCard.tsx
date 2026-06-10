import type { WorkItem } from "@/types";
import Image from "next/image";

const statusColors: Record<string, string> = {
  active: "text-success-400/70 bg-success-400/5",
  "in-development": "text-primary-400/70 bg-primary-400/5",
  building: "text-primary-400/70 bg-primary-400/5",
  scaling: "text-secondary-400/70 bg-secondary-400/5",
  completed: "text-neutral-400 bg-neutral-800",
  archived: "text-neutral-400 bg-neutral-800",
  research: "text-tertiary-400/70 bg-tertiary-400/5",
  exited: "text-neutral-400 bg-neutral-800",
};

/** Derive a clear, action-oriented CTA label from the destination URL. */
function ctaLabel(url: string): string {
  if (/apps\.apple\.com/i.test(url)) return "View on App Store";
  if (/play\.google\.com/i.test(url)) return "View on Play Store";
  return "Visit Site";
}

export default function WorkCard({ item }: { item: WorkItem }) {
  return (
    <div className="group glass rounded-2xl p-6 flex flex-col h-full hover:border-primary-500/20 transition-all duration-500 glow-hover animate-fade-up">
      {/* Top row: logo / initial + status */}
      <div className="flex items-start justify-between mb-4">
        {item.logoURL ? (
          <Image
            src={item.logoURL}
            alt={item.name}
            width={36}
            height={36}
            className="h-9 w-auto object-contain rounded"
          />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-primary-500/10 border border-neutral-800 flex items-center justify-center text-neutral-100 font-bold text-sm">
            {item.name?.[0] ?? "?"}
          </div>
        )}
        <span
          className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
            statusColors[item.status] ?? "text-neutral-400 bg-neutral-800"
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* Name — clickable when a website exists, but the footer CTA is the primary affordance */}
      <h3 className="text-neutral-50 font-semibold mb-1 leading-tight">
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
      </h3>

      {/* Role + type badge */}
      <div className="flex items-center gap-2 mb-3">
        {item.role && (
          <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
            {item.role}
          </p>
        )}
        {item.owned && (
          <span className="text-[8px] font-mono uppercase tracking-wider text-success-400/80 bg-success-400/10 px-1.5 py-px rounded-full">
            Owned
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-400 mb-4 leading-relaxed line-clamp-3">
        {item.description}
      </p>

      {/* Metrics — a highlight stat, deliberately styled to read as info, not a link */}
      {item.metrics && (
        <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-md bg-neutral-800/60 px-2.5 py-1 text-xs text-neutral-300">
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

      {/* Footer: tags + a single, obvious CTA pushed to the bottom */}
      <div className="mt-auto">
        {/* Tags */}
        {item.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.techStack.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-[9px] text-neutral-100 font-mono uppercase tracking-widest bg-neutral-800 px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
            {item.techStack.length > 6 && (
              <span className="text-[9px] text-neutral-100 font-mono self-center">
                +{item.techStack.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Primary CTA — only when there's somewhere to go */}
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
      </div>
    </div>
  );
}
