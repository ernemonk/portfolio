import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-16">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-sky-400 text-xs font-mono tracking-widest mb-8 uppercase">
          Lead Full Stack Senior Engineer · San Francisco, CA
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-none mb-6">
          Ernesto<br />
          <span className="text-white/20">Monge</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/50 max-w-2xl mb-12 leading-relaxed">
          10+ years building enterprise systems, real-time integrations,
          IoT platforms, and cloud-native applications at scale.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="px-8 py-4 bg-sky-500 text-white font-semibold text-sm rounded-full hover:bg-sky-400 transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 border border-white/20 text-white/70 font-semibold text-sm rounded-full hover:border-white/50 hover:text-white transition-colors"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
