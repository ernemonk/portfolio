import type { Metadata } from "next";
import Hero from "@/components/Hero";
import MetricsBar from "@/components/MetricsBar";
import VentureCard from "@/components/VentureCard";
import ProjectCard from "@/components/ProjectCard";
import {
  fetchOwnerVentures,
  fetchOwnerProjects,
  fetchOwnerExperiments,
} from "@/lib/firestore/server";

export const metadata: Metadata = {
  title: "Ernesto Monge — Lead Full Stack Senior Engineer",
  description:
    "10+ years building enterprise systems, real-time integrations, IoT platforms, and cloud-native applications at scale. Based in San Francisco.",
  openGraph: {
    title: "Ernesto Monge — Lead Full Stack Senior Engineer",
    description:
      "10+ years building enterprise systems, real-time integrations, IoT platforms, and cloud-native applications at scale.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ernesto Monge — Lead Full Stack Senior Engineer",
    description: "10+ years building enterprise systems at scale. Based in San Francisco.",
  },
};

export default async function HomePage() {
  const [ventures, projects, experiments] = await Promise.all([
    fetchOwnerVentures(),
    fetchOwnerProjects(),
    fetchOwnerExperiments(),
  ]);

  const featuredVentures = ventures.filter((v) => v.featured && v.status === "active");
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <>
      <Hero />
      <MetricsBar />

      {featuredVentures.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Ventures</h2>
            <a href="/ventures" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVentures.slice(0, 3).map((v) => <VentureCard key={v.id} venture={v} />)}
          </div>
        </section>
      )}

      {featuredProjects.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Projects</h2>
            <a href="/projects" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 3).map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {experiments.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
          <h2 className="text-3xl font-bold text-white mb-12">Currently in the Lab</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.slice(0, 4).map((e) => (
              <div key={e.id} className="p-6 border border-white/10 rounded-2xl hover:border-white/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-xs text-sky-400 font-mono uppercase tracking-wider">{e.status}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{e.title}</h3>
                <p className="text-sm text-white/40">{e.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
