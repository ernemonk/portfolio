import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { Heading } from "@/components/Heading";

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
    <div className="container-md px-6 pt-32 pb-24">
      <Heading level="h1" size="3xl" className="mb-4">
        Contact
      </Heading>
      
      <p className="text-lg text-neutral-500 mb-16">
        Reach out for collaborations, contract work, or just to connect.
      </p>

      <ContactForm />

      <div className="mt-16 pt-12 border-t border-neutral-800">
        <p className="text-xs text-neutral-600 mb-2 uppercase tracking-widest font-mono">Email</p>
        <a
          href="mailto:erne.monge.s@gmail.com"
          className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          erne.monge.s@gmail.com
        </a>
      </div>
    </div>
  );
}
