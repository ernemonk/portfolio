"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Live San Francisco time capsule ──────────────────────────────────── */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
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

  return (
    <span className="font-mono text-[11px] tracking-wider text-neutral-500 tabular-nums">
      SF {time ?? "--:--"}
    </span>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.03] bg-neutral-950/60 backdrop-blur-xl transition-all duration-300">
      <div className="container-max flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Ernesto Monge — home"
          className="text-base font-semibold tracking-tight text-neutral-50 transition-opacity duration-300 hover:opacity-80"
        >
          EM<span className="text-primary-400">.</span>
        </Link>

        {/* Center navigation — quiet, spaced, with a single active dot */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
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
              </Link>
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
            const active = isActive(pathname, l.href);
            return (
              <Link
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
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
