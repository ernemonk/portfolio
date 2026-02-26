"use client";
import { useState } from "react";
import { addMessage } from "@/lib/firestore/messages";
import { OWNER_UID } from "@/lib/owner";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await addMessage(OWNER_UID, form);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (sent) {
    return (
      <div className="p-10 border border-sky-400/20 bg-sky-400/5 rounded-2xl text-center">
        <p className="text-sky-400 text-lg font-semibold">Message sent.</p>
        <p className="text-white/40 text-sm mt-2">I&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
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
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-sky-400/40 transition-colors"
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
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-sky-400/40 transition-colors resize-none"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-4 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
