import type { Metadata } from "next";
import { fetchOwnerVentures } from "@/lib/firestore/server";
import { VenturesList } from "./VenturesList";

export const metadata: Metadata = {
  title: "Ventures | Ernesto Monge",
  description:
    "Companies, platforms, and assets Ernesto Monge has built, founded, or contributed to.",
  openGraph: {
    title: "Ventures | Ernesto Monge",
    description: "Companies, platforms, and assets built, founded, or contributed to.",
    type: "website",
  },
};

export default async function VenturesPage() {
  const ventures = await fetchOwnerVentures();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Ventures</h1>
      <p className="text-xl text-white/40 mb-12">
        Companies, platforms, and assets I&apos;ve built or contributed to.
      </p>
      <VenturesList ventures={ventures} />
    </div>
  );
}
