import Link from "next/link";

interface Props {
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
  resumeHref?: string;
}

export default function HeroCTA({
  cta1Label,
  cta1Href,
  cta2Label,
  cta2Href,
  resumeHref = "/resume/",
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
      {/* View Work — clear primary */}
      <Link
        href={cta1Href}
        className="btn-cta-primary group px-8 py-4 text-base"
      >
        {cta1Label}
        <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </Link>

      {/* Work With Me — low-contrast ghost */}
      <Link href={cta2Href} className="btn-cta-ghost px-5 py-4 text-base">
        {cta2Label}
      </Link>

      {/* View Resume — text button with a quiet file tag */}
      <Link
        href={resumeHref}
        className="btn-cta-ghost group gap-2 px-5 py-4 text-base"
      >
        View Resume
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 transition-colors duration-200 group-hover:text-primary-400">
          PDF
        </span>
      </Link>

      {/* Live availability — quiet proof, sits at the end of the row */}
      <span className="ml-1 hidden items-center gap-2 font-mono text-[11px] tracking-wide text-neutral-500 sm:flex">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Available · Q3 slots
      </span>
    </div>
  );
}
