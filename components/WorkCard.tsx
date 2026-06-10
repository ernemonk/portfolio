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

export default function WorkCard({ item }: { item: WorkItem }) {
  return (
    <div className="group glass rounded-2xl p-6 hover:border-primary-500/20 transition-all duration-500 glow-hover animate-fade-up">
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
          <div className="h-9 w-9 rounded-xl bg-primary-500/10 border border-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-sm">
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

      {/* Name */}
      <h3 className="text-neutral-50 font-semibold mb-1 group-hover:text-primary-400 transition-colors duration-300 leading-tight">
        {item.website ? (
          <a href={item.website} target="_blank" rel="noopener noreferrer">
            {item.name}
            <span className="ml-1.5 text-neutral-500 group-hover:text-primary-400 text-xs">↗</span>
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

      {/* Metrics */}
      {item.metrics && (
        <p className="text-xs text-primary-400/80 font-mono mb-3">{item.metrics}</p>
      )}

      {/* Tags */}
      {item.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {item.techStack.slice(0, 6).map((t) => (
            <span
              key={t}
              className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest bg-neutral-800 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
          {item.techStack.length > 6 && (
            <span className="text-[9px] text-neutral-500 font-mono">
              +{item.techStack.length - 6}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
