import Image from "next/image";
import type { Project } from "@/types";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="p-6 border border-white/10 rounded-2xl hover:border-white/30 transition-all hover:bg-white/5">
      {project.images?.[0] && (
        <div className="mb-4 rounded-xl overflow-hidden bg-white/5 h-40 relative">
          <Image src={project.images[0]} alt={project.title} fill className="object-cover" />
        </div>
      )}
      <h3 className="text-white font-semibold mb-2">{project.title}</h3>
      <p className="text-sm text-white/40 mb-4 line-clamp-3">{project.summary}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.techStack?.map((tech) => (
          <span key={tech} className="text-xs bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full">
            {tech}
          </span>
        ))}
      </div>
      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          View Project →
        </a>
      )}
    </div>
  );
}
