"use client";
import { useEffect, useState } from "react";
import { getProjects } from "@/lib/firestore/projects";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Projects</h1>
      <p className="text-xl text-white/40 mb-16">
        Engineering case studies, product builds, and shipped work.
      </p>

      {loading ? (
        <p className="text-white/20 text-center py-24 font-mono">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-white/20 text-center py-24">No projects yet. Add some in Firestore.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
