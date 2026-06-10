"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { href: "#top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = links.map((l) => l.href.slice(1));

/* ── Live San Francisco time capsule ──────────────────────────────────── */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    update();
    const id = setInterval(update, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <span className="font-mono text-[12px] font-medium tracking-wider text-neutral-300 tabular-nums">SF --:--</span>;

  return (
    <span className="font-mono text-[12px] font-medium tracking-wider text-neutral-300 tabular-nums">
      SF {time ?? "--:--"}
    </span>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [mounted, setMounted] = useState(false);

  // Scroll-spy: highlight the nav link for the section currently in view.
  useEffect(() => {
    setMounted(true);

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close drawer on route/scroll
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [activeSection]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.03] bg-neutral-950/60 backdrop-blur-xl transition-all duration-300">
      <div className="container-max flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <a
          href="#top"
          aria-label="Ernesto Monge — home"
          className="text-sm font-medium tracking-tight text-neutral-50 transition-opacity duration-300 hover:opacity-80"
        >
          EM<span className="text-primary-400">.</span>
        </a>

        {/* Center navigation — quiet, spaced, with a single active dot */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide">
          {links.map((l) => {
            const active = mounted && activeSection === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 transition-colors duration-300 ${
                  active ? "text-neutral-50" : "text-neutral-400 hover:text-neutral-50"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-400"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Minimal right element */}
        <div className="flex items-center gap-4">
          <LocalTime />

          {/* Mobile menu button */}
          <button
            className="md:hidden -mr-2 rounded-lg p-2 text-neutral-400 transition-colors duration-300 hover:text-neutral-50"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="text-xl">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/[0.03] bg-neutral-950/80 backdrop-blur-xl px-6 py-2">
          {links.map((l) => {
            const active = mounted && activeSection === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 py-2.5 text-sm tracking-wide transition-colors duration-300 ${
                  active ? "text-neutral-50" : "text-neutral-400 hover:text-neutral-50"
                }`}
              >
                {active && <span className="h-1 w-1 rounded-full bg-primary-400" />}
                {l.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
