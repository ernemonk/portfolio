"use client";
import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import MetricsBar from "@/components/MetricsBar";
import VentureCard from "@/components/VentureCard";
import ProjectCard from "@/components/ProjectCard";
import { getFeaturedVentures } from "@/lib/firestore/ventures";
import { getFeaturedProjects } from "@/lib/firestore/projects";
import { getExperiments } from "@/lib/firestore/experiments";
import type { Venture, Project, Experiment } from "@/types";

export default function HomePage() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    getFeaturedVentures().then(setVentures).catch(console.error);
    getFeaturedProjects().then(setProjects).catch(console.error);
    getExperiments().then(setExperiments).catch(console.error);
  }, []);

  return (
    <>
      <Hero />
      <MetricsBar />

      {ventures.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Ventures</h2>
            <a href="/ventures" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.slice(0, 3).map((v) => <VentureCard key={v.id} venture={v} />)}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Projects</h2>
            <a href="/projects" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}

      {experiments.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
          <h2 className="text-3xl font-bold text-white mb-12">Currently Building</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.slice(0, 4).map((e) => (
              <div key={e.id} className="p-6 border border-white/10 rounded-2xl hover:border-white/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">{e.status}</span>
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
