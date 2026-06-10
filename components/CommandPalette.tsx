"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type Command = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  group: "Navigate" | "Connect" | "Actions";
  run: (router: ReturnType<typeof useRouter>) => void;
};

const ArrowIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const commands: Command[] = [
  { id: "home", label: "Home", hint: "/", keywords: "start landing", group: "Navigate", run: (r) => r.push("/") },
  { id: "about", label: "About", hint: "/about", keywords: "bio story", group: "Navigate", run: (r) => r.push("/about") },
  { id: "work", label: "Work", hint: "/work", keywords: "projects portfolio case studies", group: "Navigate", run: (r) => r.push("/work") },
  { id: "resume", label: "Resume", hint: "/resume", keywords: "cv experience", group: "Navigate", run: (r) => r.push("/resume") },
  { id: "contact", label: "Contact", hint: "/contact", keywords: "email reach out hire", group: "Navigate", run: (r) => r.push("/contact") },
  {
    id: "github",
    label: "GitHub",
    hint: "ernemonk",
    keywords: "code repos source",
    group: "Connect",
    run: () => window.open("https://github.com/ernemonk", "_blank", "noopener,noreferrer"),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    hint: "ernesto-monge",
    keywords: "profile network",
    group: "Connect",
    run: () => window.open("https://www.linkedin.com/in/ernesto-monge-873728132/", "_blank", "noopener,noreferrer"),
  },
  {
    id: "email",
    label: "Email me",
    hint: "erne.monge.s@gmail.com",
    keywords: "mail contact message",
    group: "Connect",
    run: () => {
      window.location.href = "mailto:erne.monge.s@gmail.com";
    },
  },
  {
    id: "copy-email",
    label: "Copy email address",
    keywords: "clipboard mail",
    group: "Actions",
    run: () => {
      void navigator.clipboard?.writeText("erne.monge.s@gmail.com");
    },
  },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global ⌘K / Ctrl+K shortcut + external open events from the nav button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      // Focus the input on next frame so the animation/mount has settled.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  // Group while preserving a single flat order shared by display + keyboard nav.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? commands.filter((c) =>
          `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase().includes(q)
        )
      : commands;
    return (["Navigate", "Connect", "Actions"] as const)
      .map((group) => ({ group, items: filtered.filter((c) => c.group === group) }))
      .filter((g) => g.items.length > 0);
  }, [query]);

  const ordered = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const runCommand = useCallback(
    (cmd: Command) => {
      close();
      cmd.run(router);
    },
    [close, router]
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, ordered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = ordered[active];
      if (cmd) runCommand(cmd);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  // Keep the active row scrolled into view.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // Running index assigned during render, matching `ordered` for keyboard nav.
  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <button
            aria-label="Close command palette"
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-900/90 shadow-2xl shadow-black/60 backdrop-blur-xl"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.4a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search or jump to…"
                className="w-full bg-transparent py-4 text-sm text-neutral-100 placeholder-neutral-500 outline-none border-0 focus:ring-0 p-0"
                style={{ background: "transparent" }}
                aria-label="Search commands"
              />
              <kbd className="hidden sm:block rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[min(60vh,360px)] overflow-y-auto py-2">
              {groups.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-neutral-500">No results for &ldquo;{query}&rdquo;</p>
              )}
              {groups.map(({ group, items }) => (
                <div key={group} className="px-2 pb-1">
                  <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-600">{group}</p>
                  {items.map((cmd) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const isActive = index === active;
                    return (
                      <button
                        key={cmd.id}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => runCommand(cmd)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                          isActive ? "bg-primary-500/15 text-neutral-50" : "text-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-md border text-[11px] ${
                              isActive
                                ? "border-primary-400/40 bg-primary-500/15 text-primary-300"
                                : "border-white/[0.06] bg-white/[0.02] text-neutral-500"
                            }`}
                          >
                            {ArrowIcon}
                          </span>
                          <span className="text-sm">{cmd.label}</span>
                        </span>
                        {cmd.hint && (
                          <span className="font-mono text-xs text-neutral-600">{cmd.hint}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2 font-mono text-[10px] text-neutral-600">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/[0.08] px-1">↑</kbd>
                <kbd className="rounded border border-white/[0.08] px-1">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/[0.08] px-1">↵</kbd>
                select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
