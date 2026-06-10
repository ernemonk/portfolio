import Link from "next/link";
import type { HeroSection } from "@/types";
import { Button, LinkButton } from "@/components/Button";
import { Heading } from "@/components/Heading";

interface Props {
  data: HeroSection | null;
}

export default function Hero({ data }: Props) {
  if (!data) return null;

  const [firstName, ...rest] = data.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Ambient gradient glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="container-max px-6 py-24 relative z-10">
        {/* Tagline */}
        <p className="text-primary-400 text-xs font-mono tracking-[0.3em] mb-8 uppercase animate-fade-up">
          {data.tagline}
        </p>

        {/* Main Heading */}
        <Heading
          level="h1"
          size="4xl"
          className="mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <span className="text-neutral-50">{firstName}</span>
          <br />
          <span className="text-gradient">{lastName}</span>
        </Heading>

        {/* Subheading */}
        <p 
          className="text-lg md:text-2xl text-neutral-400 max-w-2xl mb-14 leading-relaxed animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          {data.subtext}
        </p>

        {/* CTA Buttons */}
        <div 
          className="flex flex-wrap gap-4 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <LinkButton
            href={data.cta1Href}
            variant="primary"
            size="lg"
            className="group glow-hover"
          >
            {data.cta1Label}
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </LinkButton>

          <LinkButton
            href={data.cta2Href}
            variant="secondary"
            size="lg"
          >
            {data.cta2Label}
          </LinkButton>

          <LinkButton
            href="/resume"
            variant="outline"
            size="lg"
          >
            View Resume
          </LinkButton>
        </div>
      </div>

      {/* Bottom fade divider */}
      <div className="absolute bottom-0 left-0 right-0 gradient-line" />
    </section>
  );
}
