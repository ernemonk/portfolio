"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type CTAKey = "work" | "contact" | "resume";

interface Props {
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
  resumeHref?: string;
}

const pillTransition = { type: "spring", stiffness: 380, damping: 32 } as const;

export default function HeroCTA({
  cta1Label,
  cta1Href,
  cta2Label,
  cta2Href,
  resumeHref = "/resume/",
}: Props) {
  const [hovered, setHovered] = useState<CTAKey | null>(null);

  return (
    <div
      className="flex flex-wrap items-center gap-4"
      onMouseLeave={() => setHovered(null)}
    >
      {/* View Work — primary */}
      <CTAItem ctaKey="work" hovered={hovered} setHovered={setHovered}>
        <Link
          href={cta1Href}
          className="btn-base btn-primary px-8 py-4 text-lg group relative z-10"
        >
          {cta1Label}
          <span className="ml-2 transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </CTAItem>

      {/* Work With Me — secondary, with live availability indicator */}
      <CTAItem
        ctaKey="contact"
        hovered={hovered}
        setHovered={setHovered}
        meta={
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Available for contract · Q3 project slots
          </span>
        }
      >
        <Link
          href={cta2Href}
          className="btn-base btn-secondary px-8 py-4 text-lg relative z-10"
        >
          {cta2Label}
        </Link>
      </CTAItem>

      {/* View Resume — outline, with file meta-tag */}
      <CTAItem
        ctaKey="resume"
        hovered={hovered}
        setHovered={setHovered}
        meta={
          <span className="font-mono text-[11px] tracking-wide text-primary-400/80">
            PDF · Updated June 2026
          </span>
        }
      >
        <Link
          href={resumeHref}
          className="btn-base btn-outline text-lg relative z-10"
        >
          View Resume
        </Link>
      </CTAItem>
    </div>
  );
}

interface ItemProps {
  ctaKey: CTAKey;
  hovered: CTAKey | null;
  setHovered: (key: CTAKey) => void;
  meta?: React.ReactNode;
  children: React.ReactNode;
}

function CTAItem({ ctaKey, hovered, setHovered, meta, children }: ItemProps) {
  const isHovered = hovered === ctaKey;

  return (
    <div className="relative" onMouseEnter={() => setHovered(ctaKey)}>
      {/* Contextual status meta-label */}
      <AnimatePresence>
        {isHovered && meta && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none absolute -top-7 left-0 whitespace-nowrap"
          >
            {meta}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared ambient pill — glides between buttons via layoutId */}
      {isHovered && (
        <motion.span
          layoutId="cta-ambient-pill"
          aria-hidden
          transition={pillTransition}
          className="absolute inset-0 -z-0 rounded-lg bg-primary-500/10 ring-1 ring-primary-500/40 shadow-[0_0_24px_-4px] shadow-primary-500/30"
        />
      )}

      {children}
    </div>
  );
}
