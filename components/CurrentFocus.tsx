import type { CurrentFocusSection } from "@/types";

interface Props {
  data: CurrentFocusSection | null;
}

export default function CurrentFocus({ data }: Props) {
  if (!data?.items?.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-28">
      <div className="gradient-line mb-12" />
      <div className="mb-10 animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-50 tracking-tight">
          {data.title}
        </h2>
      </div>
      <ul className="space-y-5 stagger">
        {data.items.map((item, i) => (
          <li key={i} className="flex items-start gap-4 animate-fade-up">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
            <span className="text-neutral-300 text-sm leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
