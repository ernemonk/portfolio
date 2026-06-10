import { ContactForm } from "@/components/ContactForm";

export default function ContactSection() {
  return (
    <section id="contact" className="container-max px-6 py-28 scroll-mt-24 relative isolate overflow-hidden section-glow-tl">
      <div className="gradient-line mb-12" />

      <div className="mb-12 animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-50 tracking-tight">
          Contact
        </h2>
      </div>

      <div className="max-w-2xl">
        <p className="text-lg text-neutral-400 mb-16 leading-relaxed">
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
    </section>
  );
}
