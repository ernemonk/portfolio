import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CapabilityBlocks from "@/components/CapabilityBlocks";
import SelectedWork from "@/components/SelectedWork";
import MetricsBar from "@/components/MetricsBar";
import CurrentFocus from "@/components/CurrentFocus";
import {
  fetchHeroSection,
  fetchCapabilities,
  fetchWorkItems,
  fetchSiteMetrics,
  fetchCurrentFocus,
} from "@/lib/firestore/server";

export const metadata: Metadata = {
  title: "Ernesto Monge — Senior Engineer · Founder · Consultant",
  description:
    "Engineering scalable systems. Building real products. 10+ years across enterprise platforms, real-time integrations, and cloud-native applications.",
  openGraph: {
    title: "Ernesto Monge — Senior Engineer · Founder · Consultant",
    description:
      "Engineering scalable systems. Building real products. 10+ years across enterprise platforms, real-time integrations, and cloud-native applications.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ernesto Monge — Senior Engineer · Founder · Consultant",
    description:
      "Engineering scalable systems. Building real products.",
  },
};

export default async function HomePage() {
  const [hero, capabilities, workItems, metrics, focus] = await Promise.all([
    fetchHeroSection(),
    fetchCapabilities(),
    fetchWorkItems(),
    fetchSiteMetrics(),
    fetchCurrentFocus(),
  ]);

  const featured = (workItems ?? []).filter((w) => w.featured);

  return (
    <>
      <Hero data={hero} />
      <CapabilityBlocks data={capabilities} />
      <SelectedWork items={featured} />
      <MetricsBar metrics={metrics ?? []} />
      <CurrentFocus data={focus} />
    </>
  );
}
