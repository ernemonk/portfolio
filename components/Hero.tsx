import Link from "next/link";
import type { HeroSection } from "@/types";

interface Props {
  data: HeroSection | null;
}

export default function Hero({ data }: Props) {
  if (!data) return null;

  const [firstName, ...rest] = data.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      {/* Subtle dot-grid background */}
      <div className="absolute inset-0 dot-grid opacity-50" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-24">
        <p className="text-sky-400 text-xs font-mono tracking-[0.3em] mb-8 uppercase animate-fade-up">
          {data.tagline}
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none mb-6 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <span className="text-white">{firstName}</span>
          <br />
          <span className="text-gradient">{lastName}</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/40 max-w-2xl mb-14 leading-relaxed animate-fade-up" style={{ animationDelay: "160ms" }}>
          {data.subtext}
        </p>
        <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <Link
            href={data.cta1Href}
            className="group relative px-8 py-4 bg-sky-500 text-white font-semibold text-sm rounded-full hover:bg-sky-400 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)]"
          >
            {data.cta1Label}
          </Link>
          <Link
            href={data.cta2Href}
            className="px-8 py-4 border border-white/10 text-white/50 font-semibold text-sm rounded-full hover:border-white/30 hover:text-white transition-all duration-300"
          >
            {data.cta2Label}
          </Link>
        </div>
      </div>

      {/* Bottom fade line */}
      <div className="absolute bottom-0 left-0 right-0 gradient-line" />
    </section>
  );
}
