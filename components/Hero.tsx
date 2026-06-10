import type { HeroSection } from "@/types";
import { Heading } from "@/components/Heading";
import HeroCTA from "@/components/HeroCTA";

interface Props {
  data: HeroSection | null;
}

/* Above-the-fold proof metrics — low-contrast telemetry that establishes
   credibility instantly, before the visitor reaches the CTAs. */
const PROOF_METRICS: { value?: string; label: string }[] = [
  { value: "10+", label: "Yrs Experience" },
  { value: "20+", label: "Shipped Products" },
  { label: "Distributed Infrastructure" },
];

export default function Hero({ data }: Props) {
  if (!data) return null;

  const [firstName, ...rest] = data.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <section className="relative flex min-h-[82vh] flex-col justify-center overflow-hidden pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Ambient center glow — felt-not-seen backlight behind the text block */}
      <div className="hero-backlight pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" />

      <div className="container-max relative z-10 px-6 py-12">
        {/* Tagline — editorial, premium */}
        <p
          className="mb-7 text-xs uppercase animate-fade-up"
          style={{
            color: "rgba(248, 250, 252, 0.65)",
            letterSpacing: "0.18em",
            fontWeight: 500,
          }}
        >
          {data.tagline}
        </p>

        {/* Main Heading */}
        <Heading
          level="h1"
          size="4xl"
          className="mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <span style={{ color: "#f8fafc" }}>{firstName}</span>
          <br />
          <span className="text-gradient">{lastName}</span>
        </Heading>

        {/* Subheading */}
        <p
          className="mb-8 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-2xl animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          {data.subtext}
        </p>

        {/* Proof metrics row */}
        <div
          className="mb-9 flex flex-wrap items-center gap-x-6 gap-y-3 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          {PROOF_METRICS.map((m, i) => (
            <div key={m.label} className="flex items-center gap-6">
              {i > 0 && (
                <span aria-hidden className="h-4 w-px bg-white/10" />
              )}
              <span className="text-[13px] tracking-wide">
                {m.value && (
                  <span className="font-mono font-semibold text-neutral-200">
                    {m.value}{" "}
                  </span>
                )}
                <span className="text-neutral-500">{m.label}</span>
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-up" style={{ animationDelay: "260ms" }}>
          <HeroCTA
            cta1Label={data.cta1Label}
            cta1Href={data.cta1Href}
            cta2Label={data.cta2Label}
            cta2Href={data.cta2Href}
          />
        </div>
      </div>

      {/* Bottom fade divider */}
      <div className="absolute bottom-0 left-0 right-0 gradient-line" />
    </section>
  );
}
