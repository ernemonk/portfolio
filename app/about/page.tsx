import type { Metadata } from "next";
import Image from "next/image";
import { fetchOwnerBio } from "@/lib/firestore/server";
import { Card } from "@/components/Card";
import { Heading } from "@/components/Heading";

const principles = [
  { 
    title: "Engineer for reliability.", 
    desc: "Production systems have no room for shortcuts. Design for failure, test for edge cases." 
  },
  { 
    title: "Integrations are the hard part.", 
    desc: "APIs are easy. Keeping Salesforce, DocuSign, gRPC, and legacy systems in sync under load is the real work." 
  },
  { 
    title: "Hardware roots, software scale.", 
    desc: "Starting in PCB design and firmware taught me that abstractions are leaky. Knowing the substrate matters." 
  },
  { 
    title: "Lead by shipping.", 
    desc: "The best way to earn trust from a team is to write the hardest ticket yourself." 
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const bio = await fetchOwnerBio();
  const name = bio?.name ?? "Ernesto Monge";
  const description =
    bio?.shortIntro ??
    "Lead Full Stack Senior Engineer with 10+ years building enterprise systems, real-time integrations, IoT, and cloud platforms.";
  return {
    title: `About | ${name}`,
    description,
    openGraph: { title: `About ${name}`, description, type: "profile" },
    twitter: { card: "summary", title: `About ${name}`, description },
  };
}

export default async function AboutPage() {
  const bio = await fetchOwnerBio();

  return (
    <div className="container-md px-6 pt-32 pb-24">
      {/* Page heading */}
      <Heading level="h1" size="3xl" className="mb-6">
        About
      </Heading>
      
      <p className="text-lg text-neutral-400 mb-16 leading-relaxed">
        {bio?.shortIntro ?? "Engineer. Integrations. IoT. Fintech."}
      </p>

      {/* Bio content */}
      <div className="space-y-6 text-neutral-400 leading-relaxed text-lg mb-20">
        {bio?.longBio ? (
          <p>{bio.longBio}</p>
        ) : (
          <>
            <p>
              I&apos;m Ernesto Monge — a Lead Full Stack Senior Engineer based in San Francisco
              with 10+ years building enterprise-grade systems across fintech, IoT, and cloud platforms.
              I currently lead engineering at AssetMark, working on Salesforce integrations,
              DocuSign workflows, and gRPC-based real-time data sync.
            </p>
            <p>
              My background spans the full stack and then some: React.js, Angular, Python, Node.js,
              .NET, C++, and embedded firmware. Before software became my primary focus,
              I was designing PCBs and writing firmware for IoT hardware — a foundation that shapes
              how I think about systems, reliability, and performance.
            </p>
            <p>
              I&apos;ve built data migration platforms at JPMorgan Chase, treasury dashboards at
              First Republic Bank, GPS tracking infrastructure, audio fingerprinting pipelines,
              and election monitoring tools. Every system I ship is designed to run reliably
              under real load, with real data, at real scale.
            </p>
            <p>B.S. Mechatronics Engineering.</p>
          </>
        )}
      </div>

      {/* Photo gallery */}
      {bio?.photos && bio.photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
          {bio.photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 relative hover:border-primary-500/30 transition-all duration-300">
              <Image 
                src={url} 
                alt={`Ernesto Monge ${i + 1}`} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Principles section */}
      <div className="pt-16 border-t border-neutral-800">
        <Heading level="h2" size="2xl" className="mb-8">
          Principles
        </Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((principle) => (
            <Card key={principle.title} variant="default">
              <p className="text-neutral-50 font-semibold mb-2">{principle.title}</p>
              <p className="text-sm text-neutral-500">{principle.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
