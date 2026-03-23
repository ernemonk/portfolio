import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-24">
      <div className="gradient-line" />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg tracking-tight">
              EM<span className="text-sky-400">.</span>
            </span>
            <span className="text-white/15 text-xs font-mono">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <Link
              href="/work"
              className="text-xs text-white/20 hover:text-white/60 transition-colors duration-300 uppercase tracking-wider font-mono"
            >
              Work
            </Link>
            <Link
              href="/contact"
              className="text-xs text-white/20 hover:text-white/60 transition-colors duration-300 uppercase tracking-wider font-mono"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-white/20 hover:text-white/60 transition-colors duration-300 uppercase tracking-wider font-mono"
            >
              Privacy
            </Link>
            <a
              href="https://github.com/ernemonk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/20 hover:text-white/60 transition-colors duration-300 uppercase tracking-wider font-mono"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/ernesto-monge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/20 hover:text-white/60 transition-colors duration-300 uppercase tracking-wider font-mono"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
