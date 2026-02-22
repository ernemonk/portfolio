"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getBio } from "@/lib/firestore/bio";
import type { Bio } from "@/types";

const principles = [
  { title: "Build what scales.", desc: "Systems over one-offs. Every decision compounds." },
  { title: "Own what you create.", desc: "Equity in outputs, not just effort." },
  { title: "Discipline over motivation.", desc: "Show up and build. Every day." },
  { title: "Systems over hype.", desc: "Fundamentals compound while trends fade." },
];

export default function AboutPage() {
  const [bio, setBio] = useState<Bio | null>(null);

  useEffect(() => {
    getBio().then(setBio).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About</h1>
      <p className="text-xl text-white/50 mb-16 leading-relaxed">
        {bio?.shortIntro ?? "Builder. Founder. Operator."}
      </p>

      <div className="space-y-6 text-white/60 leading-relaxed text-lg mb-20">
        {bio?.longBio ? (
          <p>{bio.longBio}</p>
        ) : (
          <>
            <p>
              I&apos;m Ernesto Martin — a hands-on builder who designs, develops, and operates
              digital products and operational ventures. I work at the intersection of AI,
              software, and real-world systems.
            </p>
            <p>
              From intelligent SaaS tools to operational businesses like the Microgreens
              Project, I build things that generate leverage and outlast trends.
              Everything I ship is designed to run, scale, and earn.
            </p>
            <p>
              I believe in ownership — of code, of companies, of outcomes. Not renting
              access to someone else&apos;s platform. Building the platform.
            </p>
          </>
        )}
      </div>

      {/* Photo gallery */}
      {bio?.photos && bio.photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
          {bio.photos.map((url, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-white/5 relative">
              <Image src={url} alt={`Ernesto Martin ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Principles */}
      <div className="pt-16 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-8">Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((v) => (
            <div key={v.title} className="p-6 border border-white/10 rounded-2xl">
              <p className="text-white font-semibold mb-1">{v.title}</p>
              <p className="text-sm text-white/40">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
