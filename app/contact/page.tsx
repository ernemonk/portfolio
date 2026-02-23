"use client";
import { useState } from "react";
import { addMessage } from "@/lib/firestore/messages";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addMessage(form);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Contact</h1>
      <p className="text-xl text-white/40 mb-16">Have a project in mind? Let&apos;s talk.</p>

      {sent ? (
        <div className="p-10 border border-emerald-400/20 bg-emerald-400/5 rounded-2xl text-center">
          <p className="text-emerald-400 text-lg font-semibold">Message sent.</p>
          <p className="text-white/40 text-sm mt-2">I&apos;ll be in touch shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { name: "name", label: "Name", type: "text", placeholder: "Your name" },
            { name: "email", label: "Email", type: "email", placeholder: "your@email.com" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs text-white/30 mb-2 uppercase tracking-widest font-mono">
                {f.label}
              </label>
              <input
                type={f.type}
                required
                placeholder={f.placeholder}
                value={form[f.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-white/30 mb-2 uppercase tracking-widest font-mono">
              Message
            </label>
            <textarea
              required
              rows={6}
              placeholder="Tell me about your project or idea…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-emerald-400/40 transition-colors resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-emerald-400 text-black font-semibold rounded-xl hover:bg-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}

      <div className="mt-16 pt-12 border-t border-white/10">
        <p className="text-xs text-white/20 mb-2 uppercase tracking-widest font-mono">Email</p>
        <a
          href="mailto:hello@ernestomartin.dev"
          className="text-white hover:text-emerald-400 transition-colors"
        >
          hello@ernestomartin.dev
        </a>
      </div>
    </div>
  );
}
