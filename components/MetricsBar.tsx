import type { SiteMetric } from "@/types";

interface Props {
  metrics: SiteMetric[];
}

export default function MetricsBar({ metrics = [] }: Props) {
  if (!metrics.length) return null;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/[0.03] via-transparent to-indigo-500/[0.03]" />
      <div className="absolute inset-x-0 top-0 gradient-line" />
      <div className="absolute inset-x-0 bottom-0 gradient-line" />

      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 stagger">
        {metrics.map((m) => (
          <div key={m.id} className="text-center animate-fade-up">
            <p className="text-5xl md:text-6xl font-bold text-gradient mb-3 tracking-tight">
              {m.value}
            </p>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
