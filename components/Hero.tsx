import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-16">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-emerald-400 text-xs font-mono tracking-widest mb-8 uppercase">
          Available for select partnerships
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-none mb-6">
          Ernesto<br />
          <span className="text-white/20">Martin</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          AI Systems Architect &amp; Founder. I build intelligent products,
          scalable SaaS, and operational ventures.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/ventures"
            className="px-8 py-4 bg-emerald-400 text-black font-semibold text-sm rounded-full hover:bg-emerald-300 transition-colors"
          >
            View Ventures
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 border border-white/20 text-white/70 font-semibold text-sm rounded-full hover:border-white/50 hover:text-white transition-colors"
          >
            Work With Me
          </Link>
        </div>
      </div>
    </section>
  );
}
