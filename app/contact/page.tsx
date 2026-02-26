import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | Ernesto Monge",
  description:
    "Reach out to Ernesto Monge for collaborations, contract work, or to connect.",
  openGraph: {
    title: "Contact | Ernesto Monge",
    description: "Reach out for collaborations, contract work, or to connect.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Contact</h1>
      <p className="text-xl text-white/40 mb-16">
        Reach out for collaborations, contract work, or just to connect.
      </p>

      <ContactForm />

      <div className="mt-16 pt-12 border-t border-white/10">
        <p className="text-xs text-white/20 mb-2 uppercase tracking-widest font-mono">Email</p>
        <a
          href="mailto:erne.monge.s@gmail.com"
          className="text-white hover:text-sky-400 transition-colors"
        >
          erne.monge.s@gmail.com
        </a>
      </div>
    </div>
  );
}
