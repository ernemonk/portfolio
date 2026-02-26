import type { Metadata } from "next";
import { fetchOwnerProjects } from "@/lib/firestore/server";
import ProjectCard from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "Projects | Ernesto Monge",
  description:
    "Enterprise integrations, data pipelines, IoT systems, and full-stack builds by Ernesto Monge.",
  openGraph: {
    title: "Projects | Ernesto Monge",
    description: "Enterprise integrations, data pipelines, IoT systems, and full-stack builds.",
    type: "website",
  },
};

export default async function ProjectsPage() {
  const projects = await fetchOwnerProjects();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Projects</h1>
      <p className="text-xl text-white/40 mb-16">
        Enterprise integrations, data pipelines, IoT systems, and full-stack builds.
      </p>

      {projects.length === 0 ? (
        <p className="text-white/20 text-center py-24">No projects yet. Add some in the portal.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
