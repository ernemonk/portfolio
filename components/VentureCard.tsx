import Image from "next/image";
import type { Venture } from "@/types";

const statusColors: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-400",
  archived: "bg-white/10 text-white/30",
  exited: "bg-blue-400/10 text-blue-400",
};

export default function VentureCard({ venture }: { venture: Venture }) {
  return (
    <a
      href={venture.website || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-6 border border-white/10 rounded-2xl hover:border-white/30 transition-all hover:bg-white/5"
    >
      <div className="flex items-start justify-between mb-4">
        {venture.logoURL ? (
          <Image
            src={venture.logoURL}
            alt={venture.name + " logo"}
            width={80}
            height={40}
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
            {venture.name[0]}
          </div>
        )}
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[venture.status] ?? "bg-white/10 text-white/30"}`}>
          {venture.status}
        </span>
      </div>
      <h3 className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
        {venture.name}
      </h3>
      <p className="text-sm text-white/40 mb-3 line-clamp-2">{venture.description}</p>
      <p className="text-xs text-white/20 font-mono">{venture.role}</p>
      {venture.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {venture.tags.map((tag) => (
            <span key={tag} className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
