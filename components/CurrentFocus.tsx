import type { CurrentFocusSection } from "@/types";

interface Props {
  data: CurrentFocusSection | null;
}

export default function CurrentFocus({ data }: Props) {
  if (!data?.items?.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-28">
      <div className="gradient-line mb-28" />
      <h2 className="text-xs text-white/20 font-mono uppercase tracking-[0.3em] mb-10 animate-fade-up">
        {data.title}
      </h2>
      <ul className="space-y-5 stagger">
        {data.items.map((item, i) => (
          <li key={i} className="flex items-start gap-4 animate-fade-up">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 shrink-0" />
            <span className="text-white/40 text-sm leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
