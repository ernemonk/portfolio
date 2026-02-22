import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 mt-24">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/30 text-sm">
          © {new Date().getFullYear()} Ernesto Martin. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/about" className="text-sm text-white/30 hover:text-white transition-colors">About</Link>
          <Link href="/ventures" className="text-sm text-white/30 hover:text-white transition-colors">Ventures</Link>
          <Link href="/projects" className="text-sm text-white/30 hover:text-white transition-colors">Projects</Link>
          <Link href="/contact" className="text-sm text-white/30 hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
