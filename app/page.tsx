import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CapabilityBlocks from "@/components/CapabilityBlocks";
import AboutSection from "@/components/AboutSection";
import WorkSection from "@/components/WorkSection";
import MetricsBar from "@/components/MetricsBar";
import CurrentFocus from "@/components/CurrentFocus";
import ContactSection from "@/components/ContactSection";
import {
  fetchHeroSection,
  fetchCapabilities,
  fetchWorkItems,
  fetchSiteMetrics,
  fetchCurrentFocus,
  fetchOwnerBio,
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
  const [hero, capabilities, workItems, metrics, focus, bio] = await Promise.all([
    fetchHeroSection(),
    fetchCapabilities(),
    fetchWorkItems(),
    fetchSiteMetrics(),
    fetchCurrentFocus(),
    fetchOwnerBio(),
  ]);

  return (
    <>
      <Hero data={hero} />
      <CapabilityBlocks data={capabilities} />
      <AboutSection bio={bio} />
      <WorkSection items={workItems ?? []} />
      <MetricsBar metrics={metrics ?? []} />
      <CurrentFocus data={focus} />
      <ContactSection />
    </>
  );
}
