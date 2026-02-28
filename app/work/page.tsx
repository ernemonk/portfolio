import type { Metadata } from "next";
import { fetchWorkItems } from "@/lib/firestore/server";
import { WorkGrid } from "./WorkGrid";

export const metadata: Metadata = {
  title: "Work | Ernesto Monge",
  description:
    "Ventures, enterprise projects, consulting engagements, and experiments by Ernesto Monge.",
  openGraph: {
    title: "Work | Ernesto Monge",
    description:
      "Ventures, enterprise projects, consulting engagements, and experiments.",
    type: "website",
  },
};

export default async function WorkPage() {
  const items = await fetchWorkItems();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <div className="mb-16 animate-fade-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="text-gradient">Work</span>
        </h1>
        <p className="text-xl text-white/30 max-w-2xl leading-relaxed">
          Ventures I&apos;ve built, enterprise systems I&apos;ve engineered,
          clients I&apos;ve consulted, and experiments I&apos;m running.
        </p>
      </div>

      <WorkGrid items={items} />
    </div>
  );
}
